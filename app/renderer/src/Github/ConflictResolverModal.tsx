import { useEffect, useState } from "react";

interface Props {
  workspaceRoot: string | null;
  file: string;
  onClose: () => void;
}

interface ConflictStages {
  base: { stdout: string };
  ours: { stdout: string };
  theirs: { stdout: string };
}

interface SplashAPI {
  getConflictStages(
    root: string | null,
    file: string
  ): Promise<ConflictStages>;

  runAgent(
    agentName: string,
    input: { task: string; context: string }
  ): Promise<{ content?: string }>;

  writeFile(path: string, content: string): Promise<void>;
}

export default function ConflictResolverModal({
  workspaceRoot,
  file,
  onClose,
}: Props) {
  const [base, setBase] = useState("");
  const [ours, setOurs] = useState("");
  const [theirs, setTheirs] = useState("");
  const [result, setResult] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const splash = (window as unknown as { splash: SplashAPI }).splash;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { base, ours, theirs } = await splash.getConflictStages(
        workspaceRoot,
        file
      );

      if (cancelled) return;

      setBase(base.stdout || "");
      setOurs(ours.stdout || "");
      setTheirs(theirs.stdout || "");
      setResult(ours.stdout || "");
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [splash, workspaceRoot, file]);


  async function acceptOurs() {
    setResult(ours);
  }

  async function acceptTheirs() {
    setResult(theirs);
  }

  async function acceptBoth() {
    setResult(`${ours}\n${theirs}`);
  }

  async function mergeWithAI() {
    setLoadingAI(true);

    const prompt = `
You are resolving a 3-way Git merge conflict.

BASE VERSION:
${base}

OURS VERSION:
${ours}

THEIRS VERSION:
${theirs}

TASK:
Merge these three versions into a single, correct final version.
Preserve logic, comments, formatting, and resolve conflicts cleanly.

Return ONLY the merged file content.
`;

    const resp = await splash.runAgent("reviewer", {
      task: "Three-way merge",
      context: prompt,
    });

    if (resp?.content) {
      setResult(resp.content);
    }

    setLoadingAI(false);
  }

  async function saveResolved() {
    await splash.writeFile(`${workspaceRoot}/${file}`, result);
    onClose();
  }

  return (
    <div className="modal conflict-modal">
      <h3>Resolve Conflict: {file}</h3>

      <div className="conflict-columns">
        <div>
          <h4>Base</h4>
          <pre className="conflict-block">{base}</pre>
        </div>

        <div>
          <h4>Ours</h4>
          <pre className="conflict-block">{ours}</pre>
        </div>

        <div>
          <h4>Theirs</h4>
          <pre className="conflict-block">{theirs}</pre>
        </div>
      </div>

      <h4>Merged Result</h4>
      <textarea
        className="conflict-editor"
        value={result}
        onChange={(e) => setResult(e.target.value)}
      />

      <div className="conflict-actions">
        <button onClick={acceptOurs}>Accept Ours</button>
        <button onClick={acceptTheirs}>Accept Theirs</button>
        <button onClick={acceptBoth}>Accept Both</button>

        <button onClick={mergeWithAI} disabled={loadingAI}>
          {loadingAI ? "AI Merging…" : "AI Merge"}
        </button>

        <button onClick={saveResolved} style={{ marginLeft: 10 }}>
          Save Resolution
        </button>

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
