import jSuites from "jsuites";

import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers";
import { updateCell } from "./internal";
import { setHistory } from "./history";
import dispatch from "./dispatch";
import { updateSelection } from "./selection";
import type { WorksheetInstance, CellValue } from "../types/core";

/**
 * Is column merged
 */
export const isColMerged = function (
  this: WorksheetInstance,
  x: number,
  insertBefore?: boolean
) {
  const obj = this;

  const cols: string[] = [];
  // Remove any merged cells
  if (obj.options.mergeCells) {
    const keys = Object.keys(obj.options.mergeCells);
    for (let i = 0; i < keys.length; i++) {
      const info = getIdFromColumnName(keys[i], true);
      if (typeof info === "string") return cols;
      const mergeInfo = obj.options.mergeCells[keys[i]];
      if (!mergeInfo) continue;
      const colspan = mergeInfo[0];
      const x1 = info[0];
      const x2 = info[0] + (colspan > 1 ? colspan - 1 : 0);

      if (insertBefore == null) {
        if (x1 <= x && x2 >= x) {
          cols.push(keys[i]);
        }
      } else {
        if (insertBefore) {
          if (x1 < x && x2 >= x) {
            cols.push(keys[i]);
          }
        } else {
          if (x1 <= x && x2 > x) {
            cols.push(keys[i]);
          }
        }
      }
    }
  }

  return cols;
};

/**
 * Is rows merged
 */
export const isRowMerged = function (this: WorksheetInstance, y: number, insertBefore?: boolean) {
  const obj = this;

  const rows: string[] = [];
  // Remove any merged cells
  if (obj.options.mergeCells) {
    const keys = Object.keys(obj.options.mergeCells);
    for (let i = 0; i < keys.length; i++) {
      const info = getIdFromColumnName(keys[i], true);
      if (typeof info === "string") return [];
      const mergeInfo = obj.options.mergeCells[keys[i]];
      if (!mergeInfo) continue;
      const rowspan = mergeInfo[1];
      const y1 = info[1];
      const y2 = info[1] + (rowspan > 1 ? rowspan - 1 : 0);

      if (insertBefore == null) {
        if (y1 <= y && y2 >= y) {
          rows.push(keys[i]);
        }
      } else {
        if (insertBefore) {
          if (y1 < y && y2 >= y) {
            rows.push(keys[i]);
          }
        } else {
          if (y1 <= y && y2 > y) {
            rows.push(keys[i]);
          }
        }
      }
    }
  }

  return rows;
};

/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export const getMerge = function (this: WorksheetInstance, cellName?: string) {
  const obj = this;

  if (cellName) {
    if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
      const mergeInfo = obj.options.mergeCells[cellName];
      if (!mergeInfo) return null;
      return [
        mergeInfo[0],
        mergeInfo[1],
      ] as [number, number];
    } else {
      return null;
    }
  } else {
    const data: Record<string, [number, number]> = {};
    if (obj.options.mergeCells) {
      const keys = Object.keys(obj.options.mergeCells);
      for (let i = 0; i < keys.length; i++) {
        const mergeInfo = obj.options.mergeCells[keys[i]];
        if (mergeInfo) {
          data[keys[i]] = [
            mergeInfo[0],
            mergeInfo[1],
          ];
        }
      }
    }
    return data;
  }
};

