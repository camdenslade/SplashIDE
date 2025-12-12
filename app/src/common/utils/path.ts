//********************************************************************
//
// toFileURI Function
//
// Converts a file system path to a file:// URI. Only normalizes
// backslashes to forward slashes - no other manipulation. Creates
// a URI object with the file:// scheme.
//
// Return Value
// ------------
// URI    URI object with file:// scheme
//
// Value Parameters
// ----------------
// fsPath    string    File system path (e.g., "C:\Users\file.txt" or "/home/file.txt")
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// normalized    string    Path with backslashes normalized to forward slashes
//
//*******************************************************************

import { URI } from '../types/uri';

export function toFileURI(fsPath: string): URI {
	const normalized = fsPath.replace(/\\/g, '/');
	return URI.parse(`file:///${normalized}`);
	}

//********************************************************************
//
// toURI Function
//
// Converts a URI or path string to a URI object. If already a URI,
// returns it. If a string path, converts to file URI. Handles both
// URI strings (with scheme) and plain file system paths.
//
// Return Value
// ------------
// URI    URI object
//
// Value Parameters
// ----------------
// pathOrUri    string|URI    Either a URI object or a file system path string
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

export function toURI(pathOrUri: string | URI): URI {
	if (pathOrUri instanceof URI) {
		return pathOrUri;
	}
	
	// Check if it's already a URI string
	if (pathOrUri.includes('://')) {
		return URI.parse(pathOrUri);
	}
	
	// Otherwise treat as file path
	return toFileURI(pathOrUri);
}

