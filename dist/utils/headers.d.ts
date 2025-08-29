import type { SpreadsheetContext } from "../types/core";
/**
 * Get the column title
 *
 * @param column - column number (first column is: 0)
 * @param title - new column title
 */
export declare const getHeader: (this: SpreadsheetContext, column: number) => string;
/**
 * Get the headers
 *
 * @param asArray
 * @return mixed
 */
export declare const getHeaders: (this: SpreadsheetContext, asArray: boolean) => string | string[];
/**
 * Set the column title
 *
 * @param column - column number (first column is: 0)
 * @param title - new column title
 */
export declare const setHeader: (this: SpreadsheetContext, column: number, newValue: string) => void;
//# sourceMappingURL=headers.d.ts.map