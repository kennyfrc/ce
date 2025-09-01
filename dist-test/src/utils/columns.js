"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setColumnData = exports.getColumnData = exports.hideColumn = exports.showColumn = exports.setWidth = exports.getWidth = exports.deleteColumn = exports.moveColumn = exports.insertColumn = exports.createCellHeader = exports.getNumberOfColumns = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const dispatch_1 = __importDefault(require("./dispatch"));
const helpers_1 = require("./helpers");
const history_1 = require("./history");
const merges_1 = require("./merges");
const internal_1 = require("./internal");
const selection_1 = require("./selection");
const footer_1 = require("./footer");
const internalHelpers_1 = require("./internalHelpers");
const getNumberOfColumns = function () {
    const obj = this;
    let numberOfColumns = (obj.options.columns && obj.options.columns.length) || 0;
    if (obj.options.data && obj.options.data.length > 0 && obj.options.data[0] !== undefined) {
        // Data keys
        const firstRow = obj.options.data[0];
        const keys = Array.isArray(firstRow) ? [] : Object.keys(firstRow);
        if (keys.length > numberOfColumns) {
            numberOfColumns = keys.length;
        }
    }
    if (obj.options.minDimensions &&
        obj.options.minDimensions[0] > numberOfColumns) {
        numberOfColumns = obj.options.minDimensions[0];
    }
    return numberOfColumns;
};
exports.getNumberOfColumns = getNumberOfColumns;
const createCellHeader = function (colNumber) {
    const obj = this;
    // Create col global control
    const colWidth = (obj.options.columns &&
        obj.options.columns[colNumber] &&
        obj.options.columns[colNumber].width) ||
        obj.options.defaultColWidth ||
        100;
    const colAlign = (obj.options.columns &&
        obj.options.columns[colNumber] &&
        obj.options.columns[colNumber].align) ||
        obj.options.defaultColAlign ||
        "center";
    // Create header cell
    if (!obj.headers) {
        obj.headers = [];
    }
    obj.headers[colNumber] = document.createElement("td");
    obj.headers[colNumber].textContent =
        (obj.options.columns &&
            obj.options.columns[colNumber] &&
            obj.options.columns[colNumber].title) ||
            (0, helpers_1.getColumnName)(colNumber);
    obj.headers[colNumber].setAttribute("data-x", colNumber.toString());
    obj.headers[colNumber].style.textAlign = colAlign;
    if (obj.options.columns &&
        obj.options.columns[colNumber] &&
        obj.options.columns[colNumber].title) {
        obj.headers[colNumber].setAttribute("title", obj.headers[colNumber].innerText);
    }
    if (obj.options.columns &&
        obj.options.columns[colNumber] &&
        typeof obj.options.columns[colNumber].id === "string") {
        obj.headers[colNumber].setAttribute("id", obj.options.columns[colNumber].id || "");
    }
    // Width control
    const colElement = document.createElement("col");
    colElement.setAttribute("width", colWidth.toString());
    if (!obj.cols) {
        obj.cols = [];
    }
    obj.cols[colNumber] = {
        colElement,
        x: colNumber,
    };
    // Hidden column
    if (obj.options.columns &&
        obj.options.columns[colNumber] &&
        obj.options.columns[colNumber].type == "hidden") {
        obj.headers[colNumber].style.display = "none";
        colElement.style.display = "none";
    }
};
exports.createCellHeader = createCellHeader;
/**
 * Insert a new column
 *
 * @param mixed - num of columns to be added or data to be added in one single column
 * @param int columnNumber - number of columns to be created
 * @param bool insertBefore
 * @param object properties - column properties
 * @return void
 */
