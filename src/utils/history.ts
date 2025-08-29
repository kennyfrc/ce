import dispatch from "./dispatch";
import { injectArray } from "./internalHelpers";
import { updateTableReferences } from "./internal";
import { setMerge } from "./merges";
import { updateOrder, updateOrderArrow } from "./orderBy";
import { conditionalSelectionUpdate } from "./selection";
import type { WorksheetInstance, CellValue, ColumnDefinition } from "../types/core";

type HistoryRecord = {
  action?: string;
  insertBefore?: boolean;
  rowNumber?: number;
  numOfRows?: number;
  rowRecords?: CellValue[][];
  rowData?: CellValue[][];
  rowNode?: Array<{ element: HTMLElement }>;
  columnNumber?: number;
  numOfColumns?: number;
  columns?: ColumnDefinition[];
  headers?: HTMLElement[];
  cols?: Array<{ colElement: HTMLElement }>;
  data?: CellValue[][];
  records?: Array<Array<{ element: HTMLElement; x: number; y: number; oldValue?: CellValue; newValue?: CellValue }>>;
  rows?: number[];
  column?: number;
  oldValue?: CellValue | number | string | null;
  newValue?: CellValue | number | string | null;
  selection?: number[];
  colspan?: number;
  rowspan?: number;
  oldStyle?: Record<string, unknown> | null;
  newStyle?: Record<string, unknown> | null;
  order?: boolean | number;
  [key: string]: unknown;
};

/**
 * Initializes a new history record for undo/redo
 *
 * @return null
 */
export const setHistory = function (this: WorksheetInstance, changes: HistoryRecord) {
  const obj = this;

  if (obj.ignoreHistory !== true) {
    // Increment and get the current history index
    if (obj.historyIndex !== undefined) {
      const index = ++obj.historyIndex;

      // Slice the array to discard undone changes
      if (obj.history) {
        obj.history = obj.history.slice(0, index + 1);

        // Keep history
        obj.history[index] = changes;
      }
    }
  }
};

/**
 * Process row
 */
const historyProcessRow = function (this: WorksheetInstance, type: number, historyRecord: HistoryRecord) {
  const obj = this;

  const rowIndex = !historyRecord.insertBefore
    ? (historyRecord.rowNumber ?? 0) + 1
    : +(historyRecord.rowNumber ?? 0);

  if (obj.options.search === true) {
    if (obj.results && obj.results.length !== obj.rows.length) {
      obj.resetSearch?.();
    }
  }

  // Remove row
  if (type === 1) {
    const numOfRows = historyRecord.numOfRows ?? 0;
    // Remove nodes
    for (let j = rowIndex; j < numOfRows + rowIndex; j++) {
      obj.rows[j]?.element?.parentNode?.removeChild(obj.rows[j].element);
    }
    // Remove references
    obj.records.splice(rowIndex, numOfRows);
    if (Array.isArray(obj.options.data)) {
      obj.options.data.splice(rowIndex, numOfRows);
    }
    obj.rows.splice(rowIndex, numOfRows);

    conditionalSelectionUpdate.call(obj, 1, rowIndex, numOfRows + rowIndex - 1);
  } else {
    // Insert data
    const records = historyRecord.rowRecords?.map((row: CellValue[]) => {
      return [...row];
    }) ?? [];
    obj.records = injectArray(obj.records, rowIndex, records) as typeof obj.records;

    const data = historyRecord.rowData?.map((row: CellValue[]) => {
      return [...row];
    }) ?? [];
    if (Array.isArray(obj.options.data)) {
      obj.options.data = injectArray(obj.options.data, rowIndex, data) as typeof obj.options.data;
    }

    obj.rows = injectArray(obj.rows, rowIndex, historyRecord.rowNode) as typeof obj.rows;
    // Insert nodes
    let index = 0;
    for (let j = rowIndex; j < historyRecord.numOfRows + rowIndex; j++) {
      obj.tbody.insertBefore(
        historyRecord.rowNode?.[index]?.element,
        obj.tbody.children[j]
      );
      index++;
    }
  }

  for (let j = rowIndex; j < obj.rows.length; j++) {
    obj.rows[j].y = j;
  }

  for (let j = rowIndex; j < obj.records.length; j++) {
    if (obj.records[j]) {
      for (let i = 0; i < obj.records[j].length; i++) {
        if (obj.records[j][i]) {
          obj.records[j][i].y = j;
        }
      }
    }
  }

  // Respect pagination
  if (typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
    obj.page?.(obj.pageNumber);
  }

  updateTableReferences.call(obj);
};

