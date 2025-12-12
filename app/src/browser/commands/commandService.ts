//********************************************************************
//
// CommandService Class
//
// VS Code-style command service implementation for the browser (renderer)
// process. Manages command registration and execution. Commands are
// identified by string IDs and executed via executeCommand. All commands
// must implement ICommandHandler. Commands are stored in a Map for O(1)
// lookup by ID.
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
// commands    Map<string, ICommand>    Map of command ID to command definition
//
//*******************************************************************

import {
	ICommandService,
	ICommand as ICommandModel
} from '../../common/models/services';
import { IDisposable } from '../../common/types/disposable';

export class CommandService implements ICommandService {
	private readonly commands = new Map<string, ICommandModel>();

	registerCommand(command: ICommandModel): IDisposable {
		if (this.commands.has(command.id)) {
			console.warn(`Command already registered: ${command.id}`);
		}
		this.commands.set(command.id, command);
		return {
			dispose: () => {
				this.commands.delete(command.id);
			}
		};
	}

	async executeCommand<T = unknown>(id: string, ...args: unknown[]): Promise<T> {
		const command = this.commands.get(id);
		if (!command) {
			throw new Error(`Command not found: ${id}`);
		}
		const result = await command.handler.execute(...args);
		return result as T;
	}

	getCommands(): ICommandModel[] {
		return Array.from(this.commands.values());
	}
}