const insertColumn = function (mixed, columnNumber, insertBefore, properties) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    const obj = this;
    // Worksheet instance: when this function is called on the spreadsheet
    // context the real worksheet instance is obj.worksheets[0]. When it's
    // called on a worksheet instance, `obj` is already the worksheet. Use
    // `worksheet` for operations that require a WorksheetInstance `this`.
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    // Configuration
    if (worksheet.options.allowInsertColumn != false) {
        // Records
        var records = [];
        // Data to be insert
        let data = [];
        // The insert could be lead by number of rows or the array of data
        let numOfColumns;
        if (!Array.isArray(mixed)) {
            numOfColumns = typeof mixed === "number" ? mixed : 1;
        }
        else {
            numOfColumns = 1;
            if (mixed) {
                data = mixed;
            }
        }
        // Direction
        insertBefore = insertBefore ? true : false;
        // Current column number
        let maxFromData = 0;
        if (worksheet.options.data) {
            for (const row of worksheet.options.data) {
                const len = Array.isArray(row) ? row.length : Object.keys(row).length;
                if (len > maxFromData)
                    maxFromData = len;
            }
        }
        const currentNumOfColumns = Math.max(((_b = worksheet.options.columns) === null || _b === void 0 ? void 0 : _b.length) || 0, maxFromData);
        const lastColumn = currentNumOfColumns - 1;
        // Confirm position
        if (columnNumber == undefined ||
            columnNumber >= lastColumn ||
            columnNumber < 0) {
            columnNumber = lastColumn;
        }
        // Normalize properties to an array of ColumnDefinition
        if (!Array.isArray(properties)) {
            properties = properties ? [properties] : [];
        }
        for (let i = 0; i < numOfColumns; i++) {
            if (!properties[i]) {
                properties[i] = {};
            }
        }
        const columns = [];
        if (!Array.isArray(mixed)) {
            for (let i = 0; i < (mixed || 0); i++) {
                const column = {
                    column: columnNumber + i + (insertBefore ? 0 : 1),
                    options: Object.assign({}, properties[i]),
                };
                columns.push(column);
            }
        }
        else {
            const data = [];
            for (let i = 0; i < (((_c = obj.options.data) === null || _c === void 0 ? void 0 : _c.length) || 0); i++) {
                data.push(i < mixed.length ? mixed[i] : "");
            }
            const column = {
                column: columnNumber + (insertBefore ? 0 : 1),
                options: Object.assign({}, properties[0]),
                data,
            };
            columns.push(column);
        }
        // Onbeforeinsertcolumn
        if (dispatch_1.default.call(obj, "onbeforeinsertcolumn", obj, columns) === false) {
            return false;
        }
        // Merged cells
        if (worksheet.options.mergeCells &&
            Object.keys(worksheet.options.mergeCells).length > 0) {
            if (merges_1.isColMerged.call(worksheet, columnNumber, insertBefore).length) {
                if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                    return false;
                }
                else {
                    (_d = worksheet.destroyMerge) === null || _d === void 0 ? void 0 : _d.call(worksheet);
                }
            }
        }
        // Insert before
        const columnIndex = !insertBefore ? columnNumber + 1 : columnNumber;
        worksheet.options.columns = (0, internalHelpers_1.injectArray)(worksheet.options.columns || [], columnIndex, properties);
        // Open space in the containers
        const currentHeaders = worksheet.headers.splice(columnIndex);
        const currentColgroup = worksheet.cols.splice(columnIndex);
        // History
        const historyHeaders = [];
        const historyColgroup = [];
        const historyRecords = [];
        const historyData = [];
        const historyFooters = [];
        // Add new headers
        for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
            exports.createCellHeader.call(worksheet, col);
            (_e = worksheet.headerContainer) === null || _e === void 0 ? void 0 : _e.insertBefore(worksheet.headers[col], worksheet.headerContainer.children[col + 1]);
            (_f = worksheet.colgroupContainer) === null || _f === void 0 ? void 0 : _f.insertBefore(worksheet.cols[col].colElement, worksheet.colgroupContainer.children[col + 1]);
            historyHeaders.push(worksheet.headers[col]);
            historyColgroup.push(worksheet.cols[col]);
        }
        // Add new footer cells
        if (worksheet.options.footers) {
            for (let j = 0; j < worksheet.options.footers.length; j++) {
                historyFooters[j] = [];
                for (let i = 0; i < numOfColumns; i++) {
                    historyFooters[j].push("");
                }
                worksheet.options.footers[j].splice(columnIndex, 0, ...historyFooters[j]);
            }
        }
        // Adding visual columns
        for (let row = 0; row < (((_g = worksheet.options.data) === null || _g === void 0 ? void 0 : _g.length) || 0); row++) {
            // Keep the current data
            const currentData = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row]))
                ? worksheet.options.data[row].splice(columnIndex)
                : [];
            const currentRecord = worksheet.records[row].splice(columnIndex);
            // History
            historyData[row] = [];
            historyRecords[row] = [];
            for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
                // New value
                const value = data[row] ? data[row] : "";
                if (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row])) {
                    worksheet.options.data[row][col] = value;
                }
                // New cell
                const cellValue = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row]))
                    ? (_h = worksheet.options.data[row][col]) !== null && _h !== void 0 ? _h : ""
                    : "";
                const td = internal_1.createCell.call(worksheet, col, row, cellValue);
                worksheet.records[row][col] = {
                    element: td,
                    x: col,
                    y: row,
                };
                // Add cell to the row
                if (worksheet.rows[row]) {
                    worksheet.rows[row].element.insertBefore(td, worksheet.rows[row].element.children[col + 1]);
                }
                if (worksheet.options.columns &&
                    worksheet.options.columns[col] &&
                    typeof worksheet.options.columns[col].render ===
                        "function") {
                    (_k = (_j = worksheet.options.columns[col]).render) === null || _k === void 0 ? void 0 : _k.call(_j, td, value, col.toString(), row.toString(), worksheet, worksheet.options.columns[col]);
                }
                // Record History
                historyData[row].push(value);
                historyRecords[row].push({ element: td, x: col, y: row });
            }
            // Copy the data back to the main data
            if (worksheet.options.data && worksheet.options.data[row]) {
                Array.prototype.push.apply(worksheet.options.data[row], currentData);
            }
            Array.prototype.push.apply(worksheet.records[row], currentRecord);
        }
        Array.prototype.push.apply(worksheet.headers, currentHeaders);
        Array.prototype.push.apply(worksheet.cols, currentColgroup);
        for (let i = columnIndex; i < worksheet.cols.length; i++) {
            worksheet.cols[i].x = i;
        }
        for (let j = 0; j < worksheet.records.length; j++) {
            for (let i = 0; i < worksheet.records[j].length; i++) {
                worksheet.records[j][i].x = i;
            }
        }
        // Adjust nested headers
        if (worksheet.options.nestedHeaders &&
            worksheet.options.nestedHeaders.length > 0 &&
            worksheet.options.nestedHeaders[0] &&
            worksheet.options.nestedHeaders[0][0]) {
            for (let j = 0; j < worksheet.options.nestedHeaders.length; j++) {
                const colspan = parseInt((worksheet.options.nestedHeaders[j][worksheet.options.nestedHeaders[j].length - 1].colspan || "1").toString()) + numOfColumns;
                worksheet.options.nestedHeaders[j][worksheet.options.nestedHeaders[j].length - 1].colspan = colspan;
                (_o = (_m = (_l = worksheet.thead) === null || _l === void 0 ? void 0 : _l.children[j]) === null || _m === void 0 ? void 0 : _m.children[worksheet.thead.children[j].children.length - 1]) === null || _o === void 0 ? void 0 : _o.setAttribute("colspan", colspan.toString());
                const dataColumn = (_r = (_q = (_p = worksheet.thead) === null || _p === void 0 ? void 0 : _p.children[j]) === null || _q === void 0 ? void 0 : _q.children[worksheet.thead.children[j].children.length - 1]) === null || _r === void 0 ? void 0 : _r.getAttribute("data-column");
                let oArray = (dataColumn === null || dataColumn === void 0 ? void 0 : dataColumn.split(",")) || [];
                for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
                    oArray.push(col.toString());
                }
                (_u = (_t = (_s = worksheet.thead) === null || _s === void 0 ? void 0 : _s.children[j]) === null || _t === void 0 ? void 0 : _t.children[worksheet.thead.children[j].children.length - 1]) === null || _u === void 0 ? void 0 : _u.setAttribute("data-column", oArray.join(","));
            }
        }
        // Keep history
        history_1.setHistory.call(worksheet, {
            action: "insertColumn",
            columnNumber: columnNumber,
            numOfColumns: numOfColumns,
            insertBefore: insertBefore,
            columns: properties,
            headers: historyHeaders,
            cols: historyColgroup,
            records: historyRecords,
            footers: historyFooters,
            data: historyData,
        });
        // Update table references on the worksheet instance
        internal_1.updateTableReferences.call(worksheet);
        // Events
        dispatch_1.default.call(obj, "oninsertcolumn", obj, columns);
    }
};
exports.insertColumn = insertColumn;
/**
 * Move column
 *
 * @return void
 */
