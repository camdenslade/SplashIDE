//********************************************************************
//
// TemplateResult Interface
//
// Interface representing a template generation result. Contains
// the file path where the template should be created and the
// template content.
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

import { Templates } from "../templates";
import { AgentIntent } from "./intentTypes";

export interface TemplateResult {
  filePath: string;
  content: string;
}

//********************************************************************
//
// generateTemplate Function
//
// Generates code templates based on intent and name. Selects
// appropriate templates for the given intent (add_component,
// add_screen, add_service, add_module) and generates template
// files with the provided name. Returns empty array for intents
// that don't have templates.
//
// Return Value
// ------------
// TemplateResult[]    Array of template results with file paths and content
//
// Value Parameters
// ----------------
// intent    AgentIntent    User intent type
// name      string         Name to use in template generation
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

export function generateTemplate(
  intent: AgentIntent,
  name: string
): TemplateResult[] {
  switch (intent) {
    case "add_component":
      return [
        {
          filePath: Templates.ReactComponentTemplate.fileName(name),
          content: Templates.ReactComponentTemplate.generate(name),
        },
      ];

    case "add_screen":
      return [
        {
          filePath: Templates.ReactNativeScreenTemplate.fileName(name),
          content: Templates.ReactNativeScreenTemplate.generate(name),
        },
      ];

    case "add_service":
      return [
        {
          filePath: Templates.NestServiceTemplate.fileName(name),
          content: Templates.NestServiceTemplate.generate(name),
        },
      ];

    case "add_module":
      return [
        {
          filePath: Templates.NestModuleTemplate.fileName(name),
          content: Templates.NestModuleTemplate.generate(name),
        },
        {
          filePath: Templates.NestServiceTemplate.fileName(name),
          content: Templates.NestServiceTemplate.generate(name),
        },
        {
          filePath: Templates.NestControllerTemplate.fileName(name),
          content: Templates.NestControllerTemplate.generate(name),
        },
      ];

    default:
      return [];
  }
}
