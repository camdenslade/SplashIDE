//********************************************************************
//
// callLLM Function
//
// Calls the local LLM API endpoint with a prompt and returns the
// parsed JSON response. Connects to the LLM server running on
// localhost:11434.
//
// Return Value
// ------------
// Promise<any>    Parsed JSON response from the LLM
//
// Value Parameters
// ----------------
// prompt    string    Prompt to send to the LLM
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// res    AxiosResponse    HTTP response from the LLM API
//
//*******************************************************************

import axios from "axios";

export async function callLLM(prompt: string) {
  const res = await axios.post("http://localhost:11434/llm", { prompt });
  return JSON.parse(res.data.output);
}
