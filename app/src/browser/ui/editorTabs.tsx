/**
 * Editor Tabs Component
 * 
 * VS Code-style editor tabs for managing open files.
 * 
 * @remarks
 * Displays tabs for open editors with close buttons and context menus.
 */

import React from 'react';
import { getContextMenuService, IContextMenuItem } from '../services/contextMenuService';

/**
 * Props for the EditorTabs component.
 */
interface EditorTabsProps {
	/** Currently active editor URI */
	activeEditor: string | undefined;
	/** Callback when an editor is selected */
	onEditorSelect: (uri: string) => void;
	/** Callback when an editor is closed */
	onEditorClose: (uri: string) => void;
}

/**
 * EditorTabs component for displaying and managing editor tabs.
 * 
 * @param props - Component props
 * @returns EditorTabs JSX element
 */
export default function EditorTabs({
	activeEditor,
	onEditorSelect,
	onEditorClose
}: EditorTabsProps): React.ReactElement {
	const contextMenuService = getContextMenuService();
	// Note: In a full implementation, we'd track open editors from the editor service
	// For now, we'll use a simple implementation with just the active editor

	const handleTabContextMenu = (e: React.MouseEvent, uri: string) => {
		e.preventDefault();
		e.stopPropagation();

		const items: IContextMenuItem[] = [
			{ id: 'close', label: 'Close', command: 'editor.close', args: [uri] },
			{ id: 'closeOthers', label: 'Close Others', command: 'editor.closeOthers', args: [uri] },
			{ id: 'closeAll', label: 'Close All', command: 'editor.closeAll' },
			{ id: 'separator1', label: '', separator: true, command: '' },
			{ id: 'closeRight', label: 'Close to the Right', command: 'editor.closeRight', args: [uri] }
		];

		contextMenuService.showMenu(e.nativeEvent, items);
	};

	const handleClose = (e: React.MouseEvent, uri: string) => {
		e.stopPropagation();
		onEditorClose(uri);
	};

	if (!activeEditor) {
		return <div className="editor-tabs" />;
	}

	return (
		<div className="editor-tabs" style={{ display: 'flex', borderBottom: '1px solid #3e3e42' }}>
			<div
				className="editor-tab active"
				style={{
					display: 'flex',
					alignItems: 'center',
					padding: '4px 12px',
					background: '#1e1e1e',
					borderRight: '1px solid #3e3e42',
					cursor: 'pointer',
					position: 'relative'
				}}
				onClick={() => onEditorSelect(activeEditor)}
				onContextMenu={(e) => handleTabContextMenu(e, activeEditor)}
			>
				<span style={{ fontSize: '13px', marginRight: '8px' }}>
					{activeEditor.split(/[/\\]/).pop()}
				</span>
				<button
					onClick={(e) => handleClose(e, activeEditor)}
					style={{
						background: 'transparent',
						border: 'none',
						color: '#cccccc',
						cursor: 'pointer',
						padding: '2px 4px',
						fontSize: '14px',
						lineHeight: '1'
					}}
					title="Close"
				>
					×
				</button>
			</div>
		</div>
	);
}

