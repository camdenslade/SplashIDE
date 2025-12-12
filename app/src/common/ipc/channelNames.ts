//********************************************************************
//
// IpcChannel Enum
//
// Centralized registry of all IPC channel names following VS Code's
// pattern. Uses enums instead of string literals for type safety.
// All IPC communication must use these channel names. Never use string
// literals for IPC channels. This ensures type safety and prevents typos.
// Channels are organized by domain: workspace operations, file system
// operations, file operations, Git operations, TypeScript server,
// GitHub integration, and keyboard shortcuts.
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

export enum IpcChannel {
	// Workspace
	WorkspaceOpen = 'workspace:open',
	WorkspaceIndex = 'workspace:index',
	WorkspaceContext = 'workspace:context',
	WorkspaceGraph = 'workspace:graph',
	WorkspaceDiscoverRelated = 'workspace:discoverRelated',

	// File System
	FileSystemGetTree = 'fs:getTree',
	FileSystemExpand = 'fs:expand',
	FileSystemGetStats = 'fs:getStats',
	FileSystemChange = 'fs:change',

	// File Operations
	FileRead = 'file:read',
	FileReadBatch = 'file:readBatch',
	FileWrite = 'file:write',
	FileCreate = 'file:create',
	FileDelete = 'file:delete',

	// Patch/Agents
	PatchApply = 'patch:apply',
	AgentRun = 'agent:run',

	// Git
	GitInit = 'git:init',
	GitStatus = 'git:status',
	GitAdd = 'git:add',
	GitReset = 'git:reset',
	GitCommit = 'git:commit',
	GitDiff = 'git:diff',
	GitDiffStaged = 'git:diffStaged',
	GitBranches = 'git:branches',
	GitCheckout = 'git:checkout',
	GitCreateBranch = 'git:createBranch',
	GitPush = 'git:push',
	GitPull = 'git:pull',
	GitAddRemote = 'git:addRemote',
	GitRemoteList = 'git:remoteList',
	GitConflicts = 'git:conflicts',
	GitGetConflictStages = 'git:getConflictStages',

	// TypeScript
	TypeScriptStart = 'ts:start',
	TypeScriptSend = 'ts:send',
	TypeScriptEvent = 'ts:event',
	TypeScriptGetCompletions = 'ts:getCompletions',
	TypeScriptGetDiagnostics = 'ts:getDiagnostics',
	TypeScriptGetQuickInfo = 'ts:getQuickInfo',
	TypeScriptGetDocumentSymbols = 'ts:getDocumentSymbols',
	TypeScriptFormatDocument = 'ts:formatDocument',
	TypeScriptNavigateToDefinition = 'ts:navigateToDefinition',
	TypeScriptRenameSymbol = 'ts:renameSymbol',

	// GitHub
	GitHubSaveToken = 'github:saveToken',
	GitHubGetUser = 'github:getUser',
	GitHubCreateRepo = 'github:createRepo',
	GitHubCreatePullRequest = 'github:createPullRequest',

	// Shortcuts
	ShortcutSave = 'shortcut:save',
	ShortcutOpenWorkspace = 'shortcut:openWorkspace',
	ShortcutFind = 'shortcut:find',
	ShortcutReplace = 'shortcut:replace',
	ShortcutGlobalSearch = 'shortcut:globalSearch',
	ShortcutCommandPalette = 'shortcut:commandPalette',
	ShortcutQuickSearch = 'shortcut:quickSearch',

	// Renderer
	RendererError = 'renderer:error',

	// Workspace (Multi-Root)
	WorkspaceAddFolder = 'workspace:addFolder',
	WorkspaceRemoveFolder = 'workspace:removeFolder',

	// File System Provider
	FileProviderRead = 'fsProvider:read',
	FileProviderWrite = 'fsProvider:write',
	FileProviderDelete = 'fsProvider:delete',
	FileProviderStat = 'fsProvider:stat',
	FileProviderReadDir = 'fsProvider:readDir'
}
