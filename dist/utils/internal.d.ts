export function updateTable(): void;
export function executeFormula(expression: any, x: any, y: any): any;
export function parseValue(i: any, j: any, value: any, cell: any): any;
export function createCell(i: any, j: any, value: any): HTMLTableCellElement;
export function updateCell(x: any, y: any, value: any, force: any): {
    x: any;
    y: any;
    col: any;
    row: any;
    value?: undefined;
    oldValue?: undefined;
} | {
    x: any;
    y: any;
    col: any;
    row: any;
    value: any;
    oldValue: any;
};
export function isFormula(value: any): boolean;
export function getMask(o: any): {} | null;
export function updateFormulaChain(x: any, y: any, records: any): void;
export function updateFormula(formula: any, referencesToUpdate: any): string;
export function updateTableReferences(): void;
export function updateScroll(direction: any): void;
export function updateResult(): number;
export function getCell(x: any, y: any): any;
export function getCellFromCoords(x: any, y: any): any;
export function getLabel(x: any, y: any): any;
export function fullscreen(activate: any): void;
export function showIndex(): void;
export function hideIndex(): void;
export function createNestedHeader(nestedInformation: any): HTMLTableRowElement;
export function getWorksheetActive(): any;
export function getWorksheetInstance(index: any): any;
//# sourceMappingURL=internal.d.ts.map