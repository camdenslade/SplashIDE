/**
 * Main Process Entry Point
 * 
 * VS Code-style main process initialization following dependency injection patterns.
 */

import { app, BrowserWindow, dialog, globalShortcut } from 'electron';
import process from 'process';
import * as path from 'path';
import { spawn } from 'child_process';
import { InstantiationService } from '../common/models/instantiation';
import {
	IFileService,
	IWorkspaceService,
	IGitService,
	IAgentService,
	ITypeScriptService,
	IFileSystemProviderService
} from '../common/models/services';
import { FileService } from './services/fileService';
import { WorkspaceService } from './services/workspaceService';
import { GitService } from './services/gitService';
import { AgentService } from './services/agentService';
import { TypeScriptService } from './services/typeScriptService';
import { FileSystemProviderService } from './services/fileSystemProviderService';
import { MemFSProvider } from './services/providers/memfsProvider';
import { RemoteProvider } from './services/providers/remoteProvider';
import {
	workspaceOpenChannel,
	workspaceIndexChannel,
	workspaceContextChannel,
	workspaceGraphChannel,
	workspaceDiscoverRelatedChannel,
	fileSystemGetTreeChannel,
	fileSystemExpandChannel,
	fileSystemGetStatsChannel,
	fileSystemChangeChannel,
	fileReadChannel,
	fileReadBatchChannel,
	fileWriteChannel,
	fileCreateChannel,
	fileDeleteChannel,
	patchApplyChannel,
	agentRunChannel,
	gitInitChannel,
	gitStatusChannel,
	gitAddChannel,
	gitResetChannel,
	gitCommitChannel,
	gitDiffChannel,
	gitDiffStagedChannel,
	gitBranchesChannel,
	gitCheckoutChannel,
	gitCreateBranchChannel,
	gitPushChannel,
	gitPullChannel,
	gitAddRemoteChannel,
	gitRemoteListChannel,
	typeScriptStartChannel,
	typeScriptSendChannel,
	typeScriptGetCompletionsChannel,
	typeScriptGetDiagnosticsChannel,
	typeScriptGetQuickInfoChannel,
	typeScriptGetDocumentSymbolsChannel,
	typeScriptFormatDocumentChannel,
	typeScriptNavigateToDefinitionChannel,
	typeScriptRenameSymbolChannel,
	gitHubSaveTokenChannel,
	gitHubGetUserChannel,
	gitHubCreateRepoChannel,
	gitHubCreatePullRequestChannel
} from './ipc/channels';
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
	AgentRunResponse
} from '../common/messages/ipcMessages';

let mainWindow: BrowserWindow | null = null;
let llmProcess: ReturnType<typeof spawn> | null = null;
let rendererReady = false;

// Temporary crash diagnostics
const nodeProcess: NodeJS.Process = process;
nodeProcess.on('unhandledRejection' as any, (reason: unknown) => {
	console.error('[CRITICAL] Unhandled promise rejection in main process:', reason);
});

nodeProcess.on('uncaughtException' as any, (error: unknown) => {
	console.error('[CRITICAL] Uncaught exception in main process:', error);
});

// ============================================================================
// Service Instantiation
// ============================================================================

const instantiationService = new InstantiationService();

// Register services
instantiationService.registerService({
	id: IFileService,
	factory: () => new FileService(),
	singleton: true
});

instantiationService.registerService({
	id: IWorkspaceService,
	factory: () => new WorkspaceService(),
	singleton: true
});

instantiationService.registerService({
	id: IGitService,
	factory: () => new GitService(),
	singleton: true
});

instantiationService.registerService({
	id: IAgentService,
	factory: () => new AgentService(),
	singleton: true
});

instantiationService.registerService({
	id: ITypeScriptService,
	factory: () => {
		const service = new TypeScriptService();
		if (mainWindow) {
			service.setMainWindow(mainWindow);
		}
		return service;
	},
	singleton: true
});

instantiationService.registerService({
	id: IFileSystemProviderService,
	factory: () => {
		const service = new FileSystemProviderService();
		// Register built-in providers
		service.registerProvider('memfs', new MemFSProvider());
		service.registerProvider('remote', new RemoteProvider());
		return service;
	},
	singleton: true
});

// ============================================================================
// Window Creation
// ============================================================================

