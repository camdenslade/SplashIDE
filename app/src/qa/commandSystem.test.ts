/**
 * Command System Tests
 * 
 * Test scaffold for command system functionality.
 * 
 * @remarks
 * This file provides test scaffolds for verifying command registration,
 * execution, and keybinding resolution.
 */

import { ServiceTestHarness, assertContains } from './testUtils';
import { ICommandService, IKeybindingService, ICommand } from '../common/models/services';

/**
 * Tests command registration.
 */
export async function testCommandRegistration(): Promise<void> {
	const harness = new ServiceTestHarness();

	harness.registerService(ICommandService, () => {
		const commands = new Map<string, ICommand>();
		return {
			registerCommand: (command) => {
				commands.set(command.id, command);
				return { dispose: () => commands.delete(command.id) };
			},
			executeCommand: async <T>(id: string): Promise<T> => {
				const cmd = commands.get(id);
				if (!cmd) {
					throw new Error(`Command not found: ${id}`);
				}
				// Return undefined as the generic type to satisfy signature
				return undefined as unknown as T;
			},
			getCommands: () => Array.from(commands.values())
		};
	});

	const commandService = harness.getService(ICommandService);

	// Register a test command
	const disposable = commandService.registerCommand({
		id: 'test.command',
		title: 'Test Command',
		handler: {
			execute: async () => {}
		}
	});

	// Verify command is registered
	const commands = commandService.getCommands();
	assertContains(
		commands.map((c) => c.id),
		'test.command',
		'Command should be registered'
	);

	disposable.dispose();
}

/**
 * Tests keybinding resolution.
 */
export async function testKeybindingResolution(): Promise<void> {
	const harness = new ServiceTestHarness();

	harness.registerService(ICommandService, () => ({
		registerCommand: () => ({ dispose: () => {} }),
		executeCommand: async <T>(): Promise<T> => undefined as unknown as T,
		getCommands: () => []
	}));

	harness.registerService(IKeybindingService, () => {
		const commandService = harness.getService(ICommandService);
		const keybindings = new Map<string, string>();
		return {
			registerKeybinding: (kb: { key: string; command: string }) => {
				keybindings.set(kb.key, kb.command);
				return { dispose: () => keybindings.delete(kb.key) };
			},
			executeKeybinding: async (key: string) => {
				const command = keybindings.get(key);
				if (command) {
					await commandService.executeCommand(command);
				}
			},
			setContextKey: () => {},
			getContextKey: () => false
		};
	});

	const keybindingService = harness.getService(IKeybindingService);

	// Register a test keybinding
	const disposable = keybindingService.registerKeybinding({
		key: 'Control+K',
		command: 'test.command',
		when: undefined
	});

	// Verify keybinding can be executed
	await keybindingService.executeKeybinding('Control+K');

	disposable.dispose();
}
