//********************************************************************
//
// AgentService Class (Main Process)
//
// VS Code-style agent service implementation for the main process.
// Manages AI agent operations. Agents are registered via the extension
// system and executed using the legacy runAgent function. Initializes
// builtin extensions on first use to ensure all agents are available.
//
// Return Value
// ------------
// None (class definition)
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
// initialized    boolean    Flag indicating if extensions have been initialized
//
//*******************************************************************

import { IAgentService, AgentDefinition } from '../../common/models/services';
import { runAgent } from '../../common/agents';
import { extensionRegistry } from '../../extensions/builtin/extensionRegistry';
import { activateBuiltinExtensions } from '../../extensions/builtin';

export class AgentService implements IAgentService {
	private initialized = false;

	constructor() {
		if (!this.initialized) {
			void activateBuiltinExtensions();
			this.initialized = true;
		}
	}

	async runAgent(agentName: string, payload: unknown): Promise<unknown> {
		return await runAgent(agentName, payload);
	}

	async getAgents(): Promise<AgentDefinition[]> {
		return extensionRegistry.getAllAgents();
	}

	registerAgent(agent: AgentDefinition): void {
		extensionRegistry.registerAgent(agent);
	}
}
