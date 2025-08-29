import type { WorksheetInstance, CellValue, ColumnDefinition } from "../types/core";
type HistoryRecord = {
    action?: string;
    insertBefore?: boolean;
    rowNumber?: number;
    numOfRows?: number;
    rowRecords?: CellValue[][];
    rowData?: CellValue[][];
    rowNode?: Array<{
        element: HTMLElement;
    }>;
    columnNumber?: number;
    numOfColumns?: number;
    columns?: ColumnDefinition[];
    headers?: HTMLElement[];
    cols?: Array<{
        colElement: HTMLElement;
    }>;
    data?: CellValue[][];
    records?: Array<{
        x: number;
        y: number;
        col: number;
        row: number;
        value?: CellValue;
        oldValue?: CellValue;
    }> | Array<Array<{
        element: HTMLElement;
        x: number;
        y: number;
        oldValue?: CellValue;
        newValue?: CellValue;
    }>>;
    rows?: number[];
    column?: number | string;
    oldValue?: CellValue | number | string | null | Record<string, string | string[]>;
    newValue?: CellValue | number | string | null | Record<string, string | string[]>;
    selection?: number[];
    colspan?: number;
    rowspan?: number;
    oldStyle?: Record<string, unknown> | null;
    newStyle?: Record<string, unknown> | null;
    order?: boolean | number;
    footers?: string[][];
    [key: string]: unknown;
};
/**
 * Initializes a new history record for undo/redo
 *
 * @return null
 */
export declare const setHistory: (this: WorksheetInstance, changes: HistoryRecord) => void;
/**
 * Undo last action
 */
export declare const undo: (this: WorksheetInstance) => void;
/**
 * Redo previously undone action
 */
export declare const redo: (this: WorksheetInstance) => void;
export {};
//# sourceMappingURL=history.d.ts.map