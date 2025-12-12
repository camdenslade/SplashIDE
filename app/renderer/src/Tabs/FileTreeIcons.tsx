import React from "react";

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

export function FolderIcon({ width = 16, height = 16, className }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M2 3.5C2 2.67 2.67 2 3.5 2h2.379a1.5 1.5 0 0 1 1.06.44L8.5 4h4a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H8.207L6.853 3.146A.5.5 0 0 0 6.379 3H3.5z"/>
    </svg>
  );
}

export function FolderOpenIcon({ width = 16, height = 16, className }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M2 3.5C2 2.67 2.67 2 3.5 2h2.379a1.5 1.5 0 0 1 1.06.44L8.5 4h4a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9zm1 .5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5H8.207L6.853 3.146A.5.5 0 0 0 6.379 3H3.5a.5.5 0 0 0-.5.5z"/>
      <path d="M3 4.5a.5.5 0 0 1 .5-.5h2.379a1.5 1.5 0 0 1 1.06.44L8.5 6h3.5a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-8z" opacity="0.3"/>
    </svg>
  );
}

export function FileIcon({ width = 16, height = 16, className }: IconProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
    </svg>
  );
}

function getFileIcon(fileName: string) {
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
    'gitattributes': GitIcon,
  };
  
  return iconMap[ext || ''] || FileIcon;
}

export function FileTypeIcon({
  fileName,
  width = 16,
  height = 16,
  className,
}: IconProps & { fileName: string }) {
  const IconComponent = getFileIcon(fileName);
  return React.createElement(IconComponent, { width, height, className });
}

// Specific file type icons
function TypeScriptIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace" fontWeight="bold">TS</text>
    </svg>
  );
}

function JavaScriptIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JS</text>
    </svg>
  );
}

function ReactIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JSX</text>
    </svg>
  );
}

function HtmlIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">HTML</text>
    </svg>
  );
}

function CssIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">CSS</text>
    </svg>
  );
}

function ScssIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SCSS</text>
    </svg>
  );
}

function LessIcon(props: IconProps) {
  return CssIcon(props);
}

function JsonIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JSON</text>
    </svg>
  );
}

function YamlIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">YAML</text>
    </svg>
  );
}

function MarkdownIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">MD</text>
    </svg>
  );
}

function ImageIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <circle cx="6" cy="6" r="1.5" fill="currentColor" opacity="0.6"/>
      <path d="M3 11l3-3 2 2 4-4 1 1v2H3v-1z" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}

function SvgIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SVG</text>
    </svg>
  );
}

function ConfigIcon(props: IconProps) {
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

function XmlIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">XML</text>
    </svg>
  );
}

function TextIcon(props: IconProps) {
  return FileIcon(props);
}

function LogIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">LOG</text>
    </svg>
  );
}

function ShellIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SH</text>
    </svg>
  );
}

function PythonIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">PY</text>
    </svg>
  );
}

function JavaIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">JAVA</text>
    </svg>
  );
}

function GoIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">GO</text>
    </svg>
  );
}

function RustIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">RS</text>
    </svg>
  );
}

function CppIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">CPP</text>
    </svg>
  );
}

function CIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="8" fill="currentColor" fontFamily="monospace" fontWeight="bold">C</text>
    </svg>
  );
}

function PhpIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">PHP</text>
    </svg>
  );
}

function RubyIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">RB</text>
    </svg>
  );
}

function SqlIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="monospace" fontWeight="bold">SQL</text>
    </svg>
  );
}

function DockerIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <text x="8" y="11" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="monospace" fontWeight="bold">DOCKER</text>
    </svg>
  );
}

function GitIcon(props: IconProps) {
  return (
    <svg {...props} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V5.414a1 1 0 0 0-.293-.707l-2.414-2.414A1 1 0 0 0 10.586 2H3zm0 1h7.586l2 2H13v8H3V3z"/>
      <circle cx="6" cy="6" r="1" fill="currentColor"/>
      <circle cx="10" cy="6" r="1" fill="currentColor"/>
      <circle cx="8" cy="10" r="1" fill="currentColor"/>
    </svg>
  );
}

