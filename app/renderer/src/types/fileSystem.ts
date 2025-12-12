/**
 * File System Types (Renderer)
 * 
 * Shared types for file system operations in the renderer.
 * These match the backend types in utils/fileSystemTypes.ts
 */

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
  error?: string; // Error message if node failed to load
}

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

