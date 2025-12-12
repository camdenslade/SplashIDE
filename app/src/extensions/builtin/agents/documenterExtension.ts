import { documenterAgent } from '../../../common/agents/builtin/documenterAgent';
import { IExtension } from '../extensionManifest';

export const documenterExtension: IExtension = {
	manifest: {
		name: 'documenter',
		displayName: 'Documenter Agent',
		version: '1.0.0',
		description: 'AI agent for code documentation',
		contributes: {
			agents: [documenterAgent]
		}
	},
	activate: async () => {
		console.log('Documenter extension activated');
	}
};

