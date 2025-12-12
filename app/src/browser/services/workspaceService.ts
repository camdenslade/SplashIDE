//********************************************************************
//
// WorkspaceService Class (Renderer)
//
// VS Code-style workspace service implementation for the renderer process.
// Proxies all workspace operations to the main process via IPC. Handles
// workspace management including opening workspaces, indexing files, building
// import graphs, and discovering related files. All operations are proxied
// to the main process via typed IPC channels.
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
// logger                          Logger                           Logger instance
// workspaceFolders                IWorkspaceFolder[]               Array of workspace folders
// _onDidChangeWorkspaceFolders    Emitter<WorkspaceFoldersChangeEvent>    Event emitter for folder changes
//
//*******************************************************************

import {
	IWorkspaceService,
	WorkspaceContext,
	WorkspaceFoldersChangeEvent
} from '../../common/models/services';
import { Logger } from '../../common/log/logger';
import { Emitter } from '../../common/types/event';
import { IWorkspaceFolder } from '../../common/types/workspace';
import { URI } from '../../common/types/uri';
import '../../common/types/splashIPC';

export class WorkspaceService implements IWorkspaceService {
	readonly _serviceBrand = undefined;
	private readonly logger = Logger.create('WorkspaceService');
	private readonly workspaceFolders: IWorkspaceFolder[] = [];
	private readonly _onDidChangeWorkspaceFolders = new Emitter<WorkspaceFoldersChangeEvent>();
	readonly onDidChangeWorkspaceFolders = this._onDidChangeWorkspaceFolders.event;
	async openWorkspace(): Promise<string | null> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const path = await window.splash.openWorkspace();
		if (path) {
			try {
				const uri = URI.file(path);
				const exists = this.workspaceFolders.some((f) => f.uri.toString() === uri.toString());
				if (!exists) {
					await this.addWorkspaceFolder(uri);
					this.logger.info('Workspace opened and added as folder', { path });
				}
			} catch (error: unknown) {
				this.logger.error('Error adding opened workspace as folder', { path, error });
			}
		}
		return path;
	}

	async indexWorkspace(root: string): Promise<{ files: string[] }> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}
		try {
			const result = await window.splash.indexWorkspace(root);
			if (!result.files || result.files.length === 0) {
				this.logger.warn('Workspace is empty', { root });
			}
			if (result.files.length > 20000) {
				this.logger.warn('Large workspace detected', { root, fileCount: result.files.length });
			}
			return result;
		} catch (error: unknown) {
			this.logger.error('Error indexing workspace', { root, error });
			throw error;
		}
	}

	async getWorkspaceContext(root: string): Promise<WorkspaceContext> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.getWorkspaceContext(root);
	}

	async buildImportGraph(files: string[]): Promise<Record<string, string[]>> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}
		try {
			const response = await window.splash.getImportGraph(files);
			// Detect circular imports
			const graph = response.graph;
			const circular = this.detectCircularImports(graph);
			if (circular.length > 0) {
				this.logger.warn('Circular imports detected', { circular });
			}
			return graph;
		} catch (error: unknown) {
			this.logger.error('Error building import graph', { error });
			throw error;
		}
	}

	/**
	 * Detects circular imports in the graph.
	 */
	private detectCircularImports(graph: Record<string, string[]>): string[][] {
		const circular: string[][] = [];
		const visited = new Set<string>();
		const visiting = new Set<string>();

		const dfs = (file: string, path: string[]): void => {
			if (visiting.has(file)) {
				// Found a cycle
				const cycleStart = path.indexOf(file);
				if (cycleStart !== -1) {
					circular.push([...path.slice(cycleStart), file]);
				}
				return;
			}

			if (visited.has(file)) {
				return;
			}

			visiting.add(file);
			const imports = graph[file] ?? [];
			for (const imp of imports) {
				dfs(imp, [...path, file]);
			}
			visiting.delete(file);
			visited.add(file);
		};

		for (const file of Object.keys(graph)) {
			if (!visited.has(file)) {
				dfs(file, []);
			}
		}

		return circular;
	}

	async discoverRelatedFiles(
		graph: Record<string, string[]>,
		file: string,
		depth: number
	): Promise<string[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.discoverRelated(graph, file, depth);
		return response.files;
	}

	// Multi-root workspace methods
	getWorkspaceFolders(): readonly IWorkspaceFolder[] {
		return [...this.workspaceFolders];
	}

	async addWorkspaceFolder(uri: URI): Promise<void> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}

		try {
			// TODO: Call IPC to add folder
			// For now, add locally
			const folder: IWorkspaceFolder = {
				uri,
				name: uri.scheme === 'file' ? uri.fsPath().split(/[/\\]/).pop() ?? uri.toString() : uri.path.split('/').pop() ?? uri.toString(),
				index: this.workspaceFolders.length
			};

			this.workspaceFolders.push(folder);
			this._onDidChangeWorkspaceFolders.fire({
				added: [folder],
				removed: []
			});

			this.logger.info('Workspace folder added', { uri: uri.toString() });
		} catch (error: unknown) {
			this.logger.error('Error adding workspace folder', { uri: uri.toString(), error });
			throw error;
		}
	}

	async removeWorkspaceFolder(uri: URI): Promise<void> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}

		try {
			const index = this.workspaceFolders.findIndex((f) => f.uri.toString() === uri.toString());
			if (index === -1) {
				throw new Error(`Workspace folder not found: ${uri.toString()}`);
			}

			const removed = this.workspaceFolders.splice(index, 1);
			this._onDidChangeWorkspaceFolders.fire({
				added: [],
				removed
			});

			this.logger.info('Workspace folder removed', { uri: uri.toString() });
		} catch (error: unknown) {
			this.logger.error('Error removing workspace folder', { uri: uri.toString(), error });
			throw error;
		}
	}
}
