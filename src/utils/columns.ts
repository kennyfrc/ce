import jSuites from "jsuites";
import dispatch from "./dispatch";
import { getColumnName } from "./helpers";
import { setHistory } from "./history";
import { isColMerged } from "./merges";
import { createCell, updateTableReferences } from "./internal";
import { conditionalSelectionUpdate, updateCornerPosition } from "./selection";
import { setFooter } from "./footer";
import { getColumnNameFromId, injectArray } from "./internalHelpers";
import type { ColumnDefinition, WorksheetInstance, SpreadsheetInstance, SpreadsheetContext, CellValue } from "../types/core";

export const getNumberOfColumns = function (
  this: WorksheetInstance | SpreadsheetInstance | SpreadsheetContext
) {
  const obj = this;

  let numberOfColumns =
    (obj.options.columns && obj.options.columns.length) || 0;

  if (obj.options.data && obj.options.data.length > 0 && obj.options.data[0] !== undefined) {
    // Data keys
    const firstRow = obj.options.data[0];
    const keys = Array.isArray(firstRow) ? [] : Object.keys(firstRow);

    if (keys.length > numberOfColumns) {
      numberOfColumns = keys.length;
    }
  }

  if (
    obj.options.minDimensions &&
    obj.options.minDimensions[0] > numberOfColumns
  ) {
    numberOfColumns = obj.options.minDimensions[0];
  }

  return numberOfColumns;
};

export const createCellHeader = function (
  this: WorksheetInstance | SpreadsheetContext,
  colNumber: number
) {
  const obj = this;

  // Create col global control
  const colWidth =
    (obj.options.columns &&
      obj.options.columns[colNumber] &&
      obj.options.columns[colNumber].width) ||
    obj.options.defaultColWidth ||
    100;
  const colAlign =
    (obj.options.columns &&
      obj.options.columns[colNumber] &&
      obj.options.columns[colNumber].align) ||
    obj.options.defaultColAlign ||
    "center";

  // Create header cell
  if (!obj.headers) {
    obj.headers = [];
  }
  obj.headers[colNumber] = document.createElement("td");
  obj.headers[colNumber].textContent =
    (obj.options.columns &&
      obj.options.columns[colNumber] &&
      obj.options.columns[colNumber].title) ||
    getColumnName(colNumber);

  obj.headers[colNumber].setAttribute("data-x", colNumber.toString());
  obj.headers[colNumber].style.textAlign = colAlign;
  if (
    obj.options.columns &&
    obj.options.columns[colNumber] &&
    obj.options.columns[colNumber].title
  ) {
    obj.headers[colNumber].setAttribute(
      "title",
      obj.headers[colNumber].innerText
    );
  }
  if (
    obj.options.columns &&
    obj.options.columns[colNumber] &&
    typeof obj.options.columns[colNumber].id === "string"
  ) {
    obj.headers[colNumber].setAttribute(
      "id",
      obj.options.columns[colNumber].id || ""
    );
  }

  // Width control
  const colElement = document.createElement("col");
  colElement.setAttribute("width", colWidth.toString());

  if (!obj.cols) {
    obj.cols = [];
  }
  obj.cols[colNumber] = {
    colElement,
    x: colNumber,
  };

  // Hidden column
  if (
    obj.options.columns &&
    obj.options.columns[colNumber] &&
    obj.options.columns[colNumber].type == "hidden"
  ) {
    obj.headers[colNumber].style.display = "none";
    colElement.style.display = "none";
  }
};

/**
 * Insert a new column
 *
 * @param mixed - num of columns to be added or data to be added in one single column
 * @param int columnNumber - number of columns to be created
 * @param bool insertBefore
 * @param object properties - column properties
 * @return void
 */
