//********************************************************************
//
// AgentResult Interface
//
// Interface representing the result of an agent execution. Contains
// intent, summary, diff content, new files, deleted files, and any
// additional agent-specific properties.
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

import React, { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import { getInstantiationService } from '../bootstrap';
import {
	IFileService,
	IWorkspaceService,
	ICommandService,
	IEditorService,
	IKeybindingService
} from '../../common/models/services';
import { WorkspaceContext } from '../../common/models/services';
import { ICommand } from '../../common/models/services';
import { ErrorBoundary } from '../ui/errorBoundary';
import { URI } from '../../common/types/uri';
import { getContextMenuService, IContextMenuItem } from '../services/contextMenuService';
import { toFileURI, toURI } from '../../common/utils/path';

const MonacoEditor = lazy(() => import('../ui/monacoEditor'));
const ChatPanel = lazy(() => import('../panels/chatPanel'));
const ReviewPanel = lazy(() => import('../panels/reviewPanel'));
const CommandPalette = lazy(() => import('../ui/commandPalette'));
const QuickSearch = lazy(() => import('../ui/quickSearch'));
const Sidebar = lazy(() => import('../ui/sidebar'));
const LogViewer = lazy(() => import('../ui/logViewer'));
const EditorTabs = lazy(() => import('../ui/editorTabs'));

/**
 * Gets Monaco language ID from file path extension.
 */
function getLanguageFromPath(filePath: string): string {
	const ext = filePath.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'ts': return 'typescript';
		case 'tsx': return 'typescript';
		case 'js': return 'javascript';
		case 'jsx': return 'javascript';
		case 'json': return 'json';
		case 'css': return 'css';
		case 'html': return 'html';
		case 'md': return 'markdown';
		case 'py': return 'python';
		case 'java': return 'java';
		case 'cpp': case 'cc': case 'cxx': return 'cpp';
		case 'c': return 'c';
		case 'go': return 'go';
		case 'rs': return 'rust';
		case 'php': return 'php';
		case 'rb': return 'ruby';
		case 'xml': return 'xml';
		case 'yaml': case 'yml': return 'yaml';
		default: return 'plaintext';
	}
}

export interface AgentResult {
	intent?: string;
	summary?: string;
	diff?: string;
	newFiles?: Record<string, string>;
	deleted?: string[];
	[key: string]: unknown;
}

//********************************************************************
//
// Workbench Function Component
//
// VS Code-style workbench root component. Main UI container with
// activity bar, sidebar, editor area, and panels. Orchestrates all
// UI elements using service injection for all operations and manages
// workspace state. Follows VS Code's workbench layout with activity
// bar (left), sidebar (file explorer), editor area (center), and
// panels (bottom: chat, review).
//
// Return Value
// ------------
// React.ReactElement    The rendered workbench component
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
// instantiationService    InstantiationService        Service container
// fileService             IFileService                File service instance
// workspaceService        IWorkspaceService           Workspace service instance
// commandService          ICommandService             Command service instance
// editorService           IEditorService              Editor service instance
// keybindingService       IKeybindingService          Keybinding service instance
// workspace               string|null                 Current workspace path
// workspaceFiles          string[]                    Array of workspace file paths
// importGraph             Record<string, string[]>    Graph of file imports
// workspaceContext        WorkspaceContext|null       Workspace context information
// filePath                string|null                 Currently open file path
// fileContent             string                      Currently open file content
// paletteOpen             boolean                     Command palette visibility
// searchOpen              boolean                     Quick search visibility
// logViewerOpen           boolean                     Log viewer visibility
// agentResult             AgentResult|null            Result from agent execution
//
//*******************************************************************

