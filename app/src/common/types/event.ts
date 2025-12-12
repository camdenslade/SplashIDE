//********************************************************************
//
// Event Interface
//
// VS Code-style event interface for type-safe event handling. Allows
// listeners to be registered and returns a disposable for cleanup.
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

export interface Event<T> {
	(listener: (e: T) => void, thisArg?: unknown): { dispose(): void };
}

export interface EmitterOptions {
	onFirstListenerAdd?: Function;
	onLastListenerRemove?: Function;
}

//********************************************************************
//
// Emitter Class
//
// VS Code-style event emitter for type-safe event handling. Provides
// fire/event pattern with listener registration and lifecycle hooks.
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
// _options      EmitterOptions|undefined    Optional lifecycle hooks
// _listeners    Array<(e: T) => void>       Array of registered listeners
// _disposed     boolean                     Disposal state flag
//
//*******************************************************************

export class Emitter<T> {
	private readonly _options?: EmitterOptions;
	private _listeners: Array<(e: T) => void> = [];
	private _disposed = false;

	constructor(options?: EmitterOptions) {
		if (options !== undefined) {
			this._options = options;
		}
	}

	fire(event: T): void {
		if (this._disposed) {
			return;
		}
		for (const listener of this._listeners) {
			try {
				listener(event);
			} catch (error) {
				console.error('Error in event listener:', error);
			}
		}
	}

	event: Event<T> = (listener: (e: T) => void): { dispose(): void } => {
		if (this._disposed) {
			throw new Error('Emitter is disposed');
		}
		this._listeners.push(listener);
		if (this._listeners.length === 1 && this._options?.onFirstListenerAdd) {
			this._options.onFirstListenerAdd();
		}
		return {
			dispose: () => {
				const index = this._listeners.indexOf(listener);
				if (index !== -1) {
					this._listeners.splice(index, 1);
					if (this._listeners.length === 0 && this._options?.onLastListenerRemove) {
						this._options.onLastListenerRemove();
					}
				}
			}
		};
	};

	dispose(): void {
		this._listeners = [];
		this._disposed = true;
	}
}
