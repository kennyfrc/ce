import type { SpreadsheetInstance, SpreadsheetOptions, WorksheetInstance } from "../types/core";
interface Factory {
    (): void;
    spreadsheet(el: HTMLElement, options: SpreadsheetOptions, worksheets: WorksheetInstance[]): Promise<SpreadsheetInstance>;
    worksheet(spreadsheet: SpreadsheetInstance, options: SpreadsheetOptions, position: number): {
        parent: SpreadsheetInstance;
        options: SpreadsheetOptions;
    };
}
declare const factory: Factory;
export default factory;
//# sourceMappingURL=factory.d.ts.map