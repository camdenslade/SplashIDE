//********************************************************************
//
// Service Interfaces and Identifiers
//
// VS Code-style service interfaces shared between main and renderer
// processes. All services must implement these interfaces for type
// safety. Services are registered via InstantiationService and accessed
// via service identifiers. This ensures type safety and enables
// dependency injection throughout the application.
//
// Return Value
// ------------
// None (file contains interface definitions and service identifiers)
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

import { createServiceIdentifier } from '../types/serviceIdentifier';
import { Event } from '../types/event';
import { IDisposable } from '../types/disposable';
import { FileNode, FileStats } from '../messages/ipcMessages';
import type { IFileSystemProvider } from '../types/filesystem';
import type { IWorkspaceFolder } from '../types/workspace';
import { URI } from '../types/uri';

export const IFileService = createServiceIdentifier<IFileService>('IFileService');
export const IWorkspaceService = createServiceIdentifier<IWorkspaceService>('IWorkspaceService');
export const ICommandService = createServiceIdentifier<ICommandService>('ICommandService');
export const IKeybindingService = createServiceIdentifier<IKeybindingService>('IKeybindingService');
export const IEditorService = createServiceIdentifier<IEditorService>('IEditorService');
export const IGitService = createServiceIdentifier<IGitService>('IGitService');
export const IAgentService = createServiceIdentifier<IAgentService>('IAgentService');
export const ITypeScriptService = createServiceIdentifier<ITypeScriptService>('ITypeScriptService');
export const IFileSystemProviderService = createServiceIdentifier<IFileSystemProviderService>('IFileSystemProviderService');

export interface IFileService {
	readonly onDidChangeFile: Event<FileChangeEvent>;
	getRootTree(rootPath: string): Promise<FileNode[]>;
	expandFolder(folderPath: string): Promise<FileNode[]>;
	getStats(filePath: string): FileStats | undefined;
	readFile(path: string | URI): Promise<string>;
	readFileBatch(paths: string[]): Promise<Record<string, string>>;
	writeFile(path: string, content: string): Promise<void>;
	createFile(filePath: string, content: string, workspaceRoot: string): Promise<void>;
	deleteFile(path: string): Promise<void>;
}

//********************************************************************
//
// FileChangeEvent Interface
//
// File change event interface. Represents a change to a file in the
// file system, including the change type (created, deleted, modified,
// renamed), the file path, and optionally the old path for rename events.
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

export interface FileChangeEvent {
	type: 'created' | 'deleted' | 'modified' | 'renamed';
	path: string;
	oldPath?: string;
}

export interface IWorkspaceService {
	readonly _serviceBrand: undefined;
	openWorkspace(): Promise<string | null>;
	indexWorkspace(root: string): Promise<{ files: string[] }>;
	getWorkspaceContext(root: string): Promise<WorkspaceContext>;
	buildImportGraph(files: string[]): Promise<Record<string, string[]>>;
	discoverRelatedFiles(
		graph: Record<string, string[]>,
		file: string,
		depth: number
	): Promise<string[]>;
	getWorkspaceFolders(): readonly IWorkspaceFolder[];
	addWorkspaceFolder(uri: URI): Promise<void>;
	removeWorkspaceFolder(uri: URI): Promise<void>;
	readonly onDidChangeWorkspaceFolders: Event<WorkspaceFoldersChangeEvent>;
}

export interface WorkspaceContext {
	root: string;
	files: string[];
	contents: Record<string, string>;
	graph: Record<string, string[]>;
}

// ============================================================================
// Command Service
// ============================================================================

export interface ICommandHandler {
	execute(...args: unknown[]): Promise<unknown> | unknown;
}

export interface ICommand {
	readonly id: string;
	readonly title: string;
	readonly handler: ICommandHandler;
}

export interface ICommandService {
	registerCommand(command: ICommand): IDisposable;
	executeCommand<T = unknown>(id: string, ...args: unknown[]): Promise<T>;
	getCommands(): ICommand[];
}

export interface IKeybinding {
	readonly key: string;
	readonly command: string;
	readonly when?: string;
}

