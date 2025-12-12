//********************************************************************
//
// FileSystemService Class
//
// Fully async, non-blocking file system service for the main process.
// Returns ONLY shallow children for both root and expanded folders.
// Supports caching and handles errors gracefully to prevent crashes.
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
// SKIP_DIRS    Set<string>    Directories to skip during traversal
// MAX_ENTRIES  number         Maximum entries to return per operation
//
//*******************************************************************

import * as fs from "fs/promises";
import * as path from "path";
import { FileNode, FileStats, validateFileNodeArray } from "./fileSystemTypes";
import { fileSystemCache } from "./fileSystemCache";

export class FileSystemService {
  private readonly SKIP_DIRS = new Set(["node_modules", ".git", ".cache", "dist", "build", "out"]);
  private readonly MAX_ENTRIES = 2000;

  async getRootTree(rootPath: string): Promise<FileNode[]> {
    try {
      if (!rootPath || typeof rootPath !== "string") return [];

      const cached = fileSystemCache.get(rootPath);
      if (cached?.children) return cached.children;

      const entries = await fs.readdir(rootPath, { withFileTypes: true });
      const children: FileNode[] = [];

      for (const entry of entries) {
        if (children.length >= this.MAX_ENTRIES) break;
        if (this.SKIP_DIRS.has(entry.name)) continue;
        const full = path.join(rootPath, entry.name);

        children.push({
          name: entry.name,
          path: full,
          type: entry.isDirectory() ? "folder" : "file",
          children: [],
        });
      }

      const validated = validateFileNodeArray(children);
      fileSystemCache.set(rootPath, {
        name: path.basename(rootPath),
        path: rootPath,
        type: "folder",
        children: validated,
      });

      return validated;
    } catch (err) {
      console.error("[fsService] getRootTree error:", err);
      return [];
    }
  }

  async expandFolder(folderPath: string): Promise<FileNode[]> {
    try {
      const cached = fileSystemCache.get(folderPath);
      if (cached?.children) return cached.children;

      const entries = await fs.readdir(folderPath, { withFileTypes: true });
      const children: FileNode[] = [];

      for (const entry of entries) {
        if (children.length >= this.MAX_ENTRIES) break;
        if (this.SKIP_DIRS.has(entry.name)) continue;
        const full = path.join(folderPath, entry.name);

        children.push({
          name: entry.name,
          path: full,
          type: entry.isDirectory() ? "folder" : "file",
          children: [],
        });
      }

      const validated = validateFileNodeArray(children);

      fileSystemCache.set(folderPath, {
        name: path.basename(folderPath),
        path: folderPath,
        type: "folder",
        children: validated,
      });

      return validated;
    } catch (err) {
      console.error("[fsService] expandFolder error:", err);
      return [];
    }
  }

  // -------------------------------------------------------------
  // getStats(file)
  // -------------------------------------------------------------
  async getStats(filePath: string): Promise<FileStats | null> {
    try {
      const stat = await fs.stat(filePath);
      const lstat = await fs.lstat(filePath);

      let readable = true;
      let writable = false;

      try {
        await fs.access(filePath, fs.constants.R_OK);
      } catch { readable = false; }

      try {
        await fs.access(filePath, fs.constants.W_OK);
        writable = true;
      } catch { writable = false; }

      return {
        size: stat.size,
        modified: stat.mtimeMs,
        created: stat.birthtimeMs,
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        isSymlink: lstat.isSymbolicLink(),
        isReadable: readable,
        isWritable: writable,
      };
    } catch {
      return null;
    }
  }

  // -------------------------------------------------------------
  // readFile
  // -------------------------------------------------------------
  async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch (err) {
      console.error("[fsService] readFile error:", err);
      throw err;
    }
  }

  invalidateCache(filePath: string): void {
    fileSystemCache.invalidate(filePath);
  }

  clearCache(): void {
    fileSystemCache.clear();
  }
}

//********************************************************************
//
// fileSystemService Constant
//
// Singleton instance of FileSystemService for use throughout the
// application. Provides async, non-blocking file system operations
// with caching support.
//
// Return Value
// ------------
// FileSystemService    The singleton service instance
//
// Value Parameters
// ----------------
// None (constant definition)
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

export const fileSystemService = new FileSystemService();
