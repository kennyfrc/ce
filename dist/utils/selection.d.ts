export declare const updateCornerPosition: (this: any) => void;
export declare const resetSelection: (this: any, blur: boolean) => number;
/**
 * Update selection based on two cells
 */
export declare const updateSelection: (this: any, el1: any, el2: any, origin: any) => void;
export declare const removeCopyingSelection: (this: any) => void;
export declare const updateSelectionFromCoords: (this: any, x1: number, y1: number, x2: number, y2: number, origin?: any) => boolean | void;
/**
 * Get selected column numbers
 *
 * @return array
 */
export declare const getSelectedColumns: (this: any, visibleOnly: boolean) => any[];
/**
 * Refresh current selection
 */
export declare const refreshSelection: (this: any) => void;
/**
 * Remove copy selection
 *
 * @return void
 */
export declare const removeCopySelection: (this: any) => void;
/**
 * Helper function to copy data using the corner icon
 */
export declare const copyData: (this: any, o: any, d: any) => void;
export declare const hash: (str: string) => number;
/**
 * Move coords to A1 in case overlaps with an excluded cell
 */
export declare const conditionalSelectionUpdate: (this: any, type: number, o: number, d: number) => void;
/**
 * Get selected rows numbers
 *
 * @return array
 */
export declare const getSelectedRows: (this: any, visibleOnly: boolean) => number[];
export declare const selectAll: (this: any) => void;
export declare const getSelection: (this: any) => number[] | null;
export declare const getSelected: (this: any, columnNameOnly: boolean) => any[];
export declare const getRange: (this: any) => string;
export declare const isSelected: (this: any, x: number, y: number) => boolean;
export declare const getHighlighted: (this: any) => number[][];
//# sourceMappingURL=selection.d.ts.map