export interface IKeybindingService {
	registerKeybinding(keybinding: IKeybinding): IDisposable;
	executeKeybinding(key: string): Promise<void>;
}

export interface IEditorService {
	openEditor(uri: string, content?: string): Promise<void>;
	closeEditor(uri: string): Promise<void>;
	getActiveEditor(): string | undefined;
	isDirty(uri: string): boolean;
	setDirty(uri: string, dirty: boolean): void;
}

export interface IGitService {
	init(root: string): Promise<boolean>;
	status(root: string): Promise<unknown>;
	add(root: string, file: string): Promise<boolean>;
	reset(root: string, file: string): Promise<boolean>;
	commit(root: string, message: string): Promise<boolean>;
	diff(root: string, file: string): Promise<string>;
	diffStaged(root: string, file: string): Promise<string>;
	branches(root: string): Promise<string[]>;
	checkout(root: string, branch: string): Promise<boolean>;
	createBranch(root: string, branch: string): Promise<boolean>;
	push(root: string): Promise<boolean>;
	pull(root: string): Promise<boolean>;
	addRemote(root: string, name: string, url: string): Promise<boolean>;
	remoteList(root: string): Promise<Array<{ name: string; url: string }>>;
}

export interface IAgentService {
	runAgent(agentName: string, payload: unknown): Promise<unknown>;
	getAgents(): Promise<AgentDefinition[]>;
	registerAgent(agent: AgentDefinition): void;
}

// AgentDefinition moved to common/types/agent.ts
import type { AgentDefinition } from '../types/agent';
export type { AgentDefinition };

export interface ITypeScriptService {
	start(workspaceRoot: string): Promise<boolean>;
	sendRequest(command: string, args?: unknown): Promise<unknown>;
	getCompletions(file: string, line: number, offset: number): Promise<CompletionInfo[]>;
	getDiagnostics(files: string[]): Promise<Diagnostic[]>;
	getQuickInfo(file: string, line: number, offset: number): Promise<QuickInfo | undefined>;
	getDocumentSymbols(file: string): Promise<DocumentSymbol[]>;
	formatDocument(file: string, options?: FormatOptions): Promise<TextEdit[]>;
	navigateToDefinition(file: string, line: number, offset: number): Promise<Location[]>;
	renameSymbol(file: string, line: number, offset: number, newName: string): Promise<RenameInfo | undefined>;
}

export interface CompletionInfo {
	label: string;
	kind: string;
	detail?: string;
	documentation?: string;
	insertText?: string;
}

export interface Diagnostic {
	file: string;
	startLine: number;
	startOffset: number;
	endLine: number;
	endOffset: number;
	message: string;
	category: 'error' | 'warning' | 'suggestion' | 'message';
	code: number;
}

export interface QuickInfo {
	text: string;
	documentation?: string;
	startLine: number;
	startOffset: number;
	endLine: number;
	endOffset: number;
}

export interface DocumentSymbol {
	name: string;
	kind: string;
	range: {
		startLine: number;
		startOffset: number;
		endLine: number;
		endOffset: number;
	};
	children?: DocumentSymbol[];
}

export interface TextEdit {
	range: {
		startLine: number;
		startOffset: number;
		endLine: number;
		endOffset: number;
	};
	newText: string;
}

export interface Location {
	file: string;
	startLine: number;
	startOffset: number;
	endLine: number;
	endOffset: number;
}

export interface RenameInfo {
	canRename: boolean;
	displayName?: string;
	fullDisplayName?: string;
	kind?: string;
	triggerSpan?: {
		startLine: number;
		startOffset: number;
		endLine: number;
		endOffset: number;
	};
}

export interface FormatOptions {
	tabSize?: number;
	indentSize?: number;
	insertSpaces?: boolean;
}

export interface IFileSystemProviderService {
	registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable;
	getProvider(scheme: string): IFileSystemProvider | undefined;
	hasProvider(scheme: string): boolean;
}

export interface WorkspaceFoldersChangeEvent {
	added: readonly IWorkspaceFolder[];
	removed: readonly IWorkspaceFolder[];
}
