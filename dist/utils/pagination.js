import jSuites from 'jsuites';
import dispatch from "./dispatch.js";
import { updateCornerPosition } from "./selection.js";
/**
 * Which page the row is
 */
export var whichPage = function (row) {
    var obj = this;
    // Search
    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
        row = obj.results.indexOf(row);
    }
    return (Math.ceil((parseInt(row) + 1) / parseInt(obj.options.pagination))) - 1;
};
/**
 * Update the pagination
 */
export var updatePagination = function () {
    var obj = this;
    // Reset container
    obj.pagination.children[0].innerHTML = '';
    obj.pagination.children[1].innerHTML = '';
    // Start pagination
    if (obj.options.pagination) {
        // Searchable
        var results = void 0;
        if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
            results = obj.results.length;
        }
        else {
            results = obj.rows.length;
        }
        if (!results) {
            // No records found
            obj.pagination.children[0].innerHTML = jSuites.translate('No records found');
        }
        else {
            // Pagination container
            var quantyOfPages = Math.ceil(results / obj.options.pagination);
            var startNumber = void 0, finalNumber = void 0;
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
                var paginationItem = document.createElement('div');
                paginationItem.className = 'jss_page';
                paginationItem.innerHTML = '<';
                paginationItem.title = 1;
                obj.pagination.children[1].appendChild(paginationItem);
            }
            // Get page links
            for (var i = startNumber; i <= finalNumber; i++) {
                var paginationItem = document.createElement('div');
                paginationItem.className = 'jss_page';
                paginationItem.innerHTML = i;
                obj.pagination.children[1].appendChild(paginationItem);
                if (obj.pageNumber == (i - 1)) {
                    paginationItem.classList.add('jss_page_selected');
                }
            }
            // Last
            if (finalNumber < quantyOfPages) {
                var paginationItem = document.createElement('div');
                paginationItem.className = 'jss_page';
                paginationItem.innerHTML = '>';
                paginationItem.title = quantyOfPages;
                obj.pagination.children[1].appendChild(paginationItem);
            }
            // Text
            var format = function (format) {
                var args = Array.prototype.slice.call(arguments, 1);
                return format.replace(/{(\d+)}/g, function (match, number) {
                    return typeof args[number] != 'undefined'
                        ? args[number]
                        : match;
                });
            };
            obj.pagination.children[0].innerHTML = format(jSuites.translate('Showing page {0} of {1} entries'), obj.pageNumber + 1, quantyOfPages);
        }
    }
};
/**
 * Go to page
 */
export var page = function (pageNumber) {
    var obj = this;
    var oldPage = obj.pageNumber;
    // Search
    var results;
    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
        results = obj.results;
    }
    else {
        results = obj.rows;
    }
    // Per page
    var quantityPerPage = parseInt(obj.options.pagination);
    // pageNumber
    if (pageNumber == null || pageNumber == -1) {
        // Last page
        pageNumber = Math.ceil(results.length / quantityPerPage) - 1;
    }
    // Page number
    obj.pageNumber = pageNumber;
    var startRow = (pageNumber * quantityPerPage);
    var finalRow = (pageNumber * quantityPerPage) + quantityPerPage;
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
    for (var j = startRow; j < finalRow; j++) {
        if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
            obj.tbody.appendChild(obj.rows[results[j]].element);
        }
        else {
            obj.tbody.appendChild(obj.rows[j].element);
        }
    }
    if (obj.options.pagination > 0) {
        updatePagination.call(obj);
    }
    // Update corner position
    updateCornerPosition.call(obj);
    // Events
    dispatch.call(obj, 'onchangepage', obj, pageNumber, oldPage, obj.options.pagination);
};
export var quantiyOfPages = function () {
    var obj = this;
    var results;
    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
        results = obj.results.length;
    }
    else {
        results = obj.rows.length;
    }
    return Math.ceil(results / obj.options.pagination);
};
//# sourceMappingURL=pagination.js.map