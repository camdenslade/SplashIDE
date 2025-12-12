/**
 * Test Utilities
 * 
 * Utility functions for testing services, IPC, and commands.
 * 
 * @remarks
 * Provides test harness utilities for verifying service behavior,
 * IPC communication, and command/keybinding registration.
 */

import { InstantiationService } from '../common/models/instantiation';
import { ServiceIdentifier } from '../common/types/serviceIdentifier';

/**
 * Test harness for service testing.
 */
export class ServiceTestHarness {
	private readonly instantiationService: InstantiationService;

	constructor() {
		this.instantiationService = new InstantiationService();
	}

	/**
	 * Registers a service for testing.
	 */
	registerService<T>(id: ServiceIdentifier<T>, factory: () => T): void {
		this.instantiationService.registerService({
			id,
			factory,
			singleton: true
		});
	}

	/**
	 * Gets a service for testing.
	 */
	getService<T>(id: ServiceIdentifier<T>): T {
		return this.instantiationService.get(id);
	}
}

/**
 * Asserts that a value is not null or undefined.
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): asserts value is T {
	if (value === null || value === undefined) {
		throw new Error(message ?? 'Value is null or undefined');
	}
}

/**
 * Asserts that a condition is true.
 */
export function assert(condition: boolean, message?: string): asserts condition {
	if (!condition) {
		throw new Error(message ?? 'Assertion failed');
	}
}

/**
 * Asserts that two values are equal.
 */
export function assertEqual<T>(actual: T, expected: T, message?: string): void {
	if (actual !== expected) {
		throw new Error(message ?? `Expected ${expected}, got ${actual}`);
	}
}

/**
 * Asserts that an array contains an item.
 */
export function assertContains<T>(array: T[], item: T, message?: string): void {
	if (!array.includes(item)) {
		throw new Error(message ?? `Array does not contain ${item}`);
	}
}

/**
 * Waits for a promise to resolve or reject.
 */
export async function waitFor<T>(
	predicate: () => T | Promise<T>,
	timeout: number = 5000
): Promise<T> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		const result = await predicate();
		if (result) {
			return result;
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error('Timeout waiting for predicate');
}

/**
 * Mocks an IPC channel response.
 */
export function mockIpcResponse<TRequest, TResponse>(
	_channel: string,
	_handler: (request: TRequest) => TResponse | Promise<TResponse>
): () => void {
	// This would be implemented with actual IPC mocking in a real test environment
	return () => {
		// Cleanup
	};
}
