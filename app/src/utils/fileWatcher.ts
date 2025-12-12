//********************************************************************
//
// FileChangeEvent Interface
//
// File change event interface. Represents a change to a file or
// directory in the file system. Includes the change type (created,
// deleted, changed, renamed) and the file path. For rename events,
// includes the old path.
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

import { watch as fsWatch, FSWatcher } from "fs";
import { EventEmitter } from "events";
import * as path from "path";

export interface FileChangeEvent {
  type: "created" | "deleted" | "changed" | "renamed";
  path: string;
  oldPath?: string;
}

//********************************************************************
//
// FileWatcherService Class
//
// File system watcher service. Watches for filesystem changes and
// notifies the renderer process. Uses debouncing to avoid spam from
// rapid changes. Uses Node.js built-in fs.watch. Manages multiple
// directory watchers and provides debounced event emission.
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
// watchers        Map<string, FSWatcher>          Map of path to file system watcher
// debounceTimers  Map<string, NodeJS.Timeout>     Map of path to debounce timer
// debounceDelay   number                          Debounce delay in milliseconds (300ms)
//
//*******************************************************************

class FileWatcherService extends EventEmitter {
  private watchers: Map<string, FSWatcher> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceDelay = 300;

  watch(rootPath: string): void {
    if (this.watchers.has(rootPath)) {
      return;
    }

    try {
      const watcher = fsWatch(rootPath, { recursive: false }, (eventType, filename) => {
        if (!filename) return;
        
        const filePath = path.join(rootPath, filename);
        
        if (eventType === "rename") {
          const fs = require("fs");
          try {
            if (fs.existsSync(filePath)) {
              this.debounceEmit(rootPath, { type: "created", path: filePath });
            } else {
              this.debounceEmit(rootPath, { type: "deleted", path: filePath });
            }
          } catch {
            this.debounceEmit(rootPath, { type: "deleted", path: filePath });
          }
        } else if (eventType === "change") {
          this.debounceEmit(rootPath, { type: "changed", path: filePath });
        }
      });

      watcher.on("error", (error) => {
        console.error(`File watcher error for ${rootPath}:`, error);
      });

      this.watchers.set(rootPath, watcher);
    } catch (error: any) {
      console.error(`Error setting up file watcher for ${rootPath}:`, error.message);
    }
  }

  unwatch(rootPath: string): void {
    const watcher = this.watchers.get(rootPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(rootPath);
    }
    
    const timer = this.debounceTimers.get(rootPath);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(rootPath);
    }
  }

  unwatchAll(): void {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      this.unwatch(path);
    }
    this.watchers.clear();
    this.debounceTimers.clear();
  }

  private debounceEmit(rootPath: string, event: FileChangeEvent): void {
    const existingTimer = this.debounceTimers.get(rootPath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.emit("change", event);
      this.debounceTimers.delete(rootPath);
    }, this.debounceDelay);

    this.debounceTimers.set(rootPath, timer);
  }
}

//********************************************************************
//
// fileWatcher Constant
//
// Singleton instance of FileWatcherService for use throughout the
// application. Provides file system watching with debouncing to
// detect and notify about file system changes.
//
// Return Value
// ------------
// FileWatcherService    The singleton file watcher instance
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

export const fileWatcher = new FileWatcherService();