function createWindow(): void {
	const isDev = !app.isPackaged;

	mainWindow = new BrowserWindow({
		width: 1500,
		height: 1000,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: false
		}
	});

	mainWindow.webContents.openDevTools({ mode: 'detach' });

	mainWindow.webContents.on('crashed', () => {
		console.error('[CRITICAL] Renderer crashed — reloading...');
		mainWindow?.reload();
	});

mainWindow.webContents.on('did-finish-load', () => {
	mainWindow?.show();
	rendererReady = true;
	console.log('[DEBUG] Renderer fully loaded');

	// Set main window for IPC channels
		const channels = [
			workspaceOpenChannel,
			workspaceIndexChannel,
			workspaceContextChannel,
			workspaceGraphChannel,
			workspaceDiscoverRelatedChannel,
			fileSystemGetTreeChannel,
			fileSystemExpandChannel,
			fileSystemGetStatsChannel,
			fileSystemChangeChannel,
			fileReadChannel,
			fileReadBatchChannel,
			fileWriteChannel,
			fileCreateChannel,
			fileDeleteChannel,
			patchApplyChannel,
			agentRunChannel,
			gitInitChannel,
			gitStatusChannel,
			gitAddChannel,
			gitResetChannel,
			gitCommitChannel,
			gitDiffChannel,
			gitDiffStagedChannel,
			gitBranchesChannel,
			gitCheckoutChannel,
			gitCreateBranchChannel,
			gitPushChannel,
			gitPullChannel,
			gitAddRemoteChannel,
			gitRemoteListChannel
		];

		for (const channel of channels) {
			channel.setMainWindow(mainWindow);
		}

	// TypeScript service main window is set in the factory
	// TypeScript events are forwarded to renderer via IPC by tsRouter
	// No additional handling needed here
});

mainWindow.webContents.on('render-process-gone', (_event, details) => {
	console.error('[CRITICAL] Renderer process gone:', details);
	// Temporary: hard crash details to help debugging
	console.error('[CRITICAL] Renderer crash reason:', details.reason, 'exitCode:', details.exitCode);
});

mainWindow.webContents.on('child-process-gone' as any, (_event: any, details: any) => {
	console.error('[CRITICAL] Child process gone:', details);
});

	setTimeout(() => {
		if (isDev) {
			mainWindow!.loadURL('http://localhost:5173').catch(() => {
				mainWindow!.loadFile(path.join(__dirname, '../renderer/index.html'));
			});
		} else {
			mainWindow!.loadFile(path.join(__dirname, '../renderer/index.html'));
		}
	}, 400);
}

// ============================================================================
// IPC Channel Handlers
// ============================================================================

