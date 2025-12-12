//********************************************************************
//
// getStats Function
//
// Gets file statistics with error handling. Safely retrieves file
// system stats including size, timestamps, file type, symlink status,
// and permissions. Returns null on any error to prevent crashes.
//
// Return Value
// ------------
// FileStats|null    File statistics or null on error
//
// Value Parameters
// ----------------
// filePath    string    Path to the file or directory
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// stat        fs.Stats      File system stats
// lstat       fs.Stats      Link stats for symlink detection
// isSymlink   boolean       Whether the path is a symbolic link
// isReadable  boolean       Whether the file is readable
// isWritable  boolean       Whether the file is writable
//
//*******************************************************************

import * as fs from "fs";
import * as path from "path";
import { FileNode, FileStats, TreeOptions, validateFileNode } from "./fileSystemTypes";
import { getExtension } from "./pathHelpers";

const MAX_DEPTH = 100;
const MAX_ENTRIES_PER_DIR = 100000;

function getStats(filePath: string): FileStats | null {
  try {
    const stat = fs.statSync(filePath, { throwIfNoEntry: false });
    if (!stat) return null;
    
    const lstat = fs.lstatSync(filePath);
    const isSymlink = lstat.isSymbolicLink();
    
    // Check permissions safely
    let isReadable = true;
    let isWritable = false;
    
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
    } catch {
      isReadable = false;
    }
    
    try {
      fs.accessSync(filePath, fs.constants.W_OK);
      isWritable = true;
    } catch {
      isWritable = false;
    }
    
    return {
      size: stat.size,
      modified: stat.mtimeMs,
      created: stat.birthtimeMs,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
      isSymlink,
      isReadable,
      isWritable,
    };
  } catch (error: any) {
    return null;
  }
}

//********************************************************************
//
// readDirectory Function
//
// Reads directory entries with error handling. Safely reads directory
// contents and filters to ensure string array return type. Returns
// empty array on any error.
//
// Return Value
// ------------
// string[]    Array of directory entry names
//
// Value Parameters
// ----------------
// dirPath    string    Path to the directory
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// entries    string[]|Buffer[]    Raw directory entries
// filtered   string[]             Filtered string entries
//
//*******************************************************************

function readDirectory(dirPath: string): string[] {
  try {
    const entries = fs.readdirSync(dirPath, { encoding: "utf8", withFileTypes: false });
    if (Array.isArray(entries)) {
      const filtered = entries.filter((e): e is string => typeof e === "string");
      return filtered;
    }
    return [];
  } catch (error: any) {
    return [];
  }
}

//********************************************************************
//
// sortEntries Function
//
// Sorts directory entries with folders first, then files, in
// case-insensitive order. Filters out entries that cannot be
// accessed or have invalid stats.
//
// Return Value
// ------------
// string[]    Sorted array of entry names (folders first, then files)
//
// Value Parameters
// ----------------
// entries    string[]    Array of entry names to sort
// dirPath    string      Directory path for constructing full paths
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// folders     string[]    Array of folder names
// files       string[]    Array of file names
// fullPath    string      Full path of current entry
// stats       FileStats|null    File statistics
//
//*******************************************************************

function sortEntries(entries: string[], dirPath: string): string[] {
  const folders: string[] = [];
  const files: string[] = [];
  
  for (const entry of entries) {
    try {
      const fullPath = path.join(dirPath, entry);
      const stats = getStats(fullPath);
      
      if (!stats) continue;
      
      if (stats.isDirectory && !stats.isSymlink) {
        folders.push(entry);
      } else if (stats.isFile || stats.isSymlink) {
        files.push(entry);
      }
    } catch {
      // Skip entries we can't access
      continue;
    }
  }
  
  // Sort case-insensitive
  folders.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  files.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  
  return [...folders, ...files];
}

/**
 * Build a FileNode from a path
 */
function buildFileNode(
  entryPath: string,
  entryName: string,
  depth: number,
  options: TreeOptions
): FileNode | null {
  try {
    const stats = getStats(entryPath);
    if (!stats) {
      // Return error node instead of null
      return {
        name: entryName,
        path: entryPath,
        type: "file",
        depth,
        error: "Unable to read file stats",
        isReadable: false,
      };
    }
    
    const isDirectory = stats.isDirectory && !stats.isSymlink;
    const node: FileNode = {
      name: entryName,
      path: entryPath,
      type: isDirectory ? "folder" : "file",
      depth,
      isSymlink: stats.isSymlink,
      isReadable: stats.isReadable,
      isWritable: stats.isWritable,
    };
    
    if (options.includeStats) {
      node.size = stats.size;
      node.modified = stats.modified;
    }
    
    if (!isDirectory) {
      node.extension = getExtension(entryName);
    }
    
    // Apply filter if provided
    if (options.filter && !options.filter(node)) {
      return null;
    }
    
    return validateFileNode(node);
  } catch (error: any) {
    console.error(`Error building node for ${entryPath}:`, error?.message || error);
    // Return error node instead of null to prevent crashes
    const errorNode: FileNode = {
      name: entryName || "unknown",
      path: entryPath || "",
      type: "file",
      depth,
      error: error?.message || "Unknown error",
      isReadable: false,
    };
    return validateFileNode(errorNode);
  }
}

