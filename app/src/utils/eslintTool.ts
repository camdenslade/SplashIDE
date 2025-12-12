//********************************************************************
//
// runESLintFix Function
//
// Runs ESLint with auto-fix on source code. Attempts to automatically
// fix linting errors and returns the fixed code. Returns the original
// source if ESLint fails or produces no output.
//
// Return Value
// ------------
// Promise<string>    Fixed source code or original source on error
//
// Value Parameters
// ----------------
// source    string    Source code to fix
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// eslint   ESLint           ESLint instance with fix enabled
// results  ESLint.LintResult[]    Linting results
//
//*******************************************************************

import { ESLint } from "eslint";

export async function runESLintFix(source: string): Promise<string> {
  try {
    const eslint = new ESLint({ fix: true });
    const results = await eslint.lintText(source);

    if (results?.[0]?.output) {
      return results[0].output;
    }

    return source;
  } catch {
    return source;
  }
}
