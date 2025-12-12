//********************************************************************
//
// TypeScriptService Class (Renderer)
//
// VS Code-style TypeScript service implementation for the renderer process.
// Proxies all TypeScript operations to the main process via IPC. Provides
// TypeScript language features including completions, diagnostics, quick
// info, document symbols, formatting, and navigation. All operations are
// proxied to the main process where the TypeScript server runs.
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
// logger          Logger          Logger instance
// serverStarted   boolean         Flag indicating if TypeScript server is started
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
import { Logger } from '../../common/log/logger';
import '../../common/types/splashIPC';

export class TypeScriptService implements ITypeScriptService {
	private readonly logger = Logger.create('TypeScriptService');
	private serverStarted = false;
	async start(workspaceRoot: string): Promise<boolean> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}
		if (this.serverStarted) {
			this.logger.debug('TypeScript server already started');
			return true;
		}
		try {
			const success = await window.splash.tsStart(workspaceRoot);
			if (success) {
				this.serverStarted = true;
				this.logger.info('TypeScript server started', { workspaceRoot });
			} else {
				this.logger.error('Failed to start TypeScript server', { workspaceRoot });
			}
			return success;
		} catch (error: unknown) {
			this.logger.error('Error starting TypeScript server', { workspaceRoot, error });
			throw error;
		}
	}

	async sendRequest(command: string, args?: unknown): Promise<unknown> {
		if (!window.splash) {
			this.logger.error('Splash API not available');
			throw new Error('Splash API not available');
		}
		if (!this.serverStarted) {
			this.logger.warn('TypeScript server not started, request may fail', { command });
		}
		try {
			const response = await window.splash.tsRequest(command, args);
			return response.result;
		} catch (error: unknown) {
			this.logger.error('Error sending TypeScript request', { command, error });
			if (error instanceof Error && error.message.includes('restart')) {
				this.serverStarted = false;
				this.logger.info('TypeScript server needs restart');
			}
			throw error;
		}
	}

	async getCompletions(
		file: string,
		line: number,
		offset: number
	): Promise<CompletionInfo[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.tsGetCompletions(file, line, offset);
		return response.completions;
	}

	async getDiagnostics(files: string[]): Promise<Diagnostic[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.tsGetDiagnostics(files);
		return response.diagnostics;
	}

	async getQuickInfo(
		file: string,
		line: number,
		offset: number
	): Promise<QuickInfo | undefined> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.tsGetQuickInfo(file, line, offset);
		return response.quickInfo ?? undefined;
	}

	async getDocumentSymbols(file: string): Promise<DocumentSymbol[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.tsGetDocumentSymbols(file);
		return response.symbols;
	}

	async formatDocument(
		file: string,
		options?: FormatOptions
	): Promise<TextEdit[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.tsFormatDocument(file, options);
		return response.edits;
	}

	async navigateToDefinition(
		file: string,
		line: number,
		offset: number
	): Promise<Location[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.tsNavigateToDefinition(file, line, offset);
		return response.locations;
	}

	async renameSymbol(
		file: string,
		line: number,
		offset: number,
		newName: string
	): Promise<RenameInfo | undefined> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		const response = await window.splash.tsRenameSymbol(file, line, offset, newName);
		return response.renameInfo ?? undefined;
	}
}
