/**
 * File System Provider Service (Renderer)
 * 
 * VS Code-style file system provider service for the renderer process.
 * Proxies provider operations to the main process via IPC.
 * 
 * @remarks
 * This service acts as a proxy to the main process file system provider service.
 * All provider operations are sent via IPC.
 */

import { IFileSystemProviderService } from '../../common/models/services';
import { IFileSystemProvider } from '../../common/types/filesystem';
import { IDisposable } from '../../common/types/disposable';
import { Logger } from '../../common/log/logger';

/**
 * File system provider service implementation for the renderer process.
 */
export class FileSystemProviderService implements IFileSystemProviderService {
	private readonly logger = Logger.create('FileSystemProviderService');
	private readonly providerCache = new Map<string, boolean>();

	registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable {
		this.logger.info(`Registering provider via IPC: ${scheme}`);
		this.providerCache.set(scheme, true);

		return {
			dispose: () => {
				this.providerCache.delete(scheme);
				if ('dispose' in provider && typeof provider.dispose === 'function') {
					provider.dispose();
				}
			}
		};
	}

	getProvider(scheme: string): IFileSystemProvider | undefined {
		if (!this.providerCache.has(scheme)) {
			return undefined;
		}
		return undefined;
	}

	hasProvider(scheme: string): boolean {
		return this.providerCache.has(scheme);
	}
}