//********************************************************************
//
// walkDirectory Function
//
// VS Code-style recursive directory walker with symlink handling,
// permission error recovery, network drive support, large directory
// optimization, and complete error handling.
//
// Return Value
// ------------
// FileNode[]    Array of file nodes representing the directory tree
//
// Value Parameters
// ----------------
// dirPath    string          Root directory path to walk
// options    TreeOptions     Options for tree traversal
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// maxDepth           number          Maximum traversal depth
// includeStats       boolean         Whether to include file stats
// followSymlinks     boolean         Whether to follow symbolic links
// effectiveOptions   TreeOptions     Merged options object
// stats              FileStats|null   Root directory stats
// entries            string[]        Directory entries
// sortedEntries      string[]        Sorted entries (folders first)
// nodes              FileNode[]      Array of file nodes
// entryPath          string          Full path of current entry
// entryStats         FileStats|null   Stats of current entry
// children           FileNode[]      Children nodes for folders
//
//*******************************************************************

export function walkDirectory(
  dirPath: string,
  options: TreeOptions = {}
): FileNode[] {
  const maxDepth = options.maxDepth ?? MAX_DEPTH;
  const includeStats = options.includeStats ?? true;
  const followSymlinks = options.followSymlinks ?? false;
  const effectiveOptions: TreeOptions = {
    ...options,
    maxDepth,
    includeStats,
    followSymlinks,
  };
  
  // Safety checks
  if (maxDepth <= 0) {
    return [];
  }
  
  try {
    // Check if directory exists and is accessible
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const stats = getStats(dirPath);
    if (!stats || !stats.isDirectory) {
      return [];
    }
    
    // Read directory entries
    const entries = readDirectory(dirPath);
    
    // Safety limit for very large directories
    // For root level (maxDepth === 1), use a smaller limit to prevent blocking
    const MAX_ENTRIES_FOR_ROOT = 500; // Limit root to 500 entries to prevent UI freeze
    const effectiveMaxEntries = maxDepth === 1 ? MAX_ENTRIES_FOR_ROOT : MAX_ENTRIES_PER_DIR;
    
    if (entries.length > effectiveMaxEntries) {
      entries.splice(effectiveMaxEntries);
    }
    
    // Sort: folders first, then files
    const sortedEntries = sortEntries(entries, dirPath);
    
    // Build nodes
    const nodes: FileNode[] = [];
    const startingDepth = effectiveOptions.maxDepth ?? MAX_DEPTH;
    const currentDepth = startingDepth - maxDepth;
    
    for (const entry of sortedEntries) {
      try {
        if (!entry || typeof entry !== "string") continue;
        
        const entryPath = path.join(dirPath, entry);
        
        // Validate path
        if (!entryPath || entryPath.length === 0) continue;
        
        // Handle symlinks
        const entryStats = getStats(entryPath);
        if (entryStats?.isSymlink && !followSymlinks) {
          // Create symlink node but don't follow
          const symlinkNode = buildFileNode(entryPath, entry, currentDepth, effectiveOptions);
          if (symlinkNode) {
            nodes.push(symlinkNode);
          }
          continue;
        }
        
        const node = buildFileNode(entryPath, entry, currentDepth, effectiveOptions);
        if (!node) continue;
        
        // Recursively load children for folders (if not at max depth)
        if (node.type === "folder" && maxDepth > 1) {
          try {
            const children = walkDirectory(entryPath, {
              ...effectiveOptions,
              maxDepth: maxDepth - 1,
            });
            node.children = Array.isArray(children) ? children : [];
          } catch (error: any) {
            node.error = `Failed to read directory: ${error?.message || "Unknown error"}`;
            node.children = [];
          }
        } else if (node.type === "folder") {
          // Mark as having potential children without loading
          node.children = [];
        }
        
        nodes.push(node);
      } catch (error: any) {
        // Skip entries that cause errors
        continue;
      }
    }
    return nodes;
  } catch (error: any) {
    // Return empty array instead of throwing to prevent IPC crash
    return [];
  }
}

//********************************************************************
//
// expandFolder Function
//
// Expands a single folder for lazy loading. Validates the folder path
// and calls walkDirectory with maxDepth of 1 to return only immediate
// children. Used for on-demand folder expansion in the file tree.
//
// Return Value
// ------------
// FileNode[]    Array of immediate child file nodes
//
// Value Parameters
// ----------------
// folderPath    string          Path to the folder to expand
// options       TreeOptions     Options for tree traversal
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

export function expandFolder(
  folderPath: string,
  options: TreeOptions = {}
): FileNode[] {
  try {
    // Validate input
    if (!folderPath || typeof folderPath !== "string") {
      console.error("Invalid folder path:", folderPath);
      return [];
    }
    
    return walkDirectory(folderPath, {
      ...options,
      maxDepth: 1, // Only immediate children
    });
  } catch (error: any) {
    console.error(`Error expanding folder ${folderPath}:`, error?.message || error);
    return [];
  }
}
