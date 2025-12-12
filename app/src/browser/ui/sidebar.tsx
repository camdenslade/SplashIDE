/**
 * Sidebar Component
 * 
 * VS Code-style sidebar for file explorer.
 * Uses service injection instead of direct window.splash calls.
 * 
 * @remarks
 * This component provides the file tree explorer in the sidebar area.
 * It uses IFileService and IWorkspaceService for all operations.
 */

import React, { useCallback, lazy, Suspense, useEffect, useState } from 'react';
import { useService } from '../hooks/useService';
import { IFileService, IWorkspaceService } from '../../common/models/services';
import { ErrorBoundary } from './errorBoundary';
import { IWorkspaceFolder } from '../../common/types/workspace';
import { toFileURI } from '../../common/utils/path';

const FileTree = lazy(() => import('./fileTree').then(module => ({ default: module.FileTree })));
const WorkspaceFolderManager = lazy(() => import('./workspaceFolderManager').then(module => ({ default: module.default })));
const OpenEditors = lazy(() => import('./openEditors').then(module => ({ default: module.default })));

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
	/** Current workspace root path, or null if no workspace is open */
	workspace: string | null;
	/** Currently active/selected file path */
	activeFile: string | null;
	/** Callback when a file is opened */
	onOpenFile: (path: string, content: string | null) => void;
	/** Callback when workspace changes */
	onWorkspaceChange: (ws: string | null) => void;
}

/**
 * Sidebar component for file explorer.
 * 
 * @param props - Component props
 * @returns Sidebar JSX element
 */
export default function Sidebar({
	workspace,
	activeFile,
	onOpenFile,
	onWorkspaceChange
}: SidebarProps): React.ReactElement {
	const fileService = useService(IFileService);
	const workspaceService = useService(IWorkspaceService);
	const [workspaceFolders, setWorkspaceFolders] = useState<IWorkspaceFolder[]>([]);

	// Load workspace folders
	useEffect(() => {
		setWorkspaceFolders([...workspaceService.getWorkspaceFolders()]);

		const disposable = workspaceService.onDidChangeWorkspaceFolders(() => {
			setWorkspaceFolders([...workspaceService.getWorkspaceFolders()]);
		});

		return () => {
			disposable.dispose();
		};
	}, [workspaceService]);

	const chooseWorkspace = useCallback(async () => {
		try {
			const selected = await workspaceService.openWorkspace();
			if (selected) {
				onWorkspaceChange(selected);
			}
		} catch (err: unknown) {
			console.error('Failed to choose workspace', err);
		}
	}, [onWorkspaceChange, workspaceService]);

	const closeWorkspace = useCallback(async () => {
		try {
			// Remove all workspace folders
			const folders = workspaceService.getWorkspaceFolders();
			for (const folder of folders) {
				await workspaceService.removeWorkspaceFolder(folder.uri);
			}
			// Clear the workspace state
			onWorkspaceChange(null);
		} catch (err: unknown) {
			console.error('Failed to close workspace', err);
		}
	}, [workspaceService, onWorkspaceChange]);

	const handleFileSelect = useCallback(
		async (path: string) => {
			try {
				// Check if it's a file before trying to read it
				const stats = fileService.getStats(path);
				if (stats) {
					if (!stats.isFile || stats.isDirectory) {
						// It's a directory, don't try to open it
						console.log('Cannot open directory in editor:', path);
						return;
					}
				}
				// If stats is undefined, try to read anyway (might be a new file or permission issue)
				const fileUri = toFileURI(path);
				const content = await fileService.readFile(fileUri.toString());
				onOpenFile(path, content);
			} catch (err: unknown) {
				console.error('Error opening file', err);
				// Show user-friendly error message
				if (err instanceof Error) {
					console.error(`Failed to open file: ${path} - ${err.message}`);
				}
			}
		},
		[onOpenFile, fileService]
	);

	return (
		<ErrorBoundary>
			<div className="sidebar">
				<div className="sidebar-header">
					<h3>Explorer</h3>
				</div>

				<div className="sidebar-content">
					<Suspense fallback={null}>
						<WorkspaceFolderManager visible={true} />
					</Suspense>

					<Suspense fallback={null}>
						<OpenEditors
							activeEditor={activeFile || undefined}
							onEditorSelect={async (path) => {
								const fileUri = toFileURI(path);
								const content = await fileService.readFile(fileUri.toString());
								onOpenFile(path, content);
							}}
						/>
					</Suspense>

					{workspaceFolders.length === 0 && !workspace && (
						<button onClick={chooseWorkspace}>Open Folder</button>
					)}

					{(workspaceFolders.length > 0 || workspace) && (
						<button
							onClick={closeWorkspace}
							style={{
								marginTop: '8px',
								padding: '4px 8px',
								background: '#3c3c3c',
								color: 'white',
								border: 'none',
								borderRadius: '3px',
								cursor: 'pointer',
								fontSize: '12px'
							}}
						>
							Close Workspace
						</button>
					)}

					{workspaceFolders.length > 0 && (
						<>
							{workspaceFolders.map((folder) => (
								<ErrorBoundary
									key={folder.uri.toString()}
									fallback={
										<div style={{ padding: '12px', color: '#f48771' }}>
											<div>Error loading file tree for {folder.name}</div>
										</div>
									}
								>
									<div style={{ marginBottom: '16px' }}>
										<div
											style={{
												padding: '4px 8px',
												fontSize: '11px',
												fontWeight: 'bold',
												color: '#858585',
												textTransform: 'uppercase',
												letterSpacing: '0.5px'
											}}
										>
											{folder.name}
										</div>
										<Suspense
											fallback={
												<div style={{ padding: '8px', color: '#858585' }}>
													Loading file tree...
												</div>
											}
										>
											<FileTree
												rootPath={
													folder.uri.scheme === 'file'
														? (() => {
																try {
																	return folder.uri.fsPath();
																} catch {
																	return folder.uri.path;
																}
															})()
														: folder.uri.path || folder.uri.toString()
												}
												activeFile={activeFile}
												onFileSelect={handleFileSelect}
												onFileOpen={onOpenFile}
												className="sidebar-tree"
											/>
										</Suspense>
									</div>
								</ErrorBoundary>
							))}
						</>
					)}

					{/* Legacy single workspace support (for backward compatibility) */}
					{workspace && workspaceFolders.length === 0 && (
						<>
							<p className="workspace-path">{workspace}</p>

							<ErrorBoundary
								fallback={
									<div style={{ padding: '12px', color: '#f48771' }}>
										<div>Error loading file tree</div>
										<button
											onClick={() => window.location.reload()}
											style={{
												marginTop: '8px',
												padding: '4px 8px',
												background: '#0e639c',
												color: 'white',
												border: 'none',
												borderRadius: '3px',
												cursor: 'pointer'
											}}
										>
											Reload
										</button>
									</div>
								}
							>
								<Suspense
									fallback={
										<div style={{ padding: '8px', color: '#858585' }}>
											Loading file tree...
										</div>
									}
								>
									<FileTree
										rootPath={workspace}
										activeFile={activeFile}
										onFileSelect={handleFileSelect}
										onFileOpen={onOpenFile}
										className="sidebar-tree"
									/>
								</Suspense>
							</ErrorBoundary>
						</>
					)}
				</div>
			</div>
		</ErrorBoundary>
	);
}
