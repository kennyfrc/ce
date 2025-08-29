import { createRow } from "./rows";
import { updateCell, updateFormulaChain, updateTable } from "./internal";
import { getIdFromColumnName } from "./internalHelpers";
import dispatch from "./dispatch";
import { setHistory } from "./history";
import { updatePagination } from "./pagination";
import { setMerge } from "./merges";
import { getCoordsFromRange } from "./helpers";
import type { SpreadsheetContext, CellValue } from "../types/core";

export const setData = function (this: SpreadsheetContext, data?: CellValue[][]) {
  const obj = this;

  // Local aliases and defaults to satisfy strict checks
  const columns = obj.options.columns ?? [];

  // Update data
  if (data) {
    obj.options.data = data;
  }

  // Data
  if (!obj.options.data) {
    obj.options.data = [];
  }

  // Prepare data: support both array-of-arrays and array-of-objects
  if (obj.options.data && obj.options.data[0]) {
    if (!Array.isArray(obj.options.data[0])) {
      data = [];
      for (let j = 0; j < obj.options.data.length; j++) {
        const row: CellValue[] = [];
        const rowObj = obj.options.data[j] as Record<string, CellValue>;
        for (let i = 0; i < columns.length; i++) {
          const key = columns[i]?.name ?? String(i);
          row[i] = rowObj[key];
        }
        data.push(row);
      }

      obj.options.data = data;
    }
  }

  // Adjust minimal dimensions
  let j = 0;
  let i = 0;
  const size_i = columns.length;
  const size_j = obj.options.data.length;
  const minDims = obj.options.minDimensions ?? [0, 0];
  const min_i = minDims[0];
  const min_j = minDims[1];
  const max_i = min_i > size_i ? min_i : size_i;
  const max_j = min_j > size_j ? min_j : size_j;

  for (j = 0; j < max_j; j++) {
    if (!obj.options.data[j]) {
      obj.options.data[j] = [];
    }
    const row = obj.options.data[j];
    if (Array.isArray(row)) {
      const arr = row as CellValue[];
      for (i = 0; i < max_i; i++) {
        if (arr[i] == undefined) {
          arr[i] = "";
        }
      }
    } else {
      const rowObj = row as Record<string, CellValue>;
      for (i = 0; i < max_i; i++) {
        const key = columns[i]?.name ?? String(i);
        if (rowObj[key] == undefined) {
          rowObj[key] = "";
        }
      }
    }
  }

  // Reset containers
  obj.rows = [];
  obj.results = null;
  obj.records = [];
  obj.history = [];

  // Reset internal controllers
  obj.historyIndex = -1;

  // Reset data
  obj.tbody.innerHTML = "";

  let startNumber;
  let finalNumber;

  // Lazy loading
  if (obj.options.lazyLoading == true) {
    // Load only 100 records
    startNumber = 0;
    finalNumber = obj.options.data.length < 100 ? obj.options.data.length : 100;

    if (obj.options.pagination) {
      obj.options.pagination = false;
      console.error(
        "Jspreadsheet: Pagination will be disable due the lazyLoading"
      );
    }
  } else if (obj.options.pagination) {
    // Pagination
    if (!obj.pageNumber) {
      obj.pageNumber = 0;
    }
    var quantityPerPage = obj.options.pagination as number;
    startNumber = (obj.options.pagination as number) * obj.pageNumber;
    finalNumber =
      (obj.options.pagination as number) * obj.pageNumber + (obj.options.pagination as number);

    if (obj.options.data.length < finalNumber) {
      finalNumber = obj.options.data.length;
    }
  } else {
    startNumber = 0;
    finalNumber = obj.options.data.length;
  }

  // Append nodes to the HTML
  for (j = 0; j < obj.options.data.length; j++) {
    const rawRow = obj.options.data[j];
    const rowData: CellValue[] = Array.isArray(rawRow)
      ? (rawRow as CellValue[])
      : (obj.options.columns ?? []).map((col, idx) =>
          (rawRow as Record<string, CellValue>)[col?.name ?? String(idx)]
        );
    const row = createRow.call(obj, j, rowData);
    if (j >= startNumber && j < finalNumber) {
      obj.tbody.appendChild(row.element);
    }
  }

  if (obj.options.lazyLoading == true) {
    // Do not create pagination with lazyloading activated
  } else if (obj.options.pagination) {
    updatePagination.call(obj);
  }

  // Merge cells
  if (obj.options.mergeCells) {
    const mergeCells = obj.options.mergeCells as Record<string, [number, number] | false>;
    const keys = Object.keys(mergeCells);
    for (let i = 0; i < keys.length; i++) {
      const num = mergeCells[keys[i]];
      if (Array.isArray(num)) {
        setMerge.call(obj, keys[i], num[0], num[1], true);
      }
    }
  }

  // Updata table with custom configurations if applicable
  updateTable.call(obj);
};

