//********************************************************************
//
// DiffPart Interface
//
// Interface representing a part of a diff. Contains information
// about whether the part was added or removed, and the actual
// string value.
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

import { diffLines } from "diff";

interface DiffPart {
  added?: boolean;
  removed?: boolean;
  value: string;
}

//********************************************************************
//
// generateDiff Function
//
// Generates a unified diff string from two strings. Uses diffLines
// to compute line-by-line differences and formats them with +/-/space
// prefixes following unified diff format.
//
// Return Value
// ------------
// string    Unified diff string
//
// Value Parameters
// ----------------
// oldStr    string    Original string
// newStr    string    New string
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// part    DiffPart    Current diff part being processed
// sign    string      Prefix character (+, -, or space)
// l       string      Current line being processed
//
//*******************************************************************

export function generateDiff(oldStr: string, newStr: string): string {
  return diffLines(oldStr, newStr)
    .map((part: DiffPart) => {
      const sign = part.added ? "+" : part.removed ? "-" : " ";
      return part.value
        .split("\n")
        .map((l: string) => (l ? sign + l : ""))
        .join("\n");
    })
    .join("\n");
}
