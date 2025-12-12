//********************************************************************
//
// TypeScriptService Class (Main Process)
//
// VS Code-style TypeScript service implementation for the main process.
// Manages TypeScript language server communication. Wraps the TypeScript
// language server (tsserver) and provides a clean interface for TypeScript
// language features. Handles server lifecycle, request/response communication,
// and event forwarding.
//
// Return Value
// ------------
// None (class definition)
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
// None (uses module-level variables for router and main window)
//
//*******************************************************************

import { ITypeScriptService } from '../../common/models/services';
import type {
	CompletionInfo,
	Diagnostic,
	QuickInfo,
	DocumentSymbol,
	TextEdit,
	Location,
	RenameInfo,
	FormatOptions
} from '../../common/models/services';
import { BrowserWindow } from 'electron';
import { initTsRouter } from './tsRouter';

let tsRouter: ReturnType<typeof initTsRouter> | null = null;
let mainWindow: BrowserWindow | null = null;

export class TypeScriptService implements ITypeScriptService {
	setMainWindow(window: BrowserWindow | null): void {
		mainWindow = window;
		if (window && !tsRouter) {
			tsRouter = initTsRouter(window);
		}
	}

	async start(workspaceRoot: string): Promise<boolean> {
		if (!tsRouter) {
			if (!mainWindow) {
				console.error('[TS] Cannot start TS server: no main window');
				return false;
			}
			tsRouter = initTsRouter(mainWindow);
		}

		try {
			tsRouter.start(workspaceRoot);
			return true;
		} catch (error: unknown) {
			console.error('[TS] Error starting TS server:', error);
			return false;
		}
	}

	async sendRequest(command: string, args?: unknown): Promise<unknown> {
		if (!tsRouter) {
			return null;
		}

		try {
			return await tsRouter.send(command, args);
		} catch (error: unknown) {
			console.error('[TS] Error sending request:', error);
			return null;
		}
	}

	async getCompletions(
		file: string,
		line: number,
		offset: number
	): Promise<CompletionInfo[]> {
		const result = (await this.sendRequest('completionInfo', {
			file,
			line: line + 1, // TS server uses 1-based line numbers
			offset: offset + 1
		})) as { entries?: Array<{ name: string; kind: string; kindModifiers?: string }> } | null;

		if (!result || !result.entries) {
			return [];
		}

		return result.entries.map((entry) => ({
			label: entry.name,
			kind: entry.kind,
			insertText: entry.name
		}));
	}

	async getDiagnostics(files: string[]): Promise<Diagnostic[]> {
		// Diagnostics come via events, not direct response
		// This method is a placeholder - actual diagnostics come through events
		await this.sendRequest('geterr', {
			files,
			delay: 0
		});

		// Diagnostics come via events, not direct response
		// This is a placeholder - actual diagnostics come through events
		return [];
	}

	async getQuickInfo(
		file: string,
		line: number,
		offset: number
	): Promise<QuickInfo | undefined> {
		const result = (await this.sendRequest('quickinfo', {
			file,
			line: line + 1,
			offset: offset + 1
		})) as
			| {
					displayString?: string;
					documentation?: string;
					textSpan?: {
						start: { line: number; offset: number };
						end: { line: number; offset: number };
					};
			  }
			| null
			| undefined;

		if (!result) {
			return undefined;
		}

		const span = result.textSpan;
		if (!span) {
			return undefined;
		}

		return {
			text: result.displayString ?? '',
			documentation: result.documentation,
			startLine: span.start.line - 1, // Convert to 0-based
			startOffset: span.start.offset - 1,
			endLine: span.end.line - 1,
			endOffset: span.end.offset - 1
		};
	}

