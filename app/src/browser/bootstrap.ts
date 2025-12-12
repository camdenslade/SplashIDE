//********************************************************************
//
// bootstrap Function
//
// Initializes the renderer process with all services using VS Code-style
// dependency injection. Registers all renderer services as singletons
// including IFileService, IWorkspaceService, IGitService, IAgentService,
// IEditorService, ITypeScriptService, ICommandService, IKeybindingService,
// IAppInfoService, and IFileSystemProviderService.
//
// Return Value
// ------------
// InstantiationService    The initialized service container
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
// instantiationService    InstantiationService|undefined    Global service container
//
//*******************************************************************
import "../monaco";
import { InstantiationService } from '../common/models/instantiation';
import {
	IFileService,
	IWorkspaceService,
	IGitService,
	IAgentService,
	IEditorService,
	ITypeScriptService,
	ICommandService,
	IKeybindingService,
	IFileSystemProviderService
} from '../common/models/services';
import { IAppInfoService } from '../common/models/appInfo';
import { FileService } from './services/fileService';
import { WorkspaceService } from './services/workspaceService';
import { GitService } from './services/gitService';
import { AgentService } from './services/agentService';
import { EditorService } from './services/editorService';
import { TypeScriptService } from './services/typeScriptService';
import { CommandService } from './commands/commandService';
import { KeybindingService } from './keybindings/keybindingService';
import { AppInfoService } from './services/appInfoService';
import { FileSystemProviderService } from './services/fileSystemProviderService';

let instantiationService: InstantiationService | undefined;

export function bootstrap(): InstantiationService {
	if (instantiationService) {
		return instantiationService;
	}

	instantiationService = new InstantiationService();

	instantiationService.registerService({
		id: IFileService,
		factory: (accessor) => new FileService(accessor.get(IFileSystemProviderService)),
		singleton: true
	});

	instantiationService.registerService({
		id: IWorkspaceService,
		factory: () => new WorkspaceService(),
		singleton: true
	});

	instantiationService.registerService({
		id: IGitService,
		factory: () => new GitService(),
		singleton: true
	});

	instantiationService.registerService({
		id: IAgentService,
		factory: () => new AgentService(),
		singleton: true
	});

	instantiationService.registerService({
		id: IEditorService,
		factory: () => new EditorService(),
		singleton: true
	});

	instantiationService.registerService({
		id: ITypeScriptService,
		factory: () => new TypeScriptService(),
		singleton: true
	});

	instantiationService.registerService({
		id: ICommandService,
		factory: () => new CommandService(),
		singleton: true
	});

	instantiationService.registerService({
		id: IKeybindingService,
		factory: (accessor) => {
			const commandService = accessor.get(ICommandService);
			return new KeybindingService(commandService);
		},
		singleton: true
	});

	instantiationService.registerService({
		id: IAppInfoService,
		factory: () => new AppInfoService(),
		singleton: true
	});

	instantiationService.registerService({
		id: IFileSystemProviderService,
		factory: () => new FileSystemProviderService(),
		singleton: true
	});

	return instantiationService;
}

//********************************************************************
//
// getInstantiationService Function
//
// Gets the global instantiation service for the renderer process. If
// the service hasn't been initialized yet, it will be bootstrapped
// automatically to ensure the service is always available.
//
// Return Value
// ------------
// InstantiationService    The global service container instance
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

export function getInstantiationService(): InstantiationService {
	if (!instantiationService) {
		return bootstrap();
	}
	return instantiationService;
}
