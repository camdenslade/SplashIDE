import React from 'react';

/**
 * Review Panel Component
 * 
 * VS Code-style panel for reviewing agent-generated changes.
 * Displays diffs, new files, and deleted files for user approval.
 * 
 * @remarks
 * This panel shows the results of agent operations and allows users
 * to apply or reject the proposed changes.
 */

/**
 * Agent result interface.
 */
interface AgentResult {
	/** Detected intent of the operation */
	intent?: string;
	/** Summary of changes */
	summary?: string;
	/** Unified diff for modified files */
	diff?: string;
	/** New files to be created */
	newFiles?: Record<string, string>;
	/** Files to be deleted */
	deletedFiles?: string[];
}

/**
 * Props for the ReviewPanel component.
 */
interface ReviewPanelProps {
	/** Agent result to review, or null if no result */
	result: AgentResult | null;
	/** Callback when user applies the patch */
	onApplyPatch: (
		diff: string,
		newFiles: Record<string, string>,
		deleted: string[]
	) => void;
	/** Callback when user rejects the patch */
	onRejectPatch: () => void;
}

/**
 * ReviewPanel component for reviewing agent changes.
 * 
 * @param props - Component props
 * @returns ReviewPanel JSX element
 */
export default function ReviewPanel({
	result,
	onApplyPatch,
	onRejectPatch
}: ReviewPanelProps): React.JSX.Element {
	if (!result) {
		return (
			<div className="panel" style={{ flex: '1 1 0', minHeight: 0 }}>
				<div className="panel-header">
					<h3>Review</h3>
				</div>
				<div
					className="panel-content"
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: '#858585'
					}}
				>
					Waiting for agent…
				</div>
			</div>
		);
	}

	const newFiles = result.newFiles ?? {};
	const deleted = result.deletedFiles ?? [];

	return (
		<div className="panel" style={{ flex: '1 1 0', minHeight: 0 }}>
			<div className="panel-header">
				<h3>Review ({result.intent ?? 'unknown'})</h3>
			</div>
			<div className="panel-content">
				<p>
					<strong>Summary:</strong> {String(result.summary ?? '')}
				</p>

				{result.diff && (
					<>
						<h4>Main File Patch</h4>
						<pre>{String(result.diff)}</pre>
					</>
				)}

				{Object.keys(newFiles).length > 0 && (
					<>
						<h4>New Files</h4>
						{Object.entries(newFiles).map(([fp, content]) => (
							<div key={fp} style={{ marginBottom: '12px' }}>
								<strong style={{ color: '#4ec9b0' }}>{fp}</strong>
								<pre>{String(content)}</pre>
							</div>
						))}
					</>
				)}

				{deleted.length > 0 && (
					<>
						<h4>Deleted Files</h4>
						<ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
							{deleted.map((f) => (
								<li key={f} style={{ color: '#f48771' }}>
									{f}
								</li>
							))}
						</ul>
					</>
				)}

				<div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
					<button
						onClick={() =>
							onApplyPatch(String(result.diff ?? ''), newFiles, deleted)
						}
					>
						Apply Changes
					</button>

					<button onClick={onRejectPatch} style={{ background: '#5a5a5a' }}>
						Reject
					</button>
				</div>
			</div>
		</div>
	);
}
