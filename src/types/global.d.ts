declare global {
  namespace NodeJS {
    interface Global {
      root: HTMLDivElement;
    }
  }

  var root: HTMLDivElement;

  interface Navigator {
    msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
  }

  interface HTMLElement {
    jssWorksheet?: jspreadsheet.WorksheetInstance;
    jspreadsheet?: jspreadsheet.SpreadsheetInstance;
  }

  interface Window {
    clipboardData?: DataTransfer;
  }

  function $(element: HTMLElement | string): {
    getAttribute: (name: string) => string | null;
  };
}

interface HTMLElement {
  jssWorksheet?: jspreadsheet.WorksheetInstance;
  jspreadsheet?: jspreadsheet.SpreadsheetInstance;
}

interface Window {
  clipboardData?: DataTransfer;
}

declare function $(element: HTMLElement | string): {
  getAttribute: (name: string) => string | null;
};

declare module "jsuites" {
  interface JSuitesDropdown {
    render: () => void;
    extract: () => string | number | boolean | null;
    open: () => void;
    close: () => void;
    getValue: (asArray?: boolean) => any;
    getText: () => string;
  }

  interface JSuitesCalendar {
    render: () => void;
    extract: () => Date | string | null;
    extractDateFromString: (dateString: string) => Date | null;
    getDateString: (date: Date) => string;
  }

  interface JSuitesCalendarStatic {
    (element: HTMLElement, options: CalendarOptions): JSuitesCalendar;
    extractDateFromString: (dateString: string, format?: string) => Date | null;
    getDateString: (date: Date, format?: string) => string;
  }

  interface JSuitesColor {
    render: () => void;
    extract: () => string | null;
    open: () => void;
  }

  interface JSuitesEditor {
    render: () => void;
    extract: () => string | null;
  }

  interface JSuitesTabs {
    render: () => void;
    [key: string]: any;
  }

  interface JSuitesContextMenu {
    render: () => void;
    [key: string]: any;
  }

  interface JSuitesToolbar {
    render: () => void;
    [key: string]: any;
  }

  interface JSuitesPicker {
    render: () => void;
    [key: string]: any;
  }

  interface JSuitesImage {
    render: () => void;
    [key: string]: any;
  }

  interface JSuitesMask {
    render: () => void;
    extract: () => string | null;
    [key: string]: any;
  }

  interface JSuitesMaskStatic {
    (element: HTMLElement, options: MaskOptions): JSuitesMask;
    render: (value: any, options: any, skipDecimals?: boolean) => string;
    extract: (value: any, options: any, skipDecimals?: boolean) => any;
  }

  interface AjaxOptions {
    url: string;
    method?: string;
    data?: any;
    success?: (data: any) => void;
    error?: (error: any) => void;
    [key: string]: any;
  }

  interface DropdownOptions {
    data?: Array<
      | string
      | number
      | { value: string | number; text: string }
      | { id: string | number; name: string }
    >;
    url?: string;
    multiple?: boolean;
    autocomplete?: boolean;
    opened?: boolean;
    value?: any;
    width?: string;
    position?: boolean;
    onclose?: (o: any) => void;
    [key: string]: any;
  }

  interface CalendarOptions {
    type?: string;
    format?: string;
    [key: string]: any;
  }

  interface ColorOptions {
    value?: string;
    [key: string]: any;
  }

  interface EditorOptions {
    type?: string;
    [key: string]: any;
  }

  interface TabsOptions {
    [key: string]: any;
  }

  interface ContextMenuOptions {
    [key: string]: any;
  }

  interface ToolbarOptions {
    [key: string]: any;
  }

  interface PickerOptions {
    [key: string]: any;
  }

  interface ImageOptions {
    [key: string]: any;
  }

  interface MaskOptions {
    [key: string]: any;
  }

  interface JSuites {
    dropdown: (
      element: HTMLElement,
      options: DropdownOptions
    ) => JSuitesDropdown;
    calendar: JSuitesCalendarStatic;
    color: (element: HTMLElement, options: ColorOptions) => JSuitesColor;
    editor: (element: HTMLElement, options: EditorOptions) => JSuitesEditor;
    tabs: (element: HTMLElement, options: TabsOptions) => JSuitesTabs;
    contextmenu: (
      element: HTMLElement,
      options: ContextMenuOptions
    ) => JSuitesContextMenu;
    toolbar: (element: HTMLElement, options: ToolbarOptions) => JSuitesToolbar;
    picker: (element: HTMLElement, options: PickerOptions) => JSuitesPicker;
    image: (element: HTMLElement, options: ImageOptions) => JSuitesImage;
    mask: JSuitesMaskStatic;
    ajax: (options: AjaxOptions) => void;
    translate: (key: string) => string;
    setDictionary: (dictionary: Record<string, string>) => void;
  }

  const jSuites: JSuites;
  export = jSuites;
}