/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export const setMerge = function (
  this: WorksheetInstance,
  cellName: string | undefined,
  colspan: number | undefined,
  rowspan: number | undefined,
  ignoreHistoryAndEvents?: boolean
): void {
  const obj = this;

  let test: string | boolean = false;

  if (!cellName) {
    if (!obj.highlighted || !obj.highlighted.length) {
      alert(jSuites.translate("No cells selected"));
      return;
    } else {
      const firstHighlighted = obj.highlighted[0];
      const lastHighlighted = obj.highlighted[obj.highlighted.length - 1];
      if (!firstHighlighted || !lastHighlighted) return;
      
      const x1Attr = firstHighlighted.element.getAttribute("data-x");
      const y1Attr = firstHighlighted.element.getAttribute("data-y");
      const x2Attr = lastHighlighted.element.getAttribute("data-x");
      const y2Attr = lastHighlighted.element.getAttribute("data-y");
      
      if (!x1Attr || !y1Attr || !x2Attr || !y2Attr) return;
      
      const x1 = parseInt(x1Attr);
      const y1 = parseInt(y1Attr);
      const x2 = parseInt(x2Attr);
      const y2 = parseInt(y2Attr);
      
      cellName = getColumnNameFromId([x1, y1]);
      colspan = x2 - x1 + 1;
      rowspan = y2 - y1 + 1;
    }
  } else if (typeof cellName !== "string") {
    return;
  }

  const cell = getIdFromColumnName(cellName, true);
  if (typeof cell === "string") return;

  if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
    if (obj.records[cell[1]][cell[0]].element.getAttribute("data-merged")) {
      test = "Cell already merged";
    }
  } else if ((!colspan || colspan < 2) && (!rowspan || rowspan < 2)) {
    test = "Invalid merged properties";
  } else {
    for (let j = cell[1]; j < cell[1] + (rowspan || 0); j++) {
      for (let i = cell[0]; i < cell[0] + (colspan || 0); i++) {
        const columnName = getColumnNameFromId([i, j]);
        if (obj.records[j] && obj.records[j][i] && obj.records[j][i].element.getAttribute("data-merged")) {
          test = "There is a conflict with another merged cell";
        }
      }
    }
  }

  if (test) {
    alert(jSuites.translate(test));
  } else {
    // Add property
    if (colspan && colspan > 1) {
      obj.records[cell[1]][cell[0]].element.setAttribute("colspan", String(colspan));
    } else {
      colspan = 1;
    }
    if (rowspan && rowspan > 1) {
      obj.records[cell[1]][cell[0]].element.setAttribute("rowspan", String(rowspan));
    } else {
      rowspan = 1;
    }
    // Keep links to the existing nodes
    if (!obj.options.mergeCells) {
      obj.options.mergeCells = {};
    }

    obj.options.mergeCells[cellName] = [colspan, rowspan, []];
    // Mark cell as merged
    obj.records[cell[1]][cell[0]].element.setAttribute("data-merged", "true");
    // Overflow
    obj.records[cell[1]][cell[0]].element.style.overflow = "hidden";
    // History data
    const data: CellValue[][] = [];
    // Adjust the nodes
    for (let y = cell[1]; y < cell[1] + rowspan; y++) {
      const rowData: CellValue[] = [];
      for (let x = cell[0]; x < cell[0] + colspan; x++) {
        if (!(cell[0] == x && cell[1] == y)) {
          // Collect data for history
          if (obj.options.data && obj.options.data[y]) {
            if (Array.isArray(obj.options.data[y])) {
              rowData.push((obj.options.data[y] as CellValue[])[x]);
            } else {
              rowData.push((obj.options.data[y] as Record<string, CellValue>)[x]);
            }
          } else {
            rowData.push("");
          }

          // Update cell and handle merge
          updateCell.call(obj, x, y, "", true);
          if (obj.options.mergeCells[cellName] && obj.options.mergeCells[cellName] !== false && obj.records[y] && obj.records[y][x]) {
            (obj.options.mergeCells[cellName] as [number, number, HTMLElement[]])[2].push(obj.records[y][x].element);
            obj.records[y][x].element.style.display = "none";
            obj.records[y][x].element = obj.records[cell[1]][cell[0]].element;
          }
        } else {
          rowData.push("");
        }
      }
      data.push(rowData);
    }

    // In the initialization is not necessary keep the history
    if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
      updateSelection.call(
        obj,
        obj.records[cell[1]][cell[0]].element,
        null
      );
    }

    if (!ignoreHistoryAndEvents) {
      setHistory.call(obj, {
        action: "setMerge",
        column: cellName,
        colspan: colspan,
        rowspan: rowspan,
        data: data,
      });

      dispatch.call(obj, "onmerge", obj, { [cellName]: [colspan, rowspan] });
    }
  }
};

/**
 * Remove merge by cellname
 * @param cellName
 */
export const removeMerge = function (
  this: WorksheetInstance,
  cellName: string,
  data?: CellValue[] | null,
  keepOptions?: boolean
) {
  const obj = this;

  if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
    const cell = getIdFromColumnName(cellName, true);
    if (typeof cell === "string") return;
    if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
      obj.records[cell[1]][cell[0]].element.removeAttribute("colspan");
      obj.records[cell[1]][cell[0]].element.removeAttribute("rowspan");
      obj.records[cell[1]][cell[0]].element.removeAttribute("data-merged");
    }
    const info = obj.options.mergeCells[cellName];
    if (!info) return;

    let index = 0;

    let j = 0,
      i = 0;

    for (j = 0; j < info[1]; j++) {
      for (i = 0; i < info[0]; i++) {
        if (j > 0 || i > 0) {
          if (info[2] && info[2][index]) {
            if (obj.records[cell[1] + j] && obj.records[cell[1] + j][cell[0] + i]) {
              obj.records[cell[1] + j][cell[0] + i].element = info[2][index];
              obj.records[cell[1] + j][cell[0] + i].element.style.display = "";
              // Recover data
              if (data && data[index]) {
                updateCell.call(obj, cell[0] + i, cell[1] + j, data[index]);
              }
            }
          }
          index++;
        }
      }
    }

    // Update selection
    updateSelection.call(
      obj,
      obj.records[cell[1]][cell[0]].element,
      obj.records[cell[1] + j - 1][cell[0] + i - 1].element,
      undefined
    );

    if (!keepOptions) {
      delete obj.options.mergeCells[cellName];
    }
  }
};

/**
 * Remove all merged cells
 */
export const destroyMerge = function (this: WorksheetInstance, keepOptions?: boolean) {
  const obj = this;

  // Remove any merged cells
  if (obj.options.mergeCells) {
    const keys = Object.keys(obj.options.mergeCells);
    for (let i = 0; i < keys.length; i++) {
      removeMerge.call(obj, keys[i], null, keepOptions);
    }
  }
};
