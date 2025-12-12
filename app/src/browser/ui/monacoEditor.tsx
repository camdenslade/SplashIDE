import { useEffect, useRef } from "react";
import monaco from "../../monaco";

interface Props {
  value: string;
  language: string;
  onChange?: (v: string) => void;
}

export default function MonacoEditor({ value, language, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Apply VS Code–like theme defined in src/monaco.ts
    monaco.editor.setTheme("vs-dark-plus");

    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language,
      automaticLayout: true,
    });

    if (onChange) {
      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current!.getValue());
      });
    }

    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    />
  );
}
