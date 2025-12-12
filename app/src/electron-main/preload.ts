/**
 * Preload Script
 * 
 * VS Code-style typed IPC proxy for renderer process.
 * Exposes strongly-typed API to renderer via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannel } from '../common/ipc/channelNames';
import type {
	WorkspaceOpenResponse,
	WorkspaceIndexRequest,
	WorkspaceIndexResponse,
	WorkspaceContextRequest,
	WorkspaceContextResponse,
	WorkspaceGraphRequest,
	WorkspaceGraphResponse,
	WorkspaceDiscoverRelatedRequest,
	WorkspaceDiscoverRelatedResponse,
	FileSystemGetTreeRequest,
	FileSystemGetTreeResponse,
	FileSystemExpandRequest,
	FileSystemExpandResponse,
	FileSystemGetStatsRequest,
	FileSystemGetStatsResponse,
	FileSystemChangeEvent,
	FileReadRequest,
	FileReadResponse,
	FileReadBatchRequest,
	FileReadBatchResponse,
	FileWriteRequest,
	FileWriteResponse,
	FileCreateRequest,
	FileCreateResponse,
	FileDeleteRequest,
	FileDeleteResponse,
	PatchApplyRequest,
	PatchApplyResponse,
	AgentRunRequest,
	AgentRunResponse,
	GitInitRequest,
	GitInitResponse,
	GitStatusRequest,
	GitStatusResponse,
	GitAddRequest,
	GitAddResponse,
	GitResetRequest,
	GitResetResponse,
	GitCommitRequest,
	GitCommitResponse,
	GitDiffRequest,
	GitDiffResponse,
	GitDiffStagedRequest,
	GitDiffStagedResponse,
	GitBranchesRequest,
	GitBranchesResponse,
	GitCheckoutRequest,
	GitCheckoutResponse,
	GitCreateBranchRequest,
	GitCreateBranchResponse,
	GitPushRequest,
	GitPushResponse,
	GitPullRequest,
	GitPullResponse,
	GitAddRemoteRequest,
	GitAddRemoteResponse,
	GitRemoteListRequest,
	GitRemoteListResponse,
	GitConflictsRequest,
	GitConflictsResponse,
	GitGetConflictStagesRequest,
	GitGetConflictStagesResponse,
	TypeScriptStartRequest,
	TypeScriptStartResponse,
	TypeScriptSendRequest,
	TypeScriptSendResponse,
	TypeScriptEvent,
	GitHubSaveTokenRequest,
	GitHubSaveTokenResponse,
	GitHubGetUserRequest,
	GitHubGetUserResponse,
	GitHubCreateRepoRequest,
	GitHubCreateRepoResponse,
	GitHubCreatePullRequestRequest,
	GitHubCreatePullRequestResponse,
	TypeScriptGetCompletionsRequest,
	TypeScriptGetCompletionsResponse,
	TypeScriptGetDiagnosticsRequest,
	TypeScriptGetDiagnosticsResponse,
	TypeScriptGetQuickInfoRequest,
	TypeScriptGetQuickInfoResponse,
	TypeScriptGetDocumentSymbolsRequest,
	TypeScriptGetDocumentSymbolsResponse,
	TypeScriptFormatDocumentRequest,
	TypeScriptFormatDocumentResponse,
	TypeScriptNavigateToDefinitionRequest,
	TypeScriptNavigateToDefinitionResponse,
	TypeScriptRenameSymbolRequest,
	TypeScriptRenameSymbolResponse
} from '../common/messages/ipcMessages';

/**
 * Typed IPC invoke helper.
 */
function invoke<TRequest, TResponse>(
	channel: IpcChannel,
	request: TRequest
): Promise<TResponse> {
	return ipcRenderer.invoke(channel, request) as Promise<TResponse>;
}

/**
 * Typed IPC event listener.
 */
