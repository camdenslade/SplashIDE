//********************************************************************
//
// detectIntent Function
//
// Detects the user's intent from a task description using an LLM.
// Classifies the task into one of the valid AgentIntent types such
// as modify_file, create_file, refactor, add_component, etc. Returns
// "analysis" as default if intent cannot be determined.
//
// Return Value
// ------------
// Promise<AgentIntent>    Detected intent type
//
// Value Parameters
// ----------------
// task    string    User task description to analyze
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// prompt    string    LLM prompt for intent classification
// raw       any       Raw LLM response
// parsed    any       Parsed JSON response
//
//*******************************************************************

import { callLLM } from "../../utils/callLLM";
import { AgentIntent } from "./intentTypes";

export async function detectIntent(task: string): Promise<AgentIntent> {
  const prompt = `
You are an intent classifier for an AI IDE.
Given a user task, decide what kind of code operation they want.

Valid intents:
- modify_file
- create_file
- delete_file
- refactor
- add_component
- add_screen
- add_service
- add_module
- documentation
- db_schema
- deployment
- review
- analysis

USER TASK:
${task}

Return ONLY a JSON object:
{ "intent": "<one_of_the_above>" }
`;

  let raw = await callLLM(prompt);

  try {
    const parsed = JSON.parse(raw);
    return parsed.intent as AgentIntent;
  } catch {
    return "analysis";
  }
}
