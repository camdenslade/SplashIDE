//********************************************************************
//
// registerBuiltinExtensions Function
//
// Registers all builtin extensions with the extension registry. This
// includes agent extensions such as architect, documenter, db, deploy,
// reviewer, frontend, and backend.
//
// Return Value
// ------------
// void
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

import { extensionRegistry } from './extensionRegistry';
import { architectExtension } from './agents/architectExtension';
import { documenterExtension } from './agents/documenterExtension';
import { dbExtension } from './agents/dbExtension';
import { deployExtension } from './agents/deployExtension';
import { reviewerExtension } from './agents/reviewerExtension';
import { frontendExtension } from './agents/frontendExtension';
import { backendExtension } from './agents/backendExtension';

export function registerBuiltinExtensions(): void {
	extensionRegistry.registerExtension(architectExtension);
	extensionRegistry.registerExtension(documenterExtension);
	extensionRegistry.registerExtension(dbExtension);
	extensionRegistry.registerExtension(deployExtension);
	extensionRegistry.registerExtension(reviewerExtension);
	extensionRegistry.registerExtension(frontendExtension);
	extensionRegistry.registerExtension(backendExtension);
}

//********************************************************************
//
// activateBuiltinExtensions Function
//
// Registers all builtin extensions and then activates them. This should
// be called during application startup to initialize all builtin extensions.
//
// Return Value
// ------------
// Promise<void>
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

export async function activateBuiltinExtensions(): Promise<void> {
	registerBuiltinExtensions();
	await extensionRegistry.activateAll();
}
