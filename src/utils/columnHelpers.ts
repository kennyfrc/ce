// Helper functions for column operations
import { SpreadsheetContext, ColumnDefinition } from "../types/core";

/**
 * Convert a column identifier (number or string) to a numeric column index
 * Strings can be either numeric strings ("1", "2") or column names ("A", "B")
 */
export function toColumnNumber(mixed: number | string): number {
  if (typeof mixed === "number") {
    if (mixed < 0)
      throw new Error(`Column number cannot be negative: ${mixed}`);
    return mixed;
  }

  if (typeof mixed === "string") {
    // Handle numeric strings
    if (!isNaN(Number(mixed))) {
      const num = Number(mixed);
      if (num < 0)
        throw new Error(`Column number cannot be negative: ${mixed}`);
      return num;
    }

    // Handle column names like "A", "B", "AA", etc.
    if (mixed.match(/^[A-Z]+$/i)) {
      let result = 0;
      const str = mixed.toUpperCase();
      for (let i = 0; i < str.length; i++) {
        result *= 26;
        result += str.charCodeAt(i) - 64; // 'A' is 65, so 65-64=1
      }
      return result - 1; // Convert to 0-based index
    }

    throw new Error(`Invalid column identifier: ${mixed}`);
  }

  throw new Error(`Invalid column identifier type: ${typeof mixed}`);
}

/**
 * Convert a column number to a column name (e.g., 0 -> "A", 1 -> "B")
 */
export function toColumnName(columnNumber: number): string {
  if (columnNumber < 0)
    throw new Error(`Column number cannot be negative: ${columnNumber}`);

  let result = "";
  let num = columnNumber + 1; // Convert to 1-based for calculation

  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }

  return result;
}

/**
 * Safely get a column definition from the context
 */
export function getColumnDefinition(
  context: SpreadsheetContext,
  columnIdentifier: number | string
): ColumnDefinition | undefined {
  const columnNumber = toColumnNumber(columnIdentifier);
  return context.options.columns?.[columnNumber];
}

/**
 * Validate that a column identifier is within valid bounds for the spreadsheet
 */
export function validateColumnNumber(
  context: SpreadsheetContext,
  columnNumber: number
): boolean {
  const numColumns = context.options.columns?.length || 0;
  return columnNumber >= 0 && columnNumber < numColumns;
}
