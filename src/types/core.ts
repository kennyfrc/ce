// Core TypeScript interfaces for jspreadsheet

export interface SpreadsheetOptions {
  data?: CellValue[][];
  minSpareRows?: number;
  minSpareCols?: number;
  editable?: boolean;
  nestedHeaders?: NestedHeader[][];
  columns?: ColumnDefinition[];
  meta?: Record<string, Record<string, unknown>>;
  pagination?: number;
  style?: Record<string, CSSStyleDeclaration>;
  onload?: () => void;
  onchange?: (cell: string, value: CellValue, oldValue: CellValue) => void;
  csvDelimiter?: string;
  csvFileName?: string;
  worksheetName?: string;
  freezeColumns?: number;
  defaultColWidth?: string | number;
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
  undo: () => void;
  redo: () => void;
  download: () => void;
  getSelected: (asArray: boolean) => string[];
  setStyle: (styles: Record<string, string>) => void;
  removeMerge: (cell: string) => void;
  setMerge: (cell: string, colspan: number, rowspan: number) => void;
  selectedCell?: number[];
  records: Array<
    Array<{
      element: HTMLElement;
      x: number;
      y: number;
      colspan?: number;
      rowspan?: number;
    }>
  >;
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
  results?: number[];
  tbody: HTMLTableSectionElement;
  table: HTMLElement;
  parent: SpreadsheetInstance;
  records: Array<Array<{ element: HTMLElement; x: number; y: number }>>;
  fullscreen?: (enabled: boolean) => void;
  toolbar?: HTMLElement;
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
