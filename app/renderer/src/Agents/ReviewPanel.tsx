interface AgentResult {
  intent?: string;
  summary?: string;
  diff?: string;
  newFiles?: Record<string, string>;
  deletedFiles?: string[];
}

interface Props {
  result: AgentResult | null;
  onApplyPatch: (
    diff: string,
    newFiles: Record<string, string>,
    deleted: string[],
  ) => void;
  onRejectPatch: () => void;
}

export default function ReviewPanel({
  result,
  onApplyPatch,
  onRejectPatch,
}: Props) {
  if (!result) {
    return (
      <div className="panel" style={{ flex: "1 1 0", minHeight: 0 }}>
        <div className="panel-header">
          <h3>Review</h3>
        </div>
        <div className="panel-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#858585" }}>
          Waiting for agent…
        </div>
      </div>
    );
  }

  const newFiles = result.newFiles || {};
  const deleted = result.deletedFiles || [];

  return (
    <div className="panel" style={{ flex: "1 1 0", minHeight: 0 }}>
      <div className="panel-header">
        <h3>Review ({result.intent})</h3>
      </div>
      <div className="panel-content">
        <p><strong>Summary:</strong> {String(result.summary || "")}</p>

        {result.diff && (
          <>
            <h4>Main File Patch</h4>
            <pre>{String(result.diff)}</pre>
          </>
        )}

        {Object.keys(newFiles).length > 0 && (
          <>
            <h4>New Files</h4>
            {Object.entries(newFiles).map(([fp, content]) => (
              <div key={fp} style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#4ec9b0" }}>{fp}</strong>
                <pre>{String(content)}</pre>
              </div>
            ))}
          </>
        )}

        {deleted.length > 0 && (
          <>
            <h4>Deleted Files</h4>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              {deleted.map((f) => (
                <li key={f} style={{ color: "#f48771" }}>{f}</li>
              ))}
            </ul>
          </>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          <button
            onClick={() =>
              onApplyPatch(String(result.diff || ""), newFiles, deleted)
            }
          >
            Apply Changes
          </button>

          <button 
            onClick={onRejectPatch}
            style={{ background: "#5a5a5a" }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
