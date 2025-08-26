import { resetFilters } from "./filter.js";
import { getIdFromColumnName } from "./internalHelpers.js";
import { updateResult } from "./internal.js";
import { isRowMerged } from "./merges.js";
/**
 * Search
 */
export var search = function (query) {
    var obj = this;
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
        var search_1 = function (item, query, index) {
            for (var i = 0; i < item.length; i++) {
                if (('' + item[i]).toLowerCase().search(query) >= 0 ||
                    ('' + obj.records[index][i].element.innerHTML).toLowerCase().search(query) >= 0) {
                    return true;
                }
            }
            return false;
        };
        // Result
        var addToResult_1 = function (k) {
            if (obj.results.indexOf(k) == -1) {
                obj.results.push(k);
            }
        };
        var parsedQuery_1 = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        parsedQuery_1 = new RegExp(parsedQuery_1, "i");
        // Filter
        obj.options.data.forEach(function (v, k) {
            if (search_1(v, parsedQuery_1, k)) {
                // Merged rows found
                var rows = isRowMerged.call(obj, k);
                if (rows.length) {
                    for (var i = 0; i < rows.length; i++) {
                        var row = getIdFromColumnName(rows[i], true);
                        for (var j = 0; j < obj.options.mergeCells[rows[i]][1]; j++) {
                            addToResult_1(row[1] + j);
                        }
                    }
                }
                else {
                    // Normal row found
                    addToResult_1(k);
                }
            }
        });
    }
    else {
        obj.results = null;
    }
    updateResult.call(obj);
};
/**
 * Reset search
 */
export var resetSearch = function () {
    var obj = this;
    obj.searchInput.value = '';
    obj.search('');
    obj.results = null;
};
//# sourceMappingURL=search.js.map