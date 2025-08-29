import type { SpreadsheetContext } from "../types/core";
/**
 * Get cell comments, null cell for all
 */
export declare const getComments: (this: SpreadsheetContext, cellParam?: string) => string | Record<string, string>;
/**
 * Set cell comments
 */
export declare const setComments: (this: SpreadsheetContext, cellId: string | Record<string, string>, comments?: string) => void;
//# sourceMappingURL=comments.d.ts.map