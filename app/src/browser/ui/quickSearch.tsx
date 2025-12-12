/**
 * Quick Search Component
 * 
 * VS Code-style quick file search dialog.
 * Allows users to quickly find and open files by name.
 * 
 * @remarks
 * This component provides a fuzzy search interface for finding
 * files in the workspace by name.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';

/**
 * Props for the QuickSearch component.
 */
interface QuickSearchProps {
	/** Whether the search dialog is open */
	open: boolean;
	/** List of file paths to search */
	files: string[];
	/** Callback when a file is selected */
	onSelect: (path: string) => void;
	/** Callback when search is closed */
	onClose: () => void;
}

/**
 * QuickSearch component for file search.
 * 
 * @param props - Component props
 * @returns QuickSearch JSX element or null if closed
 */
/**
 * Ranks file paths by relevance to query.
 * Prioritizes exact matches, then filename matches, then path matches.
 */
function rankFiles(query: string, files: string[]): string[] {
	const q = query.toLowerCase();
	
	const scored = files.map((file) => {
		const lowerFile = file.toLowerCase();
		const fileName = file.split(/[/\\]/).pop()?.toLowerCase() ?? '';
		
		let score = 0;
		
		// Exact match
		if (lowerFile === q) {
			score = 1000;
		} else if (fileName === q) {
			score = 500;
		} else if (fileName.startsWith(q)) {
			score = 300;
		} else if (fileName.includes(q)) {
			score = 200;
		} else if (lowerFile.includes(q)) {
			score = 100;
		}
		
		// Boost shorter paths
		score -= file.length / 100;
		
		return { file, score };
	});
	
	return scored
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score)
		.map((item) => item.file);
}

export default function QuickSearch({
	open,
	files,
	onSelect,
	onClose
}: QuickSearchProps): React.JSX.Element | null {
	const [query, setQuery] = useState('');
	
	// Memoize ranked results
	const results = useMemo(() => {
		if (!query.trim()) {
			return files.slice(0, 50); // Limit initial results
		}
		return rankFiles(query, files).slice(0, 100); // Limit to top 100
	}, [query, files]);
	
	const handleSelect = useCallback((path: string) => {
		onSelect(path);
		onClose();
	}, [onSelect, onClose]);
	
	useEffect(() => {
		if (!open) {
			return;
		}
		setQuery('');
	}, [open]);

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
		<div className="qs-backdrop" onClick={onClose}>
			<div className="qs" onClick={(e) => e.stopPropagation()}>
				<input
					autoFocus
					className="qs-input"
					value={query}
					placeholder="Search files..."
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Escape') {
							onClose();
						}
					}}
				/>

				<div className="qs-results">
					{results.length === 0 ? (
						<div className="qs-item" style={{ opacity: 0.5 }}>
							No files found
						</div>
					) : (
						results.map((r) => (
							<div
								key={r}
								className="qs-item"
								onClick={() => handleSelect(r)}
							>
								{r}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
