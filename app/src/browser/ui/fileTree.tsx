//********************************************************************
//
// FileTreeProps Interface
//
// Props for the FileTree component. Defines the root path, active file,
// and callbacks for file selection and opening.
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

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useService } from '../hooks/useService';
import { IFileService, IEditorService } from '../../common/models/services';
import { FileNode } from '../../common/messages/ipcMessages';
import { FolderIcon, FolderOpenIcon, FileTypeIcon } from './fileTreeIcons';
import { getContextMenuService, IContextMenuItem } from '../services/contextMenuService';
import { toFileURI } from '../../common/utils/path';

interface FileTreeProps {
	rootPath: string;
	activeFile: string | null;
	onFileSelect: (path: string) => void;
	onFileOpen?: (path: string, content: string | null) => void;
	className?: string;
}

//********************************************************************
//
// TreeNodeState Interface
//
// State for a tree node including expansion status, loading state,
// error information, and child nodes.
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

interface TreeNodeState {
	expanded: boolean;
	loading: boolean;
	error: string | null;
	children: FileNode[];
}

//********************************************************************
//
// FileTree Function Component
//
// VS Code-style file explorer component with lazy folder expansion.
// Uses IFileService for all file system operations. Provides keyboard
// navigation, error handling, and performance optimizations for large
// file trees.
//
// Return Value
// ------------
// React.ReactElement    The rendered file tree component
//
// Value Parameters
// ----------------
// rootPath      string                      Root path of the file tree
// activeFile    string|null                 Currently active/selected file path
// onFileSelect  (path: string) => void      Callback when a file is selected
// onFileOpen    (path, content) => void     Optional callback when a file should be opened
// className     string|undefined            Optional CSS class name
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// fileService           IFileService                    File service instance
// editorService         IEditorService                  Editor service instance
// contextMenuService    IContextMenuService             Context menu service instance
// tree                  FileNode[]                      Root tree nodes
// nodeStates            Map<string, TreeNodeState>      Map of node paths to their states
// focusedPath           string|null                     Currently focused path
// treeRef               React.RefObject<HTMLDivElement> Reference to tree DOM element
//
//*******************************************************************