	async getDocumentSymbols(file: string): Promise<DocumentSymbol[]> {
		const result = (await this.sendRequest('navtree', {
			file
		})) as
			| {
					childItems?: Array<{
						text: string;
						kind: string;
						spans: Array<{
							start: { line: number; offset: number };
							end: { line: number; offset: number };
						}>;
						childItems?: Array<{
							text: string;
							kind: string;
							spans: Array<{
								start: { line: number; offset: number };
								end: { line: number; offset: number };
							}>;
						}>;
					}>;
			  }
			| null
			| undefined;

		if (!result || !result.childItems) {
			return [];
		}

		const convertSymbol = (
			item: {
				text: string;
				kind: string;
				spans: Array<{
					start: { line: number; offset: number };
					end: { line: number; offset: number };
				}>;
				childItems?: Array<unknown>;
			}
		): DocumentSymbol => {
			const span = item.spans[0];
			if (!span) {
				throw new Error('Symbol missing span');
			}

			return {
				name: item.text,
				kind: item.kind,
				range: {
					startLine: span.start.line - 1,
					startOffset: span.start.offset - 1,
					endLine: span.end.line - 1,
					endOffset: span.end.offset - 1
				},
				children: item.childItems
					? (item.childItems as Array<{
							text: string;
							kind: string;
							spans: Array<{
								start: { line: number; offset: number };
								end: { line: number; offset: number };
							}>;
					  }>).map(convertSymbol)
					: undefined
			};
		};

		return result.childItems.map(convertSymbol);
	}

	async formatDocument(
		file: string,
		options?: FormatOptions
	): Promise<TextEdit[]> {
		const result = (await this.sendRequest('format', {
			file,
			line: 1,
			offset: 1,
			endLine: 1000000, // Format entire file
			endOffset: 1000000,
			options: {
				tabSize: options?.tabSize ?? 4,
				indentSize: options?.indentSize ?? 4,
				insertSpaces: options?.insertSpaces ?? true
			}
		})) as Array<{
			start: { line: number; offset: number };
			end: { line: number; offset: number };
			newText: string;
		}> | null;

		if (!result) {
			return [];
		}

		return result.map((edit) => ({
			range: {
				startLine: edit.start.line - 1,
				startOffset: edit.start.offset - 1,
				endLine: edit.end.line - 1,
				endOffset: edit.end.offset - 1
			},
			newText: edit.newText
		}));
	}

	async navigateToDefinition(
		file: string,
		line: number,
		offset: number
	): Promise<Location[]> {
		const result = (await this.sendRequest('definition', {
			file,
			line: line + 1,
			offset: offset + 1
		})) as Array<{
			file: string;
			start: { line: number; offset: number };
			end: { line: number; offset: number };
		}> | null;

		if (!result) {
			return [];
		}

		return result.map((loc) => ({
			file: loc.file,
			startLine: loc.start.line - 1,
			startOffset: loc.start.offset - 1,
			endLine: loc.end.line - 1,
			endOffset: loc.end.offset - 1
		}));
	}

	async renameSymbol(
		file: string,
		line: number,
		offset: number,
		_newName: string
	): Promise<RenameInfo | undefined> {
		void _newName;
		// First check if rename is possible
		const renameResult = (await this.sendRequest('rename', {
			file,
			line: line + 1,
			offset: offset + 1
		})) as
			| {
					canRename: boolean;
					displayName?: string;
					fullDisplayName?: string;
					kind?: string;
					triggerSpan?: {
						start: { line: number; offset: number };
						end: { line: number; offset: number };
					};
			  }
			| null
			| undefined;

		if (!renameResult || !renameResult.canRename) {
			return undefined;
		}

		return {
			canRename: renameResult.canRename,
			displayName: renameResult.displayName,
			fullDisplayName: renameResult.fullDisplayName,
			kind: renameResult.kind,
			triggerSpan: renameResult.triggerSpan
				? {
						startLine: renameResult.triggerSpan.start.line - 1,
						startOffset: renameResult.triggerSpan.start.offset - 1,
						endLine: renameResult.triggerSpan.end.line - 1,
						endOffset: renameResult.triggerSpan.end.offset - 1
				  }
				: undefined
		};
	}
}
