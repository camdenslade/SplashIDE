import { BrowserWindow } from "electron";
import { startTsServer } from "../lsp/tsServer";

let seq = 1;
let tsProc: any = null;

// This is injected from main.ts
declare const rendererReady: boolean;

const pendingResponses = new Map<number, (resp: any) => void>();

//********************************************************************
//
// safe Function
//
// Safety wrapper to detect non-serializable IPC values. Attempts to
// clone a value using JSON serialization. If cloning fails, logs
// detailed error information and returns a safe error object instead
// of crashing. Used for IPC value validation before sending to renderer.
//
// Return Value
// ------------
// any    Cloned value or error object if cloning fails
//
// Value Parameters
// ----------------
// val       any       Value to safely clone
// context   string    Context string for error logging
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// cloned        any       Cloned value from JSON serialization
// error         Error     Error object for logging
// key           string    Current object key being checked
//
//*******************************************************************

function safe(val: any, context: string): any {
  try {
    const cloned = JSON.parse(JSON.stringify(val));
    return cloned;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("========================================");
    console.error("NON-CLONEABLE IPC VALUE DETECTED!");
    console.error("========================================");
    console.error("Context:", context);
    console.error("Error:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Value type:", typeof val);
    console.error("Value constructor:", val?.constructor?.name);
    console.error("Value keys:", val ? Object.keys(val) : "null/undefined");
    if (val && typeof val === "object") {
      console.error("Value sample:", JSON.stringify(val, null, 2).substring(0, 1000));
      // Try to identify problematic fields
      for (const key in val) {
        try {
          JSON.stringify(val[key]);
        } catch (e) {
          console.error(`  → Problematic key: ${key}`, typeof val[key], val[key]?.constructor?.name);
        }
      }
    }
    console.error("========================================");
    return { __error: "non-cloneable", message: String(err), keys: val ? Object.keys(val) : [] };
  }
}

function extractMessages(buffer: string): { messages: string[]; rest: string } {
  const messages: string[] = [];
  let cursor = 0;

  while (true) {
    const headerStart = buffer.indexOf("Content-Length:", cursor);
    if (headerStart === -1) break;

    const headerEnd = buffer.indexOf("\r\n\r\n", headerStart);
    if (headerEnd === -1) break;

    const header = buffer.slice(headerStart, headerEnd);
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) break;

    const [, lengthRaw] = match;
    const length = parseInt(lengthRaw ?? "0", 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;

    if (buffer.length < bodyEnd) break;

    const body = buffer.slice(bodyStart, bodyEnd);
    messages.push(body);

    cursor = bodyEnd;
  }

  return { messages, rest: buffer.slice(cursor) };
}

//********************************************************************
//
// sanitize Function
//
// Safe serializer for IPC messages. Converts BigInt values to numbers
// and removes functions to ensure message is serializable. Used before
// sending TypeScript server messages via IPC.
//
// Return Value
// ------------
// any    Sanitized message object safe for IPC transmission
//
// Value Parameters
// ----------------
// message    any    Message object to sanitize
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// None
//
//*******************************************************************

function sanitize(message: any): any {
  return JSON.parse(
    JSON.stringify(message, (_, value) => {
      if (typeof value === "bigint") return Number(value);
      if (typeof value === "function") return undefined;
      return value;
    })
  );
}

//********************************************************************
//
// extractMessages Function
//
// Extracts TypeScript server messages from a buffer using the LSP
// Content-Length header protocol. Parses messages from the buffer
// and returns both the extracted messages and any remaining buffer
// content.
//
// Return Value
// ------------
// { messages: string[], rest: string }    Extracted messages and remaining buffer
//
// Value Parameters
// ----------------
// buffer    string    Buffer containing LSP protocol messages
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// messages      string[]          Array of extracted message bodies
// cursor        number            Current position in buffer
// headerStart   number            Start position of Content-Length header
// headerEnd     number            End position of header block
// header        string            Header block content
// match         RegExpMatchArray|null    Regex match for Content-Length
// lengthRaw     string            Raw length string from header
// length        number            Parsed message body length
// bodyStart     number            Start position of message body
// bodyEnd       number            End position of message body
// body          string            Extracted message body
//
//*******************************************************************

function extractMessages(buffer: string): { messages: string[]; rest: string } {
  const messages: string[] = [];
  let cursor = 0;

  while (true) {
    const headerStart = buffer.indexOf("Content-Length:", cursor);
    if (headerStart === -1) break;

    const headerEnd = buffer.indexOf("\r\n\r\n", headerStart);
    if (headerEnd === -1) break;

    const header = buffer.slice(headerStart, headerEnd);
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) break;

    const [, lengthRaw] = match;
    const length = parseInt(lengthRaw ?? "0", 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;

    if (buffer.length < bodyEnd) break;

    const body = buffer.slice(bodyStart, bodyEnd);
    messages.push(body);

    cursor = bodyEnd;
  }

  return { messages, rest: buffer.slice(cursor) };
}

