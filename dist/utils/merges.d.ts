/**
 * Is column merged
 */
export declare const isColMerged: (this: any, x: number, insertBefore?: boolean) => string[];
/**
 * Is rows merged
 */
export declare const isRowMerged: (this: any, y: any, insertBefore: any) => string[];
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export declare const getMerge: (this: any, cellName: any) => any;
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export declare const setMerge: (this: any, cellName: any, colspan: any, rowspan: any, ignoreHistoryAndEvents: any) => void;
/**
 * Remove merge by cellname
 * @param cellName
 */
export declare const removeMerge: (this: any, cellName: any, data: any, keepOptions: any) => void;
/**
 * Remove all merged cells
 */
export declare const destroyMerge: (this: any, keepOptions: any) => void;
//# sourceMappingURL=merges.d.ts.map