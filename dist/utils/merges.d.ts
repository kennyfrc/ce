import type { WorksheetInstance, CellValue } from "../types/core";
/**
 * Is column merged
 */
export declare const isColMerged: (this: WorksheetInstance, x: number, insertBefore?: boolean) => string[];
/**
 * Is rows merged
 */
export declare const isRowMerged: (this: WorksheetInstance, y: number, insertBefore?: boolean) => string[];
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export declare const getMerge: (this: WorksheetInstance, cellName?: string) => [number, number] | Record<string, [number, number]> | null;
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export declare const setMerge: (this: WorksheetInstance, cellName: string | undefined, colspan: number | undefined, rowspan: number | undefined, ignoreHistoryAndEvents?: boolean) => void;
/**
 * Remove merge by cellname
 * @param cellName
 */
export declare const removeMerge: (this: WorksheetInstance, cellName: string, data?: CellValue[] | null, keepOptions?: boolean) => void;
/**
 * Remove all merged cells
 */
export declare const destroyMerge: (this: WorksheetInstance, keepOptions?: boolean) => void;
//# sourceMappingURL=merges.d.ts.map