import { AgentDefinition } from "../types";

export const dbAgent: AgentDefinition = {
  name: "db",
  description: "Database specialist for SQL, Postgres, Firebase schema inference.",
  systemPrompt: `
You are an expert in relational databases and NoSQL.
You can:
- Analyze SQL schemas
- Generate Postgres ERDs (return JSON graph)
- Infer Firebase document structure
- Propose migrations
- Fix schema issues
  `,
  tools: ["dbScan", "generateDiff"],
  builtIn: true,
  template: true,
};
