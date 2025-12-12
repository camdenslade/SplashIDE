import { useState } from "react";

interface Props {
  onClose: () => void;
}

interface SplashAPI {
  githubSaveToken(token: string): Promise<void>;
}

export default function GitHubAuthModal({ onClose }: Props) {
  const [token, setToken] = useState("");

  async function save() {
    const splash = (window as unknown as { splash: SplashAPI }).splash;
    await splash.githubSaveToken(token);
    onClose();
  }

  return (
    <div className="modal">
      <h3>Connect to GitHub</h3>
      <p>Enter a GitHub Personal Access Token (PAT):</p>

      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="ghp_..."
      />

      <button onClick={save}>Save Token</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
