//********************************************************************
//
// FileSystemProviderService Class
//
// VS Code-style file system provider service for the main process.
// Manages file system providers for different URI schemes. Registers
// and manages file system providers, routing file operations to the
// appropriate provider based on URI scheme.
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
// providers    Map<string, IFileSystemProvider>    Map of scheme to provider
// logger       Logger                              Logger instance
//
//*******************************************************************

import { IFileSystemProviderService } from '../../common/models/services';
import { IFileSystemProvider } from '../../common/types/filesystem';
import { IDisposable } from '../../common/types/disposable';
import { Logger } from '../../common/log/logger';

export class FileSystemProviderService implements IFileSystemProviderService {
	private readonly providers = new Map<string, IFileSystemProvider>();
	private readonly logger = Logger.create('FileSystemProviderService');

	registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable {
		if (this.providers.has(scheme)) {
			this.logger.warn(`Provider already registered for scheme: ${scheme}`);
		}

		this.providers.set(scheme, provider);
		this.logger.info(`Registered file system provider: ${scheme}`);

		return {
			dispose: () => {
				this.providers.delete(scheme);
				provider.dispose();
				this.logger.info(`Unregistered file system provider: ${scheme}`);
			}
		};
	}

	getProvider(scheme: string): IFileSystemProvider | undefined {
		return this.providers.get(scheme);
	}

	hasProvider(scheme: string): boolean {
		return this.providers.has(scheme);
	}

	dispose(): void {
		for (const provider of this.providers.values()) {
			provider.dispose();
		}
		this.providers.clear();
	}
}
