interface Props {
  diff: string;
  onApply: () => void;
  onReject: () => void;
}

export default function PatchPanel({ diff, onApply, onReject }: Props) {
  if (!diff) return null;

  return (
    <div className="panel">
      <h3>Proposed Patch</h3>

      <pre
        style={{
          background: "#1e1e1e",
          color: "#c0edc0",
          padding: "10px",
          height: "70%",
          overflowY: "scroll",
        }}
      >
        {diff}
      </pre>

      <button style={{ background: "#2ecc71" }} onClick={onApply}>
        Apply Patch
      </button>

      <button style={{ background: "#e74c3c", marginLeft: 10 }} onClick={onReject}>
        Reject Patch
      </button>
    </div>
  );
}
