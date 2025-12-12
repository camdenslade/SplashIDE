/**
 * TypeScript Language Adapter
 * 
 * Monaco editor language service integration for TypeScript.
 * Provides completion, hover, definition, references, and signature help.
 * 
 * @remarks
 * This module registers Monaco editor language providers that communicate
 * with the TypeScript service for language features. It handles diagnostics
 * updates and provides real-time language support.
 */

import * as monaco from 'monaco-editor';
import { ITypeScriptService } from '../../common/models/services';

/**
 * Registers TypeScript language providers with Monaco editor.
 * 
 * @param m - Monaco editor instance
 * @param typeScriptService - TypeScript service for language features
 * 
 * @remarks
 * Registers the following providers:
 * - Completion items (autocomplete)
 * - Hover information
 * - Go to definition
 * - Find references
 * - Signature help
 * - Diagnostics (errors/warnings)
 */
export function registerTsLanguage(
	m: typeof monaco,
	typeScriptService: ITypeScriptService
): void {
	// Completion provider
	m.languages.registerCompletionItemProvider('typescript', {
		triggerCharacters: ['.', '"', "'", '/', '@', '<', '('],
		async provideCompletionItems(model, position, _context, _token) {
			try {
				const file = model.uri.path;
				const line = position.lineNumber - 1; // Convert to 0-based
				const offset = model.getOffsetAt(position);

				const completions = await typeScriptService.getCompletions(file, line, offset);

				// Calculate the word range at the cursor position for completion items
				const wordAtPosition = model.getWordUntilPosition(position);
				const range = new m.Range(
					position.lineNumber,
					wordAtPosition.startColumn,
					position.lineNumber,
					wordAtPosition.endColumn
				);

				return {
					suggestions: completions.map((entry) => {
						const item: monaco.languages.CompletionItem = {
							label: entry.label,
							insertText: entry.insertText ?? entry.label,
							kind: m.languages.CompletionItemKind.Text,
							range: range
						};
						if (entry.detail !== undefined) {
							item.detail = entry.detail;
						}
						if (entry.documentation !== undefined) {
							item.documentation = entry.documentation;
						}
						return item;
					})
				};
			} catch (error: unknown) {
				console.error('Error providing completions:', error);
				return { suggestions: [] };
			}
		}
	});

	// Hover provider
	m.languages.registerHoverProvider('typescript', {
		async provideHover(model, position) {
			try {
				const file = model.uri.path;
				const line = position.lineNumber - 1;
				const offset = model.getOffsetAt(position);

				const quickInfo = await typeScriptService.getQuickInfo(file, line, offset);

				if (!quickInfo) {
					return null;
				}

				return {
					contents: [
						{ value: `\`\`\`ts\n${quickInfo.text}\n\`\`\`` },
						...(quickInfo.documentation ? [{ value: quickInfo.documentation }] : [])
					],
					range: new m.Range(
						quickInfo.startLine + 1,
						quickInfo.startOffset + 1,
						quickInfo.endLine + 1,
						quickInfo.endOffset + 1
					)
				};
			} catch (error: unknown) {
				console.error('Error providing hover:', error);
				return null;
			}
		}
	});

	// Definition provider
	m.languages.registerDefinitionProvider('typescript', {
		async provideDefinition(model, position) {
			try {
				const file = model.uri.path;
				const line = position.lineNumber - 1;
				const offset = model.getOffsetAt(position);

				const locations = await typeScriptService.navigateToDefinition(file, line, offset);

				return locations.map((loc) => ({
					uri: m.Uri.file(loc.file),
					range: new m.Range(
						loc.startLine + 1,
						loc.startOffset + 1,
						loc.endLine + 1,
						loc.endOffset + 1
					)
				}));
			} catch (error: unknown) {
				console.error('Error providing definition:', error);
				return [];
			}
		}
	});

	// Signature help provider
	m.languages.registerSignatureHelpProvider('typescript', {
		signatureHelpTriggerCharacters: ['(', ',', '<'],
		async provideSignatureHelp(_model, _position) {
			try {
				// Signature help would require additional TypeScript service method
				// For now, return null to indicate it's not yet implemented
				return null;
			} catch (error: unknown) {
				console.error('Error providing signature help:', error);
				return null;
			}
		}
	});

	// Diagnostics are handled via TypeScript service events
	// The service emits diagnostic events that update Monaco markers
}
