//********************************************************************
//
// WorkspaceService Class (Main Process)
//
// VS Code-style workspace service implementation for the main process.
// Handles workspace operations including indexing, import graph building,
// and related file discovery. Uses the legacy workspaceIndexer and
// importGraph utilities while providing a clean service interface.
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
// _serviceBrand                   undefined                        Service brand identifier
// _workspaceFolders               IWorkspaceFolder[]               Array of workspace folders
// _onDidChangeWorkspaceFolders    Emitter<WorkspaceFoldersChangeEvent>    Event emitter for folder changes
//
//*******************************************************************

import {
	IWorkspaceService,
	WorkspaceContext,
	WorkspaceFoldersChangeEvent
} from '../../common/models/services';
import { URI } from '../../common/types/uri';
import { IWorkspaceFolder } from '../../common/types/workspace';
import { Event, Emitter } from '../../common/types/event';
import { indexWorkspace, readFilesBatch } from '../../utils/workspaceIndexer';
import { buildImportGraph, discoverRelatedFiles, ImportGraph } from '../../utils/importGraph';

export class WorkspaceService implements IWorkspaceService {
	readonly _serviceBrand: undefined;

	private readonly _workspaceFolders: IWorkspaceFolder[] = [];
	private readonly _onDidChangeWorkspaceFolders = new Emitter<WorkspaceFoldersChangeEvent>();

	readonly onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent> =
		this._onDidChangeWorkspaceFolders.event;

	async openWorkspace(): Promise<string | null> {
		throw new Error('openWorkspace should be called via IPC channel');
	}

	async indexWorkspace(root: string): Promise<{ files: string[] }> {
		const index = indexWorkspace(root);
		return { files: index.files };
	}

	async getWorkspaceContext(root: string): Promise<WorkspaceContext> {
		const indexed = indexWorkspace(root);
		const files = indexed.files;

		const MAX_CONTEXT_FILES = 500;
		const contextFiles = files.slice(0, MAX_CONTEXT_FILES);

		const contents = await readFilesBatch(contextFiles);
		const graphResult = buildImportGraph(contextFiles);
		return {
			root,
			files,
			contents,
			graph: graphResult.edges
		};
	}

	async buildImportGraph(files: string[]): Promise<Record<string, string[]>> {
		const graphResult = buildImportGraph(files);
		return graphResult.edges;
	}

	async discoverRelatedFiles(
		graph: Record<string, string[]>,
		file: string,
		depth: number
	): Promise<string[]> {
		const importGraph: ImportGraph = {
			files: Object.keys(graph),
			edges: graph
		};
		return discoverRelatedFiles(importGraph, file, depth);
	}

	getWorkspaceFolders(): readonly IWorkspaceFolder[] {
		return this._workspaceFolders;
	}

	async addWorkspaceFolder(uri: URI): Promise<void> {
		const folder: IWorkspaceFolder = {
			uri,
			name: uri.path.split(/[/\\]/).filter(Boolean).pop() ?? uri.path,
			index: this._workspaceFolders.length
		};
		this._workspaceFolders.push(folder);
		this._onDidChangeWorkspaceFolders.fire({
			added: [folder],
			removed: []
		});
	}

	async removeWorkspaceFolder(uri: URI): Promise<void> {
		const index = this._workspaceFolders.findIndex(f => f.uri.toString() === uri.toString());
		if (index === -1) {
			return;
		}
		const removed = this._workspaceFolders.splice(index, 1)[0];
		if (!removed) {
			return;
		}
		// Update indices
		for (let i = index; i < this._workspaceFolders.length; i++) {
			const folderToUpdate = this._workspaceFolders[i];
			if (!folderToUpdate) continue;
			this._workspaceFolders[i] = { ...folderToUpdate, index: i };
		}
		this._onDidChangeWorkspaceFolders.fire({
			added: [],
			removed: [removed]
		});
	}

	dispose(): void {
		this._onDidChangeWorkspaceFolders.dispose();
	}
}
