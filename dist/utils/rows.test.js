var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { getNumberOfColumns } from "./columns";
import { createCell, updateTableReferences } from "./internal";
import dispatch from "./dispatch";
import { isRowMerged } from "./merges";
import { conditionalSelectionUpdate, getSelectedRows, updateCornerPosition, } from "./selection";
import { setHistory } from "./history";
import { getColumnNameFromId } from "./internalHelpers";
/**
 * Create row
 */
export var createRow = function (j, data) {
    var obj = this;
    // Create container
    if (!obj.records[j]) {
        obj.records[j] = [];
    }
    // Default data
    if (!data) {
        data = obj.options.data[j];
    }
    // New line of data to be append in the table
    var row = {
        element: document.createElement("tr"),
        y: j,
    };
    obj.rows[j] = row;
    row.element.setAttribute("data-y", j.toString());
    // Index
    var index = null;
    // Set default row height
    if (obj.options.defaultRowHeight) {
        row.element.style.height = obj.options.defaultRowHeight + "px";
    }
    // Definitions
    if (obj.options.rows && obj.options.rows[j]) {
        if (obj.options.rows[j].height) {
            row.element.style.height = obj.options.rows[j].height;
        }
        if (obj.options.rows[j].title) {
            index = obj.options.rows[j].title;
        }
    }
    if (!index) {
        index = j + 1;
    }
    // Row number label
    var td = document.createElement("td");
    td.innerHTML = index.toString();
    td.setAttribute("data-y", j.toString());
    td.className = "jss_row";
    row.element.appendChild(td);
    var numberOfColumns = getNumberOfColumns.call(obj);
    // Data columns
    for (var i = 0; i < numberOfColumns; i++) {
        // New column of data to be append in the line
        obj.records[j][i] = {
            element: createCell.call(this, i, j, data ? data[i] : undefined),
            x: i,
            y: j,
        };
        // Add column to the row
        row.element.appendChild(obj.records[j][i].element);
        if (obj.options.columns &&
            obj.options.columns[i] &&
            typeof obj.options.columns[i].render === "function") {
            obj.options.columns[i].render(obj.records[j][i].element, data ? data[i] : undefined, "" + i, "" + j, obj, obj.options.columns[i]);
        }
    }
    // Add row to the table body
    return row;
};
/**
 * Insert a new row
 *
 * @param mixed - number of blank lines to be insert or a single array with the data of the new row
 * @param rowNumber
 * @param insertBefore
 * @return void
 */