/**
 * Get the value from a cell
 *
 * @param object cell
 * @return string value
 */
export const getValue = function (this: SpreadsheetContext, cell: string, processedValue?: boolean) {
  const obj = this;

  let x;
  let y;

  if (typeof cell !== "string") {
    return null;
  }

  const columnId = getIdFromColumnName(cell, true);
  x = columnId[0] as number;
  y = columnId[1] as number;

  let value = null;

  if (x != null && y != null) {
    if (obj.records[y] && obj.records[y][x] && processedValue) {
      value = obj.records[y][x].element.innerHTML;
    } else {
      const data = obj.options.data;
      if (data && data[y] !== undefined) {
        const row = data[y];
        if (Array.isArray(row)) {
          if (row[x] !== undefined) {
            value = row[x];
          }
        } else {
          const rowObj = row as Record<string, CellValue>;
          const key = (obj.options.columns ?? [])[x]?.name ?? String(x);
          if (key in rowObj) {
            value = rowObj[key];
          }
        }
      }
    }
  }

  return value;
};

/**
 * Get the value from a coords
 *
 * @param int x
 * @param int y
 * @return string value
 */
export const getValueFromCoords = function (
  this: SpreadsheetContext,
  x: number,
  y: number,
  processedValue?: boolean
) {
  const obj = this;

  let value = null;

  if (x != null && y != null) {
    if (obj.records[y] && obj.records[y][x] && processedValue) {
      value = obj.records[y][x].element.innerHTML;
    } else {
      const data = obj.options.data;
      if (data && data[y] !== undefined) {
        const row = data[y];
        if (Array.isArray(row)) {
          if (row[x] !== undefined) {
            value = row[x];
          }
        } else {
          const rowObj = row as Record<string, CellValue>;
          const key = (obj.options.columns ?? [])[x]?.name ?? String(x);
          if (key in rowObj) {
            value = rowObj[key];
          }
        }
      }
    }
  }

  return value;
};

/**
 * Set a cell value
 *
 * @param mixed cell destination cell
 * @param string value value
 * @return void
 */
export const setValue = function (
  this: SpreadsheetContext,
  cell: string | HTMLElement[] | Array<{ element: HTMLElement }>,
  value: CellValue,
  force?: boolean
) {
  const obj = this;

  const records = [];

  if (typeof cell == "string") {
    const columnId = getIdFromColumnName(cell, true);
    if (Array.isArray(columnId) && columnId.length >= 2) {
      const x = columnId[0] as number;
      const y = columnId[1] as number;

      // Update cell
      records.push(updateCell.call(obj, x, y, value, force));

      // Update all formulas in the chain
      updateFormulaChain.call(obj, x, y, records);
    }
  } else {
    // Single HTMLElement passed (non-array)
    if (!Array.isArray(cell) && (cell as unknown as HTMLElement)?.getAttribute) {
      const el = cell as unknown as HTMLElement;
      const xVal = parseInt(el.getAttribute("data-x") || "", 10);
      const yVal = parseInt(el.getAttribute("data-y") || "", 10);
      if (!isNaN(xVal) && !isNaN(yVal)) {
        records.push(updateCell.call(obj, xVal, yVal, value, force));
        updateFormulaChain.call(obj, xVal, yVal, records);
      }
    } else {
      const items: (HTMLElement | { element: HTMLElement } | unknown)[] = Array.isArray(cell)
        ? cell
        : Object.keys(cell as Record<string, unknown>).map((k) => (cell as Record<string, unknown>)[k]);

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        let xi: number | null = null;
        let yi: number | null = null;

        if (typeof item === "string") {
          const columnId = getIdFromColumnName(item, true);
          xi = columnId[0] as number;
          yi = columnId[1] as number;
        } else if (item && typeof item === "object") {
          if ("x" in item && "y" in item) {
            xi = Number((item as { x: unknown }).x);
            yi = Number((item as { y: unknown }).y);
            if ("value" in item) value = (item as { value: unknown }).value as CellValue;
          } else {
            const el =
              "element" in item && item.element && (item.element as HTMLElement).getAttribute
                ? (item.element as HTMLElement)
                : (item as HTMLElement);
            xi = parseInt(el.getAttribute("data-x") || "", 10);
            yi = parseInt(el.getAttribute("data-y") || "", 10);
          }
        }

        if (xi != null && yi != null && !isNaN(xi) && !isNaN(yi)) {
          records.push(updateCell.call(obj, xi, yi, value, force));
          updateFormulaChain.call(obj, xi, yi, records);
        }
      }
    }
  }

  // Update history
  setHistory.call(obj, {
    action: "setValue",
    records: records,
    selection: obj.selectedCell,
  });

  // Update table with custom configurations if applicable
  updateTable.call(obj);

  // On after changes
  const onafterchangesRecords = records.map(function (record) {
    return {
      x: record.x,
      y: record.y,
      value: record.value ?? "",
      oldValue: record.oldValue ?? "",
    };
  });

  dispatch.call(obj, "onafterchanges", obj, onafterchangesRecords);
};

