/**
 * Get carret position for one element
 */
export declare const getCaretIndex: (this: any, e: HTMLElement) => number;
/**
 * Invert keys and values
 */
export declare const invert: (o: Record<string, any>) => string[];
/**
 * Get letter based on a number
 *
 * @param {number} columnNumber
 * @return string letter
 */
export declare const getColumnName: (columnNumber: number) => string;
/**
 * Get column name from coords
 */
export declare const getCellNameFromCoords: (x: number | string, y: number | string) => string;
export declare const getCoordsFromCellName: (columnName: string) => (number | null)[];
export declare const getCoordsFromRange: (range: string) => number[];
/**
 * From stack overflow contributions
 */
export declare const parseCSV: (str: string, delimiter?: string) => any[][];
export declare const createFromTable: (el: HTMLElement, options?: any) => any;
//# sourceMappingURL=helpers.d.ts.map