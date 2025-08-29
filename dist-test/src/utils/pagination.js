"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quantityOfPages = exports.page = exports.updatePagination = exports.whichPage = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const dispatch_1 = __importDefault(require("./dispatch"));
const selection_1 = require("./selection");
/**
 * Which page the row is
 */
const whichPage = function (row) {
    const obj = this;
    let rowNum;
    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
        if (typeof row === "number") {
            rowNum = row;
        }
        else if (typeof row === "string") {
            rowNum = parseInt(row, 10);
        }
        else if (row && typeof row.index === "number") {
            rowNum = row.index;
        }
        else {
            rowNum = Number(String(row));
            if (Number.isNaN(rowNum))
                rowNum = 0;
        }
        const found = obj.results.indexOf(rowNum);
        if (found !== -1)
            rowNum = found;
    }
    else {
        if (typeof row === "number")
            rowNum = row;
        else if (typeof row === "string")
            rowNum = parseInt(row, 10);
        else if (row && typeof row.index === "number")
            rowNum = row.index;
        else
            rowNum = 0;
    }
    const pagination = typeof obj.options.pagination === "number" ? obj.options.pagination : parseInt(String(obj.options.pagination || "0"), 10) || 0;
    if (!pagination)
        return 0;
    return Math.ceil((rowNum + 1) / pagination) - 1;
};
exports.whichPage = whichPage;
/**
 * Update the pagination
 */
const updatePagination = function () {
    var _a;
    const obj = this;
    if (!obj.pagination)
        return;
    // Reset container
    obj.pagination.children[0].innerHTML = "";
    obj.pagination.children[1].innerHTML = "";
    // Start pagination
    if (obj.options.pagination) {
        // Searchable
        let results;
        if ((obj.options.search == true || obj.options.filters == true) &&
            obj.results) {
            results = obj.results;
        }
        else {
            results = obj.rows;
        }
        if (!results || results.length === 0) {
            if (obj.pagination) {
                obj.pagination.children[0].innerHTML = jsuites_1.default.translate("No records found");
            }
        }
        else {
            // Pagination container
            const total = Array.isArray(results) ? results.length : results;
            const pagination = typeof obj.options.pagination === "number" ? obj.options.pagination : parseInt(String(obj.options.pagination || "0"), 10) || 0;
            const quantyOfPages = pagination ? Math.ceil(total / pagination) : 0;
            let startNumber, finalNumber;
            const currentPage = (_a = obj.pageNumber) !== null && _a !== void 0 ? _a : 0;
            if (currentPage < 6) {
                startNumber = 1;
                finalNumber = quantyOfPages < 10 ? quantyOfPages : 10;
            }
            else if (quantyOfPages - currentPage < 5) {
                startNumber = quantyOfPages - 9;
                finalNumber = quantyOfPages;
                if (startNumber < 1) {
                    startNumber = 1;
                }
            }
            else {
                startNumber = currentPage - 4;
                finalNumber = currentPage + 5;
            }
            // First
            if (startNumber > 1 && obj.pagination) {
                const paginationItem = document.createElement("div");
                paginationItem.className = "jss_page";
                paginationItem.innerHTML = "<";
                paginationItem.title = "1";
                obj.pagination.children[1].appendChild(paginationItem);
            }
            // Get page links
            for (let i = startNumber; i <= finalNumber; i++) {
                const paginationItem = document.createElement("div");
                paginationItem.className = "jss_page";
                paginationItem.innerHTML = i.toString();
                if (obj.pagination) {
                    obj.pagination.children[1].appendChild(paginationItem);
                }
                if (currentPage == i - 1) {
                    paginationItem.classList.add("jss_page_selected");
                }
            }
            // Last
            if (finalNumber < quantyOfPages && obj.pagination) {
                const paginationItem = document.createElement("div");
                paginationItem.className = "jss_page";
                paginationItem.innerHTML = ">";
                paginationItem.title = quantyOfPages.toString();
                obj.pagination.children[1].appendChild(paginationItem);
            }
            // Text
            const format = function (fmt, ...args) {
                return fmt.replace(/{(\d+)}/g, function (_match, numberStr) {
                    const idx = parseInt(numberStr, 10);
                    return typeof args[idx] !== "undefined" ? String(args[idx]) : _match;
                });
            };
            if (obj.pagination) {
                obj.pagination.children[0].innerHTML = format(jsuites_1.default.translate("Showing page {0} of {1} entries"), (currentPage + 1).toString(), quantyOfPages.toString());
            }
        }
    }
};
exports.updatePagination = updatePagination;
/**
 * Go to page
 */
const page = function (pageNumber) {
    const obj = this;
    const oldPage = obj.pageNumber;
    // Search
    let results;
    if ((obj.options.search == true || obj.options.filters == true) &&
        obj.results) {
        results = obj.results;
    }
    else {
        results = obj.rows;
    }
    // Per page
    const quantityPerPage = Number(obj.options.pagination) || 0;
    // pageNumber
    if (pageNumber == null || pageNumber == -1) {
        // Last page
        pageNumber = Math.ceil(results.length / quantityPerPage) - 1;
    }
    // Page number
    obj.pageNumber = pageNumber;
    let startRow = pageNumber * quantityPerPage;
    let finalRow = pageNumber * quantityPerPage + quantityPerPage;
    if (finalRow > results.length) {
        finalRow = results.length;
    }
    if (startRow < 0) {
        startRow = 0;
    }
    // Reset container
    while (obj.tbody.firstChild) {
        obj.tbody.removeChild(obj.tbody.firstChild);
    }
    // Appeding items
    for (let j = startRow; j < finalRow; j++) {
        if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
            obj.tbody.appendChild(obj.rows[results[j]].element);
        }
        else {
            obj.tbody.appendChild(obj.rows[j].element);
        }
    }
    if (Number(obj.options.pagination) > 0) {
        exports.updatePagination.call(obj);
    }
    // Update corner position
    selection_1.updateCornerPosition.call(obj);
    // Events
    dispatch_1.default.call(obj, "onchangepage", obj, pageNumber, oldPage, obj.options.pagination);
};
exports.page = page;
const quantityOfPages = function () {
    const obj = this;
    const total = (obj.options.search == true || obj.options.filters == true) && obj.results ? obj.results.length : obj.rows.length;
    const pagination = typeof obj.options.pagination === "number" ? obj.options.pagination : parseInt(String(obj.options.pagination || "0"), 10) || 0;
    if (!pagination)
        return 0;
    return Math.ceil(total / pagination);
};
exports.quantityOfPages = quantityOfPages;
