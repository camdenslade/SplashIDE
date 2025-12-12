//********************************************************************
//
// IContextMenuItem Interface
//
// Represents a single item in a context menu. Defines the display label,
// command to execute, and optional properties like enabled state and
// separator.
//
// Return Value
// ------------
// None (interface definition)
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

import { ICommandService } from '../../common/models/services';
import { getInstantiationService } from '../bootstrap';

export interface IContextMenuItem {
	id: string;
	label: string;
	command?: string;
	args?: unknown[];
	enabled?: boolean;
	separator?: boolean;
}

//********************************************************************
//
// IContextMenuService Interface
//
// Service interface for showing context menus. Provides floating context
// menus that appear at mouse position. Menus close on click outside and
// execute commands when items are clicked.
//
// Return Value
// ------------
// None (interface definition)
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

export interface IContextMenuService {
	showMenu(event: MouseEvent, items: IContextMenuItem[]): void;
}

class ContextMenuService implements IContextMenuService {
	private menuElement: HTMLDivElement | null = null;
	private commandService: ICommandService;

	constructor() {
		const instantiationService = getInstantiationService();
		this.commandService = instantiationService.get(ICommandService);
		this.setupGlobalListeners();
	}

	private setupGlobalListeners(): void {
		document.addEventListener('click', (e) => {
			if (this.menuElement && !this.menuElement.contains(e.target as Node)) {
				this.closeMenu();
			}
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.menuElement) {
				this.closeMenu();
			}
		});
	}

	showMenu(event: MouseEvent, items: IContextMenuItem[]): void {
		this.closeMenu();

		const enabledItems = items.filter((item) => item.enabled !== false);

		if (enabledItems.length === 0) {
			return;
		}

		const menu = document.createElement('div');
		menu.className = 'context-menu';
		menu.style.cssText = `
			position: fixed;
			left: ${event.clientX}px;
			top: ${event.clientY}px;
			background: #252526;
			border: 1px solid #454545;
			border-radius: 3px;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
			padding: 4px 0;
			min-width: 180px;
			z-index: 10000;
			font-size: 13px;
			color: #cccccc;
		`;

		// Create menu items
		enabledItems.forEach((item, index) => {
			if (item.separator && index > 0) {
				const separator = document.createElement('div');
				separator.style.cssText = `
					height: 1px;
					background: #3e3e42;
					margin: 4px 0;
				`;
				menu.appendChild(separator);
			}

			// Skip rendering a clickable item when it's just a separator
			if (!item.command) {
				return;
			}

			const menuItem = document.createElement('div');
			menuItem.className = 'context-menu-item';
			menuItem.textContent = item.label;
			menuItem.style.cssText = `
				padding: 4px 20px;
				cursor: pointer;
				user-select: none;
			`;

			// Hover effect
			menuItem.addEventListener('mouseenter', () => {
				menuItem.style.backgroundColor = '#094771';
			});
			menuItem.addEventListener('mouseleave', () => {
				menuItem.style.backgroundColor = 'transparent';
			});

			// Click handler
			menuItem.addEventListener('click', async (e) => {
				e.stopPropagation();
				this.closeMenu();
				try {
					await this.commandService.executeCommand(
						item.command!,
						...(item.args || [])
					);
				} catch (error) {
					console.error(`Error executing command ${item.command}:`, error);
				}
			});

			menu.appendChild(menuItem);
		});

		// Position menu to stay within viewport
		document.body.appendChild(menu);
		const rect = menu.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		if (rect.right > viewportWidth) {
			menu.style.left = `${viewportWidth - rect.width - 10}px`;
		}
		if (rect.bottom > viewportHeight) {
			menu.style.top = `${viewportHeight - rect.height - 10}px`;
		}

		this.menuElement = menu;
	}

	private closeMenu(): void {
		if (this.menuElement) {
			this.menuElement.remove();
			this.menuElement = null;
		}
	}
}

let contextMenuServiceInstance: IContextMenuService | null = null;

//********************************************************************
//
// getContextMenuService Function
//
// Gets the singleton context menu service instance. Creates a new
// instance on first call and returns the same instance for subsequent
// calls.
//
// Return Value
// ------------
// IContextMenuService    The context menu service instance
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

export function getContextMenuService(): IContextMenuService {
	if (!contextMenuServiceInstance) {
		contextMenuServiceInstance = new ContextMenuService();
	}
	return contextMenuServiceInstance;
}

