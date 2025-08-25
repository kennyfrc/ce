declare var root: HTMLDivElement;

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
    extractDateFromString: (dateString: string) => any;
    getDateString: (date: any) => string;
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

  interface JSuitesCalendarStatic {
    (element: HTMLElement, options: any): JSuitesDropdown;
    extractDateFromString: (dateString: string, format?: string) => any;
    getDateString: (date: any, format?: string) => string;
  }

  const jSuites: {
    translate: (text: string) => string;
    setDictionary: (dictionary: any) => void;
    dropdown: (element: HTMLElement, options: any) => JSuitesDropdown;
    color: (element: HTMLElement, options: any) => any;
    calendar: JSuitesCalendarStatic;
    editor: (element: HTMLElement, options: any) => any;
    image: (element: HTMLElement, options: any) => any;
    mask: JSuitesMaskStatic;
    tabs: (element: HTMLElement, options: any) => any;
    contextmenu: (element: HTMLElement, options: any) => any;
    ajax: (options: any) => any;
  };
  export default jSuites;
}
