import { WorksheetInstance } from "../types/core";
export declare const updateCornerPosition: (this: WorksheetInstance) => void;
export declare const resetSelection: (this: WorksheetInstance, blur: boolean) => number;
/**
 * Update selection based on two cells
 */
export declare const updateSelection: (this: WorksheetInstance, el1: HTMLElement, el2: HTMLElement | null, origin?: string) => void;
export declare const removeCopyingSelection: () => void;
export declare const updateSelectionFromCoords: (this: WorksheetInstance, x1: number | null, y1: number | null, x2: number | null, y2: number | null, origin?: unknown) => boolean | void;
/**
 * Get selected column numbers
 *
 * @return array
 */
export declare const getSelectedColumns: (this: WorksheetInstance, visibleOnly: boolean) => number[];
/**
 * Refresh current selection
 */
export declare const refreshSelection: (this: WorksheetInstance) => void;
/**
 * Remove copy selection
 *
 * @return void
 */
export declare const removeCopySelection: (this: WorksheetInstance) => void;
/**
 * Helper function to copy data using the corner icon
 */
export declare const copyData: (this: WorksheetInstance, o: HTMLElement, d: HTMLElement) => void;
export declare const hash: (str: string) => number;
/**
 * Move coords to A1 in case overlaps with an excluded cell
 */
export declare const conditionalSelectionUpdate: (this: WorksheetInstance, type: number, o: number, d: number) => void;
/**
 * Get selected rows numbers
 *
 * @return array
 */
export declare const getSelectedRows: (this: WorksheetInstance, visibleOnly: boolean) => number[];
export declare const selectAll: (this: WorksheetInstance) => void;
export declare const getSelection: (this: WorksheetInstance) => number[] | null;
export declare const getSelected: (this: WorksheetInstance, columnNameOnly: boolean) => string[] | Array<{
    element: HTMLElement;
    x: number;
    y: number;
    colspan?: number;
    rowspan?: number;
}>;
export declare const getRange: (this: WorksheetInstance) => string;
export declare const isSelected: (this: WorksheetInstance, x: number, y: number) => boolean;
export declare const getHighlighted: (this: WorksheetInstance) => number[][];
//# sourceMappingURL=selection.d.ts.map