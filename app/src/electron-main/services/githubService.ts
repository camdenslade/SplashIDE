//********************************************************************
//
// githubService Object
//
// GitHub integration service. Provides methods for interacting with
// the GitHub API including token management, user info retrieval,
// repository creation, and pull request creation. Uses encrypted
// token storage for secure credential management.
//
// Return Value
// ------------
// None (object definition with methods)
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
// GITHUB_API    string    GitHub API base URL
// token         string    GitHub access token from encrypted storage
// res           Response   Fetch API response
// data          any        JSON response data
//
//*******************************************************************

import fetch from "node-fetch";
import { loadEncryptedToken, saveEncryptedToken } from "./cryptoUtil";

const GITHUB_API = "https://api.github.com";

export const githubService = {
  saveToken(token: string) {
    saveEncryptedToken(token);
    return true;
  },

  getToken() {
    return loadEncryptedToken();
  },

  async getUser() {
    const token = loadEncryptedToken();
    if (!token) return null;

    const res = await fetch(`${GITHUB_API}/user`, {
      headers: { Authorization: `token ${token}` },
    });

    if (!res.ok) return null;
    return res.json();
  },

  async createRepo(name: string, description: string, isPrivate: boolean) {
    const token = loadEncryptedToken();
    if (!token) throw new Error("Missing GitHub token");

    const res = await fetch(`${GITHUB_API}/user/repos`, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data;
  },

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string) {
    const token = loadEncryptedToken();
    if (!token) throw new Error("Missing GitHub token");

    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        body,
        head,
        base,
      }),
    });

    const payload = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(payload));
    return payload;
  },
};

