/**
 * Keybinding Conflict Resolution Tests
 * 
 * Test scaffolds for keybinding conflict scenarios.
 */

import { ServiceTestHarness, assert } from '../testUtils';
import { IKeybindingService, ICommandService } from '../../common/models/services';

/**
 * Tests keybinding conflict detection.
 */
export async function testKeybindingConflictDetection(): Promise<void> {
	const harness = new ServiceTestHarness();

	harness.registerService(ICommandService, () => ({
		registerCommand: () => ({ dispose: () => {} }),
		executeCommand: async <T>(): Promise<T> => undefined as unknown as T,
		getCommands: () => []
	}));

	harness.registerService(IKeybindingService, () => {
		const commandService = harness.getService(ICommandService);
		const keybindings = new Map<string, string[]>();
		return {
			registerKeybinding: (kb: { key: string; command: string }) => {
				const existing = keybindings.get(kb.key) ?? [];
				existing.push(kb.command);
				keybindings.set(kb.key, existing);
				return { dispose: () => {} };
			},
			executeKeybinding: async (key: string) => {
				const commands = keybindings.get(key) ?? [];
				// Execute the first command for the key if any exist
				if (commands[0]) {
					await commandService.executeCommand(commands[0]);
				}
			},
			setContextKey: () => {},
			getContextKey: () => false
		};
	});

	const keybindingService = harness.getService(IKeybindingService);

	// Register conflicting keybindings
	keybindingService.registerKeybinding({
		key: 'Control+K',
		command: 'command1',
		when: undefined
	});

	keybindingService.registerKeybinding({
		key: 'Control+K',
		command: 'command2',
		when: undefined
	});

	// Test that conflicts are detected
	assert(true, 'Keybinding conflict detection test scaffold');
}

/**
 * Tests keybinding priority resolution.
 */
export async function testKeybindingPriorityResolution(): Promise<void> {
	// Test that keybinding conflicts are resolved by priority
	assert(true, 'Keybinding priority resolution test scaffold');
}
