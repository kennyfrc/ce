// Core TypeScript interfaces for jspreadsheet

export interface SpreadsheetOptions {
  data?: CellValue[][];
  minSpareRows?: number;
  minSpareCols?: number;
  editable?: boolean;
  nestedHeaders?: NestedHeader[][];
  columns?: ColumnDefinition[];
  meta?: Record<string, Record<string, unknown>>;
  style?: Record<string, CSSStyleDeclaration>;
  onload?: () => void;
  onchange?: (cell: string, value: CellValue, oldValue: CellValue) => void;
  [key: string]: unknown;
}

export interface NestedHeader {
  colspan?: string | number;
  title?: string;
  align?: "left" | "center" | "right";
  [key: string]: unknown;
}

export interface ColumnDefinition {
  type?:
    | "text"
    | "numeric"
    | "calendar"
    | "dropdown"
    | "checkbox"
    | "color"
    | "hidden";
  title?: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  mask?: string;
  decimal?: string;
  thousands?: string;
  data?: Array<string | number | { value: string | number; text: string }>;
  [key: string]: unknown;
}

export interface WorksheetInstance {
  options: SpreadsheetOptions;
  headers: HeaderCell[];
  rows: Row[];
  insertRow: (count: number) => void;
  deleteRow: (index: number) => void;
  insertColumn: (count: number) => void;
  deleteColumn: (index: number) => void;
  getValue: (cell: string) => CellValue;
  setValue: (cell: string, value: CellValue) => void;
  [key: string]: unknown;
}

export interface SpreadsheetInstance {
  config: Record<string, unknown>;
  element: HTMLElement;
  worksheets: WorksheetInstance[];
  options: SpreadsheetOptions;
}

// Context type for functions that use 'this'
export interface SpreadsheetContext {
  options: SpreadsheetOptions;
  headers: HeaderCell[];
  rows: Row[];
  element: HTMLElement;
  config: Record<string, unknown>;
  worksheets: WorksheetInstance[];
}

export type CellValue = string | number | boolean | Date | null;

export interface HeaderCell {
  element: HTMLElement;
  title: string;
  width: number;
  index: number;
}

export interface Row {
  element: HTMLElement;
  cells: Cell[];
  index: number;
  height: number;
}

export interface Cell {
  element: HTMLElement;
  value: CellValue;
  x: number;
  y: number;
  colspan?: number;
  rowspan?: number;
}

export interface JSpreadsheet {
  (el: HTMLElement, options: SpreadsheetOptions): WorksheetInstance[];
  getWorksheetInstanceByName(
    worksheetName: string,
    namespace: string
  ): WorksheetInstance | null;
  setDictionary(o: Record<string, string>): void;
  destroy(element: HTMLElement, destroyEventHandlers?: boolean): void;
  destroyAll(): void;
  current: WorksheetInstance | null;
  spreadsheet: SpreadsheetInstance[];
  helpers: Record<string, Function>;
  version(): string;
}