const moveColumn = function (o, d) {
    var _a, _b, _c, _d, _e, _f, _g;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    let insertBefore;
    if (o > d) {
        insertBefore = true;
    }
    else {
        insertBefore = false;
    }
    if (merges_1.isColMerged.call(worksheet, o).length ||
        merges_1.isColMerged.call(worksheet, d, !!insertBefore).length) {
        if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
            return false;
        }
        else {
            (_b = worksheet.destroyMerge) === null || _b === void 0 ? void 0 : _b.call(worksheet);
        }
    }
    // o and d are already numbers, no need for parseInt
    if (o > d) {
        (_c = worksheet.headerContainer) === null || _c === void 0 ? void 0 : _c.insertBefore(worksheet.headers[o], worksheet.headers[d]);
        (_d = worksheet.colgroupContainer) === null || _d === void 0 ? void 0 : _d.insertBefore(worksheet.cols[o].colElement, worksheet.cols[d].colElement);
        for (let j = 0; j < worksheet.rows.length; j++) {
            worksheet.rows[j].element.insertBefore(worksheet.records[j][o].element, worksheet.records[j][d].element);
        }
    }
    else {
        (_e = worksheet.headerContainer) === null || _e === void 0 ? void 0 : _e.insertBefore(worksheet.headers[o], worksheet.headers[d].nextSibling);
        (_f = worksheet.colgroupContainer) === null || _f === void 0 ? void 0 : _f.insertBefore(worksheet.cols[o].colElement, worksheet.cols[d].colElement.nextSibling);
        for (let j = 0; j < worksheet.rows.length; j++) {
            worksheet.rows[j].element.insertBefore(worksheet.records[j][o].element, worksheet.records[j][d].element.nextSibling);
        }
    }
    (_g = worksheet.options.columns) === null || _g === void 0 ? void 0 : _g.splice(d, 0, worksheet.options.columns.splice(o, 1)[0]);
    worksheet.headers.splice(d, 0, worksheet.headers.splice(o, 1)[0]);
    worksheet.cols.splice(d, 0, worksheet.cols.splice(o, 1)[0]);
    const firstAffectedIndex = Math.min(o, d);
    const lastAffectedIndex = Math.max(o, d);
    for (let j = 0; j < worksheet.rows.length; j++) {
        if (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[j])) {
            const movedValue = worksheet.options.data[j].splice(o, 1)[0];
            worksheet.options.data[j].splice(d, 0, movedValue);
        }
        worksheet.records[j].splice(d, 0, worksheet.records[j].splice(o, 1)[0]);
    }
    for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
        worksheet.cols[i].x = i;
    }
    for (let j = 0; j < worksheet.records.length; j++) {
        for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
            worksheet.records[j][i].x = i;
        }
    }
    // Update footers position
    if (worksheet.options.footers) {
        for (let j = 0; j < worksheet.options.footers.length; j++) {
            worksheet.options.footers[j].splice(d, 0, worksheet.options.footers[j].splice(o, 1)[0]);
        }
    }
    // Keeping history of changes
    history_1.setHistory.call(worksheet, {
        action: "moveColumn",
        oldValue: o,
        newValue: d,
    });
    // Update table references on the worksheet instance
    internal_1.updateTableReferences.call(worksheet);
    // Events
    dispatch_1.default.call(obj, "onmovecolumn", obj, o, d, 1);
};
exports.moveColumn = moveColumn;
/**
 * Delete a column by number
 *
 * @param integer columnNumber - reference column to be excluded
 * @param integer numOfColumns - number of columns to be excluded from the reference column
 * @return void
 */
