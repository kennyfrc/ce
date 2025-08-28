import { SpreadsheetContext } from "../types/core";
export declare const getNumberOfColumns: (this: SpreadsheetContext) => number;
export declare const createCellHeader: (this: any, colNumber: number) => void;
/**
 * Insert a new column
 *
 * @param mixed - num of columns to be added or data to be added in one single column
 * @param int columnNumber - number of columns to be created
 * @param bool insertBefore
 * @param object properties - column properties
 * @return void
 */
export declare const insertColumn: (this: any, mixed: any, columnNumber: number, insertBefore: boolean, properties: any) => boolean | void;
/**
 * Move column
 *
 * @return void
 */
export declare const moveColumn: (this: any, o: number, d: number) => boolean | void;
/**
 * Delete a column by number
 *
 * @param integer columnNumber - reference column to be excluded
 * @param integer numOfColumns - number of columns to be excluded from the reference column
 * @return void
 */
export declare const deleteColumn: (this: any, columnNumber: any, numOfColumns: any) => boolean | void;
/**
 * Get the column width
 *
 * @param int column column number (first column is: 0)
 * @return int current width
 */
export declare const getWidth: (this: any, column: any) => number | number[];
/**
 * Set the column width
 *
 * @param int column number (first column is: 0)
 * @param int new column width
 * @param int old column width
 */
export declare const setWidth: (this: any, column: any, width: any, oldWidth: any) => void;
/**
 * Show column
 */
export declare const showColumn: (this: any, colNumber: any) => void;
/**
 * Hide column
 */
export declare const hideColumn: (this: any, colNumber: any) => void;
/**
 * Get a column data by columnNumber
 */
export declare const getColumnData: (this: any, columnNumber: any, processed: any) => any[];
/**
 * Set a column data by colNumber
 */
export declare const setColumnData: (this: any, colNumber: any, data: any, force: any) => void;
//# sourceMappingURL=columns.d.ts.map