async function registerIpcHandlers(): Promise<void> {
	const fileService = instantiationService.get(IFileService);
	const workspaceService = instantiationService.get(IWorkspaceService);
	const gitService = instantiationService.get(IGitService);
	const agentService = instantiationService.get(IAgentService);

	// Workspace channels
	workspaceOpenChannel.handle(async (): Promise<WorkspaceOpenResponse> => {
		const result = await dialog.showOpenDialog({
			properties: ['openDirectory']
		});
		return { path: result.canceled ? null : result.filePaths[0] ?? null };
	});

	workspaceIndexChannel.handle(
		async (request: WorkspaceIndexRequest): Promise<WorkspaceIndexResponse> => {
			const index = await workspaceService.indexWorkspace(request.root);
			return { files: index.files };
		}
	);

	workspaceContextChannel.handle(
		async (request: WorkspaceContextRequest): Promise<WorkspaceContextResponse> => {
			return await workspaceService.getWorkspaceContext(request.root);
		}
	);

	workspaceGraphChannel.handle(
		async (request: WorkspaceGraphRequest): Promise<WorkspaceGraphResponse> => {
			const graph = await workspaceService.buildImportGraph(request.files);
			return { graph };
		}
	);

	workspaceDiscoverRelatedChannel.handle(
		async (
			request: WorkspaceDiscoverRelatedRequest
		): Promise<WorkspaceDiscoverRelatedResponse> => {
			const files = await workspaceService.discoverRelatedFiles(
				request.graph,
				request.file,
				request.depth
			);
			return { files };
		}
	);

	// File system channels
	fileSystemGetTreeChannel.handle(
		async (request: FileSystemGetTreeRequest): Promise<FileSystemGetTreeResponse> => {
			const nodes = await fileService.getRootTree(request.rootPath);
			return { nodes };
		}
	);

	fileSystemExpandChannel.handle(
		async (request: FileSystemExpandRequest): Promise<FileSystemExpandResponse> => {
			const nodes = await fileService.expandFolder(request.folderPath);
			return { nodes };
		}
	);

	fileSystemGetStatsChannel.handle(
		async (request: FileSystemGetStatsRequest): Promise<FileSystemGetStatsResponse> => {
			const stats = fileService.getStats(request.filePath);
			if (!stats) {
				throw new Error(`File not found: ${request.filePath}`);
			}
			return { stats };
		}
	);

	// File operation channels
	fileReadChannel.handle(async (request: FileReadRequest): Promise<FileReadResponse> => {
		const content = await fileService.readFile(request.path);
		return { content };
	});

	fileReadBatchChannel.handle(
		async (request: FileReadBatchRequest): Promise<FileReadBatchResponse> => {
			const contents = await fileService.readFileBatch(request.paths);
			return { contents };
		}
	);

	fileWriteChannel.handle(async (request: FileWriteRequest): Promise<FileWriteResponse> => {
		await fileService.writeFile(request.path, request.content);
		return { success: true };
	});

	fileCreateChannel.handle(async (request: FileCreateRequest): Promise<FileCreateResponse> => {
		await fileService.createFile(request.filePath, request.content, request.workspaceRoot);
		return { success: true };
	});

	fileDeleteChannel.handle(async (request: FileDeleteRequest): Promise<FileDeleteResponse> => {
		await fileService.deleteFile(request.path);
		return { success: true };
	});

	// Patch/Agent channels
	patchApplyChannel.handle(async (request: PatchApplyRequest): Promise<PatchApplyResponse> => {
		const { parseUnifiedDiff } = await import('../utils/patchParser');
		const { applyPatches } = await import('../utils/patchApply');
		const patches = parseUnifiedDiff(request.diff);
		applyPatches(patches);
		return { success: true };
	});

	agentRunChannel.handle(async (request: AgentRunRequest): Promise<AgentRunResponse> => {
		const result = await agentService.runAgent(request.agentName, request.payload);
		return { result };
	});

	// Git channels
	gitInitChannel.handle(async (request) => {
		const success = await gitService.init(request.root);
		return { success };
	});

	gitStatusChannel.handle(async (request) => {
		const status = await gitService.status(request.root);
		return { status };
	});

	gitAddChannel.handle(async (request) => {
		const success = await gitService.add(request.root, request.file);
		return { success };
	});

	gitResetChannel.handle(async (request) => {
		const success = await gitService.reset(request.root, request.file);
		return { success };
	});

	gitCommitChannel.handle(async (request) => {
		const success = await gitService.commit(request.root, request.message);
		return { success };
	});

	gitDiffChannel.handle(async (request) => {
		const diff = await gitService.diff(request.root, request.file);
		return { diff };
	});

	gitDiffStagedChannel.handle(async (request) => {
		const diff = await gitService.diffStaged(request.root, request.file);
		return { diff };
	});

	gitBranchesChannel.handle(async (request) => {
		const branches = await gitService.branches(request.root);
		return { branches };
	});

	gitCheckoutChannel.handle(async (request) => {
		const success = await gitService.checkout(request.root, request.branch);
		return { success };
	});

	gitCreateBranchChannel.handle(async (request) => {
		const success = await gitService.createBranch(request.root, request.branch);
		return { success };
	});

	gitPushChannel.handle(async (request) => {
		const success = await gitService.push(request.root);
		return { success };
	});

	gitPullChannel.handle(async (request) => {
		const success = await gitService.pull(request.root);
		return { success };
	});

	gitAddRemoteChannel.handle(async (request) => {
		const success = await gitService.addRemote(request.root, request.name, request.url);
		return { success };
	});

	gitRemoteListChannel.handle(async (request) => {
		const remotes = await gitService.remoteList(request.root);
		return { remotes };
	});

	// TypeScript channels
	const tsService = instantiationService.get(ITypeScriptService);

	typeScriptStartChannel.handle(async (request) => {
		const success = await tsService.start(request.workspaceRoot);
		return { success };
	});

	typeScriptSendChannel.handle(async (request) => {
		try {
			const result = await tsService.sendRequest(request.command, request.args);
			return { result };
		} catch (error: unknown) {
			console.error('[TS] Error sending command:', error);
			return { result: null };
		}
	});

	// TypeScript service channels
	typeScriptGetCompletionsChannel.handle(async (request) => {
		const completions = await tsService.getCompletions(request.file, request.line, request.offset);
		return { completions };
	});

	typeScriptGetDiagnosticsChannel.handle(async (request) => {
		const diagnostics = await tsService.getDiagnostics(request.files);
		return { diagnostics };
	});

	typeScriptGetQuickInfoChannel.handle(async (request) => {
		const quickInfo = await tsService.getQuickInfo(request.file, request.line, request.offset);
		return { quickInfo: quickInfo ?? null };
	});

	typeScriptGetDocumentSymbolsChannel.handle(async (request) => {
		const symbols = await tsService.getDocumentSymbols(request.file);
		return { symbols };
	});

	typeScriptFormatDocumentChannel.handle(async (request) => {
		const edits = await tsService.formatDocument(request.file, request.options);
		return { edits };
	});

	typeScriptNavigateToDefinitionChannel.handle(async (request) => {
		const locations = await tsService.navigateToDefinition(request.file, request.line, request.offset);
		return { locations };
	});

	typeScriptRenameSymbolChannel.handle(async (request) => {
		const renameInfo = await tsService.renameSymbol(
			request.file,
			request.line,
			request.offset,
			request.newName
		);
		return { renameInfo: renameInfo ?? null };
	});

	// GitHub channels
	const { githubService } = await import('./services/githubService');

	gitHubSaveTokenChannel.handle(async (request) => {
		githubService.saveToken(request.token);
		return { success: true };
	});

	gitHubGetUserChannel.handle(async () => {
		const user = await githubService.getUser();
		return { user: user ?? null };
	});

	gitHubCreateRepoChannel.handle(async (request) => {
		const repo = await githubService.createRepo(request.name, request.description, request.private);
		return { success: true, repo };
	});

	gitHubCreatePullRequestChannel.handle(async (request) => {
		const args = request.args as {
			owner: string;
			repo: string;
			title: string;
			body: string;
			head: string;
			base: string;
		};
		const pr = await githubService.createPullRequest(
			args.owner,
			args.repo,
			args.title,
			args.body,
			args.head,
			args.base
		);
		return { success: true, pr };
	});

	// File system change events
	fileService.onDidChangeFile((event) => {
		if (rendererReady && mainWindow && !mainWindow.isDestroyed()) {
			fileSystemChangeChannel.fire(event);
		}
	});
}

