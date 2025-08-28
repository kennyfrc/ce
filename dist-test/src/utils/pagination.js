"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quantiyOfPages = exports.page = exports.updatePagination = exports.whichPage = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const dispatch_1 = __importDefault(require("./dispatch"));
const selection_1 = require("./selection");
/**
 * Which page the row is
 */
const whichPage = function (row) {
    const obj = this;
    // Search
    if ((obj.options.search == true || obj.options.filters == true) &&
        obj.results) {
        row = obj.results.indexOf(row);
    }
    return Math.ceil((parseInt(row) + 1) / parseInt(obj.options.pagination)) - 1;
};
exports.whichPage = whichPage;
/**
 * Update the pagination
 */
const updatePagination = function () {
    const obj = this;
    // Reset container
    obj.pagination.children[0].innerHTML = "";
    obj.pagination.children[1].innerHTML = "";
    // Start pagination
    if (obj.options.pagination) {
        // Searchable
        let results;
        if ((obj.options.search == true || obj.options.filters == true) &&
            obj.results) {
            results = obj.results.length;
        }
        else {
            results = obj.rows.length;
        }
        if (!results) {
            // No records found
            obj.pagination.children[0].innerHTML = jsuites_1.default.translate("No records found");
        }
        else {
            // Pagination container
            const quantyOfPages = Math.ceil(results / obj.options.pagination);
            let startNumber, finalNumber;
            if (obj.pageNumber < 6) {
                startNumber = 1;
                finalNumber = quantyOfPages < 10 ? quantyOfPages : 10;
            }
            else if (quantyOfPages - obj.pageNumber < 5) {
                startNumber = quantyOfPages - 9;
                finalNumber = quantyOfPages;
                if (startNumber < 1) {
                    startNumber = 1;
                }
            }
            else {
                startNumber = obj.pageNumber - 4;
                finalNumber = obj.pageNumber + 5;
            }
            // First
            if (startNumber > 1) {
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
                obj.pagination.children[1].appendChild(paginationItem);
                if (obj.pageNumber == i - 1) {
                    paginationItem.classList.add("jss_page_selected");
                }
            }
            // Last
            if (finalNumber < quantyOfPages) {
                const paginationItem = document.createElement("div");
                paginationItem.className = "jss_page";
                paginationItem.innerHTML = ">";
                paginationItem.title = quantyOfPages.toString();
                obj.pagination.children[1].appendChild(paginationItem);
            }
            // Text
            const format = function (format, ...args) {
                return format.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != "undefined" ? args[number] : match;
                });
            };
            obj.pagination.children[0].innerHTML = format(jsuites_1.default.translate("Showing page {0} of {1} entries"), (obj.pageNumber + 1).toString(), quantyOfPages.toString());
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
    const quantityPerPage = parseInt(obj.options.pagination);
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
        if ((obj.options.search == true || obj.options.filters == true) &&
            obj.results) {
            obj.tbody.appendChild(obj.rows[results[j]].element);
        }
        else {
            obj.tbody.appendChild(obj.rows[j].element);
        }
    }
    if (obj.options.pagination > 0) {
        exports.updatePagination.call(obj);
    }
    // Update corner position
    selection_1.updateCornerPosition.call(obj);
    // Events
    dispatch_1.default.call(obj, "onchangepage", obj, pageNumber, oldPage, obj.options.pagination);
};
exports.page = page;
const quantiyOfPages = function () {
    const obj = this;
    let results;
    if ((obj.options.search == true || obj.options.filters == true) &&
        obj.results) {
        results = obj.results.length;
    }
    else {
        results = obj.rows.length;
    }
    return Math.ceil(results / obj.options.pagination);
};
exports.quantiyOfPages = quantiyOfPages;
