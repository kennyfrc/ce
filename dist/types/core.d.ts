import { RowDefinition } from "./rows";
export interface SpreadsheetOptions {
    data?: CellValue[][] | Array<Record<string, CellValue>>;
    minSpareRows?: number;
    minSpareCols?: number;
    minDimensions?: [number, number];
    lazyLoading?: boolean;
    editable?: boolean;
    nestedHeaders?: NestedHeader[][];
    columns?: ColumnDefinition[];
    rows?: RowDefinition[];
    meta?: Record<string, Record<string, unknown>>;
    pagination?: number | boolean;
    style?: Record<string, CSSStyleDeclaration | number> | Array<CSSStyleDeclaration>;
    comments?: Record<string, string>;
    classes?: Record<string, string>;
    footers?: string[][];
    onload?: () => void;
    onchange?: (cell: string, value: string | number | boolean | null, oldValue: string | number | boolean | null) => void;
    csvDelimiter?: string;
    csvFileName?: string;
    worksheetName?: string;
    freezeColumns?: number;
    defaultColWidth?: string | number;
    defaultColAlign?: "left" | "center" | "right";
    worksheets?: SpreadsheetOptions[];
    plugins?: Record<string, Function>;
    mergeCells?: Record<string, [number, number, HTMLElement[]] | false>;
    tabs?: boolean | Record<string, unknown>;
    root?: HTMLElement | ShadowRoot;
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
    type?: "text" | "numeric" | "calendar" | "dropdown" | "checkbox" | "color" | "hidden" | "radio" | "image" | "html" | {
        createCell?: (element: HTMLElement, value: CellValue, x: number, y: number, worksheet: WorksheetInstance, column: ColumnDefinition) => void;
        closeEditor?: (cell: HTMLElement, save: boolean, x: number, y: number, worksheet: WorksheetInstance, column: ColumnDefinition) => void;
    };
    title?: string;
    name?: string;
    width?: string | number;
    align?: "left" | "center" | "right";
    mask?: string;
    decimal?: string;
    thousands?: string;
    data?: Array<string | number | {
        value: string | number;
        text: string;
    }>;
    options?: {
        format?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
import type { Resizing, Dragging } from "./events";
export type WorksheetInstance = SpreadsheetContext;
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
    records: Array<Array<{
        element: HTMLElement;
        x: number;
        y: number;
        colspan?: number;
        rowspan?: number;
    }>>;
    fullscreen?: (enabled: boolean) => void;
    toolbar?: HTMLElement & {
        toolbar?: {
            update: (worksheet: WorksheetInstance) => void;
        };
    };
    cols: Array<{
        colElement: HTMLElement;
        x: number;
    }>;
    headerContainer?: HTMLElement;
    colgroupContainer?: HTMLElement;
    thead?: HTMLElement;
    tfoot?: HTMLElement;
    filter?: HTMLElement;
    ads?: HTMLElement;
    pagination?: HTMLElement;
    destroyMerge?: () => void;
    resetSelection?: (blur?: boolean) => number;
    getSelectedColumns?: (includeAll?: boolean) => number[];
    setValue?: (cell: string | HTMLElement[] | Array<{
        element: HTMLElement;
    }>, value: string | number | boolean | null, force?: boolean) => void;
    resizing?: Resizing | null;
    dragging?: Dragging | null;
    insertRow?: (mixed: number | CellValue[], rowNumber?: number, insertBefore?: boolean) => boolean;
    deleteRow?: (index: number) => void;
    insertColumn?: (mixed?: number | CellValue[], columnNumber?: number, insertBefore?: boolean, properties?: ColumnDefinition[]) => boolean | void;
    deleteColumn?: (columnNumber?: number, numOfColumns?: number) => boolean | void;
    getValue?: (cell: string, processedValue?: boolean) => string | number | boolean | null;
    getValueFromCoords?: (x: number, y: number, processedValue?: boolean) => string | number | boolean | null;
    setValueFromCoords?: (x: number, y: number, value: CellValue, force?: boolean) => void;
    undo?: () => void;
    redo?: () => void;
    download?: (filename?: string, format?: string) => void;
    getSelected?: (columnNameOnly?: boolean) => string[] | Array<{
        element: HTMLElement;
        x: number;
        y: number;
        colspan?: number;
        rowspan?: number;
    }>;
    setData?: (data?: CellValue[][]) => void;
    getSelectedRows?: () => number[];
    getData?: (processed?: boolean, includeHeaders?: boolean) => (string | number | boolean | null)[][];
    setStyle?: (o: string | Record<string, string | string[]>, k?: string | null | undefined, v?: string | null, force?: boolean, ignoreHistoryAndEvents?: boolean) => void;
    getStyle?: (cell?: string | number[], key?: string) => string | Record<string, string | null | undefined>;
    removeMerge?: (cell: string) => void;
    setMerge?: (cell: string | undefined, colspan: number | undefined, rowspan: number | undefined, ignoreHistoryAndEvents?: boolean) => void;
    selectedCell?: number[];
    updateSelectionFromCoords?: (x1: number | null, y1: number | null, x2: number | null, y2: number | null) => void;
    whichPage?: (row: number) => number;
    page?: (pageNumber: number | null | undefined) => void;
    filters?: Array<string[] | null>;
    history?: Array<Record<string, unknown>>;
    historyIndex?: number;
    ignoreHistory?: boolean;
    formula?: Record<string, string[]>;
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
    getMerge?: (cell?: string) => Record<string, [number, number, HTMLElement[]] | false> | [number, number, HTMLElement[]] | null;
    setMeta?: (cellOrMeta: string | Record<string, Record<string, unknown>>, key?: string, value?: unknown) => void;
    getMeta?: (cell?: string) => Record<string, Record<string, unknown>> | Record<string, unknown> | null;
    paste?: (x: number, y: number, data: unknown) => void;
    copy?: () => void;
    hideRow?: (rowIndex: number) => void;
    hideColumn?: (colNumber: number | number[]) => void;
    showColumn?: (colNumber: number | number[]) => void;
    pageNumber?: number;
    selectedCorner?: boolean;
    selectedHeader?: number | boolean | null;
    selectedRow?: number | boolean | null;
    setHeader?: (column: number, header?: string) => void;
    setComments?: (cellId: string | Record<string, string>, comments?: string) => void;
    getComments?: (cellParam?: string) => string | Record<string, string>;
    getHeader?: (column: number) => string;
    getHeaders?: (asArray?: boolean) => string[] | string;
    search?: (query: string) => void;
    resetSearch?: () => void;
    moveRow?: (from: number, to: number) => void;
    setWidth?: (column: number | string, width: number | string, force?: boolean) => void;
    setHeight?: (row: number, height: number | string, force?: boolean) => void;
    resetStyle?: (style: Record<string, string | string[]>, ignoreHistoryAndEvents?: boolean) => void;
    loadPage?: (pageNumber: number) => void;
    quantityOfPages?: () => number;
    style?: string[];
    textarea?: HTMLElement;
    hashString?: string;
    data?: string;
    skipUpdateTableReferences?: boolean;
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
    y: number;
}
export interface Cell {
    element: HTMLElement;
    value: CellValue;
    x: number;
    y: number;
    colspan?: number;
    rowspan?: number;
}
export interface SpreadsheetInstance extends SpreadsheetContext {
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
    /**
     * Toolbar control methods
     */
    showToolbar?: () => void;
    hideToolbar?: () => void;
    /** Registered plugins on the spreadsheet instance. */
    plugins?: Record<string, ((...args: unknown[]) => unknown) & {
        onevent?: (...args: unknown[]) => unknown;
        persistence?: (...args: unknown[]) => unknown;
        [key: string]: unknown;
    }>;
    /** Setter used by the factory to initialize plugins. */
    setPlugins?: (newPlugins: Record<string, (...args: unknown[]) => unknown> | undefined) => void;
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
    onchange?: (a: unknown, b: unknown, c: unknown, d: unknown, e: unknown) => void;
    onload?: (a: unknown, b: unknown) => void;
    options?: Array<string | number | {
        value: string | number;
        text: string;
    }>;
    data?: Array<string | number | {
        value: string | number;
        text: string;
    }>;
    v?: Array<string | number | {
        value: string | number;
        text: string;
    }>;
    value?: string | number;
    render?: (element: HTMLElement, value: string, column: string, row: string, context: SpreadsheetContext, columnDefinition: ColumnDefinition) => string;
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
export type ToolbarItem = ToolbarButton | ToolbarDivisor | ToolbarSelect | ToolbarColor;
export interface JSpreadsheet {
    (el: HTMLElement, options: SpreadsheetOptions): WorksheetInstance[];
    getWorksheetInstanceByName(worksheetName: string | undefined | null, namespace: string): WorksheetInstance | Record<string, WorksheetInstance> | null;
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
//# sourceMappingURL=core.d.ts.map