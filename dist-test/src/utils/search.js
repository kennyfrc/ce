"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSearch = exports.search = void 0;
const filter_1 = require("./filter");
const internalHelpers_1 = require("./internalHelpers");
const internal_1 = require("./internal");
const merges_1 = require("./merges");
/**
 * Search
 */
const search = function (query) {
    const obj = this;
    // Reset any filter
    if (obj.options.filters) {
        filter_1.resetFilters.call(obj);
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
        const search = function (item, query, index) {
            for (let i = 0; i < item.length; i++) {
                if (("" + item[i]).toLowerCase().search(query) >= 0 ||
                    ("" + obj.records[index][i].element.innerHTML)
                        .toLowerCase()
                        .search(query) >= 0) {
                    return true;
                }
            }
            return false;
        };
        // Result
        const addToResult = function (k) {
            if (obj.results.indexOf(k) == -1) {
                obj.results.push(k);
            }
        };
        let parsedQueryStr = query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const parsedQuery = new RegExp(parsedQueryStr, "i");
        // Filter
        obj.options.data.forEach(function (v, k) {
            if (search(v, parsedQuery, k)) {
                // Merged rows found
                const rows = merges_1.isRowMerged.call(obj, k, undefined);
                if (rows.length) {
                    for (let i = 0; i < rows.length; i++) {
                        const row = (0, internalHelpers_1.getIdFromColumnName)(rows[i], true);
                        for (let j = 0; j < obj.options.mergeCells[rows[i]][1]; j++) {
                            addToResult(Number(row[1]) + j);
                        }
                    }
                }
                else {
                    // Normal row found
                    addToResult(k);
                }
            }
        });
    }
    else {
        obj.results = null;
    }
    internal_1.updateResult.call(obj);
};
exports.search = search;
/**
 * Reset search
 */
const resetSearch = function () {
    const obj = this;
    obj.searchInput.value = "";
    obj.search("");
    obj.results = null;
};
exports.resetSearch = resetSearch;
