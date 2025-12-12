//********************************************************************
//
// ExtensionActivationEvent Enum
//
// Enumeration of extension activation timing events. Defines when
// extensions should be activated in the application lifecycle.
//
// Return Value
// ------------
// None (enum definition)
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

import { IExtension, IExtensionManifest } from './extensionManifest';
import { AgentDefinition } from '../../common/types/agent';
import { IDisposable } from '../../common/types/disposable';

export enum ExtensionActivationEvent {
	onStartupFinished = 'onStartupFinished',
	onWorkspaceOpen = 'onWorkspaceOpen',
	onCommand = 'onCommand'
}

//********************************************************************
//
// ExtensionRegistry Class
//
// VS Code-style extension registry for managing builtin and user
// extensions. Provides extension registration, validation, activation,
// and error isolation. Extensions cannot crash the workbench - errors
// are caught and logged.
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
// extensions              Map<string, IExtension>            Map of extension name to extension
// agents                  Map<string, AgentDefinition>       Map of agent name to agent definition
// activatedExtensions     Set<string>                        Set of activated extension names
// extensionDisposables    Map<string, IDisposable[]>         Map of extension name to disposables
//
//*******************************************************************

class ExtensionRegistry {
	private readonly extensions = new Map<string, IExtension>();
	private readonly agents = new Map<string, AgentDefinition>();
	private readonly activatedExtensions = new Set<string>();
	private readonly extensionDisposables = new Map<string, IDisposable[]>();

	private validateManifest(manifest: IExtensionManifest): string[] {
		const errors: string[] = [];

		if (!manifest.name || typeof manifest.name !== 'string') {
			errors.push('Extension name is required and must be a string');
		}

		if (!manifest.displayName || typeof manifest.displayName !== 'string') {
			errors.push('Extension displayName is required and must be a string');
		}

		if (!manifest.version || typeof manifest.version !== 'string') {
			errors.push('Extension version is required and must be a string');
		}

		if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
			errors.push('Extension version must follow semver format (x.y.z)');
		}

		if (manifest.contributes?.agents) {
			for (const agent of manifest.contributes.agents) {
				if (!agent.name || typeof agent.name !== 'string') {
					errors.push('Agent name is required and must be a string');
				}
			}
		}

		if (manifest.contributes?.fileSystemProviders) {
			for (const provider of manifest.contributes.fileSystemProviders) {
				if (!provider.scheme || typeof provider.scheme !== 'string') {
					errors.push('File system provider scheme is required and must be a string');
				}
				if (!provider.provider || typeof provider.provider !== 'function') {
					errors.push('File system provider factory is required and must be a function');
				}
			}
		}

		return errors;
	}

	registerExtension(extension: IExtension): void {
		const errors = this.validateManifest(extension.manifest);
		if (errors.length > 0) {
			throw new Error(`Invalid extension manifest for ${extension.manifest.name}: ${errors.join(', ')}`);
		}

		if (this.extensions.has(extension.manifest.name)) {
			console.warn(`Extension already registered: ${extension.manifest.name}`);
			return;
		}

		this.extensions.set(extension.manifest.name, extension);

		// Register agents from extension
		if (extension.manifest.contributes?.agents) {
			for (const agent of extension.manifest.contributes.agents) {
				this.registerAgent(agent);
			}
		}

		// Register file system providers from extension
		if (extension.manifest.contributes?.fileSystemProviders) {
			// Providers are registered during activation
			// This is handled in the activation phase
		}
	}

	/**
	 * Registers an agent.
	 */
	registerAgent(agent: AgentDefinition): void {
		if (this.agents.has(agent.name)) {
			console.warn(`Agent already registered: ${agent.name}`);
			return;
		}
		this.agents.set(agent.name, agent);
	}

	/**
	 * Gets an agent by name.
	 */
	getAgent(name: string): AgentDefinition | undefined {
		return this.agents.get(name);
	}

	/**
	 * Gets all agents.
	 */
	getAllAgents(): AgentDefinition[] {
		return Array.from(this.agents.values());
	}

	/**
	 * Gets all extensions.
	 */
	getAllExtensions(): IExtension[] {
		return Array.from(this.extensions.values());
	}

	/**
	 * Activates an extension with error isolation.
	 * 
	 * @param name - Extension name
	 * @param event - Activation event
	 * @throws Error if extension not found (but not if activation fails)
	 */
	async activateExtension(name: string, _event?: ExtensionActivationEvent): Promise<void> {
		void _event;
		const extension = this.extensions.get(name);
		if (!extension) {
			throw new Error(`Extension not found: ${name}`);
		}

		// Skip if already activated
		if (this.activatedExtensions.has(name)) {
			return;
		}

		try {
			await extension.activate();
			this.activatedExtensions.add(name);
		} catch (error: unknown) {
			// Error isolation: extension failures don't crash workbench
			console.error(`Error activating extension ${name}:`, error);
			// Don't rethrow - extension activation failure is non-fatal
		}
	}

	/**
	 * Activates all extensions with error isolation.
	 * 
	 * @param event - Activation event
	 */
	async activateAll(_event?: ExtensionActivationEvent): Promise<void> {
		void _event;
		const activationPromises = Array.from(this.extensions.values()).map(async (extension) => {
			if (this.activatedExtensions.has(extension.manifest.name)) {
				return;
			}

			try {
				await extension.activate();
				this.activatedExtensions.add(extension.manifest.name);
			} catch (error: unknown) {
				// Error isolation: extension failures don't crash workbench
				console.error(`Error activating extension ${extension.manifest.name}:`, error);
			}
		});

		await Promise.all(activationPromises);
	}

	/**
	 * Deactivates an extension.
	 * 
	 * @param name - Extension name
	 */
	async deactivateExtension(name: string): Promise<void> {
		const extension = this.extensions.get(name);
		if (!extension || !extension.deactivate) {
			return;
		}

		try {
			await extension.deactivate();
			this.activatedExtensions.delete(name);

			// Dispose extension resources
			const disposables = this.extensionDisposables.get(name);
			if (disposables) {
				for (const disposable of disposables) {
					disposable.dispose();
				}
				this.extensionDisposables.delete(name);
			}
		} catch (error: unknown) {
			console.error(`Error deactivating extension ${name}:`, error);
		}
	}

	/**
	 * Adds a disposable resource for an extension.
	 * 
	 * @param extensionName - Extension name
	 * @param disposable - Disposable resource
	 */
	addExtensionDisposable(extensionName: string, disposable: IDisposable): void {
		if (!this.extensionDisposables.has(extensionName)) {
			this.extensionDisposables.set(extensionName, []);
		}
		this.extensionDisposables.get(extensionName)?.push(disposable);
	}
}

//********************************************************************
//
// extensionRegistry Constant
//
// Singleton instance of ExtensionRegistry for managing all extensions
// throughout the application. Provides centralized extension registration,
// activation, and management.
//
// Return Value
// ------------
// ExtensionRegistry    The singleton extension registry instance
//
// Value Parameters
// ----------------
// None (constant definition)
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

export const extensionRegistry = new ExtensionRegistry();
