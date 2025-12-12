import { AgentDefinition } from "../types";

export const reviewerAgent: AgentDefinition = {
  name: "reviewer",
  description: "Performs PR-style reviews of patches or code changes.",
  systemPrompt: `
You are a senior PR reviewer.
Your responsibilities:
1. Summarize changes
2. Explain risks
3. Suggest improvements
4. Decide: "approve" or "request_changes"
Return structured JSON.
  `,
  tools: [],
  builtIn: true,
  template: false,
};
