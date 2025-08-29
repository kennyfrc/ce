"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRowData = exports.getRowData = exports.hideRow = exports.showRow = exports.setHeight = exports.getHeight = exports.deleteRow = exports.moveRow = exports.insertRow = exports.createRow = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const columns_1 = require("./columns");
const internal_1 = require("./internal");
const dispatch_1 = __importDefault(require("./dispatch"));
const merges_1 = require("./merges");
const selection_1 = require("./selection");
const history_1 = require("./history");
const internalHelpers_1 = require("./internalHelpers");
/**
 * Safely get cell value from data array, handling both array and object shapes
 */
function getCellValue(data, row, col) {
    if (!data || !data[row])
        return "";
    if (Array.isArray(data[row])) {
        return data[row][col] || "";
    }
    else {
        return data[row][col] || "";
    }
}
/**
 * Create row
 */
const createRow = function (j, data) {
    var _a, _b;
    const obj = this;
    // Create container
    if (!obj.records[j]) {
        obj.records[j] = [];
    }
    // Default data
    if (!data) {
        if (Array.isArray((_a = obj.options.data) === null || _a === void 0 ? void 0 : _a[j])) {
            data = obj.options.data[j];
        }
        else if ((_b = obj.options.data) === null || _b === void 0 ? void 0 : _b[j]) {
            // Convert object data to array if needed
            const objData = obj.options.data[j];
            data = [];
            for (let i = 0; i < obj.headers.length; i++) {
                data[i] = objData[i] || "";
            }
        }
        else {
            data = [];
        }
    }
    // New line of data to be append in the table
    const row = {
        element: document.createElement("tr"),
        y: j,
        cells: [], // Will be populated below
        index: j,
        height: parseInt(String(obj.options.defaultRowHeight || "20"), 10) || 20,
    };
    obj.rows[j] = row;
    row.element.setAttribute("data-y", j.toString());
    // Index
    let index = null;
    // Set default row height
    if (obj.options.defaultRowHeight) {
        row.element.style.height = obj.options.defaultRowHeight + "px";
    }
    // Definitions
    if (obj.options.rows && obj.options.rows[j]) {
        const rowDef = obj.options.rows[j];
        if (rowDef.height) {
            row.element.style.height = String(rowDef.height);
        }
        if (rowDef.title) {
            index = rowDef.title;
        }
    }
    if (!index) {
        index = j + 1;
    }
    // Row number label
    const td = document.createElement("td");
    td.innerHTML = index.toString();
    td.setAttribute("data-y", j.toString());
    td.className = "jss_row";
    row.element.appendChild(td);
    const numberOfColumns = columns_1.getNumberOfColumns.call(obj);
    // Data columns
    for (let i = 0; i < numberOfColumns; i++) {
        // New column of data to be append in the line
        obj.records[j][i] = {
            element: internal_1.createCell.call(this, i, j, data && data[i] !== undefined ? data[i] : ""),
            x: i,
            y: j,
        };
        // Add column to the row
        row.element.appendChild(obj.records[j][i].element);
        if (obj.options.columns &&
            obj.options.columns[i] &&
            typeof obj.options.columns[i].render === "function") {
            obj.options.columns[i].render(obj.records[j][i].element, data && data[i] !== undefined ? data[i] : "", "" + i, "" + j, obj, obj.options.columns[i]);
        }
    }
    // Add row to the table body
    return row;
};
exports.createRow = createRow;
/**
 * Insert a new row
 *
 * @param mixed - number of blank lines to be insert or a single array with the data of the new row
 * @param rowNumber
 * @param insertBefore
 * @return void
 */
