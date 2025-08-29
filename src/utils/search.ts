import { resetFilters } from "./filter";
import { getIdFromColumnName } from "./internalHelpers";
import { updateResult } from "./internal";
import { isRowMerged } from "./merges";
import type { SpreadsheetContext, CellValue } from "../types/core";

/**
 * Search
 */
export const search = function (this: SpreadsheetContext, query: string): void {
  const obj = this;

  // Reset any filter
  if (obj.options.filters) {
    resetFilters.call(obj);
  }

  // Reset selection
  obj.resetSelection?.();

  // Total of results
  obj.pageNumber = 0;
  obj.results = [];

  if (query) {
    if (obj.searchInput?.value !== query) {
      obj.searchInput!.value = query;
    }

    // Search filter
    const search = function (item: CellValue[], query: RegExp, index: number) {
      for (let i = 0; i < item.length; i++) {
        if (
          ("" + item[i]).toLowerCase().search(query) >= 0 ||
          ("" + obj.records[index]?.[i]?.element.innerHTML)
            .toLowerCase()
            .search(query) >= 0
        ) {
          return true;
        }
      }
      return false;
    };

    // Result
    const addToResult = function (k: number) {
      if (obj.results && obj.results.indexOf(k) == -1) {
        obj.results.push(k);
      }
    };

    let parsedQueryStr = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const parsedQuery = new RegExp(parsedQueryStr, "i");

    // Filter
    if (obj.options.data) {
      if (Array.isArray(obj.options.data)) {
        // Handle CellValue[][] case
        (obj.options.data as CellValue[][]).forEach(function (v: CellValue[], k: number) {
          if (search(v, parsedQuery, k)) {
            // Merged rows found
            const rows = isRowMerged.call(obj, k, undefined);
            if (rows.length) {
              for (let i = 0; i < rows.length; i++) {
                const row = getIdFromColumnName(rows[i], true);
                if (obj.options.mergeCells && obj.options.mergeCells[rows[i]] && Array.isArray(obj.options.mergeCells[rows[i]])) {
                  const mergeInfo = obj.options.mergeCells[rows[i]] as [number, number, HTMLElement[]];
                  for (let j = 0; j < mergeInfo[1]; j++) {
                    addToResult(Number(row[1]) + j);
                  }
                }
              }
            } else {
              // Normal row found
              addToResult(k);
            }
          }
        });
      } else {
        // Handle Record<string, CellValue>[] case
        (obj.options.data as Array<Record<string, CellValue>>).forEach(function (v: Record<string, CellValue>, k: number) {
          const values = Object.values(v);
          if (search(values, parsedQuery, k)) {
            // Merged rows found
            const rows = isRowMerged.call(obj, k, undefined);
            if (rows.length) {
              for (let i = 0; i < rows.length; i++) {
                const row = getIdFromColumnName(rows[i], true);
                if (obj.options.mergeCells && obj.options.mergeCells[rows[i]] && Array.isArray(obj.options.mergeCells[rows[i]])) {
                  const mergeInfo = obj.options.mergeCells[rows[i]] as [number, number, HTMLElement[]];
                  for (let j = 0; j < mergeInfo[1]; j++) {
                    addToResult(Number(row[1]) + j);
                  }
                }
              }
            } else {
              // Normal row found
              addToResult(k);
            }
          }
        });
      }
    }
  } else {
    obj.results = null;
  }

  updateResult.call(obj);
};

/**
 * Reset search
 */
export const resetSearch = function (this: SpreadsheetContext): void {
  const obj = this;

  if (obj.searchInput) {
    obj.searchInput.value = "";
  }
  obj.search?.("");
  obj.results = null;
};
