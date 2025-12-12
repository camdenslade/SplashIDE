//********************************************************************
//
// MemFSNode Interface
//
// In-memory file system node interface. Represents a file or directory
// node in the memory file system. Contains file type, content (for files),
// children (for directories), and timestamps.
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

import { IFileSystemProvider, FileType, IStat, IFileChange, FileChangeType } from '../../../common/types/filesystem';
import { URI } from '../../../common/types/uri';
import { Emitter } from '../../../common/types/event';
import { IDisposable } from '../../../common/types/disposable';

interface MemFSNode {
	type: FileType;
	content?: Uint8Array;
	children?: Map<string, MemFSNode>;
	mtime: number;
	ctime: number;
}

//********************************************************************
//
// MemFSProvider Class
//
// Memory file system provider implementation. In-memory file system
// provider for scratch buffers and ephemeral workspaces. Stores files
// in memory, making it ideal for scratch buffers, notebooks, ephemeral
// workspaces, and testing. Implements IFileSystemProvider interface
// for the 'memfs' URI scheme.
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
// scheme          string                    URI scheme identifier ('memfs')
// root            MemFSNode                 Root directory node
// _onDidChangeFile  Emitter<IFileChange[]>  File change event emitter
// onDidChangeFile   Event<IFileChange[]>    File change event
//
//*******************************************************************

export class MemFSProvider implements IFileSystemProvider {
	readonly scheme = 'memfs';
	private readonly root: MemFSNode;
	private readonly _onDidChangeFile = new Emitter<readonly IFileChange[]>();
	readonly onDidChangeFile = this._onDidChangeFile.event;
	// private readonly logger = Logger.create('MemFSProvider');

	constructor() {
		this.root = {
			type: FileType.Directory,
			children: new Map(),
			mtime: Date.now(),
			ctime: Date.now()
		};
	}

	/**
	 * Gets a node at a path.
	 */
	private getNode(uri: URI): MemFSNode | undefined {
		const parts = uri.path.split('/').filter((p) => p.length > 0);
		let current = this.root;

		for (const part of parts) {
			if (!current.children || !current.children.has(part)) {
				return undefined;
			}
			current = current.children.get(part)!;
		}

		return current;
	}

	/**
	 * Gets or creates parent directory.
	 */
	private getOrCreateParent(uri: URI): MemFSNode {
		const parts = uri.path.split('/').filter((p) => p.length > 0);
		parts.pop(); // Remove the last part (file/directory name)
		let current = this.root;

		for (const part of parts) {
			if (!current.children) {
				current.children = new Map();
			}
			if (!current.children.has(part)) {
				current.children.set(part, {
					type: FileType.Directory,
					children: new Map(),
					mtime: Date.now(),
					ctime: Date.now()
				});
			}
			current = current.children.get(part)!;
		}

		return current;
	}

	async readDirectory(uri: URI): Promise<[string, FileType][]> {
		const node = this.getNode(uri);
		if (!node || node.type !== FileType.Directory || !node.children) {
			throw new Error(`Directory not found: ${uri.toString()}`);
		}

		const result: [string, FileType][] = [];
		for (const [name, child] of node.children.entries()) {
			result.push([name, child.type]);
		}

		return result;
	}

	async createDirectory(uri: URI): Promise<void> {
		const parent = this.getOrCreateParent(uri);
		const parts = uri.path.split('/').filter((p) => p.length > 0);
		const dirName = parts[parts.length - 1];

		if (!dirName) {
			throw new Error(`Invalid URI: ${uri.toString()}`);
		}

		if (!parent.children) {
			parent.children = new Map();
		}

		if (parent.children.has(dirName)) {
			throw new Error(`Directory already exists: ${uri.toString()}`);
		}

		const now = Date.now();
		parent.children.set(dirName, {
			type: FileType.Directory,
			children: new Map(),
			mtime: now,
			ctime: now
		});

		this._onDidChangeFile.fire([{ uri, type: FileChangeType.Created }]);
	}

