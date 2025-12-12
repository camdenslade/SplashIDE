//********************************************************************
//
// runGit Function
//
// Helper function that executes Git commands via spawnSync and returns
// typed results including stdout, stderr, and success status.
//
// Return Value
// ------------
// Object with stdout, stderr, and success properties
//
// Value Parameters
// ----------------
// args    string[]    Git command arguments
// cwd     string      Working directory for the command
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// result    SpawnSyncReturns<Buffer>    Result from spawnSync
//
//*******************************************************************

import { IGitService } from '../../common/models/services';
import { spawnSync } from "child_process";

function runGit(args: string[], cwd: string) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
  });

  return {
    stdout: result.stdout?.trim() ?? "",
    stderr: result.stderr?.trim() ?? "",
    success: result.status === 0,
  };
}

//********************************************************************
//
// GitService Class
//
// VS Code-style git service implementation for the main process.
// All Git operations are executed via spawnSync and return typed
// results. Handles Git commands including status, commit, branch
// management, and remote operations.
//
// Return Value
// ------------
// None (class definition)
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
// None
//
//*******************************************************************

export class GitService implements IGitService {
	async init(root: string): Promise<boolean> {
		const result = runGit(["init"], root);
		return result.success;
	}

	async status(root: string): Promise<unknown> {
		return runGit(["status", "--porcelain"], root);
	}

	async add(root: string, file: string): Promise<boolean> {
		const result = runGit(["add", file], root);
		return result.success;
	}

	async reset(root: string, file: string): Promise<boolean> {
		const result = runGit(["reset", file], root);
		return result.success;
	}

	async commit(root: string, message: string): Promise<boolean> {
		const result = runGit(["commit", "-m", message], root);
		return result.success;
	}

	async diff(root: string, file: string): Promise<string> {
		const result = runGit(["diff", file], root);
		return result.stdout;
	}

	async diffStaged(root: string, file: string): Promise<string> {
		const result = runGit(["diff", "--cached", file], root);
		return result.stdout;
	}

	async branches(root: string): Promise<string[]> {
		const result = runGit(["branch", "--list"], root);
		return result.stdout
			.split('\n')
			.map((b) => b.trim())
			.filter((b) => b.length > 0);
	}

	async checkout(root: string, branch: string): Promise<boolean> {
		const result = runGit(["checkout", branch], root);
		return result.success;
	}

	async createBranch(root: string, branch: string): Promise<boolean> {
		const result = runGit(["checkout", "-b", branch], root);
		return result.success;
	}

	async push(root: string): Promise<boolean> {
		const result = runGit(["push"], root);
		return result.success;
	}

	async pull(root: string): Promise<boolean> {
		const result = runGit(["pull"], root);
		return result.success;
	}

	async addRemote(root: string, name: string, url: string): Promise<boolean> {
		const result = runGit(["remote", "add", name, url], root);
		return result.success;
	}

	async remoteList(root: string): Promise<Array<{ name: string; url: string }>> {
		const result = runGit(["remote", "-v"], root);
		const lines = result.stdout.split('\n').filter((l) => l.trim().length > 0);
		const remotes: Array<{ name: string; url: string }> = [];
		for (const line of lines) {
			const parts = line.split(/\s+/);
			if (parts.length >= 2) {
				remotes.push({
					name: parts[0] ?? '',
					url: parts[1] ?? ''
				});
			}
		}
		return remotes;
	}
}
