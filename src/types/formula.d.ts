declare module "@jspreadsheet/formula" {
  interface FormulaContext {
    [key: string]: unknown;
  }

  interface FormulaResult {
    value: unknown;
    error?: string;
  }

  interface FormulaParseResult {
    tokens: unknown[];
    error?: string;
  }

  const formula: {
    (
      expression: string,
      data?: (string | number | boolean | null)[][] | Record<string, unknown>,
      x?: number,
      y?: number,
      context?: FormulaContext
    ): FormulaResult;
    parse: (expression: string) => FormulaParseResult;
    [key: string]: unknown;
  };
  export default formula;
}
