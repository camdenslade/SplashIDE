/**
 * Theme Definitions
 * 
 * Predefined theme definitions for light and dark modes.
 * 
 * @remarks
 * This module contains the default theme definitions that are
 * registered with the theme service on startup.
 */

import type { Theme } from './themeService';

/**
 * Default dark theme.
 */
export const darkTheme: Theme = {
	id: 'dark',
	label: 'Dark',
	type: 'dark',
	colors: {
		'editor.background': '#1e1e1e',
		'editor.foreground': '#d4d4d4',
		'editor.lineHighlightBackground': '#2a2d2e',
		'editor.selectionBackground': '#264f78',
		'sideBar.background': '#252526',
		'sideBar.foreground': '#cccccc',
		'sideBarTitle.foreground': '#cccccc',
		'activityBar.background': '#333337',
		'activityBar.foreground': '#cccccc',
		'activityBarBadge.background': '#007acc',
		'activityBarBadge.foreground': '#ffffff',
		'panel.background': '#1e1e1e',
		'panel.foreground': '#cccccc',
		'panel.border': '#3e3e42',
		'statusBar.background': '#007acc',
		'statusBar.foreground': '#ffffff',
		'tree.indentGuidesStroke': '#585858',
		'list.activeSelectionBackground': '#094771',
		'list.activeSelectionForeground': '#ffffff',
		'list.hoverBackground': '#2a2d2e'
	}
};

/**
 * Default light theme.
 */
export const lightTheme: Theme = {
	id: 'light',
	label: 'Light',
	type: 'light',
	colors: {
		'editor.background': '#ffffff',
		'editor.foreground': '#000000',
		'editor.lineHighlightBackground': '#f0f0f0',
		'editor.selectionBackground': '#add6ff',
		'sideBar.background': '#f3f3f3',
		'sideBar.foreground': '#616161',
		'sideBarTitle.foreground': '#616161',
		'activityBar.background': '#2c2c2c',
		'activityBar.foreground': '#ffffff',
		'activityBarBadge.background': '#007acc',
		'activityBarBadge.foreground': '#ffffff',
		'panel.background': '#ffffff',
		'panel.foreground': '#000000',
		'panel.border': '#e5e5e5',
		'statusBar.background': '#007acc',
		'statusBar.foreground': '#ffffff',
		'tree.indentGuidesStroke': '#a0a0a0',
		'list.activeSelectionBackground': '#0078d4',
		'list.activeSelectionForeground': '#ffffff',
		'list.hoverBackground': '#e8e8e8'
	}
};
