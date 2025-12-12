import { AgentDefinition } from "../types";

export const deployAgent: AgentDefinition = {
  name: "deploy",
  description: "Deployment specialist for Docker, CI/CD, cloud hosting, Expo builds.",
  systemPrompt: `
You are a deployment engineer.
You specialize in:
- Dockerfiles
- Docker Compose
- CI/CD pipelines (GitHub Actions)
- Production migration plans
- Expo builds and release channels
Produce actionable steps and fix deployment bugs.
  `,
  tools: ["readFile", "writeFile", "generateDiff", "docker"],
  builtIn: true,
  template: true,
};
