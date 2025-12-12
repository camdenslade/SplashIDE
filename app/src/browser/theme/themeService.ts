/**
 * Theme Service
 * 
 * VS Code-style theme service for managing application themes.
 * Provides color tokens and theme switching capabilities.
 * 
 * @remarks
 * This service manages theme definitions and provides color tokens
 * that can be consumed by UI components. It supports light and dark
 * themes and allows extensions to contribute custom themes.
 */

import { Emitter } from '../../common/types/event';
import type { Event } from '../../common/types/event';
import type { IDisposable } from '../../common/types/disposable';

/**
 * Color token identifier.
 */
export type ColorId = string;

/**
 * Color value (hex, rgb, or rgba).
 */
export type ColorValue = string;

/**
 * Theme identifier.
 */
export type ThemeId = 'light' | 'dark' | string;

/**
 * Color token definition.
 */
export interface ColorToken {
	/** Token identifier */
	id: ColorId;
	/** Description of the token */
	description?: string;
	/** Default color value */
	defaults: {
		light?: ColorValue;
		dark?: ColorValue;
	};
}

/**
 * Theme definition.
 */
export interface Theme {
	/** Theme identifier */
	id: ThemeId;
	/** Theme label */
	label: string;
	/** Theme type */
	type: 'light' | 'dark';
	/** Color token values */
	colors: Record<ColorId, ColorValue>;
}

/**
 * Theme service interface.
 */
export interface IThemeService {
	/** Current theme identifier */
	readonly currentTheme: ThemeId;
	/** Event fired when theme changes */
	readonly onDidChangeTheme: Event<ThemeId>;
	/** Gets a color value for a token */
	getColor(token: ColorId): ColorValue | undefined;
	/** Sets the current theme */
	setTheme(themeId: ThemeId): void;
	/** Registers a color token */
	registerColorToken(token: ColorToken): IDisposable;
	/** Registers a theme */
	registerTheme(theme: Theme): IDisposable;
}

/**
 * Theme service implementation.
 */
export class ThemeService implements IThemeService {
	private readonly colorTokens = new Map<ColorId, ColorToken>();
	private readonly themes = new Map<ThemeId, Theme>();
	private currentThemeId: ThemeId = 'dark';
	private readonly _onDidChangeTheme = new Emitter<ThemeId>();

	readonly onDidChangeTheme = this._onDidChangeTheme.event;

	constructor() {
		// Register default themes
		this.registerDefaultThemes();
	}

	get currentTheme(): ThemeId {
		return this.currentThemeId;
	}

	getColor(token: ColorId): ColorValue | undefined {
		const theme = this.themes.get(this.currentThemeId);
		if (!theme) {
			return undefined;
		}

		// Check if theme has explicit color
		if (theme.colors[token]) {
			return theme.colors[token];
		}

		// Fall back to token defaults
		const colorToken = this.colorTokens.get(token);
		if (!colorToken) {
			return undefined;
		}

		return theme.type === 'dark'
			? colorToken.defaults.dark ?? colorToken.defaults.light
			: colorToken.defaults.light ?? colorToken.defaults.dark;
	}

	setTheme(themeId: ThemeId): void {
		if (!this.themes.has(themeId)) {
			console.warn(`Theme not found: ${themeId}`);
			return;
		}

		if (this.currentThemeId !== themeId) {
			this.currentThemeId = themeId;
			this._onDidChangeTheme.fire(themeId);
		}
	}

	registerColorToken(token: ColorToken): IDisposable {
		this.colorTokens.set(token.id, token);
		return {
			dispose: () => {
				this.colorTokens.delete(token.id);
			}
		};
	}

	registerTheme(theme: Theme): IDisposable {
		this.themes.set(theme.id, theme);
		return {
			dispose: () => {
				this.themes.delete(theme.id);
			}
		};
	}

	/**
	 * Registers default themes.
	 */
	private registerDefaultThemes(): void {
		// Register default color tokens
		this.registerDefaultColorTokens();

		// Register dark theme
		this.registerTheme({
			id: 'dark',
			label: 'Dark',
			type: 'dark',
			colors: {
				'editor.background': '#1e1e1e',
				'editor.foreground': '#d4d4d4',
				'sideBar.background': '#252526',
				'sideBar.foreground': '#cccccc',
				'activityBar.background': '#333337',
				'activityBar.foreground': '#cccccc',
				'panel.background': '#1e1e1e',
				'panel.foreground': '#cccccc',
				'statusBar.background': '#007acc',
				'statusBar.foreground': '#ffffff'
			}
		});

		// Register light theme
		this.registerTheme({
			id: 'light',
			label: 'Light',
			type: 'light',
			colors: {
				'editor.background': '#ffffff',
				'editor.foreground': '#000000',
				'sideBar.background': '#f3f3f3',
				'sideBar.foreground': '#616161',
				'activityBar.background': '#2c2c2c',
				'activityBar.foreground': '#ffffff',
				'panel.background': '#ffffff',
				'panel.foreground': '#000000',
				'statusBar.background': '#007acc',
				'statusBar.foreground': '#ffffff'
			}
		});
	}

	/**
	 * Registers default color tokens.
	 */
	private registerDefaultColorTokens(): void {
		const tokens: ColorToken[] = [
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
			}
		];

		for (const token of tokens) {
			this.registerColorToken(token);
		}
	}

	dispose(): void {
		this.colorTokens.clear();
		this.themes.clear();
		this._onDidChangeTheme.dispose();
	}
}
