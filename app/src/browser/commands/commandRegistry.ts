//********************************************************************
//
// CommandDescriptor Interface
//
// Command descriptor for registration in the command registry.
// Defines the command ID, title, and handler function.
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

import { ICommand, ICommandHandler } from '../../common/models/services';

export interface CommandDescriptor {
	readonly id: string;
	readonly title: string;
	readonly handler: ICommandHandler;
}

//********************************************************************
//
// CommandRegistry Class
//
// Central command registry following VS Code's pattern. Commands are
// registered here and can be retrieved for execution via the command
// service. Provides a centralized location for all command definitions.
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

class CommandRegistry {
	private readonly commands = new Map<string, ICommand>();

	register(descriptor: CommandDescriptor): void {
		if (this.commands.has(descriptor.id)) {
			console.warn(`Command already registered: ${descriptor.id}`);
		}
		this.commands.set(descriptor.id, {
			id: descriptor.id,
			title: descriptor.title,
			handler: descriptor.handler
		});
	}

	get(id: string): ICommand | undefined {
		return this.commands.get(id);
	}

	getAll(): ICommand[] {
		return Array.from(this.commands.values());
	}
}

//********************************************************************
//
// commandRegistry Constant
//
// Singleton instance of CommandRegistry for managing all commands
// throughout the application. Provides centralized command registration
// and retrieval.
//
// Return Value
// ------------
// CommandRegistry    The singleton command registry instance
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

export const commandRegistry = new CommandRegistry();
