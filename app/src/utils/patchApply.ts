//********************************************************************
//
// applyPatch Function
//
// Applies a unified diff patch to a file. Reads the file, applies
// the patch hunks to modify the content, and writes the result back.
// Returns false if the file doesn't exist, true on success.
//
// Return Value
// ------------
// boolean    True if patch was applied successfully, false if file missing
//
// Value Parameters
// ----------------
// patch    Patch    Unified diff patch to apply
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// filePath      string      File path from patch
// originalLines string[]    Original file lines
// updatedLines  string[]    Modified file lines
// hunk          Hunk        Current patch hunk being applied
// pointer       number      Current line pointer position
// line          string      Current line from hunk
//
//*******************************************************************

import fs from "fs";
import { Patch } from "./patchParser";

export function applyPatch(patch: Patch) {
  const filePath = patch.filePath;

  if (!fs.existsSync(filePath)) {
    console.warn("File missing for patch:", filePath);
    return false;
  }

  const originalLines = fs.readFileSync(filePath, "utf8").split("\n");
  let updatedLines = [...originalLines];

  for (const hunk of patch.hunks) {
    let pointer = hunk.oldStart - 1;

    for (const line of hunk.lines) {
      if (line.startsWith("-")) {
        updatedLines.splice(pointer, 1);
      } else if (line.startsWith("+")) {
        updatedLines.splice(pointer, 0, line.substring(1));
        pointer++;
      } else {
        pointer++;
      }
    }
  }

  fs.writeFileSync(filePath, updatedLines.join("\n"), "utf8");
  return true;
}

//********************************************************************
//
// applyPatches Function
//
// Applies multiple patches to files. Iterates through all patches
// and applies each one sequentially using applyPatch.
//
// Return Value
// ------------
// void
//
// Value Parameters
// ----------------
// patches    Patch[]    Array of patches to apply
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// patch    Patch    Current patch being applied
//
//*******************************************************************

export function applyPatches(patches: Patch[]) {
  for (const patch of patches) applyPatch(patch);
}
