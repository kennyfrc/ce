import type { ColumnDefinition, WorksheetInstance, SpreadsheetInstance, SpreadsheetContext, CellValue } from "../types/core";
export declare const getNumberOfColumns: (this: WorksheetInstance | SpreadsheetInstance | SpreadsheetContext) => number;
export declare const createCellHeader: (this: WorksheetInstance | SpreadsheetContext, colNumber: number) => void;
/**
 * Insert a new column
 *
 * @param mixed - num of columns to be added or data to be added in one single column
 * @param int columnNumber - number of columns to be created
 * @param bool insertBefore
 * @param object properties - column properties
 * @return void
 */
export declare const insertColumn: (this: import("../types/core").SpreadsheetContext, mixed?: number | CellValue[], columnNumber?: number, insertBefore?: boolean, properties?: ColumnDefinition[]) => boolean | void;
/**
 * Move column
 *
 * @return void
 */
export declare const moveColumn: (this: import("../types/core").SpreadsheetContext, o: number, d: number) => boolean | void;
/**
 * Delete a column by number
 *
 * @param integer columnNumber - reference column to be excluded
 * @param integer numOfColumns - number of columns to be excluded from the reference column
 * @return void
 */
export declare const deleteColumn: (this: import("../types/core").SpreadsheetContext, columnNumber?: number, numOfColumns?: number) => boolean | void;
/**
 * Get the column width
 *
 * @param int column column number (first column is: 0)
 * @return int current width
 */
export declare const getWidth: (this: import("../types/core").SpreadsheetContext, column: number | HTMLElement) => number | number[];
/**
 * Set the column width
 *
 * @param int column number (first column is: 0)
 * @param int new column width
 * @param int old column width
 */
export declare const setWidth: (this: import("../types/core").WorksheetInstance | import("../types/core").SpreadsheetContext, column: number | number[] | HTMLElement | HTMLElement[], width: string | number, oldWidth?: string | number | number[]) => void;
/**
 * Show column
 */
export declare const showColumn: (this: import("../types/core").SpreadsheetContext, colNumber: number | number[]) => void;
/**
 * Hide column
 */
export declare const hideColumn: (this: import("../types/core").SpreadsheetContext, colNumber: number | number[]) => void;
/**
 * Get a column data by columnNumber
 */
export declare const getColumnData: (this: import("../types/core").SpreadsheetContext, columnNumber: number, processed?: boolean) => (string | number | boolean | null)[];
/**
 * Set a column data by colNumber
 */
export declare const setColumnData: (this: import("../types/core").SpreadsheetContext, colNumber: number, data: (string | number | boolean | null)[], force?: boolean) => void;
//# sourceMappingURL=columns.d.ts.map