export var insertRow = function (mixed, rowNumber, insertBefore) {
    var obj = this;
    // Configuration
    if (obj.options.allowInsertRow != false) {
        // Records
        var records = [];
        // Data to be insert
        var data = [];
        // The insert could be lead by number of rows or the array of data
        var numOfRows = void 0;
        if (!Array.isArray(mixed)) {
            numOfRows = typeof mixed !== "undefined" ? mixed : 1;
        }
        else {
            numOfRows = 1;
            if (mixed) {
                data = mixed;
            }
        }
        // Direction
        insertBefore = insertBefore ? true : false;
        // Current column number
        var lastRow = obj.options.data.length - 1;
        if (rowNumber == undefined || rowNumber >= lastRow || rowNumber < 0) {
            rowNumber = lastRow;
        }
        var onbeforeinsertrowRecords = [];
        for (var row = 0; row < numOfRows; row++) {
            var newRow = [];
            for (var col = 0; col < obj.options.columns.length; col++) {
                newRow[col] = data[col] ? data[col] : "";
            }
            onbeforeinsertrowRecords.push({
                row: row + rowNumber + (insertBefore ? 0 : 1),
                data: newRow,
            });
        }
        // Onbeforeinsertrow
        if (dispatch.call(obj, "onbeforeinsertrow", obj, onbeforeinsertrowRecords) ===
            false) {
            return false;
        }
        // Merged cells
        if (obj.options.mergeCells &&
            Object.keys(obj.options.mergeCells).length > 0) {
            if (isRowMerged.call(obj, rowNumber, insertBefore).length) {
                if (!confirm(jSuites.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                    return false;
                }
                else {
                    obj.destroyMerge();
                }
            }
        }
        // Clear any search
        if (obj.options.search == true) {
            if (obj.results && obj.results.length != obj.rows.length) {
                if (confirm(jSuites.translate("This action will clear your search results. Are you sure?"))) {
                    obj.resetSearch();
                }
                else {
                    return false;
                }
            }
            obj.results = null;
        }
        // Insertbefore
        var rowIndex = !insertBefore ? rowNumber + 1 : rowNumber;
        // Keep the current data
        var currentRecords = obj.records.splice(rowIndex);
        var currentData = obj.options.data.splice(rowIndex);
        var currentRows = obj.rows.splice(rowIndex);
        // Adding lines
        var rowRecords = [];
        var rowData = [];
        var rowNode = [];
        for (var row = rowIndex; row < numOfRows + rowIndex; row++) {
            // Push data to the data container
            obj.options.data[row] = [];
            for (var col = 0; col < obj.options.columns.length; col++) {
                obj.options.data[row][col] = data[col] ? data[col] : "";
            }
            // Create row
            var newRow = createRow.call(obj, row, obj.options.data[row]);
            // Append node
            if (currentRows[0]) {
                if (Array.prototype.indexOf.call(obj.tbody.children, currentRows[0].element) >= 0) {
                    obj.tbody.insertBefore(newRow.element, currentRows[0].element);
                }
            }
            else {
                if (Array.prototype.indexOf.call(obj.tbody.children, obj.rows[rowNumber].element) >= 0) {
                    obj.tbody.appendChild(newRow.element);
                }
            }
            // Record History
            rowRecords.push(__spreadArray([], obj.records[row], true));
            rowData.push(__spreadArray([], obj.options.data[row], true));
            rowNode.push(newRow);
        }
        // Copy the data back to the main data
        Array.prototype.push.apply(obj.records, currentRecords);
        Array.prototype.push.apply(obj.options.data, currentData);
        Array.prototype.push.apply(obj.rows, currentRows);
        for (var j = rowIndex; j < obj.rows.length; j++) {
            obj.rows[j].y = j;
        }
        for (var j = rowIndex; j < obj.records.length; j++) {
            for (var i = 0; i < obj.records[j].length; i++) {
                obj.records[j][i].y = j;
            }
        }
        // Respect pagination
        if (obj.options.pagination > 0) {
            obj.page(obj.pageNumber);
        }
        // Keep history
        setHistory.call(obj, {
            action: "insertRow",
            rowNumber: rowNumber,
            numOfRows: numOfRows,
            insertBefore: insertBefore,
            rowRecords: rowRecords,
            rowData: rowData,
            rowNode: rowNode,
        });
        // Remove table references
        updateTableReferences.call(obj);
        // Events
        dispatch.call(obj, "oninsertrow", obj, onbeforeinsertrowRecords);
    }
    return true;
};
/**
 * Move row
 *
 * @return void
 */
export var moveRow = function (o, d, ignoreDom) {
    var obj = this;
    if (obj.options.mergeCells &&
        Object.keys(obj.options.mergeCells).length > 0) {
        var insertBefore = void 0;
        if (o > d) {
            insertBefore = 1;
        }
        else {
            insertBefore = 0;
        }
        if (isRowMerged.call(obj, o, undefined).length ||
            isRowMerged.call(obj, d, insertBefore).length) {
            if (!confirm(jSuites.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                return false;
            }
            else {
                obj.destroyMerge();
            }
        }
    }
    if (obj.options.search == true) {
        if (obj.results && obj.results.length != obj.rows.length) {
            if (confirm(jSuites.translate("This action will clear your search results. Are you sure?"))) {
                obj.resetSearch();
            }
            else {
                return false;
            }
        }
        obj.results = null;
    }
    if (!ignoreDom) {
        if (Array.prototype.indexOf.call(obj.tbody.children, obj.rows[d].element) >= 0) {
            if (o > d) {
                obj.tbody.insertBefore(obj.rows[o].element, obj.rows[d].element);
            }
            else {
                obj.tbody.insertBefore(obj.rows[o].element, obj.rows[d].element.nextSibling);
            }
        }
        else {
            obj.tbody.removeChild(obj.rows[o].element);
        }
    }
    // Place references in the correct position
    obj.rows.splice(d, 0, obj.rows.splice(o, 1)[0]);
    obj.records.splice(d, 0, obj.records.splice(o, 1)[0]);
    obj.options.data.splice(d, 0, obj.options.data.splice(o, 1)[0]);
    var firstAffectedIndex = Math.min(o, d);
    var lastAffectedIndex = Math.max(o, d);
    for (var j = firstAffectedIndex; j <= lastAffectedIndex; j++) {
        obj.rows[j].y = j;
    }
    for (var j = firstAffectedIndex; j <= lastAffectedIndex; j++) {
        for (var i = 0; i < obj.records[j].length; i++) {
            obj.records[j][i].y = j;
        }
    }
    // Respect pagination
    if (obj.options.pagination > 0 &&
        obj.tbody.children.length != obj.options.pagination) {
        obj.page(obj.pageNumber);
    }
    // Keeping history of changes
    setHistory.call(obj, {
        action: "moveRow",
        oldValue: o,
        newValue: d,
    });
    // Update table references
    updateTableReferences.call(obj);
    // Events
    dispatch.call(obj, "onmoverow", obj, parseInt(o), parseInt(d), 1);
};
/**
 * Delete a row by number
 *
 * @param integer rowNumber - row number to be excluded
 * @param integer numOfRows - number of lines
 * @return void
 */
export var deleteRow = function (rowNumber, numOfRows) {
    var obj = this;
    // Global Configuration
    if (obj.options.allowDeleteRow != false) {
        if (obj.options.allowDeletingAllRows == true ||
            obj.options.data.length > 1) {
            // Delete row definitions
            if (rowNumber == undefined) {
                var number = getSelectedRows.call(obj, false);
                if (number.length === 0) {
                    rowNumber = obj.options.data.length - 1;
                    numOfRows = 1;
                }
                else {
                    rowNumber = number[0];
                    numOfRows = number.length;
                }
            }
            // Last column
            var lastRow = obj.options.data.length - 1;
            if (rowNumber == undefined || rowNumber > lastRow || rowNumber < 0) {
                rowNumber = lastRow;
            }
            if (!numOfRows) {
                numOfRows = 1;
            }
            // Do not delete more than the number of records
            if (rowNumber + numOfRows >= obj.options.data.length) {
                numOfRows = obj.options.data.length - rowNumber;
            }
            // Onbeforedeleterow
            var onbeforedeleterowRecords = [];
            for (var i = 0; i < numOfRows; i++) {
                onbeforedeleterowRecords.push(i + rowNumber);
            }
            if (dispatch.call(obj, "onbeforedeleterow", obj, onbeforedeleterowRecords) === false) {
                return false;
            }
            if (parseInt(rowNumber) > -1) {
                // Merged cells
                var mergeExists = false;
                if (obj.options.mergeCells &&
                    Object.keys(obj.options.mergeCells).length > 0) {
                    for (var row = rowNumber; row < rowNumber + numOfRows; row++) {
                        if (isRowMerged.call(obj, row, false).length) {
                            mergeExists = true;
                        }
                    }
                }
                if (mergeExists) {
                    if (!confirm(jSuites.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                        return false;
                    }
                    else {
                        obj.destroyMerge();
                    }
                }
                // Clear any search
                if (obj.options.search == true) {
                    if (obj.results && obj.results.length != obj.rows.length) {
                        if (confirm(jSuites.translate("This action will clear your search results. Are you sure?"))) {
                            obj.resetSearch();
                        }
                        else {
                            return false;
                        }
                    }
                    obj.results = null;
                }
                // If delete all rows, and set allowDeletingAllRows false, will stay one row
                if (obj.options.allowDeletingAllRows != true &&
                    lastRow + 1 === numOfRows) {
                    numOfRows--;
                    console.error("Jspreadsheet: It is not possible to delete the last row");
                }
                // Remove node
                for (var row = rowNumber; row < rowNumber + numOfRows; row++) {
                    if (Array.prototype.indexOf.call(obj.tbody.children, obj.rows[row].element) >= 0) {
                        obj.rows[row].element.className = "";
                        obj.rows[row].element.parentNode.removeChild(obj.rows[row].element);
                    }
                }
                // Remove data
                var rowRecords = obj.records.splice(rowNumber, numOfRows);
                var rowData = obj.options.data.splice(rowNumber, numOfRows);
                var rowNode = obj.rows.splice(rowNumber, numOfRows);
                for (var j = rowNumber; j < obj.rows.length; j++) {
                    obj.rows[j].y = j;
                }
                for (var j = rowNumber; j < obj.records.length; j++) {
                    for (var i = 0; i < obj.records[j].length; i++) {
                        obj.records[j][i].y = j;
                    }
                }
                // Respect pagination
                if (obj.options.pagination > 0 &&
                    obj.tbody.children.length != obj.options.pagination) {
                    obj.page(obj.pageNumber);
                }
                // Remove selection
                conditionalSelectionUpdate.call(obj, 1, rowNumber, rowNumber + numOfRows - 1);
                // Keep history
                setHistory.call(obj, {
                    action: "deleteRow",
                    rowNumber: rowNumber,
                    numOfRows: numOfRows,
                    insertBefore: 1,
                    rowRecords: rowRecords,
                    rowData: rowData,
                    rowNode: rowNode,
                });
                // Remove table references
                updateTableReferences.call(obj);
                // Events
                dispatch.call(obj, "ondeleterow", obj, onbeforedeleterowRecords);
            }
        }
        else {
            console.error("Jspreadsheet: It is not possible to delete the last row");
        }
    }
};
/**
 * Get the row height
 *
 * @param row - row number (first row is: 0)
 * @return height - current row height
 */
export var getHeight = function (row) {
    var obj = this;
    var data;
    if (typeof row === "undefined") {
        // Get height of all rows
        data = [];
        for (var j = 0; j < obj.rows.length; j++) {
            var h = obj.rows[j].element.style.height;
            if (h) {
                data[j] = h;
            }
        }
    }
    else {
        // In case the row is an object
        if (typeof row == "object") {
            row = window.$(row).getAttribute("data-y");
        }
        data = obj.rows[row].element.style.height;
    }
    return data;
};
/**
 * Set the row height
 *
 * @param row - row number (first row is: 0)
 * @param height - new row height
 * @param oldHeight - old row height
 */
export var setHeight = function (row, height, oldHeight) {
    var obj = this;
    if (height > 0) {
        // Oldwidth
        if (!oldHeight) {
            oldHeight = obj.rows[row].element.getAttribute("height");
            if (!oldHeight) {
                var rect = obj.rows[row].element.getBoundingClientRect();
                oldHeight = rect.height;
            }
        }
        // Integer
        height = parseInt(height);
        // Set width
        obj.rows[row].element.style.height = height + "px";
        if (!obj.options.rows) {
            obj.options.rows = [];
        }
        // Keep options updated
        if (!obj.options.rows[row]) {
            obj.options.rows[row] = {};
        }
        obj.options.rows[row].height = height;
        // Keeping history of changes
        setHistory.call(obj, {
            action: "setHeight",
            row: row,
            oldValue: oldHeight,
            newValue: height,
        });
        // On resize column
        dispatch.call(obj, "onresizerow", obj, row, height, oldHeight);
        // Update corner position
        updateCornerPosition.call(obj);
    }
};
/**
 * Show row
 */
export var showRow = function (rowNumber) {
    var obj = this;
    if (!Array.isArray(rowNumber)) {
        rowNumber = [rowNumber];
    }
    rowNumber.forEach(function (rowIndex) {
        obj.rows[rowIndex].element.style.display = "";
    });
};
/**
 * Hide row
 */
export var hideRow = function (rowNumber) {
    var obj = this;
    if (!Array.isArray(rowNumber)) {
        rowNumber = [rowNumber];
    }
    rowNumber.forEach(function (rowIndex) {
        obj.rows[rowIndex].element.style.display = "none";
    });
};
/**
 * Get a row data by rowNumber
 */
export var getRowData = function (rowNumber, processed) {
    var obj = this;
    if (processed) {
        return obj.records[rowNumber].map(function (record) {
            return record.element.innerHTML;
        });
    }
    else {
        return obj.options.data[rowNumber];
    }
};
/**
 * Set a row data by rowNumber
 */
export var setRowData = function (rowNumber, data, force) {
    var obj = this;
    for (var i = 0; i < obj.headers.length; i++) {
        // Update cell
        var columnName = getColumnNameFromId([i, rowNumber]);
        // Set value
        if (data[i] != null) {
            obj.setValue(columnName, data[i], force);
        }
    }
};
//# sourceMappingURL=rows.test.js.map