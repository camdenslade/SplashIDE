//********************************************************************
//
// IWorkspaceFolder Interface
//
// Workspace folder interface for multi-root workspace support.
// Represents a single folder in a multi-root workspace, similar to
// VS Code's multi-root workspace feature. Provides foundation for
// supporting multiple workspace folders.
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

import { URI } from './uri';

export interface IWorkspaceFolder {
	readonly uri: URI;
	readonly name: string;
	readonly index: number;
}

//********************************************************************
//
// IWorkspaceConfiguration Interface
//
// Workspace configuration interface for multi-root workspace support.
// Configuration for a multi-root workspace containing multiple folders
// and a workspace name.
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

export interface IWorkspaceConfiguration {
	readonly folders: readonly IWorkspaceFolder[];
	readonly name: string;
}
