//********************************************************************
//
// KeybindingService Class
//
// VS Code-style keybinding service for keyboard shortcuts. Manages
// keyboard shortcuts and their associated commands. Keybindings can be
// conditional based on context keys. When a keybinding is triggered,
// it executes the associated command via the command service.
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
// keybindings    Map<string, IKeybinding>    Map of normalized key to keybinding
// contextKeys    Map<string, boolean>         Map of context key names to values
// commandService ICommandService              Command service for executing commands
//
//*******************************************************************

import {
	IKeybindingService,
	IKeybinding
} from '../../common/models/services';
import { IDisposable } from '../../common/types/disposable';
import { ICommandService } from '../../common/models/services';

export class KeybindingService implements IKeybindingService {
	private readonly keybindings = new Map<string, IKeybinding>();
	private readonly contextKeys = new Map<string, boolean>();

	constructor(private readonly commandService: ICommandService) {}

	registerKeybinding(keybinding: IKeybinding): IDisposable {
		const key = this.normalizeKey(keybinding.key);
		if (this.keybindings.has(key)) {
			console.warn(`Keybinding already registered: ${key}`);
		}
		this.keybindings.set(key, keybinding);
		return {
			dispose: () => {
				this.keybindings.delete(key);
			}
		};
	}

	async executeKeybinding(key: string): Promise<void> {
		const normalized = this.normalizeKey(key);
		const keybinding = this.keybindings.get(normalized);
		if (!keybinding) {
			return;
		}

		if (keybinding.when) {
			if (!this.evaluateContextKey(keybinding.when)) {
				return;
			}
		}

		await this.commandService.executeCommand(keybinding.command);
	}

	setContextKey(key: string, value: boolean): void {
		this.contextKeys.set(key, value);
	}

	getContextKey(key: string): boolean {
		return this.contextKeys.get(key) ?? false;
	}

	//********************************************************************
	//
	// evaluateContextKey Function
	//
	// Evaluates a context key expression. Supports simple boolean
	// expressions with context key names. Returns true if the expression
	// evaluates to true based on current context key values.
	//
	// Return Value
	// ------------
	// boolean    True if the context key expression evaluates to true
	//
	// Value Parameters
	// ----------------
	// expression    string    Context key expression to evaluate
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

	/**
	 * Evaluates a context key expression.
	 * 
	 * @param expression - Context key expression (e.g., "paletteOpen", "!paletteOpen", "paletteOpen && searchOpen")
	 * @returns Whether the expression evaluates to true
	 * 
	 * @remarks
	 * Supports simple expressions:
	 * - Single key: "paletteOpen"
	 * - Negation: "!paletteOpen"
	 * - AND: "paletteOpen && searchOpen"
	 * - OR: "paletteOpen || searchOpen"
	 */
	private evaluateContextKey(expression: string): boolean {
		// Simple context key evaluation
		// Support: key, !key, key1 && key2, key1 || key2
		const trimmed = expression.trim();

		// Handle negation
		if (trimmed.startsWith('!')) {
			return !this.evaluateContextKey(trimmed.substring(1).trim());
		}

		// Handle AND
		if (trimmed.includes('&&')) {
			const parts = trimmed.split('&&').map((p) => p.trim());
			return parts.every((part) => this.evaluateContextKey(part));
		}

		// Handle OR
		if (trimmed.includes('||')) {
			const parts = trimmed.split('||').map((p) => p.trim());
			return parts.some((part) => this.evaluateContextKey(part));
		}

		// Simple key check
		return this.contextKeys.get(trimmed) === true;
	}

	/**
	 * Normalizes a key string (e.g., "Control+S" -> "ctrl+s").
	 */
	private normalizeKey(key: string): string {
		return key.toLowerCase().replace(/control/g, 'ctrl').replace(/command/g, 'cmd');
	}
}
