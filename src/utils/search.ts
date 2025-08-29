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
  obj.resetSelection();

  // Total of results
  obj.pageNumber = 0;
  obj.results = [];

  if (query) {
    if (obj.searchInput.value !== query) {
      obj.searchInput.value = query;
    }

    // Search filter
    const search = function (item: CellValue[], query: RegExp, index: number) {
      for (let i = 0; i < item.length; i++) {
        if (
          ("" + item[i]).toLowerCase().search(query) >= 0 ||
          ("" + obj.records[index][i].element.innerHTML)
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
      if (obj.results.indexOf(k) == -1) {
        obj.results.push(k);
      }
    };

    let parsedQueryStr = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const parsedQuery = new RegExp(parsedQueryStr, "i");

    // Filter
    obj.options.data.forEach(function (v: CellValue[], k: number) {
      if (search(v, parsedQuery, k)) {
        // Merged rows found
        const rows = isRowMerged.call(obj, k, undefined);
        if (rows.length) {
          for (let i = 0; i < rows.length; i++) {
            const row = getIdFromColumnName(rows[i], true);
            for (let j = 0; j < obj.options.mergeCells[rows[i]][1]; j++) {
              addToResult(Number(row[1]) + j);
            }
          }
        } else {
          // Normal row found
          addToResult(k);
        }
      }
    });
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

  obj.searchInput.value = "";
  obj.search("");
  obj.results = null;
};
