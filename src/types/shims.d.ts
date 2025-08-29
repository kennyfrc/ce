// Type shims for external libraries

declare module "@jspreadsheet/formula" {
  const formula: {
    (expression: string, context?: Record<string, unknown>): unknown;
    [key: string]: unknown;
  };
  export default formula;
}

// Global jSuites declaration for when imported via script tag
declare const jSuites: {
  mask: {
    render: (
      value: string | number,
      options: Record<string, unknown>,
      skipDecimals?: boolean
    ) => string;
    extract: (
      value: string,
      options: Record<string, unknown>,
      skipDecimals?: boolean
    ) => { value: string | number };
  };
  calendar: {
    extractDateFromString: (dateString: string, format?: string) => Date | null;
    getDateString: (date: Date, format?: string) => string;
  };
  translate: (key: string) => string;
  ajax: (options: Record<string, unknown>) => void;
  dropdown: (element: HTMLElement, options: Record<string, unknown>) => unknown;
  color: (element: HTMLElement, options: Record<string, unknown>) => unknown;
  editor: (element: HTMLElement, options: Record<string, unknown>) => unknown;
  tabs: (element: HTMLElement, options: Record<string, unknown>) => unknown;
  contextmenu: (
    element: HTMLElement,
    options: Record<string, unknown>
  ) => unknown;
  toolbar: (element: HTMLElement, options: Record<string, unknown>) => unknown;
  picker: (element: HTMLElement, options: Record<string, unknown>) => unknown;
  image: (element: HTMLElement, options: Record<string, unknown>) => unknown;
  setDictionary: (dictionary: Record<string, string>) => void;
  [key: string]: unknown;
};
declare module "@jspreadsheet/formula";