/**
 * Process column
 */
const historyProcessColumn = function (
  this: WorksheetInstance,
  type: number,
  historyRecord: HistoryRecord
) {
  const obj = this;

  const columnIndex = !historyRecord.insertBefore
    ? historyRecord.columnNumber + 1
    : historyRecord.columnNumber;

  // Remove column
  if (type === 1) {
    const numOfColumns = historyRecord.numOfColumns;

    obj.options.columns.splice(columnIndex, numOfColumns);
    for (let i = columnIndex; i < numOfColumns + columnIndex; i++) {
      obj.headers[i]?.parentNode?.removeChild(obj.headers[i]);
      obj.cols[i]?.colElement?.parentNode?.removeChild(obj.cols[i].colElement);
    }
    obj.headers.splice(columnIndex, numOfColumns);
    obj.cols.splice(columnIndex, numOfColumns);
    for (let j = 0; j < historyRecord.data.length; j++) {
      for (let i = columnIndex; i < numOfColumns + columnIndex; i++) {
        obj.records[j]?.[i]?.element?.parentNode?.removeChild(
          obj.records[j][i].element
        );
      }
      obj.records[j]?.splice(columnIndex, numOfColumns);
      if (Array.isArray(obj.options.data) && obj.options.data[j]) {
        obj.options.data[j].splice(columnIndex, numOfColumns);
      }
    }
    // Process footers
    if (obj.options.footers) {
      for (let j = 0; j < obj.options.footers.length; j++) {
        if (obj.options.footers[j]) {
          obj.options.footers[j].splice(columnIndex, numOfColumns);
        }
      }
    }
  } else {
    // Insert data
    obj.options.columns = injectArray(
      obj.options.columns,
      columnIndex,
      historyRecord.columns
    );
    obj.headers = injectArray(obj.headers, columnIndex, historyRecord.headers ?? []);
    obj.cols = injectArray(obj.cols, columnIndex, historyRecord.cols ?? []);

    let index = 0;
    for (
      let i = columnIndex;
      i < historyRecord.numOfColumns + columnIndex;
      i++
    ) {
      obj.headerContainer?.insertBefore(
        historyRecord.headers?.[index],
        obj.headerContainer.children[i + 1]
      );
      obj.colgroupContainer?.insertBefore(
        historyRecord.cols?.[index]?.colElement,
        obj.colgroupContainer.children[i + 1]
      );
      index++;
    }

    for (let j = 0; j < historyRecord.data.length; j++) {
      if (Array.isArray(obj.options.data) && obj.options.data[j]) {
        obj.options.data[j] = injectArray(
          obj.options.data[j],
          columnIndex,
          historyRecord.data[j]
        );
      }
      if (obj.records[j]) {
        obj.records[j] = injectArray(
          obj.records[j],
          columnIndex,
          historyRecord.records?.[j]
        );
      }
      let index = 0;
      for (
        let i = columnIndex;
        i < historyRecord.numOfColumns + columnIndex;
        i++
      ) {
        obj.rows[j]?.element?.insertBefore(
          historyRecord.records?.[j]?.[index]?.element,
          obj.rows[j].element.children[i + 1]
        );
        index++;
      }
    }
    // Process footers
    if (obj.options.footers) {
      for (let j = 0; j < obj.options.footers.length; j++) {
        if (obj.options.footers[j]) {
          obj.options.footers[j] = injectArray(
            obj.options.footers[j],
            columnIndex,
            historyRecord.footers?.[j]
          );
        }
      }
    }
  }

  for (let i = columnIndex; i < obj.cols.length; i++) {
    obj.cols[i].x = i;
  }

  for (let j = 0; j < obj.records.length; j++) {
    for (let i = columnIndex; i < obj.records[j].length; i++) {
      obj.records[j][i].x = i;
    }
  }

  // Adjust nested headers
  if (
    obj.options.nestedHeaders &&
    obj.options.nestedHeaders.length > 0 &&
    obj.options.nestedHeaders[0] &&
    obj.options.nestedHeaders[0][0]
  ) {
    for (let j = 0; j < obj.options.nestedHeaders.length; j++) {
      let colspan;

      if (type === 1) {
        colspan =
          parseInt(
            obj.options.nestedHeaders[j][
              obj.options.nestedHeaders[j].length - 1
            ].colspan
          ) - historyRecord.numOfColumns;
      } else {
        colspan =
          parseInt(
            obj.options.nestedHeaders[j][
              obj.options.nestedHeaders[j].length - 1
            ].colspan
          ) + historyRecord.numOfColumns;
      }
      obj.options.nestedHeaders[j][
        obj.options.nestedHeaders[j].length - 1
      ].colspan = colspan;
      obj.thead?.children[j]?.children[
        obj.thead.children[j].children.length - 1
      ]?.setAttribute("colspan", colspan.toString());
    }
  }

  updateTableReferences.call(obj);
};