export const insertColumn = function (
  this: import("../types/core").SpreadsheetContext,
  mixed?: number | CellValue[],
  columnNumber?: number,
  insertBefore?: boolean,
  properties?: ColumnDefinition[]
): boolean | void {
  const obj = this;

  // Configuration
  if (obj.options.allowInsertColumn != false) {
    // Records
    var records = [];

    // Data to be insert
    let data: CellValue[] = [];

    // The insert could be lead by number of rows or the array of data
    let numOfColumns;
    if (!Array.isArray(mixed)) {
      numOfColumns = typeof mixed === "number" ? mixed : 1;
    } else {
      numOfColumns = 1;

      if (mixed) {
        data = mixed;
      }
    }

    // Direction
    insertBefore = insertBefore ? true : false;

    // Current column number
    let maxFromData = 0;
    if (obj.options.data) {
      for (const row of obj.options.data) {
        const len = Array.isArray(row) ? row.length : Object.keys(row).length;
        if (len > maxFromData) maxFromData = len;
      }
    }
    const currentNumOfColumns = Math.max(obj.options.columns?.length || 0, maxFromData);

    const lastColumn = currentNumOfColumns - 1;

    // Confirm position
    if (
      columnNumber == undefined ||
      columnNumber >= lastColumn ||
      columnNumber < 0
    ) {
      columnNumber = lastColumn;
    }

    // Normalize properties to an array of ColumnDefinition
    if (!Array.isArray(properties)) {
      properties = properties ? [properties] as ColumnDefinition[] : [];
    }

    for (let i = 0; i < numOfColumns; i++) {
      if (!properties[i]) {
        properties[i] = {} as ColumnDefinition;
      }
    }

    const columns = [];

    if (!Array.isArray(mixed)) {
      for (let i = 0; i < (mixed || 0); i++) {
        const column = {
          column: columnNumber + i + (insertBefore ? 0 : 1),
          options: Object.assign({}, properties[i]),
        };

        columns.push(column);
      }
    } else {
      const data: CellValue[] = [];

      for (let i = 0; i < (obj.options.data?.length || 0); i++) {
        data.push(i < mixed.length ? mixed[i] : "");
      }

      const column = {
        column: columnNumber + (insertBefore ? 0 : 1),
        options: Object.assign({}, properties[0]),
        data,
      };

      columns.push(column);
    }

    // Onbeforeinsertcolumn
    if (dispatch.call(obj, "onbeforeinsertcolumn", obj, columns) === false) {
      return false;
    }

    // Merged cells
    if (
      obj.options.mergeCells &&
      Object.keys(obj.options.mergeCells).length > 0
    ) {
      if (obj.worksheets?.[0] && isColMerged.call(obj.worksheets[0], columnNumber, insertBefore).length) {
        if (
          !confirm(
            jSuites.translate(
              "This action will destroy any existing merged cells. Are you sure?"
            )
          )
        ) {
          return false;
        } else {
          obj.destroyMerge?.();
        }
      }
    }

    // Insert before
    const columnIndex = !insertBefore ? columnNumber + 1 : columnNumber;
    obj.options.columns = injectArray(
      obj.options.columns || [],
      columnIndex,
      properties
    ) as ColumnDefinition[];

    // Open space in the containers
    const currentHeaders = obj.headers.splice(columnIndex);
    const currentColgroup = obj.cols.splice(columnIndex);

    // History
    const historyHeaders: HTMLElement[] = [];
    const historyColgroup: Array<{ colElement: HTMLElement }> = [];
    const historyRecords: Array<Array<{ element: HTMLElement; x: number; y: number; oldValue?: CellValue; newValue?: CellValue }>> = [];
    const historyData: CellValue[][] = [];
    const historyFooters: string[][] = [];

    // Add new headers
    for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
      createCellHeader.call(obj, col);
      obj.headerContainer?.insertBefore(
        obj.headers[col],
        obj.headerContainer.children[col + 1]
      );
      obj.colgroupContainer?.insertBefore(
        obj.cols[col].colElement,
        obj.colgroupContainer.children[col + 1]
      );

      historyHeaders.push(obj.headers[col]);
      historyColgroup.push(obj.cols[col]);
    }

    // Add new footer cells
    if (obj.options.footers) {
      for (let j = 0; j < obj.options.footers.length; j++) {
        historyFooters[j] = [];
        for (let i = 0; i < numOfColumns; i++) {
          historyFooters[j].push("");
        }
        obj.options.footers[j].splice(columnIndex, 0, ...historyFooters[j]);
      }
    }

    // Adding visual columns
    for (let row = 0; row < (obj.options.data?.length || 0); row++) {
      // Keep the current data
      const currentData = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row]))
        ? (obj.options.data[row] as CellValue[]).splice(columnIndex)
        : [];
      const currentRecord = obj.records[row].splice(columnIndex);

      // History
      historyData[row] = [];
      historyRecords[row] = [];

      for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
        // New value
        const value = data[row] ? data[row] : "";
        if (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row])) {
          (obj.options.data[row] as CellValue[])[col] = value;
        }
        // New cell
        const cellValue = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row]))
          ? (obj.options.data[row] as CellValue[])[col] ?? ""
          : "";
        const td = createCell.call(
          obj.worksheets[0],
          col,
          row,
          cellValue
        );
        obj.records[row][col] = {
          element: td,
          x: col,
          y: row,
        };
        // Add cell to the row
        if (obj.rows[row]) {
          obj.rows[row].element.insertBefore(
            td,
            obj.rows[row].element.children[col + 1]
          );
        }

        if (
          obj.options.columns &&
          obj.options.columns[col] &&
          typeof (obj.options.columns[col] as ColumnDefinition).render ===
            "function"
        ) {
          ((obj.options.columns[col] as ColumnDefinition).render as Function)?.(
            td,
            value,
            col.toString(),
            row.toString(),
            obj,
            obj.options.columns[col] as ColumnDefinition
          );
        }

        // Record History
        historyData[row].push(value);
        historyRecords[row].push({ element: td, x: col, y: row });
      }

      // Copy the data back to the main data
      if (obj.options.data && obj.options.data[row]) {
        Array.prototype.push.apply(obj.options.data[row], currentData);
      }
      Array.prototype.push.apply(obj.records[row], currentRecord);
    }

    Array.prototype.push.apply(obj.headers, currentHeaders);
    Array.prototype.push.apply(obj.cols, currentColgroup);

    for (let i = columnIndex; i < obj.cols.length; i++) {
      obj.cols[i].x = i;
    }

    for (let j = 0; j < obj.records.length; j++) {
      for (let i = 0; i < obj.records[j].length; i++) {
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
        const colspan =
          parseInt(
            (
              obj.options.nestedHeaders[j][
                obj.options.nestedHeaders[j].length - 1
              ].colspan || "1"
            ).toString()
          ) + numOfColumns;
        obj.options.nestedHeaders[j][
          obj.options.nestedHeaders[j].length - 1
        ].colspan = colspan;
        obj.thead?.children[j]?.children[
          obj.thead.children[j].children.length - 1
        ]?.setAttribute("colspan", colspan.toString());
        const dataColumn =
          obj.thead?.children[j]?.children[
            obj.thead.children[j].children.length - 1
          ]?.getAttribute("data-column");
        let oArray = dataColumn?.split(",") || [];
        for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
          oArray.push(col.toString());
        }
        obj.thead?.children[j]?.children[
          obj.thead.children[j].children.length - 1
        ]?.setAttribute("data-column", oArray.join(","));
      }
    }

    // Keep history
    setHistory.call(obj, {
      action: "insertColumn",
      columnNumber: columnNumber,
      numOfColumns: numOfColumns,
      insertBefore: insertBefore,
      columns: properties,
      headers: historyHeaders,
      cols: historyColgroup,
      records: historyRecords,
      footers: historyFooters,
      data: historyData,
    });

    // Remove table references
    if (obj.worksheets && obj.worksheets[0]) {
      updateTableReferences.call(obj.worksheets[0]);
    }

    // Events
    dispatch.call(obj, "oninsertcolumn", obj, columns);
  }
};

