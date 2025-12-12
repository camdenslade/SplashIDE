//********************************************************************
//
// FileService Class (Main Process)
//
// VS Code-style file service implementation for the main process.
// Implements actual file system operations by wrapping the legacy
// fileSystemService and fileWatcher. Provides a clean interface
// matching VS Code patterns. File change events are emitted to the
// renderer process via IPC.
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
// _onDidChangeFile    Emitter<FileChangeEvent>    Event emitter for file changes
//
//*******************************************************************

import { IFileService, FileChangeEvent } from '../../common/models/services';
import { FileNode, FileStats } from '../../common/messages/ipcMessages';
import { Event, Emitter } from '../../common/types/event';
import { fileSystemService } from '../../utils/fileSystemService';
import { fileWatcher } from '../../utils/fileWatcher';
import { validateFileNodeArray, FileNode as UtilsFileNode } from '../../utils/fileSystemTypes';
import * as fs from 'fs';
import * as path from 'path';

export class FileService implements IFileService {
	private readonly _onDidChangeFile = new Emitter<FileChangeEvent>();

	constructor() {
		fileWatcher.on('change', (event: { type: string; path: string; oldPath?: string }) => {
			const changeEvent: FileChangeEvent = {
				type: this.mapEventType(event.type),
				path: event.path
			};
			if (event.oldPath !== undefined) {
				changeEvent.oldPath = event.oldPath;
			}
			this._onDidChangeFile.fire(changeEvent);
		});
	}

	get onDidChangeFile(): Event<FileChangeEvent> {
		return this._onDidChangeFile.event;
	}

	private convertFileNode(node: UtilsFileNode): FileNode {
		return {
			name: node.name,
			path: node.path,
			type: node.type,
			children: (node.children ?? []).map(child => this.convertFileNode(child))
		};
	}

	async getRootTree(rootPath: string): Promise<FileNode[]> {
		if (!rootPath) {
			return [];
		}

		// Normalize path to handle any inconsistencies
		const normalizedPath = path.normalize(rootPath);
		setImmediate(() => {
			fileWatcher.watch(normalizedPath);
		});

		const nodes: UtilsFileNode[] = await fileSystemService.getRootTree(normalizedPath);
		const validated = validateFileNodeArray(nodes);
		return validated.map(node => this.convertFileNode(node));
	}

	async expandFolder(folderPath: string): Promise<FileNode[]> {
		if (!folderPath) {
			return [];
		}
		// Normalize path to handle any inconsistencies
		const normalizedPath = path.normalize(folderPath);
		const nodes: UtilsFileNode[] = await fileSystemService.expandFolder(normalizedPath);
		const validated = validateFileNodeArray(nodes);
		return validated.map(node => this.convertFileNode(node));
	}

	getStats(filePath: string): FileStats | undefined {
		// Note: This is synchronous but fileSystemService.getStats is async
		// For now, we'll use fs.statSync as a fallback for synchronous stats
		try {
			// Normalize path to handle any inconsistencies
			const normalizedPath = path.normalize(filePath);
			const stats = fs.statSync(normalizedPath);
			return {
				isFile: stats.isFile(),
				isDirectory: stats.isDirectory(),
				size: stats.size,
				mtime: stats.mtimeMs
			};
		} catch {
			return undefined;
		}
	}

	async readFile(filePath: string): Promise<string> {
		// Normalize path to handle any inconsistencies
		const normalizedPath = path.normalize(filePath);
		return await fileSystemService.readFile(normalizedPath);
	}

	async readFileBatch(paths: string[]): Promise<Record<string, string>> {
		const { readFilesBatch } = await import('../../utils/workspaceIndexer');
		return readFilesBatch(paths);
	}

	async writeFile(filePath: string, content: string): Promise<void> {
		// Normalize path to handle any inconsistencies
		const normalizedPath = path.normalize(filePath);
		fs.mkdirSync(path.dirname(normalizedPath), { recursive: true });
		fs.writeFileSync(normalizedPath, content, 'utf8');
		fileSystemService.invalidateCache(normalizedPath);
	}

	async createFile(filePath: string, content: string, workspaceRoot: string): Promise<void> {
		// Normalize path to handle any inconsistencies
		const normalizedPath = path.normalize(filePath);
		fs.mkdirSync(path.dirname(normalizedPath), { recursive: true });
		fs.writeFileSync(normalizedPath, content, 'utf8');
		fileSystemService.invalidateCache(normalizedPath);

		// Auto-register routes if applicable
		const { autoRegisterReactScreen, autoRegisterNestModule } = await import(
			'../auto/routeEngine'
		);
		autoRegisterReactScreen({ filePath: normalizedPath, workspaceRoot });
		autoRegisterNestModule({ filePath: normalizedPath, workspaceRoot });
	}

	async deleteFile(filePath: string): Promise<void> {
		// Normalize path to handle any inconsistencies
		const normalizedPath = path.normalize(filePath);
		if (fs.existsSync(normalizedPath)) {
			fs.unlinkSync(normalizedPath);
			fileSystemService.invalidateCache(normalizedPath);
		}
	}

	dispose(): void {
		this._onDidChangeFile.dispose();
	}

	private mapEventType(type: string): 'created' | 'deleted' | 'modified' | 'renamed' {
		switch (type) {
			case 'created':
				return 'created';
			case 'deleted':
				return 'deleted';
			case 'changed':
				return 'modified';
			case 'renamed':
				return 'renamed';
			default:
				return 'modified';
		}
	}
}