const deleteColumn = function (columnNumber, numOfColumns) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    // Global Configuration
    if (worksheet.options.allowDeleteColumn != false) {
        if (worksheet.headers.length > 1) {
            // Delete column definitions
            if (columnNumber == undefined) {
                const number = ((_b = worksheet.getSelectedColumns) === null || _b === void 0 ? void 0 : _b.call(worksheet, true)) || [];
                if (!number.length) {
                    // Remove last column
                    columnNumber = worksheet.headers.length - 1;
                    numOfColumns = 1;
                }
                else {
                    // Remove selected
                    columnNumber = (_c = number[0]) !== null && _c !== void 0 ? _c : 0;
                    numOfColumns = number.length;
                }
            }
            // Last column
            const lastColumn = (worksheet.options.data && Array.isArray(worksheet.options.data) && worksheet.options.data[0] && Array.isArray(worksheet.options.data[0]))
                ? worksheet.options.data[0].length - 1
                : 0;
            if (columnNumber == undefined ||
                columnNumber > lastColumn ||
                columnNumber < 0) {
                columnNumber = lastColumn;
            }
            // Minimum of columns to be delete is 1
            if (!numOfColumns || numOfColumns < 1) {
                numOfColumns = 1;
            }
            // Can't delete more than the limit of the table
            if (worksheet.options.data && Array.isArray(worksheet.options.data) && worksheet.options.data[0] && Array.isArray(worksheet.options.data[0]) &&
                numOfColumns > worksheet.options.data[0].length - columnNumber) {
                numOfColumns = worksheet.options.data[0].length - columnNumber;
            }
            const removedColumns = [];
            for (let i = 0; i < numOfColumns; i++) {
                removedColumns.push(i + columnNumber);
            }
            // onbeforedeletecolumn
            if (dispatch_1.default.call(obj, "onbeforedeletecolumn", obj, removedColumns) ===
                false) {
                return false;
            }
            // Can't remove the last column
            if (columnNumber > -1) {
                // Merged cells
                let mergeExists = false;
                if (worksheet.options.mergeCells &&
                    Object.keys(worksheet.options.mergeCells).length > 0) {
                    for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                        if (merges_1.isColMerged.call(worksheet, col, undefined).length) {
                            mergeExists = true;
                        }
                    }
                }
                if (mergeExists) {
                    if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                        return false;
                    }
                    else {
                        (_d = worksheet.destroyMerge) === null || _d === void 0 ? void 0 : _d.call(worksheet);
                    }
                }
                // Delete the column properties
                const columns = worksheet.options.columns
                    ? worksheet.options.columns.splice(columnNumber, numOfColumns)
                    : undefined;
                for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                    worksheet.cols[col].colElement.className = "";
                    worksheet.headers[col].className = "";
                    (_e = worksheet.cols[col].colElement.parentNode) === null || _e === void 0 ? void 0 : _e.removeChild(worksheet.cols[col].colElement);
                    (_f = worksheet.headers[col].parentNode) === null || _f === void 0 ? void 0 : _f.removeChild(worksheet.headers[col]);
                }
                const historyHeaders = worksheet.headers.splice(columnNumber, numOfColumns);
                const historyColgroup = worksheet.cols.splice(columnNumber, numOfColumns);
                const historyRecords = [];
                const historyData = [];
                const historyFooters = [];
                for (let row = 0; row < (((_g = worksheet.options.data) === null || _g === void 0 ? void 0 : _g.length) || 0); row++) {
                    for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                        worksheet.records[row][col].element.className = "";
                        (_h = worksheet.records[row][col].element.parentNode) === null || _h === void 0 ? void 0 : _h.removeChild(worksheet.records[row][col].element);
                    }
                }
                // Delete headers
                for (let row = 0; row < (((_j = worksheet.options.data) === null || _j === void 0 ? void 0 : _j.length) || 0); row++) {
                    // History
                    historyData[row] = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[row]))
                        ? worksheet.options.data[row].splice(columnNumber, numOfColumns)
                        : [];
                    historyRecords[row] = worksheet.records[row].splice(columnNumber, numOfColumns);
                }
                for (let i = columnNumber; i < worksheet.cols.length; i++) {
                    worksheet.cols[i].x = i;
                }
                for (let j = 0; j < worksheet.records.length; j++) {
                    for (let i = columnNumber; i < worksheet.records[j].length; i++) {
                        worksheet.records[j][i].x = i;
                    }
                }
                // Delete footers
                if (worksheet.options.footers) {
                    for (let row = 0; row < worksheet.options.footers.length; row++) {
                        historyFooters[row] = worksheet.options.footers[row].splice(columnNumber, numOfColumns);
                    }
                }
                // Remove selection
                selection_1.conditionalSelectionUpdate.call(worksheet, 0, columnNumber, columnNumber + numOfColumns - 1);
                // Adjust nested headers
                if (worksheet.options.nestedHeaders &&
                    worksheet.options.nestedHeaders.length > 0 &&
                    worksheet.options.nestedHeaders[0] &&
                    worksheet.options.nestedHeaders[0][0]) {
                    for (let j = 0; j < worksheet.options.nestedHeaders.length; j++) {
                        const colspan = parseInt(String(((_l = (_k = worksheet.options.nestedHeaders[j]) === null || _k === void 0 ? void 0 : _k[worksheet.options.nestedHeaders[j].length - 1]) === null || _l === void 0 ? void 0 : _l.colspan) || "1")) - numOfColumns;
                        worksheet.options.nestedHeaders[j][worksheet.options.nestedHeaders[j].length - 1].colspan = colspan;
                        (_p = (_o = (_m = worksheet.thead) === null || _m === void 0 ? void 0 : _m.children[j]) === null || _o === void 0 ? void 0 : _o.children[worksheet.thead.children[j].children.length - 1]) === null || _p === void 0 ? void 0 : _p.setAttribute("colspan", String(colspan));
                    }
                }
                // Keeping history of changes
                history_1.setHistory.call(worksheet, {
                    action: "deleteColumn",
                    columnNumber: columnNumber,
                    numOfColumns: numOfColumns,
                    insertBefore: true,
                    columns: columns,
                    headers: historyHeaders,
                    cols: historyColgroup,
                    records: historyRecords,
                    footers: historyFooters,
                    data: historyData,
                });
                // Update table references on the worksheet instance
                internal_1.updateTableReferences.call(worksheet);
                // Delete
                dispatch_1.default.call(obj, "ondeletecolumn", obj, removedColumns);
            }
        }
        else {
            console.error("Jspreadsheet: It is not possible to delete the last column");
        }
    }
};
exports.deleteColumn = deleteColumn;
/**
 * Get the column width
 *
 * @param int column column number (first column is: 0)
 * @return int current width
 */
