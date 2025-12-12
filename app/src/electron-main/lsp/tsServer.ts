//********************************************************************
//
// findNodeExecutable Function
//
// Finds the Node.js executable path. Searches common installation
// locations and falls back to system PATH. Used to locate Node.js
// for spawning the TypeScript language server process.
//
// Return Value
// ------------
// string    Path to Node.js executable
//
// Value Parameters
// ----------------
// None
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// candidates    string[]    Array of candidate Node.js paths
// p             string      Current candidate path
// fallback      string      Fallback path based on process.execPath
//
//*******************************************************************

import { spawn } from "child_process";
import path from "path";
import * as fs from "fs";

function findNodeExecutable(): string {
  const candidates = [
    "C:\\Program Files\\nodejs\\node.exe",
    "C:\\Program Files (x86)\\nodejs\\node.exe",
    path.join(path.dirname(process.execPath), "node.exe"),
    "node",
  ];

  for (const p of candidates) {
    if (path.isAbsolute(p)) {
      if (fs.existsSync(p)) return p;
    } else {
      return p;
    }
  }

  const fallback = path.join(path.dirname(process.execPath), "node.exe");
  return fs.existsSync(fallback) ? fallback : "node";
}

//********************************************************************
//
// startTsServer Function
//
// Spawns the TypeScript language server (tsserver) process. Locates
// tsserver.js in node_modules, finds the Node.js executable, and
// spawns the server with the workspace root as the current working
// directory. Returns the child process with stdio pipes for IPC.
//
// Return Value
// ------------
// ChildProcess    Spawned TypeScript server process
//
// Value Parameters
// ----------------
// workspaceRoot    string    Workspace root directory path
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// tsserverPath    string    Path to tsserver.js file
// nodeExec        string    Node.js executable path
//
//*******************************************************************

export function startTsServer(workspaceRoot: string) {
  const tsserverPath = path.join(
    __dirname,
    "../../node_modules/typescript/lib/tsserver.js"
  );

  if (!fs.existsSync(tsserverPath)) {
    throw new Error(`tsserver.js not found at ${tsserverPath}`);
  }

  const nodeExec = findNodeExecutable();

  return spawn(nodeExec, [tsserverPath], {
    cwd: workspaceRoot,
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
    env: {
      ...process.env,
      // disable verbose tsserver logging
      TSSERVER_LOG_VERBOSITY: "off",
    },
  });
}
