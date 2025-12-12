export interface AgentDefinition {
  name: string;
  description: string;
  systemPrompt: string;
  tools: string[];
  model?: string;
  builtIn?: boolean;
  template?: boolean;
}
