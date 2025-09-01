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
  // Worksheet instance: when this function is called on the spreadsheet
  // context the real worksheet instance is obj.worksheets[0]. When it's
  // called on a worksheet instance, `obj` is already the worksheet. Use
  // `worksheet` for operations that require a WorksheetInstance `this`.
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

  // Configuration
  if (worksheet.options.allowInsertColumn != false) {
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
    if (worksheet.options.data) {
      for (const row of worksheet.options.data) {
        const len = Array.isArray(row) ? row.length : Object.keys(row).length;
        if (len > maxFromData) maxFromData = len;
      }
    }
    const currentNumOfColumns = Math.max(worksheet.options.columns?.length || 0, maxFromData);

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
      worksheet.options.mergeCells &&
      Object.keys(worksheet.options.mergeCells).length > 0
    ) {
      if (isColMerged.call(worksheet, columnNumber, insertBefore).length) {
        if (
          !confirm(
            jSuites.translate(
              "This action will destroy any existing merged cells. Are you sure?"
            )
          )
        ) {
          return false;
        } else {
          worksheet.destroyMerge?.();
        }
      }
    }

    // Insert before
    const columnIndex = !insertBefore ? columnNumber + 1 : columnNumber;
    worksheet.options.columns = injectArray(
      worksheet.options.columns || [],
      columnIndex,
      properties
    ) as ColumnDefinition[];

    // Open space in the containers
    const currentHeaders = worksheet.headers.splice(columnIndex);
    const currentColgroup = worksheet.cols.splice(columnIndex);

    // History
    const historyHeaders: HTMLElement[] = [];
    const historyColgroup: Array<{ colElement: HTMLElement }> = [];
    const historyRecords: Array<Array<{ element: HTMLElement; x: number; y: number; oldValue?: CellValue; newValue?: CellValue }>> = [];
    const historyData: CellValue[][] = [];
    const historyFooters: string[][] = [];

    // Add new headers
    for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
      createCellHeader.call(worksheet, col);
      worksheet.headerContainer?.insertBefore(
        worksheet.headers[col],
        worksheet.headerContainer.children[col + 1]
      );
      worksheet.colgroupContainer?.insertBefore(
        worksheet.cols[col].colElement,
        worksheet.colgroupContainer.children[col + 1]
      );

      historyHeaders.push(worksheet.headers[col]);
      historyColgroup.push(worksheet.cols[col]);
    }

    // Add new footer cells
    if (worksheet.options.footers) {
      for (let j = 0; j < worksheet.options.footers.length; j++) {
        historyFooters[j] = [];
        for (let i = 0; i < numOfColumns; i++) {
          historyFooters[j].push("");
        }
        worksheet.options.footers[j].splice(columnIndex, 0, ...historyFooters[j]);
      }
    }

    // Adding visual columns
    for (let row = 0; row < (worksheet.options.data?.length || 0); row++) {
      // Keep the current data
      const currentData = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row]))
        ? (worksheet.options.data[row] as CellValue[]).splice(columnIndex)
        : [];
      const currentRecord = worksheet.records[row].splice(columnIndex);

      // History
      historyData[row] = [];
      historyRecords[row] = [];

      for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
        // New value
        const value = data[row] ? data[row] : "";
        if (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row])) {
          (worksheet.options.data[row] as CellValue[])[col] = value;
        }
        // New cell
        const cellValue = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row]))
          ? (worksheet.options.data[row] as CellValue[])[col] ?? ""
          : "";
        const td = createCell.call(worksheet, col, row, cellValue);
        worksheet.records[row][col] = {
          element: td,
          x: col,
          y: row,
        };
        // Add cell to the row
        if (worksheet.rows[row]) {
          worksheet.rows[row].element.insertBefore(
            td,
            worksheet.rows[row].element.children[col + 1]
          );
        }

        if (
          worksheet.options.columns &&
          worksheet.options.columns[col] &&
          typeof (worksheet.options.columns[col] as ColumnDefinition).render ===
            "function"
        ) {
          ((worksheet.options.columns[col] as ColumnDefinition).render as Function)?.(
            td,
            value,
            col.toString(),
            row.toString(),
            worksheet,
            worksheet.options.columns[col] as ColumnDefinition
          );
        }

        // Record History
        historyData[row].push(value);
        historyRecords[row].push({ element: td, x: col, y: row });
      }

      // Copy the data back to the main data
      if (worksheet.options.data && worksheet.options.data[row]) {
        Array.prototype.push.apply(worksheet.options.data[row], currentData);
      }
      Array.prototype.push.apply(worksheet.records[row], currentRecord);
    }

    Array.prototype.push.apply(worksheet.headers, currentHeaders);
    Array.prototype.push.apply(worksheet.cols, currentColgroup);

    for (let i = columnIndex; i < worksheet.cols.length; i++) {
      worksheet.cols[i].x = i;
    }

    for (let j = 0; j < worksheet.records.length; j++) {
      for (let i = 0; i < worksheet.records[j].length; i++) {
        worksheet.records[j][i].x = i;
      }
    }

    // Adjust nested headers
    if (
      worksheet.options.nestedHeaders &&
      worksheet.options.nestedHeaders.length > 0 &&
      worksheet.options.nestedHeaders[0] &&
      worksheet.options.nestedHeaders[0][0]
    ) {
      for (let j = 0; j < worksheet.options.nestedHeaders.length; j++) {
        const colspan =
          parseInt(
            (
              worksheet.options.nestedHeaders[j][
                worksheet.options.nestedHeaders[j].length - 1
              ].colspan || "1"
            ).toString()
          ) + numOfColumns;
        worksheet.options.nestedHeaders[j][
          worksheet.options.nestedHeaders[j].length - 1
        ].colspan = colspan;
        worksheet.thead?.children[j]?.children[
          worksheet.thead.children[j].children.length - 1
        ]?.setAttribute("colspan", colspan.toString());
        const dataColumn =
          worksheet.thead?.children[j]?.children[
            worksheet.thead.children[j].children.length - 1
          ]?.getAttribute("data-column");
        let oArray = dataColumn?.split(",") || [];
        for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
          oArray.push(col.toString());
        }
        worksheet.thead?.children[j]?.children[
          worksheet.thead.children[j].children.length - 1
        ]?.setAttribute("data-column", oArray.join(","));
      }
    }

    // Keep history
    setHistory.call(worksheet, {
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

    // Update table references on the worksheet instance
    updateTableReferences.call(worksheet);

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
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;
  let insertBefore: boolean;
  if (o > d) {
    insertBefore = true;
  } else {
    insertBefore = false;
  }

    if (
      isColMerged.call(worksheet, o).length ||
      isColMerged.call(worksheet, d, !!insertBefore).length
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
      worksheet.destroyMerge?.();
    }
  }

  // o and d are already numbers, no need for parseInt

  if (o > d) {
    worksheet.headerContainer?.insertBefore(worksheet.headers[o], worksheet.headers[d]);
    worksheet.colgroupContainer?.insertBefore(
      worksheet.cols[o].colElement,
      worksheet.cols[d].colElement
    );

    for (let j = 0; j < worksheet.rows.length; j++) {
      worksheet.rows[j].element.insertBefore(
        worksheet.records[j][o].element,
        worksheet.records[j][d].element
      );
    }
  } else {
    worksheet.headerContainer?.insertBefore(
      worksheet.headers[o],
      worksheet.headers[d].nextSibling
    );
    worksheet.colgroupContainer?.insertBefore(
      worksheet.cols[o].colElement,
      worksheet.cols[d].colElement.nextSibling
    );

    for (let j = 0; j < worksheet.rows.length; j++) {
      worksheet.rows[j].element.insertBefore(
        worksheet.records[j][o].element,
        worksheet.records[j][d].element.nextSibling
      );
    }
  }

  worksheet.options.columns?.splice(d, 0, worksheet.options.columns.splice(o, 1)[0]);
  worksheet.headers.splice(d, 0, worksheet.headers.splice(o, 1)[0]);
  worksheet.cols.splice(d, 0, worksheet.cols.splice(o, 1)[0]);

  const firstAffectedIndex = Math.min(o, d);
  const lastAffectedIndex = Math.max(o, d);

  for (let j = 0; j < worksheet.rows.length; j++) {
    if (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[j])) {
      const movedValue = (worksheet.options.data[j] as CellValue[]).splice(o, 1)[0];
      (worksheet.options.data[j] as CellValue[]).splice(d, 0, movedValue);
    }
    worksheet.records[j].splice(d, 0, worksheet.records[j].splice(o, 1)[0]);
  }

  for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
    worksheet.cols[i].x = i;
  }

  for (let j = 0; j < worksheet.records.length; j++) {
    for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
      worksheet.records[j][i].x = i;
    }
  }

  // Update footers position
  if (worksheet.options.footers) {
    for (let j = 0; j < worksheet.options.footers.length; j++) {
      worksheet.options.footers[j].splice(
        d,
        0,
        worksheet.options.footers[j].splice(o, 1)[0]
      );
    }
  }

  // Keeping history of changes
  setHistory.call(worksheet, {
    action: "moveColumn",
    oldValue: o,
    newValue: d,
  });

  // Update table references on the worksheet instance
  updateTableReferences.call(worksheet);

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
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

  // Global Configuration
  if (worksheet.options.allowDeleteColumn != false) {
    if (worksheet.headers.length > 1) {
      // Delete column definitions
      if (columnNumber == undefined) {
        const number = worksheet.getSelectedColumns?.(true) || [];

        if (!number.length) {
          // Remove last column
          columnNumber = worksheet.headers.length - 1;
          numOfColumns = 1;
        } else {
          // Remove selected
          columnNumber = number[0] ?? 0;
          numOfColumns = number.length;
        }
      }

      // Last column
      const lastColumn = (worksheet.options.data && Array.isArray(worksheet.options.data) && worksheet.options.data[0] && Array.isArray(worksheet.options.data[0]))
        ? worksheet.options.data[0].length - 1
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
        worksheet.options.data && Array.isArray(worksheet.options.data) && worksheet.options.data[0] && Array.isArray(worksheet.options.data[0]) &&
        numOfColumns > worksheet.options.data[0].length - columnNumber
      ) {
        numOfColumns = worksheet.options.data[0].length - columnNumber;
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
          worksheet.options.mergeCells &&
          Object.keys(worksheet.options.mergeCells).length > 0
        ) {
          for (
            let col = columnNumber;
            col < columnNumber + numOfColumns;
            col++
          ) {
            if (isColMerged.call(worksheet, col, undefined).length) {
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
            worksheet.destroyMerge?.();
          }
        }

        // Delete the column properties
        const columns = worksheet.options.columns
          ? worksheet.options.columns.splice(columnNumber, numOfColumns)
          : undefined;

        for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
          worksheet.cols[col].colElement.className = "";
          worksheet.headers[col].className = "";
          worksheet.cols[col].colElement.parentNode?.removeChild(
            worksheet.cols[col].colElement
          );
          worksheet.headers[col].parentNode?.removeChild(worksheet.headers[col]);
        }

        const historyHeaders = worksheet.headers.splice(columnNumber, numOfColumns);
        const historyColgroup = worksheet.cols.splice(columnNumber, numOfColumns);
        const historyRecords = [];
        const historyData = [];
        const historyFooters = [];

        for (let row = 0; row < (worksheet.options.data?.length || 0); row++) {
          for (
            let col = columnNumber;
            col < columnNumber + numOfColumns;
            col++
          ) {
            worksheet.records[row][col].element.className = "";
            worksheet.records[row][col].element.parentNode?.removeChild(
              worksheet.records[row][col].element
            );
          }
        }

        // Delete headers
        for (let row = 0; row < (worksheet.options.data?.length || 0); row++) {
          // History
          historyData[row] = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row]))
            ? (worksheet.options.data[row] as CellValue[]).splice(columnNumber, numOfColumns)
            : [];
          historyRecords[row] = worksheet.records[row].splice(
            columnNumber,
            numOfColumns
          );
        }

        for (let i = columnNumber; i < worksheet.cols.length; i++) {
          worksheet.cols[i].x = i;
        }

        for (let j = 0; j < worksheet.records.length; j++) {
          for (let i = columnNumber; i < worksheet.records[j].length; i++) {
            worksheet.records[j][i].x = i;
          }
        }

        // Delete footers
        if (worksheet.options.footers) {
          for (let row = 0; row < worksheet.options.footers.length; row++) {
            historyFooters[row] = worksheet.options.footers[row].splice(
              columnNumber,
              numOfColumns
            );
          }
        }

        // Remove selection
        conditionalSelectionUpdate.call(
          worksheet,
          0,
          columnNumber,
          columnNumber + numOfColumns - 1
        );

        // Adjust nested headers
        if (
          worksheet.options.nestedHeaders &&
          worksheet.options.nestedHeaders.length > 0 &&
          worksheet.options.nestedHeaders[0] &&
          worksheet.options.nestedHeaders[0][0]
        ) {
          for (let j = 0; j < worksheet.options.nestedHeaders.length; j++) {
            const colspan =
              parseInt(
                String(
                  worksheet.options.nestedHeaders[j]?.[
                    worksheet.options.nestedHeaders[j].length - 1
                  ]?.colspan || "1"
                )
              ) - numOfColumns;
            worksheet.options.nestedHeaders[j][
              worksheet.options.nestedHeaders[j].length - 1
            ].colspan = colspan;
            worksheet.thead?.children[j]?.children[
              worksheet.thead.children[j].children.length - 1
            ]?.setAttribute("colspan", String(colspan));
          }
        }

        // Keeping history of changes
        setHistory.call(worksheet, {
          action: "deleteColumn",
          columnNumber: columnNumber,
          numOfColumns: numOfColumns,
          insertBefore: true,
          columns: columns,
          headers: historyHeaders,
          cols: historyColgroup,
          records: historyRecords,
          footers: historyFooters,
          data: historyData,
        });



        // Update table references on the worksheet instance
        updateTableReferences.call(worksheet);

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
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

  let data;

  if (typeof column === "undefined") {
    // Get all headers
    data = [];
    for (let i = 0; i < worksheet.headers.length; i++) {
      data.push(
        Number(
          (worksheet.options.columns &&
            worksheet.options.columns[i] &&
            worksheet.options.columns[i].width) ||
            worksheet.options.defaultColWidth ||
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
      worksheet.cols[columnIndex].colElement.getAttribute("width") || "0"
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
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

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
            worksheet.cols[columnIndex].colElement.getAttribute("width") || "0"
          );
        }
        const w = Array.isArray(width) && width[i] ? width[i] : width;
        worksheet.cols[columnIndex].colElement.setAttribute("width", w);

        if (!worksheet.options.columns) {
          worksheet.options.columns = [];
        }

        if (!worksheet.options.columns[columnIndex]) {
          worksheet.options.columns[columnIndex] = {};
        }

        worksheet.options.columns[columnIndex].width = w;
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
          worksheet.cols[columnIndex].colElement.getAttribute("width") || "0"
        );
      }
      // Set width
      worksheet.cols[columnIndex].colElement.setAttribute("width", String(width));

      if (!worksheet.options.columns) {
        worksheet.options.columns = [];
      }

      if (!worksheet.options.columns[columnIndex]) {
        worksheet.options.columns[columnIndex] = {};
      }

      worksheet.options.columns[columnIndex].width = width;
    }

    // Keeping history of changes
    const historyColumn = Array.isArray(column)
      ? (typeof column[0] === 'number' ? column[0] : 0)
      : (typeof column === 'number' ? column : 0);
    const historyOldValue = Array.isArray(finalOldWidth) ? finalOldWidth[0] : finalOldWidth;
    setHistory.call(worksheet, {
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
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

  if (!Array.isArray(colNumber)) {
    colNumber = [colNumber];
  }

  for (let i = 0; i < colNumber.length; i++) {
    const columnIndex = colNumber[i];

    worksheet.headers[columnIndex].style.display = "";
    worksheet.cols[columnIndex].colElement.style.display = "";
    if (worksheet.filter && worksheet.filter.children.length > columnIndex + 1) {
      (worksheet.filter.children[columnIndex + 1] as HTMLElement).style.display = "";
    }
    for (let j = 0; j < (worksheet.options.data?.length || 0); j++) {
      worksheet.records[j][columnIndex].element.style.display = "";
    }
  }

  // Update footers
  if (worksheet.options.footers) {
    setFooter.call(worksheet);
  }

  worksheet.resetSelection?.();
};

/**
 * Hide column
 */
export const hideColumn = function (
  this: import("../types/core").SpreadsheetContext,
  colNumber: number | number[]
): void {
  const obj = this;
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

  if (!Array.isArray(colNumber)) {
    colNumber = [colNumber];
  }

  for (let i = 0; i < colNumber.length; i++) {
    const columnIndex = colNumber[i];

    worksheet.headers[columnIndex].style.display = "none";
    worksheet.cols[columnIndex].colElement.style.display = "none";
    if (worksheet.filter && worksheet.filter.children.length > columnIndex + 1) {
      (worksheet.filter.children[columnIndex + 1] as HTMLElement).style.display =
        "none";
    }
    for (let j = 0; j < (worksheet.options.data?.length || 0); j++) {
      worksheet.records[j][columnIndex].element.style.display = "none";
    }
  }

  // Update footers
  if (worksheet.options.footers) {
    setFooter.call(worksheet);
  }

  worksheet.resetSelection?.();
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
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

  const dataset = [];
  // Go through the rows to get the data
  for (let j = 0; j < (worksheet.options.data?.length || 0); j++) {
    if (processed) {
      dataset.push(worksheet.records[j][columnNumber].element.innerHTML);
    } else {
      const cellValue = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[j]))
        ? (worksheet.options.data[j] as CellValue[])[columnNumber]
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
  const worksheet: import("../types/core").WorksheetInstance = (obj as any).worksheets?.[0] || obj;

  for (let j = 0; j < worksheet.rows.length; j++) {
    // Update cell
    const columnName = getColumnNameFromId([colNumber, j]);
    // Set value
    if (data[j] != null) {
      worksheet.setValue?.(columnName, data[j], force);
    }
  }
};
