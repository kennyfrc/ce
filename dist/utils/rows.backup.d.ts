import { SpreadsheetContext, CellValue } from "../types/core";
/**
 * Create row
 */
export declare const createRow: (this: SpreadsheetContext, j: number, data?: CellValue[][]) => {
    element: HTMLTableRowElement;
    y: number;
};
/**
 * Insert a new row
 *
 * @param mixed - number of blank lines to be insert or a single array with the data of the new row
 * @param rowNumber
 * @param insertBefore
 * @return void
 */
export declare const insertRow: (this: SpreadsheetContext, mixed: number | CellValue[][], rowNumber?: number, insertBefore?: boolean) => boolean;
/**
 * Move row
 *
 * @return void
 */
export declare const moveRow: (this: SpreadsheetContext, o: number, d: number, ignoreDom: boolean) => boolean | void;
/**
 * Delete a row by number
 *
 * @param integer rowNumber - row number to be excluded
 * @param integer numOfRows - number of lines
 * @return void
 */
export declare const deleteRow: (this: any, rowNumber: any, numOfRows: any) => boolean | void;
/**
 * Get the row height
 *
 * @param row - row number (first row is: 0)
 * @return height - current row height
 */
export declare const getHeight: (this: any, row: any) => any;
/**
 * Set the row height
 *
 * @param row - row number (first row is: 0)
 * @param height - new row height
 * @param oldHeight - old row height
 */
export declare const setHeight: (this: any, row: any, height: any, oldHeight: any) => void;
/**
 * Show row
 */
export declare const showRow: (this: any, rowNumber: any) => void;
/**
 * Hide row
 */
export declare const hideRow: (this: any, rowNumber: any) => void;
/**
 * Get a row data by rowNumber
 */
export declare const getRowData: (this: any, rowNumber: any, processed: any) => any;
/**
 * Set a row data by rowNumber
 */
export declare const setRowData: (this: any, rowNumber: any, data: any, force: any) => void;
//# sourceMappingURL=rows.backup.d.ts.map