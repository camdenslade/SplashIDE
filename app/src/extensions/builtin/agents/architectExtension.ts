//********************************************************************
//
// architectExtension Constant
//
// Extension definition for the Architect agent. Registers the architect
// agent with the extension system and provides activation callback.
//
// Return Value
// ------------
// IExtension
//
// Value Parameters
// ----------------
// None (constant definition)
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

import { architectAgent } from '../../../common/agents/builtin/architectAgent';
import { IExtension } from '../extensionManifest';

export const architectExtension: IExtension = {
	manifest: {
		name: 'architect',
		displayName: 'Architect Agent',
		version: '1.0.0',
		description: 'AI agent for architecture and system design',
		contributes: {
			agents: [architectAgent]
		}
	},
	activate: async () => {
		console.log('Architect extension activated');
	}
};