/**
 * Move column
 *
 * @return void
 */
export const moveColumn = function (
  this: import("../types/core").SpreadsheetContext,
  o: number,
  d: number
): boolean | void {
  const obj = this;
  let insertBefore: boolean;
  if (o > d) {
    insertBefore = true;
  } else {
    insertBefore = false;
  }

    if (
      (obj.worksheets?.[0] && isColMerged.call(obj.worksheets[0], o).length) ||
      (obj.worksheets?.[0] && isColMerged.call(obj.worksheets[0], d, !!insertBefore).length)
    ) {
    if (
      !confirm(
        jSuites.translate(
          "This action will destroy any existing merged cells. Are you sure?"
        )
      )
    ) {
      return false;
    } else {
      obj.destroyMerge?.();
    }
  }

  // o and d are already numbers, no need for parseInt

  if (o > d) {
    obj.headerContainer?.insertBefore(obj.headers[o], obj.headers[d]);
    obj.colgroupContainer?.insertBefore(
      obj.cols[o].colElement,
      obj.cols[d].colElement
    );

    for (let j = 0; j < obj.rows.length; j++) {
      obj.rows[j].element.insertBefore(
        obj.records[j][o].element,
        obj.records[j][d].element
      );
    }
  } else {
    obj.headerContainer?.insertBefore(
      obj.headers[o],
      obj.headers[d].nextSibling
    );
    obj.colgroupContainer?.insertBefore(
      obj.cols[o].colElement,
      obj.cols[d].colElement.nextSibling
    );

    for (let j = 0; j < obj.rows.length; j++) {
      obj.rows[j].element.insertBefore(
        obj.records[j][o].element,
        obj.records[j][d].element.nextSibling
      );
    }
  }

  obj.options.columns?.splice(d, 0, obj.options.columns.splice(o, 1)[0]);
  obj.headers.splice(d, 0, obj.headers.splice(o, 1)[0]);
  obj.cols.splice(d, 0, obj.cols.splice(o, 1)[0]);

  const firstAffectedIndex = Math.min(o, d);
  const lastAffectedIndex = Math.max(o, d);

  for (let j = 0; j < obj.rows.length; j++) {
    if (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[j])) {
      const movedValue = (obj.options.data[j] as CellValue[]).splice(o, 1)[0];
      (obj.options.data[j] as CellValue[]).splice(d, 0, movedValue);
    }
    obj.records[j].splice(d, 0, obj.records[j].splice(o, 1)[0]);
  }

  for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
    obj.cols[i].x = i;
  }

  for (let j = 0; j < obj.records.length; j++) {
    for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
      obj.records[j][i].x = i;
    }
  }

  // Update footers position
  if (obj.options.footers) {
    for (let j = 0; j < obj.options.footers.length; j++) {
      obj.options.footers[j].splice(
        d,
        0,
        obj.options.footers[j].splice(o, 1)[0]
      );
    }
  }

  // Keeping history of changes
  setHistory.call(obj, {
    action: "moveColumn",
    oldValue: o,
    newValue: d,
  });

  // Update table references
  if (obj.worksheets && obj.worksheets[0]) {
    updateTableReferences.call(obj.worksheets[0]);
  }

  // Events
  dispatch.call(obj, "onmovecolumn", obj, o, d, 1);
};

