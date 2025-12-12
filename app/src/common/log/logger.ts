//********************************************************************
//
// ILogger Interface
//
// Interface for VS Code-style logging system with scoped loggers.
// Provides structured logging with log levels, scoped loggers, and
// pretty-printed output. Supports both console and IPC transport.
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

import { LogLevel, getLogLevelName } from './logLevels';

export interface ILogger {
	error(message: string, ...args: unknown[]): void;
	warn(message: string, ...args: unknown[]): void;
	info(message: string, ...args: unknown[]): void;
	debug(message: string, ...args: unknown[]): void;
	trace(message: string, ...args: unknown[]): void;
}

//********************************************************************
//
// Logger Class
//
// VS Code-style logger implementation with scoped loggers. Provides
// structured logging with log levels, scoped loggers, and pretty-printed
// output. Supports both console and IPC transport.
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
// globalLevel          LogLevel    Static global log level threshold
// ipcLoggingEnabled    boolean     Static flag for IPC logging
// scope                string      Logger scope identifier
//
//*******************************************************************

export class Logger implements ILogger {
	private static globalLevel: LogLevel = LogLevel.Info;
	private static ipcLoggingEnabled = false;

	static setGlobalLevel(level: LogLevel): void {
		Logger.globalLevel = level;
	}

	static getGlobalLevel(): LogLevel {
		return Logger.globalLevel;
	}

	static setIpcLogging(enabled: boolean): void {
		Logger.ipcLoggingEnabled = enabled;
	}

	static create(scope: string): ILogger {
		return new Logger(scope);
	}

	constructor(private readonly scope: string) {}

	private shouldLog(level: LogLevel): boolean {
		return level <= Logger.globalLevel;
	}

	private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
		const timestamp = new Date().toISOString();
		const levelName = getLogLevelName(level);
		const scopeStr = `[${this.scope}]`;
		const messageStr = args.length > 0 ? `${message} ${args.map((a) => JSON.stringify(a)).join(' ')}` : message;
		return `${timestamp} [${levelName}] ${scopeStr} ${messageStr}`;
	}

	private log(level: LogLevel, message: string, ...args: unknown[]): void {
		if (!this.shouldLog(level)) {
			return;
		}

		const formatted = this.formatMessage(level, message, ...args);

		switch (level) {
			case LogLevel.Error:
				console.error(formatted);
				break;
			case LogLevel.Warn:
				console.warn(formatted);
				break;
			case LogLevel.Info:
				console.info(formatted);
				break;
			case LogLevel.Debug:
				console.debug(formatted);
				break;
			case LogLevel.Trace:
				console.trace(formatted);
				break;
		}

		if (Logger.ipcLoggingEnabled) {
			const globalWindow = typeof globalThis !== 'undefined' && 'window' in globalThis 
				? (globalThis as { window?: unknown }).window 
				: undefined;
			if (globalWindow) {
			}
		}
	}

	error(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Error, message, ...args);
	}

	warn(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Warn, message, ...args);
	}

	info(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Info, message, ...args);
	}

	debug(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Debug, message, ...args);
	}

	trace(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Trace, message, ...args);
	}
}
