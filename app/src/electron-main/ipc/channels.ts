/**
 * IPC Channels
 * 
 * All IPC channel instances for the main process.
 */

import { IpcChannelImpl } from './ipcChannelImpl';
import { IpcChannel } from '../../common/ipc/channelNames';
import {
	WorkspaceOpenRequest,
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
	GitHubCreatePullRequestResponse
} from '../../common/messages/ipcMessages';

// ============================================================================
// Workspace Channels
// ============================================================================

export const workspaceOpenChannel = new IpcChannelImpl<
	WorkspaceOpenRequest,
	WorkspaceOpenResponse
>(IpcChannel.WorkspaceOpen);

export const workspaceIndexChannel = new IpcChannelImpl<
	WorkspaceIndexRequest,
	WorkspaceIndexResponse
>(IpcChannel.WorkspaceIndex);

export const workspaceContextChannel = new IpcChannelImpl<
	WorkspaceContextRequest,
	WorkspaceContextResponse
>(IpcChannel.WorkspaceContext);

export const workspaceGraphChannel = new IpcChannelImpl<
	WorkspaceGraphRequest,
	WorkspaceGraphResponse
>(IpcChannel.WorkspaceGraph);

export const workspaceDiscoverRelatedChannel = new IpcChannelImpl<
	WorkspaceDiscoverRelatedRequest,
	WorkspaceDiscoverRelatedResponse
>(IpcChannel.WorkspaceDiscoverRelated);

// ============================================================================
// File System Channels
// ============================================================================

export const fileSystemGetTreeChannel = new IpcChannelImpl<
	FileSystemGetTreeRequest,
	FileSystemGetTreeResponse
>(IpcChannel.FileSystemGetTree);

export const fileSystemExpandChannel = new IpcChannelImpl<
	FileSystemExpandRequest,
	FileSystemExpandResponse
>(IpcChannel.FileSystemExpand);

export const fileSystemGetStatsChannel = new IpcChannelImpl<
	FileSystemGetStatsRequest,
	FileSystemGetStatsResponse
>(IpcChannel.FileSystemGetStats);

export const fileSystemChangeChannel = new IpcChannelImpl<never, never, FileSystemChangeEvent>(
	IpcChannel.FileSystemChange
);

// ============================================================================
// File Operation Channels
// ============================================================================

export const fileReadChannel = new IpcChannelImpl<FileReadRequest, FileReadResponse>(
	IpcChannel.FileRead
);

export const fileReadBatchChannel = new IpcChannelImpl<
	FileReadBatchRequest,
	FileReadBatchResponse
>(IpcChannel.FileReadBatch);

export const fileWriteChannel = new IpcChannelImpl<FileWriteRequest, FileWriteResponse>(
	IpcChannel.FileWrite
);

export const fileCreateChannel = new IpcChannelImpl<FileCreateRequest, FileCreateResponse>(
	IpcChannel.FileCreate
);

export const fileDeleteChannel = new IpcChannelImpl<FileDeleteRequest, FileDeleteResponse>(
	IpcChannel.FileDelete
);

// ============================================================================
// Patch/Agent Channels
// ============================================================================

export const patchApplyChannel = new IpcChannelImpl<PatchApplyRequest, PatchApplyResponse>(
	IpcChannel.PatchApply
);

export const agentRunChannel = new IpcChannelImpl<AgentRunRequest, AgentRunResponse>(
	IpcChannel.AgentRun
);

// ============================================================================
// Git Channels
// ============================================================================

export const gitInitChannel = new IpcChannelImpl<GitInitRequest, GitInitResponse>(
	IpcChannel.GitInit
);

export const gitStatusChannel = new IpcChannelImpl<GitStatusRequest, GitStatusResponse>(
	IpcChannel.GitStatus
);

export const gitAddChannel = new IpcChannelImpl<GitAddRequest, GitAddResponse>(IpcChannel.GitAdd);

export const gitResetChannel = new IpcChannelImpl<GitResetRequest, GitResetResponse>(
	IpcChannel.GitReset
);

export const gitCommitChannel = new IpcChannelImpl<GitCommitRequest, GitCommitResponse>(
	IpcChannel.GitCommit
);

export const gitDiffChannel = new IpcChannelImpl<GitDiffRequest, GitDiffResponse>(
	IpcChannel.GitDiff
);

export const gitDiffStagedChannel = new IpcChannelImpl<
	GitDiffStagedRequest,
	GitDiffStagedResponse
>(IpcChannel.GitDiffStaged);

export const gitBranchesChannel = new IpcChannelImpl<GitBranchesRequest, GitBranchesResponse>(
	IpcChannel.GitBranches
);

