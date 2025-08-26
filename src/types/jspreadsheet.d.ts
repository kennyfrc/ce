declare namespace jspreadsheet {
  interface SpreadsheetInstance {
    config: Record<string, unknown>;
    element: HTMLElement;
    worksheets: WorksheetInstance[];
    options: SpreadsheetOptions;
    [key: string]: unknown;
  }

  interface NestedHeader {
    colspan?: string | number;
    title?: string;
    align?: "left" | "center" | "right";
    [key: string]: unknown;
  }

  interface SpreadsheetOptions {
    data?: (string | number | boolean | null)[][];
    minSpareRows?: number;
    minSpareCols?: number;
    editable?: boolean;
    nestedHeaders?: NestedHeader[][];
    columns?: ColumnDefinition[];
    meta?: Record<string, Record<string, unknown>>;
    style?: Record<string, Partial<CSSStyleDeclaration>>;
    onload?: () => void;
    onchange?: (cell: string, value: unknown, oldValue: unknown) => void;
    [key: string]: unknown;
  }

  interface ColumnDefinition {
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

  interface WorksheetInstance {
    options: SpreadsheetOptions;
    headers: HeaderCell[];
    rows: Row[];
    insertRow: (count: number) => void;
    deleteRow: (index: number) => void;
    insertColumn: (count: number) => void;
    deleteColumn: (index: number) => void;
    getValue: (cell: string) => string | number | boolean | null;
    setValue: (cell: string, value: string | number | boolean | null) => void;
    [key: string]: unknown;
  }

  interface HeaderCell {
    element: HTMLElement;
    title: string;
    width: number;
    index: number;
  }

  interface Row {
    element: HTMLElement;
    cells: Cell[];
    index: number;
    height: number;
  }

  interface Cell {
    element: HTMLElement;
    value: string | number | boolean | null;
    x: number;
    y: number;
    colspan?: number;
    rowspan?: number;
  }

  interface JSpreadsheet {
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
}

export = jspreadsheet;