/**
 * Delete a column by number
 *
 * @param integer columnNumber - reference column to be excluded
 * @param integer numOfColumns - number of columns to be excluded from the reference column
 * @return void
 */
export const deleteColumn = function (
  this: import("../types/core").SpreadsheetContext,
  columnNumber?: number,
  numOfColumns?: number
): boolean | void {
  const obj = this;

  // Global Configuration
  if (obj.options.allowDeleteColumn != false) {
    if (obj.headers.length > 1) {
      // Delete column definitions
      if (columnNumber == undefined) {
        const number = obj.getSelectedColumns?.(true) || [];

        if (!number.length) {
          // Remove last column
          columnNumber = obj.headers.length - 1;
          numOfColumns = 1;
        } else {
          // Remove selected
          columnNumber = number[0] ?? 0;
          numOfColumns = number.length;
        }
      }

      // Last column
      const lastColumn = (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[0] && Array.isArray(obj.options.data[0]))
        ? obj.options.data[0].length - 1
        : 0;

      if (
        columnNumber == undefined ||
        columnNumber > lastColumn ||
        columnNumber < 0
      ) {
        columnNumber = lastColumn;
      }

      // Minimum of columns to be delete is 1
      if (!numOfColumns || numOfColumns < 1) {
        numOfColumns = 1;
      }

      // Can't delete more than the limit of the table
      if (
        obj.options.data && Array.isArray(obj.options.data) && obj.options.data[0] && Array.isArray(obj.options.data[0]) &&
        numOfColumns > obj.options.data[0].length - columnNumber
      ) {
        numOfColumns = obj.options.data[0].length - columnNumber;
      }

      const removedColumns = [];
      for (let i = 0; i < numOfColumns; i++) {
        removedColumns.push(i + columnNumber);
      }

      // onbeforedeletecolumn
      if (
        dispatch.call(obj, "onbeforedeletecolumn", obj, removedColumns) ===
        false
      ) {
        return false;
      }

      // Can't remove the last column
      if (columnNumber > -1) {
        // Merged cells
        let mergeExists = false;
        if (
          obj.options.mergeCells &&
          Object.keys(obj.options.mergeCells).length > 0
        ) {
          for (
            let col = columnNumber;
            col < columnNumber + numOfColumns;
            col++
          ) {
          if (obj.worksheets?.[0] && isColMerged.call(obj.worksheets[0], col, undefined).length) {
              mergeExists = true;
            }
          }
        }
        if (mergeExists) {
          if (
            !confirm(
              jSuites.translate(
                "This action will destroy any existing merged cells. Are you sure?"
              )
            )
          ) {
            return false;
          } else {
            obj.destroyMerge?.();
          }
        }

        // Delete the column properties
        const columns = obj.options.columns
          ? obj.options.columns.splice(columnNumber, numOfColumns)
          : undefined;

        for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
          obj.cols[col].colElement.className = "";
          obj.headers[col].className = "";
          obj.cols[col].colElement.parentNode?.removeChild(
            obj.cols[col].colElement
          );
          obj.headers[col].parentNode?.removeChild(obj.headers[col]);
        }

        const historyHeaders = obj.headers.splice(columnNumber, numOfColumns);
        const historyColgroup = obj.cols.splice(columnNumber, numOfColumns);
        const historyRecords = [];
        const historyData = [];
        const historyFooters = [];

        for (let row = 0; row < (obj.options.data?.length || 0); row++) {
          for (
            let col = columnNumber;
            col < columnNumber + numOfColumns;
            col++
          ) {
            obj.records[row][col].element.className = "";
            obj.records[row][col].element.parentNode?.removeChild(
              obj.records[row][col].element
            );
          }
        }

        // Delete headers
        for (let row = 0; row < (obj.options.data?.length || 0); row++) {
          // History
          historyData[row] = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row]))
            ? (obj.options.data[row] as CellValue[]).splice(columnNumber, numOfColumns)
            : [];
          historyRecords[row] = obj.records[row].splice(
            columnNumber,
            numOfColumns
          );
        }

        for (let i = columnNumber; i < obj.cols.length; i++) {
          obj.cols[i].x = i;
        }

        for (let j = 0; j < obj.records.length; j++) {
          for (let i = columnNumber; i < obj.records[j].length; i++) {
            obj.records[j][i].x = i;
          }
        }

        // Delete footers
        if (obj.options.footers) {
          for (let row = 0; row < obj.options.footers.length; row++) {
            historyFooters[row] = obj.options.footers[row].splice(
              columnNumber,
              numOfColumns
            );
          }
        }

        // Remove selection
        conditionalSelectionUpdate.call(
          obj.worksheets[0],
          0,
          columnNumber,
          columnNumber + numOfColumns - 1
        );

        // Adjust nested headers
        if (
          obj.options.nestedHeaders &&
          obj.options.nestedHeaders.length > 0 &&
          obj.options.nestedHeaders[0] &&
          obj.options.nestedHeaders[0][0]
        ) {
          for (let j = 0; j < obj.options.nestedHeaders.length; j++) {
            const colspan =
              parseInt(
                String(
                  obj.options.nestedHeaders[j]?.[
                    obj.options.nestedHeaders[j].length - 1
                  ]?.colspan || "1"
                )
              ) - numOfColumns;
            obj.options.nestedHeaders[j][
              obj.options.nestedHeaders[j].length - 1
            ].colspan = colspan;
            obj.thead?.children[j]?.children[
              obj.thead.children[j].children.length - 1
            ]?.setAttribute("colspan", String(colspan));
          }
        }

        // Keeping history of changes
        setHistory.call(obj, {
          action: "deleteColumn",
          columnNumber: columnNumber,
          numOfColumns: numOfColumns,
          insertBefore: false,
          columns: columns,
          headers: historyHeaders,
          cols: historyColgroup,
          records: historyRecords,
          footers: historyFooters,
          data: historyData,
        });

        // Update table references
        if (obj.worksheets && obj.worksheets[0]) {
          updateTableReferences.call(obj.worksheets[0]);
        }

        // Delete
        dispatch.call(obj, "ondeletecolumn", obj, removedColumns);
      }
    } else {
      console.error(
        "Jspreadsheet: It is not possible to delete the last column"
      );
    }
  }
};

