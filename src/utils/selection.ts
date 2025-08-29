import dispatch from "./dispatch";
import { getFreezeWidth } from "./freeze";
import { getCellNameFromCoords } from "./helpers";
import { setHistory } from "./history";
import {
  updateCell,
  updateFormula,
  updateFormulaChain,
  updateTable,
} from "./internal";
import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers";
import { updateToolbar } from "./toolbar";
import { WorksheetInstance } from "../types/core";

export const updateCornerPosition = function (this: WorksheetInstance): void {
  const obj = this;

  // If any selected cells
  if (!obj.highlighted || !obj.highlighted.length) {
    obj.corner.style.top = "-2000px";
    obj.corner.style.left = "-2000px";
  } else {
    // Get last cell
    const last = obj.highlighted[obj.highlighted.length - 1].element;
    const lastX = parseInt(last.getAttribute("data-x") || "0");

    const contentRect = obj.content.getBoundingClientRect();
    const x1 = contentRect.left;
    const y1 = contentRect.top;

    const lastRect = last.getBoundingClientRect();
    const x2 = lastRect.left;
    const y2 = lastRect.top;
    const w2 = lastRect.width;
    const h2 = lastRect.height;

    const x = x2 - x1 + obj.content.scrollLeft + w2 - 4;
    const y = y2 - y1 + obj.content.scrollTop + h2 - 4;

    // Place the corner in the correct place
    obj.corner.style.top = y + "px";
    obj.corner.style.left = x + "px";

    if (obj.options.freezeColumns) {
      const width = getFreezeWidth.call(obj);
      // Only check if the last column is not part of the merged cells
      if (lastX > obj.options.freezeColumns - 1 && x2 - x1 + w2 < width) {
        obj.corner.style.display = "none";
      } else {
        if (obj.options.selectionCopy != false) {
          obj.corner.style.display = "";
        }
      }
    } else {
      if (obj.options.selectionCopy != false) {
        obj.corner.style.display = "";
      }
    }
  }

  updateToolbar.call(obj.parent, obj);
};

export const resetSelection = function (
  this: WorksheetInstance,
  blur: boolean
): number {
  const obj = this;

  let previousStatus;

  // Remove style
  if (!obj.highlighted || !obj.highlighted.length) {
    previousStatus = 0;
  } else {
    previousStatus = 1;

    for (let i = 0; i < obj.highlighted.length; i++) {
      obj.highlighted[i].element.classList.remove("highlight");
      obj.highlighted[i].element.classList.remove("highlight-left");
      obj.highlighted[i].element.classList.remove("highlight-right");
      obj.highlighted[i].element.classList.remove("highlight-top");
      obj.highlighted[i].element.classList.remove("highlight-bottom");
      obj.highlighted[i].element.classList.remove("highlight-selected");

      const px = parseInt(obj.highlighted[i].element.getAttribute("data-x"));
      const py = parseInt(obj.highlighted[i].element.getAttribute("data-y"));

      // Check for merged cells
      let ux, uy;

      if (obj.highlighted[i].element.getAttribute("data-merged")) {
        const colspan = parseInt(
          obj.highlighted[i].element.getAttribute("colspan")
        );
        const rowspan = parseInt(
          obj.highlighted[i].element.getAttribute("rowspan")
        );
        ux = colspan > 0 ? px + (colspan - 1) : px;
        uy = rowspan > 0 ? py + (rowspan - 1) : py;
      } else {
        ux = px;
        uy = py;
      }

      // Remove selected from headers
      for (let j = px; j <= ux; j++) {
        if (obj.headers[j]) {
          obj.headers[j].classList.remove("selected");
        }
      }

      // Remove selected from rows
      for (let j = py; j <= uy; j++) {
        if (obj.rows[j]) {
          obj.rows[j].element.classList.remove("selected");
        }
      }
    }
  }

  // Reset highlighted cells
  obj.highlighted = [];

  // Reset
  obj.selectedCell = null;

  // Hide corner
  obj.corner.style.top = "-2000px";
  obj.corner.style.left = "-2000px";

  if (blur == true && previousStatus == 1) {
    dispatch.call(obj, "onblur", obj);
  }

  return previousStatus;
};

/**
 * Update selection based on two cells
 */
