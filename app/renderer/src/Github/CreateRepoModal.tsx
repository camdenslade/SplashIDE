import { useState } from "react";

interface Props {
  workspaceRoot: string | null;
  onClose: () => void;
}

interface SplashAPI {
  githubCreateRepo(
    name: string,
    desc: string,
    isPrivate: boolean
  ): Promise<{ clone_url: string }>;

  gitAddRemote(
    root: string | null,
    remoteName: string,
    url: string
  ): Promise<void>;

  gitPush(root: string | null): Promise<void>;
}

export default function CreateRepoModal({ workspaceRoot, onClose }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPrivate, setPrivate] = useState(true);

  async function create() {
    const splash = (window as unknown as { splash: SplashAPI }).splash;

    const data = await splash.githubCreateRepo(name, desc, isPrivate);

    const remote = data.clone_url;
    await splash.gitAddRemote(workspaceRoot, "origin", remote);
    await splash.gitPush(workspaceRoot);

    onClose();
  }

  return (
    <div className="modal">
      <h3>Create GitHub Repository</h3>

      <input
        value={name}
        placeholder="Repository name"
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        value={desc}
        placeholder="Description"
        onChange={(e) => setDesc(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setPrivate(e.target.checked)}
        />
        Private repository
      </label>

      <button onClick={create}>Create</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
