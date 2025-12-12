import { AgentDefinition } from "../types";

export const documenterAgent: AgentDefinition = {
  name: "documenter",
  description: "Writes documentation, comments, READMEs, and explanations.",
  systemPrompt: `
You are a senior documentation engineer.
Your goals:
- Explain complex code simply
- Generate high-quality documentation
- Write comments, markdown, READMEs, and API docs
Output must be clear, structured, and concise.
  `,
  tools: ["readFile", "generateDiff"],
  builtIn: true,
  template: true,
};
