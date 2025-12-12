//********************************************************************
//
// FileType Enum
//
// File type enumeration for file system provider abstraction.
// Used to identify the type of file system entry (file, directory,
// symbolic link, or unknown).
//
// Return Value
// ------------
// None (enum definition)
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

import { Event } from './event';
import { IDisposable } from './disposable';
import { URI } from './uri';

export enum FileType {
	Unknown = 0,
	File = 1,
	Directory = 2,
	SymbolicLink = 64
}

//********************************************************************
//
// IStat Interface
//
// File stat information interface. Contains file type, size, and
// timestamp information for file system entries.
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

export interface IStat {
	type: FileType;
	size: number;
	ctime: number;
	mtime: number;
}

//********************************************************************
//
// IFileSystemProvider Interface
//
// File system provider interface for abstraction over file system
// operations. Provides foundation for supporting multiple file system
// providers, similar to VS Code's file system provider API. Allows
// different implementations (local, remote, virtual, etc.).
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

export interface IFileSystemProvider extends IDisposable {
	readonly scheme: string;
	readonly onDidChangeFile: Event<readonly IFileChange[]>;
	readDirectory(uri: URI): Promise<[string, FileType][]>;
	createDirectory(uri: URI): Promise<void>;
	readFile(uri: URI): Promise<Uint8Array>;
	writeFile(uri: URI, content: Uint8Array, options: { create: boolean; overwrite: boolean }): Promise<void>;
	delete(uri: URI, options: { recursive: boolean }): Promise<void>;
	rename(oldUri: URI, newUri: URI, options: { overwrite: boolean }): Promise<void>;
	stat(uri: URI): Promise<IStat>;
	watch(uri: URI, options: { recursive: boolean; excludes: string[] }): IDisposable;
}

//********************************************************************
//
// IFileChange Interface
//
// File change event interface. Represents a change to a file or
// directory in the file system, including the URI and change type.
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

export interface IFileChange {
	uri: URI;
	type: FileChangeType;
}

//********************************************************************
//
// FileChangeType Enum
//
// File change type enumeration. Defines the type of change that
// occurred to a file or directory (created, changed, or deleted).
//
// Return Value
// ------------
// None (enum definition)
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

export enum FileChangeType {
	Created = 1,
	Changed = 2,
	Deleted = 3
}

//********************************************************************
//
// IFileSystemWatcher Interface
//
// File system watcher interface providing file system watching
// capabilities. Watches a specific URI and fires events when files
// change within that location.
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

export interface IFileSystemWatcher extends IDisposable {
	readonly uri: URI;
	readonly onDidChange: Event<readonly IFileChange[]>;
	readonly recursive: boolean;
}
