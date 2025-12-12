//********************************************************************
//
// RemoteProvider Class
//
// Remote file system provider stub implementation. Placeholder for
// future remote file system support. Currently returns mocked responses
// for testing purposes. Implements IFileSystemProvider interface for
// the 'remote' URI scheme.
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
// scheme          string                    URI scheme identifier ('remote')
// _onDidChangeFile  Emitter<IFileChange[]>  File change event emitter
// onDidChangeFile   Event<IFileChange[]>    File change event
// logger           Logger                   Logger instance
//
//*******************************************************************

import { IFileSystemProvider, FileType, IStat, IFileChange, FileChangeType } from '../../../common/types/filesystem';
import { URI } from '../../../common/types/uri';
import { Emitter } from '../../../common/types/event';
import { IDisposable } from '../../../common/types/disposable';
import { Logger } from '../../../common/log/logger';

export class RemoteProvider implements IFileSystemProvider {
	readonly scheme = 'remote';
	private readonly _onDidChangeFile = new Emitter<readonly IFileChange[]>();
	readonly onDidChangeFile = this._onDidChangeFile.event;
	private readonly logger = Logger.create('RemoteProvider');

	constructor() {
		this.logger.info('Remote file system provider initialized (stub)');
	}

	async readDirectory(uri: URI): Promise<[string, FileType][]> {
		this.logger.debug('readDirectory (stub)', { uri: uri.toString() });
		// Mock response
		return [
			['file1.ts', FileType.File],
			['file2.ts', FileType.File],
			['folder1', FileType.Directory]
		];
	}

	async createDirectory(uri: URI): Promise<void> {
		this.logger.debug('createDirectory (stub)', { uri: uri.toString() });
		// Mock - would create directory on remote
		this._onDidChangeFile.fire([{ uri, type: FileChangeType.Created }]);
	}

	async readFile(uri: URI): Promise<Uint8Array> {
		this.logger.debug('readFile (stub)', { uri: uri.toString() });
		// Mock response
		const text = `// Mock file content from remote: ${uri.toString()}`;
		return new TextEncoder().encode(text);
	}

	async writeFile(
		uri: URI,
		content: Uint8Array,
		_options: { create: boolean; overwrite: boolean }
	): Promise<void> {
		this.logger.debug('writeFile (stub)', { uri: uri.toString(), size: content.length });
		// Mock - would write to remote
		this._onDidChangeFile.fire([{ uri, type: FileChangeType.Changed }]);
	}

	async delete(uri: URI, options: { recursive: boolean }): Promise<void> {
		this.logger.debug('delete (stub)', { uri: uri.toString(), recursive: options.recursive });
		// Mock - would delete on remote
		this._onDidChangeFile.fire([{ uri, type: FileChangeType.Deleted }]);
	}

	async rename(oldUri: URI, newUri: URI, _options: { overwrite: boolean }): Promise<void> {
		this.logger.debug('rename (stub)', {
			oldUri: oldUri.toString(),
			newUri: newUri.toString()
		});
		// Mock - would rename on remote
		this._onDidChangeFile.fire([
			{ uri: oldUri, type: FileChangeType.Deleted },
			{ uri: newUri, type: FileChangeType.Created }
		]);
	}

	async stat(uri: URI): Promise<IStat> {
		this.logger.debug('stat (stub)', { uri: uri.toString() });
		// Mock response
		return {
			type: FileType.File,
			size: 1024,
			ctime: Date.now(),
			mtime: Date.now()
		};
	}

	watch(uri: URI, options: { recursive: boolean; excludes: string[] }): IDisposable {
		this.logger.debug('watch (stub)', { uri: uri.toString(), recursive: options.recursive });
		// Mock watcher
		return {
			dispose: () => {
				// No-op
			}
		};
	}

	dispose(): void {
		this._onDidChangeFile.dispose();
	}
}