/**
 * Undo last action
 */
export const undo = function (this: WorksheetInstance) {
  const obj = this;

  // Ignore events and history
  const ignoreEvents = obj.parent?.ignoreEvents ? true : false;
  const ignoreHistory = obj.ignoreHistory ? true : false;

  if (obj.parent) {
    obj.parent.ignoreEvents = true;
  }
  obj.ignoreHistory = true;

  // Records
  const records = [];

  // Update cells
  let historyRecord;

  if (obj.historyIndex !== undefined && obj.historyIndex >= 0 && obj.history) {
    // History
    historyRecord = obj.history[obj.historyIndex--];

    if (historyRecord.action === "insertRow") {
      historyProcessRow.call(obj, 1, historyRecord);
    } else if (historyRecord.action === "deleteRow") {
      historyProcessRow.call(obj, 0, historyRecord);
    } else if (historyRecord.action === "insertColumn") {
      historyProcessColumn.call(obj, 1, historyRecord);
    } else if (historyRecord.action === "deleteColumn") {
      historyProcessColumn.call(obj, 0, historyRecord);
    } else if (historyRecord.action === "moveRow") {
      obj.moveRow?.(historyRecord.newValue, historyRecord.oldValue);
    } else if (historyRecord.action === "moveColumn") {
      obj.moveColumn?.(historyRecord.newValue, historyRecord.oldValue);
    } else if (historyRecord.action === "setMerge") {
      obj.removeMerge?.(historyRecord.column, historyRecord.data);
    } else if (historyRecord.action === "setStyle") {
      obj.setStyle?.(historyRecord.oldValue, null, null, 1);
    } else if (historyRecord.action === "setWidth") {
      obj.setWidth?.(historyRecord.column, historyRecord.oldValue);
    } else if (historyRecord.action === "setHeight") {
      obj.setHeight?.(historyRecord.row, historyRecord.oldValue);
    } else if (historyRecord.action === "setHeader") {
      obj.setHeader?.(historyRecord.column, historyRecord.oldValue);
    } else if (historyRecord.action === "setComments") {
      obj.setComments?.(historyRecord.oldValue);
    } else if (historyRecord.action === "orderBy") {
      let rows = [];
      for (let j = 0; j < historyRecord.rows.length; j++) {
        rows[historyRecord.rows[j]] = j;
      }
      updateOrderArrow.call(
        obj,
        historyRecord.column,
        historyRecord.order ? 0 : 1
      );
      updateOrder.call(obj, rows);
    } else if (historyRecord.action === "setValue") {
      // Redo for changes in cells
      for (let i = 0; i < historyRecord.records.length; i++) {
        records.push({
          x: historyRecord.records[i].x,
          y: historyRecord.records[i].y,
          value: historyRecord.records[i].oldValue,
        });

        if (historyRecord.oldStyle) {
          obj.resetStyle(historyRecord.oldStyle);
        }
      }
      // Update records
      obj.setValue?.(records);

      // Update selection
      if (historyRecord.selection) {
        obj.updateSelectionFromCoords?.(
          historyRecord.selection[0],
          historyRecord.selection[1],
          historyRecord.selection[2],
          historyRecord.selection[3]
        );
      }
    }
  }
  if (obj.parent) {
    obj.parent.ignoreEvents = ignoreEvents;
  }
  obj.ignoreHistory = ignoreHistory;

  // Events
  dispatch.call(obj, "onundo", obj, historyRecord);
};

