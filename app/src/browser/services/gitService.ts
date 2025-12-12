//********************************************************************
//
// GitService Class (Renderer)
//
// VS Code-style git service implementation for the renderer process.
// Proxies all git operations to the main process via IPC. Provides
// Git operations including status, commit, branch management, and
// remote operations. All operations are proxied to the main process
// where Git commands are executed.
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

import { IGitService } from '../../common/models/services';
import '../../common/types/splashIPC';

export class GitService implements IGitService {
	async init(root: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitInit(root);
	}

	async status(root: string): Promise<unknown> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitStatus(root);
	}

	async add(root: string, file: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitAdd(root, file);
	}

	async reset(root: string, file: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitReset(root, file);
	}

	async commit(root: string, message: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitCommit(root, message);
	}

	async diff(root: string, file: string): Promise<string> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitDiff(root, file);
	}

	async diffStaged(root: string, file: string): Promise<string> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitDiffStaged(root, file);
	}

	async branches(root: string): Promise<string[]> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitBranches(root);
	}

	async checkout(root: string, branch: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitCheckout(root, branch);
	}

	async createBranch(root: string, branch: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitCreateBranch(root, branch);
	}

	async push(root: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitPush(root);
	}

	async pull(root: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitPull(root);
	}

	async addRemote(root: string, name: string, url: string): Promise<boolean> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitAddRemote(root, name, url);
	}

	async remoteList(root: string): Promise<Array<{ name: string; url: string }>> {
		if (!window.splash) {
			throw new Error('Splash API not available');
		}
		return await window.splash.gitRemoteList(root);
	}
}
