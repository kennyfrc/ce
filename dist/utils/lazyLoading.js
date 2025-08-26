/**
 * Go to a page in a lazyLoading
 */
export var loadPage = function (pageNumber) {
    var obj = this;
    // Search
    var results;
    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
        results = obj.results;
    }
    else {
        results = obj.rows;
    }
    // Per page
    var quantityPerPage = 100;
    // pageNumber
    if (pageNumber == null || pageNumber == -1) {
        // Last page
        pageNumber = Math.ceil(results.length / quantityPerPage) - 1;
    }
    var startRow = (pageNumber * quantityPerPage);
    var finalRow = (pageNumber * quantityPerPage) + quantityPerPage;
    if (finalRow > results.length) {
        finalRow = results.length;
    }
    startRow = finalRow - 100;
    if (startRow < 0) {
        startRow = 0;
    }
    // Appeding items
    for (var j = startRow; j < finalRow; j++) {
        if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
            obj.tbody.appendChild(obj.rows[results[j]].element);
        }
        else {
            obj.tbody.appendChild(obj.rows[j].element);
        }
        if (obj.tbody.children.length > quantityPerPage) {
            obj.tbody.removeChild(obj.tbody.firstChild);
        }
    }
};
export var loadValidation = function () {
    var obj = this;
    if (obj.selectedCell) {
        var currentPage = parseInt(obj.tbody.firstChild.getAttribute('data-y')) / 100;
        var selectedPage = parseInt(obj.selectedCell[3] / 100);
        var totalPages = parseInt(obj.rows.length / 100);
        if (currentPage != selectedPage && selectedPage <= totalPages) {
            if (!Array.prototype.indexOf.call(obj.tbody.children, obj.rows[obj.selectedCell[3]].element)) {
                obj.loadPage(selectedPage);
                return true;
            }
        }
    }
    return false;
};
export var loadUp = function () {
    var obj = this;
    // Search
    var results;
    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
        results = obj.results;
    }
    else {
        results = obj.rows;
    }
    var test = 0;
    if (results.length > 100) {
        // Get the first element in the page
        var item = parseInt(obj.tbody.firstChild.getAttribute('data-y'));
        if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
            item = results.indexOf(item);
        }
        if (item > 0) {
            for (var j = 0; j < 30; j++) {
                item = item - 1;
                if (item > -1) {
                    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
                        obj.tbody.insertBefore(obj.rows[results[item]].element, obj.tbody.firstChild);
                    }
                    else {
                        obj.tbody.insertBefore(obj.rows[item].element, obj.tbody.firstChild);
                    }
                    if (obj.tbody.children.length > 100) {
                        obj.tbody.removeChild(obj.tbody.lastChild);
                        test = 1;
                    }
                }
            }
        }
    }
    return test;
};
export var loadDown = function () {
    var obj = this;
    // Search
    var results;
    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
        results = obj.results;
    }
    else {
        results = obj.rows;
    }
    var test = 0;
    if (results.length > 100) {
        // Get the last element in the page
        var item = parseInt(obj.tbody.lastChild.getAttribute('data-y'));
        if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
            item = results.indexOf(item);
        }
        if (item < obj.rows.length - 1) {
            for (var j = 0; j <= 30; j++) {
                if (item < results.length) {
                    if ((obj.options.search == true || obj.options.filters == true) && obj.results) {
                        obj.tbody.appendChild(obj.rows[results[item]].element);
                    }
                    else {
                        obj.tbody.appendChild(obj.rows[item].element);
                    }
                    if (obj.tbody.children.length > 100) {
                        obj.tbody.removeChild(obj.tbody.firstChild);
                        test = 1;
                    }
                }
                item = item + 1;
            }
        }
    }
    return test;
};
//# sourceMappingURL=lazyLoading.js.map