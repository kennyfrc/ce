import { WorksheetInstance, SpreadsheetInstance, SpreadsheetOptions } from "../types/core";
export declare const getNextDefaultWorksheetName: (spreadsheet: SpreadsheetInstance) => string;
export declare const buildWorksheet: (this: WorksheetInstance) => Promise<void>;
export declare const createWorksheetObj: (this: WorksheetInstance, options: SpreadsheetOptions) => {
    parent: SpreadsheetInstance;
    options: SpreadsheetOptions;
    filters: never[];
    formula: never[];
    history: never[];
    selection: never[];
    historyIndex: number;
};
export declare const createWorksheet: (this: WorksheetInstance, options: SpreadsheetOptions) => void;
export declare const openWorksheet: (this: WorksheetInstance, position: number) => void;
export declare const deleteWorksheet: (this: WorksheetInstance, position: number) => void;
//# sourceMappingURL=worksheets.d.ts.map