//********************************************************************
//
// AgentService Class (Renderer)
//
// VS Code-style agent service implementation for the renderer process.
// Proxies all agent operations to the main process via IPC. Manages
// AI agent operations. Agents are registered via the extension system
// and executed in the main process. This service proxies agent execution
// requests to the main process.
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
// None
//
//*******************************************************************

import { IAgentService, AgentDefinition } from '../../common/models/services';
import '../../common/types/splashIPC';

export class AgentService implements IAgentService {
	async runAgent(agentName: string, payload: unknown): Promise<unknown> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.runAgent(agentName, payload);
		return response.result;
	}

	async getAgents(): Promise<AgentDefinition[]> {
		return [];
	}

	registerAgent(_agent: AgentDefinition): void {
		console.warn('registerAgent not implemented in renderer');
	}
}
