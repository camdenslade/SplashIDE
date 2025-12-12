//********************************************************************
//
// AppInfoService Class (Renderer)
//
// VS Code-style app info service implementation for the renderer process.
// Provides access to application metadata. Loads application metadata
// from the manifest file and provides it to components that need version
// or build information.
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
// appInfo    IAppInfo|null    Cached application info from manifest
//
//*******************************************************************

import { IAppInfoService, IAppInfo } from '../../common/models/appInfo';

export class AppInfoService implements IAppInfoService {
	private appInfo: IAppInfo | null = null;

	constructor() {
		this.loadAppInfo();
	}

	getAppInfo(): IAppInfo {
		if (!this.appInfo) {
			return {
				version: '0.1.0',
				buildTimestamp: new Date().toISOString(),
				environment: process.env.NODE_ENV ?? 'development',
				name: 'Splash IDE'
			};
		}
		return this.appInfo;
	}

	private async loadAppInfo(): Promise<void> {
		try {
			const response = await fetch('/app.manifest.json');
			if (response.ok) {
				const manifest = await response.json();
				this.appInfo = {
					version: manifest.version ?? '0.1.0',
					buildTimestamp: manifest.buildTimestamp ?? new Date().toISOString(),
					environment: manifest.environment ?? process.env.NODE_ENV ?? 'development',
					name: manifest.name ?? 'Splash IDE'
				};
			}
		} catch (error: unknown) {
			console.warn('Failed to load app manifest:', error);
		}
	}
}
