import { useEffect, useState } from "react";

export default function QuickSearch({
  open,
  files,
  onSelect,
  onClose,
}: {
  open: boolean;
  files: string[];
  onSelect: (path: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      setQuery("");
      setResults(files);
    });
  }, [open, files]);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      const q = query.toLowerCase();
      setResults(files.filter((f) => f.toLowerCase().includes(q)));
    });
  }, [query, files, open]);

  if (!open) return null;

  return (
    <div className="qs-backdrop" onClick={onClose}>
      <div className="qs" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="qs-input"
          value={query}
          placeholder="Search files..."
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="qs-results">
          {results.map((r) => (
            <div
              key={r}
              className="qs-item"
              onClick={() => {
                onSelect(r);
                onClose();
              }}
            >
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
