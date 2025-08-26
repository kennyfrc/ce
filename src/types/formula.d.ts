declare module "@jspreadsheet/formula" {
  const formula: {
    (
      expression: string,
      data?: any[][] | Record<string, any>,
      x?: number,
      y?: number,
      context?: any
    ): any;
    parse: (expression: string) => any;
    [key: string]: any;
  };
  export default formula;
}
