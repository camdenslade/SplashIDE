//********************************************************************
//
// URI Class
//
// Represents a Uniform Resource Identifier (URI) following VS Code's
// URI pattern. URIs are used to identify resources like files, folders,
// and other entities. Supports parsing, creation from file paths, and
// conversion to file system paths.
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
// _scheme      string    URI scheme (e.g., 'file', 'http')
// _authority   string    URI authority component
// _path        string    URI path component
// _query       string    URI query string component
// _fragment    string    URI fragment component
//
//*******************************************************************

export class URI {
	private constructor(
		private readonly _scheme: string,
		private readonly _authority: string,
		private readonly _path: string,
		private readonly _query: string,
		private readonly _fragment: string
	) {}

	static file(path: string): URI {
		const authority = '';
		const scheme = 'file';
		const query = '';
		const fragment = '';
		return new URI(scheme, authority, path.replace(/\\/g, '/'), query, fragment);
	}

	static parse(value: string): URI {
		const match = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/.exec(value);
		if (!match) {
			throw new Error(`Invalid URI: ${value}`);
		}
		let uriPath = match[5] || '';
		const scheme = match[2] || 'file';
		
		// For file URIs, fix Windows path handling
		// file:///C:/Users/... should have path as C:/Users/... (not /C:/Users/...)
		if (scheme === 'file' && uriPath.startsWith('/') && /^\/[A-Za-z]:/.test(uriPath)) {
			// Remove leading slash for Windows drive paths
			uriPath = uriPath.substring(1);
		}
		
		return new URI(
			scheme,
			match[4] || '',
			uriPath,
			match[7] || '',
			match[9] || ''
		);
	}

	get scheme(): string {
		return this._scheme;
	}

	get authority(): string {
		return this._authority;
	}

	get path(): string {
		return this._path;
	}

	get query(): string {
		return this._query;
	}

	get fragment(): string {
		return this._fragment;
	}

	fsPath(): string {
		if (this._scheme !== 'file') {
			throw new Error(`Cannot get fsPath for non-file URI: ${this.toString()}`);
		}
		// Convert forward slashes to backslashes for Windows
		// Path should already be in format C:/Users/... (not /C:/Users/...)
		return this._path.replace(/\//g, '\\');
	}

	toString(): string {
		let result = '';
		if (this._scheme) {
			result += this._scheme + ':';
		}
		if (this._authority || this._scheme === 'file') {
			result += '//';
		}
		if (this._authority) {
			result += this._authority;
		}
		result += this._path;
		if (this._query) {
			result += '?' + this._query;
		}
		if (this._fragment) {
			result += '#' + this._fragment;
		}
		return result;
	}
}
