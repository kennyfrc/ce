// Core TypeScript interfaces for jspreadsheet

export interface SpreadsheetOptions {
  data?: any[][];
  minSpareRows?: number;
  minSpareCols?: number;
  editable?: boolean;
  nestedHeaders?: NestedHeader[][];
  [key: string]: any;
}

export interface NestedHeader {
  colspan?: string | number;
  title?: string;
  [key: string]: any;
}

export interface WorksheetInstance {
  options: SpreadsheetOptions;
  headers: any[];
  rows: any[];
  insertRow: (count: number) => void;
  [key: string]: any;
}

export interface SpreadsheetInstance {
  config: Record<string, any>;
  element: HTMLElement;
  worksheets: WorksheetInstance[];
  options: SpreadsheetOptions;
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

// Context type for functions that use 'this'
export interface SpreadsheetContext {
  options: SpreadsheetOptions;
  headers: any[];
  rows: any[];
  [key: string]: any;
}
