/* eslint-disable @typescript-eslint/no-explicit-any */
import * as monaco from "monaco-editor";

export function registerTsLanguage(m: typeof monaco) {
  m.languages.registerCompletionItemProvider("typescript", {
    triggerCharacters: [".", '"', "'", "/", "@", "<"],
    async provideCompletionItems(model, position) {
      const file = model.uri.path;
      const offset = model.getOffsetAt(position) + 1;

      const resp = await (window as any).splash.tsRequest("completions", {
        file,
        offset,
        includeExternalModuleExports: true,
        includeInsertTextCompletions: true,
      });

      if (!resp?.body) return { suggestions: [] };

      return {
        suggestions: resp.body.entries.map((e: any) => ({
          label: e.name,
          insertText: e.insertText ?? e.name,
          detail: e.kind,
          documentation: e.kindModifiers,
          kind: m.languages.CompletionItemKind[e.kind] ??
            m.languages.CompletionItemKind.Text,
        })),
      };
    },
  });

  m.languages.registerHoverProvider("typescript", {
    async provideHover(model, position) {
      const file = model.uri.path;
      const offset = model.getOffsetAt(position) + 1;

      const resp = await (window as any).splash.tsRequest("quickinfo", {
        file,
        offset,
      });

      if (!resp?.body) return null;

      const display = resp.body.displayString ?? "";
      const docs = (resp.body.documentation ?? [])
        .map((d: any) => d.text)
        .join("\n");

      return {
        contents: [
          { value: "```ts\n" + display + "\n```" },
          { value: docs },
        ],
      };
    },
  });

  m.languages.registerDefinitionProvider("typescript", {
    async provideDefinition(model, position) {
      const file = model.uri.path;
      const offset = model.getOffsetAt(position) + 1;

      const resp = await (window as any).splash.tsRequest("definition", {
        file,
        offset,
      });

      if (!resp?.body) return [];

      return resp.body.map((d: any) => ({
        uri: m.Uri.file(d.file),
        range: new m.Range(
          d.start.line,
          d.start.offset,
          d.end.line,
          d.end.offset
        ),
      }));
    },
  });

  m.languages.registerReferenceProvider("typescript", {
    async provideReferences(model, position) {
      const file = model.uri.path;
      const offset = model.getOffsetAt(position) + 1;

      const resp = await (window as any).splash.tsRequest("references", {
        file,
        offset,
      });

      if (!resp?.body) return [];

      return resp.body.refs.map((r: any) => ({
        uri: m.Uri.file(r.file),
        range: new m.Range(
          r.start.line,
          r.start.offset,
          r.end.line,
          r.end.offset
        ),
      }));
    },
  });

  m.languages.registerSignatureHelpProvider("typescript", {
    signatureHelpTriggerCharacters: ["(", ",", "<"],
    async provideSignatureHelp(model, position) {
      const file = model.uri.path;
      const offset = model.getOffsetAt(position) + 1;

      const resp = await (window as any).splash.tsRequest("signatureHelp", {
        file,
        offset,
      });

      if (!resp?.body) return null;

      const info = resp.body;

      return {
        value: {
          signatures: info.items.map((i: any) => ({
            label: i.prefixDisplayParts.map((p: any) => p.text).join("") +
              i.parameters.map((p: any) =>
                p.displayParts.map((q: any) => q.text).join("")
              ).join(", ") +
              i.suffixDisplayParts.map((p: any) => p.text).join(""),
            documentation: i.documentation?.map((d: any) => d.text).join("\n"),
            parameters: i.parameters.map((p: any) => ({
              label: p.displayParts.map((q: any) => q.text).join(""),
              documentation: p.documentation
                ?.map((d: any) => d.text)
                .join("\n"),
            })),
          })),
          activeParameter: info.argumentIndex,
          activeSignature: info.selectedItemIndex,
        },
        dispose() {},
      };
    },
  });

  (window as any).splash.onTsEvent((msg: any) => {
    if (msg.event !== "semanticDiag" && msg.event !== "syntaxDiag") return;

    const file = msg.body?.file;
    const diags = msg.body?.diagnostics ?? [];

    const uri = m.Uri.file(file);
    const model = m.editor.getModel(uri);
    if (!model) return;

    const markers = diags.map((d: any) => ({
      severity: m.MarkerSeverity.Error,
      message: d.text,
      startLineNumber: d.start.line,
      startColumn: d.start.offset,
      endLineNumber: d.end.line,
      endColumn: d.end.offset,
    }));

    m.editor.setModelMarkers(model, "typescript", markers);
  });
}
