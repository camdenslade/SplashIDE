//********************************************************************
//
// FileNode Interface
//
// VS Code-style file system node interface. Represents a file or
// folder in the file tree with metadata such as name, path, type,
// children, size, modification time, and permissions.
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

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: number;
  modified?: number;
  extension?: string;
  depth?: number;
  isSymlink?: boolean;
  isReadable?: boolean;
  isWritable?: boolean;
  error?: string;
}

//********************************************************************
//
// FileStats Interface
//
// File statistics interface. Contains file system metadata including
// size, timestamps, and file type flags (directory, file, symlink,
// permissions).
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

export interface FileStats {
  size: number;
  modified: number;
  created?: number;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink: boolean;
  isReadable: boolean;
  isWritable: boolean;
}

//********************************************************************
//
// TreeOptions Interface
//
// Options for tree traversal and file system operations. Controls
// behavior such as maximum depth, stat inclusion, symlink following,
// and filtering.
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

export interface TreeOptions {
  maxDepth?: number;
  includeStats?: boolean;
  followSymlinks?: boolean;
  filter?: (node: FileNode) => boolean;
}

//********************************************************************
//
// ExpandResult Interface
//
// Result interface for folder expansion operations. Contains the
// children nodes and whether the result was from cache.
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

export interface ExpandResult {
  children: FileNode[];
  cached: boolean;
}

//********************************************************************
//
// FileSystemError Interface
//
// File system error interface. Represents an error that occurred
// during file system operations, including error code, message,
// and the path where the error occurred.
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

export interface FileSystemError {
  code: string;
  message: string;
  path: string;
}

const MAX_VALIDATION_DEPTH = 100;

//********************************************************************
//
// validateFileNode Function
//
// Validates and sanitizes a FileNode to ensure it's safe to use.
// Recursively validates node structure, type safety, and prevents
// deep recursion. Returns null for invalid nodes.
//
// Return Value
// ------------
// FileNode|null    Validated FileNode or null if invalid
//
// Value Parameters
// ----------------
// node    any          Node object to validate
// depth   number       Current validation depth (default: 0)
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// validated    FileNode    Validated and sanitized node object
//
//*******************************************************************

export function validateFileNode(node: any, depth: number = 0): FileNode | null {
  try {
    if (depth > MAX_VALIDATION_DEPTH) {
      console.error(`[DEBUG] validateFileNode: Max depth reached (${MAX_VALIDATION_DEPTH})`);
      return null;
    }
    
    if (!node || typeof node !== "object") return null;
    
    if (typeof node.name !== "string" || node.name.length === 0) return null;
    if (typeof node.path !== "string" || node.path.length === 0) return null;
    if (node.type !== "file" && node.type !== "folder") return null;
    
    const validated: FileNode = {
      name: node.name,
      path: node.path,
      type: node.type,
    };
    
    if (node.children !== undefined) {
      if (Array.isArray(node.children)) {
        // Limit children validation to prevent deep recursion
        if (node.children.length > 10000) {
          console.warn(`[DEBUG] validateFileNode: Too many children (${node.children.length}), limiting validation`);
          validated.children = [];
        } else {
          validated.children = node.children
            .map((child: any) => validateFileNode(child, depth + 1))
            .filter((n: FileNode | null): n is FileNode => n !== null);
        }
      } else {
        validated.children = [];
      }
    }
  
  if (typeof node.size === "number" && node.size >= 0) {
    validated.size = node.size;
  }
  
  if (typeof node.modified === "number" && node.modified > 0) {
    validated.modified = node.modified;
  }
  
    if (typeof node.size === "number" && node.size >= 0) {
      validated.size = node.size;
    }
    
    if (typeof node.modified === "number" && node.modified > 0) {
      validated.modified = node.modified;
    }
    
    if (typeof node.extension === "string") {
      validated.extension = node.extension;
    }
    
    if (typeof node.depth === "number" && node.depth >= 0) {
      validated.depth = node.depth;
    }
    
    if (typeof node.isSymlink === "boolean") {
      validated.isSymlink = node.isSymlink;
    }
    
    if (typeof node.isReadable === "boolean") {
      validated.isReadable = node.isReadable;
    }
    
    if (typeof node.isWritable === "boolean") {
      validated.isWritable = node.isWritable;
    }
    
    if (typeof node.error === "string") {
      validated.error = node.error;
    }
    
    return validated;
  } catch (error: any) {
    console.error(`[DEBUG] validateFileNode: Error validating node:`, error?.message || error);
    console.error(`[DEBUG] validateFileNode: Stack:`, error?.stack);
    return null;
  }
}

//********************************************************************
//
// validateFileNodeArray Function
//
// Validates an array of FileNodes. Maps each node through validateFileNode
// and filters out any null results. Returns an empty array if the input
// is not an array.
//
// Return Value
// ------------
// FileNode[]    Array of validated FileNodes
//
// Value Parameters
// ----------------
// nodes    any    Array of node objects to validate
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

export function validateFileNodeArray(nodes: any): FileNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map(validateFileNode).filter((n): n is FileNode => n !== null);
}