const getWidth = function (column) {
    var _a;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    let data;
    if (typeof column === "undefined") {
        // Get all headers
        data = [];
        for (let i = 0; i < worksheet.headers.length; i++) {
            data.push(Number((worksheet.options.columns &&
                worksheet.options.columns[i] &&
                worksheet.options.columns[i].width) ||
                worksheet.options.defaultColWidth ||
                100));
        }
    }
    else {
        const columnIndex = typeof column === "number"
            ? column
            : parseInt(column.getAttribute("data-x") || "0");
        data = parseInt(worksheet.cols[columnIndex].colElement.getAttribute("width") || "0");
    }
    return data;
};
exports.getWidth = getWidth;
/**
 * Set the column width
 *
 * @param int column number (first column is: 0)
 * @param int new column width
 * @param int old column width
 */
const setWidth = function (column, width, oldWidth) {
    var _a;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    if (width) {
        // Handle both array and non-array cases for oldWidth
        let finalOldWidth = oldWidth || 0;
        if (Array.isArray(column)) {
            // For array column, use an array for oldWidth
            const oldWidthArray = [];
            // Set width
            for (let i = 0; i < column.length; i++) {
                let columnIndex;
                const colItem = column[i];
                if (typeof colItem === "number") {
                    columnIndex = colItem;
                }
                else {
                    columnIndex =
                        parseInt(colItem.getAttribute("data-x") || "0") ||
                            0;
                }
                if (!oldWidthArray[i]) {
                    oldWidthArray[i] = parseInt(worksheet.cols[columnIndex].colElement.getAttribute("width") || "0");
                }
                const w = Array.isArray(width) && width[i] ? width[i] : width;
                worksheet.cols[columnIndex].colElement.setAttribute("width", w);
                if (!worksheet.options.columns) {
                    worksheet.options.columns = [];
                }
                if (!worksheet.options.columns[columnIndex]) {
                    worksheet.options.columns[columnIndex] = {};
                }
                worksheet.options.columns[columnIndex].width = w;
            }
            finalOldWidth = oldWidthArray;
        }
        else {
            const columnIndex = typeof column === "number"
                ? column
                : parseInt(column.getAttribute("data-x") || "0");
            // Oldwidth
            if (!oldWidth) {
                oldWidth = parseInt(worksheet.cols[columnIndex].colElement.getAttribute("width") || "0");
            }
            // Set width
            worksheet.cols[columnIndex].colElement.setAttribute("width", String(width));
            if (!worksheet.options.columns) {
                worksheet.options.columns = [];
            }
            if (!worksheet.options.columns[columnIndex]) {
                worksheet.options.columns[columnIndex] = {};
            }
            worksheet.options.columns[columnIndex].width = width;
        }
        // Keeping history of changes
        const historyColumn = Array.isArray(column)
            ? (typeof column[0] === 'number' ? column[0] : 0)
            : (typeof column === 'number' ? column : 0);
        const historyOldValue = Array.isArray(finalOldWidth) ? finalOldWidth[0] : finalOldWidth;
        history_1.setHistory.call(worksheet, {
            action: "setWidth",
            column: historyColumn,
            oldValue: historyOldValue,
            newValue: width,
        });
        // On resize column
        dispatch_1.default.call(obj, "onresizecolumn", obj, column, width, finalOldWidth);
        // Update corner position: support being called with either a
        // SpreadsheetContext (has worksheets) or a WorksheetInstance (has parent)
        if ("worksheets" in obj && obj.worksheets && obj.worksheets[0]) {
            selection_1.updateCornerPosition.call(obj.worksheets[0]);
        }
        else {
            const maybeParent = obj.parent;
            if (maybeParent && maybeParent.worksheets && maybeParent.worksheets[0]) {
                selection_1.updateCornerPosition.call(maybeParent.worksheets[0]);
            }
        }
    }
};
exports.setWidth = setWidth;
/**
 * Show column
 */
