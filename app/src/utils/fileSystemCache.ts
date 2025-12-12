//********************************************************************
//
// CacheEntry Interface
//
// Cache entry interface for file system cache. Contains the cached
// file node, timestamp when cached, and time-to-live (TTL) in
// milliseconds.
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

import { FileNode } from "./fileSystemTypes";

interface CacheEntry {
  node: FileNode;
  timestamp: number;
  ttl: number;
}

//********************************************************************
//
// FileSystemCache Class
//
// In-memory cache for file tree nodes to avoid repeated filesystem
// access. Implements VS Code-style caching with TTL (time-to-live)
// and invalidation. Provides cache operations including get, set,
// invalidate, clear, and size queries.
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
// cache       Map<string, CacheEntry>    Map of path to cache entry
// defaultTTL  number                     Default time-to-live in milliseconds (5 minutes)
//
//*******************************************************************

class FileSystemCache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 5 * 60 * 1000;

  get(path: string): FileNode | null {
    const entry = this.cache.get(path);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(path);
      return null;
    }
    
    return entry.node;
  }

  set(path: string, node: FileNode, ttl?: number): void {
    this.cache.set(path, {
      node,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  invalidate(path: string): void {
    this.cache.delete(path);
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(path + "/") || key.startsWith(path + "\\")) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

//********************************************************************
//
// fileSystemCache Constant
//
// Singleton instance of FileSystemCache for use throughout the
// application. Provides in-memory caching of file tree nodes with
// TTL and invalidation support.
//
// Return Value
// ------------
// FileSystemCache    The singleton cache instance
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

export const fileSystemCache = new FileSystemCache();

