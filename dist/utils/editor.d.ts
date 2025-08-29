import type { SpreadsheetContext } from "../types/core";
/**
 * Open the editor
 *
 * @param object cell
 * @return void
 */
export declare const openEditor: (this: SpreadsheetContext, cell: HTMLElement, empty: boolean, e: Event) => void;
/**
 * Close the editor and save the information
 *
 * @param object cell
 * @param boolean save
 * @return void
 */
export declare const closeEditor: (this: SpreadsheetContext, cell: HTMLElement, save: boolean) => void;
/**
 * Toogle
 */
export declare const setCheckRadioValue: (this: SpreadsheetContext) => void;
//# sourceMappingURL=editor.d.ts.map