// Type-only tests for public API and core types
// These tests validate TypeScript types without runtime execution

// Test that core types are properly defined
type _TestSpreadsheetOptions =
  import("../src/types/core").SpreadsheetOptions;
type _TestWorksheetInstance =
  import("../src/types/core").WorksheetInstance;
type _TestSpreadsheetInstance =
  import("../src/types/core").SpreadsheetInstance;
type _TestColumnDefinition =
  import("../src/types/core").ColumnDefinition;

// Test that JSpreadsheet interface has required methods
type JSpreadsheet = typeof import("../src/index").default;
type _TestJSpreadsheetMethods = {
  getWorksheetInstanceByName: JSpreadsheet["getWorksheetInstanceByName"];
  setDictionary: JSpreadsheet["setDictionary"];
  destroy: JSpreadsheet["destroy"];
  destroyAll: JSpreadsheet["destroyAll"];
};

// Test that WorksheetInstance has required methods
type _TestWorksheetMethods = {
  insertRow: _TestWorksheetInstance["insertRow"];
  deleteRow: _TestWorksheetInstance["deleteRow"];
  insertColumn: _TestWorksheetInstance["insertColumn"];
  deleteColumn: _TestWorksheetInstance["deleteColumn"];
  undo: _TestWorksheetInstance["undo"];
  redo: _TestWorksheetInstance["redo"];
  download: _TestWorksheetInstance["download"];
  getSelected: _TestWorksheetInstance["getSelected"];
};

// Test that options are properly typed
type _TestSpreadsheetOptionsStructure = {
  data: _TestSpreadsheetOptions["data"];
  columns: _TestSpreadsheetOptions["columns"];
  worksheets: _TestSpreadsheetOptions["worksheets"];
  meta: _TestSpreadsheetOptions["meta"];
  formula: _TestSpreadsheetOptions["formula"];
};

// Test column definition structure
type _TestColumnDefinitionStructure = {
  type: _TestColumnDefinition["type"];
  title: _TestColumnDefinition["title"];
  width: _TestColumnDefinition["width"];
  options: _TestColumnDefinition["options"];
  mask: _TestColumnDefinition["mask"];
};

// Export types to ensure they are valid
export type {
  _TestSpreadsheetOptions,
  _TestWorksheetInstance,
  _TestSpreadsheetInstance,
  _TestColumnDefinition,
  _TestJSpreadsheetMethods,
  _TestWorksheetMethods,
  _TestSpreadsheetOptionsStructure,
  _TestColumnDefinitionStructure,
};