export const gitCheckoutChannel = new IpcChannelImpl<GitCheckoutRequest, GitCheckoutResponse>(
	IpcChannel.GitCheckout
);

export const gitCreateBranchChannel = new IpcChannelImpl<
	GitCreateBranchRequest,
	GitCreateBranchResponse
>(IpcChannel.GitCreateBranch);

export const gitPushChannel = new IpcChannelImpl<GitPushRequest, GitPushResponse>(
	IpcChannel.GitPush
);

export const gitPullChannel = new IpcChannelImpl<GitPullRequest, GitPullResponse>(
	IpcChannel.GitPull
);

export const gitAddRemoteChannel = new IpcChannelImpl<
	GitAddRemoteRequest,
	GitAddRemoteResponse
>(IpcChannel.GitAddRemote);

export const gitRemoteListChannel = new IpcChannelImpl<
	GitRemoteListRequest,
	GitRemoteListResponse
>(IpcChannel.GitRemoteList);

export const gitConflictsChannel = new IpcChannelImpl<
	GitConflictsRequest,
	GitConflictsResponse
>(IpcChannel.GitConflicts);

export const gitGetConflictStagesChannel = new IpcChannelImpl<
	GitGetConflictStagesRequest,
	GitGetConflictStagesResponse
>(IpcChannel.GitGetConflictStages);

// ============================================================================
// TypeScript Channels
// ============================================================================

export const typeScriptStartChannel = new IpcChannelImpl<
	TypeScriptStartRequest,
	TypeScriptStartResponse
>(IpcChannel.TypeScriptStart);

export const typeScriptSendChannel = new IpcChannelImpl<
	TypeScriptSendRequest,
	TypeScriptSendResponse
>(IpcChannel.TypeScriptSend);

export const typeScriptEventChannel = new IpcChannelImpl<never, never, TypeScriptEvent>(
	IpcChannel.TypeScriptEvent
);

// ============================================================================
// TypeScript Service Channels
// ============================================================================

import type {
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
} from '../../common/messages/ipcMessages';

export const typeScriptGetCompletionsChannel = new IpcChannelImpl<
	TypeScriptGetCompletionsRequest,
	TypeScriptGetCompletionsResponse
>(IpcChannel.TypeScriptGetCompletions);

export const typeScriptGetDiagnosticsChannel = new IpcChannelImpl<
	TypeScriptGetDiagnosticsRequest,
	TypeScriptGetDiagnosticsResponse
>(IpcChannel.TypeScriptGetDiagnostics);

export const typeScriptGetQuickInfoChannel = new IpcChannelImpl<
	TypeScriptGetQuickInfoRequest,
	TypeScriptGetQuickInfoResponse
>(IpcChannel.TypeScriptGetQuickInfo);

export const typeScriptGetDocumentSymbolsChannel = new IpcChannelImpl<
	TypeScriptGetDocumentSymbolsRequest,
	TypeScriptGetDocumentSymbolsResponse
>(IpcChannel.TypeScriptGetDocumentSymbols);

export const typeScriptFormatDocumentChannel = new IpcChannelImpl<
	TypeScriptFormatDocumentRequest,
	TypeScriptFormatDocumentResponse
>(IpcChannel.TypeScriptFormatDocument);

export const typeScriptNavigateToDefinitionChannel = new IpcChannelImpl<
	TypeScriptNavigateToDefinitionRequest,
	TypeScriptNavigateToDefinitionResponse
>(IpcChannel.TypeScriptNavigateToDefinition);

export const typeScriptRenameSymbolChannel = new IpcChannelImpl<
	TypeScriptRenameSymbolRequest,
	TypeScriptRenameSymbolResponse
>(IpcChannel.TypeScriptRenameSymbol);

// ============================================================================
// GitHub Channels
// ============================================================================

export const gitHubSaveTokenChannel = new IpcChannelImpl<
	GitHubSaveTokenRequest,
	GitHubSaveTokenResponse
>(IpcChannel.GitHubSaveToken);

export const gitHubGetUserChannel = new IpcChannelImpl<
	GitHubGetUserRequest,
	GitHubGetUserResponse
>(IpcChannel.GitHubGetUser);

export const gitHubCreateRepoChannel = new IpcChannelImpl<
	GitHubCreateRepoRequest,
	GitHubCreateRepoResponse
>(IpcChannel.GitHubCreateRepo);

export const gitHubCreatePullRequestChannel = new IpcChannelImpl<
	GitHubCreatePullRequestRequest,
	GitHubCreatePullRequestResponse
>(IpcChannel.GitHubCreatePullRequest);