	async readFile(uri: URI): Promise<Uint8Array> {
		const node = this.getNode(uri);
		if (!node || node.type !== FileType.File || !node.content) {
			throw new Error(`File not found: ${uri.toString()}`);
		}

		return new Uint8Array(node.content);
	}

	async writeFile(
		uri: URI,
		content: Uint8Array,
		options: { create: boolean; overwrite: boolean }
	): Promise<void> {
		const parent = this.getOrCreateParent(uri);
		const parts = uri.path.split('/').filter((p) => p.length > 0);
		const fileName = parts[parts.length - 1];

		if (!fileName) {
			throw new Error(`Invalid URI: ${uri.toString()}`);
		}

		if (!parent.children) {
			parent.children = new Map();
		}

		const existing = parent.children.get(fileName);
		if (existing && !options.overwrite) {
			throw new Error(`File already exists: ${uri.toString()}`);
		}

		if (!existing && !options.create) {
			throw new Error(`File does not exist: ${uri.toString()}`);
		}

		const now = Date.now();
		const wasCreated = !existing;
		parent.children.set(fileName, {
			type: FileType.File,
			content: new Uint8Array(content),
			mtime: now,
			ctime: existing?.ctime ?? now
		});

		this._onDidChangeFile.fire([
			{ uri, type: wasCreated ? FileChangeType.Created : FileChangeType.Changed }
		]);
	}

	async delete(uri: URI, options: { recursive: boolean }): Promise<void> {
		const node = this.getNode(uri);
		if (!node) {
			throw new Error(`File or directory not found: ${uri.toString()}`);
		}

		if (node.type === FileType.Directory && node.children && node.children.size > 0 && !options.recursive) {
			throw new Error(`Directory is not empty: ${uri.toString()}`);
		}

		const parent = this.getOrCreateParent(uri);
		const parts = uri.path.split('/').filter((p) => p.length > 0);
		const fileName = parts[parts.length - 1];

		if (!fileName) {
			throw new Error(`Invalid URI: ${uri.toString()}`);
		}

		if (parent.children) {
			parent.children.delete(fileName);
		}

		this._onDidChangeFile.fire([{ uri, type: FileChangeType.Deleted }]);
	}

	async rename(oldUri: URI, newUri: URI, options: { overwrite: boolean }): Promise<void> {
		const node = this.getNode(oldUri);
		if (!node) {
			throw new Error(`File or directory not found: ${oldUri.toString()}`);
		}

		const newParent = this.getOrCreateParent(newUri);
		const newParts = newUri.path.split('/').filter((p) => p.length > 0);
		const newFileName = newParts[newParts.length - 1];

		if (!newFileName) {
			throw new Error(`Invalid new URI: ${newUri.toString()}`);
		}

		if (!newParent.children) {
			newParent.children = new Map();
		}

		if (newParent.children.has(newFileName) && !options.overwrite) {
			throw new Error(`Target already exists: ${newUri.toString()}`);
		}

		// Remove from old location
		const oldParent = this.getOrCreateParent(oldUri);
		const oldParts = oldUri.path.split('/').filter((p) => p.length > 0);
		const oldFileName = oldParts[oldParts.length - 1];

		if (!oldFileName) {
			throw new Error(`Invalid old URI: ${oldUri.toString()}`);
		}

		if (oldParent.children) {
			oldParent.children.delete(oldFileName);
		}

		// Add to new location
		newParent.children.set(newFileName, node);

		this._onDidChangeFile.fire([
			{ uri: oldUri, type: FileChangeType.Deleted },
			{ uri: newUri, type: FileChangeType.Created }
		]);
	}

	async stat(uri: URI): Promise<IStat> {
		const node = this.getNode(uri);
		if (!node) {
			throw new Error(`File or directory not found: ${uri.toString()}`);
		}

		return {
			type: node.type,
			size: node.content ? node.content.length : 0,
			ctime: node.ctime,
			mtime: node.mtime
		};
	}

	watch(_uri: URI, _options: { recursive: boolean; excludes: string[] }): IDisposable {
		// MemFS already fires events via onDidChangeFile
		// This is a no-op for now
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
