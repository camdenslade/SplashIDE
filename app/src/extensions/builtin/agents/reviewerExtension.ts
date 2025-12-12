import { reviewerAgent } from '../../../common/agents/builtin/reviewerAgent';
import { IExtension } from '../extensionManifest';

export const reviewerExtension: IExtension = {
	manifest: {
		name: 'reviewer',
		displayName: 'Reviewer Agent',
		version: '1.0.0',
		description: 'AI agent for code review',
		contributes: {
			agents: [reviewerAgent]
		}
	},
	activate: async () => {
		console.log('Reviewer extension activated');
	}
};

