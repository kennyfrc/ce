import type { WorksheetInstance, SpreadsheetInstance } from "../types/core";
/**
 * Trigger events
 */
declare const dispatch: (this: WorksheetInstance | SpreadsheetInstance, event: string, ...args: unknown[]) => unknown;
export default dispatch;
//# sourceMappingURL=dispatch.d.ts.map