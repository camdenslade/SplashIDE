//********************************************************************
//
// loadDb Function
//
// Loads the agent database from disk. Creates the database file
// with an empty agents array if it doesn't exist. Returns the
// parsed JSON database object.
//
// Return Value
// ------------
// any    Parsed database object with agents array
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

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "agent-db.json");

function loadDb(): any {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ agents: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

//********************************************************************
//
// loadUserAgents Function
//
// Loads user-defined agents from the agent database file. Returns
// an array of agent definitions stored in the database.
//
// Return Value
// ------------
// Promise<any[]>    Array of user-defined agent definitions
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
// db    any    Parsed database object
//
//*******************************************************************

export async function loadUserAgents() {
  const db = loadDb();
  return db.agents || [];
}

//********************************************************************
//
// saveUserAgent Function
//
// Saves a user-defined agent to the agent database file. Adds the
// agent to the agents array and persists the database to disk.
//
// Return Value
// ------------
// Promise<void>
//
// Value Parameters
// ----------------
// agent    any    Agent definition to save
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// db    any    Parsed database object
//
//*******************************************************************

export async function saveUserAgent(agent: any) {
  const db = loadDb();
  db.agents.push(agent);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
