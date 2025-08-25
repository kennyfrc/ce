export declare const updateTable: (this: any) => void;
/**
 * Parse formulas
 */
export declare const executeFormula: (this: any, expression: any, x: any, y: any) => any;
export declare const parseValue: (this: any, i: any, j: any, value: any, cell: any) => any;
export declare const createCell: (this: any, i: any, j: any, value: any) => HTMLTableCellElement;
/**
 * Update cell content
 *
 * @param object cell
 * @return void
 */
export declare const updateCell: (this: any, x: number, y: number, value: any, force?: boolean) => {
    x: number;
    y: number;
    col: number;
    row: number;
    value?: undefined;
    oldValue?: undefined;
} | {
    x: number;
    y: number;
    col: number;
    row: number;
    value: any;
    oldValue: any;
};
/**
 * The value is a formula
 */
export declare const isFormula: (value: any) => boolean;
/**
 * Get the mask in the jSuites.mask format
 */
export declare const getMask: (o: any) => Record<string, any> | null;
export declare const updateFormulaChain: (this: any, x: number, y: number, records: any) => void;
/**
 * Update formula
 */
export declare const updateFormula: (formula: any, referencesToUpdate: any) => string;
/**
 * Update cell references
 *
 * @return void
 */
export declare const updateTableReferences: (this: any) => void;
/**
 * Update scroll position based on the selection
 */
export declare const updateScroll: (this: any, direction: any) => void;
export declare const updateResult: (this: any) => number;
/**
 * Get the cell object
 *
 * @param object cell
 * @return string value
 */
export declare const getCell: (this: any, x: any, y: any) => any;
/**
 * Get the cell object from coords
 *
 * @param object cell
 * @return string value
 */
export declare const getCellFromCoords: (this: any, x: any, y: any) => any;
/**
 * Get label
 *
 * @param object cell
 * @return string value
 */
export declare const getLabel: (this: any, x: any, y: any) => any;
/**
 * Activate/Disable fullscreen
 * use programmatically : table.fullscreen(); or table.fullscreen(true); or table.fullscreen(false);
 * @Param {boolean} activate
 */
export declare const fullscreen: (this: any, activate: any) => void;
/**
 * Show index column
 */
export declare const showIndex: (this: any) => void;
/**
 * Hide index column
 */
export declare const hideIndex: (this: any) => void;
/**
 * Create a nested header object
 */
export declare const createNestedHeader: (this: any, nestedInformation: any) => HTMLTableRowElement;
export declare const getWorksheetActive: (this: any) => any;
export declare const getWorksheetInstance: (this: any, index?: number) => any;
//# sourceMappingURL=internal.d.ts.map