export function FileTree({
	rootPath,
	activeFile,
	onFileSelect,
	onFileOpen,
	className
}: FileTreeProps): React.ReactElement {
	const fileService = useService(IFileService);
	const editorService = useService(IEditorService);
	const contextMenuService = getContextMenuService();
	const [tree, setTree] = useState<FileNode[]>([]);
	const [nodeStates, setNodeStates] = useState<Map<string, TreeNodeState>>(new Map());
	const [focusedPath] = useState<string | null>(null);
	const treeRef = useRef<HTMLDivElement>(null);

	// Load root tree
	useEffect(() => {
		if (!rootPath) {
			setTree([]);
			return;
		}

		let cancelled = false;

		fileService
			.getRootTree(rootPath)
			.then((nodes) => {
				if (!cancelled) {
					setTree(nodes);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					console.error('Error loading root tree:', err);
					setTree([]);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [rootPath, fileService]);

	// Toggle folder expansion
	const toggleFolder = useCallback(
		async (node: FileNode) => {
			if (node.type !== 'folder') {
				return;
			}

			const currentState = nodeStates.get(node.path);
			const isExpanded = currentState?.expanded ?? false;

			if (isExpanded) {
				// Collapse
				setNodeStates((prev) => {
					const next = new Map(prev);
					const state = next.get(node.path);
					if (state) {
						next.set(node.path, { ...state, expanded: false });
					}
					return next;
				});
			} else {
				// Expand - lazy load children
				setNodeStates((prev) => {
					const next = new Map(prev);
					next.set(node.path, {
						expanded: true,
						loading: true,
						error: null,
						children: []
					});
					return next;
				});

				try {
					if (!node.path || typeof node.path !== 'string') {
						throw new Error('Invalid folder path');
					}

					const children = await fileService.expandFolder(node.path);
					const validChildren = Array.isArray(children) ? children : [];

					setNodeStates((prev) => {
						const next = new Map(prev);
						next.set(node.path, {
							expanded: true,
							loading: false,
							error: null,
							children: validChildren
						});
						return next;
					});
				} catch (error: unknown) {
					console.error('Error expanding folder:', error);
					const errorMessage =
						error instanceof Error ? error.message : 'Failed to load folder';
					setNodeStates((prev) => {
						const next = new Map(prev);
						next.set(node.path, {
							expanded: true,
							loading: false,
							error: errorMessage,
							children: []
						});
						return next;
					});
				}
			}
		},
		[nodeStates, fileService]
	);

	// Render tree node
	const renderNode = useCallback(
		(node: FileNode, depth: number): React.ReactElement => {
		const state = nodeStates.get(node.path);
		const isExpanded = state?.expanded ?? false;
		const isLoading = state?.loading ?? false;
		const hasError = state?.error !== null && state?.error !== undefined;
			const isActive = activeFile === node.path;
			const isFocused = focusedPath === node.path;

			const handleClick = async () => {
				if (node.type === 'folder') {
					void toggleFolder(node);
				} else {
					// Use editorService to open file
					try {
						const fileUri = toFileURI(node.path);
						const content = await fileService.readFile(fileUri.toString());
						await editorService.openEditor(fileUri.toString(), content);
						// Call both callbacks if provided
						if (onFileOpen) {
							onFileOpen(node.path, content);
						}
						onFileSelect(node.path);
					} catch (error) {
						console.error('Error opening file:', error);
					}
				}
			};

			const handleContextMenu = (e: React.MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();

				const items: IContextMenuItem[] = [];

				if (node.type === 'file') {
					const fileUri = toFileURI(node.path);
					items.push(
						{ id: 'open', label: 'Open', command: 'file.open', args: [fileUri.toString()] },
						{ id: 'openToSide', label: 'Open to the Side', command: 'file.openToSide', args: [fileUri.toString()] },
						{ id: 'separator1', label: '', separator: true, command: '' },
						{ id: 'reveal', label: 'Reveal in File Explorer', command: 'file.reveal', args: [fileUri.toString()] },
						{ id: 'copyPath', label: 'Copy Path', command: 'file.copyPath', args: [fileUri.toString()] },
						{ id: 'separator2', label: '', separator: true, command: '' },
						{ id: 'rename', label: 'Rename…', command: 'file.rename', args: [fileUri.toString()] },
						{ id: 'delete', label: 'Delete', command: 'file.delete', args: [fileUri.toString()] }
					);
				} else {
					items.push(
						{ id: 'newFile', label: 'New File', command: 'file.newFile', args: [node.path] },
						{ id: 'newFolder', label: 'New Folder', command: 'file.newFolder', args: [node.path] },
						{ id: 'separator1', label: '', separator: true, command: '' },
						{ id: 'rename', label: 'Rename…', command: 'file.rename', args: [node.path] },
						{ id: 'delete', label: 'Delete', command: 'file.delete', args: [node.path] }
					);
				}

				contextMenuService.showMenu(e.nativeEvent, items);
			};

			const handleKeyDown = (e: React.KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleClick();
				} else if (e.key === 'ArrowRight' && node.type === 'folder' && !isExpanded) {
					e.preventDefault();
					void toggleFolder(node);
				} else if (e.key === 'ArrowLeft' && node.type === 'folder' && isExpanded) {
					e.preventDefault();
					void toggleFolder(node);
				}
			};

			return (
				<div key={node.path}>
					<div className={`tree-node-row ${depth === 0 ? 'tree-root-row' : ''}`}>
					<div
						className={`tree-node ${isActive ? 'active' : ''} ${isFocused ? 'focused' : ''}`}
						style={{
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							padding: `2px 4px 2px ${8 + depth * 16}px`,
							backgroundColor: isActive ? '#094771' : isFocused ? '#37373d' : 'transparent'
						}}
						onClick={handleClick}
						onContextMenu={handleContextMenu}
						onKeyDown={handleKeyDown}
						tabIndex={0}
						role="treeitem"
						aria-expanded={node.type === 'folder' ? isExpanded : undefined}
						aria-selected={isActive}
					>
						{node.type === 'folder' ? (
							isExpanded ? (
								<FolderOpenIcon />
							) : (
								<FolderIcon />
							)
						) : (
							<FileTypeIcon fileName={node.name} />
						)}
						<span style={{ marginLeft: '4px' }}>{node.name}</span>
						{isLoading && <span style={{ marginLeft: '8px', fontSize: '12px' }}>⟳</span>}
						{hasError && (
							<span style={{ marginLeft: '8px', color: '#f48771', fontSize: '12px' }}>
								⚠
							</span>
						)}
					</div>
					</div>
					{isExpanded && (
						<div className="tree-children">
							{hasError && state && (
								<div
									style={{
										paddingLeft: `${(depth + 1) * 16}px`,
										color: '#f48771',
										fontSize: '12px',
										padding: '4px'
									}}
								>
									{state.error}
									<button
										onClick={(e) => {
											e.stopPropagation();
											void toggleFolder(node);
										}}
										style={{
											marginLeft: '8px',
											padding: '2px 6px',
											background: '#0e639c',
											color: 'white',
											border: 'none',
											borderRadius: '3px',
											cursor: 'pointer',
											fontSize: '11px'
										}}
									>
										Retry
									</button>
								</div>
							)}
							{!hasError &&
								state?.children.map((child) => renderNode(child, depth + 1))}
						</div>
					)}
				</div>
			);
		},
		[nodeStates, activeFile, focusedPath, toggleFolder, onFileSelect, fileService, editorService, contextMenuService]
	);

	// Memoized tree rendering
	const renderedTree = useMemo(() => {
		return tree.map((node) => renderNode(node, 0));
	}, [tree, renderNode]);

	return (
		<div className={className} ref={treeRef} role="tree">
			{renderedTree}
		</div>
	);
}
