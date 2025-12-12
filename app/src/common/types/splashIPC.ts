//********************************************************************
//
// SplashIPC Interface
//
// Centralized type definitions for the window.splash IPC API. Complete
// interface for all methods exposed via window.splash from the main process.
// Includes workspace operations, file system operations, agent operations,
// TypeScript operations, Git operations, and GitHub operations. All browser
// services should reference this type instead of declaring their own.
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

import type {
	FileSystemGetTreeResponse,
	FileSystemExpandResponse,
	FileSystemGetStatsResponse,
	FileSystemChangeEvent,
	FileReadBatchResponse,
	WorkspaceIndexResponse,
	WorkspaceGraphResponse,
	WorkspaceDiscoverRelatedResponse,
	AgentRunResponse,
	GitStatusResponse,
	TypeScriptSendResponse,
	TypeScriptGetCompletionsResponse,
	TypeScriptGetDiagnosticsResponse,
	TypeScriptGetQuickInfoResponse,
	TypeScriptGetDocumentSymbolsResponse,
	TypeScriptFormatDocumentResponse,
	TypeScriptNavigateToDefinitionResponse,
	TypeScriptRenameSymbolResponse,
	GitHubGetUserResponse,
	GitHubCreateRepoResponse,
	GitHubCreatePullRequestResponse
} from '../messages/ipcMessages';
import type { WorkspaceContext } from '../models/services';

export interface SplashIPC {
	openWorkspace(): Promise<string | null>;
	indexWorkspace(root: string): Promise<WorkspaceIndexResponse>;
	getWorkspaceContext(root: string): Promise<WorkspaceContext>;
	getImportGraph(files: string[]): Promise<WorkspaceGraphResponse>;
	discoverRelated(graph: Record<string, string[]>, file: string, depth?: number): Promise<WorkspaceDiscoverRelatedResponse>;

	// File system operations
	getTree(rootPath: string): Promise<FileSystemGetTreeResponse>;
	expand(folderPath: string): Promise<FileSystemExpandResponse>;
	getStats(filePath: string): Promise<FileSystemGetStatsResponse>;
	onFileChange(callback: (event: FileSystemChangeEvent) => void): () => void;
	readFile(path: string): Promise<string>;
	readFileBatch(paths: string[]): Promise<FileReadBatchResponse>;
	writeFile(path: string, content: string): Promise<void>;
	createFile(filePath: string, content: string, workspaceRoot: string): Promise<void>;
	deleteFile(path: string): Promise<void>;

	// Agent operations
	runAgent(name: string, payload: unknown): Promise<AgentRunResponse>;

	// TypeScript operations
	tsStart(workspaceRoot: string): Promise<boolean>;
	tsRequest(command: string, args?: unknown): Promise<TypeScriptSendResponse>;
	onTsEvent(callback: (event: { message: unknown }) => void): () => void;
	tsGetCompletions(file: string, line: number, offset: number): Promise<TypeScriptGetCompletionsResponse>;
	tsGetDiagnostics(files: string[]): Promise<TypeScriptGetDiagnosticsResponse>;
	tsGetQuickInfo(file: string, line: number, offset: number): Promise<TypeScriptGetQuickInfoResponse>;
	tsGetDocumentSymbols(file: string): Promise<TypeScriptGetDocumentSymbolsResponse>;
	tsFormatDocument(file: string, options?: unknown): Promise<TypeScriptFormatDocumentResponse>;
	tsNavigateToDefinition(file: string, line: number, offset: number): Promise<TypeScriptNavigateToDefinitionResponse>;
	tsRenameSymbol(file: string, line: number, offset: number, newName: string): Promise<TypeScriptRenameSymbolResponse>;

	// Git operations
	gitInit(root: string): Promise<boolean>;
	gitStatus(root: string): Promise<GitStatusResponse>;
	gitAdd(root: string, file: string): Promise<boolean>;
	gitReset(root: string, file: string): Promise<boolean>;
	gitCommit(root: string, message: string): Promise<boolean>;
	gitDiff(root: string, file: string): Promise<string>;
	gitDiffStaged(root: string, file: string): Promise<string>;
	gitBranches(root: string): Promise<string[]>;
	gitCheckout(root: string, branch: string): Promise<boolean>;
	gitCreateBranch(root: string, branch: string): Promise<boolean>;
	gitPush(root: string): Promise<boolean>;
	gitPull(root: string): Promise<boolean>;
	gitAddRemote(root: string, name: string, url: string): Promise<boolean>;
	gitRemoteList(root: string): Promise<Array<{ name: string; url: string }>>;
	gitConflicts(root: string): Promise<string[]>;
	gitGetConflictStages(root: string, file: string): Promise<unknown>;

	// GitHub operations
	githubSaveToken(token: string): Promise<boolean>;
	githubGetUser(): Promise<GitHubGetUserResponse>;
	githubCreateRepo(name: string, description: string, isPrivate: boolean): Promise<GitHubCreateRepoResponse>;
	githubCreatePullRequest(args: unknown): Promise<GitHubCreatePullRequestResponse>;

	// Shortcuts
	onShortcut(callback: (cmd: string) => void): () => void;
	onCommandPalette(callback: () => void): () => void;
	onQuickSearch(callback: () => void): () => void;
}

/**
 * Global Window interface extension.
 * This should be declared once in a central location.
 */
declare global {
	interface Window {
		splash: SplashIPC;
	}
}

export {};