function on<TEvent>(channel: IpcChannel, callback: (event: TEvent) => void): () => void {
	const handler = (_event: Electron.IpcRendererEvent, data: TEvent) => callback(data);
	ipcRenderer.on(channel, handler);
	return () => {
		ipcRenderer.removeListener(channel, handler);
	};
}

// ============================================================================
// Typed Splash API
// ============================================================================

export interface SplashAPI {
	// Workspace
	openWorkspace(): Promise<string | null>;
	indexWorkspace(root: string): Promise<WorkspaceIndexResponse>;
	getWorkspaceContext(root: string): Promise<WorkspaceContextResponse>;
	getImportGraph(files: string[]): Promise<WorkspaceGraphResponse>;
	discoverRelated(
		graph: Record<string, string[]>,
		file: string,
		depth?: number
	): Promise<WorkspaceDiscoverRelatedResponse>;

	// File System
	getTree(rootPath: string): Promise<FileSystemGetTreeResponse>;
	expand(folderPath: string): Promise<FileSystemExpandResponse>;
	getStats(filePath: string): Promise<FileSystemGetStatsResponse>;
	onFileChange(callback: (event: FileSystemChangeEvent) => void): () => void;

	// File Operations
	readFile(path: string): Promise<string>;
	readFileBatch(paths: string[]): Promise<FileReadBatchResponse>;
	writeFile(path: string, content: string): Promise<void>;
	createFile(filePath: string, content: string, workspaceRoot: string): Promise<void>;
	deleteFile(path: string): Promise<void>;

	// Patch/Agents
	applyPatch(diff: string): Promise<void>;
	runAgent(name: string, payload: unknown): Promise<AgentRunResponse>;

	// Git
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

	// TypeScript
	tsStart(workspaceRoot: string): Promise<boolean>;
	tsRequest(command: string, args?: unknown): Promise<TypeScriptSendResponse>;
	onTsEvent(callback: (event: TypeScriptEvent) => void): () => void;
	tsGetCompletions(file: string, line: number, offset: number): Promise<TypeScriptGetCompletionsResponse>;
	tsGetDiagnostics(files: string[]): Promise<TypeScriptGetDiagnosticsResponse>;
	tsGetQuickInfo(file: string, line: number, offset: number): Promise<TypeScriptGetQuickInfoResponse>;
	tsGetDocumentSymbols(file: string): Promise<TypeScriptGetDocumentSymbolsResponse>;
	tsFormatDocument(file: string, options?: unknown): Promise<TypeScriptFormatDocumentResponse>;
	tsNavigateToDefinition(file: string, line: number, offset: number): Promise<TypeScriptNavigateToDefinitionResponse>;
	tsRenameSymbol(file: string, line: number, offset: number, newName: string): Promise<TypeScriptRenameSymbolResponse>;

	// GitHub
	githubSaveToken(token: string): Promise<boolean>;
	githubGetUser(): Promise<GitHubGetUserResponse>;
	githubCreateRepo(
		name: string,
		description: string,
		isPrivate: boolean
	): Promise<GitHubCreateRepoResponse>;
	githubCreatePullRequest(args: unknown): Promise<GitHubCreatePullRequestResponse>;

	// Shortcuts
	onShortcut(callback: (cmd: string) => void): () => void;
	onCommandPalette(callback: () => void): () => void;
	onQuickSearch(callback: () => void): () => void;
}

// ============================================================================
// Expose API
// ============================================================================

