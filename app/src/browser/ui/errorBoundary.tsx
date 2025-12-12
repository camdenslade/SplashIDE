//********************************************************************
//
// ErrorBoundaryProps Interface
//
// Props for the ErrorBoundary component. Defines child components to
// render and optional fallback UI to display when an error occurs.
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

import { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

//********************************************************************
//
// ErrorBoundaryState Interface
//
// State for the ErrorBoundary component. Tracks whether an error has
// been caught and stores the error object.
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

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

//********************************************************************
//
// ErrorBoundary Class Component
//
// React error boundary for catching and displaying component errors.
// Catches JavaScript errors anywhere in the child component tree, logs
// those errors, and displays a fallback UI instead of crashing the entire
// app. Follows React error boundary pattern. Implements global error
// handlers for unhandled promise rejections and unhandled errors.
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
// unhandledRejectionHandler    Function|undefined    Handler for unhandled promise rejections
// errorHandler                  Function|undefined    Handler for unhandled errors
//
//*******************************************************************

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	/**
	 * Creates a new ErrorBoundary instance.
	 */
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
		
		if (error.stack) {
			console.error('Error stack:', error.stack);
		}
		if (errorInfo.componentStack) {
			console.error('Component stack:', errorInfo.componentStack);
		}
	}

	override componentDidMount(): void {
		this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
			console.error('Unhandled promise rejection:', event.reason);
			this.setState({
				hasError: true,
				error: event.reason instanceof Error ? event.reason : new Error(String(event.reason))
			});
		};

		this.errorHandler = (event: ErrorEvent) => {
			console.error('Unhandled error:', event.error);
			this.setState({
				hasError: true,
				error: event.error instanceof Error ? event.error : new Error(event.message)
			});
		};

		window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);
		window.addEventListener('error', this.errorHandler);
	}

	override componentWillUnmount(): void {
		if (this.unhandledRejectionHandler) {
			window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
		}
		if (this.errorHandler) {
			window.removeEventListener('error', this.errorHandler);
		}
	}

	private unhandledRejectionHandler?: (event: PromiseRejectionEvent) => void;
	private errorHandler?: (event: ErrorEvent) => void;

	override render(): ReactNode {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div
						style={{
							padding: '20px',
							color: '#cccccc',
							background: '#1e1e1e',
							height: '100vh',
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<h2 style={{ color: '#f48771', marginBottom: '16px', fontSize: '24px' }}>
							Something went wrong
						</h2>
						<p style={{ marginBottom: '8px', color: '#cccccc', fontSize: '14px' }}>
							{this.state.error?.message || 'An unexpected error occurred'}
						</p>
						{this.state.error?.stack && (
							<details style={{ marginBottom: '16px', width: '80%', maxWidth: '600px' }}>
								<summary style={{ cursor: 'pointer', color: '#858585', fontSize: '12px' }}>
									Error Details
								</summary>
								<pre
									style={{
										background: '#252526',
										padding: '12px',
										borderRadius: '4px',
										overflow: 'auto',
										fontSize: '11px',
										color: '#cccccc',
										marginTop: '8px',
										maxHeight: '200px'
									}}
								>
									{this.state.error.stack}
								</pre>
							</details>
						)}
						<div style={{ display: 'flex', gap: '8px' }}>
							<button
								onClick={() => {
									this.setState({ hasError: false, error: null });
								}}
								style={{
									padding: '8px 16px',
									background: '#5a5a5a',
									color: 'white',
									border: 'none',
									borderRadius: '3px',
									cursor: 'pointer',
									fontSize: '13px'
								}}
							>
								Try Again
							</button>
							<button
								onClick={() => {
									window.location.reload();
								}}
								style={{
									padding: '8px 16px',
									background: '#0e639c',
									color: 'white',
									border: 'none',
									borderRadius: '3px',
									cursor: 'pointer',
									fontSize: '13px'
								}}
							>
								Reload Application
							</button>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}
