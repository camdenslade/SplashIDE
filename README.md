# Developer Guide

## Overview
This IDE primarily serves as a personal tool for my own development purposes. Feel free to use it or propose changes/fixes or port your own version.

This guide provides comprehensive information for developers working on the Splash IDE codebase. The application follows VS Code's architecture patterns with a service-based design, dependency injection, and strict TypeScript.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Services](#services)
3. [Adding Commands](#adding-commands)
4. [Creating Extensions](#creating-extensions)
5. [Working with TypeScript Service](#working-with-typescript-service)
6. [Debugging IPC](#debugging-ipc)
7. [Running and Building](#running-and-building)

## Architecture Overview

### Directory Structure

```
app/
├── src/
│   ├── browser/          # Renderer process code
│   │   ├── workbench/    # Main workbench UI
│   │   ├── ui/           # UI components
│   │   ├── panels/       # Panel components
│   │   ├── services/     # Renderer-side service proxies
│   │   ├── commands/     # Command system
│   │   ├── keybindings/  # Keybinding system
│   │   └── hooks/        # React hooks
│   ├── electron-main/    # Main process code
│   │   ├── services/     # Main process service implementations
│   │   │   └── providers/ # File system providers
│   │   ├── lsp/          # Language server protocol (TypeScript)
│   │   └── ipc/          # IPC channel implementations
│   ├── common/           # Shared code
│   │   ├── models/       # Service interfaces and models
│   │   ├── messages/     # IPC message types
│   │   ├── ipc/          # IPC channel names and interfaces
│   │   ├── types/        # Shared types
│   │   ├── log/          # Logging system
│   │   ├── agents/       # AI agent system
│   │   ├── templates/    # Code templates
│   │   └── utils/        # Common utilities
│   ├── extensions/       # Extension system
│   │   └── builtin/      # Built-in extensions
│   ├── utils/            # Utility functions
│   ├── monaco.ts         # Monaco editor configuration
│   └── qa/               # Testing utilities
└── renderer/             # Vite renderer build output
```

### Key Concepts

#### Dependency Injection

The application uses VS Code's dependency injection pattern via `InstantiationService`. Services are registered with unique identifiers and retrieved via `instantiationService.get(ServiceIdentifier)`.

```typescript
import { InstantiationService } from '../common/models/instantiation';
import { IFileService, IFileService as IFileServiceId } from '../common/models/services';

const instantiationService = new InstantiationService();
instantiationService.registerService({
  id: IFileServiceId,
  factory: () => new FileService(),
  singleton: true
});

const fileService = instantiationService.get(IFileServiceId);
```

#### Service Architecture

Services are split into:
- **Interfaces** (`src/common/models/services.ts`) - Shared between main and renderer
- **Renderer Implementations** (`src/browser/services/`) - Proxies that communicate via IPC
- **Main Implementations** (`src/electron-main/services/`) - Actual service logic

#### IPC Communication

All IPC communication is strongly typed:
- **Channels** defined in `src/common/ipc/channelNames.ts` (`IpcChannel` enum)
- **Messages** defined in `src/common/messages/ipcMessages.ts`
- **Channel Interfaces** defined in `src/common/ipc/ipcChannel.ts`
- **Implementations** in `src/electron-main/ipc/ipcChannelImpl.ts`
- **Handlers** registered in `src/electron-main/main.ts`

#### Code Documentation

All exported functions, classes, and interfaces use a standardized documentation format:

```typescript
//********************************************************************
//
// Function/Class Name
//
// Brief description of what the function/class does and how it works.
//
// Return Value
// ------------
// Type    Description
//
// Value Parameters
// ----------------
// param1    Type    Description
//
// Reference Parameters
// --------------------
// None (or list if any)
//
// Local Variables
// ---------------
// var1    Type    Description
//
//*******************************************************************
```

## Services

### Available Services

- `IFileService` - File system operations (read, write, create, delete files)
- `IWorkspaceService` - Workspace management (indexing, import graphs, multi-root support)
- `IGitService` - Git operations (status, commit, branch, remote operations)
- `IAgentService` - AI agent execution (run agents, list agents, register agents)
- `IEditorService` - Editor model management (Monaco editor integration)
- `ITypeScriptService` - TypeScript language features (completions, diagnostics, formatting)
- `ICommandService` - Command execution (register and execute commands)
- `IKeybindingService` - Keyboard shortcuts (register keybindings with context keys)
- `IFileSystemProviderService` - File system provider management (register providers for different URI schemes)

### Using Services in React Components

```typescript
import { useService } from '../hooks/useService';
import { IFileService } from '../../common/models/services';

function MyComponent() {
  const fileService = useService(IFileService);
  
  const handleClick = async () => {
    const content = await fileService.readFile('/path/to/file');
    console.log(content);
  };
  
  return <button onClick={handleClick}>Read File</button>;
}
```

### Creating a New Service

1. **Define the interface** in `src/common/models/services.ts`:

```typescript
export interface IMyService {
  doSomething(): Promise<string>;
}

export const IMyService = createServiceIdentifier<IMyService>('IMyService');
```

2. **Implement in main process** (`src/electron-main/services/myService.ts`):

```typescript
import { IMyService } from '../../common/models/services';

export class MyService implements IMyService {
  async doSomething(): Promise<string> {
    return 'Hello from main process';
  }
}
```

3. **Implement in renderer** (`src/browser/services/myService.ts`):

```typescript
import { IMyService } from '../../common/models/services';

export class MyService implements IMyService {
  async doSomething(): Promise<string> {
    // Proxy to main process via IPC
    const response = await window.splash.myServiceDoSomething();
    return response.result;
  }
}
```

4. **Register in bootstrap** (`src/browser/bootstrap.ts` and `src/electron-main/main.ts`)

## Adding Commands

### Registering a Command

```typescript
import { ICommandService } from '../../common/models/services';
import { useService } from '../hooks/useService';

function MyComponent() {
  const commandService = useService(ICommandService);
  
  useEffect(() => {
    const disposable = commandService.registerCommand({
      id: 'my.command',
      title: 'My Command',
      handler: {
        execute: async () => {
          console.log('Command executed!');
        }
      }
    });
    
    return () => disposable.dispose();
  }, [commandService]);
}
```

### Executing a Command

```typescript
await commandService.executeCommand('my.command');
```

### Command from Keybinding

```typescript
import { IKeybindingService } from '../../common/models/services';

keybindingService.registerKeybinding({
  key: 'Control+K',
  command: 'my.command',
  when: undefined // or context key expression
});
```

## Creating Extensions

### Extension Structure

Extensions are located in `src/extensions/builtin/` and follow this structure:

```typescript
// src/extensions/builtin/myExtension.ts
import { IExtensionManifest } from './extensionManifest';

export const myExtension: IExtensionManifest = {
  name: 'my-extension',
  displayName: 'My Extension',
  version: '1.0.0',
  contributes: {
    commands: [
      {
        id: 'my.extension.command',
        title: 'My Extension Command'
      }
    ],
    agents: [
      {
        name: 'my-agent',
        description: 'My agent description',
        systemPrompt: 'You are a helpful assistant.',
        tools: [],
        handler: async (payload) => {
          return { result: 'success' };
        }
      }
    ]
  }
};
```

### Registering an Extension

```typescript
// src/extensions/builtin/index.ts
import { myExtension } from './myExtension';
import { extensionRegistry } from './extensionRegistry';

export function activateBuiltinExtensions() {
  extensionRegistry.register(myExtension);
}
```

## Monaco Editor Configuration

Monaco editor is configured in `src/monaco.ts`. This file:

- Loads Monaco editor API and language contributions
- Configures worker URLs for language services (JSON, CSS, HTML, TypeScript)
- Defines the `vs-dark-plus` theme matching VS Code's Dark+ theme

The Monaco instance is exported as the default export and can be imported:

```typescript
import monaco from '../monaco';

const editor = monaco.editor.create(container, {
  value: 'console.log("Hello")',
  language: 'typescript',
  theme: 'vs-dark-plus'
});
```

## Working with TypeScript Service

### Getting Completions

```typescript
import { ITypeScriptService } from '../../common/models/services';

const typeScriptService = useService(ITypeScriptService);

const completions = await typeScriptService.getCompletions(
  '/path/to/file.ts',
  10, // line (0-based)
  5   // offset
);
```

### Getting Diagnostics

```typescript
const diagnostics = await typeScriptService.getDiagnostics([
  '/path/to/file.ts'
]);
```

### Formatting a Document

```typescript
const edits = await typeScriptService.formatDocument(
  '/path/to/file.ts',
  {
    tabSize: 2,
    indentSize: 2,
    insertSpaces: true
  }
);
```

### Navigating to Definition

```typescript
const locations = await typeScriptService.navigateToDefinition(
  '/path/to/file.ts',
  10, // line
  5   // offset
);
```

## Debugging IPC

### Enabling IPC Logging

IPC communication can be logged by adding console.log statements in:
- `src/electron-main/preload.ts` - Preload script IPC calls
- `src/electron-main/main.ts` - Main process IPC handlers
- `src/browser/services/*.ts` - Renderer service proxies

### Common IPC Issues

1. **Type Mismatches**: Ensure request/response types match between `ipcMessages.ts` and handlers
2. **Channel Names**: Use `IpcChannel` enum, never string literals
3. **Serialization**: IPC messages must be JSON-serializable (no functions, no circular references)

### IPC Message Flow

```
Renderer Component
  ↓
Renderer Service (src/browser/services/)
  ↓
window.splash API (preload.ts)
  ↓
IPC Channel (IpcChannel enum)
  ↓
Main Process Handler (main.ts)
  ↓
Main Process Service (src/electron-main/services/)
```

## Running and Building

### Development

```bash
# Start development server (runs Vite + Electron concurrently)
npm run dev

# This runs:
# - Vite dev server (renderer) on http://localhost:5173
# - Electron (main process) with dev tools open
```

### Development Setup

1. Install dependencies: `npm install` (and `cd renderer && npm install`)
2. Run `npm run dev` to start the development environment
3. The renderer is served via Vite and auto-reloads on changes
4. Main process requires restart to pick up changes

### Building

```bash
# Build TypeScript
npm run compile

# Build renderer
npm run build:renderer

# Build everything
npm run build

# Production build
npm run build:prod

# Package for distribution
npm run package
```

### Build Output

- TypeScript: `dist-ts/` (all compiled TypeScript)
- Renderer: `dist-ts/renderer/` (compiled renderer code from `src/browser/`)
- Main: `dist-ts/electron-main/` (compiled main process code)
- Extensions: `dist-ts/extensions/` (compiled extension code)
- Common: `dist-ts/common/` (compiled shared code)

### TypeScript Configuration

The project uses composite TypeScript projects:
- `src/tsconfig.json` - Root configuration
- `src/common/tsconfig.json` - Common types
- `src/browser/tsconfig.json` - Browser code
- `src/electron-main/tsconfig.json` - Main process
- `src/extensions/tsconfig.json` - Extensions

Build with: `tsc -b` (from `src/` directory)

## Best Practices

### Type Safety

- Always use service interfaces, never concrete implementations
- Use `ServiceIdentifier<T>` for service IDs
- Type all IPC messages

### Error Handling

- Wrap service calls in try/catch
- Log errors but don't break the UI
- Provide user-friendly error messages

### Performance

- Use lazy loading for large components
- Debounce TypeScript server requests
- Dispose of resources properly

### Code Organization

- Keep components small and focused
- Use services for business logic
- Keep UI components presentation-only

## Troubleshooting

### Service Not Found

Ensure the service is registered in:
- `src/browser/bootstrap.ts` (renderer)
- `src/electron-main/main.ts` (main)

### IPC Not Working

1. Check channel name matches `IpcChannel` enum
2. Verify message types match
3. Check preload script is loaded
4. Verify context isolation is enabled

### TypeScript Errors

1. Run `npm run compile` to check for errors
2. Ensure all imports use correct paths
3. Check `tsconfig.json` includes all necessary files

## Performance Best Practices

### Memoization

Use `useMemo` and `useCallback` for expensive computations and event handlers:

```typescript
const results = useMemo(() => {
  return expensiveComputation(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);
```

### Lazy Loading

Lazy load heavy components:

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### Debouncing

Debounce expensive operations:

```typescript
const debouncedUpdate = useMemo(
  () => debounce((value: string) => {
    updateService(value);
  }, 300),
  []
);
```

## Memory Management

### Service Disposal

All services should implement `IDisposable`:

```typescript
class MyService implements IDisposable {
  dispose(): void {
    // Clean up resources
    this.listeners.clear();
    this.models.dispose();
  }
}
```

### Event Listener Cleanup

Always clean up event listeners:

```typescript
useEffect(() => {
  const handler = () => { /* ... */ };
  window.addEventListener('event', handler);
  return () => {
    window.removeEventListener('event', handler);
  };
}, []);
```

## Theme System

### Using Themes

```typescript
import { useTheme, useColor } from '../theme/useTheme';

function MyComponent() {
  const themeService = useTheme();
  const backgroundColor = useColor('sideBar.background');
  
  return (
    <div style={{ background: backgroundColor }}>
      Content
    </div>
  );
}
```

### Registering Color Tokens

```typescript
themeService.registerColorToken({
  id: 'my.color',
  description: 'My custom color',
  defaults: {
    light: '#ffffff',
    dark: '#000000'
  }
});
```

## Testing

### Using Test Harness

```typescript
import { ServiceTestHarness } from '../qa/testUtils';

const harness = new ServiceTestHarness();
harness.registerService(IFileService, () => mockFileService);
const fileService = harness.getService(IFileService);
```

### Assertions

```typescript
import { assert, assertEqual, assertDefined } from '../qa/testUtils';

assert(condition, 'Condition should be true');
assertEqual(actual, expected, 'Values should match');
assertDefined(value, 'Value should be defined');
```

## Logging

### Using Loggers

All services should use scoped loggers:

```typescript
import { Logger } from '../common/log/logger';

class MyService {
  private readonly logger = Logger.create('MyService');

  async doSomething() {
    this.logger.info('Starting operation');
    try {
      // ...
      this.logger.debug('Operation details', { data });
    } catch (error: unknown) {
      this.logger.error('Operation failed', { error });
      throw error;
    }
  }
}
```

### Log Levels

Set log level globally:

```typescript
import { Logger } from '../common/log/logger';
import { LogLevel } from '../common/log/logLevels';

Logger.setGlobalLevel(LogLevel.Debug);
```

### Viewing Logs

Use the `developer.showLogs` command or open the log viewer UI.

## Edge Case Handling

### Workspace Edge Cases

Always handle:
- Empty workspaces
- Large workspaces (20k+ files)
- Missing package.json
- Circular imports

### File System Edge Cases

Always handle:
- Nonexistent files
- Permission denied
- Large files (1MB+)
- UTF-8 BOM

### Editor Edge Cases

Always handle:
- Rapid file switching
- Multiple editors
- Proper disposal

## File System Providers

File system providers allow the application to work with different file systems via URI schemes. Built-in providers include:

- **`file`** - Local file system (default)
- **`memfs`** - In-memory file system for scratch buffers and ephemeral workspaces
- **`remote`** - Remote file system (stub implementation)

### Creating a Provider

Implement `IFileSystemProvider`:

```typescript
import { IFileSystemProvider, FileType, IStat, IFileChange, FileChangeType } from '../common/types/filesystem';
import { URI } from '../common/types/uri';
import { Emitter } from '../common/types/event';

class MyProvider implements IFileSystemProvider {
  readonly scheme = 'myfs';
  private readonly _onDidChangeFile = new Emitter<readonly IFileChange[]>();
  readonly onDidChangeFile = this._onDidChangeFile.event;

  async readFile(uri: URI): Promise<Uint8Array> {
    // Implementation
  }

  async writeFile(uri: URI, content: Uint8Array, options: {...}): Promise<void> {
    // Implementation
    // Fire change event after write
    this._onDidChangeFile.fire([{ uri, type: FileChangeType.Changed }]);
  }

  async stat(uri: URI): Promise<IStat> {
    // Implementation
  }

  async readDirectory(uri: URI): Promise<[string, FileType][]> {
    // Implementation
  }

  // ... other required methods

  dispose(): void {
    this._onDidChangeFile.dispose();
  }
}
```

### Registering a Provider

```typescript
const providerService = instantiationService.get(IFileSystemProviderService);
const disposable = providerService.registerProvider('myfs', new MyProvider());
// Later: disposable.dispose();
```

### Using Providers in FileService

FileService automatically routes to providers based on URI scheme:

```typescript
// This will use the 'memfs' provider
const content = await fileService.readFile('memfs:///file.txt');

// This will use the local file provider
const content = await fileService.readFile('file:///path/to/file.txt');
```

## Multi-Root Workspaces

### Managing Workspace Folders

```typescript
const workspaceService = instantiationService.get(IWorkspaceService);

// Add a folder
await workspaceService.addWorkspaceFolder(URI.file('/path/to/folder'));

// Get all folders
const folders = workspaceService.getWorkspaceFolders();

// Listen for changes
workspaceService.onDidChangeWorkspaceFolders((event) => {
  console.log('Added:', event.added);
  console.log('Removed:', event.removed);
});

// Remove a folder
await workspaceService.removeWorkspaceFolder(URI.file('/path/to/folder'));
```

### Workspace Commands

- `workspace.addFolder` - Add local folder
- `workspace.removeFolder` - Remove folder
- `workspace.addRemoteFolder` - Add remote folder (stub)

## Agent System

### Agent Structure

Agents are AI-powered tools that can modify code, analyze files, and perform code-related tasks. They follow a structured format:

```typescript
import { AgentDefinition } from '../common/types/agent';

const myAgent: AgentDefinition = {
  name: 'my-agent',
  description: 'Agent description',
  systemPrompt: 'You are a helpful coding assistant.',
  tools: [
    {
      name: 'readFile',
      description: 'Read a file',
      handler: async (args) => {
        // Tool implementation
      }
    }
  ]
};
```

### Agent Execution Flow

1. User initiates agent via command or UI
2. Agent runner (`src/common/agents/agentRunner.ts`) detects intent
3. If template matches intent, uses template generator
4. Otherwise, constructs LLM prompt with workspace context
5. LLM generates response (patches, file operations, etc.)
6. Results are returned to the caller

### Available Agents

- `architectAgent` - Meta-engineer agent for modifying the IDE itself

## Utilities

The `src/utils/` directory contains utility functions:

- **File System**: `fileSystemWalker.ts`, `fileSystemCache.ts`, `fileWatcher.ts`
- **Code Tools**: `patchParser.ts`, `patchApply.ts`, `diff.ts`
- **Formatters**: `eslintTool.ts`, `prettierTool.ts`
- **Import Analysis**: `importGraph.ts`
- **Workspace**: `workspaceIndexer.ts`, `fileSystemService.ts`
- **Path Helpers**: `pathHelpers.ts`
- **Agent Storage**: `agentStorage.ts`, `callLLM.ts`

## Additional Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/api/index.html)
- [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [React Performance](https://react.dev/learn/render-and-commit)
- [TypeScript Language Server Protocol](https://github.com/Microsoft/TypeScript/wiki/Standalone-Server-%28tsserver%29)