export const updateSelection = function (
  this: WorksheetInstance,
  el1: HTMLElement,
  el2: HTMLElement | null,
  origin?: string
): void {
  const obj = this;

  const x1 = el1.getAttribute("data-x");
  const y1 = el1.getAttribute("data-y");

  let x2, y2;
  if (el2) {
    x2 = el2.getAttribute("data-x");
    y2 = el2.getAttribute("data-y");
  } else {
    x2 = x1;
    y2 = y1;
  }

  updateSelectionFromCoords.call(obj, x1, y1, x2, y2, origin);
};

export const removeCopyingSelection = function (): void {
  const copying = document.querySelectorAll(".jss_worksheet .copying");
  for (let i = 0; i < copying.length; i++) {
    copying[i].classList.remove("copying");
    copying[i].classList.remove("copying-left");
    copying[i].classList.remove("copying-right");
    copying[i].classList.remove("copying-top");
    copying[i].classList.remove("copying-bottom");
  }
};

export const updateSelectionFromCoords = function (
  this: WorksheetInstance,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  origin?: unknown
): boolean | void {
  const obj = this;

  // select column
  if (y1 == null) {
    y1 = 0;
    y2 = obj.rows.length - 1;

    if (x1 == null) {
      return;
    }
  } else if (x1 == null) {
    // select row
    x1 = 0;
    x2 = obj.options.data[0].length - 1;
  }

  // Same element
  if (x2 == null) {
    x2 = x1;
  }
  if (y2 == null) {
    y2 = y1;
  }

  // Selection must be within the existing data
  if (x1 >= obj.headers.length) {
    x1 = obj.headers.length - 1;
  }
  if (y1 >= obj.rows.length) {
    y1 = obj.rows.length - 1;
  }
  if (x2 >= obj.headers.length) {
    x2 = obj.headers.length - 1;
  }
  if (y2 >= obj.rows.length) {
    y2 = obj.rows.length - 1;
  }

  // Limits
  let borderLeft: number | null = null;
  let borderRight: number | null = null;
  let borderTop: number | null = null;
  let borderBottom: number | null = null;

  // Origin & Destination
  let px, ux;

  if (x1 < x2) {
    px = x1;
    ux = x2;
  } else {
    px = x2;
    ux = x1;
  }

  let py, uy;

  if (y1 < y2) {
    py = y1;
    uy = y2;
  } else {
    py = y2;
    uy = y1;
  }

  // Verify merged columns
  for (let i = px; i <= ux; i++) {
    for (let j = py; j <= uy; j++) {
      if (
        obj.records[j][i] &&
        obj.records[j][i].element.getAttribute("data-merged")
      ) {
        const x = parseInt(obj.records[j][i].element.getAttribute("data-x"));
        const y = parseInt(obj.records[j][i].element.getAttribute("data-y"));
        const colspan = parseInt(
          obj.records[j][i].element.getAttribute("colspan")
        );
        const rowspan = parseInt(
          obj.records[j][i].element.getAttribute("rowspan")
        );

        if (colspan > 1) {
          if (x < px) {
            px = x;
          }
          if (x + colspan > ux) {
            ux = x + colspan - 1;
          }
        }

        if (rowspan) {
          if (y < py) {
            py = y;
          }
          if (y + rowspan > uy) {
            uy = y + rowspan - 1;
          }
        }
      }
    }
  }

  // Vertical limits
  for (let j = py; j <= uy; j++) {
    if (obj.rows[j].element.style.display != "none") {
      if (borderTop == null) {
        borderTop = j;
      }
      borderBottom = j;
    }
  }

  for (let i = px; i <= ux; i++) {
    for (let j = py; j <= uy; j++) {
      // Horizontal limits
      if (
        !obj.options.columns ||
        !obj.options.columns[i] ||
        obj.options.columns[i].type != "hidden"
      ) {
        if (borderLeft == null) {
          borderLeft = i;
        }
        borderRight = i;
      }
    }
  }

  // Create borders
  if (!borderLeft) {
    borderLeft = 0;
  }
  if (!borderRight) {
    borderRight = 0;
  }

  const ret = dispatch.call(
    obj,
    "onbeforeselection",
    obj,
    borderLeft,
    borderTop,
    borderRight,
    borderBottom,
    origin
  );
  if (ret === false) {
    return false;
  }

  // Reset Selection
  const previousState = obj.resetSelection();

  // Keep selected cell
  obj.selectedCell = [x1, y1, x2, y2];

  // Add selected cell
  if (obj.records[y1][x1]) {
    obj.records[y1][x1].element.classList.add("highlight-selected");
  }

  // Redefining styles
  for (let i = px; i <= ux; i++) {
    for (let j = py; j <= uy; j++) {
      if (
        obj.rows[j].element.style.display != "none" &&
        obj.records[j][i].element.style.display != "none"
      ) {
        obj.records[j][i].element.classList.add("highlight");
        obj.highlighted.push(obj.records[j][i]);
      }
    }
  }

  for (let i = borderLeft!; i <= borderRight!; i++) {
    if (
      (!obj.options.columns ||
        !obj.options.columns[i] ||
        obj.options.columns[i].type != "hidden") &&
      obj.cols[i].colElement.style &&
      obj.cols[i].colElement.style.display != "none"
    ) {
      // Top border
      if (
        borderTop !== null &&
        obj.records[borderTop] &&
        obj.records[borderTop][i]
      ) {
        obj.records[borderTop][i].element.classList.add("highlight-top");
      }
      // Bottom border
      if (
        borderBottom !== null &&
        obj.records[borderBottom] &&
        obj.records[borderBottom][i]
      ) {
        obj.records[borderBottom][i].element.classList.add("highlight-bottom");
      }
      // Add selected from headers
      obj.headers[i].classList.add("selected");
    }
  }

  for (let j = borderTop!; j <= borderBottom!; j++) {
    if (obj.rows[j] && obj.rows[j].element.style.display != "none") {
      // Left border
      if (borderLeft !== null) {
        obj.records[j][borderLeft].element.classList.add("highlight-left");
      }
      // Right border
      if (borderRight !== null) {
        obj.records[j][borderRight].element.classList.add("highlight-right");
      }
      // Add selected from rows
      obj.rows[j].element.classList.add("selected");
    }
  }

  obj.selectedContainer = [borderLeft, borderTop, borderRight, borderBottom];

  // Handle events
  if (previousState == 0) {
    dispatch.call(obj, "onfocus", obj);

    removeCopyingSelection();
  }

  dispatch.call(
    obj,
    "onselection",
    obj,
    borderLeft,
    borderTop,
    borderRight,
    borderBottom,
    origin
  );

  // Find corner cell
  updateCornerPosition.call(obj);
};

