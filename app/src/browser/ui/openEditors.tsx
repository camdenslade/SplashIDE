/**
 * Open Editors Component
 * 
 * VS Code-style open editors list in sidebar.
 */

import React from 'react';

/**
 * Props for the OpenEditors component.
 */
interface OpenEditorsProps {
	/** Currently active editor URI */
	activeEditor: string | undefined;
	/** Callback when an editor is selected */
	onEditorSelect: (uri: string) => void;
}

/**
 * OpenEditors component for displaying open editors.
 */
export default function OpenEditors({
	activeEditor,
	onEditorSelect
}: OpenEditorsProps): React.ReactElement {
	// Note: In a full implementation, we'd track all open editors
	// For now, we'll show just the active editor if it exists

	if (!activeEditor) {
		return (
			<div style={{ padding: '8px', fontSize: '12px', color: '#858585' }}>
				No open editors
			</div>
		);
	}

	return (
		<div>
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
				Open Editors
			</div>
			<div
				style={{
					padding: '2px 8px',
					fontSize: '13px',
					cursor: 'pointer',
					backgroundColor: activeEditor === activeEditor ? '#094771' : 'transparent',
					borderRadius: '2px'
				}}
				onClick={() => onEditorSelect(activeEditor)}
			>
				{activeEditor.split(/[/\\]/).pop()}
			</div>
		</div>
	);
}

