/**
 * Color Registry
 * 
 * Central registry for color token definitions.
 * 
 * @remarks
 * This module provides a centralized location for all color token
 * definitions used throughout the application. Color tokens are
 * registered here and can be consumed by the theme service.
 */

import type { ColorToken } from './themeService';

/**
 * Color token registry.
 */
export const colorRegistry: ColorToken[] = [
	// Editor colors
	{
		id: 'editor.background',
		description: 'Editor background color',
		defaults: {
			light: '#ffffff',
			dark: '#1e1e1e'
		}
	},
	{
		id: 'editor.foreground',
		description: 'Editor foreground color',
		defaults: {
			light: '#000000',
			dark: '#d4d4d4'
		}
	},
	{
		id: 'editor.lineHighlightBackground',
		description: 'Background color for the current line highlight',
		defaults: {
			light: '#f0f0f0',
			dark: '#2a2d2e'
		}
	},
	{
		id: 'editor.selectionBackground',
		description: 'Color of the editor selection',
		defaults: {
			light: '#add6ff',
			dark: '#264f78'
		}
	},

	// Sidebar colors
	{
		id: 'sideBar.background',
		description: 'Sidebar background color',
		defaults: {
			light: '#f3f3f3',
			dark: '#252526'
		}
	},
	{
		id: 'sideBar.foreground',
		description: 'Sidebar foreground color',
		defaults: {
			light: '#616161',
			dark: '#cccccc'
		}
	},
	{
		id: 'sideBarTitle.foreground',
		description: 'Sidebar title foreground color',
		defaults: {
			light: '#616161',
			dark: '#cccccc'
		}
	},

	// Activity bar colors
	{
		id: 'activityBar.background',
		description: 'Activity bar background color',
		defaults: {
			light: '#2c2c2c',
			dark: '#333337'
		}
	},
	{
		id: 'activityBar.foreground',
		description: 'Activity bar foreground color',
		defaults: {
			light: '#ffffff',
			dark: '#cccccc'
		}
	},
	{
		id: 'activityBarBadge.background',
		description: 'Activity bar badge background color',
		defaults: {
			light: '#007acc',
			dark: '#007acc'
		}
	},
	{
		id: 'activityBarBadge.foreground',
		description: 'Activity bar badge foreground color',
		defaults: {
			light: '#ffffff',
			dark: '#ffffff'
		}
	},

	// Panel colors
	{
		id: 'panel.background',
		description: 'Panel background color',
		defaults: {
			light: '#ffffff',
			dark: '#1e1e1e'
		}
	},
	{
		id: 'panel.foreground',
		description: 'Panel foreground color',
		defaults: {
			light: '#000000',
			dark: '#cccccc'
		}
	},
	{
		id: 'panel.border',
		description: 'Panel border color',
		defaults: {
			light: '#e5e5e5',
			dark: '#3e3e42'
		}
	},

	// Status bar colors
	{
		id: 'statusBar.background',
		description: 'Status bar background color',
		defaults: {
			light: '#007acc',
			dark: '#007acc'
		}
	},
	{
		id: 'statusBar.foreground',
		description: 'Status bar foreground color',
		defaults: {
			light: '#ffffff',
			dark: '#ffffff'
		}
	},

	// File tree colors
	{
		id: 'tree.indentGuidesStroke',
		description: 'Tree indent guide stroke color',
		defaults: {
			light: '#a0a0a0',
			dark: '#585858'
		}
	},
	{
		id: 'list.activeSelectionBackground',
		description: 'List active selection background color',
		defaults: {
			light: '#0078d4',
			dark: '#094771'
		}
	},
	{
		id: 'list.activeSelectionForeground',
		description: 'List active selection foreground color',
		defaults: {
			light: '#ffffff',
			dark: '#ffffff'
		}
	},
	{
		id: 'list.hoverBackground',
		description: 'List hover background color',
		defaults: {
			light: '#e8e8e8',
			dark: '#2a2d2e'
		}
	}
];
