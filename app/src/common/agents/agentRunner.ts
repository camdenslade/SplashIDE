//********************************************************************
//
// runAgent Function
//
// Executes an AI agent with a given payload. Retrieves the agent
// definition, detects user intent, attempts template generation,
// and if no template matches, falls back to full LLM processing.
// Returns agent result with intent, type, summary, content, new files,
// deleted files, risks, and approval status.
//
// Return Value
// ------------
// Promise<any>    Agent execution result object
//
// Value Parameters
// ----------------
// agentName    string    Name of the agent to execute
// payload      any       Agent execution payload containing task, context, workspace info
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// agent               AgentDefinition      Agent definition from registry
// task                string               User task description
// context             string               Primary file content
// original            string               Original file content
// workspaceRoot       string               Workspace root directory
// workspaceFiles      string[]             Array of workspace file paths
// additionalFileRequests string[]         Array of additional file paths to read
// intent              AgentIntent          Detected user intent
// match               RegExpMatchArray|null    Regex match for template name
// templateName        string               Extracted template name
// templates           TemplateResult[]     Generated templates
// additionalContents  Record<string, string>    Map of additional file contents
// p                   string               Current file path being read
// prompt              string               LLM prompt string
// response            any                  Raw LLM response
// result              any                  Parsed agent result
//
//*******************************************************************

import fs from "fs";
import path from "path";
import { getAgent } from "./agentRegistry";
import { callLLM } from "../../utils/callLLM";
import { generateDiff } from "../../utils/diff";
import { detectIntent } from "./intentDetector";
import { generateTemplate } from "./templateSelector";

export async function runAgent(agentName: string, payload: any) {
  const agent = getAgent(agentName);

  const {
    task,
    context,
    original,
    workspaceRoot,
    workspaceFiles,
    additionalFileRequests = [],
  } = payload;

  const intent = await detectIntent(task);

  const match = task.match(/(?:create|add)\s+(\w+)/i);
  const templateName = match ? match[1] : "NewItem";

  const templates = generateTemplate(intent, templateName);

  if (templates.length > 0) {
    return {
      intent,
      type: "patch",
      summary: `Generated ${templates.length} file(s) for ${intent}`,
      content: original,
      newFiles: Object.fromEntries(
        templates.map((t) => [path.join(workspaceRoot, t.filePath), t.content])
      ),
      deletedFiles: [],
      risks: [],
      approval: "approve",
    };
  }

  const additionalContents: Record<string, string> = {};
  for (const p of additionalFileRequests) {
    try {
      additionalContents[p] = fs.readFileSync(p, "utf8");
    } catch {
      additionalContents[p] = "";
    }
  }

  const prompt = `
SYSTEM:
${agent.systemPrompt}

USER INTENT:
${intent}

WORKSPACE ROOT:
${workspaceRoot}

FILE LIST:
${workspaceFiles.join("\n")}

PRIMARY FILE CONTENT:
${context}

ADDITIONAL FILES:
${JSON.stringify(additionalContents).slice(0, 5000)}

TASK:
${task}

RETURN JSON EXACTLY:
{
  "type": "patch" | "analysis" | "review",
  "content": "string",
  "summary": "string",
  "risks": ["string"],
  "approval": "approve" | "request_changes" | null,
  "newFiles": {},
  "deletedFiles": []
}
`;

  let raw = await callLLM(prompt);
  let parsed: any = {};

  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    parsed = { type: "analysis", content: raw };
  }

  parsed.intent = intent;

  // Create patch diff
  if (parsed.type === "patch" && parsed.content && original) {
    parsed.diff = generateDiff(original, parsed.content);
  }

  return parsed;
}
