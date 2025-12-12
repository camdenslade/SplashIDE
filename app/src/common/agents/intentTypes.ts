//********************************************************************
//
// AgentIntent Type
//
// Type definition for agent intent classification. Represents the
// type of operation the user wants to perform, such as modifying
// files, creating files, refactoring, adding components, etc.
//
// Return Value
// ------------
// None (type definition)
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

export type AgentIntent =
  | "modify_file"
  | "create_file"
  | "delete_file"
  | "refactor"
  | "add_component"
  | "add_screen"
  | "add_service"
  | "add_module"
  | "documentation"
  | "db_schema"
  | "deployment"
  | "review"
  | "analysis";
