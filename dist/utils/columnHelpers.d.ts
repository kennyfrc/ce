import { SpreadsheetContext } from "../types/core";
/**
 * Convert a column identifier (number or string) to a numeric column index
 * Strings can be either numeric strings ("1", "2") or column names ("A", "B")
 */
export declare function toColumnNumber(mixed: number | string): number;
/**
 * Convert a column number to a column name (e.g., 0 -> "A", 1 -> "B")
 */
export declare function toColumnName(columnNumber: number): string;
/**
 * Safely get a column definition from the context
 */
export declare function getColumnDefinition(context: SpreadsheetContext, columnIdentifier: number | string): any | undefined;
/**
 * Validate that a column identifier is within valid bounds for the spreadsheet
 */
export declare function validateColumnNumber(context: SpreadsheetContext, columnNumber: number): boolean;
//# sourceMappingURL=columnHelpers.d.ts.map