/**
 * Get selected column numbers
 *
 * @return array
 */
export const getSelectedColumns = function (
  this: WorksheetInstance,
  visibleOnly: boolean
): number[] {
  const obj = this;

  if (!obj.selectedCell) {
    return [];
  }

  const result = [];

  for (
    let i = Math.min(obj.selectedCell[0], obj.selectedCell[2]);
    i <= Math.max(obj.selectedCell[0], obj.selectedCell[2]);
    i++
  ) {
    if (!visibleOnly || obj.headers[i].style.display != "none") {
      result.push(i);
    }
  }

  return result;
};

/**
 * Refresh current selection
 */
export const refreshSelection = function (this: WorksheetInstance): void {
  const obj = this;

  if (obj.selectedCell) {
    obj.updateSelectionFromCoords(
      obj.selectedCell[0],
      obj.selectedCell[1],
      obj.selectedCell[2],
      obj.selectedCell[3]
    );
  }
};

/**
 * Remove copy selection
 *
 * @return void
 */
export const removeCopySelection = function (this: WorksheetInstance): void {
  const obj = this;

  // Remove current selection
  for (let i = 0; i < obj.selection.length; i++) {
    obj.selection[i].classList.remove("selection");
    obj.selection[i].classList.remove("selection-left");
    obj.selection[i].classList.remove("selection-right");
    obj.selection[i].classList.remove("selection-top");
    obj.selection[i].classList.remove("selection-bottom");
  }

  obj.selection = [];
};

const doubleDigitFormat = function (v: number): string {
  let result = "" + v;
  if (result.length == 1) {
    result = "0" + result;
  }
  return result;
};

/**
 * Helper function to copy data using the corner icon
 */
