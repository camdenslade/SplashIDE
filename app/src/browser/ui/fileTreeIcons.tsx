//********************************************************************
//
// IconProps Interface
//
// Props for icon components including width, height, and optional
// CSS class name for styling.
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

import React from 'react';

interface IconProps {
	width?: number;
	height?: number;
	className?: string;
}

//********************************************************************
//
// FolderIcon Function Component
//
// Folder icon component for file tree display. Uses VS Code codicons
// to render a folder icon with customizable size and styling.
//
// Return Value
// ------------
// React.ReactElement    The rendered folder icon
//
// Value Parameters
// ----------------
// width      number|undefined    Icon width in pixels (default: 16)
// height     number|undefined    Icon height in pixels (default: 16)
// className  string|undefined    Optional CSS class name
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

export function FolderIcon({ width = 16, height = 16, className }: IconProps): React.ReactElement {
	return <span className={`codicon codicon-folder ${className ?? ''}`} style={{ fontSize: Math.max(width, height) }} />;
}

//********************************************************************
//
// FolderOpenIcon Function Component
//
// Open folder icon component for file tree display. Uses VS Code
// codicons to render an opened folder icon with customizable size
// and styling.
//
// Return Value
// ------------
// React.ReactElement    The rendered open folder icon
//
// Value Parameters
// ----------------
// width      number|undefined    Icon width in pixels (default: 16)
// height     number|undefined    Icon height in pixels (default: 16)
// className  string|undefined    Optional CSS class name
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

export function FolderOpenIcon({ width = 16, height = 16, className }: IconProps): React.ReactElement {
	return <span className={`codicon codicon-folder-opened ${className ?? ''}`} style={{ fontSize: Math.max(width, height) }} />;
}

//********************************************************************
//
// FileIcon Function Component
//
// Generic file icon component for file tree display. Uses VS Code
// codicons to render a file icon with customizable size and styling.
//
// Return Value
// ------------
// React.ReactElement    The rendered file icon
//
// Value Parameters
// ----------------
// width      number|undefined    Icon width in pixels (default: 16)
// height     number|undefined    Icon height in pixels (default: 16)
// className  string|undefined    Optional CSS class name
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

export function FileIcon({ width = 16, height = 16, className }: IconProps): React.ReactElement {
	return <span className={`codicon codicon-file ${className ?? ''}`} style={{ fontSize: Math.max(width, height) }} />;
}

/**
 * Gets the appropriate icon component for a file based on its extension.
 * 
 * @param fileName - Name of the file
 * @returns Icon component function
 */
function getFileIcon(fileName: string): (props: IconProps) => React.ReactElement {
	const ext = fileName.split('.').pop()?.toLowerCase();

	const iconMap: Record<string, (props: IconProps) => React.ReactElement> = {
		// TypeScript/JavaScript
		'ts': TypeScriptIcon,
		'tsx': ReactIcon,
		'js': JavaScriptIcon,
		'jsx': ReactIcon,
		'mjs': JavaScriptIcon,
		'cjs': JavaScriptIcon,

		// Web
		'html': HtmlIcon,
		'css': CssIcon,
		'scss': ScssIcon,
		'sass': ScssIcon,
		'less': LessIcon,

		// JSON/YAML
		'json': JsonIcon,
		'yaml': YamlIcon,
		'yml': YamlIcon,

		// Markdown
		'md': MarkdownIcon,
		'markdown': MarkdownIcon,

		// Images
		'png': ImageIcon,
		'jpg': ImageIcon,
		'jpeg': ImageIcon,
		'gif': ImageIcon,
		'svg': SvgIcon,
		'webp': ImageIcon,

		// Config
		'config': ConfigIcon,
		'conf': ConfigIcon,
		'ini': ConfigIcon,
		'toml': ConfigIcon,
		'xml': XmlIcon,

		// Others
		'txt': TextIcon,
		'log': LogIcon,
		'sh': ShellIcon,
		'bash': ShellIcon,
		'zsh': ShellIcon,
		'py': PythonIcon,
		'java': JavaIcon,
		'go': GoIcon,
		'rs': RustIcon,
		'cpp': CppIcon,
		'c': CIcon,
		'h': CIcon,
		'hpp': CppIcon,
		'php': PhpIcon,
		'rb': RubyIcon,
		'sql': SqlIcon,
		'dockerfile': DockerIcon,
		'gitignore': GitIcon,
		'gitattributes': GitIcon
	};

	return iconMap[ext ?? ''] || FileIcon;
}

