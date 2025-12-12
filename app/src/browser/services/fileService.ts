//********************************************************************
//
// FileService Class
//
// VS Code-style file service implementation for the renderer process.
// Proxies all file operations to the main process via IPC using typed
// message contracts. File change events are forwarded from the main
// process to renderer listeners.
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
// _onDidChangeFile          Emitter<FileChangeEvent>               Event emitter for file changes
// fileChangeDisposable      IDisposable|undefined                  Disposable for file change listener
// logger                    Logger                                  Logger instance
// fileSystemProviderService IFileSystemProviderService|undefined   Provider service instance
//
//*******************************************************************

import { IFileService, FileChangeEvent, IFileSystemProviderService } from '../../common/models/services';
import { Logger } from '../../common/log/logger';
import { FileNode, FileStats } from '../../common/messages/ipcMessages';
import { Event, Emitter } from '../../common/types/event';
import { IDisposable } from '../../common/types/disposable';
import { URI } from '../../common/types/uri';
import { toURI } from '../../common/utils/path';
import type {
	FileSystemChangeEvent
} from '../../common/messages/ipcMessages';
import '../../common/types/splashIPC';

export class FileService implements IFileService {
	private readonly _onDidChangeFile = new Emitter<FileChangeEvent>();
	private fileChangeDisposable: IDisposable | undefined;
	private readonly logger = Logger.create('FileService');
	private fileSystemProviderService: IFileSystemProviderService | undefined;

	constructor(providerService?: IFileSystemProviderService) {
		this.fileSystemProviderService = providerService;
		if (typeof window !== 'undefined' && window.splash) {
			const dispose = window.splash.onFileChange((event: FileSystemChangeEvent) => {
				const changeEvent: FileChangeEvent = {
					type: event.type,
					path: event.path
				};
				if (event.oldPath !== undefined) {
					changeEvent.oldPath = event.oldPath;
				}
				this._onDidChangeFile.fire(changeEvent);
			});
			this.fileChangeDisposable = { dispose };
		}
	}

	get onDidChangeFile(): Event<FileChangeEvent> {
		return this._onDidChangeFile.event;
	}

	async getRootTree(rootPath: string): Promise<FileNode[]> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}
		try {
			const response = await window.splash.getTree(rootPath);
			return response.nodes;
		} catch (error: unknown) {
			this.logger.error('Error getting root tree', { rootPath, error });
			throw error;
		}
	}

	async expandFolder(folderPath: string): Promise<FileNode[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.expand(folderPath);
		return response.nodes;
	}

	getStats(_filePath: string): FileStats | undefined {
		return undefined;
	}

	async readFile(path: string | URI): Promise<string> {
		try {
			// Convert path to URI if it's a string
			const uri = toURI(path);
			
			if (uri.scheme !== 'file') {
				const providerService = this.getProviderService();
				const provider = providerService.getProvider(uri.scheme);
				if (provider) {
					const content = await provider.readFile(uri);
					return new TextDecoder().decode(content);
				}
				throw new Error(`No provider for scheme: ${uri.scheme}`);
			}

			if (!window.splash) {
				this.logger.error('Splash API not available');
				throw new Error('Splash API not available');
			}

			// Convert URI back to file system path for IPC
			const fsPath = uri.fsPath();
			const content = await window.splash.readFile(fsPath);
			if (content === null || content === undefined) {
				this.logger.warn('File read returned null/undefined', { path: fsPath });
				return '';
			}
			return content;
		} catch (error: unknown) {
			this.logger.error('Error reading file', { path, error });
			throw error;
		}
	}

	private getProviderService(): IFileSystemProviderService {
		if (!this.fileSystemProviderService) {
			throw new Error('FileSystemProviderService not available');
		}
		return this.fileSystemProviderService;
	}

	async readFileBatch(paths: string[]): Promise<Record<string, string>> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.readFileBatch(paths);
		return response.contents;
	}

	async writeFile(path: string, content: string): Promise<void> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}
		try {
			if (content.length > 1024 * 1024) {
				this.logger.warn('Writing large file', { path, size: content.length });
			}
			await window.splash.writeFile(path, content);
		} catch (error: unknown) {
			this.logger.error('Error writing file', { path, error });
			throw error;
		}
	}

	async createFile(filePath: string, content: string, workspaceRoot: string): Promise<void> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		await window.splash.createFile(filePath, content, workspaceRoot);
	}

	async deleteFile(path: string): Promise<void> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		await window.splash.deleteFile(path);
	}

	dispose(): void {
		this.fileChangeDisposable?.dispose();
		this._onDidChangeFile.dispose();
	}
}
