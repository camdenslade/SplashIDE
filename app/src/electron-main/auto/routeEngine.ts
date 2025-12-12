import fs from "fs";
import path from "path";

export interface AutoRouteTask {
  filePath: string; // absolute path of new file
  workspaceRoot: string;
}

function findReactNavigationFile(root: string): string | null {
  const candidates = [
    "src/Navigation.tsx",
    "src/navigation/index.tsx",
    "src/navigation/AppNavigator.tsx",
    "App.tsx",
  ];

  for (const c of candidates) {
    const full = path.join(root, c);
    if (fs.existsSync(full)) return full;
  }

  return null;
}

function pascalToScreenName(name: string): string {
  return name.replace(/Screen$/i, "");
}

/**
 * Auto-register React Native screen with React Navigation
 */
export function autoRegisterReactScreen(task: AutoRouteTask) {
  const { filePath, workspaceRoot } = task;

  if (!filePath.endsWith("Screen.tsx")) return;

  const fileName = path.basename(filePath, ".tsx"); // LoginScreen
  const screenName = pascalToScreenName(fileName);  // Login

  const navigationFile = findReactNavigationFile(workspaceRoot);
  if (!navigationFile) return;

  let nav = fs.readFileSync(navigationFile, "utf8");

  const relativeImport = path
    .relative(path.dirname(navigationFile), filePath)
    .replace(/\\/g, "/");

  const importLine = `import ${fileName} from "${relativeImport}";`;

  if (!nav.includes(importLine)) {
    nav = `${importLine}\n${nav}`;
  }

  // Add to Stack.Navigator
  const screenTag = `<Stack.Screen name="${screenName}" component={${fileName}} />`;

  if (!nav.includes(screenTag)) {
    nav = nav.replace(
      /<Stack\.Navigator[^>]*>/,
      (match) => `${match}\n    ${screenTag}`
    );
  }

  fs.writeFileSync(navigationFile, nav, "utf8");
}

/**
 * Auto-register NestJS modules into AppModule
 */
export function autoRegisterNestModule(task: AutoRouteTask) {
  const { filePath, workspaceRoot } = task;

  if (!filePath.endsWith(".module.ts")) return;

  const moduleName = path.basename(filePath, ".module.ts").replace(/\..*/, "");
  const className = `${capitalize(moduleName)}Module`;

  const appModulePath = path.join(workspaceRoot, "src/app.module.ts");
  if (!fs.existsSync(appModulePath)) return;

  let code = fs.readFileSync(appModulePath, "utf8");

  const importPath = path
    .relative(path.dirname(appModulePath), filePath)
    .replace(/\\/g, "/")
    .replace(/\.ts$/, "");

  const importLine = `import { ${className} } from "${importPath}";`;

  if (!code.includes(importLine)) {
    code = `${importLine}\n${code}`;
  }

  // Insert into imports: []
  code = code.replace(/imports:\s*\[(.*?)\]/s, (m, group) => {
    if (group.includes(className)) return m;
    return `imports: [${group.trim()}, ${className}]`;
  });

  fs.writeFileSync(appModulePath, code, "utf8");
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Auto-import components into nearest file using them (stub)
 * For now: do *on-demand* imports when LLM indicates usage.
 */
export function autoImportComponent() {
  // implemented later with reference scanning
}
