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
    var _a, _b;
    const obj = this;
    // Reset any filter
    if (obj.options.filters) {
        filter_1.resetFilters.call(obj);
    }
    // Reset selection
    (_a = obj.resetSelection) === null || _a === void 0 ? void 0 : _a.call(obj);
    // Total of results
    obj.pageNumber = 0;
    obj.results = [];
    if (query) {
        if (((_b = obj.searchInput) === null || _b === void 0 ? void 0 : _b.value) !== query) {
            obj.searchInput.value = query;
        }
        // Search filter
        const search = function (item, query, index) {
            var _a, _b;
            for (let i = 0; i < item.length; i++) {
                if (("" + item[i]).toLowerCase().search(query) >= 0 ||
                    ("" + ((_b = (_a = obj.records[index]) === null || _a === void 0 ? void 0 : _a[i]) === null || _b === void 0 ? void 0 : _b.element.innerHTML))
                        .toLowerCase()
                        .search(query) >= 0) {
                    return true;
                }
            }
            return false;
        };
        // Result
        const addToResult = function (k) {
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
                obj.options.data.forEach(function (v, k) {
                    if (search(v, parsedQuery, k)) {
                        // Merged rows found
                        const rows = merges_1.isRowMerged.call(obj, k, undefined);
                        if (rows.length) {
                            for (let i = 0; i < rows.length; i++) {
                                const row = (0, internalHelpers_1.getIdFromColumnName)(rows[i], true);
                                if (obj.options.mergeCells && obj.options.mergeCells[rows[i]] && Array.isArray(obj.options.mergeCells[rows[i]])) {
                                    const mergeInfo = obj.options.mergeCells[rows[i]];
                                    for (let j = 0; j < mergeInfo[1]; j++) {
                                        addToResult(Number(row[1]) + j);
                                    }
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
                // Handle Record<string, CellValue>[] case
                obj.options.data.forEach(function (v, k) {
                    const values = Object.values(v);
                    if (search(values, parsedQuery, k)) {
                        // Merged rows found
                        const rows = merges_1.isRowMerged.call(obj, k, undefined);
                        if (rows.length) {
                            for (let i = 0; i < rows.length; i++) {
                                const row = (0, internalHelpers_1.getIdFromColumnName)(rows[i], true);
                                if (obj.options.mergeCells && obj.options.mergeCells[rows[i]] && Array.isArray(obj.options.mergeCells[rows[i]])) {
                                    const mergeInfo = obj.options.mergeCells[rows[i]];
                                    for (let j = 0; j < mergeInfo[1]; j++) {
                                        addToResult(Number(row[1]) + j);
                                    }
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
        }
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
    var _a;
    const obj = this;
    if (obj.searchInput) {
        obj.searchInput.value = "";
    }
    (_a = obj.search) === null || _a === void 0 ? void 0 : _a.call(obj, "");
    obj.results = null;
};
exports.resetSearch = resetSearch;
