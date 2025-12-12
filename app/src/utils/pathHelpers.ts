//********************************************************************
//
// getExtension Function
//
// Gets the file extension from a path. Returns the extension without
// the leading dot, in lowercase. Returns empty string if no extension.
//
// Return Value
// ------------
// string    File extension in lowercase (without leading dot)
//
// Value Parameters
// ----------------
// filePath    string    File path to extract extension from
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// ext    string    Extension with leading dot
//
//*******************************************************************

import * as path from "path";

export function getExtension(filePath: string): string {
  const ext = path.extname(filePath);
  return ext ? ext.slice(1).toLowerCase() : "";
	}

//********************************************************************
//
// getFileName Function
//
// Gets the file name (base name) from a path. Returns just the
// filename portion without the directory path.
//
// Return Value
// ------------
// string    File name (base name) from the path
//
// Value Parameters
// ----------------
// filePath    string    File path to extract name from
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

export function getFileName(filePath: string): string {
  return path.basename(filePath);
	}

//********************************************************************
//
// getDirName Function
//
// Gets the directory name from a path. Returns the directory portion
// of the path containing the file.
//
// Return Value
// ------------
// string    Directory name (parent directory) from the path
//
// Value Parameters
// ----------------
// filePath    string    File path to extract directory from
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

export function getDirName(filePath: string): string {
  return path.dirname(filePath);
	}

//********************************************************************
//
// normalizePath Function
//
// Normalizes a path for comparison. Normalizes the path using
// Node.js path.normalize and converts all backslashes to forward
// slashes for consistent cross-platform comparison.
//
// Return Value
// ------------
// string    Normalized path with forward slashes
//
// Value Parameters
// ----------------
// filePath    string    File path to normalize
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

export function normalizePath(filePath: string): string {
  return path.normalize(filePath).replace(/\\/g, "/");
	}

//********************************************************************
//
// isWithinRoot Function
//
// Checks if a path is within a root directory. Normalizes both paths
// and checks if the file path starts with the root path. Used for
// security checks to ensure files are within allowed directories.
//
// Return Value
// ------------
// boolean    True if the file path is within the root directory
//
// Value Parameters
// ----------------
// filePath    string    File path to check
// root        string    Root directory path
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// normalizedPath    string    Normalized file path
// normalizedRoot    string    Normalized root path
//
//*******************************************************************

export function isWithinRoot(filePath: string, root: string): boolean {
  const normalizedPath = normalizePath(filePath);
  const normalizedRoot = normalizePath(root);
  return normalizedPath.startsWith(normalizedRoot);
	}

//********************************************************************
//
// getRelativePath Function
//
// Gets the relative path from a root directory. Returns the path
// relative to the root using Node.js path.relative. Returns the
// original path if an error occurs during calculation.
//
// Return Value
// ------------
// string    Relative path from root, or original path on error
//
// Value Parameters
// ----------------
// filePath    string    File path to make relative
// root        string    Root directory to calculate relative from
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

export function getRelativePath(filePath: string, root: string): string {
  try {
    return path.relative(root, filePath);
  } catch {
    return filePath;
  }
	}

//********************************************************************
//
// joinPaths Function
//
// Joins multiple path segments safely using Node.js path.join.
// Handles cross-platform path separators correctly.
//
// Return Value
// ------------
// string    Joined path
//
// Value Parameters
// ----------------
// paths    ...string[]    Variable number of path segments to join
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

export function joinPaths(...paths: string[]): string {
  return path.join(...paths);
	}

//********************************************************************
//
// isAbsolute Function
//
// Checks if a path is absolute using Node.js path.isAbsolute.
// Returns true if the path is an absolute path, false if relative.
//
// Return Value
// ------------
// boolean    True if the path is absolute
//
// Value Parameters
// ----------------
// filePath    string    File path to check
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

export function isAbsolute(filePath: string): boolean {
  return path.isAbsolute(filePath);
}