export const copyData = function (
  this: WorksheetInstance,
  o: HTMLElement,
  d: HTMLElement
): void {
  const obj = this;

  // Get data from all selected cells
  const data = obj.getData(true, false);

  // Selected cells
  const h = obj.selectedContainer;

  // Cells
  const x1 = parseInt(o.getAttribute("data-x"));
  const y1 = parseInt(o.getAttribute("data-y"));
  const x2 = parseInt(d.getAttribute("data-x"));
  const y2 = parseInt(d.getAttribute("data-y"));

  // Records
  const records = [];
  let breakControl = false;

  let rowNumber, colNumber;

  if (h[0] == x1) {
    // Vertical copy
    if (y1 < h[1]) {
      rowNumber = y1 - h[1];
    } else {
      rowNumber = 1;
    }
    colNumber = 0;
  } else {
    if (x1 < h[0]) {
      colNumber = x1 - h[0];
    } else {
      colNumber = 1;
    }
    rowNumber = 0;
  }

  // Copy data procedure
  let posx = 0;
  let posy = 0;

  for (let j = y1; j <= y2; j++) {
    // Skip hidden rows
    if (obj.rows[j] && obj.rows[j].element.style.display == "none") {
      continue;
    }

    // Controls
    if (data[posy] == undefined) {
      posy = 0;
    }
    posx = 0;

    // Data columns
    if (h[0] != x1) {
      if (x1 < h[0]) {
        colNumber = x1 - h[0];
      } else {
        colNumber = 1;
      }
    }
    // Data columns
    for (let i = x1; i <= x2; i++) {
      // Update non-readonly
      if (
        obj.records[j][i] &&
        !obj.records[j][i].element.classList.contains("readonly") &&
        obj.records[j][i].element.style.display != "none" &&
        breakControl == false
      ) {
        // Stop if contains value
        if (!obj.selection.length) {
          if (obj.options.data[j][i] != "") {
            breakControl = true;
            continue;
          }
        }

        // Column
        if (data[posy] == undefined) {
          posx = 0;
        } else if (data[posy][posx] == undefined) {
          posx = 0;
        }

        // Value
        let value = data[posy][posx];

        if (value && !data[1] && obj.parent.config.autoIncrement != false) {
          if (
            obj.options.columns &&
            obj.options.columns[i] &&
            (!obj.options.columns[i].type ||
              obj.options.columns[i].type == "text" ||
              obj.options.columns[i].type == "numeric")
          ) {
            if (("" + value).substr(0, 1) == "=") {
              const tokens = ("" + value).match(/([A-Z]+[0-9]+)/g);

              if (tokens) {
                const affectedTokens = [];
                for (let index = 0; index < tokens.length; index++) {
                  const position = getIdFromColumnName(tokens[index], true);
                  if (Array.isArray(position)) {
                    position[0] += colNumber;
                    position[1] += rowNumber;
                    if (position[1] < 0) {
                      position[1] = 0;
                    }
                    const token = getColumnNameFromId([
                      position[0],
                      position[1],
                    ]);

                    if (token != tokens[index]) {
                      affectedTokens[tokens[index]] = token;
                    }
                  }
                }
                // Update formula
                if (affectedTokens) {
                  value = updateFormula(value, affectedTokens);
                }
              }
            } else {
              if (value == Number(value)) {
                value = Number(value) + rowNumber;
              }
            }
          } else if (
            obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].type == "calendar" &&
            (typeof value === "string" || typeof value === "number")
          ) {
            const date = new Date(value);
            date.setDate(date.getDate() + rowNumber);
            value =
              date.getFullYear() +
              "-" +
              doubleDigitFormat(date.getMonth() + 1) +
              "-" +
              doubleDigitFormat(date.getDate()) +
              " " +
              "00:00:00";
          }
        }

        records.push(updateCell.call(obj, i, j, value));

        // Update all formulas in the chain
        updateFormulaChain.call(obj, i, j, records);
      }
      posx++;
      if (h[0] != x1) {
        colNumber++;
      }
    }
    posy++;
    rowNumber++;
  }

  // Update history
  setHistory.call(obj, {
    action: "setValue",
    records: records,
    selection: obj.selectedCell,
  });

  // Update table with custom configuration if applicable
  updateTable.call(obj);

  // On after changes
  const onafterchangesRecords = records.map(function (record) {
    return {
      x: record.x,
      y: record.y,
      value: record.value,
      oldValue: record.oldValue,
    };
  });

  dispatch.call(obj, "onafterchanges", obj, onafterchangesRecords);
};

