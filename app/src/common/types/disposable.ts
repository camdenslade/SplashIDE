//********************************************************************
//
// IDisposable Interface
//
// VS Code-style disposable interface for resource cleanup. Provides
// a standard pattern for cleaning up resources such as event listeners,
// subscriptions, and other managed resources.
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

export interface IDisposable {
	dispose(): void;
}

//********************************************************************
//
// Disposable Namespace
//
// Utility functions for creating and managing disposable objects.
// Provides helpers for creating single disposables and combining
// multiple disposables into one.
//
// Return Value
// ------------
// None (namespace definition)
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

export namespace Disposable {
	export function create(fn: () => void): IDisposable {
		return { dispose: fn };
	}

	export function from(...disposables: IDisposable[]): IDisposable {
		return {
			dispose: () => {
				for (const disposable of disposables) {
					disposable.dispose();
				}
			}
		};
	}
}
