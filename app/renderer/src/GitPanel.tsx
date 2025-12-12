import { useCallback, useEffect, useState } from "react";
import { splash } from "./splashClient";

import GitHubAuthModal from "./Github/GitHubAuthModal";
import CreateRepoModal from "./Github/CreateRepoModal";
import CreatePRModal from "./Github/CreatePRModal";
import ConflictResolverModal from "./Github/ConflictResolverModal";

interface Props {
  workspaceRoot: string | null;
}

interface ReviewerResponse {
  summary?: string;
  content?: string;
}

type GitCommandResult = { stdout: string; stderr?: string; success?: boolean };

function toGitResult(value: unknown): GitCommandResult {
  if (value && typeof value === "object" && "stdout" in value) {
    const obj = value as { stdout?: unknown; stderr?: unknown; success?: unknown };
    return {
      stdout: typeof obj.stdout === "string" ? obj.stdout : "",
      stderr: typeof obj.stderr === "string" ? obj.stderr : "",
      success: Boolean(obj.success),
    };
  }
  return { stdout: "", stderr: "", success: false };
}


export default function GitPanel({ workspaceRoot }: Props) {
  const [changes, setChanges] = useState<string[]>([]);
  const [staged, setStaged] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [commitMsg, setCommitMsg] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const [prDiff, setPrDiff] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");

  const [conflictFile, setConflictFile] = useState("");

  const refreshStatus = useCallback(async () => {
    if (!workspaceRoot) return;

    const statusResponse = await splash.gitStatus(workspaceRoot);
    const status = toGitResult(statusResponse?.status);
    const lines = status.stdout.split("\n").filter(Boolean);

    const unstaged: string[] = [];
    const stagedList: string[] = [];

    for (const line of lines) {
      const statusCode = line.slice(0, 2);
      const file = line.slice(3);
      if (statusCode[0] !== " " && statusCode[0] !== "?") {
        stagedList.push(file);
      } else {
        unstaged.push(file);
      }
    }

    setChanges(unstaged);
    setStaged(stagedList);

    const conflictFiles = await splash.gitConflicts(workspaceRoot);
    setConflicts(conflictFiles);

    const branchLines = await splash.gitBranches(workspaceRoot);

    const cleaned = branchLines.map((l) => l.replace("*", "").trim());
    setBranches(cleaned);

    const active = branchLines.find((l) => l.startsWith("*"));
    const activeBranch = active
      ? active.replace("*", "").trim()
      : cleaned[0] ?? "";

    setBranch(activeBranch);
  }, [workspaceRoot]);

  useEffect(() => {
    if (!workspaceRoot) return;
    queueMicrotask(() => refreshStatus());
  }, [workspaceRoot, refreshStatus]);

  const stageFile = async (file: string) => {
    if (!workspaceRoot) return;
    await splash.gitAdd(workspaceRoot, file);
    refreshStatus();
  };

  const unstageFile = async (file: string) => {
    if (!workspaceRoot) return;
    await splash.gitReset(workspaceRoot, file);
    refreshStatus();
  };

  const commit = async () => {
    if (!workspaceRoot || !commitMsg.trim()) return;
    await splash.gitCommit(workspaceRoot, commitMsg);
    setCommitMsg("");
    refreshStatus();
  };

  const checkoutBranch = async (b: string) => {
    if (!workspaceRoot) return;
    await splash.gitCheckout(workspaceRoot, b);
    refreshStatus();
  };

  const push = async () => {
    if (!workspaceRoot) return;
    await splash.gitPush(workspaceRoot);
    refreshStatus();
  };

  const pull = async () => {
    if (!workspaceRoot) return;
    await splash.gitPull(workspaceRoot);
    refreshStatus();
  };

  const openPRModal = async () => {
    if (!workspaceRoot) return;

    const targetFiles = staged.length > 0 ? staged : changes;
    if (targetFiles.length === 0) {
      alert("No changes available for a pull request.");
      return;
    }

    let diffText = "";
    for (const file of targetFiles) {
      const diff = await splash.gitDiff(workspaceRoot, file);
      if (diff.trim()) {
        diffText += `\n--- ${file} ---\n${diff}\n`;
      }
    }

    setPrDiff(diffText);

    const reviewer = (await splash.runAgent("reviewer", {
      task: "Generate a pull request title and description for this diff.",
      context: diffText,
    })) as ReviewerResponse;

    setPrTitle(reviewer.summary ?? "Update Code");
    setPrBody(reviewer.content ?? "No description provided.");
    setShowPRModal(true);
  };

  return (
    <div className="git-panel">
      <h3>Git</h3>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setShowAuth(true)}>GitHub Login</button>
        <button onClick={() => setShowCreateRepo(true)}>Create Repo</button>
        <button onClick={openPRModal}>Create PR</button>
      </div>

      {conflicts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h4>Merge Conflicts</h4>
          {conflicts.map((f) => (
            <div key={f} className="git-file-row">
              {f}
              <button
                onClick={() => {
                  setConflictFile(f);
                  setShowConflictModal(true);
                }}
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <strong>Branch:</strong>{" "}
        <select value={branch} onChange={(e) => checkoutBranch(e.target.value)}>
          {branches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>

        <button onClick={push} style={{ marginLeft: 10 }}>
          Push
        </button>
        <button onClick={pull} style={{ marginLeft: 5 }}>
          Pull
        </button>
      </div>

      <h4>Changes</h4>
      <div className="git-section">
        {changes.length === 0 && <div>No unstaged changes.</div>}
        {changes.map((f) => (
          <div key={f} className="git-file-row">
            {f}
            <button onClick={() => stageFile(f)}>Stage</button>
          </div>
        ))}
      </div>

      <h4>Staged</h4>
      <div className="git-section">
        {staged.length === 0 && <div>No staged files.</div>}
        {staged.map((f) => (
          <div key={f} className="git-file-row">
            {f}
            <button onClick={() => unstageFile(f)}>Unstage</button>
          </div>
        ))}
      </div>

      <textarea
        placeholder="Commit message..."
        value={commitMsg}
        onChange={(e) => setCommitMsg(e.target.value)}
        style={{ width: "100%", height: 60, marginTop: 10 }}
      />

      <button onClick={commit} style={{ marginTop: 10 }}>
        Commit
      </button>

      {showAuth && <GitHubAuthModal onClose={() => setShowAuth(false)} />}
      {showCreateRepo && (
        <CreateRepoModal
          workspaceRoot={workspaceRoot}
          onClose={() => setShowCreateRepo(false)}
        />
      )}
      {showPRModal && (
        <CreatePRModal
          workspaceRoot={workspaceRoot}
          currentBranch={branch}
          diffText={prDiff}
          initialTitle={prTitle}
          initialBody={prBody}
          onClose={() => setShowPRModal(false)}
        />
      )}
      {showConflictModal && (
        <ConflictResolverModal
          workspaceRoot={workspaceRoot}
          file={conflictFile}
          onClose={() => setShowConflictModal(false)}
        />
      )}
    </div>
  );
}