/**
 * Get the column width
 *
 * @param int column column number (first column is: 0)
 * @return int current width
 */
export const getWidth = function (
  this: import("../types/core").SpreadsheetContext,
  column: number | HTMLElement
): number | number[] {
  const obj = this;

  let data;

  if (typeof column === "undefined") {
    // Get all headers
    data = [];
    for (let i = 0; i < obj.headers.length; i++) {
      data.push(
        Number(
          (obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].width) ||
            obj.options.defaultColWidth ||
            100
        )
      );
    }
  } else {
    const columnIndex =
      typeof column === "number"
        ? column
        : parseInt(column.getAttribute("data-x") || "0");
    data = parseInt(
      obj.cols[columnIndex].colElement.getAttribute("width") || "0"
    );
  }

  return data;
};

/**
 * Set the column width
 *
 * @param int column number (first column is: 0)
 * @param int new column width
 * @param int old column width
 */
export const setWidth = function (
  this: import("../types/core").WorksheetInstance | import("../types/core").SpreadsheetContext,
  column: number | number[] | HTMLElement | HTMLElement[],
  width: string | number,
  oldWidth?: string | number | number[]
): void {
  const obj = this;

  if (width) {
    // Handle both array and non-array cases for oldWidth
    let finalOldWidth: string | number | number[] = oldWidth || 0;

    if (Array.isArray(column)) {
      // For array column, use an array for oldWidth
      const oldWidthArray: number[] = [];

      // Set width
      for (let i = 0; i < column.length; i++) {
        let columnIndex: number;
        const colItem = column[i];
        if (typeof colItem === "number") {
          columnIndex = colItem;
        } else {
          columnIndex =
            parseInt((colItem as HTMLElement).getAttribute("data-x") || "0") ||
            0;
        }

        if (!oldWidthArray[i]) {
          oldWidthArray[i] = parseInt(
            obj.cols[columnIndex].colElement.getAttribute("width") || "0"
          );
        }
        const w = Array.isArray(width) && width[i] ? width[i] : width;
        obj.cols[columnIndex].colElement.setAttribute("width", w);

        if (!obj.options.columns) {
          obj.options.columns = [];
        }

        if (!obj.options.columns[columnIndex]) {
          obj.options.columns[columnIndex] = {};
        }

        obj.options.columns[columnIndex].width = w;
      }

      finalOldWidth = oldWidthArray;
    } else {
      const columnIndex =
        typeof column === "number"
          ? column
          : parseInt(column.getAttribute("data-x") || "0");

      // Oldwidth
      if (!oldWidth) {
        oldWidth = parseInt(
          obj.cols[columnIndex].colElement.getAttribute("width") || "0"
        );
      }
      // Set width
      obj.cols[columnIndex].colElement.setAttribute("width", String(width));

      if (!obj.options.columns) {
        obj.options.columns = [];
      }

      if (!obj.options.columns[columnIndex]) {
        obj.options.columns[columnIndex] = {};
      }

      obj.options.columns[columnIndex].width = width;
    }

    // Keeping history of changes
    const historyColumn = Array.isArray(column)
      ? (typeof column[0] === 'number' ? column[0] : 0)
      : (typeof column === 'number' ? column : 0);
    const historyOldValue = Array.isArray(finalOldWidth) ? finalOldWidth[0] : finalOldWidth;
    setHistory.call(obj, {
      action: "setWidth",
      column: historyColumn,
      oldValue: historyOldValue,
      newValue: width,
    });

    // On resize column
    dispatch.call(obj, "onresizecolumn", obj, column, width, finalOldWidth);

    // Update corner position: support being called with either a
    // SpreadsheetContext (has worksheets) or a WorksheetInstance (has parent)
    if ("worksheets" in obj && obj.worksheets && obj.worksheets[0]) {
      updateCornerPosition.call(obj.worksheets[0]);
    } else {
      const maybeParent = (obj as import("../types/core").WorksheetInstance).parent;
      if (maybeParent && maybeParent.worksheets && maybeParent.worksheets[0]) {
        updateCornerPosition.call(maybeParent.worksheets[0]);
      }
    }
  }
};

