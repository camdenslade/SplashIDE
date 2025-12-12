/**
 * useTheme Hook
 * 
 * React hook for consuming theme colors.
 * 
 * @remarks
 * This hook provides access to the theme service and allows
 * components to reactively update when the theme changes.
 */

import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './themeContext';
import type { IThemeService } from './themeService';

/**
 * React hook for accessing the theme service.
 * 
 * @returns Theme service instance
 * 
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): IThemeService {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
}

/**
 * React hook for getting a color value.
 * 
 * @param token - Color token identifier
 * @returns Color value or undefined
 */
export function useColor(token: string): string | undefined {
	const themeService = useTheme();
	const [color, setColor] = useState<string | undefined>(() => themeService.getColor(token));

	useEffect(() => {
		const disposable = themeService.onDidChangeTheme(() => {
			setColor(themeService.getColor(token));
		});

		return () => {
			disposable.dispose();
		};
	}, [themeService, token]);

	return color;
}
