import type { WorksheetInstance } from "../types/core";
/**
 * Update order arrow
 */
export declare const updateOrderArrow: (this: WorksheetInstance, column: number, order: boolean) => void;
/**
 * Update rows position
 */
export declare const updateOrder: (this: WorksheetInstance, rows: number[]) => void;
/**
 * Sort data and reload table
 */
export declare const orderBy: (this: WorksheetInstance, column: number, order?: number | boolean) => boolean;
//# sourceMappingURL=orderBy.d.ts.map