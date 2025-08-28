import { SpreadsheetContext, CellValue } from "../types/core";
export declare const setData: (this: SpreadsheetContext, data: CellValue[][]) => void;
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
export declare const setValue: (this: SpreadsheetContext, cell: string | number[], value: CellValue, force?: boolean) => void;
//# sourceMappingURL=data_debug.d.ts.map