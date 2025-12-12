//********************************************************************
//
// LogLevel Enum
//
// Log level enumeration following VS Code patterns. Defines logging
// levels from Off (no logging) to Trace (all messages). Used to
// control verbosity of logging throughout the application.
//
// Return Value
// ------------
// None (enum definition)
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

export enum LogLevel {
	Off = 0,
	Error = 1,
	Warn = 2,
	Info = 3,
	Debug = 4,
	Trace = 5
}

//********************************************************************
//
// getLogLevel Function
//
// Gets log level enum value from a string representation. Converts
// case-insensitive log level strings to LogLevel enum values. Returns
// LogLevel.Info as default if the string doesn't match any level.
//
// Return Value
// ------------
// LogLevel    The log level enum value
//
// Value Parameters
// ----------------
// level    string    Log level string (off, error, warn, info, debug, trace)
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

export function getLogLevel(level: string): LogLevel {
	switch (level.toLowerCase()) {
		case 'off':
			return LogLevel.Off;
		case 'error':
			return LogLevel.Error;
		case 'warn':
			return LogLevel.Warn;
		case 'info':
			return LogLevel.Info;
		case 'debug':
			return LogLevel.Debug;
		case 'trace':
			return LogLevel.Trace;
		default:
			return LogLevel.Info;
	}
}

//********************************************************************
//
// getLogLevelName Function
//
// Gets the string name of a log level enum value. Converts LogLevel
// enum values to uppercase string names (OFF, ERROR, WARN, INFO, DEBUG, TRACE).
// Returns 'INFO' as default if the level doesn't match any case.
//
// Return Value
// ------------
// string    The log level name in uppercase
//
// Value Parameters
// ----------------
// level    LogLevel    Log level enum value
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

export function getLogLevelName(level: LogLevel): string {
	switch (level) {
		case LogLevel.Off:
			return 'OFF';
		case LogLevel.Error:
			return 'ERROR';
		case LogLevel.Warn:
			return 'WARN';
		case LogLevel.Info:
			return 'INFO';
		case LogLevel.Debug:
			return 'DEBUG';
		case LogLevel.Trace:
			return 'TRACE';
		default:
			return 'INFO';
	}
}
