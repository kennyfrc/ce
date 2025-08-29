import type { SpreadsheetContext } from "../types/core";
/**
 * Which page the row is
 */
export declare const whichPage: (this: SpreadsheetContext, row: unknown) => number;
/**
 * Update the pagination
 */
export declare const updatePagination: (this: SpreadsheetContext) => void;
/**
 * Go to page
 */
export declare const page: (this: SpreadsheetContext, pageNumber: number | null | undefined) => void;
export declare const quantityOfPages: (this: SpreadsheetContext) => number;
//# sourceMappingURL=pagination.d.ts.map