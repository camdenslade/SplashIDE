//********************************************************************
//
// Monaco Editor Configuration
//
// Monaco editor initialization and configuration module. Loads Monaco
// editor API and language contributions (JavaScript, TypeScript, JSON,
// CSS, HTML, Markdown). Configures worker URLs for language services
// and defines a VS Code-like Dark+ theme for consistent styling.
//
// Return Value
// ------------
// None (module-level configuration)
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
// monaco    MonacoEditor    Monaco editor API instance
//
//*******************************************************************
import "monaco-editor/esm/vs/basic-languages/_.contribution.js";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorkerUrl(moduleId: string, label: string): string;
    };
  }
}

(self as any).MonacoEnvironment = {
  getWorkerUrl(_moduleId: string, label: string) {
    switch (label) {
      case "json":
        return new URL(
          "monaco-editor/esm/vs/language/json/json.worker",
          import.meta.url
        ).toString();

      case "css":
        return new URL(
          "monaco-editor/esm/vs/language/css/css.worker",
          import.meta.url
        ).toString();

      case "html":
        return new URL(
          "monaco-editor/esm/vs/language/html/html.worker",
          import.meta.url
        ).toString();

      case "typescript":
      case "javascript":
        return new URL(
          "monaco-editor/esm/vs/language/typescript/ts.worker",
          import.meta.url
        ).toString();

      default:
        return new URL(
          "monaco-editor/esm/vs/editor/editor.worker",
          import.meta.url
        ).toString();
    }
  }
};

monaco.editor.defineTheme("vs-dark-plus", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "6A9955" },
    { token: "string", foreground: "CE9178" },
    { token: "number", foreground: "B5CEA8" },
    { token: "regexp", foreground: "D16969" },
    { token: "keyword", foreground: "C586C0" },
    { token: "type", foreground: "4EC9B0" },
    { token: "variable", foreground: "9CDCFE" },
    { token: "function", foreground: "DCDCAA" },
  ],
  colors: {
    "editor.background": "#1E1E1E",
    "editor.foreground": "#D4D4D4",
    "editorLineNumber.foreground": "#858585",
    "editorCursor.foreground": "#AEAFAD",
    "editor.selectionBackground": "#264F78",
  },
});

export default monaco;
