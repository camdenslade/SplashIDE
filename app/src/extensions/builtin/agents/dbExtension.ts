import { dbAgent } from '../../../common/agents/builtin/dbAgent';
import { IExtension } from '../extensionManifest';

export const dbExtension: IExtension = {
	manifest: {
		name: 'db',
		displayName: 'Database Agent',
		version: '1.0.0',
		description: 'AI agent for database operations',
		contributes: {
			agents: [dbAgent]
		}
	},
	activate: async () => {
		console.log('Database extension activated');
	}
};

