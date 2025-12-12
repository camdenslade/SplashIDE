//********************************************************************
//
// runPrettier Function
//
// Formats code using Prettier with TypeScript parser. Applies code
// formatting with configured options (double quotes, semicolons,
// 100 character line width). Returns the original input if Prettier
// fails.
//
// Return Value
// ------------
// Promise<string>    Formatted code or original input on error
//
// Value Parameters
// ----------------
// input    string    Code string to format
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// result    string    Formatted code string
//
//*******************************************************************

import prettier from "prettier";

export async function runPrettier(input: string): Promise<string> {
  try {
    const result = await prettier.format(input, {
      parser: "typescript",
      singleQuote: false,
      semi: true,
      printWidth: 100,
    });
    return result;
  } catch {
    return input;
  }
}
