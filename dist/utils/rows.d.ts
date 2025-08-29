import { WorksheetInstance, CellValue, Row } from "../types/core";
/**
 * Create row
 */
export declare const createRow: (this: WorksheetInstance, j: number, data?: CellValue[]) => Row;
/**
 * Insert a new row
 *
 * @param mixed - number of blank lines to be insert or a single array with the data of the new row
 * @param rowNumber
 * @param insertBefore
 * @return void
 */
export declare const insertRow: (this: WorksheetInstance, mixed: number | CellValue[], rowNumber?: number, insertBefore?: boolean) => boolean;
/**
 * Move row
 *
 * @return void
 */
export declare const moveRow: (this: WorksheetInstance, o: number, d: number, ignoreDom: boolean) => boolean | void;
/**
 * Delete a row by number
 *
 * @param integer rowNumber - row number to be excluded
 * @param integer numOfRows - number of lines
 * @return void
 */
export declare const deleteRow: (this: WorksheetInstance, rowNumber: number, numOfRows: number) => boolean | void;
/**
 * Get the row height
 *
 * @param row - row number (first row is: 0)
 * @return height - current row height
 */
export declare const getHeight: (this: WorksheetInstance, row: number) => number | number[];
/**
 * Set the row height
 *
 * @param row - row number (first row is: 0)
 * @param height - new row height
 * @param oldHeight - old row height
 */
export declare const setHeight: (this: WorksheetInstance, row: number, height: number, oldHeight?: number) => void;
/**
 * Show row
 */
export declare const showRow: (this: WorksheetInstance, rowNumber: number | number[]) => void;
/**
 * Hide row
 */
export declare const hideRow: (this: WorksheetInstance, rowNumber: number | number[]) => void;
/**
 * Get a row data by rowNumber
 */
export declare const getRowData: (this: WorksheetInstance, rowNumber: number, processed: boolean) => string[];
/**
 * Set a row data by rowNumber
 */
export declare const setRowData: (this: WorksheetInstance, rowNumber: number, data: CellValue[], force: boolean) => void;
//# sourceMappingURL=rows.d.ts.map