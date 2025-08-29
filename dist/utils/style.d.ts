import type { WorksheetInstance } from "../types/core";
/**
 * Get style information from cell(s)
 *
 * @return integer
 */
export declare const getStyle: (this: WorksheetInstance, cell?: string | number[], key?: string) => string | Record<string, string | null | undefined> | null;
/**
 * Set meta information to cell(s)
 *
 * @return integer
 */
export declare const setStyle: (this: WorksheetInstance, o: string | Record<string, string | string[]>, k?: string | null | undefined, v?: string | null, force?: boolean, ignoreHistoryAndEvents?: boolean) => void;
export declare const resetStyle: (this: WorksheetInstance, o: Record<string, string | string[]>, ignoreHistoryAndEvents?: boolean) => void;
//# sourceMappingURL=style.d.ts.map