export const hash = function (str: string) {
  let hash = 0,
    i,
    chr;

  if (!str || str.length === 0) {
    return hash;
  } else {
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
  }
  return hash;
};

/**
 * Move coords to A1 in case overlaps with an excluded cell
 */
export const conditionalSelectionUpdate = function (
  this: WorksheetInstance,
  type: number,
  o: number,
  d: number
): void {
  const obj = this;

  if (type == 1) {
    if (
      obj.selectedCell &&
      ((o >= obj.selectedCell[1] && o <= obj.selectedCell[3]) ||
        (d >= obj.selectedCell[1] && d <= obj.selectedCell[3]))
    ) {
      obj.resetSelection();
      return;
    }
  } else {
    if (
      obj.selectedCell &&
      ((o >= obj.selectedCell[0] && o <= obj.selectedCell[2]) ||
        (d >= obj.selectedCell[0] && d <= obj.selectedCell[2]))
    ) {
      obj.resetSelection();
      return;
    }
  }
};

/**
 * Get selected rows numbers
 *
 * @return array
 */
export const getSelectedRows = function (
  this: WorksheetInstance,
  visibleOnly: boolean
): number[] {
  const obj = this;

  if (!obj.selectedCell) {
    return [];
  }

  const result = [];

  for (
    let i = Math.min(obj.selectedCell[1], obj.selectedCell[3]);
    i <= Math.max(obj.selectedCell[1], obj.selectedCell[3]);
    i++
  ) {
    if (!visibleOnly || obj.rows[i].element.style.display != "none") {
      result.push(i);
    }
  }

  return result;
};

export const selectAll = function (this: WorksheetInstance): void {
  const obj = this;

  if (!obj.selectedCell) {
    obj.selectedCell = [];
  }

  obj.selectedCell[0] = 0;
  obj.selectedCell[1] = 0;
  obj.selectedCell[2] = obj.headers.length - 1;
  obj.selectedCell[3] = obj.records.length - 1;

  obj.updateSelectionFromCoords(
    obj.selectedCell[0],
    obj.selectedCell[1],
    obj.selectedCell[2],
    obj.selectedCell[3]
  );
};

export const getSelection = function (
  this: WorksheetInstance
): number[] | null {
  const obj = this;

  if (!obj.selectedCell) {
    return null;
  }

  return [
    Math.min(obj.selectedCell[0], obj.selectedCell[2]),
    Math.min(obj.selectedCell[1], obj.selectedCell[3]),
    Math.max(obj.selectedCell[0], obj.selectedCell[2]),
    Math.max(obj.selectedCell[1], obj.selectedCell[3]),
  ];
};

export const getSelected = function (
  this: WorksheetInstance,
  columnNameOnly: boolean
):
  | string[]
  | Array<{
      element: HTMLElement;
      x: number;
      y: number;
      colspan?: number;
      rowspan?: number;
    }> {
  const obj = this;

  const selectedRange = getSelection.call(obj);

  if (!selectedRange) {
    return [];
  }

  const cells = [];

  for (let y = selectedRange[1]; y <= selectedRange[3]; y++) {
    for (let x = selectedRange[0]; x <= selectedRange[2]; x++) {
      if (columnNameOnly) {
        cells.push(getCellNameFromCoords(x, y));
      } else {
        cells.push(obj.records[y][x]);
      }
    }
  }

  return cells;
};

export const getRange = function (this: WorksheetInstance): string {
  const obj = this;

  const selectedRange = getSelection.call(obj);

  if (!selectedRange) {
    return "";
  }

  const start = getCellNameFromCoords(selectedRange[0], selectedRange[1]);
  const end = getCellNameFromCoords(selectedRange[2], selectedRange[3]);

  if (start === end) {
    return obj.options.worksheetName + "!" + start;
  }

  return obj.options.worksheetName + "!" + start + ":" + end;
};

export const isSelected = function (
  this: WorksheetInstance,
  x: number,
  y: number
): boolean {
  const obj = this;

  const selection = getSelection.call(obj);

  if (!selection) {
    return false;
  }

  return (
    x >= selection[0] &&
    x <= selection[2] &&
    y >= selection[1] &&
    y <= selection[3]
  );
};

export const getHighlighted = function (this: WorksheetInstance): number[][] {
  const obj = this;

  const selection = getSelection.call(obj);

  if (selection) {
    return [selection];
  }

  return [];
};