//********************************************************************
//
// FileTypeIcon Function Component
//
// File type icon component that selects the appropriate icon based
// on file extension. Uses getFileIcon to determine which icon component
// to render based on the file's extension, falling back to FileIcon
// for unknown types.
//
// Return Value
// ------------
// React.ReactElement    The rendered file type icon
//
// Value Parameters
// ----------------
// fileName    string                      File name to determine icon type
// width       number|undefined            Icon width in pixels (default: 16)
// height      number|undefined            Icon height in pixels (default: 16)
// className   string|undefined            Optional CSS class name
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// IconComponent    Function    Icon component function to render
// props            IconProps   Icon props object
//
//*******************************************************************

export function FileTypeIcon({
	fileName,
	width = 16,
	height = 16,
	className
}: IconProps & { fileName: string }): React.ReactElement {
	const IconComponent = getFileIcon(fileName);
	const props: IconProps = { width, height };
	if (className !== undefined) {
		props.className = className;
	}
	return React.createElement(IconComponent, props);
}

// Specific file type icon implementations
function TypeScriptIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace" fontWeight="bold">TS</text>
		</svg>
	);
}

function JavaScriptIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JS</text>
		</svg>
	);
}

function ReactIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JSX</text>
		</svg>
	);
}

function HtmlIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">HTML</text>
		</svg>
	);
}

function CssIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">CSS</text>
		</svg>
	);
}

function ScssIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SCSS</text>
		</svg>
	);
}

function LessIcon(props: IconProps): React.ReactElement {
	return CssIcon(props);
}

function JsonIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JSON</text>
		</svg>
	);
}

function YamlIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">YAML</text>
		</svg>
	);
}

function MarkdownIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">MD</text>
		</svg>
	);
}

function ImageIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<circle cx="6" cy="6" r="1.5" fill="currentColor" opacity="0.6"/>
			<path d="M3 11l3-3 2 2 4-4 1 1v2H3v-1z" fill="currentColor" opacity="0.6"/>
		</svg>
	);
}

function SvgIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SVG</text>
		</svg>
	);
}

function ConfigIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<circle cx="5" cy="6" r="0.5" fill="currentColor"/>
			<circle cx="8" cy="6" r="0.5" fill="currentColor"/>
			<circle cx="11" cy="6" r="0.5" fill="currentColor"/>
			<path d="M5 8h6v1H5V8zm0 2h4v1H5v-1z" fill="currentColor"/>
		</svg>
	);
}

function XmlIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">XML</text>
		</svg>
	);
}

function TextIcon(props: IconProps): React.ReactElement {
	return FileIcon(props);
}

function LogIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">LOG</text>
		</svg>
	);
}

function ShellIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SH</text>
		</svg>
	);
}

function PythonIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">PY</text>
		</svg>
	);
}

function JavaIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JAVA</text>
		</svg>
	);
}

function GoIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">GO</text>
		</svg>
	);
}

function RustIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">RS</text>
		</svg>
	);
}

function CppIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">CPP</text>
		</svg>
	);
}

function CIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace" fontWeight="bold">C</text>
		</svg>
	);
}

function PhpIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">PHP</text>
		</svg>
	);
}

function RubyIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">RB</text>
		</svg>
	);
}

function SqlIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SQL</text>
		</svg>
	);
}

function DockerIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<text x="8" y="11" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="monospace" fontWeight="bold">DOCKER</text>
		</svg>
	);
}

function GitIcon(props: IconProps): React.ReactElement {
	return (
		<svg {...props} viewBox="0 0 16 16" fill="currentColor">
			<path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
			<circle cx="6" cy="6" r="1" fill="currentColor"/>
			<circle cx="10" cy="6" r="1" fill="currentColor"/>
			<circle cx="8" cy="10" r="1" fill="currentColor"/>
		</svg>
	);
}