export default function Workbench(): React.ReactElement {
	const instantiationService = getInstantiationService();
	const fileService = instantiationService.get(IFileService);
	const workspaceService = instantiationService.get(IWorkspaceService);
	const commandService = instantiationService.get(ICommandService);
	const editorService = instantiationService.get(IEditorService);
	// TypeScript service - reserved for future use
	// const _typeScriptService = instantiationService.get(ITypeScriptService);
	const keybindingService = instantiationService.get(IKeybindingService);

	const [workspace, setWorkspace] = useState<string | null>(null);
	const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([]);
	const [importGraph, setImportGraph] = useState<Record<string, string[]>>({});
	const [workspaceContext, setWorkspaceContext] = useState<WorkspaceContext | null>(null);

	const [filePath, setFilePath] = useState<string | null>(null);
	const [fileContent, setFileContent] = useState<string>('');

	const [paletteOpen, setPaletteOpen] = useState<boolean>(false);
	const [searchOpen, setSearchOpen] = useState<boolean>(false);
	const [logViewerOpen, setLogViewerOpen] = useState<boolean>(false);

	const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
	
	// Memoize service access to prevent unnecessary re-renders (currently unused but kept for future use)
	// const services = useMemo(() => ({
	// 	fileService,
	// 	workspaceService,
	// 	commandService,
	// 	editorService,
	// 	typeScriptService,
	// 	keybindingService
	// }), [fileService, workspaceService, commandService, editorService, typeScriptService, keybindingService]);

	// ============================================================================
	// Helper Functions - Defined BEFORE useEffect hooks and JSX
	// ============================================================================

	const openFile = useCallback(async (path: string, content: string | null): Promise<void> => {
		const uri = toFileURI(path);
		setFilePath(path);
		setFileContent(content ?? '');
		await editorService.openEditor(uri.toString(), content ?? undefined);
	}, [editorService]);

	const openFileByPath = useCallback(async (path: string): Promise<void> => {
		const uri = toFileURI(path);
		const text = await fileService.readFile(uri.toString());
		await openFile(path, text);
	}, [fileService, openFile]);

	const save = useCallback(async (content: string): Promise<void> => {
		if (!filePath) {
			return;
		}
		await fileService.writeFile(filePath, content);
		setFileContent(content);
		editorService.setDirty(filePath, false);
	}, [filePath, fileService, editorService]);

	const closeEditor = useCallback(async (uri: string): Promise<void> => {
		await editorService.closeEditor(uri);
		if (filePath === uri) {
			setFilePath(null);
			setFileContent('');
		}
	}, [filePath, editorService]);

	const closeOtherEditors = useCallback(async (uri: string): Promise<void> => {
		if (filePath && filePath !== uri) {
			await editorService.closeEditor(filePath);
			setFilePath(null);
			setFileContent('');
		}
	}, [filePath, editorService]);

	const closeRightEditors = useCallback(async (uri: string): Promise<void> => {
		// Stub - would close editors to the right in tab order
		console.log('Close editors to the right of:', uri);
	}, []);

	const closeAllEditors = useCallback(async (): Promise<void> => {
		if (filePath) {
			await editorService.closeEditor(filePath);
			setFilePath(null);
			setFileContent('');
		}
	}, [filePath, editorService]);

	const applyChanges = useCallback(async (
		_diff: string,
		newFiles: Record<string, string>,
		deleted: string[]
	): Promise<void> => {
		try {
			for (const [fp, text] of Object.entries(newFiles)) {
				await fileService.createFile(fp, text, workspace ?? '');
			}

			for (const f of deleted) {
				await fileService.deleteFile(f);
			}

			if (filePath) {
				const fileUri = toFileURI(filePath);
				const fresh = await fileService.readFile(fileUri.toString());
				setFileContent(fresh);
				editorService.setDirty(filePath, false);
			}

			if (workspace) {
				const index = await workspaceService.indexWorkspace(workspace);
				setWorkspaceFiles(index.files);

				const graph = await workspaceService.buildImportGraph(index.files);
				setImportGraph(graph);

				const ctx = await workspaceService.getWorkspaceContext(workspace);
				setWorkspaceContext(ctx);
			}

			setAgentResult(null);
		} catch (error: unknown) {
			console.error('Error applying changes:', error);
		}
	}, [fileService, workspaceService, editorService, workspace, filePath]);

	// ============================================================================
	// useEffect Hooks
	// ============================================================================

	// Register commands
	useEffect(() => {
		const commands: ICommand[] = [
			{
				id: 'workspace.open',
				title: 'Open Workspace',
				handler: {
					execute: async () => {
						const path = await workspaceService.openWorkspace();
						if (path) {
							setWorkspace(path);
						}
					}
				}
			},
			{
				id: 'file.save',
				title: 'Save File',
				handler: {
					execute: async () => {
						if (!filePath) {
							return;
						}
						await fileService.writeFile(filePath, fileContent);
						editorService.setDirty(filePath, false);
					}
				}
			},
			{
				id: 'file.search',
				title: 'Search Files',
				handler: {
					execute: () => {
						setSearchOpen(true);
					}
				}
			},
			{
				id: 'developer.showLogs',
				title: 'Show Logs',
				handler: {
					execute: () => {
						setLogViewerOpen(true);
					}
				}
			},
			{
				id: 'workspace.addFolder',
				title: 'Add Folder to Workspace',
				handler: {
					execute: async () => {
						const path = await workspaceService.openWorkspace();
						if (path) {
							const uri = URI.file(path);
							await workspaceService.addWorkspaceFolder(uri);
						}
					}
				}
			},
			{
				id: 'workspace.removeFolder',
				title: 'Remove Folder from Workspace',
				handler: {
					execute: async (uriString: string) => {
						const folderUri = toURI(uriString);
						await workspaceService.removeWorkspaceFolder(folderUri);
					}
				}
			},
			{
				id: 'workspace.addRemoteFolder',
				title: 'Add Remote Workspace Folder',
				handler: {
					execute: async () => {
						// Stub for remote folder addition
						console.log('Add remote folder (stub)');
					}
				}
			},
			// File Commands
			{
				id: 'file.open',
				title: 'Open File',
				handler: {
					execute: async (uriString: string) => {
						const uri = toURI(uriString);
						const content = await fileService.readFile(uri.toString());
						// Convert URI back to path for openFile
						const fsPath = uri.fsPath();
						await openFile(fsPath, content);
					}
				}
			},
			{
				id: 'file.openToSide',
				title: 'Open File to the Side',
				handler: {
					execute: async (uriString: string) => {
						// For now, just open normally (split editor not implemented)
						const uri = toURI(uriString);
						const content = await fileService.readFile(uri.toString());
						const fsPath = uri.fsPath();
						await openFile(fsPath, content);
					}
				}
			},
			{
				id: 'file.reveal',
				title: 'Reveal in File Explorer',
				handler: {
					execute: async (uriString: string) => {
						// Stub - would open system file explorer
						const uri = toURI(uriString);
						const path = uri.fsPath();
						console.log('Reveal in file explorer:', path);
					}
				}
			},
			{
				id: 'file.copyPath',
				title: 'Copy Path',
				handler: {
					execute: async (uriString: string) => {
						// Copy to clipboard
						if (navigator.clipboard) {
							await navigator.clipboard.writeText(uriString);
						}
					}
				}
			},
			{
				id: 'file.rename',
				title: 'Rename File',
				handler: {
					execute: async (uriString: string) => {
						// Stub - would show rename dialog
						const uri = toURI(uriString);
						const oldPath = uri.fsPath();
						const newName = prompt('Enter new name:', oldPath.split(/[/\\]/).pop());
						if (newName) {
							const newPath = oldPath.replace(/[^/\\]+$/, newName);
							const content = await fileService.readFile(uri.toString());
							await fileService.writeFile(newPath, content);
							await fileService.deleteFile(oldPath);
							if (filePath === oldPath) {
								await openFile(newPath, content);
							}
						}
					}
				}
			},
			{
				id: 'file.delete',
				title: 'Delete File',
				handler: {
					execute: async (uriString: string) => {
						const uri = toURI(uriString);
						const path = uri.fsPath();
						if (confirm(`Delete ${path}?`)) {
							await fileService.deleteFile(path);
							if (filePath === path) {
								setFilePath(null);
								setFileContent('');
							}
						}
					}
				}
			},
			{
				id: 'file.newFile',
				title: 'New File',
				handler: {
					execute: async (parentPathUriString: string) => {
						const parentUri = toURI(parentPathUriString);
						const parentPath = parentUri.fsPath();
						const fileName = prompt('Enter file name:');
						if (fileName) {
							const newPath = `${parentPath}/${fileName}`;
							await fileService.writeFile(newPath, '');
							const newUri = toFileURI(newPath);
							const content = await fileService.readFile(newUri.toString());
							await openFile(newPath, content);
						}
					}
				}
			},
			{
				id: 'file.newFolder',
				title: 'New Folder',
				handler: {
					execute: async (parentPath: string) => {
						const folderName = prompt('Enter folder name:');
						if (folderName) {
							// Stub - would create directory
							console.log('Create folder:', `${parentPath}/${folderName}`);
						}
					}
				}
			},
			// Editor Commands
			{
				id: 'editor.close',
				title: 'Close Editor',
				handler: {
					execute: async (uriString: string) => {
						const uri = toURI(uriString);
						const path = uri.fsPath();
						await closeEditor(path);
					}
				}
			},
			{
				id: 'editor.closeOthers',
				title: 'Close Other Editors',
				handler: {
					execute: async (uriString: string) => {
						const uri = toURI(uriString);
						const path = uri.fsPath();
						await closeOtherEditors(path);
					}
				}
			},
			{
				id: 'editor.closeAll',
				title: 'Close All Editors',
				handler: {
					execute: async () => {
						await closeAllEditors();
					}
				}
			},
			{
				id: 'editor.closeRight',
				title: 'Close Editors to the Right',
				handler: {
					execute: async (uriString: string) => {
						const uri = toURI(uriString);
						const path = uri.fsPath();
						await closeRightEditors(path);
					}
				}
			},
			{
				id: 'editor.goToDefinition',
				title: 'Go to Definition',
				handler: {
					execute: async () => {
						// Stub - would use TypeScript service
						// Would need filePath as URI
						if (filePath) {
							const uri = toFileURI(filePath);
							console.log('Go to definition', uri.toString());
						}
					}
				}
			},
			{
				id: 'editor.renameSymbol',
				title: 'Rename Symbol',
				handler: {
					execute: async () => {
						// Stub - would use TypeScript service
						// Would need filePath as URI
						if (filePath) {
							const uri = toFileURI(filePath);
							console.log('Rename symbol', uri.toString());
						}
					}
				}
			},
			{
				id: 'editor.format',
				title: 'Format Document',
				handler: {
					execute: async () => {
						// Stub - would format the document
						console.log('Format document');
					}
				}
			}
		];

		const disposables = commands.map((cmd) => commandService.registerCommand(cmd));

		return () => {
			for (const disposable of disposables) {
				disposable.dispose();
			}
		};
	}, [filePath, fileContent, fileService, workspaceService, commandService, editorService, openFile, closeEditor, closeOtherEditors, closeAllEditors, closeRightEditors, setFilePath, setFileContent]);

	// Register keybindings
	useEffect(() => {
		const keybindings = [
			{
				key: 'Control+P',
				command: 'file.search'
			},
			{
				key: 'Control+Shift+P',
				command: 'workbench.action.showCommands'
			},
			{
				key: 'Control+S',
				command: 'file.save'
			},
			{
				key: 'Escape',
				command: 'workbench.action.closeModal',
				when: 'paletteOpen || searchOpen'
			}
		];

		const disposables = keybindings.map((kb) => keybindingService.registerKeybinding(kb));

		return () => {
			for (const disposable of disposables) {
				disposable.dispose();
			}
		};
	}, [keybindingService]);

	// Update context keys (if IKeybindingService supports it in the future)
	// useEffect(() => {
	// 	keybindingService.setContextKey('paletteOpen', paletteOpen);
	// 	keybindingService.setContextKey('searchOpen', searchOpen);
	// }, [keybindingService, paletteOpen, searchOpen]);

	// Register close modal command
	useEffect(() => {
		const disposable = commandService.registerCommand({
			id: 'workbench.action.closeModal',
			title: 'Close Modal',
			handler: {
				execute: () => {
					if (paletteOpen) {
						setPaletteOpen(false);
					}
					if (searchOpen) {
						setSearchOpen(false);
					}
				}
			}
		});

		return () => {
			disposable.dispose();
		};
	}, [commandService, paletteOpen, searchOpen]);

	// Register command for command palette
	useEffect(() => {
		const disposable = commandService.registerCommand({
			id: 'workbench.action.showCommands',
			title: 'Show Command Palette',
			handler: {
				execute: () => {
					setPaletteOpen(true);
				}
			}
		});

		return () => {
			disposable.dispose();
		};
	}, [commandService]);

	// Handle keyboard events for keybindings
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Build key string
			const parts: string[] = [];
			if (e.ctrlKey || e.metaKey) {
				parts.push('Control');
			}
			if (e.shiftKey) {
				parts.push('Shift');
			}
			if (e.altKey) {
				parts.push('Alt');
			}
			parts.push(e.key);

			const key = parts.join('+');
			keybindingService.executeKeybinding(key).catch((err: unknown) => {
				console.error('Error executing keybinding:', err);
			});
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [keybindingService]);

	// Register shortcut handlers (legacy - will be removed)
	useEffect(() => {
		if (typeof window === 'undefined' || !window.splash) {
			return;
		}

		const disposables: Array<() => void> = [];

		// Note: onCommandPalette and onQuickSearch are not yet implemented in SplashIPC
		// These would need to be added to the IPC interface if needed
		// disposables.push(
		// 	window.splash.onCommandPalette(() => {
		// 		setPaletteOpen(true);
		// 	})
		// );

		// disposables.push(
		// 	window.splash.onQuickSearch(() => {
		// 		setSearchOpen(true);
		// 	})
		// );

		return () => {
			for (const dispose of disposables) {
				dispose();
			}
		};
	}, []);

	// Lazy TypeScript server initialization - only start when TS file is opened
	// This improves startup time significantly
	// const tsServerStartedRef = useRef(false);

	// Load workspace when it changes
	useEffect(() => {
		if (!workspace) {
			// Clear workspace-related state when workspace is closed
			setWorkspaceFiles([]);
			setImportGraph({});
			setWorkspaceContext(null);
			setFilePath(null);
			setFileContent('');
			return;
		}

		const load = async (): Promise<void> => {
			try {
				// Ensure workspace is added as a folder (if not already)
				const folders = workspaceService.getWorkspaceFolders();
				const workspaceUri = URI.file(workspace);
				const exists = folders.some((f) => f.uri.toString() === workspaceUri.toString());
				if (!exists) {
					await workspaceService.addWorkspaceFolder(workspaceUri);
				}

				// Don't start TS server here - lazy load when TS file is opened
				// This improves startup time

				// Load workspace context
				const ctx = await workspaceService.getWorkspaceContext(workspace);
				setWorkspaceContext(ctx);

				// Index workspace
				const index = await workspaceService.indexWorkspace(workspace);
				setWorkspaceFiles(index.files);

				// Build import graph
				const graph = await workspaceService.buildImportGraph(index.files);
				setImportGraph(graph);
			} catch (error: unknown) {
				console.error('Error loading workspace:', error);
			}
		};

		void load();
	}, [workspace, workspaceService]);

	const importGraphSafe = importGraph;
	const workspaceContextSafe =
		workspaceContext ??
		({
			root: workspace ?? '',
			files: [],
			contents: {},
			graph: {}
		} as WorkspaceContext);

	return (
		<ErrorBoundary>
			<div className="layout">
				{/* Activity Bar */}
				<div className="activity-bar">
					<div className="activity-bar-item active" title="Explorer">
						<svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
							<path d="M2 2v12h12V2H2zm1 1h10v10H3V3zm1 1v8h8V4H4zm1 1h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z" />
						</svg>
					</div>
				</div>

				<Suspense fallback={<div>Loading sidebar...</div>}>
					<Sidebar
						workspace={workspace}
						activeFile={filePath}
						onWorkspaceChange={setWorkspace}
						onOpenFile={openFile}
					/>
				</Suspense>

				<div className="editor-container">
					<Suspense fallback={null}>
						<EditorTabs
							activeEditor={filePath || undefined}
							onEditorSelect={async (path) => {
								const uri = toFileURI(path);
								const content = await fileService.readFile(uri.toString());
								await openFile(path, content);
							}}
							onEditorClose={closeEditor}
						/>
					</Suspense>
					<div
						className="editor-area"
						onContextMenu={(e) => {
							e.preventDefault();
							const contextMenuService = getContextMenuService();
							const items: IContextMenuItem[] = [
								{
									id: 'commandPalette',
									label: 'Command Palette…',
									command: 'workbench.action.showCommands'
								},
								{ id: 'separator1', label: '', separator: true, command: '' },
								{
									id: 'format',
									label: 'Format Document',
									command: 'editor.format',
									enabled: !!filePath
								},
								{
									id: 'goToDefinition',
									label: 'Go to Definition',
									command: 'editor.goToDefinition',
									enabled: !!filePath
								},
								{
									id: 'renameSymbol',
									label: 'Rename Symbol',
									command: 'editor.renameSymbol',
									enabled: !!filePath
								}
							];
							contextMenuService.showMenu(e.nativeEvent, items);
						}}
					>
						{filePath ? (
							<Suspense
								fallback={
									<div className="editor-empty">
										<div className="editor-empty-icon">⟳</div>
										<div>Loading editor...</div>
									</div>
								}
							>
								<MonacoEditor 
									value={fileContent} 
									language={filePath ? getLanguageFromPath(filePath) : 'typescript'} 
									onChange={save} 
								/>
							</Suspense>
						) : (
							<div className="editor-empty">
								<div className="editor-empty-icon">📄</div>
								<div>No file open</div>
								<div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}>
									Open a workspace and select a file to start editing
								</div>
							</div>
						)}
					</div>
				</div>

				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						overflow: 'hidden'
					}}
				>
					<Suspense
						fallback={
							<div className="panel" style={{ flex: '1 1 0', minHeight: 0 }}>
								Loading...
							</div>
						}
					>
						<ChatPanel
							fileContent={fileContent}
							workspaceRoot={workspace}
							workspaceFiles={workspaceFiles}
							filePath={filePath}
							importGraph={importGraphSafe}
							workspaceContext={workspaceContextSafe}
							onAgentResult={setAgentResult}
						/>
					</Suspense>
					<Suspense
						fallback={
							<div className="panel" style={{ flex: '1 1 0', minHeight: 0 }}>
								Loading...
							</div>
						}
					>
						<ReviewPanel
							result={agentResult}
							onApplyPatch={applyChanges}
							onRejectPatch={() => setAgentResult(null)}
						/>
					</Suspense>
				</div>

				{paletteOpen && (
					<Suspense fallback={null}>
						<CommandPalette
							open={paletteOpen}
							onClose={() => setPaletteOpen(false)}
						/>
					</Suspense>
				)}

				{searchOpen && (
					<Suspense fallback={null}>
						<QuickSearch
							open={searchOpen}
							files={workspaceFiles}
							onSelect={openFileByPath}
							onClose={() => setSearchOpen(false)}
						/>
					</Suspense>
				)}

				{logViewerOpen && (
					<Suspense fallback={null}>
						<LogViewer
							open={logViewerOpen}
							onClose={() => setLogViewerOpen(false)}
						/>
					</Suspense>
				)}
			</div>
		</ErrorBoundary>
	);
}
