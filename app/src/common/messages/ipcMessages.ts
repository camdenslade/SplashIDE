//********************************************************************
//
// IPC Message Interfaces
//
// Strongly-typed message contracts for all IPC communication.
// Following VS Code's pattern of typed request/response pairs.
// Defines all request and response interfaces for IPC channels
// including workspace, file system, file operations, Git, TypeScript,
// GitHub, and file system provider messages.
//
// Return Value
// ------------
// None (file contains interface definitions)
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

// ============================================================================
// Workspace Messages
// ============================================================================

export interface WorkspaceOpenRequest {
	// Empty - uses dialog
}

export interface WorkspaceOpenResponse {
	path: string | null;
}

export interface WorkspaceIndexRequest {
	root: string;
}

export interface WorkspaceIndexResponse {
	files: string[];
}

export interface WorkspaceContextRequest {
	root: string;
}

export interface WorkspaceContextResponse {
	root: string;
	files: string[];
	contents: Record<string, string>;
	graph: Record<string, string[]>;
}

export interface WorkspaceGraphRequest {
	files: string[];
}

export interface WorkspaceGraphResponse {
	graph: Record<string, string[]>;
}

export interface WorkspaceDiscoverRelatedRequest {
	graph: Record<string, string[]>;
	file: string;
	depth: number;
}

export interface WorkspaceDiscoverRelatedResponse {
	files: string[];
}

// ============================================================================
// File System Messages
// ============================================================================

export interface FileSystemGetTreeRequest {
	rootPath: string;
}

export interface FileSystemGetTreeResponse {
	nodes: FileNode[];
}

export interface FileSystemExpandRequest {
	folderPath: string;
}

export interface FileSystemExpandResponse {
	nodes: FileNode[];
}

export interface FileSystemGetStatsRequest {
	filePath: string;
}

export interface FileSystemGetStatsResponse {
	stats: FileStats;
}

export interface FileSystemChangeEvent {
	type: 'created' | 'deleted' | 'modified' | 'renamed';
	path: string;
	oldPath?: string;
}

// ============================================================================
// File Operation Messages
// ============================================================================

export interface FileReadRequest {
	path: string;
}

export interface FileReadResponse {
	content: string;
}

export interface FileReadBatchRequest {
	paths: string[];
}

export interface FileReadBatchResponse {
	contents: Record<string, string>;
}

export interface FileWriteRequest {
	path: string;
	content: string;
}

export interface FileWriteResponse {
	success: boolean;
}

export interface FileCreateRequest {
	filePath: string;
	content: string;
	workspaceRoot: string;
}

export interface FileCreateResponse {
	success: boolean;
}

export interface FileDeleteRequest {
	path: string;
}

export interface FileDeleteResponse {
	success: boolean;
}

// ============================================================================
// Workspace Multi-Root Messages
// ============================================================================

export interface WorkspaceAddFolderRequest {
	uri: string;
}

export interface WorkspaceAddFolderResponse {
	success: boolean;
	folder?: {
		uri: string;
		name: string;
		index: number;
	};
}

export interface WorkspaceRemoveFolderRequest {
	uri: string;
}

export interface WorkspaceRemoveFolderResponse {
	success: boolean;
}

// ============================================================================
// File System Provider Messages
// ============================================================================

export interface FileProviderReadRequest {
	scheme: string;
	uri: string;
}

export interface FileProviderReadResponse {
	content: Uint8Array;
}

export interface FileProviderWriteRequest {
	scheme: string;
	uri: string;
	content: Uint8Array;
	options: {
		create: boolean;
		overwrite: boolean;
	};
}

export interface FileProviderWriteResponse {
	success: boolean;
}

export interface FileProviderDeleteRequest {
	scheme: string;
	uri: string;
	options: {
		recursive: boolean;
	};
}

export interface FileProviderDeleteResponse {
	success: boolean;
}

export interface FileProviderStatRequest {
	scheme: string;
	uri: string;
}

export interface FileProviderStatResponse {
	stat: {
		type: number;
		size: number;
		ctime: number;
		mtime: number;
	};
}

export interface FileProviderReadDirRequest {
	scheme: string;
	uri: string;
}

export interface FileProviderReadDirResponse {
	entries: Array<[string, number]>;
}

// ============================================================================
// Patch/Agent Messages
// ============================================================================

export interface PatchApplyRequest {
	diff: string;
}

export interface PatchApplyResponse {
	success: boolean;
}

export interface AgentRunRequest {
	agentName: string;
	payload: unknown;
}

export interface AgentRunResponse {
	result: unknown;
}

// ============================================================================
// Git Messages
// ============================================================================

export interface GitInitRequest {
	root: string;
}

export interface GitInitResponse {
	success: boolean;
}

export interface GitStatusRequest {
	root: string;
}

export interface GitStatusResponse {
	status: unknown;
}

export interface GitAddRequest {
	root: string;
	file: string;
}

export interface GitAddResponse {
	success: boolean;
}

export interface GitResetRequest {
	root: string;
	file: string;
}

export interface GitResetResponse {
	success: boolean;
}

export interface GitCommitRequest {
	root: string;
	message: string;
}

export interface GitCommitResponse {
	success: boolean;
}

export interface GitDiffRequest {
	root: string;
	file: string;
}

