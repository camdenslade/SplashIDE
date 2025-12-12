//********************************************************************
//
// Patch Interface
//
// Represents a unified diff patch for a single file. Contains the
// file path, original and modified line arrays, and array of hunks
// that represent the changes.
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

export interface Patch {
  filePath: string;
  original: string[];
  modified: string[];
  hunks: Hunk[];
}

//********************************************************************
//
// Hunk Interface
//
// Represents a single hunk (change block) within a patch. Contains
// line number information for both old and new versions, plus the
// actual changed lines.
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

export interface Hunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

//********************************************************************
//
// parseUnifiedDiff Function
//
// Parses a unified diff string into an array of Patch objects. Extracts
// file paths, hunk information, and changed lines from the diff format.
//
// Return Value
// ------------
// Patch[]    Array of parsed patch objects
//
// Value Parameters
// ----------------
// diff    string    Unified diff string to parse
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// patches       Patch[]         Array of parsed patches
// lines         string[]        Array of diff lines
// currentPatch  Patch|null      Current patch being built
// currentHunk   Hunk|null       Current hunk being built
// line          string          Current line being processed
// match         RegExpMatchArray|null    Regex match for hunk header
// file          string          File path extracted from diff
// oldStart      string          Old start line number
// oldLinesRaw   string          Raw old line count
// newStart      string          New start line number
// newLinesRaw   string          Raw new line count
//
//*******************************************************************

export function parseUnifiedDiff(diff: string): Patch[] {
  const patches: Patch[] = [];
  const lines = diff.split("\n");

  let currentPatch: Patch | null = null;
  let currentHunk: Hunk | null = null;

  for (const line of lines) {
    if (line.startsWith("--- ")) {
      if (currentPatch) patches.push(currentPatch);
      currentPatch = {
        filePath: "",
        original: [],
        modified: [],
        hunks: [],
      };
    }

    if (line.startsWith("+++ ")) {
      const file = line.replace("+++ b/", "").trim();
      if (currentPatch) currentPatch.filePath = file;
    }

    if (line.startsWith("@@")) {
      const match =
        /@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/.exec(line);

      if (!match) continue;
      const [, oldStart, oldLinesRaw, newStart, newLinesRaw] = match;

      currentHunk = {
        oldStart: parseInt(oldStart ?? "0", 10),
        oldLines: parseInt(oldLinesRaw || "1", 10),
        newStart: parseInt(newStart ?? "0", 10),
        newLines: parseInt(newLinesRaw || "1", 10),
        lines: [],
      };

      currentPatch?.hunks.push(currentHunk);
    }

    if (currentHunk && /^[ +\-]/.test(line)) {
      currentHunk.lines.push(line);
    }
  }

  if (currentPatch) patches.push(currentPatch);
  return patches;
}
