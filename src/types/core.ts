// Core TypeScript interfaces for jspreadsheet
/// <reference path="global.d.ts" />

export interface SpreadsheetOptions {
  data?: CellValue[][];
  minSpareRows?: number;
  minSpareCols?: number;
  minDimensions?: [number, number];
  editable?: boolean;
  nestedHeaders?: NestedHeader[][];
  columns?: ColumnDefinition[];
  meta?: Record<string, Record<string, unknown>>;
  pagination?: number;
  style?: Record<string, CSSStyleDeclaration | number> | Array<CSSStyleDeclaration>;
  footers?: string[][];
  onload?: () => void;
  onchange?: (
    cell: string,
    value: string | number | boolean | null,
    oldValue: string | number | boolean | null
  ) => void;
  csvDelimiter?: string;
  csvFileName?: string;
  worksheetName?: string;
  freezeColumns?: number;
  defaultColWidth?: string | number;
  defaultColAlign?: "left" | "center" | "right";
  worksheets?: SpreadsheetOptions[];
  plugins?: Record<string, Function>;
  tabs?: boolean | Record<string, unknown>;
  root?: HTMLElement;
  fullscreen?: boolean;
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
    | "hidden"
    | "radio"
    | "image"
    | "html"
    | {
        createCell?: (
          element: HTMLElement,
          value: CellValue,
          x: number,
          y: number,
          worksheet: WorksheetInstance,
          column: ColumnDefinition
        ) => void;
      };
  title?: string;
  width?: string | number;
  align?: "left" | "center" | "right";
  mask?: string;
  decimal?: string;
  thousands?: string;
  data?: Array<string | number | { value: string | number; text: string }>;
  options?: {
    format?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

import type { Resizing, Dragging } from "./events";

export type WorksheetInstance = SpreadsheetContext;

// Context type for functions that use 'this'
export interface SpreadsheetContext {
  options: SpreadsheetOptions;
  headers: HeaderCell[];
  rows: Row[];
  element: HTMLElement;
  config: SpreadsheetOptions;
  worksheets: WorksheetInstance[];
  results?: number[] | null;
  tbody: HTMLTableSectionElement;
  table: HTMLElement;
  parent: SpreadsheetInstance;
  plugins?: Record<string, Function>;
  records: Array<Array<{ element: HTMLElement; x: number; y: number; colspan?: number; rowspan?: number }>>;
  fullscreen?: (enabled: boolean) => void;
  toolbar?: HTMLElement;
  cols: Array<{
    colElement: HTMLElement;
    x: number;
  }>;
  headerContainer?: HTMLElement;
  colgroupContainer?: HTMLElement;
  thead?: HTMLElement;
  filter?: HTMLElement;
  destroyMerge?: () => void;
  resetSelection?: (blur?: boolean) => number;
  getSelectedColumns?: (includeAll?: boolean) => number[];
  setValue?: (
    cell: string | HTMLElement[] | Array<{ element: HTMLElement }> ,
    value: string | number | boolean | null,
    force?: boolean
  ) => void;

  /* Worksheet-like members (merged into context for compatibility) */
  resizing?: Resizing | null;
  dragging?: Dragging | null;
  insertRow?: (count: number) => void;
  deleteRow?: (index: number) => void;
  insertColumn?: (count: number) => void;
  deleteColumn?: (index: number) => void;
  getValue?: (cell: string) => string | number | boolean | null;
  undo?: () => void;
  redo?: () => void;
  download?: (filename?: string, format?: string) => void;
  getSelected?: () => Array<{
    element: HTMLElement;
    x: number;
    y: number;
    colspan?: number;
    rowspan?: number;
  }>;
  getSelectedRows?: () => number[];
  getData?: (
    processed?: boolean,
    includeHeaders?: boolean
  ) => (string | number | boolean | null)[][];
  setStyle?: (styles: Record<string, string>) => void;
  removeMerge?: (cell: string) => void;
  setMerge?: (cell: string, colspan: number, rowspan: number) => void;
  selectedCell?: number[];
  updateSelectionFromCoords?: (
    x1: number,
    y1: number,
    x2: number,
    y3: number
  ) => void;
  whichPage?: (row: number) => number;
  page?: (pageNumber: number) => void;
  filters?: Array<string[] | null>;
  history?: Array<Record<string, unknown>>;
  historyIndex?: number;
  ignoreHistory?: boolean;
  formula?: Record<string, string[]>;
  // Selection properties
  highlighted?: Array<{
    element: HTMLElement;
    x: number;
    y: number;
    colspan?: number;
    rowspan?: number;
  }>;
  corner?: HTMLElement;
  content?: HTMLElement;
  searchInput?: HTMLInputElement;
  paginationDropdown?: HTMLSelectElement;
  selectedContainer?: number[];
  selection?: HTMLElement[];
  cursor?: HTMLElement | null;
  edition?: [HTMLElement, string, number, number];
  moveColumn?: (from: number, to: number) => void;
  orderBy?: (column: number, direction?: "asc" | "desc") => void;
  pageNumber?: number;
  selectedCorner?: boolean;
  selectedHeader?: number | boolean | null;
  selectedRow?: number | boolean | null;
  setHeader?: (column: number, header: string) => void;
  setComments?: (cellId: string, comments: string) => void;
  getHeader?: (column: number) => string;
}

export type CellValue = string | number | boolean | null;

export interface HeaderCell extends HTMLElement {
  index?: number;
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

export interface SpreadsheetInstance {
  config: SpreadsheetOptions;
  element: HTMLElement;
  worksheets: WorksheetInstance[];
  options: SpreadsheetOptions;
  toolbar?: {
    toolbar: {
      update: (worksheet: WorksheetInstance) => void;
    };
  };
  /**
   * DOM element used as the context menu container. jSuites attaches a
   * `contextmenu` controller object onto this element at runtime, so model
   * the shape as the element plus the optional controller.
   */
  contextMenu?: HTMLElement & {
    contextmenu?: {
      render: () => void;
      close: (immediate?: boolean) => void;
      [key: string]: unknown;
    };
  };
  /** Registered plugins on the spreadsheet instance. */
  plugins?: Record<string, Function>;
  /** Setter used by the factory to initialize plugins. */
  setPlugins?: (newPlugins: Record<string, Function> | undefined) => void;
  ignoreEvents?: boolean;
  [key: string]: unknown;
}

export interface BaseToolbarItem {
  type?: string;
  content?: string;
  tooltip?: string;
  title?: string;
  width?: string | number;
  right?: boolean;
  columns?: number;
  updateState?: (a: unknown, b: unknown, toolbarItem: HTMLElement) => void;
  onclick?: (a: unknown, b: unknown, c: unknown) => void;
  onchange?: (
    a: unknown,
    b: unknown,
    c: unknown,
    d: unknown,
    e: unknown
  ) => void;
  onload?: (a: unknown, b: unknown) => void;
  options?: Array<string | number | { value: string | number; text: string }>;
  data?: Array<string | number | { value: string | number; text: string }>;
  v?: Array<string | number | { value: string | number; text: string }>;
  value?: string | number;
  render?: (
    element: HTMLElement,
    value: string,
    column: string,
    row: string,
    context: SpreadsheetContext,
    columnDefinition: ColumnDefinition
  ) => string;
  k?: string;
}

export interface ToolbarButton extends BaseToolbarItem {
  type?: "button";
  onclick: (a: unknown, b: unknown, c: unknown) => void;
}

export interface ToolbarDivisor extends BaseToolbarItem {
  type: "divisor";
}

export interface ToolbarSelect extends BaseToolbarItem {
  type: "select";
}

export interface ToolbarColor extends BaseToolbarItem {
  type: "color" | "i";
}

export type ToolbarItem =
  | ToolbarButton
  | ToolbarDivisor
  | ToolbarSelect
  | ToolbarColor;

export interface JSpreadsheet {
  (el: HTMLElement, options: SpreadsheetOptions): WorksheetInstance[];
  getWorksheetInstanceByName(
    worksheetName: string | undefined | null,
    namespace: string
  ): WorksheetInstance | Record<string, WorksheetInstance> | null;
  setDictionary(o: Record<string, string>): void;
  destroy(element: HTMLElement, destroyEventHandlers?: boolean): void;
  destroyAll(): void;
  current: WorksheetInstance | null;
  spreadsheet: SpreadsheetInstance[];
  helpers: Record<string, HelperFn>;
  version(): string;
  timeControl?: number | NodeJS.Timeout | null;
  timeControlLoading?: number | NodeJS.Timeout | null;
  isMouseAction?: boolean;
  tmpElement?: HTMLElement | null;
}

export type HelperFn = (...args: unknown[]) => unknown;