try {
	if (!contextBridge || !ipcRenderer) {
		throw new Error('Electron APIs not available');
	}

	// Temporary crash diagnostics for renderer
	if (typeof globalThis !== 'undefined' && (globalThis as any).window) {
		const win = (globalThis as any).window as any;
		win.addEventListener('error', (event: any) => {
			console.error('[CRITICAL] Renderer window error:', event?.message, event?.error);
		});

		win.addEventListener('unhandledrejection', (event: any) => {
			console.error('[CRITICAL] Renderer unhandled rejection:', event?.reason);
		});
	}

	const splashAPI: SplashAPI = {
		// Workspace
		openWorkspace: async () => {
			const response = await invoke<never, WorkspaceOpenResponse>(
				IpcChannel.WorkspaceOpen,
				undefined as never
			);
			return response.path;
		},

		indexWorkspace: async (root: string) => {
			return invoke<WorkspaceIndexRequest, WorkspaceIndexResponse>(
				IpcChannel.WorkspaceIndex,
				{ root }
			);
		},

		getWorkspaceContext: async (root: string) => {
			return invoke<WorkspaceContextRequest, WorkspaceContextResponse>(
				IpcChannel.WorkspaceContext,
				{ root }
			);
		},

		getImportGraph: async (files: string[]) => {
			return invoke<WorkspaceGraphRequest, WorkspaceGraphResponse>(
				IpcChannel.WorkspaceGraph,
				{ files }
			);
		},

		discoverRelated: async (
			graph: Record<string, string[]>,
			file: string,
			depth = 3
		) => {
			return invoke<WorkspaceDiscoverRelatedRequest, WorkspaceDiscoverRelatedResponse>(
				IpcChannel.WorkspaceDiscoverRelated,
				{ graph, file, depth }
			);
		},

		// File System
		getTree: async (rootPath: string) => {
			return invoke<FileSystemGetTreeRequest, FileSystemGetTreeResponse>(
				IpcChannel.FileSystemGetTree,
				{ rootPath }
			);
		},

		expand: async (folderPath: string) => {
			return invoke<FileSystemExpandRequest, FileSystemExpandResponse>(
				IpcChannel.FileSystemExpand,
				{ folderPath }
			);
		},

		getStats: async (filePath: string) => {
			return invoke<FileSystemGetStatsRequest, FileSystemGetStatsResponse>(
				IpcChannel.FileSystemGetStats,
				{ filePath }
			);
		},

		onFileChange: (callback: (event: FileSystemChangeEvent) => void) => {
			return on<FileSystemChangeEvent>(IpcChannel.FileSystemChange, callback);
		},

		// File Operations
		readFile: async (path: string) => {
			const response = await invoke<FileReadRequest, FileReadResponse>(
				IpcChannel.FileRead,
				{ path }
			);
			return response.content;
		},

		readFileBatch: async (paths: string[]) => {
			return invoke<FileReadBatchRequest, FileReadBatchResponse>(
				IpcChannel.FileReadBatch,
				{ paths }
			);
		},

		writeFile: async (path: string, content: string) => {
			await invoke<FileWriteRequest, FileWriteResponse>(IpcChannel.FileWrite, {
				path,
				content
			});
		},

		createFile: async (filePath: string, content: string, workspaceRoot: string) => {
			await invoke<FileCreateRequest, FileCreateResponse>(IpcChannel.FileCreate, {
				filePath,
				content,
				workspaceRoot
			});
		},

		deleteFile: async (path: string) => {
			await invoke<FileDeleteRequest, FileDeleteResponse>(IpcChannel.FileDelete, { path });
		},

		// Patch/Agents
		applyPatch: async (diff: string) => {
			await invoke<PatchApplyRequest, PatchApplyResponse>(IpcChannel.PatchApply, { diff });
		},

		runAgent: async (name: string, payload: unknown) => {
			return invoke<AgentRunRequest, AgentRunResponse>(IpcChannel.AgentRun, {
				agentName: name,
				payload
			});
		},

		// Git
		gitInit: async (root: string) => {
			const response = await invoke<GitInitRequest, GitInitResponse>(IpcChannel.GitInit, {
				root
			});
			return response.success;
		},

		gitStatus: async (root: string) => {
			return invoke<GitStatusRequest, GitStatusResponse>(IpcChannel.GitStatus, { root });
		},

		gitAdd: async (root: string, file: string) => {
			const response = await invoke<GitAddRequest, GitAddResponse>(IpcChannel.GitAdd, {
				root,
				file
			});
			return response.success;
		},

		gitReset: async (root: string, file: string) => {
			const response = await invoke<GitResetRequest, GitResetResponse>(IpcChannel.GitReset, {
				root,
				file
			});
			return response.success;
		},

		gitCommit: async (root: string, message: string) => {
			const response = await invoke<GitCommitRequest, GitCommitResponse>(
				IpcChannel.GitCommit,
				{ root, message }
			);
			return response.success;
		},

		gitDiff: async (root: string, file: string) => {
			const response = await invoke<GitDiffRequest, GitDiffResponse>(IpcChannel.GitDiff, {
				root,
				file
			});
			return response.diff;
		},

		gitDiffStaged: async (root: string, file: string) => {
			const response = await invoke<GitDiffStagedRequest, GitDiffStagedResponse>(
				IpcChannel.GitDiffStaged,
				{ root, file }
			);
			return response.diff;
		},

		gitBranches: async (root: string) => {
			const response = await invoke<GitBranchesRequest, GitBranchesResponse>(
				IpcChannel.GitBranches,
				{ root }
			);
			return response.branches;
		},

		gitCheckout: async (root: string, branch: string) => {
			const response = await invoke<GitCheckoutRequest, GitCheckoutResponse>(
				IpcChannel.GitCheckout,
				{ root, branch }
			);
			return response.success;
		},

		gitCreateBranch: async (root: string, branch: string) => {
			const response = await invoke<GitCreateBranchRequest, GitCreateBranchResponse>(
				IpcChannel.GitCreateBranch,
				{ root, branch }
			);
			return response.success;
		},

		gitPush: async (root: string) => {
			const response = await invoke<GitPushRequest, GitPushResponse>(IpcChannel.GitPush, {
				root
			});
			return response.success;
		},

		gitPull: async (root: string) => {
			const response = await invoke<GitPullRequest, GitPullResponse>(IpcChannel.GitPull, {
				root
			});
			return response.success;
		},

		gitAddRemote: async (root: string, name: string, url: string) => {
			const response = await invoke<GitAddRemoteRequest, GitAddRemoteResponse>(
				IpcChannel.GitAddRemote,
				{ root, name, url }
			);
			return response.success;
		},

		gitRemoteList: async (root: string) => {
			const response = await invoke<GitRemoteListRequest, GitRemoteListResponse>(
				IpcChannel.GitRemoteList,
				{ root }
			);
			return response.remotes;
		},

		gitConflicts: async (root: string) => {
			const response = await invoke<GitConflictsRequest, GitConflictsResponse>(
				IpcChannel.GitConflicts,
				{ root }
			);
			return response.conflicts;
		},

		gitGetConflictStages: async (root: string, file: string) => {
			const response = await invoke<
				GitGetConflictStagesRequest,
				GitGetConflictStagesResponse
			>(IpcChannel.GitGetConflictStages, { root, file });
			return response.stages;
		},

	// TypeScript
	tsStart: async (workspaceRoot: string) => {
		const response = await invoke<TypeScriptStartRequest, TypeScriptStartResponse>(
			IpcChannel.TypeScriptStart,
			{ workspaceRoot }
		);
		return response.success;
	},

	tsRequest: async (command: string, args?: unknown) => {
		return invoke<TypeScriptSendRequest, TypeScriptSendResponse>(
			IpcChannel.TypeScriptSend,
			{ command, args }
		);
	},

	onTsEvent: (callback: (event: TypeScriptEvent) => void) => {
		return on<TypeScriptEvent>(IpcChannel.TypeScriptEvent, callback);
	},

	// TypeScript Service Methods
	tsGetCompletions: async (file: string, line: number, offset: number) => {
		return invoke<TypeScriptGetCompletionsRequest, TypeScriptGetCompletionsResponse>(
			IpcChannel.TypeScriptGetCompletions,
			{ file, line, offset }
		);
	},

	tsGetDiagnostics: async (files: string[]) => {
		return invoke<TypeScriptGetDiagnosticsRequest, TypeScriptGetDiagnosticsResponse>(
			IpcChannel.TypeScriptGetDiagnostics,
			{ files }
		);
	},

	tsGetQuickInfo: async (file: string, line: number, offset: number) => {
		return invoke<TypeScriptGetQuickInfoRequest, TypeScriptGetQuickInfoResponse>(
			IpcChannel.TypeScriptGetQuickInfo,
			{ file, line, offset }
		);
	},

	tsGetDocumentSymbols: async (file: string) => {
		return invoke<TypeScriptGetDocumentSymbolsRequest, TypeScriptGetDocumentSymbolsResponse>(
			IpcChannel.TypeScriptGetDocumentSymbols,
			{ file }
		);
	},

	tsFormatDocument: async (file: string, options?: unknown) => {
		return invoke<TypeScriptFormatDocumentRequest, TypeScriptFormatDocumentResponse>(
			IpcChannel.TypeScriptFormatDocument,
			{ file, options: options as { tabSize?: number; indentSize?: number; insertSpaces?: boolean } | undefined }
		);
	},

	tsNavigateToDefinition: async (file: string, line: number, offset: number) => {
		return invoke<TypeScriptNavigateToDefinitionRequest, TypeScriptNavigateToDefinitionResponse>(
			IpcChannel.TypeScriptNavigateToDefinition,
			{ file, line, offset }
		);
	},

	tsRenameSymbol: async (file: string, line: number, offset: number, newName: string) => {
		return invoke<TypeScriptRenameSymbolRequest, TypeScriptRenameSymbolResponse>(
			IpcChannel.TypeScriptRenameSymbol,
			{ file, line, offset, newName }
		);
	},

		// GitHub
		githubSaveToken: async (token: string) => {
			const response = await invoke<GitHubSaveTokenRequest, GitHubSaveTokenResponse>(
				IpcChannel.GitHubSaveToken,
				{ token }
			);
			return response.success;
		},

		githubGetUser: async () => {
			return invoke<GitHubGetUserRequest, GitHubGetUserResponse>(
				IpcChannel.GitHubGetUser,
				undefined as never
			);
		},

		githubCreateRepo: async (name: string, description: string, isPrivate: boolean) => {
			return invoke<GitHubCreateRepoRequest, GitHubCreateRepoResponse>(
				IpcChannel.GitHubCreateRepo,
				{ name, description, private: isPrivate }
			);
		},

		githubCreatePullRequest: async (args: unknown) => {
			return invoke<GitHubCreatePullRequestRequest, GitHubCreatePullRequestResponse>(
				IpcChannel.GitHubCreatePullRequest,
				{ args }
			);
		},

		// Shortcuts
		onShortcut: (callback: (cmd: string) => void) => {
			const disposables: Array<() => void> = [];
			disposables.push(
				on(IpcChannel.ShortcutSave, () => callback('save')),
				on(IpcChannel.ShortcutOpenWorkspace, () => callback('openWorkspace')),
				on(IpcChannel.ShortcutFind, () => callback('find')),
				on(IpcChannel.ShortcutReplace, () => callback('replace')),
				on(IpcChannel.ShortcutGlobalSearch, () => callback('globalSearch'))
			);
			return () => {
				for (const dispose of disposables) {
					dispose();
				}
			};
		},

		onCommandPalette: (callback: () => void) => {
			return on(IpcChannel.ShortcutCommandPalette, callback);
		},

		onQuickSearch: (callback: () => void) => {
			return on(IpcChannel.ShortcutQuickSearch, callback);
		}
	};

	contextBridge.exposeInMainWorld('splash', splashAPI);

	if (typeof console !== 'undefined') {
		console.log('[DEBUG] Preload: Typed API exposed successfully');
	}
} catch (error: unknown) {
	const err = error instanceof Error ? error : new Error(String(error));
	if (typeof console !== 'undefined') {
		console.error('[CRITICAL] Preload: Failed to expose API:', err);
		console.error('[CRITICAL] Preload: Error message:', err.message);
		console.error('[CRITICAL] Preload: Error stack:', err.stack);
	}
}
