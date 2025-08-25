declare global {
  namespace NodeJS {
    interface Global {
      root: HTMLDivElement;
    }
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
  }

  interface JSuitesMaskStatic {
    (element: HTMLElement, options: any): JSuitesMask;
    render: (value: any, options: any, skipDecimals: boolean) => string;
    extract: (value: any, options: any, skipDecimals?: boolean) => any;
  }

  interface JSuitesCalendar {
    extractDateFromString: (dateString: string, format?: string) => any;
    getDateString: (date: any, format?: string) => string;
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
    onchange?: (o: any, v: string) => void;
    onopen?: (o: any) => void;
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
    onchange?: (tab: any, index: number) => void;
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
  };
  export default jSuites;
}
