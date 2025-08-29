import type { SpreadsheetContext } from "../types/core";
/**
 * Get meta information from cell(s)
 *
 * @return unknown
 */
export declare const getMeta: (this: SpreadsheetContext, cell?: string, key?: string) => unknown;
/**
 * Update meta information
 *
 * @return void
 */
export declare const updateMeta: (this: SpreadsheetContext, affectedCells: Record<string, string>) => void;
/**
 * Set meta information to cell(s)
 *
 * @return void
 */
export declare const setMeta: (this: SpreadsheetContext, o: string | Record<string, Record<string, unknown>>, k?: string, v?: unknown) => void;
//# sourceMappingURL=meta.d.ts.map