export interface GitDiffResponse {
	diff: string;
}

export interface GitDiffStagedRequest {
	root: string;
	file: string;
}

export interface GitDiffStagedResponse {
	diff: string;
}

export interface GitBranchesRequest {
	root: string;
}

export interface GitBranchesResponse {
	branches: string[];
}

export interface GitCheckoutRequest {
	root: string;
	branch: string;
}

export interface GitCheckoutResponse {
	success: boolean;
}

export interface GitCreateBranchRequest {
	root: string;
	branch: string;
}

export interface GitCreateBranchResponse {
	success: boolean;
}

export interface GitPushRequest {
	root: string;
}

export interface GitPushResponse {
	success: boolean;
}

export interface GitPullRequest {
	root: string;
}

export interface GitPullResponse {
	success: boolean;
}

export interface GitAddRemoteRequest {
	root: string;
	name: string;
	url: string;
}

export interface GitAddRemoteResponse {
	success: boolean;
}

export interface GitRemoteListRequest {
	root: string;
}

export interface GitRemoteListResponse {
	remotes: Array<{ name: string; url: string }>;
}

export interface GitConflictsRequest {
	root: string;
}

export interface GitConflictsResponse {
	conflicts: string[];
}

export interface GitGetConflictStagesRequest {
	root: string;
	file: string;
}

export interface GitGetConflictStagesResponse {
	stages: unknown;
}

// ============================================================================
// TypeScript Messages
// ============================================================================

export interface TypeScriptStartRequest {
	workspaceRoot: string;
}

export interface TypeScriptStartResponse {
	success: boolean;
}

export interface TypeScriptSendRequest {
	command: string;
	args?: unknown;
}

export interface TypeScriptSendResponse {
	result: unknown;
}

export interface TypeScriptEvent {
	message: unknown;
}

// ============================================================================
// TypeScript Service Messages
// ============================================================================

export interface TypeScriptGetCompletionsRequest {
	file: string;
	line: number;
	offset: number;
}

export interface TypeScriptGetCompletionsResponse {
	completions: Array<{
		label: string;
		kind: string;
		detail?: string;
		documentation?: string;
		insertText?: string;
	}>;
}

export interface TypeScriptGetDiagnosticsRequest {
	files: string[];
}

export interface TypeScriptGetDiagnosticsResponse {
	diagnostics: Array<{
		file: string;
		startLine: number;
		startOffset: number;
		endLine: number;
		endOffset: number;
		message: string;
		category: 'error' | 'warning' | 'suggestion' | 'message';
		code: number;
	}>;
}

export interface TypeScriptGetQuickInfoRequest {
	file: string;
	line: number;
	offset: number;
}

export interface TypeScriptGetQuickInfoResponse {
	quickInfo: {
		text: string;
		documentation?: string;
		startLine: number;
		startOffset: number;
		endLine: number;
		endOffset: number;
	} | null;
}

export interface TypeScriptGetDocumentSymbolsRequest {
	file: string;
}

export interface TypeScriptGetDocumentSymbolsResponse {
	symbols: Array<{
		name: string;
		kind: string;
		range: {
			startLine: number;
			startOffset: number;
			endLine: number;
			endOffset: number;
		};
		children?: Array<{
			name: string;
			kind: string;
			range: {
				startLine: number;
				startOffset: number;
				endLine: number;
				endOffset: number;
			};
		}>;
	}>;
}

export interface TypeScriptFormatDocumentRequest {
	file: string;
	options?: {
		tabSize?: number;
		indentSize?: number;
		insertSpaces?: boolean;
	};
}

export interface TypeScriptFormatDocumentResponse {
	edits: Array<{
		range: {
			startLine: number;
			startOffset: number;
			endLine: number;
			endOffset: number;
		};
		newText: string;
	}>;
}

export interface TypeScriptNavigateToDefinitionRequest {
	file: string;
	line: number;
	offset: number;
}

export interface TypeScriptNavigateToDefinitionResponse {
	locations: Array<{
		file: string;
		startLine: number;
		startOffset: number;
		endLine: number;
		endOffset: number;
	}>;
}

export interface TypeScriptRenameSymbolRequest {
	file: string;
	line: number;
	offset: number;
	newName: string;
}

export interface TypeScriptRenameSymbolResponse {
	renameInfo: {
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
	} | null;
}

// ============================================================================
// GitHub Messages
// ============================================================================

export interface GitHubSaveTokenRequest {
	token: string;
}

export interface GitHubSaveTokenResponse {
	success: boolean;
}

export interface GitHubGetUserRequest {
	// Empty
}

export interface GitHubGetUserResponse {
	user: unknown;
}

export interface GitHubCreateRepoRequest {
	name: string;
	description: string;
	private: boolean;
}

export interface GitHubCreateRepoResponse {
	success: boolean;
	repo?: unknown;
}

export interface GitHubCreatePullRequestRequest {
	args: unknown;
}

export interface GitHubCreatePullRequestResponse {
	success: boolean;
	pr?: unknown;
}

// ============================================================================
// File System Types
// ============================================================================

export interface FileNode {
	name: string;
	path: string;
	type: 'file' | 'folder';
	children: FileNode[];
}

export interface FileStats {
	isFile: boolean;
	isDirectory: boolean;
	size: number;
	mtime: number;
}
