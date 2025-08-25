declare namespace jspreadsheet {
  interface SpreadsheetInstance {
    config: any;
    element: HTMLElement;
    worksheets: any[];
  }

  interface WorksheetInstance {
    options: any;
  }

  interface JSpreadsheet {
    (el: HTMLElement, options: any): any[];
    getWorksheetInstanceByName(worksheetName: string, namespace: string): any;
    setDictionary(o: any): void;
    destroy(element: HTMLElement, destroyEventHandlers?: boolean): void;
    destroyAll(): void;
    current: any;
    spreadsheet: SpreadsheetInstance[];
    helpers: Record<string, any>;
    version(): string;
  }
}

export = jspreadsheet;