const showColumn = function (colNumber) {
    var _a, _b, _c;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    if (!Array.isArray(colNumber)) {
        colNumber = [colNumber];
    }
    for (let i = 0; i < colNumber.length; i++) {
        const columnIndex = colNumber[i];
        worksheet.headers[columnIndex].style.display = "";
        worksheet.cols[columnIndex].colElement.style.display = "";
        if (worksheet.filter && worksheet.filter.children.length > columnIndex + 1) {
            worksheet.filter.children[columnIndex + 1].style.display = "";
        }
        for (let j = 0; j < (((_b = worksheet.options.data) === null || _b === void 0 ? void 0 : _b.length) || 0); j++) {
            worksheet.records[j][columnIndex].element.style.display = "";
        }
    }
    // Update footers
    if (worksheet.options.footers) {
        footer_1.setFooter.call(worksheet);
    }
    (_c = worksheet.resetSelection) === null || _c === void 0 ? void 0 : _c.call(worksheet);
};
exports.showColumn = showColumn;
/**
 * Hide column
 */
const hideColumn = function (colNumber) {
    var _a, _b, _c;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    if (!Array.isArray(colNumber)) {
        colNumber = [colNumber];
    }
    for (let i = 0; i < colNumber.length; i++) {
        const columnIndex = colNumber[i];
        worksheet.headers[columnIndex].style.display = "none";
        worksheet.cols[columnIndex].colElement.style.display = "none";
        if (worksheet.filter && worksheet.filter.children.length > columnIndex + 1) {
            worksheet.filter.children[columnIndex + 1].style.display =
                "none";
        }
        for (let j = 0; j < (((_b = worksheet.options.data) === null || _b === void 0 ? void 0 : _b.length) || 0); j++) {
            worksheet.records[j][columnIndex].element.style.display = "none";
        }
    }
    // Update footers
    if (worksheet.options.footers) {
        footer_1.setFooter.call(worksheet);
    }
    (_c = worksheet.resetSelection) === null || _c === void 0 ? void 0 : _c.call(worksheet);
};
exports.hideColumn = hideColumn;
/**
 * Get a column data by columnNumber
 */
