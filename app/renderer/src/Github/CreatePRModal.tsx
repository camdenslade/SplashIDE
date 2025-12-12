import { useState } from "react";

interface Props {
  workspaceRoot: string | null;
  currentBranch: string;
  diffText: string;
  initialTitle: string;
  initialBody: string;
  onClose: () => void;
}

interface SplashAPI {
  gitRemoteList(root: string | null): Promise<{ stdout: string }>;

  githubCreatePullRequest(input: {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base: string;
  }): Promise<{ html_url: string }>;
}

export default function CreatePRModal({
  workspaceRoot,
  currentBranch,
  diffText,
  initialTitle,
  initialBody,
  onClose,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  async function submit() {
    const splash = (window as unknown as { splash: SplashAPI }).splash;

    const remotes = await splash.gitRemoteList(workspaceRoot);

    const originLine = remotes.stdout
      .split("\n")
      .find((l: string) => l.startsWith("origin"));

    if (!originLine) {
      alert("No GitHub remote found.");
      return;
    }

    const match = originLine.match(/github\.com[:/](.+?)\/(.+?)\.git/);
    if (!match) {
      alert("Remote is not a GitHub repo.");
      return;
    }

    const owner = match[1];
    const repo = match[2];

    const pr = await splash.githubCreatePullRequest({
      owner,
      repo,
      title,
      body,
      head: currentBranch,
      base: "main",
    });

    alert("PR created: " + pr.html_url);
    onClose();
  }

  return (
    <div className="modal">
      <h3>Create Pull Request</h3>

      <input
        placeholder="PR Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
      />

      <textarea
        placeholder="PR Description"
        value={body}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setBody(e.target.value)
        }
        style={{ height: 140 }}
      />

      <h4>Diff (truncated)</h4>
      <pre className="diff-box">{diffText.slice(0, 2000)}</pre>

      <button onClick={submit}>Submit PR</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
