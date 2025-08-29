import jSuites from "jsuites";
import { setHistory } from "./history";
import dispatch from "./dispatch";
import { updateTableReferences } from "./internal";
import { loadPage } from "./lazyLoading";
import { closeFilter } from "./filter";
import type { WorksheetInstance, CellValue } from "../types/core";

/**
 * Update order arrow
 */
export const updateOrderArrow = function (
  this: WorksheetInstance,
  column: number,
  order: boolean
): void {
  const obj = this;

  // Remove order
  for (let i = 0; i < obj.headers.length; i++) {
    obj.headers[i].classList.remove("arrow-up");
    obj.headers[i].classList.remove("arrow-down");
  }

  // No order specified then toggle order
  if (order) {
    obj.headers[column].classList.add("arrow-up");
  } else {
    obj.headers[column].classList.add("arrow-down");
  }
};

/**
 * Update rows position
 */
export const updateOrder = function (this: WorksheetInstance, rows: number[]): void {
  const obj = this;

  // History
  const data: (CellValue[] | Record<string, CellValue>)[] = [];
  for (let j = 0; j < rows.length; j++) {
    if (obj.options.data) {
      data[j] = obj.options.data[rows[j]];
    }
  }
  if (obj.options.data) {
    obj.options.data = data;
  }

  const recordsData: typeof obj.records = [];
  for (let j = 0; j < rows.length; j++) {
    recordsData[j] = obj.records[rows[j]];

    for (let i = 0; i < recordsData[j].length; i++) {
      recordsData[j][i].y = j;
    }
  }
  obj.records = recordsData;

  const rowsData: typeof obj.rows = [];
  for (let j = 0; j < rows.length; j++) {
    rowsData[j] = obj.rows[rows[j]];
    rowsData[j].y = j;
  }
  obj.rows = rowsData;

  // Update references
  updateTableReferences.call(obj);

  // Redo search
  if (obj.results && obj.results.length) {
    if (obj.searchInput.value) {
      obj.search(obj.searchInput.value);
    } else {
      closeFilter.call(obj);
    }
  } else {
    // Create page
    obj.results = null;
    obj.pageNumber = 0;

    if (obj.options.pagination > 0) {
      obj.page(0);
    } else if (obj.options.lazyLoading == true) {
      loadPage.call(obj, 0);
    } else {
      for (let j = 0; j < obj.rows.length; j++) {
        obj.tbody.appendChild(obj.rows[j].element);
      }
    }
  }
};

/**
 * Sort data and reload table
 */
export const orderBy = function (this: WorksheetInstance, column: number, order?: number | boolean): boolean {
  const obj = this;

  if (column >= 0) {
    // Merged cells
    if (
      obj.options.mergeCells &&
      Object.keys(obj.options.mergeCells).length > 0
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
        // Remove merged cells
        obj.destroyMerge();
      }
    }

    // Direction
    let direction: boolean;
    if (order == null) {
      if (obj.headers[column]) {
        direction = obj.headers[column].classList.contains("arrow-down");
      } else {
        direction = false;
      }
    } else {
      direction = order ? true : false;
    }

    // Test order
    let temp: [number, CellValue][] = [];
    if (
      obj.options.columns &&
      obj.options.columns[column] &&
      (obj.options.columns[column].type == "number" ||
        obj.options.columns[column].type == "numeric" ||
        obj.options.columns[column].type == "percentage" ||
        obj.options.columns[column].type == "autonumber" ||
        obj.options.columns[column].type == "color")
    ) {
      if (obj.options.data) {
        for (let j = 0; j < obj.options.data.length; j++) {
          if (obj.options.data[j]) {
            temp[j] = [j, Number(obj.options.data[j][column])];
          }
        }
      }
    } else if (
      obj.options.columns &&
      obj.options.columns[column] &&
      (obj.options.columns[column].type == "calendar" ||
        obj.options.columns[column].type == "checkbox" ||
        obj.options.columns[column].type == "radio")
    ) {
      if (obj.options.data) {
        for (let j = 0; j < obj.options.data.length; j++) {
          if (obj.options.data[j]) {
            temp[j] = [j, obj.options.data[j][column]];
          }
        }
      }
    } else {
      if (obj.options.data) {
        for (let j = 0; j < obj.options.data.length; j++) {
          if (obj.records[j] && obj.records[j][column] && obj.records[j][column].element) {
            const textContent = obj.records[j][column].element.textContent;
            temp[j] = [j, textContent ? textContent.toLowerCase() : ""];
          }
        }
      }
    }

    // Default sorting method
    if (typeof obj.parent.config.sorting !== "function") {
      obj.parent.config.sorting = function (direction: boolean) {
        return function (a: [number, CellValue], b: [number, CellValue]) {
          const valueA = a[1];
          const valueB = b[1];

          if (!direction) {
            return valueA === "" && valueB !== ""
              ? 1
              : valueA !== "" && valueB === ""
              ? -1
              : valueA > valueB
              ? 1
              : valueA < valueB
              ? -1
              : 0;
          } else {
            return valueA === "" && valueB !== ""
              ? 1
              : valueA !== "" && valueB === ""
              ? -1
              : valueA > valueB
              ? -1
              : valueA < valueB
              ? 1
              : 0;
          }
        };
      };
    }

    temp = temp.sort(obj.parent.config.sorting(direction));

    // Save history
    const newValue: number[] = [];
    for (let j = 0; j < temp.length; j++) {
      newValue[j] = temp[j][0];
    }

    // Save history
    setHistory.call(obj, {
      action: "orderBy",
      rows: newValue,
      column: column,
      order: direction,
    });

    // Update order
    updateOrderArrow.call(obj, column, direction);
    updateOrder.call(obj, newValue);

    // On sort event
    dispatch.call(
      obj,
      "onsort",
      obj,
      column,
      direction,
      newValue.map((row) => row)
    );

    return true;
  }
  return false;
};