/**
 * Redo previously undone action
 */
export const redo = function (this: WorksheetInstance) {
  const obj = this;

  // Ignore events and history
  const ignoreEvents = obj.parent?.ignoreEvents ? true : false;
  const ignoreHistory = obj.ignoreHistory ? true : false;

  if (obj.parent) {
    obj.parent.ignoreEvents = true;
  }
  obj.ignoreHistory = true;

  // Records
  const records = [];

  // Update cells
  let historyRecord;

  if (obj.historyIndex !== undefined && obj.history && obj.historyIndex < obj.history.length - 1) {
    // History
    historyRecord = obj.history[++obj.historyIndex];

    if (historyRecord.action === "insertRow") {
      historyProcessRow.call(obj, 0, historyRecord);
    } else if (historyRecord.action === "deleteRow") {
      historyProcessRow.call(obj, 1, historyRecord);
    } else if (historyRecord.action === "insertColumn") {
      historyProcessColumn.call(obj, 0, historyRecord);
    } else if (historyRecord.action === "deleteColumn") {
      historyProcessColumn.call(obj, 1, historyRecord);
    } else if (historyRecord.action === "moveRow") {
      obj.moveRow?.(historyRecord.oldValue, historyRecord.newValue);
    } else if (historyRecord.action === "moveColumn") {
      obj.moveColumn?.(historyRecord.oldValue, historyRecord.newValue);
    } else if (historyRecord.action === "setMerge") {
      setMerge.call(
        obj,
        historyRecord.column,
        historyRecord.colspan,
        historyRecord.rowspan,
        1
      );
    } else if (historyRecord.action === "setStyle") {
      obj.setStyle?.(historyRecord.newValue, null, null, 1);
    } else if (historyRecord.action === "setWidth") {
      obj.setWidth?.(historyRecord.column, historyRecord.newValue);
    } else if (historyRecord.action === "setHeight") {
      obj.setHeight?.(historyRecord.row, historyRecord.newValue);
    } else if (historyRecord.action === "setHeader") {
      obj.setHeader?.(historyRecord.column, historyRecord.newValue);
    } else if (historyRecord.action === "setComments") {
      obj.setComments?.(historyRecord.newValue);
    } else if (historyRecord.action === "orderBy") {
      updateOrderArrow.call(obj, historyRecord.column, historyRecord.order);
      updateOrder.call(obj, historyRecord.rows);
    } else if (historyRecord.action === "setValue") {
      obj.setValue?.(historyRecord.records);
      // Redo for changes in cells
      for (let i = 0; i < historyRecord.records.length; i++) {
        if (historyRecord.oldStyle) {
          obj.resetStyle?.(historyRecord.newStyle);
        }
      }
      // Update selection
      if (historyRecord.selection) {
        obj.updateSelectionFromCoords?.(
          historyRecord.selection[0],
          historyRecord.selection[1],
          historyRecord.selection[2],
          historyRecord.selection[3]
        );
      }
    }
  }
  if (obj.parent) {
    obj.parent.ignoreEvents = ignoreEvents;
  }
  obj.ignoreHistory = ignoreHistory;

  // Events
  dispatch.call(obj, "onredo", obj, historyRecord);
};
