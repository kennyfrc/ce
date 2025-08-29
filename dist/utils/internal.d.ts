import { SpreadsheetContext, WorksheetInstance, CellValue, NestedHeader } from "../types/core";
export declare const updateTable: (this: WorksheetInstance) => void;
/**
 * Parse formulas
 */
export declare const executeFormula: (this: WorksheetInstance, expression: string, x: number, y: number) => CellValue;
export declare const parseValue: (this: WorksheetInstance, i: number, j: number, value: CellValue, cell: HTMLElement) => CellValue;
export declare const createCell: (this: WorksheetInstance, i: number, j: number, value: CellValue) => HTMLElement;
/**
 * Update cell content
 *
 * @param object cell
 * @return void
 */
export declare const updateCell: (this: WorksheetInstance, x: number, y: number, value: CellValue, force?: boolean) => {
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
    value: CellValue;
    oldValue: CellValue | undefined;
};
/**
 * The value is a formula
 */
export declare const isFormula: (value: unknown) => boolean;
/**
 * Get the mask in the jSuites.mask format
 */
export declare const getMask: (o: ColumnDefinition) => Record<string, unknown> | null;
export declare const updateFormulaChain: (this: WorksheetInstance, x: number, y: number, records: Array<{
    x: number;
    y: number;
    col: number;
    row: number;
}>) => void;
/**
 * Update formula
 */
export declare const updateFormula: (formula: string, referencesToUpdate: Record<string, string>) => string;
/**
 * Update cell references
 *
 * @return void
 */
export declare const updateTableReferences: (this: WorksheetInstance) => void;
/**
 * Update scroll position based on the selection
 */
export declare const updateScroll: (this: WorksheetInstance, direction: number) => void;
export declare const updateResult: (this: SpreadsheetContext) => number;
/**
 * Get the cell object
 *
 * @param object cell
 * @return string value
 */
export declare const getCell: (this: WorksheetInstance, x: string | number, y: number) => HTMLElement;
/**
 * Get the cell object from coords
 *
 * @param object cell
 * @return string value
 */
export declare const getCellFromCoords: (this: WorksheetInstance, x: number, y: number) => HTMLElement;
/**
 * Get label
 *
 * @param object cell
 * @return string value
 */
export declare const getLabel: (this: WorksheetInstance, x: string | number, y: number) => string;
/**
 * Activate/Disable fullscreen
 * use programmatically : table.fullscreen(); or table.fullscreen(true); or table.fullscreen(false);
 * @Param {boolean} activate
 */
export declare const fullscreen: (this: SpreadsheetContext, activate?: boolean) => void;
/**
 * Show index column
 */
export declare const showIndex: (this: SpreadsheetContext) => void;
/**
 * Hide index column
 */
export declare const hideIndex: (this: SpreadsheetContext) => void;
/**
 * Create a nested header object
 */
export declare const createNestedHeader: (this: SpreadsheetContext, nestedInformation: NestedHeader[]) => HTMLElement;
export declare const getWorksheetActive: (this: WorksheetInstance | SpreadsheetContext) => number;
export declare const getWorksheetInstance: (this: SpreadsheetContext, index?: number) => WorksheetInstance;
//# sourceMappingURL=internal.d.ts.map