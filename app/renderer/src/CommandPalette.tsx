import { useEffect, useLayoutEffect, useState } from "react";
import { getCommands, type Command } from "./commands/commandRegistry";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Command[]>([]);

  useLayoutEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      setQuery("");
      setResults(getCommands());
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const q = query.toLowerCase();

    queueMicrotask(() => {
      const cmds = getCommands();
      const filtered = cmds.filter((c) =>
        c.title.toLowerCase().includes(q)
      );
      setResults(filtered);
    });
  }, [query, open]);

  if (!open) return null;

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          className="palette-input"
          value={query}
          placeholder="Type a command..."
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="palette-results">
          {results.map((cmd) => (
            <div
              key={cmd.id}
              className="palette-item"
              onClick={async () => {
                await cmd.run();
                onClose();
              }}
            >
              {cmd.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
