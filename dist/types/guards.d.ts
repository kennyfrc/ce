import { SpreadsheetContext, SpreadsheetInstance } from "./core";
export declare function hasHeaders(obj: SpreadsheetContext): obj is SpreadsheetContext & {
    headers: NonNullable<SpreadsheetContext["headers"]>;
};
export declare function hasOptionsData(obj: SpreadsheetContext): obj is SpreadsheetContext & {
    options: {
        data: NonNullable<SpreadsheetContext["options"]["data"]>;
    };
};
export declare function hasOptionsColumns(obj: SpreadsheetContext): obj is SpreadsheetContext & {
    options: {
        columns: NonNullable<SpreadsheetContext["options"]["columns"]>;
    };
};
export declare function hasParent(obj: SpreadsheetContext): obj is SpreadsheetContext & {
    parent: NonNullable<SpreadsheetContext["parent"]>;
};
export declare function isHTMLElement(element: EventTarget | null): element is HTMLElement;
export declare function isHTMLInputElement(element: EventTarget | null): element is HTMLInputElement;
export declare function isHTMLTableCellElement(element: EventTarget | null): element is HTMLTableCellElement;
export declare function getHTMLElement(element: EventTarget | null): HTMLElement | null;
export declare function getHTMLInputElement(element: EventTarget | null): HTMLInputElement | null;
export declare function getHTMLTableCellElement(element: EventTarget | null): HTMLTableCellElement | null;
export declare function hasElement(obj: SpreadsheetContext | SpreadsheetInstance): obj is (SpreadsheetContext | SpreadsheetInstance) & {
    element: NonNullable<SpreadsheetContext["element"]>;
};
export declare function hasConfig(obj: SpreadsheetContext | SpreadsheetInstance): obj is (SpreadsheetContext | SpreadsheetInstance) & {
    config: NonNullable<SpreadsheetContext["config"]>;
};
export declare function assertHasHeaders(obj: SpreadsheetContext): asserts obj is SpreadsheetContext & {
    headers: NonNullable<SpreadsheetContext["headers"]>;
};
export declare function assertHasOptionsData(obj: SpreadsheetContext): asserts obj is SpreadsheetContext & {
    options: {
        data: NonNullable<SpreadsheetContext["options"]["data"]>;
    };
};
//# sourceMappingURL=guards.d.ts.map