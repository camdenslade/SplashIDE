import { useCallback, lazy, Suspense } from "react";
import { splash } from "../splashClient";
import { ErrorBoundary } from "../ErrorBoundary";

const FileTree = lazy(async () => {
  const m = await import("../components/FileTree");
  return { default: m.FileTree };
});

interface Props {
  workspace: string | null;
  activeFile: string | null;
  onOpenFile: (path: string, content: string | null) => void;
  onWorkspaceChange: (ws: string) => void;
}

export default function Sidebar({
  workspace,
  activeFile,
  onOpenFile,
  onWorkspaceChange,
}: Props) {
  const chooseWorkspace = useCallback(async () => {
    try {
      const selected = await splash.openWorkspace();
      if (selected) onWorkspaceChange(selected);
    } catch (err) {
      console.error("Failed to choose workspace", err);
    }
  }, [onWorkspaceChange]);

  const handleFileSelect = useCallback(
    async (path: string) => {
      try {
        const content = await splash.readFile(path);
        onOpenFile(path, content ?? "");
      } catch (err) {
        console.error("Error opening file", err);
      }
    },
    [onOpenFile]
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Explorer</h3>
      </div>

      <div className="sidebar-content">
        {!workspace && (
          <button onClick={chooseWorkspace}>Open Folder</button>
        )}

        {workspace && (
          <>
            <p className="workspace-path">{workspace}</p>

            <ErrorBoundary
              fallback={
                <div style={{ padding: "12px", color: "#f48771" }}>
                  <div>Error loading file tree</div>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      marginTop: "8px",
                      padding: "4px 8px",
                      background: "#0e639c",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                    }}
                  >
                    Reload
                  </button>
                </div>
              }
            >
              <Suspense
                fallback={
                  <div style={{ padding: "8px", color: "#858585" }}>
                    Loading file tree...
                  </div>
                }
              >
                <FileTree
                  rootPath={workspace}
                  activeFile={activeFile}
                  onFileSelect={handleFileSelect}
                  className="sidebar-tree"
                />
              </Suspense>
            </ErrorBoundary>
          </>
        )}
      </div>
    </div>
  );
}
