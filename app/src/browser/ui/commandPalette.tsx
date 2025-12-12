/**
 * Command Palette Component
 * 
 * VS Code-style command palette for executing commands.
 * Uses ICommandService for command execution.
 * 
 * @remarks
 * This component provides a searchable list of all available commands
 * and allows users to execute them via keyboard or mouse.
 */

import React, { useEffect, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { useService } from '../hooks/useService';
import { ICommandService } from '../../common/models/services';

/**
 * Props for the CommandPalette component.
 */
interface CommandPaletteProps {
	/** Whether the palette is open */
	open: boolean;
	/** Callback when palette is closed */
	onClose: () => void;
}

/**
 * CommandPalette component for command execution.
 * 
 * @param props - Component props
 * @returns CommandPalette JSX element or null if closed
 */
/**
 * Fuzzy search scoring function for command matching.
 * 
 * @param query - Search query
 * @param text - Text to match against
 * @returns Score (higher is better match)
 */
function fuzzyScore(query: string, text: string): number {
	const q = query.toLowerCase();
	const t = text.toLowerCase();
	
	if (t.includes(q)) {
		// Exact substring match gets high score
		const index = t.indexOf(q);
		return 1000 - index; // Earlier matches score higher
	}
	
	// Character-by-character matching
	let score = 0;
	let qIndex = 0;
	for (let i = 0; i < t.length && qIndex < q.length; i++) {
		if (t[i] === q[qIndex]) {
			score += 10;
			qIndex++;
		}
	}
	
	return qIndex === q.length ? score : 0;
}

export default function CommandPalette({
	open,
	onClose
}: CommandPaletteProps): React.JSX.Element | null {
	const commandService = useService(ICommandService);
	const [query, setQuery] = useState('');
	
	// Memoize all commands
	const allCommands = useMemo(
		() => commandService.getCommands().map((cmd) => ({
			id: cmd.id,
			title: cmd.title
		})),
		[commandService]
	);
	
	// Memoize filtered results with fuzzy search
	const results = useMemo(() => {
		if (!query.trim()) {
			return allCommands;
		}
		
		const q = query.toLowerCase();
		const scored = allCommands.map((cmd) => ({
			...cmd,
			score: fuzzyScore(q, cmd.title)
		}));
		
		return scored
			.filter((item) => item.score > 0)
			.sort((a, b) => b.score - a.score)
			.map(({ id, title }) => ({ id, title }));
	}, [query, allCommands]);

	useLayoutEffect(() => {
		if (!open) {
			return;
		}
		setQuery('');
	}, [open]);
	
	const handleExecuteCommand = useCallback(async (commandId: string) => {
		try {
			await commandService.executeCommand(commandId);
			onClose();
		} catch (error: unknown) {
			console.error('Error executing command:', error);
		}
	}, [commandService, onClose]);

	// Handle Escape key
	useEffect(() => {
		if (!open) {
			return;
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => {
			window.removeEventListener('keydown', handleEscape);
		};
	}, [open, onClose]);

	if (!open) {
		return null;
	}

	return (
		<div className="palette-backdrop" onClick={onClose}>
			<div className="palette" onClick={(e) => e.stopPropagation()}>
				<input
					autoFocus
					className="palette-input"
					value={query}
					placeholder="Type a command..."
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							onClose();
						}
					}}
				/>

				<div className="palette-results">
					{results.length === 0 ? (
						<div className="palette-item" style={{ opacity: 0.5 }}>
							No commands found
						</div>
					) : (
						results.map((cmd) => (
							<div
								key={cmd.id}
								className="palette-item"
								onClick={() => handleExecuteCommand(cmd.id)}
							>
								{cmd.title}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
