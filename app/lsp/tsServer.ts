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
