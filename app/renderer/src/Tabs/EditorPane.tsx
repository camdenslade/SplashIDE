import { useEffect, useState } from "react";
import { splash } from "../splashClient";

interface Props {
  activeFile: string | null;
  onSave: (path: string, content: string) => Promise<void>;
}

export default function EditorPane({ activeFile, onSave }: Props) {
  const [content, setContent] = useState("");

  useEffect(() => {
    async function load() {
      if (!activeFile) {
        setContent("");
        return;
      }

      const text = await splash.readFile(activeFile);
      setContent(text);
    }

    load();
  }, [activeFile]);

  async function save() {
    if (!activeFile) return;
    await onSave(activeFile, content);
  }

  return (
    <div className="editor-pane">
      {activeFile ? (
        <>
          <textarea
            className="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button onClick={save}>Save</button>
        </>
      ) : (
        <div className="editor-empty">No file selected</div>
      )}
    </div>
  );
}