/**
 * Set a cell value based on coordinates
 *
 * @param int x destination cell
 * @param int y destination cell
 * @param string value
 * @return void
 */
export const setValueFromCoords = function (
  this: SpreadsheetContext,
  x: number,
  y: number,
  value: CellValue,
  force?: boolean
) {
  const obj = this;

  const records = [];
  records.push(updateCell.call(obj, x, y, value, force));

  // Update all formulas in the chain
  updateFormulaChain.call(obj, x, y, records);

  // Update history
  setHistory.call(obj, {
    action: "setValue",
    records: records,
    selection: obj.selectedCell,
  });

  // Update table with custom configurations if applicable
  updateTable.call(obj);

  // On after changes
  const onafterchangesRecords = records.map(function (record) {
    return {
      x: record.x,
      y: record.y,
      value: record.value ?? "",
      oldValue: record.oldValue ?? "",
    };
  });

  dispatch.call(obj, "onafterchanges", obj, onafterchangesRecords);
};

/**
 * Get the whole table data
 *
 * @param bool get highlighted cells only
 * @return array data
 */
export const getData = function (
  this: SpreadsheetContext,
  highlighted: boolean,
  processed: boolean,
  delimiter?: string,
  asJson?: boolean
) {
  const obj = this;

  // Control vars
  const dataset: CellValue[][] = [];
  let px = 0;
  let py = 0;

  // Column and row length
  const columnsLen = obj.options.columns ? obj.options.columns.length : 0;
  const data = obj.options.data ?? [];
  const x = Math.max(
    0,
    ...data.map(function (row) {
      return Array.isArray(row) ? (row as CellValue[]).length : columnsLen;
    })
  );
  const y = data.length;

  // Go through the columns to get the data
  for (let j = 0; j < y; j++) {
    px = 0;
    for (let i = 0; i < x; i++) {
      // Cell selected or fullset
      if (
        !highlighted ||
        obj.records[j][i].element.classList.contains("highlight")
      ) {
        // Get value
        if (!dataset[py]) {
          dataset[py] = [];
        }
        if (processed) {
          dataset[py][px] = obj.records[j][i].element.innerHTML;
        } else {
          const data = obj.options.data ?? [];
          const rawRow = data[j];
          if (rawRow !== undefined) {
            if (Array.isArray(rawRow)) {
              dataset[py][px] = (rawRow as CellValue[])[i] ?? "";
            } else {
              const columns = obj.options.columns ?? [];
              const key = columns[i]?.name ?? String(i);
              dataset[py][px] = (rawRow as Record<string, CellValue>)[key] ?? "";
            }
          } else {
            dataset[py][px] = "";
          }
        }
        px++;
      }
    }
    if (px > 0) {
      py++;
    }
  }

  if (delimiter) {
    return (
      dataset
        .map(function (row) {
          return row.map(cell => String(cell ?? "")).join(delimiter);
        })
        .join("\r\n") + "\r\n"
    );
  }

  if (asJson) {
    return dataset.map(function (row) {
      const resultRow: Record<number, CellValue> = {};

      row.forEach(function (item, index) {
        resultRow[index] = item;
      });

      return resultRow;
    });
  }

  return dataset;
};

export const getDataFromRange = function (
  this: SpreadsheetContext,
  range: string,
  processed: boolean
) {
  const obj = this;

  const coords = getCoordsFromRange(range);

  const dataset: CellValue[][] = [];

  for (let y = coords[1]; y <= coords[3]; y++) {
    dataset.push([]);

    for (let x = coords[0]; x <= coords[2]; x++) {
      if (processed) {
        dataset[dataset.length - 1].push(obj.records[y][x].element.innerHTML);
      } else {
        const data = obj.options.data ?? [];
        const rawRow = data[y];
        if (rawRow !== undefined) {
          if (Array.isArray(rawRow)) {
            dataset[dataset.length - 1].push((rawRow as CellValue[])[x] ?? "");
          } else {
            const columns = obj.options.columns ?? [];
            const key = columns[x]?.name ?? String(x);
            dataset[dataset.length - 1].push((rawRow as Record<string, CellValue>)[key] ?? "");
          }
        } else {
          dataset[dataset.length - 1].push("");
        }
      }
    }
  }

  return dataset;
};
