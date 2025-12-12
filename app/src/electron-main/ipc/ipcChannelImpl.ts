//********************************************************************
//
// IpcChannelImpl Class
//
// VS Code-style IPC channel implementation for the main process.
// Provides concrete implementation of IIpcChannel for Electron's
// main process. Handles IPC requests from the renderer process and
// fires events to the renderer process via the main window.
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
// handler        IpcRequestHandler|undefined    Request handler function
// eventEmitter   Emitter<TEvent>               Event emitter for channel events
// mainWindow     BrowserWindow|null            Main window for event firing
// channelName    string                        Unique channel name identifier
//
//*******************************************************************

import { BrowserWindow, ipcMain } from 'electron';
import { IIpcChannel, IpcRequestHandler, IpcChannelRegistry } from '../../common/ipc/ipcChannel';
import { Emitter } from '../../common/types/event';
import { Event } from '../../common/types/event';

export class IpcChannelImpl<TRequest = unknown, TResponse = unknown, TEvent = unknown>
	implements IIpcChannel<TRequest, TResponse, TEvent>
{
	private handler?: IpcRequestHandler<TRequest, TResponse>;
	private readonly eventEmitter = new Emitter<TEvent>();
	private mainWindow: BrowserWindow | null = null;

	constructor(public readonly channelName: string) {
		IpcChannelRegistry.register(this);
	}

	setMainWindow(window: BrowserWindow | null): void {
		this.mainWindow = window;
	}

	handle(handler: IpcRequestHandler<TRequest, TResponse>): void {
		this.handler = handler;
		ipcMain.handle(this.channelName, async (_event, request: TRequest) => {
			if (!this.handler) {
				throw new Error(`No handler registered for channel: ${this.channelName}`);
			}
			try {
				return await this.handler(request);
			} catch (error) {
				console.error(`Error in IPC handler for ${this.channelName}:`, error);
				throw error;
			}
		});
	}

	fire(event: TEvent): void {
		if (!this.mainWindow || this.mainWindow.isDestroyed()) {
			return;
		}
		try {
			this.mainWindow.webContents.send(this.channelName, event);
			this.eventEmitter.fire(event);
		} catch (error) {
			console.error(`Error firing event on channel ${this.channelName}:`, error);
		}
	}

	get onEvent(): Event<TEvent> {
		return this.eventEmitter.event;
	}
}