/**
 * Show column
 */
export const showColumn = function (
  this: import("../types/core").SpreadsheetContext,
  colNumber: number | number[]
): void {
  const obj = this;

  if (!Array.isArray(colNumber)) {
    colNumber = [colNumber];
  }

  for (let i = 0; i < colNumber.length; i++) {
    const columnIndex = colNumber[i];

    obj.headers[columnIndex].style.display = "";
    obj.cols[columnIndex].colElement.style.display = "";
    if (obj.filter && obj.filter.children.length > columnIndex + 1) {
      (obj.filter.children[columnIndex + 1] as HTMLElement).style.display = "";
    }
    for (let j = 0; j < (obj.options.data?.length || 0); j++) {
      obj.records[j][columnIndex].element.style.display = "";
    }
  }

  // Update footers
  if (obj.options.footers) {
    setFooter.call(obj);
  }

  obj.resetSelection?.();
};

/**
 * Hide column
 */
export const hideColumn = function (
  this: import("../types/core").SpreadsheetContext,
  colNumber: number | number[]
): void {
  const obj = this;

  if (!Array.isArray(colNumber)) {
    colNumber = [colNumber];
  }

  for (let i = 0; i < colNumber.length; i++) {
    const columnIndex = colNumber[i];

    obj.headers[columnIndex].style.display = "none";
    obj.cols[columnIndex].colElement.style.display = "none";
    if (obj.filter && obj.filter.children.length > columnIndex + 1) {
      (obj.filter.children[columnIndex + 1] as HTMLElement).style.display =
        "none";
    }
    for (let j = 0; j < (obj.options.data?.length || 0); j++) {
      obj.records[j][columnIndex].element.style.display = "none";
    }
  }

  // Update footers
  if (obj.options.footers) {
    setFooter.call(obj);
  }

  obj.resetSelection?.();
};

/**
 * Get a column data by columnNumber
 */
export const getColumnData = function (
  this: import("../types/core").SpreadsheetContext,
  columnNumber: number,
  processed?: boolean
): (string | number | boolean | null)[] {
  const obj = this;

  const dataset = [];
  // Go through the rows to get the data
  for (let j = 0; j < (obj.options.data?.length || 0); j++) {
    if (processed) {
      dataset.push(obj.records[j][columnNumber].element.innerHTML);
    } else {
      const cellValue = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[j]))
        ? (obj.options.data[j] as CellValue[])[columnNumber]
        : undefined;
      dataset.push(cellValue);
    }
  }
  return dataset.filter(
    (item): item is string | number | boolean | null => item !== undefined
  );
};

/**
 * Set a column data by colNumber
 */
export const setColumnData = function (
  this: import("../types/core").SpreadsheetContext,
  colNumber: number,
  data: (string | number | boolean | null)[],
  force?: boolean
): void {
  const obj = this;

  for (let j = 0; j < obj.rows.length; j++) {
    // Update cell
    const columnName = getColumnNameFromId([colNumber, j]);
    // Set value
    if (data[j] != null) {
      obj.setValue?.(columnName, data[j], force);
    }
  }
};