// ============================================================================
// Global Shortcuts
// ============================================================================

function registerShortcuts(): void {
	if (!mainWindow) {
		return;
	}

	const bind = (key: string, channel: string): void => {
		globalShortcut.register(key, () => {
			mainWindow?.webContents.send(channel);
		});
	};

	bind('Control+S', IpcChannel.ShortcutSave);
	bind('Control+O', IpcChannel.ShortcutOpenWorkspace);
	bind('Control+Shift+P', IpcChannel.ShortcutCommandPalette);
	bind('Control+P', IpcChannel.ShortcutQuickSearch);
	bind('Control+F', IpcChannel.ShortcutFind);
	bind('Control+H', IpcChannel.ShortcutReplace);
	bind('Control+Shift+F', IpcChannel.ShortcutGlobalSearch);
}

// ============================================================================
// LLM Process
// ============================================================================

function startLLM(): void {
	try {
		const nodePath = 'C:\\Program Files\\nodejs\\node.exe';
		if (!require('fs').existsSync(nodePath)) {
			console.warn('System Node not found:', nodePath);
			return;
		}
		const serverPath = path.join(app.getAppPath(), 'llm', 'server.js');
		llmProcess = spawn(nodePath, [serverPath], {
			cwd: path.join(app.getAppPath(), 'llm'),
			stdio: 'inherit'
		});
	} catch (err) {
		console.error('LLM startup error:', err);
	}
}

// ============================================================================
// App Initialization
// ============================================================================

app.whenReady().then(async () => {
	try {
		startLLM();
		createWindow();
		registerShortcuts();
		await registerIpcHandlers();
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		console.error('[CRITICAL] Error during app initialization:', err);
	}
});

app.on('window-all-closed', () => {
	llmProcess?.kill();
	app.quit();
});
