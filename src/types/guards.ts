// Type guards for runtime type checking

import {
  SpreadsheetContext,
  SpreadsheetInstance,
  WorksheetInstance,
  ColumnDefinition,
  CellValue,
} from "./core";

export function hasHeaders(
  obj: SpreadsheetContext
): obj is SpreadsheetContext & {
  headers: NonNullable<SpreadsheetContext["headers"]>;
} {
  return obj.headers != null && Array.isArray(obj.headers);
}

export function hasOptionsData(
  obj: SpreadsheetContext
): obj is SpreadsheetContext & {
  options: { data: NonNullable<SpreadsheetContext["options"]["data"]> };
} {
  return obj.options?.data != null && Array.isArray(obj.options.data);
}

export function hasOptionsColumns(
  obj: SpreadsheetContext
): obj is SpreadsheetContext & {
  options: { columns: NonNullable<SpreadsheetContext["options"]["columns"]> };
} {
  return obj.options?.columns != null && Array.isArray(obj.options.columns);
}

export function hasParent(
  obj: SpreadsheetContext
): obj is SpreadsheetContext & {
  parent: NonNullable<SpreadsheetContext["parent"]>;
} {
  return obj.parent != null;
}

// DOM element type guards
export function isHTMLElement(
  element: EventTarget | null
): element is HTMLElement {
  return element instanceof HTMLElement;
}

export function isHTMLInputElement(
  element: EventTarget | null
): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

export function isHTMLTableCellElement(
  element: EventTarget | null
): element is HTMLTableCellElement {
  return element instanceof HTMLTableCellElement;
}

export function getHTMLElement(
  element: EventTarget | null
): HTMLElement | null {
  return isHTMLElement(element) ? element : null;
}

export function getHTMLInputElement(
  element: EventTarget | null
): HTMLInputElement | null {
  return isHTMLInputElement(element) ? element : null;
}

export function getHTMLTableCellElement(
  element: EventTarget | null
): HTMLTableCellElement | null {
  return isHTMLTableCellElement(element) ? element : null;
}

export function hasElement(
  obj: SpreadsheetContext | SpreadsheetInstance
): obj is (SpreadsheetContext | SpreadsheetInstance) & {
  element: NonNullable<SpreadsheetContext["element"]>;
} {
  return obj.element != null;
}

export function hasConfig(
  obj: SpreadsheetContext | SpreadsheetInstance
): obj is (SpreadsheetContext | SpreadsheetInstance) & {
  config: NonNullable<SpreadsheetContext["config"]>;
} {
  return obj.config != null;
}

// Runtime assertion functions
export function assertHasHeaders(
  obj: SpreadsheetContext
): asserts obj is SpreadsheetContext & {
  headers: NonNullable<SpreadsheetContext["headers"]>;
} {
  if (!hasHeaders(obj)) {
    throw new Error("SpreadsheetContext is missing headers property");
  }
}

export function assertHasOptionsData(
  obj: SpreadsheetContext
): asserts obj is SpreadsheetContext & {
  options: { data: NonNullable<SpreadsheetContext["options"]["data"]> };
} {
  if (!hasOptionsData(obj)) {
    throw new Error("SpreadsheetContext options is missing data property");
  }
}

// Add similar assertion functions for other properties as needed
