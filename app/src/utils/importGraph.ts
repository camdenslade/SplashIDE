//********************************************************************
//
// ImportGraph Interface
//
// Represents a directed graph of file imports. Maps each file to an
// array of files that it imports. Used for discovering related files
// and understanding code dependencies.
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

export interface ImportGraph {
  files: string[];
  edges: Record<string, string[]>;
}

function extractImports(filePath: string, content: string): string[] {
  const dir = path.dirname(filePath);

  const importRegex =
    /import\s+.*?from\s+["'](.*?)["']/g;

  const results: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (!importPath) continue;

    // Absolute or node module imports?
    if (!importPath.startsWith(".")) continue;

    const resolved = path.resolve(dir, importPath);

    const withTs = resolved + ".ts";
    const withTsx = resolved + ".tsx";
    const withJs = resolved + ".js";

    if (fs.existsSync(withTs)) results.push(withTs);
    else if (fs.existsSync(withTsx)) results.push(withTsx);
    else if (fs.existsSync(withJs)) results.push(withJs);
    else if (fs.existsSync(resolved)) results.push(resolved);
  }

  return results;
}

//********************************************************************
//
// buildImportGraph Function
//
// Builds an import graph by scanning the provided files and extracting
// their import statements. Creates a mapping from each file to the
// files it imports, resolving relative import paths.
//
// Return Value
// ------------
// ImportGraph    Graph structure with files and import edges
//
// Value Parameters
// ----------------
// rootFiles    string[]    Array of file paths to analyze
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// edges      Record<string, string[]>    Map of file to imported files
// file       string                      Current file being processed
// content    string                      File contents
//
//*******************************************************************

export function buildImportGraph(rootFiles: string[]): ImportGraph {
  const edges: Record<string, string[]> = {};

  for (const file of rootFiles) {
    try {
      const content = fs.readFileSync(file, "utf8");
      edges[file] = extractImports(file, content);
    } catch {
      edges[file] = [];
    }
  }

  return {
    files: rootFiles,
    edges,
  };
}

//********************************************************************
//
// discoverRelatedFiles Function
//
// Finds all files reachable from a starting file by following import
// edges in the import graph. Uses breadth-first search with a maximum
// depth to limit traversal. Returns an array of related file paths.
//
// Return Value
// ------------
// string[]    Array of file paths reachable from the entry file
//
// Value Parameters
// ----------------
// graph       ImportGraph    The import graph to traverse
// entryFile   string         Starting file path
// maxDepth    number         Maximum depth to traverse (default: 3)
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// visited     Set<string>                    Set of visited file paths
// queue       Array<{file: string, depth: number}>    BFS queue
// file        string                         Current file being processed
// depth       number                         Current traversal depth
// neighbors   string[]                       Files imported by current file
// next        string                         Next file to visit
//
//*******************************************************************

export function discoverRelatedFiles(
  graph: ImportGraph,
  entryFile: string,
  maxDepth = 3,
): string[] {
  const visited = new Set<string>();
  const queue: Array<{ file: string; depth: number }> = [
    { file: entryFile, depth: 0 },
  ];

  while (queue.length > 0) {
    const { file, depth } = queue.shift()!;

    if (visited.has(file)) continue;
    visited.add(file);

    if (depth >= maxDepth) continue;

    const neighbors = graph.edges[file] || [];
    for (const next of neighbors) {
      queue.push({ file: next, depth: depth + 1 });
    }
  }

  // Return everything except the entry file
  visited.delete(entryFile);
  return [...visited];
}
