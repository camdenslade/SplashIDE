/**
 * Chat Panel Component
 * 
 * VS Code-style panel for AI agent interactions.
 * Uses IAgentService and IWorkspaceService for operations.
 * 
 * @remarks
 * This panel allows users to interact with AI agents to perform
 * code generation, refactoring, and analysis tasks.
 */

import React, { useState, useEffect } from 'react';
import { useService } from '../hooks/useService';
import { IAgentService, IWorkspaceService, IEditorService } from '../../common/models/services';
import { WorkspaceContext } from '../../common/models/services';

/**
 * Import graph type.
 */
interface ImportGraph {
	[file: string]: string[];
}

/**
 * Agent result interface.
 */
interface AgentResult {
	intent?: string;
	[key: string]: unknown;
}

/**
 * Props for the ChatPanel component.
 */
interface ChatPanelProps {
	/** Current file content */
	fileContent: string;
	/** Current file path */
	filePath: string | null;
	/** Workspace root path */
	workspaceRoot: string | null;
	/** List of workspace files */
	workspaceFiles: string[];
	/** Import graph for dependency analysis */
	importGraph: ImportGraph;
	/** Workspace context with files and contents */
	workspaceContext: WorkspaceContext;
	/** Callback when agent produces a result */
	onAgentResult: (res: AgentResult) => void;
}

/**
 * ChatPanel component for AI agent interactions.
 * 
 * @param props - Component props
 * @returns ChatPanel JSX element
 */
export default function ChatPanel({
	fileContent,
	filePath,
	workspaceRoot,
	workspaceFiles,
	importGraph,
	workspaceContext,
	onAgentResult
}: ChatPanelProps): React.ReactElement {
	const agentService = useService(IAgentService);
	const workspaceService = useService(IWorkspaceService);
	const editorService = useService(IEditorService);
	const [input, setInput] = useState('');
	const [agent, setAgent] = useState('frontend');
	const [hasActiveEditor, setHasActiveEditor] = useState(false);

	// Check if there's an active editor
	useEffect(() => {
		const activeEditor = editorService.getActiveEditor();
		const hasEditor = activeEditor !== undefined && activeEditor !== null;
		// Also check filePath as fallback
		setHasActiveEditor(hasEditor || !!filePath);
	}, [editorService, filePath]);

	/**
	 * Runs the selected agent with the current input.
	 */
	async function run(): Promise<void> {
		if (!filePath || !workspaceRoot) {
			return;
		}

		try {
			const related = await workspaceService.discoverRelatedFiles(
				importGraph,
				filePath,
				3
			);

			const payload = {
				task: input,
				activeFile: filePath,
				activeContent: fileContent,
				workspaceRoot,
				workspaceFiles: Array.isArray(workspaceFiles) ? workspaceFiles : [],
				workspaceContext,
				relatedFiles: related,
				intentDetection: true
			};

			const result = await agentService.runAgent(agent, payload);

			function isObject(value: unknown): value is Record<string, unknown> {
				return typeof value === 'object' && value !== null;
			}

			if (isObject(result)) {
				onAgentResult({
					...result,
					detectedIntent:
						typeof result.intent === 'string' ? result.intent : undefined
				});
			} else {
				onAgentResult({
					detectedIntent: undefined
				});
			}
		} catch (error: unknown) {
			console.error('Error running agent:', error);
		}
	}

	return (
		<div className="panel" style={{ flex: '1 1 0', minHeight: 0 }}>
			<div className="panel-header">
				<h3>Agents</h3>
			</div>
			<div className="panel-content">
				<select value={agent} onChange={(e) => setAgent(e.target.value)}>
					<option value="frontend">Frontend Agent</option>
					<option value="backend">Backend Agent</option>
					<option value="documenter">Documenter</option>
					<option value="db">DB Specialist</option>
					<option value="deploy">Deployment Specialist</option>
					<option value="reviewer">Reviewer</option>
					<option value="architect">Architect Agent</option>
				</select>

				<textarea
					placeholder="Task for the agent…"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					style={{
						width: '100%',
						minHeight: '100px',
						marginTop: '8px',
						padding: '8px',
						fontFamily: 'monospace',
						fontSize: '13px',
						border: '1px solid #3c3c3c',
						backgroundColor: '#1e1e1e',
						color: '#cccccc',
						resize: 'vertical'
					}}
				/>

				<button
					onClick={() => void run()}
					disabled={!input.trim() || !hasActiveEditor || !workspaceRoot}
					style={{
						marginTop: '8px',
						padding: '8px 16px',
						background: '#0e639c',
						color: 'white',
						border: 'none',
						borderRadius: '3px',
						cursor: !input.trim() || !hasActiveEditor || !workspaceRoot ? 'not-allowed' : 'pointer',
						opacity: !input.trim() || !hasActiveEditor || !workspaceRoot ? 0.5 : 1
					}}
				>
					Run Agent
				</button>
			</div>
		</div>
	);
}
