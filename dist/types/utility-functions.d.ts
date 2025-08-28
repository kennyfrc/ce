import { SpreadsheetContext, CellValue } from "./core";
export interface NavigationFunctions {
    upGet: (this: SpreadsheetContext, x: number | string, y: number | string) => number;
    upVisible: (this: SpreadsheetContext, group: number, direction: number) => void;
    up: (this: SpreadsheetContext, shiftKey: boolean, ctrlKey: boolean) => void;
    rightGet: (this: SpreadsheetContext, x: number | string, y: number | string) => number;
    rightVisible: (this: SpreadsheetContext, group: number, direction: number) => void;
    right: (this: SpreadsheetContext, shiftKey: boolean, ctrlKey: boolean) => void;
    downGet: (this: SpreadsheetContext, x: number | string, y: number | string) => number;
    downVisible: (this: SpreadsheetContext, group: number, direction: number) => void;
    down: (this: SpreadsheetContext, shiftKey: boolean, ctrlKey: boolean) => void;
    leftGet: (this: SpreadsheetContext, x: number | string, y: number | string) => number;
    leftVisible: (this: SpreadsheetContext, group: number, direction: number) => void;
    left: (this: SpreadsheetContext, shiftKey: boolean, ctrlKey: boolean) => void;
    first: (this: SpreadsheetContext, shiftKey: boolean, ctrlKey: boolean) => void;
    last: (this: SpreadsheetContext, shiftKey: boolean, ctrlKey: boolean) => void;
}
export interface RowFunctions {
    createRow: (this: SpreadsheetContext, j: number, data?: CellValue[]) => HTMLElement;
    getHeight: (this: SpreadsheetContext, row: number | HTMLElement) => number;
    setHeight: (this: SpreadsheetContext, row: number | HTMLElement, height: number, oldHeight?: number) => void;
    showRow: (this: SpreadsheetContext, rowNumber: number | number[]) => void;
    hideRow: (this: SpreadsheetContext, rowNumber: number | number[]) => void;
    getRowData: (this: SpreadsheetContext, rowNumber: number, processed?: boolean) => CellValue[];
    setRowData: (this: SpreadsheetContext, rowNumber: number, data: CellValue[], force?: boolean) => void;
}
export interface ColumnFunctions {
    getNumberOfColumns: (this: SpreadsheetContext) => number;
    createCellHeader: (this: SpreadsheetContext, colNumber: number) => HTMLElement;
    getWidth: (this: SpreadsheetContext, column: number | HTMLElement) => number | number[];
    setWidth: (this: SpreadsheetContext, column: number | HTMLElement | number[], width: number | number[], oldWidth?: number | number[]) => void;
    showColumn: (this: SpreadsheetContext, colNumber: number | number[]) => void;
    hideColumn: (this: SpreadsheetContext, colNumber: number | number[]) => void;
    getColumnData: (this: SpreadsheetContext, columnNumber: number, processed?: boolean) => CellValue[];
    setColumnData: (this: SpreadsheetContext, colNumber: number, data: CellValue[], force?: boolean) => void;
}
export interface SelectionFunctions {
    updateCornerPosition: (this: SpreadsheetContext) => void;
    resetSelection: (this: SpreadsheetContext, blur?: boolean) => number;
    removeCopyingSelection: (this: SpreadsheetContext) => void;
    refreshSelection: (this: SpreadsheetContext) => void;
    removeCopySelection: (this: SpreadsheetContext) => void;
    copyData: (this: SpreadsheetContext, o: HTMLElement, d: HTMLElement) => void;
    getSelectedRows: (this: SpreadsheetContext, visibleOnly?: boolean) => number[];
    selectAll: (this: SpreadsheetContext) => void;
    getSelection: (this: SpreadsheetContext) => number[] | null;
    getSelected: (this: SpreadsheetContext, columnNameOnly?: boolean) => string[];
    getRange: (this: SpreadsheetContext) => string;
    isSelected: (this: SpreadsheetContext, x: number, y: number) => boolean;
    getHighlighted: (this: SpreadsheetContext) => number[][];
}
export interface DataFunctions {
    setData: (this: SpreadsheetContext, data: CellValue[][]) => void;
    getValue: (this: SpreadsheetContext, cell: string, processedValue?: boolean) => CellValue;
    setValue: (this: SpreadsheetContext, cell: string, value: CellValue) => void;
}
export interface EventFunctions {
    mouseUpControls: (this: SpreadsheetContext, e: MouseEvent) => void;
    mouseDownControls: (this: SpreadsheetContext, e: MouseEvent) => void;
    mouseMoveControls: (this: SpreadsheetContext, e: MouseEvent) => void;
    mouseOverControls: (this: SpreadsheetContext, e: MouseEvent) => boolean | void;
    doubleClickControls: (this: SpreadsheetContext, e: MouseEvent) => void;
    pasteControls: (this: SpreadsheetContext, e: ClipboardEvent) => void;
    contextMenuControls: (this: SpreadsheetContext, e: MouseEvent) => void;
    touchStartControls: (this: SpreadsheetContext, e: TouchEvent) => void;
    touchEndControls: (this: SpreadsheetContext, e: TouchEvent) => void;
    cutControls: (this: SpreadsheetContext, e: ClipboardEvent) => void;
    copyControls: (this: SpreadsheetContext, e: ClipboardEvent) => void;
    keyDownControls: (this: SpreadsheetContext, e: KeyboardEvent) => void;
    wheelControls: (this: SpreadsheetContext, e: WheelEvent) => void;
    scrollControls: (this: SpreadsheetContext, e: Event) => void;
}
export interface SearchFunctions {
    resetSearch: (this: SpreadsheetContext) => void;
}
export type UtilityFunctions = NavigationFunctions & RowFunctions & ColumnFunctions & SelectionFunctions & DataFunctions & EventFunctions & SearchFunctions;
//# sourceMappingURL=utility-functions.d.ts.map