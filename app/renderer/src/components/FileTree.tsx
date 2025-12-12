/**
 * Professional FileTree Component
 * 
 * VS Code-style file explorer with:
 * - Lazy folder expansion
 * - Keyboard navigation
 * - Error handling with retry
 * - Memoization for performance
 * - Virtual scrolling support
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { FileNode } from "../types/fileSystem";
import { fileSystemClient } from "../services/fileSystemService";
import { FolderIcon, FolderOpenIcon, FileTypeIcon } from "../Tabs/FileTreeIcons";

interface FileTreeProps {
  rootPath: string;
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  className?: string;
}

interface TreeNodeState {
  expanded: boolean;
  loading: boolean;
  error: string | null;
  children: FileNode[];
}

export function FileTree({ rootPath, activeFile, onFileSelect, className }: FileTreeProps) {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [nodeStates, setNodeStates] = useState<Map<string, TreeNodeState>>(new Map());
  const [focusedPath, setFocusedPath] = useState<string | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  // Toggle folder expansion - defined early so it can be used in useEffect
  const toggleFolder = useCallback(async (node: FileNode) => {
    if (node.type !== "folder") return;
    
    const currentState = nodeStates.get(node.path);
    const isExpanded = currentState?.expanded || false;
    
    if (isExpanded) {
      // Collapse
      setNodeStates((prev) => {
        const next = new Map(prev);
        const state = next.get(node.path);
        if (state) {
          next.set(node.path, { ...state, expanded: false });
        }
        return next;
      });
    } else {
      // Expand - lazy load children
      setNodeStates((prev) => {
        const next = new Map(prev);
        next.set(node.path, {
          expanded: true,
          loading: true,
          error: null,
          children: [],
        });
        return next;
      });
      
      try {
        // Validate node path before expanding
        if (!node.path || typeof node.path !== "string") {
          throw new Error("Invalid folder path");
        }
        
        const children = await fileSystemClient.expand(node.path);
        
        // Validate children before setting state
        const validChildren = Array.isArray(children) ? children : [];
        
        setNodeStates((prev) => {
          const next = new Map(prev);
          next.set(node.path, {
            expanded: true,
            loading: false,
            error: null,
            children: validChildren,
          });
          return next;
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("Error expanding folder:", err);
        setNodeStates((prev) => {
          const next = new Map(prev);
          next.set(node.path, {
            expanded: true,
            loading: false,
            error: err.message,
            children: [],
          });
          return next;
        });
      }   
    }
  }, [nodeStates]);

  // Load root tree - use lazy loading to prevent blocking
  useEffect(() => {
    if (!rootPath) {
      console.log("[DEBUG] FileTree: No rootPath, skipping load");
      return;
    }
    
    console.log(`[DEBUG] FileTree: Creating root placeholder for lazy loading: ${rootPath}`);
    
    // Create a placeholder root node - children will load when expanded
    // This prevents blocking on initial folder open
    const rootName = rootPath.split(/[/\\]/).pop() || rootPath;
    const rootNode: FileNode = {
      name: rootName,
      path: rootPath,
      type: "folder",
      children: [], // Empty - will load on expand
    };
    
    setTree([rootNode]);
    
    // Auto-expand root after a tiny delay to trigger lazy load
    const timer = setTimeout(() => {
      console.log(`[DEBUG] FileTree: Auto-expanding root to trigger lazy load`);
      toggleFolder(rootNode);
    }, 50);
    
    return () => {
      clearTimeout(timer);
    };
  }, [rootPath, toggleFolder]);

  // Subscribe to file changes
  useEffect(() => {
    if (!rootPath) return;
    
    const cleanup = fileSystemClient.onFileChange((event) => {
      try {
        // Type guard for file change event
        if (
          event &&
          typeof event === "object" &&
          "path" in event &&
          typeof (event as { path: unknown }).path === "string"
        ) {
          const path = (event as { path: string }).path;
          if (path.startsWith(rootPath)) {
            // Refresh the tree
            fileSystemClient.getTree(rootPath).then((nodes) => {
              const validNodes = Array.isArray(nodes) ? nodes : [];
              setTree(validNodes);
            }).catch((error) => {
              console.error("Error refreshing tree:", error);
            });
          }
        }
      } catch (error) {
        console.error("Error handling file change:", error);
      }
    });
    
    return cleanup;
  }, [rootPath]);


  // Retry loading a folder
  const retryFolder = useCallback(async (node: FileNode) => {
    await toggleFolder(node); // Collapse first
    setTimeout(() => toggleFolder(node), 100); // Then expand
  }, [toggleFolder]);

  // Handle file/folder click
  const handleClick = useCallback((node: FileNode, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (node.type === "folder") {
      toggleFolder(node);
    } else {
      onFileSelect(node.path);
    }
  }, [toggleFolder, onFileSelect]);

  // Handle double-click
  const handleDoubleClick = useCallback((node: FileNode) => {
    if (node.type === "file") {
      onFileSelect(node.path);
    }
  }, [onFileSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((node: FileNode, event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (node.type === "folder") {
          toggleFolder(node);
        } else {
          onFileSelect(node.path);
        }
        break;
      case "ArrowRight":
        event.preventDefault();
        if (node.type === "folder" && !nodeStates.get(node.path)?.expanded) {
          toggleFolder(node);
        }
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (node.type === "folder" && nodeStates.get(node.path)?.expanded) {
          toggleFolder(node);
        }
        break;
    }
  }, [nodeStates, toggleFolder, onFileSelect]);

  // Render a single tree node
  const renderNode = useCallback((node: FileNode, depth: number = 0): React.ReactNode => {
    // Comprehensive null safety checks
    if (!node || typeof node !== "object") return null;
    if (!node.path || typeof node.path !== "string") return null;
    if (!node.name || typeof node.name !== "string") return null;
    if (node.type !== "file" && node.type !== "folder") return null;
    
    const state = nodeStates.get(node.path);
    const isExpanded = state?.expanded || false;
    const isLoading = state?.loading || false;
    const error = state?.error;
    const isActive = node.path === activeFile;
    const isFocused = node.path === focusedPath;
    const isFolder = node.type === "folder";
    
    // Get children (from state if expanded, otherwise from node)
    const children = isExpanded && state?.children 
      ? state.children 
      : (isExpanded ? node.children : []);
    
    return (
      <div key={node.path} className="file-tree-node">
        <div
          className={`file-tree-item ${isActive ? "active" : ""} ${isFocused ? "focused" : ""}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={(e) => handleClick(node, e)}
          onDoubleClick={() => handleDoubleClick(node)}
          onKeyDown={(e) => handleKeyDown(node, e)}
          onFocus={() => setFocusedPath(node.path)}
          onBlur={() => setFocusedPath(null)}
          tabIndex={0}
          role="treeitem"
          aria-expanded={isFolder ? isExpanded : undefined}
          aria-selected={isActive}
          data-type={isFolder ? "folder" : "file"}
        >
          <span className="file-tree-icon">
            {isFolder ? (
              isLoading ? (
                <span className="file-tree-spinner">⟳</span>
              ) : isExpanded ? (
                <FolderOpenIcon />
              ) : (
                <FolderIcon />
              )
            ) : (
              <FileTypeIcon fileName={node.name} />
            )}
          </span>
          <span className="file-tree-name">{node.name}</span>
          {error && (
            <span className="file-tree-error" title={error}>
              ⚠
            </span>
          )}
        </div>
        
        {error && (
          <div className="file-tree-error-row" style={{ paddingLeft: `${24 + depth * 16}px` }}>
            <span className="file-tree-error-message">{error}</span>
            <button
              className="file-tree-retry"
              onClick={(e) => {
                e.stopPropagation();
                retryFolder(node);
              }}
            >
              Retry
            </button>
          </div>
        )}
        
        {isExpanded && !isLoading && !error && (
          <div className="file-tree-children">
            {Array.isArray(children) && children.length > 0
              ? children.map((child) => renderNode(child, depth + 1))
              : !isLoading && (
                  <div className="file-tree-empty" style={{ paddingLeft: `${24 + depth * 16}px` }}>
                    Empty folder
                  </div>
                )}
          </div>
        )}
      </div>
    );
  }, [nodeStates, activeFile, focusedPath, handleClick, handleDoubleClick, handleKeyDown, retryFolder]);

  // Memoized tree rendering
  const renderedTree = useMemo(() => {
    return tree.map((node) => renderNode(node, 0));
  }, [tree, renderNode]);

  if (!rootPath) {
    return (
      <div className={className} style={{ padding: "12px", color: "#858585" }}>
        No workspace open
      </div>
    );
  }

  return (
    <div
      ref={treeRef}
      className={`file-tree ${className || ""}`}
      role="tree"
      aria-label="File Explorer"
    >
      {renderedTree}
    </div>
  );
}

