/**
 * Theme Context
 * 
 * React context for theme service.
 * 
 * @remarks
 * Provides theme service to React component tree via context.
 */

import React, { createContext } from 'react';
import type { IThemeService } from './themeService';

/**
 * Theme context for React components.
 */
export const ThemeContext = createContext<IThemeService | undefined>(undefined);

/**
 * Props for ThemeProvider component.
 */
export interface ThemeProviderProps {
	/** Theme service instance */
	themeService: IThemeService;
	/** Child components */
	children: React.ReactNode;
}

/**
 * ThemeProvider component that provides theme service to children.
 * 
 * @param props - Component props
 * @returns ThemeProvider JSX element
 */
export function ThemeProvider({ themeService, children }: ThemeProviderProps): React.JSX.Element {
	return (
		<ThemeContext.Provider value={themeService}>
			{children}
		</ThemeContext.Provider>
	);
}
