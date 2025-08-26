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
    jssWorksheet?: any;
    jspreadsheet?: any;
  }

  interface Window {
    clipboardData?: any;
  }

  function $(element: any): {
    getAttribute: (name: string) => string | null;
  };
}

interface Navigator {
  msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean;
}

interface HTMLElement {
  jssWorksheet?: any;
  jspreadsheet?: any;
}

interface Window {
  clipboardData?: any;
}

declare function $(element: any): {
  getAttribute: (name: string) => string | null;
};

declare module "jsuites" {
  interface JSuitesDropdown {
    render: () => void;
    extract: () => any;
  }

  interface JSuitesMask {
    render: (value: any, options: any, skipDecimals: boolean) => string;
    extract: () => any;
    extractDateFromString: (dateString: string, format?: string) => any;
    getDateString: (date: any, format?: string) => string;
  }

  interface JSuitesMaskStatic {
    (element: HTMLElement, options: any): JSuitesMask;
    render: (value: any, options: any, skipDecimals: boolean) => string;
    extract: (value: any, options: any, skipDecimals?: boolean) => any;
  }

  interface JSuitesCalendar {
    extractDateFromString: (dateString: string, format?: string) => any;
    getDateString: (date: any, format?: string) => string;
    render: (value: any, options: any, skipDecimals?: boolean) => string;
    extract: (value: any, options: any, skipDecimals?: boolean) => any;
  }

  interface JSuitesCalendarStatic {
    (element: HTMLElement, options: any): JSuitesCalendar;
    extractDateFromString: (dateString: string, format?: string) => any;
    getDateString: (date: any, format?: string) => string;
  }

  interface DropdownOptions {
    data?: any[];
    multiple?: boolean;
    autocomplete?: boolean;
    opened?: boolean;
    value?: any;
    width?: number | string;
    position?: boolean;
    onclose?: (o: any) => void;
  }

  interface ColorOptions {
    value?: string;
    closeOnChange?: boolean;
    opened?: boolean;
    position?: boolean;
    onchange?: (o: any, v: string) => void;
    onopen?: (o: any) => void;
    onclose?: (el: any, value: any) => void;
    [key: string]: any;
  }

  interface PickerOptions {
    type?: string;
    value?: any;
    data?: any[];
    width?: string;
    render?: (e: string) => string;
    onchange?: (o: any, v: any, c?: any, d?: any) => void;
  }

  interface AjaxOptions {
    url: string;
    method?: string;
    data?: any;
    dataType?: string;
    success?: (response: any) => void;
    error?: (error: any) => void;
  }

  interface ToolbarOptions {
    items?: any[];
    oninsert?: (item: any) => void;
  }

  interface TabsOptions {
    url?: string;
    data?: any[];
    type?: string;
    allowCreate?: boolean;
    hideHeaders?: boolean;
    onchange?: (tab: any, index: number) => void;
    onbeforecreate?: (element: any, title: any) => void;
  }

  const jSuites: {
    translate: (text: string) => string;
    setDictionary: (dictionary: any) => void;
    dropdown: (
      element: HTMLElement,
      options: DropdownOptions
    ) => JSuitesDropdown;
    color: (element: HTMLElement, options: ColorOptions) => any;
    calendar: JSuitesCalendarStatic;
    editor: (element: HTMLElement, options: any) => any;
    image: (element: HTMLElement, options: any) => any;
    mask: JSuitesMaskStatic;
    tabs: (element: HTMLElement, options: TabsOptions) => any;
    contextmenu: (element: HTMLElement, options: any) => any;
    ajax: (options: AjaxOptions) => any;
    picker: (element: HTMLElement, options: PickerOptions) => any;
    toolbar: (element: HTMLElement, options: ToolbarOptions) => any;
    // Additional properties used in the codebase
    render: (value: any, options: any, skipDecimals?: boolean) => string;
    extract: (value: any, options: any, skipDecimals?: boolean) => any;
    extractDateFromString: (dateString: string, format?: string) => any;
    getDateString: (date: any, format?: string) => string;
    [key: string]: any;
  };
  export default jSuites;
}
