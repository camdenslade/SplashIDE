/**
 * Log Viewer Component
 * 
 * Component for viewing application logs.
 * 
 * @remarks
 * Displays logs from the log service in a scrollable panel.
 * Provides filtering and search capabilities.
 */

import React, { useState, useMemo } from 'react';
import { LogService } from '../services/logService';
import { LogLevel } from '../../common/log/logLevels';

/**
 * Props for the LogViewer component.
 */
interface LogViewerProps {
	/** Whether the viewer is open */
	open: boolean;
	/** Callback when viewer is closed */
	onClose: () => void;
}

/**
 * LogViewer component for displaying logs.
 * 
 * @param props - Component props
 * @returns LogViewer JSX element or null if closed
 */
export default function LogViewer({ open, onClose }: LogViewerProps): React.JSX.Element | null {
	const logService = new LogService(); // TODO: Get from service registry
	const [logs] = useState<string[]>([]);
	const [filter, setFilter] = useState('');
	const [levelFilter] = useState<LogLevel>(LogLevel.Info);

	const filteredLogs = useMemo(() => {
		return logs.filter((log) => {
			if (filter && !log.toLowerCase().includes(filter.toLowerCase())) {
				return false;
			}
			// Filter by level (simplified - would need log parsing)
			return true;
		});
	}, [logs, filter, levelFilter]);

	if (!open) {
		return null;
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				background: 'rgba(0, 0, 0, 0.8)',
				zIndex: 10000,
				display: 'flex',
				flexDirection: 'column'
			}}
			onClick={onClose}
		>
			<div
				style={{
					background: '#1e1e1e',
					margin: '50px',
					borderRadius: '4px',
					display: 'flex',
					flexDirection: 'column',
					maxHeight: '80vh',
					flex: '1 1 0',
					minHeight: 0
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					style={{
						padding: '12px',
						borderBottom: '1px solid #3e3e42',
						display: 'flex',
						gap: '8px',
						alignItems: 'center'
					}}
				>
					<h3 style={{ margin: 0, flex: 1 }}>Logs</h3>
					<input
						type="text"
						placeholder="Filter logs..."
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						style={{
							padding: '4px 8px',
							background: '#252526',
							border: '1px solid #3e3e42',
							color: '#cccccc',
							borderRadius: '2px'
						}}
					/>
					<button
						onClick={() => logService.clearLogs()}
						style={{
							padding: '4px 12px',
							background: '#5a5a5a',
							color: 'white',
							border: 'none',
							borderRadius: '2px',
							cursor: 'pointer'
						}}
					>
						Clear
					</button>
					<button
						onClick={onClose}
						style={{
							padding: '4px 12px',
							background: '#5a5a5a',
							color: 'white',
							border: 'none',
							borderRadius: '2px',
							cursor: 'pointer'
						}}
					>
						Close
					</button>
				</div>
				<div
					style={{
						flex: '1 1 0',
						overflow: 'auto',
						padding: '8px',
						fontFamily: 'monospace',
						fontSize: '12px',
						color: '#cccccc'
					}}
				>
					{filteredLogs.length === 0 ? (
						<div style={{ opacity: 0.5, padding: '20px', textAlign: 'center' }}>
							No logs available
						</div>
					) : (
						filteredLogs.map((log, index) => (
							<div key={index} style={{ marginBottom: '2px', whiteSpace: 'pre-wrap' }}>
								{log}
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
