import { SpreadsheetContext, WorksheetInstance, ToolbarItem } from "../types/core";
export declare const getDefault: (this: SpreadsheetContext) => ToolbarItem[];
/**
 * Create toolbar
 */
export declare const createToolbar: (this: SpreadsheetContext, toolbar: {
    items: ToolbarItem[];
}) => HTMLDivElement;
export declare const updateToolbar: (this: SpreadsheetContext, worksheet: WorksheetInstance) => void;
export declare const showToolbar: (this: SpreadsheetContext) => void;
export declare const hideToolbar: (this: SpreadsheetContext) => void;
//# sourceMappingURL=toolbar.d.ts.map