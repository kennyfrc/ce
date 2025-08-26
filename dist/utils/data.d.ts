export declare const setData: (this: any, data: any) => void;
/**
 * Get the value from a cell
 *
 * @param object cell
 * @return string value
 */
export declare const getValue: (this: any, cell: any, processedValue: any) => any;
/**
 * Get the value from a coords
 *
 * @param int x
 * @param int y
 * @return string value
 */
export declare const getValueFromCoords: (this: any, x: number, y: number, processedValue: any) => any;
/**
 * Set a cell value
 *
 * @param mixed cell destination cell
 * @param string value value
 * @return void
 */
export declare const setValue: (this: any, cell: any, value: any, force?: boolean) => void;
/**
 * Set a cell value based on coordinates
 *
 * @param int x destination cell
 * @param int y destination cell
 * @param string value
 * @return void
 */
export declare const setValueFromCoords: (this: any, x: number, y: number, value: any, force?: boolean) => void;
/**
 * Get the whole table data
 *
 * @param bool get highlighted cells only
 * @return array data
 */
export declare const getData: (this: any, highlighted: boolean, processed: boolean, delimiter: string, asJson: boolean) => string | Record<number, any>[];
export declare const getDataFromRange: (this: any, range: string, processed: boolean) => any[][];
//# sourceMappingURL=data.d.ts.map