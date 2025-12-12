import { deployAgent } from '../../../common/agents/builtin/deployAgent';
import { IExtension } from '../extensionManifest';

export const deployExtension: IExtension = {
	manifest: {
		name: 'deploy',
		displayName: 'Deploy Agent',
		version: '1.0.0',
		description: 'AI agent for deployment',
		contributes: {
			agents: [deployAgent]
		}
	},
	activate: async () => {
		console.log('Deploy extension activated');
	}
};

