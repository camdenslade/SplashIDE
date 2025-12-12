import { AgentDefinition } from "./types";
import { loadUserAgents, saveUserAgent } from "../../utils/agentStorage";
import { architectAgent } from "./builtin/architectAgent";
import { documenterAgent } from "./builtin/documenterAgent";
import { dbAgent } from "./builtin/dbAgent";
import { deployAgent } from "./builtin/deployAgent";
import { reviewerAgent } from "./builtin/reviewerAgent";
import { frontendAgent } from "./builtin/frontendAgent";
import { backendAgent } from "./builtin/backendAgent";

const registry: Record<string, AgentDefinition> = {};

registry["documenter"] = documenterAgent;
registry["db"] = dbAgent;
registry["deploy"] = deployAgent;
registry["reviewer"] = reviewerAgent;
registry["frontend"] = frontendAgent;
registry["backend"] = backendAgent;
registry["architect"] = architectAgent;

let userAgents: any[] = [];

async function initUserAgents() {
  userAgents = await loadUserAgents();
}
initUserAgents();
for (const a of userAgents) {
  registry[a.name] = a;
}

//********************************************************************
//
// getAgent Function
//
// Retrieves an agent definition from the registry by name. Throws an
// error if the agent is not found.
//
// Return Value
// ------------
// AgentDefinition    The agent definition
//
// Value Parameters
// ----------------
// name    string    Agent name to look up
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

export function getAgent(name: string): AgentDefinition {
  if (!registry[name]) throw new Error("Agent not found: " + name);
  return registry[name];
}

//********************************************************************
//
// listAgents Function
//
// Returns an array of all registered agent definitions, including
// both built-in and user-defined agents.
//
// Return Value
// ------------
// AgentDefinition[]    Array of all agent definitions
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

export function listAgents(): AgentDefinition[] {
  return Object.values(registry);
}

//********************************************************************
//
// createAgent Function
//
// Registers a new agent definition in the registry. If the agent is
// not a built-in agent, it will be saved to persistent storage.
//
// Return Value
// ------------
// void
//
// Value Parameters
// ----------------
// def    AgentDefinition    Agent definition to register
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

export function createAgent(def: AgentDefinition) {
  registry[def.name] = def;
  if (!def.builtIn) saveUserAgent(def);
}

//********************************************************************
//
// cloneAgent Function
//
// Creates a clone of an existing agent with a new name. The cloned
// agent is marked as non-built-in and non-template, and is registered
// in the registry.
//
// Return Value
// ------------
// AgentDefinition    The cloned agent definition
//
// Value Parameters
// ----------------
// baseName    string    Name of the agent to clone
// newName     string    Name for the cloned agent
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// base    AgentDefinition    Source agent definition
// clone   AgentDefinition    Cloned agent definition
//
//*******************************************************************

export function cloneAgent(baseName: string, newName: string): AgentDefinition {
  const base = getAgent(baseName);

  const clone: AgentDefinition = {
    ...base,
    name: newName,
    builtIn: false,
    template: false,
  };

  createAgent(clone);
  return clone;
}