//********************************************************************
//
// initTsRouter Function
//
// Initializes the TypeScript language server router. Creates a router
// that manages communication with the TypeScript language server via
// stdio, handles LSP protocol messages, and forwards events/responses
// to the renderer process via IPC. Manages server lifecycle, request/
// response correlation, and message sanitization.
//
// Return Value
// ------------
// { start: (workspaceRoot: string) => void, send: (command: string, args?: unknown) => Promise<unknown> }
//    Router object with start and send methods
//
// Value Parameters
// ----------------
// mainWindow    BrowserWindow    Main Electron window for IPC communication
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// seq                   number                Request sequence counter
// tsProc                ChildProcess|null     TypeScript server process
// pendingResponses      Map<number, Function> Map of request seq to response resolver
// buffer                string                Buffer for accumulating stdout
// msgBody               string                Current message body being processed
// message               any                   Parsed message object
// resolver              Function              Response resolver function
// sanitized             any                   Sanitized response object
// safeMessage           any                   Sanitized event message
// output                string                stderr output string
// code                  number|null           Process exit code
// command               string                TypeScript server command
// args                  unknown               Command arguments
// requestSeq            number                Request sequence number
//
//*******************************************************************

export function initTsRouter(mainWindow: BrowserWindow) {
  return {
    start(workspaceRoot: string) {
      if (tsProc) {
        console.log("TS Server already running");
        return;
      }

      try {
        tsProc = startTsServer(workspaceRoot);

        let buffer = "";

        tsProc.stdout.on("data", (chunk: Buffer) => {
          buffer += chunk.toString();

          const { messages, rest } = extractMessages(buffer);
          buffer = rest;

          for (const msgBody of messages) {
            let message: any;
            try {
              message = JSON.parse(msgBody);
            } catch {
              continue;
            }

            // --------------------------
            // HANDLE TS RESPONSE
            // --------------------------
            if (message.type === "response") {
              const resolver = pendingResponses.get(message.request_seq);
              if (resolver) {
                pendingResponses.delete(message.request_seq);

                // SANITIZE RESPONSE BEFORE IPC RETURN
                try {
                  const sanitized = JSON.parse(JSON.stringify(message, (_, value) => {
                    if (typeof value === "bigint") return Number(value);
                    if (typeof value === "function") return undefined;
                    return value;
                  }));

                  // Double-check with safe() instrumentation
                  resolver(safe(sanitized, `tsRouter.response(${message.command || 'unknown'})`));
                } catch (err) {
                  console.error("[TS] Failed to sanitize ts:send response:", err);
                  // Fail gracefully but never return non-serializable object
                  resolver(safe({
                    seq: message.seq,
                    type: "response",
                    request_seq: message.request_seq,
                    success: false,
                    command: message.command,
                    body: {},
                    error: "Non-serializable tsserver response sanitized"
                  }, `tsRouter.response.error(${message.command || 'unknown'})`));
                }
              }
              continue;
            }

            // --------------------------
            // HANDLE TS EVENT
            // --------------------------
            if (message.type === "event") {
              setImmediate(() => {
                try {
                  // DO NOT SEND BEFORE RENDERER IS READY
                  if (!(global as any).rendererReady) return;

                  if (mainWindow.isDestroyed()) return;

                  const safeMessage = sanitize(message);
                  mainWindow.webContents.send("ts:event", safe(safeMessage, `tsRouter.event(${message.event || 'unknown'})`));

                } catch (err) {
                  console.error("[TS] Failed to send sanitized ts:event", err);
                }
              });
              continue;
            }
          }
        });

        tsProc.stderr.on("data", (data: Buffer) => {
          const output = data.toString();
          if (output.includes("ERROR") || output.includes("Error")) {
            console.error("[TSSERVER ERROR]", output);
          }
        });

        tsProc.on("exit", (code: number | null) => {
          console.error("TSServer exited", code);
          tsProc = null;

          for (const resolve of pendingResponses.values()) {
            resolve(null);
          }
          pendingResponses.clear();
        });

        setTimeout(() => {
          console.log("TSServer started and ready");
        }, 1000);

      } catch (error: any) {
        console.error("Failed to start TS Server:", error);
        tsProc = null;
      }
    },

    // -------------------------------------------------------
    // SEND REQUEST TO TSSERVER
    // -------------------------------------------------------
    send(command: string, args: any = {}): Promise<any> {
      return new Promise((resolve) => {
        if (!tsProc) return resolve(null);

        const request = {
          seq: seq++,
          type: "request",
          command,
          arguments: args,
        };

        pendingResponses.set(request.seq, resolve);

        const json = JSON.stringify(request);
        const payload = `Content-Length: ${json.length}\r\n\r\n${json}`;

        try {
          tsProc.stdin.write(payload);
        } catch {
          pendingResponses.delete(request.seq);
          resolve(null);
        }
      });
    },
  };
}
