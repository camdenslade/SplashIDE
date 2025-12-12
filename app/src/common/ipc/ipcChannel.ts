//********************************************************************
//
// IpcRequestHandler Type
//
// IPC request handler function type. Handles requests from the renderer
// process and returns a response. Can be either synchronous or asynchronous.
//
// Return Value
// ------------
// None (type definition)
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

import { Event } from '../types/event';

export type IpcRequestHandler<TRequest = unknown, TResponse = unknown> = (
	request: TRequest
) => Promise<TResponse> | TResponse;

//********************************************************************
//
// IpcEventHandler Type
//
// IPC event handler function type. Handles events emitted from the
// main process to the renderer process.
//
// Return Value
// ------------
// None (type definition)
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

export type IpcEventHandler<TEvent = unknown> = (event: TEvent) => void;

//********************************************************************
//
// IIpcChannel Interface
//
// IPC channel interface following VS Code's pattern for type-safe
// inter-process communication. Channels define strongly-typed request/
// response contracts. Follows VS Code's pattern with named channels
// with unique identifiers, request/response pattern for synchronous
// operations, event emission for asynchronous notifications, and
// strongly-typed message contracts. Channels are registered in the
// IpcChannelRegistry and can be accessed by both main and renderer
// processes via typed interfaces.
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

export interface IIpcChannel<TRequest = unknown, TResponse = unknown, TEvent = unknown> {
	readonly channelName: string;
	handle(handler: IpcRequestHandler<TRequest, TResponse>): void;
	fire(event: TEvent): void;
	readonly onEvent: Event<TEvent>;
}

//********************************************************************
//
// IpcChannelRegistry Class
//
// IPC channel registry for managing all channels. Central registry for
// all IPC channels. Channels must be registered before they can be used.
// This ensures all channels are properly initialized and typed.
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
// channels    Map<string, IIpcChannel>    Map of channel name to channel instance
//
//*******************************************************************

export class IpcChannelRegistry {
	private static readonly channels = new Map<string, IIpcChannel>();

	static register<TRequest, TResponse, TEvent>(
		channel: IIpcChannel<TRequest, TResponse, TEvent>
	): void {
		if (this.channels.has(channel.channelName)) {
			throw new Error(`IPC channel already registered: ${channel.channelName}`);
		}
		this.channels.set(channel.channelName, channel);
	}

	static get<TRequest, TResponse, TEvent>(
		channelName: string
	): IIpcChannel<TRequest, TResponse, TEvent> | undefined {
		return this.channels.get(channelName) as IIpcChannel<TRequest, TResponse, TEvent> | undefined;
	}

	static getAll(): IIpcChannel[] {
		return Array.from(this.channels.values());
	}
}
