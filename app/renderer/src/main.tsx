/**
 * Renderer Entry Point
 * 
 * VS Code-style renderer initialization with service bootstrap.
 */

import { createRoot } from 'react-dom/client';
import { bootstrap } from '@src/browser/bootstrap';
import Workbench from '@src/browser/workbench/workbench';
import '@src/browser/workbench/workbench.css';
import '@vscode/codicons/dist/codicon.css';
import './styles.css';
import './index.css';

/**
 * Initializes the renderer process.
 */
function init(): void {
	try {
		console.log('[DEBUG] Renderer: Starting initialization...');

		if (typeof document === 'undefined') {
			throw new Error('document is undefined');
		}

		const rootElement = document.getElementById('root');
		if (!rootElement) {
			throw new Error("Root element '#root' not found in DOM");
		}

		console.log('[DEBUG] Renderer: Root element found, bootstrapping services...');

		// Bootstrap services
		bootstrap();

		console.log('[DEBUG] Renderer: Services bootstrapped, creating React root');

		const root = createRoot(rootElement);

		console.log('[DEBUG] Renderer: Rendering Workbench component');
		root.render(<Workbench />);
		console.log('[DEBUG] Renderer: Workbench rendered successfully');
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		console.error('[CRITICAL] Renderer: Error initializing app:', err);

		try {
			const rootElement = document.getElementById('root');
			if (rootElement) {
				rootElement.innerHTML = `
          <div style="padding: 20px; color: #f48771; font-family: monospace;">
            <h2>Renderer Initialization Error</h2>
            <p><strong>${err.message}</strong></p>
            <pre style="background: #1e1e1e; padding: 10px; overflow: auto;">
${err.stack || 'No stack trace'}
            </pre>
          </div>
        `;
			}
		} catch (displayError) {
			console.error('[CRITICAL] Could not display error in DOM:', displayError);
		}
	}
}

// Fire init after DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	// DOM already ready
	setTimeout(init, 0);
}
