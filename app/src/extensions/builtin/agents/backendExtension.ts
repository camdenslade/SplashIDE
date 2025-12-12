import { backendAgent } from '../../../common/agents/builtin/backendAgent';
import { IExtension } from '../extensionManifest';

export const backendExtension: IExtension = {
	manifest: {
		name: 'backend',
		displayName: 'Backend Agent',
		version: '1.0.0',
		description: 'AI agent for backend development',
		contributes: {
			agents: [backendAgent]
		}
	},
	activate: async () => {
		console.log('Backend extension activated');
	}
};

