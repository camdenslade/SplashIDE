//********************************************************************
//
// AgentDefinition Interface
//
// Shared type for agent definitions used throughout the application,
// including in the extension system. Defines the structure of an AI
// agent, including its name, description, system prompt, available
// tools, and optional configuration such as model identifier, built-in
// status, template status, and custom handler function.
//
// Return Value
// ------------
// None (interface definition)
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
// None
//
//*******************************************************************

export interface AgentDefinition {
	name: string;
	description: string;
	systemPrompt: string;
	tools: string[];
	model?: string;
	builtIn?: boolean;
	template?: boolean;
	handler?: (payload: unknown) => Promise<unknown>;
}
