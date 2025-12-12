/**
 * Log Service (Renderer)
 * 
 * Service for managing logs and log viewer.
 * 
 * @remarks
 * Provides access to application logs and log viewer functionality.
 */

import { ILogger, Logger } from '../../common/log/logger';
import { LogLevel } from '../../common/log/logLevels';

/**
 * Log service interface.
 */
export interface ILogService {
	/** Gets a scoped logger */
	getLogger(scope: string): ILogger;
	/** Gets all logs */
	getLogs(): string[];
	/** Clears logs */
	clearLogs(): void;
	/** Sets log level */
	setLogLevel(level: LogLevel): void;
	/** Gets current log level */
	getLogLevel(): LogLevel;
}

/**
 * Log service implementation.
 */
export class LogService implements ILogService {
	private readonly logs: string[] = [];
	private maxLogs = 1000;

	getLogger(scope: string): ILogger {
		return Logger.create(scope);
	}

	getLogs(): string[] {
		return [...this.logs];
	}

	clearLogs(): void {
		this.logs.length = 0;
	}

	setLogLevel(level: LogLevel): void {
		Logger.setGlobalLevel(level);
	}

	getLogLevel(): LogLevel {
		return Logger.getGlobalLevel();
	}

	/**
	 * Adds a log entry (called by logger).
	 */
	addLog(entry: string): void {
		this.logs.push(entry);
		if (this.logs.length > this.maxLogs) {
			this.logs.shift();
		}
	}
}