const insertRow = function (mixed, rowNumber, insertBefore) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const obj = this;
    // Configuration
    if (obj.options.allowInsertRow != false) {
        // Records
        var records = [];
        // Data to be insert
        let data = [];
        // The insert could be lead by number of rows or the array of data
        let numOfRows;
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
        const lastRow = ((_b = (_a = obj.options.data) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 1) - 1;
        if (rowNumber == undefined || rowNumber >= lastRow || rowNumber < 0) {
            rowNumber = lastRow;
        }
        const onbeforeinsertrowRecords = [];
        for (let row = 0; row < numOfRows; row++) {
            const newRow = [];
            for (let col = 0; col < ((_d = (_c = obj.options.columns) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0); col++) {
                newRow[col] = data[col] ? data[col] : "";
            }
            onbeforeinsertrowRecords.push({
                row: row + rowNumber + (insertBefore ? 0 : 1),
                data: newRow,
            });
        }
        // Onbeforeinsertrow
        if (dispatch_1.default.call(obj, "onbeforeinsertrow", obj, onbeforeinsertrowRecords) ===
            false) {
            return false;
        }
        // Merged cells
        if (obj.options.mergeCells &&
            Object.keys(obj.options.mergeCells).length > 0) {
            if (merges_1.isRowMerged.call(obj, rowNumber, insertBefore).length) {
                if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                    return false;
                }
                else {
                    if (typeof obj.destroyMerge === "function") {
                        obj.destroyMerge();
                    }
                }
            }
        }
        // Clear any search
        if (obj.options.search == true) {
            if (obj.results && obj.results.length != obj.rows.length) {
                if (confirm(jsuites_1.default.translate("This action will clear your search results. Are you sure?"))) {
                    if (obj.parent && typeof obj.parent.resetSearch === "function") {
                        obj.parent.resetSearch();
                    }
                }
                else {
                    return false;
                }
            }
            obj.results = null;
        }
        // Insertbefore
        const rowIndex = !insertBefore ? rowNumber + 1 : rowNumber;
        // Keep the current data
        const currentRecords = obj.records.splice(rowIndex);
        const currentData = ((_e = obj.options.data) === null || _e === void 0 ? void 0 : _e.splice(rowIndex)) || [];
        const currentRows = obj.rows.splice(rowIndex);
        // Adding lines
        const rowRecords = [];
        const rowData = [];
        const rowNode = [];
        for (let row = rowIndex; row < numOfRows + rowIndex; row++) {
            // Push data to the data container
            if (!obj.options.data) {
                obj.options.data = [];
            }
            obj.options.data[row] = [];
            for (let col = 0; col < ((_g = (_f = obj.options.columns) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 0); col++) {
                obj.options.data[row][col] = data[col] ? data[col] : "";
            }
            // Create row
            const currentRow = Array.isArray((_h = obj.options.data) === null || _h === void 0 ? void 0 : _h[row])
                ? obj.options.data[row]
                : undefined;
            const newRow = exports.createRow.call(obj, row, currentRow);
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
            rowRecords.push(obj.records[row].map(cell => cell.value || ""));
            const currentRowData = Array.isArray((_j = obj.options.data) === null || _j === void 0 ? void 0 : _j[row])
                ? [...obj.options.data[row]]
                : [];
            rowData.push(currentRowData || []);
            rowNode.push(newRow);
        }
        // Copy the data back to the main data
        Array.prototype.push.apply(obj.records, currentRecords);
        if (obj.options.data) {
            Array.prototype.push.apply(obj.options.data, currentData);
        }
        Array.prototype.push.apply(obj.rows, currentRows);
        for (let j = rowIndex; j < obj.rows.length; j++) {
            obj.rows[j].y = j;
        }
        for (let j = rowIndex; j < obj.records.length; j++) {
            for (let i = 0; i < obj.records[j].length; i++) {
                obj.records[j][i].y = j;
            }
        }
        // Respect pagination
        if (typeof obj.options.pagination === 'number' && obj.options.pagination > 0 && obj.page && obj.pageNumber !== undefined) {
            obj.page(obj.pageNumber);
        }
        // Keep history
        history_1.setHistory.call(obj, {
            action: "insertRow",
            rowNumber: rowNumber,
            numOfRows: numOfRows,
            insertBefore: insertBefore,
            rowRecords: rowRecords,
            rowData: rowData,
            rowNode: rowNode,
        });
        // Remove table references
        internal_1.updateTableReferences.call(obj);
        // Events
        dispatch_1.default.call(obj, "oninsertrow", obj, onbeforeinsertrowRecords);
    }
    return true;
};
exports.insertRow = insertRow;
/**
 * Move row
 *
 * @return void
 */
const moveRow = function (o, d, ignoreDom) {
    var _a;
    const obj = this;
    if (obj.options.mergeCells &&
        Object.keys(obj.options.mergeCells).length > 0) {
        let insertBefore;
        if (o > d) {
            insertBefore = true;
        }
        else {
            insertBefore = false;
        }
        if (merges_1.isRowMerged.call(obj, o, undefined).length ||
            merges_1.isRowMerged.call(obj, d, insertBefore).length) {
            if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                return false;
            }
            else {
                (_a = obj.destroyMerge) === null || _a === void 0 ? void 0 : _a.call(obj);
            }
        }
    }
    if (obj.options.search == true) {
        if (obj.results && obj.results.length != obj.rows.length) {
            if (confirm(jsuites_1.default.translate("This action will clear your search results. Are you sure?"))) {
                if (obj.parent && typeof obj.parent.resetSearch === "function") {
                    obj.parent.resetSearch();
                }
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
    if (obj.options.data && Array.isArray(obj.options.data)) {
        obj.options.data.splice(d, 0, obj.options.data.splice(o, 1)[0]);
    }
    const firstAffectedIndex = Math.min(o, d);
    const lastAffectedIndex = Math.max(o, d);
    for (let j = firstAffectedIndex; j <= lastAffectedIndex; j++) {
        obj.rows[j].y = j;
    }
    for (let j = firstAffectedIndex; j <= lastAffectedIndex; j++) {
        for (let i = 0; i < obj.records[j].length; i++) {
            obj.records[j][i].y = j;
        }
    }
    // Respect pagination
    if (typeof obj.options.pagination === 'number' &&
        obj.options.pagination > 0 &&
        obj.tbody.children.length != obj.options.pagination &&
        obj.page &&
        obj.pageNumber !== undefined) {
        obj.page(obj.pageNumber);
    }
    // Keeping history of changes
    history_1.setHistory.call(obj, {
        action: "moveRow",
        oldValue: o,
        newValue: d,
    });
    // Update table references
    internal_1.updateTableReferences.call(obj);
    // Events
    dispatch_1.default.call(obj, "onmoverow", obj, o, d, 1);
};
exports.moveRow = moveRow;
/**
 * Delete a row by number
 *
 * @param integer rowNumber - row number to be excluded
 * @param integer numOfRows - number of lines
 * @return void
 */
const deleteRow = function (rowNumber, numOfRows) {
    var _a, _b, _c, _d;
    const obj = this;
    // Ensure data exists
    if (!obj.options.data) {
        return false;
    }
    // Global Configuration
    if (obj.options.allowDeleteRow != false) {
        if (obj.options.allowDeletingAllRows == true ||
            obj.options.data.length > 1) {
            // Delete row definitions
            if (rowNumber == undefined) {
                const number = selection_1.getSelectedRows.call(obj, false);
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
            let lastRow = obj.options.data.length - 1;
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
            const onbeforedeleterowRecords = [];
            for (let i = 0; i < numOfRows; i++) {
                onbeforedeleterowRecords.push(i + rowNumber);
            }
            if (dispatch_1.default.call(obj, "onbeforedeleterow", obj, onbeforedeleterowRecords) === false) {
                return false;
            }
            if (rowNumber > -1) {
                // Merged cells
                let mergeExists = false;
                if (obj.options.mergeCells &&
                    Object.keys(obj.options.mergeCells).length > 0) {
                    for (let row = rowNumber; row < rowNumber + numOfRows; row++) {
                        if (merges_1.isRowMerged.call(obj, row, false).length) {
                            mergeExists = true;
                        }
                    }
                }
                if (mergeExists) {
                    if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                        return false;
                    }
                    else {
                        (_a = obj.destroyMerge) === null || _a === void 0 ? void 0 : _a.call(obj);
                    }
                }
                // Clear any search
                if (obj.options.search == true) {
                    if (obj.results && obj.results.length != obj.rows.length) {
                        if (confirm(jsuites_1.default.translate("This action will clear your search results. Are you sure?"))) {
                            if (obj.parent && typeof obj.parent.resetSearch === "function") {
                                obj.parent.resetSearch();
                            }
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
                for (let row = rowNumber; row < rowNumber + numOfRows; row++) {
                    if (Array.prototype.indexOf.call(obj.tbody.children, obj.rows[row].element) >= 0) {
                        obj.rows[row].element.className = "";
                        (_b = obj.rows[row].element.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(obj.rows[row].element);
                    }
                }
                // Remove data
                const rowRecords = obj.records.splice(rowNumber, numOfRows);
                const rowData = obj.options.data.splice(rowNumber, numOfRows);
                const rowNode = obj.rows.splice(rowNumber, numOfRows);
                for (let j = rowNumber; j < obj.rows.length; j++) {
                    obj.rows[j].y = j;
                }
                for (let j = rowNumber; j < obj.records.length; j++) {
                    for (let i = 0; i < obj.records[j].length; i++) {
                        obj.records[j][i].y = j;
                    }
                }
                // Respect pagination
                if (obj.options.pagination &&
                    typeof obj.options.pagination === 'number' &&
                    obj.options.pagination > 0 &&
                    obj.tbody.children.length != obj.options.pagination) {
                    (_c = obj.page) === null || _c === void 0 ? void 0 : _c.call(obj, (_d = obj.pageNumber) !== null && _d !== void 0 ? _d : 0);
                }
                // Remove selection
                selection_1.conditionalSelectionUpdate.call(obj, 1, rowNumber, rowNumber + numOfRows - 1);
                // Keep history
                history_1.setHistory.call(obj, {
                    action: "deleteRow",
                    rowNumber: rowNumber,
                    numOfRows: numOfRows,
                    insertBefore: true,
                    rowRecords: rowRecords,
                    rowData: rowData,
                    rowNode: rowNode,
                });
                // Remove table references
                internal_1.updateTableReferences.call(obj);
                // Events
                dispatch_1.default.call(obj, "ondeleterow", obj, onbeforedeleterowRecords);
            }
        }
        else {
            console.error("Jspreadsheet: It is not possible to delete the last row");
        }
    }
};
exports.deleteRow = deleteRow;
/**
 * Get the row height
 *
 * @param row - row number (first row is: 0)
 * @return height - current row height
 */
const getHeight = function (row) {
    const obj = this;
    let data;
    if (typeof row === "undefined") {
        // Get height of all rows
        data = [];
        for (let j = 0; j < obj.rows.length; j++) {
            const h = obj.rows[j].element.style.height;
            if (h) {
                data[j] = parseInt(h) || 0;
            }
        }
    }
    else {
        // In case the row is an object
        if (typeof row == "object") {
            const rowElement = $(row);
            const dataY = rowElement.getAttribute("data-y");
            if (dataY) {
                row = parseInt(dataY);
            }
        }
        data = parseInt(obj.rows[row].element.style.height) || 0;
    }
    return data;
};
exports.getHeight = getHeight;
/**
 * Set the row height
 *
 * @param row - row number (first row is: 0)
 * @param height - new row height
 * @param oldHeight - old row height
 */
const setHeight = function (row, height, oldHeight) {
    const obj = this;
    if (height > 0) {
        // Old height
        if (!oldHeight) {
            const heightAttr = obj.rows[row].element.getAttribute("height");
            if (heightAttr) {
                oldHeight = parseInt(heightAttr) || undefined;
            }
            if (!oldHeight) {
                const rect = obj.rows[row].element.getBoundingClientRect();
                oldHeight = rect.height;
            }
        }
        // Ensure integer
        height = Math.round(height);
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
        history_1.setHistory.call(obj, {
            action: "setHeight",
            row: row,
            oldValue: oldHeight,
            newValue: height,
        });
        // On resize column
        dispatch_1.default.call(obj, "onresizerow", obj, row, height, oldHeight);
        // Update corner position
        selection_1.updateCornerPosition.call(obj);
    }
};
exports.setHeight = setHeight;
/**
 * Show row
 */
const showRow = function (rowNumber) {
    const obj = this;
    if (!Array.isArray(rowNumber)) {
        rowNumber = [rowNumber];
    }
    rowNumber.forEach(function (rowIndex) {
        obj.rows[rowIndex].element.style.display = "";
    });
};
exports.showRow = showRow;
/**
 * Hide row
 */
const hideRow = function (rowNumber) {
    const obj = this;
    if (!Array.isArray(rowNumber)) {
        rowNumber = [rowNumber];
    }
    rowNumber.forEach(function (rowIndex) {
        obj.rows[rowIndex].element.style.display = "none";
    });
};
exports.hideRow = hideRow;
/**
 * Get a row data by rowNumber
 */
const getRowData = function (rowNumber, processed) {
    var _a;
    const obj = this;
    if (processed) {
        return obj.records[rowNumber].map(function (record) {
            return record.element.innerHTML;
        });
    }
    else {
        return (((_a = obj.options.data) === null || _a === void 0 ? void 0 : _a[rowNumber]) || []).map(v => String(v));
    }
};
exports.getRowData = getRowData;
/**
 * Set a row data by rowNumber
 */
const setRowData = function (rowNumber, data, force) {
    var _a;
    const obj = this;
    for (let i = 0; i < obj.headers.length; i++) {
        // Update cell
        const columnName = (0, internalHelpers_1.getColumnNameFromId)([i, rowNumber]);
        // Set value
        if (data[i] != null) {
            (_a = obj.setValue) === null || _a === void 0 ? void 0 : _a.call(obj, columnName, data[i], force);
        }
    }
};
exports.setRowData = setRowData;
