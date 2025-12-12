//********************************************************************
//
// WorkspaceIndex Interface
//
// Represents an indexed workspace with its root path and list of all
// file paths found within it.
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

import fs from "fs";
import path from "path";

export interface WorkspaceIndex {
  root: string;
  files: string[];
}

//********************************************************************
//
// indexWorkspace Function
//
// Recursively scans a workspace directory and returns a list of all
// file paths found within it. Skips common directories like node_modules
// and .git. Limits results to MAX_FILES to prevent memory issues.
//
// Return Value
// ------------
// WorkspaceIndex    Object containing root path and array of file paths
//
// Value Parameters
// ----------------
// root    string    Root directory path to index
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// result      string[]      Array of file paths found
// MAX_FILES   number        Maximum number of files to index
// SKIP_DIRS   Set<string>   Directories to skip during traversal
// walk        Function      Recursive directory walker function
// items       string[]      Directory entries at current level
// stat        fs.Stats      File system stats for current item
// fullPath    string        Full path of current item
//
//*******************************************************************

export function indexWorkspace(root: string): WorkspaceIndex {
  const result: string[] = [];
  const MAX_FILES = 2000; // tighter cap to avoid blowing up IPC/memory
  const SKIP_DIRS = new Set(["node_modules", ".git", ".cache", "dist", "build", "out"]);

  function walk(dir: string) {
    if (result.length >= MAX_FILES) return;

    let items: string[] = [];
    try {
      items = fs.readdirSync(dir);
    } catch {
      return;
    }

    for (const item of items) {
      if (result.length >= MAX_FILES) return;
      if (SKIP_DIRS.has(item)) continue;

      const fullPath = path.join(dir, item);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        result.push(fullPath);
      }
    }
  }

  walk(root);

  return {
    root,
    files: result,
  };
}

//********************************************************************
//
// readFilesBatch Function
//
// Reads multiple files at once and returns their contents as a map.
// Implements size limits per file (MAX_BYTES) and total size limit
// (MAX_TOTAL_BYTES) to prevent memory exhaustion. Returns empty
// string for files that exceed limits or cannot be read.
//
// Return Value
// ------------
// Record<string, string>    Map of file paths to file contents
//
// Value Parameters
// ----------------
// paths    string[]    Array of file paths to read
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// output           Record<string, string>    Map of paths to contents
// MAX_BYTES        number                    Maximum bytes per file
// MAX_TOTAL_BYTES  number                    Maximum total bytes across all files
// total            number                    Running total of bytes read
// stat             fs.Stats                  File system stats
// content          string                    File contents
//
//*******************************************************************

export function readFilesBatch(paths: string[]): Record<string, string> {
  const output: Record<string, string> = {};
  const MAX_BYTES = 256_000; // 256KB per file cap
  const MAX_TOTAL_BYTES = 2_000_000; // 2MB total cap across all files
  let total = 0;

  for (const p of paths) {
    try {
      const stat = fs.statSync(p);
      if (stat.size > MAX_BYTES) {
        output[p] = "";
        continue;
      }
      if (total + stat.size > MAX_TOTAL_BYTES) {
        output[p] = "";
        continue;
      }
      const content = fs.readFileSync(p, "utf8");
      total += stat.size;
      output[p] = content;
    } catch {
      output[p] = "";
    }
  }

  return output;
}