const getColumnData = function (columnNumber, processed) {
    var _a, _b;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    const dataset = [];
    // Go through the rows to get the data
    for (let j = 0; j < (((_b = worksheet.options.data) === null || _b === void 0 ? void 0 : _b.length) || 0); j++) {
        if (processed) {
            dataset.push(worksheet.records[j][columnNumber].element.innerHTML);
        }
        else {
            const cellValue = (worksheet.options.data && Array.isArray(worksheet.options.data) && Array.isArray(worksheet.options.data[j]))
                ? worksheet.options.data[j][columnNumber]
                : undefined;
            dataset.push(cellValue);
        }
    }
    return dataset.filter((item) => item !== undefined);
};
exports.getColumnData = getColumnData;
/**
 * Set a column data by colNumber
 */
const setColumnData = function (colNumber, data, force) {
    var _a, _b;
    const obj = this;
    const worksheet = ((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) || obj;
    for (let j = 0; j < worksheet.rows.length; j++) {
        // Update cell
        const columnName = (0, internalHelpers_1.getColumnNameFromId)([colNumber, j]);
        // Set value
        if (data[j] != null) {
            (_b = worksheet.setValue) === null || _b === void 0 ? void 0 : _b.call(worksheet, columnName, data[j], force);
        }
    }
};
exports.setColumnData = setColumnData;
