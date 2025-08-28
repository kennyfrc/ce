declare namespace jspreadsheet {
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
    minDimensions?: [number, number];
    editable?: boolean;
    nestedHeaders?: NestedHeader[][];
    columns?: ColumnDefinition[];
    meta?: Record<string, Record<string, unknown>>;
    pagination?: number;
    style?: Record<string, CSSStyleDeclaration>;
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
    element: HTMLElement;
    config: Record<string, unknown>;
    insertRow: (count: number) => void;
    deleteRow: (index: number) => void;
    insertColumn: (count: number) => void;
    deleteColumn: (index: number) => void;
    getValue: (cell: string) => string | number | boolean | null;
    setValue: (cell: string, value: string | number | boolean | null) => void;
    undo: () => void;
    redo: () => void;
    download: (filename?: string, format?: string) => void;
    getSelected: () => Array<{
      element: HTMLElement;
      x: number;
      y: number;
      colspan?: number;
      rowspan?: number;
    }>;
    getSelectedColumns: () => number[];
    getSelectedRows: () => number[];
    resetSelection: (blur?: boolean) => number;
    getData: (
      processed?: boolean,
      includeHeaders?: boolean
    ) => (string | number | boolean | null)[][];
    setStyle: (styles: Record<string, string>) => void;
    removeMerge: (cell: string) => void;
    setMerge: (cell: string, colspan: number, rowspan: number) => void;
    selectedCell: number[];
    updateSelectionFromCoords: (
      x1: number,
      y1: number,
      x2: number,
      y3: number
    ) => void;
    whichPage: (row: number) => number;
    page: (pageNumber: number) => void;
    parent: SpreadsheetInstance;
    highlighted: Array<{
      element: HTMLElement;
      x: number;
      y: number;
      colspan?: number;
      rowspan?: number;
    }>;
    corner: HTMLElement;
    content: HTMLElement;
    selectedContainer: number[];
    selection: HTMLElement[];
    records: Array<Array<{ element: HTMLElement; x: number; y: number }>>;
    cols: Array<{ colElement: HTMLElement; x: number }>;
    [key: string]: unknown;
  }

  interface HeaderCell extends HTMLElement {
    index?: number;
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

  type HelperFn = (...args: unknown[]) => unknown;

  interface JSpreadsheet {
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
    timeControl: number | NodeJS.Timeout | null;
    isMouseAction: boolean;
    tmpElement: HTMLElement | null;
    timeControlLoading: number | NodeJS.Timeout | null;
  }
}

export = jspreadsheet;
