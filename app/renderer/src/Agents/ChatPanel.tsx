import { useState } from "react";
import { splash } from "../splashClient";

interface ImportGraph {
  [file: string]: string[];
}

interface WorkspaceContext {
  root: string;
  files: string[];
  contents: Record<string, string>;
  graph: ImportGraph;
}

interface AgentResult {
  intent?: string;
  [key: string]: unknown;
}

interface Props {
  fileContent: string;
  filePath: string | null;
  workspaceRoot: string | null;
  workspaceFiles: string[];
  importGraph: ImportGraph;
  workspaceContext: WorkspaceContext;
  onAgentResult: (res: AgentResult) => void;
}

export default function ChatPanel({
  fileContent,
  filePath,
  workspaceRoot,
  workspaceFiles,
  importGraph,
  workspaceContext,
  onAgentResult,
}: Props) {
  const [input, setInput] = useState("");
  const [agent, setAgent] = useState("frontend");

  async function run() {
    if (!filePath || !workspaceRoot) return;

    try {
      const related = await splash.discoverRelated(importGraph || {}, filePath, 3);

      const payload = {
        task: input,
        activeFile: filePath,
        activeContent: fileContent,
        workspaceRoot,
        workspaceFiles: Array.isArray(workspaceFiles) ? workspaceFiles : [],
        workspaceContext,
        relatedFiles: related,
        intentDetection: true,
      };

      const { result } = await splash.runAgent(agent, payload);

      function isObject(value: unknown): value is Record<string, unknown> {
        return typeof value === "object" && value !== null;
      }

      if (!isObject(result)) {
        onAgentResult({ detectedIntent: undefined });
        return;
      }

      const intent =
        "intent" in result && typeof (result as { intent?: unknown }).intent === "string"
          ? (result as { intent: string }).intent
          : undefined;

      onAgentResult({
        ...result,
        detectedIntent: intent,
      });
    } catch (error) {
      console.error("Error running agent:", error);
      // Don't crash, just log the error
    }
  }

  return (
    <div className="panel" style={{ flex: "1 1 0", minHeight: 0 }}>
      <div className="panel-header">
        <h3>Agents</h3>
      </div>
      <div className="panel-content">
        <select value={agent} onChange={(e) => setAgent(e.target.value)}>
          <option value="frontend">Frontend Agent</option>
          <option value="backend">Backend Agent</option>
          <option value="documenter">Documenter</option>
          <option value="db">DB Specialist</option>
          <option value="deploy">Deployment Specialist</option>
          <option value="reviewer">Reviewer</option>
          <option value="architect">Architect Agent</option>
        </select>

        <textarea
          placeholder="Task for the agent…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button onClick={run}>Run Agent</button>
      </div>
    </div>
  );
}
