/**
 * Workspace Folder Manager Component
 * 
 * UI component for managing multi-root workspace folders.
 * 
 * @remarks
 * Provides interface for adding, removing, and managing workspace folders.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useService } from '../hooks/useService';
import { IWorkspaceService } from '../../common/models/services';
import { IWorkspaceFolder } from '../../common/types/workspace';
import { URI } from '../../common/types/uri';
import { Logger } from '../../common/log/logger';
import { getContextMenuService, IContextMenuItem } from '../services/contextMenuService';

/**
 * Props for the WorkspaceFolderManager component.
 */
interface WorkspaceFolderManagerProps {
	/** Whether the manager is visible */
	visible?: boolean;
}

/**
 * WorkspaceFolderManager component for managing workspace folders.
 * 
 * @param props - Component props
 * @returns WorkspaceFolderManager JSX element
 */
export default function WorkspaceFolderManager({
	visible = true
}: WorkspaceFolderManagerProps): React.JSX.Element | null {
	const workspaceService = useService(IWorkspaceService);
	const logger = Logger.create('WorkspaceFolderManager');
	const contextMenuService = getContextMenuService();
	const [folders, setFolders] = useState<IWorkspaceFolder[]>([]);

	useEffect(() => {
		setFolders([...workspaceService.getWorkspaceFolders()]);

		const disposable = workspaceService.onDidChangeWorkspaceFolders((event) => {
			setFolders([...workspaceService.getWorkspaceFolders()]);
			logger.info('Workspace folders changed', {
				added: event.added.length,
				removed: event.removed.length
			});
		});

		return () => disposable.dispose();
	}, []);

	const handleAddFolder = useCallback(async () => {
		try {
			const path = await workspaceService.openWorkspace();
			if (path) {
				const uri = URI.file(path);
				await workspaceService.addWorkspaceFolder(uri);
			}
		} catch (error: unknown) {
			logger.error('Error adding workspace folder', { error });
		}
	}, [workspaceService, logger]);

	const handleRemoveFolder = useCallback(
		async (uri: URI) => {
			try {
				await workspaceService.removeWorkspaceFolder(uri);
			} catch (error: unknown) {
				logger.error('Error removing workspace folder', { uri: uri.toString(), error });
			}
		},
		[workspaceService, logger]
	);

	const handleAddRemoteFolder = useCallback(async () => {
		// Stub for remote folder addition
		logger.info('Add remote folder (stub)');
		// TODO: Show dialog for remote workspace URL
	}, [logger]);

	if (!visible) {
		return null;
	}

	return (
		<div
			style={{
				padding: '12px',
				borderBottom: '1px solid #3e3e42'
			}}
		>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '8px'
				}}
			>
				<h3 style={{ margin: 0, fontSize: '13px', fontWeight: 'normal' }}>Workspace Folders</h3>
				<div style={{ display: 'flex', gap: '4px' }}>
					<button
						onClick={handleAddFolder}
						style={{
							padding: '4px 8px',
							background: '#0e639c',
							color: 'white',
							border: 'none',
							borderRadius: '2px',
							cursor: 'pointer',
							fontSize: '11px'
						}}
						title="Add Folder..."
					>
						+ Folder
					</button>
					<button
						onClick={handleAddRemoteFolder}
						style={{
							padding: '4px 8px',
							background: '#5a5a5a',
							color: 'white',
							border: 'none',
							borderRadius: '2px',
							cursor: 'pointer',
							fontSize: '11px'
						}}
						title="Add Remote Workspace..."
					>
						+ Remote
					</button>
				</div>
			</div>

			<div>
				{folders.length === 0 ? (
					<div style={{ padding: '8px', opacity: 0.6, fontSize: '12px' }}>
						No workspace folders. Click "+ Folder" to add one.
					</div>
				) : (
					folders.map((folder) => (
						<div
							key={folder.uri.toString()}
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								padding: '4px 8px',
								marginBottom: '2px',
								background: '#2a2d2e',
								borderRadius: '2px',
								cursor: 'pointer'
							}}
							onContextMenu={(e) => {
								e.preventDefault();
								e.stopPropagation();
								const items: IContextMenuItem[] = [
									{
										id: 'remove',
										label: 'Remove Folder from Workspace',
										command: 'workspace.removeFolder',
										args: [folder.uri.toString()]
									},
									{ id: 'separator1', label: '', separator: true, command: '' },
									{
										id: 'reveal',
										label: 'Reveal in File Explorer',
										command: 'file.reveal',
										args: [folder.uri.fsPath()]
									}
								];
								contextMenuService.showMenu(e.nativeEvent, items);
							}}
						>
							<span style={{ fontSize: '12px', flex: 1 }}>{folder.name}</span>
							<button
								onClick={() => handleRemoveFolder(folder.uri)}
								style={{
									padding: '2px 6px',
									background: 'transparent',
									color: '#cccccc',
									border: '1px solid #3e3e42',
									borderRadius: '2px',
									cursor: 'pointer',
									fontSize: '11px'
								}}
								title="Remove Folder"
							>
								×
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}
