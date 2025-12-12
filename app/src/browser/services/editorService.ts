//********************************************************************
//
// IEditorModel Interface
//
// Represents an editor model with URI, content, language, and dirty
// state tracking. Used by EditorService to manage editor models.
//
// Return Value
// ------------
// None (interface definition)
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
// None
//
//*******************************************************************

import { IEditorService } from '../../common/models/services';
import { URI } from '../../common/types/uri';
import { Emitter } from '../../common/types/event';
import { Logger } from '../../common/log/logger';

export interface IEditorModel {
	readonly uri: string;
	readonly content: string;
	readonly language: string;
	readonly isDirty: boolean;
}

//********************************************************************
//
// EditorService Class (Renderer)
//
// VS Code-style editor service for Monaco editor management. Handles
// model creation, dirty tracking, and editor groups. Manages editor
// models and tracks dirty state for unsaved changes. Provides a clean
// abstraction over Monaco editor for consistent editor management
// throughout the application.
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
// models              Map<string, IEditorModel>    Map of URI to editor models
// dirtyUris           Set<string>                  Set of URIs with unsaved changes
// _onDidChangeDirty   Emitter<{uri, dirty}>        Event emitter for dirty state changes
// activeEditorUri     string|undefined             Currently active editor URI
// logger              Logger                        Logger instance
// openEditors         Set<string>                  Set of open editor URIs
//
//*******************************************************************

export class EditorService implements IEditorService {
	private readonly models = new Map<string, IEditorModel>();
	private readonly dirtyUris = new Set<string>();
	private readonly _onDidChangeDirty = new Emitter<{ uri: string; dirty: boolean }>();
	private activeEditorUri: string | undefined;
	private readonly logger = Logger.create('EditorService');
	private readonly openEditors = new Set<string>();

	/**
	 * Event fired when a file's dirty state changes.
	 */
	readonly onDidChangeDirty = this._onDidChangeDirty.event;

	async openEditor(uri: string, content?: string): Promise<void> {
		try {
			if (this.openEditors.size > 50) {
				this.logger.warn('Many editors open, cleaning up old models', { count: this.openEditors.size });
				const urisToClose = Array.from(this.openEditors).slice(0, this.openEditors.size - 30);
				for (const oldUri of urisToClose) {
					await this.closeEditor(oldUri);
				}
			}

			this.activeEditorUri = uri;
			this.openEditors.add(uri);

			if (!this.models.has(uri)) {
				const language = this.detectLanguage(uri);
				this.models.set(uri, {
					uri,
					content: content ?? '',
					language,
					isDirty: false
				});
			} else if (content !== undefined) {
				const model = this.models.get(uri);
				if (model) {
					this.models.set(uri, {
						...model,
						content
					});
				}
			}
		} catch (error: unknown) {
			this.logger.error('Error opening editor', { uri, error });
			throw error;
		}
	}

	async closeEditor(uri: string): Promise<void> {
		try {
			if (this.activeEditorUri === uri) {
				this.activeEditorUri = undefined;
			}
			this.openEditors.delete(uri);
			// Don't delete model - keep it for potential reopening
			// Models are cleaned up by Monaco's disposal mechanism
		} catch (error: unknown) {
			this.logger.error('Error closing editor', { uri, error });
		}
	}

	getActiveEditor(): string | undefined {
		return this.activeEditorUri;
	}

	isDirty(uri: string): boolean {
		return this.dirtyUris.has(uri);
	}

	setDirty(uri: string, dirty: boolean): void {
		const wasDirty = this.dirtyUris.has(uri);
		if (dirty) {
			this.dirtyUris.add(uri);
		} else {
			this.dirtyUris.delete(uri);
		}

		if (wasDirty !== dirty) {
			this._onDidChangeDirty.fire({ uri, dirty });

			// Update model
			const model = this.models.get(uri);
			if (model) {
				this.models.set(uri, {
					...model,
					isDirty: dirty
				});
			}
		}
	}

	/**
	 * Gets a model by URI.
	 */
	getModel(uri: string): IEditorModel | undefined {
		return this.models.get(uri);
	}

	/**
	 * Updates model content.
	 */
	updateModelContent(uri: string, content: string): void {
		const model = this.models.get(uri);
		if (model) {
			this.models.set(uri, {
				...model,
				content
			});
			// Mark as dirty if content changed
			if (model.content !== content) {
				this.setDirty(uri, true);
			}
		}
	}

	/**
	 * Detects language from file extension.
	 */
	private detectLanguage(uri: string): string {
		const uriObj = URI.parse(uri);
		const path = uriObj.path;
		const ext = path.substring(path.lastIndexOf('.') + 1).toLowerCase();

		const languageMap: Record<string, string> = {
			ts: 'typescript',
			tsx: 'typescript',
			js: 'javascript',
			jsx: 'javascript',
			json: 'json',
			md: 'markdown',
			html: 'html',
			css: 'css',
			scss: 'scss',
			less: 'less',
			py: 'python',
			java: 'java',
			cpp: 'cpp',
			c: 'c',
			cs: 'csharp',
			go: 'go',
			rs: 'rust',
			php: 'php',
			rb: 'ruby',
			swift: 'swift',
			kt: 'kotlin',
			sh: 'shell',
			bash: 'shell',
			zsh: 'shell',
			yaml: 'yaml',
			yml: 'yaml',
			xml: 'xml',
			sql: 'sql'
		};

		return languageMap[ext] ?? 'plaintext';
	}

	dispose(): void {
		this.models.clear();
		this.dirtyUris.clear();
		this._onDidChangeDirty.dispose();
	}
}
