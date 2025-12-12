import { frontendAgent } from '../../../common/agents/builtin/frontendAgent';
import { IExtension } from '../extensionManifest';

export const frontendExtension: IExtension = {
	manifest: {
		name: 'frontend',
		displayName: 'Frontend Agent',
		version: '1.0.0',
		description: 'AI agent for frontend development',
		contributes: {
			agents: [frontendAgent]
		}
	},
	activate: async () => {
		console.log('Frontend extension activated');
	}
};

