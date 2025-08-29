import type { SpreadsheetContext } from "../types/core";
/**
 * Copy method
 *
 * @param bool highlighted - Get only highlighted cells
 * @param delimiter - \t default to keep compatibility with excel
 * @return string value
 */
export declare const copy: (this: SpreadsheetContext, highlighted?: boolean, delimiter?: string, returnData?: boolean, includeHeaders?: boolean, download?: boolean, isCut?: boolean, processed?: boolean) => string | false;
/**
 * Jspreadsheet paste method
 *
 * @param x target column
 * @param y target row
 * @param data paste data. if data hash is the same as the copied data, apply style from copied cells
 * @return string value
 */
export declare const paste: (this: SpreadsheetContext, x: number, y: number, data: unknown) => boolean;
//# sourceMappingURL=copyPaste.d.ts.map