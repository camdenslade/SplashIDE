/**
 * Renderer-side File System Service
 *
 * Matches the VS Code–style IPC defined in main.ts
 * - getTree(root) → returns ONLY direct children
 * - expand(folder) → returns ONLY children of that folder
 * - getStats(file)
 * - onFileChange(cb)
 *
 * All methods are safe, non-throwing, and renderer-crash-proof.
 */

import type { FileNode, FileStats } from "../types/fileSystem";

export interface FileSystemClient {
  getTree(rootPath: string): Promise<FileNode[]>;
  expand(folderPath: string): Promise<FileNode[]>;
  getStats(filePath: string): Promise<FileStats | null>;
  onFileChange(callback: (event: unknown) => void): () => void;
}

class FileSystemClientImpl implements FileSystemClient {
  private mapStats(response: unknown): FileStats | null {
    if (
      response &&
      typeof response === "object" &&
      "stats" in response &&
      response.stats &&
      typeof (response as { stats: unknown }).stats === "object"
    ) {
      const rawStats = (response as { stats: unknown }).stats;

      if (typeof rawStats !== "object" || rawStats === null) return null;

      const stats = rawStats as Partial<{
        size: number;
        mtime: number;
        ctime: number;
        isDirectory: boolean;
        isFile: boolean;
        isSymlink: boolean;
        isReadable: boolean;
        isWritable: boolean;
      }>;
      
      return {
        size: typeof stats.size === "number" ? stats.size : 0,
        modified: typeof stats.mtime === "number" ? stats.mtime : 0,
        created: typeof stats.ctime === "number" ? stats.ctime : undefined,
        isDirectory: Boolean(stats.isDirectory),
        isFile: Boolean(stats.isFile),
        isSymlink: Boolean(stats.isSymlink),
        isReadable: Boolean(stats.isReadable),
        isWritable: Boolean(stats.isWritable),
      };
    }
    return null;
  }


  // ------------------------------------------------------------
  // getTree(root)
  // ------------------------------------------------------------
  async getTree(rootPath: string): Promise<FileNode[]> {
    if (!rootPath || typeof rootPath !== "string") return [];

    const splash = window.splash;
    if (!splash?.getTree) {
      console.error("[fileSystemClient] splash.getTree not available");
      return [];
    }

    try {
      const response = await splash.getTree(rootPath);
      const result = Array.isArray(response?.nodes) ? response.nodes : [];

      return result.filter(isFileNode);
    } catch (err) {
      console.error("[fileSystemClient] getTree error:", err);
      return [];
    }
  }

  // ------------------------------------------------------------
  // expand(folder)
  // ------------------------------------------------------------
  async expand(folderPath: string): Promise<FileNode[]> {
    if (!folderPath || typeof folderPath !== "string") return [];

    const splash = window.splash;
    if (!splash?.expand) {
      console.error("[fileSystemClient] splash.expand not available");
      return [];
    }

    try {
      const response = await splash.expand(folderPath);
      const result = Array.isArray(response?.nodes) ? response.nodes : [];

      return result.filter(isFileNode);
    } catch (err) {
      console.error("[fileSystemClient] expand error:", err);
      return [];
    }
  }

  // ------------------------------------------------------------
  // getStats(file)
  // ------------------------------------------------------------
  async getStats(filePath: string): Promise<FileStats | null> {
    const splash = window.splash;
    if (!splash?.getStats) {
      console.error("[fileSystemClient] splash.getStats not available");
      return null;
    }

    try {
      const response = await splash.getStats(filePath);
      return this.mapStats(response);
    } catch (err) {
      console.error("[fileSystemClient] getStats error:", err);
      return null;
    }
  }

  // ------------------------------------------------------------
  // onFileChange(cb)
  // ------------------------------------------------------------
  onFileChange(callback: (event: unknown) => void): () => void {
    const splash = window.splash;
    if (!splash?.onFileChange) return () => {};

    splash.onFileChange(callback);

    // Preload does not yet expose an unsubscribe mechanism.
    return () => {
      // No-op
    };
  }
}

// ------------------------------------------------------------
// Type guard
// ------------------------------------------------------------

function isFileNode(node: unknown): node is FileNode {
  if (
    typeof node === "object" &&
    node !== null &&
    "name" in node &&
    "path" in node &&
    "type" in node
  ) {
    const n = node as {
      name: unknown;
      path: unknown;
      type: unknown;
    };

    return (
      typeof n.name === "string" &&
      typeof n.path === "string" &&
      (n.type === "file" || n.type === "folder")
    );
  }

  return false;
}


export const fileSystemClient = new FileSystemClientImpl();
