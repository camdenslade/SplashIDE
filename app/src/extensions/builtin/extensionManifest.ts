//********************************************************************
//
// IExtensionManifest Interface
//
// Defines the manifest structure for VS Code-style extensions. Contains
// metadata about the extension including name, version, description, and
// contributed resources such as agents and file system providers.
//
// Return Value
// ------------
// None (interface definition)
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

import { AgentDefinition } from '../../common/types/agent';
import type { IFileSystemProvider } from '../../common/types/filesystem';

export interface IExtensionManifest {
	readonly name: string;
	readonly displayName: string;
	readonly version: string;
	readonly description: string;
	readonly contributes?: {
		readonly agents?: AgentDefinition[];
		readonly fileSystemProviders?: Array<{
			readonly scheme: string;
			readonly provider: () => IFileSystemProvider;
		}>;
	};
}

//********************************************************************
//
// IExtension Interface
//
// Defines the structure for VS Code-style extensions. Contains the
// extension manifest and activation/deactivation lifecycle callbacks.
//
// Return Value
// ------------
// None (interface definition)
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

export interface IExtension {
	readonly manifest: IExtensionManifest;
	readonly activate: () => Promise<void>;
	readonly deactivate?: () => Promise<void>;
}
