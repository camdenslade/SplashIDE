/**
 * Monaco Editor Service
 * 
 * VS Code-style Monaco editor service abstraction.
 * Manages editor models, dirty tracking, and editor groups.
 */

import * as monaco from 'monaco-editor';
import { Emitter } from '../../common/types/event';

/**
 * Editor model interface.
 */
export interface IEditorModel {
	readonly uri: monaco.Uri;
	readonly model: monaco.editor.ITextModel;
	readonly isDirty: boolean;
}

/**
 * Editor group interface.
 */
export interface IEditorGroup {
	readonly id: number;
	readonly editors: IEditorModel[];
	readonly activeEditor: IEditorModel | undefined;
}

/**
 * Monaco editor service implementation.
 */
export class MonacoEditorService {
	private readonly models = new Map<string, monaco.editor.ITextModel>();
	private readonly dirtyUris = new Set<string>();
	private readonly groups: IEditorGroup[] = [];
	private activeGroupId = 0;
	private readonly _onDidChangeDirty = new Emitter<{ uri: monaco.Uri; dirty: boolean }>();
	private readonly _onDidChangeActiveEditor = new Emitter<{ uri: monaco.Uri | undefined }>();

	/**
	 * Event fired when a file's dirty state changes.
	 */
	readonly onDidChangeDirty = this._onDidChangeDirty.event;

	/**
	 * Event fired when the active editor changes.
	 */
	readonly onDidChangeActiveEditor = this._onDidChangeActiveEditor.event;

	constructor() {
		// Create initial editor group
		this.groups.push({
			id: 0,
			editors: [],
			activeEditor: undefined
		});
	}

	/**
	 * Creates or gets a model for a URI.
	 */
	getOrCreateModel(uri: monaco.Uri, language: string, content: string): monaco.editor.ITextModel {
		const uriString = uri.toString();
		let model = this.models.get(uriString);

		if (!model) {
			model = monaco.editor.createModel(content, language, uri);
			this.models.set(uriString, model);

			// Track model disposal
			model.onWillDispose(() => {
				this.models.delete(uriString);
				this.dirtyUris.delete(uriString);
			});
		} else {
			// Update content if different
			if (model.getValue() !== content) {
				model.setValue(content);
			}
		}

		return model;
	}

	/**
	 * Gets a model by URI.
	 */
	getModel(uri: monaco.Uri): monaco.editor.ITextModel | undefined {
		return this.models.get(uri.toString());
	}

	/**
	 * Opens an editor in the active group.
	 */
	openEditor(uri: monaco.Uri, model: monaco.editor.ITextModel): IEditorModel {
		const group = this.groups.find((g) => g.id === this.activeGroupId);
		if (!group) {
			throw new Error('Active editor group not found');
		}

		// Check if editor already open
		let editor = group.editors.find((e) => e.uri.toString() === uri.toString());

		if (!editor) {
			editor = {
				uri,
				model,
				isDirty: this.dirtyUris.has(uri.toString())
			};
			group.editors.push(editor);
		}

		// Set as active
		(group as { activeEditor: IEditorModel | undefined }).activeEditor = editor;
		this._onDidChangeActiveEditor.fire({ uri });

		return editor;
	}

	/**
	 * Closes an editor.
	 */
	closeEditor(uri: monaco.Uri): void {
		for (const group of this.groups) {
			const index = group.editors.findIndex((e) => e.uri.toString() === uri.toString());
			if (index !== -1) {
				group.editors.splice(index, 1);
				if (group.activeEditor?.uri.toString() === uri.toString()) {
					(group as { activeEditor: IEditorModel | undefined }).activeEditor =
						group.editors[0];
					this._onDidChangeActiveEditor.fire({
						uri: group.activeEditor?.uri
					});
				}
				break;
			}
		}
	}

	/**
	 * Gets the active editor.
	 */
	getActiveEditor(): IEditorModel | undefined {
		const group = this.groups.find((g) => g.id === this.activeGroupId);
		return group?.activeEditor;
	}

	/**
	 * Checks if a file is dirty.
	 */
	isDirty(uri: monaco.Uri): boolean {
		return this.dirtyUris.has(uri.toString());
	}

	/**
	 * Sets the dirty state of a file.
	 */
	setDirty(uri: monaco.Uri, dirty: boolean): void {
		const uriString = uri.toString();
		const wasDirty = this.dirtyUris.has(uriString);

		if (dirty) {
			this.dirtyUris.add(uriString);
		} else {
			this.dirtyUris.delete(uriString);
		}

		if (wasDirty !== dirty) {
			this._onDidChangeDirty.fire({ uri, dirty });
		}
	}

	/**
	 * Gets all dirty files.
	 */
	getDirtyFiles(): monaco.Uri[] {
		return Array.from(this.dirtyUris).map((uriString) => monaco.Uri.parse(uriString));
	}

	/**
	 * Saves a file (clears dirty state).
	 */
	save(uri: monaco.Uri): void {
		this.setDirty(uri, false);
	}

	/**
	 * Gets all models.
	 */
	getAllModels(): monaco.editor.ITextModel[] {
		return Array.from(this.models.values());
	}

	/**
	 * Disposes the service.
	 */
	dispose(): void {
		for (const model of this.models.values()) {
			model.dispose();
		}
		this.models.clear();
		this.dirtyUris.clear();
		this.groups.length = 0;
		this._onDidChangeDirty.dispose();
		this._onDidChangeActiveEditor.dispose();
	}
}
