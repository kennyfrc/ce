import type { SpreadsheetContext, CellValue } from "../types/core";
export declare const setData: (this: SpreadsheetContext, data?: CellValue[][]) => void;
/**
 * Get the value from a cell
 *
 * @param object cell
 * @return string value
 */
export declare const getValue: (this: SpreadsheetContext, cell: string, processedValue?: boolean) => CellValue;
/**
 * Get the value from a coords
 *
 * @param int x
 * @param int y
 * @return string value
 */
export declare const getValueFromCoords: (this: SpreadsheetContext, x: number, y: number, processedValue?: boolean) => CellValue;
/**
 * Set a cell value
 *
 * @param mixed cell destination cell
 * @param string value value
 * @return void
 */
export declare const setValue: (this: SpreadsheetContext, cell: string | HTMLElement[] | Array<{
    element: HTMLElement;
}>, value: CellValue, force?: boolean) => void;
/**
 * Set a cell value based on coordinates
 *
 * @param int x destination cell
 * @param int y destination cell
 * @param string value
 * @return void
 */
export declare const setValueFromCoords: (this: SpreadsheetContext, x: number, y: number, value: CellValue, force?: boolean) => void;
/**
 * Get the whole table data
 *
 * @param bool get highlighted cells only
 * @return array data
 */
export declare const getData: (this: SpreadsheetContext, highlighted: boolean, processed: boolean, delimiter?: string, asJson?: boolean) => string | Record<number, CellValue>[];
export declare const getDataFromRange: (this: SpreadsheetContext, range: string, processed: boolean) => CellValue[][];
//# sourceMappingURL=data.d.ts.map