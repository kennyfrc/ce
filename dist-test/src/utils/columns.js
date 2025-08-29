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
    // Configuration
    if (obj.options.allowInsertColumn != false) {
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
        if (obj.options.data) {
            for (const row of obj.options.data) {
                const len = Array.isArray(row) ? row.length : Object.keys(row).length;
                if (len > maxFromData)
                    maxFromData = len;
            }
        }
        const currentNumOfColumns = Math.max(((_a = obj.options.columns) === null || _a === void 0 ? void 0 : _a.length) || 0, maxFromData);
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
            for (let i = 0; i < (((_b = obj.options.data) === null || _b === void 0 ? void 0 : _b.length) || 0); i++) {
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
        if (obj.options.mergeCells &&
            Object.keys(obj.options.mergeCells).length > 0) {
            if (((_c = obj.worksheets) === null || _c === void 0 ? void 0 : _c[0]) && merges_1.isColMerged.call(obj.worksheets[0], columnNumber, insertBefore).length) {
                if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                    return false;
                }
                else {
                    (_d = obj.destroyMerge) === null || _d === void 0 ? void 0 : _d.call(obj);
                }
            }
        }
        // Insert before
        const columnIndex = !insertBefore ? columnNumber + 1 : columnNumber;
        obj.options.columns = (0, internalHelpers_1.injectArray)(obj.options.columns || [], columnIndex, properties);
        // Open space in the containers
        const currentHeaders = obj.headers.splice(columnIndex);
        const currentColgroup = obj.cols.splice(columnIndex);
        // History
        const historyHeaders = [];
        const historyColgroup = [];
        const historyRecords = [];
        const historyData = [];
        const historyFooters = [];
        // Add new headers
        for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
            exports.createCellHeader.call(obj, col);
            (_e = obj.headerContainer) === null || _e === void 0 ? void 0 : _e.insertBefore(obj.headers[col], obj.headerContainer.children[col + 1]);
            (_f = obj.colgroupContainer) === null || _f === void 0 ? void 0 : _f.insertBefore(obj.cols[col].colElement, obj.colgroupContainer.children[col + 1]);
            historyHeaders.push(obj.headers[col]);
            historyColgroup.push(obj.cols[col]);
        }
        // Add new footer cells
        if (obj.options.footers) {
            for (let j = 0; j < obj.options.footers.length; j++) {
                historyFooters[j] = [];
                for (let i = 0; i < numOfColumns; i++) {
                    historyFooters[j].push("");
                }
                obj.options.footers[j].splice(columnIndex, 0, ...historyFooters[j]);
            }
        }
        // Adding visual columns
        for (let row = 0; row < (((_g = obj.options.data) === null || _g === void 0 ? void 0 : _g.length) || 0); row++) {
            // Keep the current data
            const currentData = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row]))
                ? obj.options.data[row].splice(columnIndex)
                : [];
            const currentRecord = obj.records[row].splice(columnIndex);
            // History
            historyData[row] = [];
            historyRecords[row] = [];
            for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
                // New value
                const value = data[row] ? data[row] : "";
                if (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row])) {
                    obj.options.data[row][col] = value;
                }
                // New cell
                const cellValue = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row]))
                    ? (_h = obj.options.data[row][col]) !== null && _h !== void 0 ? _h : ""
                    : "";
                const td = internal_1.createCell.call(obj.worksheets[0], col, row, cellValue);
                obj.records[row][col] = {
                    element: td,
                    x: col,
                    y: row,
                };
                // Add cell to the row
                if (obj.rows[row]) {
                    obj.rows[row].element.insertBefore(td, obj.rows[row].element.children[col + 1]);
                }
                if (obj.options.columns &&
                    obj.options.columns[col] &&
                    typeof obj.options.columns[col].render ===
                        "function") {
                    (_k = (_j = obj.options.columns[col]).render) === null || _k === void 0 ? void 0 : _k.call(_j, td, value, col.toString(), row.toString(), obj, obj.options.columns[col]);
                }
                // Record History
                historyData[row].push(value);
                historyRecords[row].push({ element: td, x: col, y: row });
            }
            // Copy the data back to the main data
            if (obj.options.data && obj.options.data[row]) {
                Array.prototype.push.apply(obj.options.data[row], currentData);
            }
            Array.prototype.push.apply(obj.records[row], currentRecord);
        }
        Array.prototype.push.apply(obj.headers, currentHeaders);
        Array.prototype.push.apply(obj.cols, currentColgroup);
        for (let i = columnIndex; i < obj.cols.length; i++) {
            obj.cols[i].x = i;
        }
        for (let j = 0; j < obj.records.length; j++) {
            for (let i = 0; i < obj.records[j].length; i++) {
                obj.records[j][i].x = i;
            }
        }
        // Adjust nested headers
        if (obj.options.nestedHeaders &&
            obj.options.nestedHeaders.length > 0 &&
            obj.options.nestedHeaders[0] &&
            obj.options.nestedHeaders[0][0]) {
            for (let j = 0; j < obj.options.nestedHeaders.length; j++) {
                const colspan = parseInt((obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan || "1").toString()) + numOfColumns;
                obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan = colspan;
                (_o = (_m = (_l = obj.thead) === null || _l === void 0 ? void 0 : _l.children[j]) === null || _m === void 0 ? void 0 : _m.children[obj.thead.children[j].children.length - 1]) === null || _o === void 0 ? void 0 : _o.setAttribute("colspan", colspan.toString());
                const dataColumn = (_r = (_q = (_p = obj.thead) === null || _p === void 0 ? void 0 : _p.children[j]) === null || _q === void 0 ? void 0 : _q.children[obj.thead.children[j].children.length - 1]) === null || _r === void 0 ? void 0 : _r.getAttribute("data-column");
                let oArray = (dataColumn === null || dataColumn === void 0 ? void 0 : dataColumn.split(",")) || [];
                for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
                    oArray.push(col.toString());
                }
                (_u = (_t = (_s = obj.thead) === null || _s === void 0 ? void 0 : _s.children[j]) === null || _t === void 0 ? void 0 : _t.children[obj.thead.children[j].children.length - 1]) === null || _u === void 0 ? void 0 : _u.setAttribute("data-column", oArray.join(","));
            }
        }
        // Keep history
        history_1.setHistory.call(obj, {
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
        // Remove table references
        if (obj.worksheets && obj.worksheets[0]) {
            internal_1.updateTableReferences.call(obj.worksheets[0]);
        }
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
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const obj = this;
    let insertBefore;
    if (o > d) {
        insertBefore = true;
    }
    else {
        insertBefore = false;
    }
    if ((((_a = obj.worksheets) === null || _a === void 0 ? void 0 : _a[0]) && merges_1.isColMerged.call(obj.worksheets[0], o).length) ||
        (((_b = obj.worksheets) === null || _b === void 0 ? void 0 : _b[0]) && merges_1.isColMerged.call(obj.worksheets[0], d, !!insertBefore).length)) {
        if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
            return false;
        }
        else {
            (_c = obj.destroyMerge) === null || _c === void 0 ? void 0 : _c.call(obj);
        }
    }
    // o and d are already numbers, no need for parseInt
    if (o > d) {
        (_d = obj.headerContainer) === null || _d === void 0 ? void 0 : _d.insertBefore(obj.headers[o], obj.headers[d]);
        (_e = obj.colgroupContainer) === null || _e === void 0 ? void 0 : _e.insertBefore(obj.cols[o].colElement, obj.cols[d].colElement);
        for (let j = 0; j < obj.rows.length; j++) {
            obj.rows[j].element.insertBefore(obj.records[j][o].element, obj.records[j][d].element);
        }
    }
    else {
        (_f = obj.headerContainer) === null || _f === void 0 ? void 0 : _f.insertBefore(obj.headers[o], obj.headers[d].nextSibling);
        (_g = obj.colgroupContainer) === null || _g === void 0 ? void 0 : _g.insertBefore(obj.cols[o].colElement, obj.cols[d].colElement.nextSibling);
        for (let j = 0; j < obj.rows.length; j++) {
            obj.rows[j].element.insertBefore(obj.records[j][o].element, obj.records[j][d].element.nextSibling);
        }
    }
    (_h = obj.options.columns) === null || _h === void 0 ? void 0 : _h.splice(d, 0, obj.options.columns.splice(o, 1)[0]);
    obj.headers.splice(d, 0, obj.headers.splice(o, 1)[0]);
    obj.cols.splice(d, 0, obj.cols.splice(o, 1)[0]);
    const firstAffectedIndex = Math.min(o, d);
    const lastAffectedIndex = Math.max(o, d);
    for (let j = 0; j < obj.rows.length; j++) {
        if (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[j])) {
            const movedValue = obj.options.data[j].splice(o, 1)[0];
            obj.options.data[j].splice(d, 0, movedValue);
        }
        obj.records[j].splice(d, 0, obj.records[j].splice(o, 1)[0]);
    }
    for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
        obj.cols[i].x = i;
    }
    for (let j = 0; j < obj.records.length; j++) {
        for (let i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
            obj.records[j][i].x = i;
        }
    }
    // Update footers position
    if (obj.options.footers) {
        for (let j = 0; j < obj.options.footers.length; j++) {
            obj.options.footers[j].splice(d, 0, obj.options.footers[j].splice(o, 1)[0]);
        }
    }
    // Keeping history of changes
    history_1.setHistory.call(obj, {
        action: "moveColumn",
        oldValue: o,
        newValue: d,
    });
    // Update table references
    if (obj.worksheets && obj.worksheets[0]) {
        internal_1.updateTableReferences.call(obj.worksheets[0]);
    }
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
    // Global Configuration
    if (obj.options.allowDeleteColumn != false) {
        if (obj.headers.length > 1) {
            // Delete column definitions
            if (columnNumber == undefined) {
                const number = ((_a = obj.getSelectedColumns) === null || _a === void 0 ? void 0 : _a.call(obj, true)) || [];
                if (!number.length) {
                    // Remove last column
                    columnNumber = obj.headers.length - 1;
                    numOfColumns = 1;
                }
                else {
                    // Remove selected
                    columnNumber = (_b = number[0]) !== null && _b !== void 0 ? _b : 0;
                    numOfColumns = number.length;
                }
            }
            // Last column
            const lastColumn = (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[0] && Array.isArray(obj.options.data[0]))
                ? obj.options.data[0].length - 1
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
            if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[0] && Array.isArray(obj.options.data[0]) &&
                numOfColumns > obj.options.data[0].length - columnNumber) {
                numOfColumns = obj.options.data[0].length - columnNumber;
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
                if (obj.options.mergeCells &&
                    Object.keys(obj.options.mergeCells).length > 0) {
                    for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                        if (((_c = obj.worksheets) === null || _c === void 0 ? void 0 : _c[0]) && merges_1.isColMerged.call(obj.worksheets[0], col, undefined).length) {
                            mergeExists = true;
                        }
                    }
                }
                if (mergeExists) {
                    if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                        return false;
                    }
                    else {
                        (_d = obj.destroyMerge) === null || _d === void 0 ? void 0 : _d.call(obj);
                    }
                }
                // Delete the column properties
                const columns = obj.options.columns
                    ? obj.options.columns.splice(columnNumber, numOfColumns)
                    : undefined;
                for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                    obj.cols[col].colElement.className = "";
                    obj.headers[col].className = "";
                    (_e = obj.cols[col].colElement.parentNode) === null || _e === void 0 ? void 0 : _e.removeChild(obj.cols[col].colElement);
                    (_f = obj.headers[col].parentNode) === null || _f === void 0 ? void 0 : _f.removeChild(obj.headers[col]);
                }
                const historyHeaders = obj.headers.splice(columnNumber, numOfColumns);
                const historyColgroup = obj.cols.splice(columnNumber, numOfColumns);
                const historyRecords = [];
                const historyData = [];
                const historyFooters = [];
                for (let row = 0; row < (((_g = obj.options.data) === null || _g === void 0 ? void 0 : _g.length) || 0); row++) {
                    for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                        obj.records[row][col].element.className = "";
                        (_h = obj.records[row][col].element.parentNode) === null || _h === void 0 ? void 0 : _h.removeChild(obj.records[row][col].element);
                    }
                }
                // Delete headers
                for (let row = 0; row < (((_j = obj.options.data) === null || _j === void 0 ? void 0 : _j.length) || 0); row++) {
                    // History
                    historyData[row] = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[row]))
                        ? obj.options.data[row].splice(columnNumber, numOfColumns)
                        : [];
                    historyRecords[row] = obj.records[row].splice(columnNumber, numOfColumns);
                }
                for (let i = columnNumber; i < obj.cols.length; i++) {
                    obj.cols[i].x = i;
                }
                for (let j = 0; j < obj.records.length; j++) {
                    for (let i = columnNumber; i < obj.records[j].length; i++) {
                        obj.records[j][i].x = i;
                    }
                }
                // Delete footers
                if (obj.options.footers) {
                    for (let row = 0; row < obj.options.footers.length; row++) {
                        historyFooters[row] = obj.options.footers[row].splice(columnNumber, numOfColumns);
                    }
                }
                // Remove selection
                selection_1.conditionalSelectionUpdate.call(obj.worksheets[0], 0, columnNumber, columnNumber + numOfColumns - 1);
                // Adjust nested headers
                if (obj.options.nestedHeaders &&
                    obj.options.nestedHeaders.length > 0 &&
                    obj.options.nestedHeaders[0] &&
                    obj.options.nestedHeaders[0][0]) {
                    for (let j = 0; j < obj.options.nestedHeaders.length; j++) {
                        const colspan = parseInt(String(((_l = (_k = obj.options.nestedHeaders[j]) === null || _k === void 0 ? void 0 : _k[obj.options.nestedHeaders[j].length - 1]) === null || _l === void 0 ? void 0 : _l.colspan) || "1")) - numOfColumns;
                        obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan = colspan;
                        (_p = (_o = (_m = obj.thead) === null || _m === void 0 ? void 0 : _m.children[j]) === null || _o === void 0 ? void 0 : _o.children[obj.thead.children[j].children.length - 1]) === null || _p === void 0 ? void 0 : _p.setAttribute("colspan", String(colspan));
                    }
                }
                // Keeping history of changes
                history_1.setHistory.call(obj, {
                    action: "deleteColumn",
                    columnNumber: columnNumber,
                    numOfColumns: numOfColumns,
                    insertBefore: false,
                    columns: columns,
                    headers: historyHeaders,
                    cols: historyColgroup,
                    records: historyRecords,
                    footers: historyFooters,
                    data: historyData,
                });
                // Update table references
                if (obj.worksheets && obj.worksheets[0]) {
                    internal_1.updateTableReferences.call(obj.worksheets[0]);
                }
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
    const obj = this;
    let data;
    if (typeof column === "undefined") {
        // Get all headers
        data = [];
        for (let i = 0; i < obj.headers.length; i++) {
            data.push(Number((obj.options.columns &&
                obj.options.columns[i] &&
                obj.options.columns[i].width) ||
                obj.options.defaultColWidth ||
                100));
        }
    }
    else {
        const columnIndex = typeof column === "number"
            ? column
            : parseInt(column.getAttribute("data-x") || "0");
        data = parseInt(obj.cols[columnIndex].colElement.getAttribute("width") || "0");
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
    const obj = this;
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
                    oldWidthArray[i] = parseInt(obj.cols[columnIndex].colElement.getAttribute("width") || "0");
                }
                const w = Array.isArray(width) && width[i] ? width[i] : width;
                obj.cols[columnIndex].colElement.setAttribute("width", w);
                if (!obj.options.columns) {
                    obj.options.columns = [];
                }
                if (!obj.options.columns[columnIndex]) {
                    obj.options.columns[columnIndex] = {};
                }
                obj.options.columns[columnIndex].width = w;
            }
            finalOldWidth = oldWidthArray;
        }
        else {
            const columnIndex = typeof column === "number"
                ? column
                : parseInt(column.getAttribute("data-x") || "0");
            // Oldwidth
            if (!oldWidth) {
                oldWidth = parseInt(obj.cols[columnIndex].colElement.getAttribute("width") || "0");
            }
            // Set width
            obj.cols[columnIndex].colElement.setAttribute("width", String(width));
            if (!obj.options.columns) {
                obj.options.columns = [];
            }
            if (!obj.options.columns[columnIndex]) {
                obj.options.columns[columnIndex] = {};
            }
            obj.options.columns[columnIndex].width = width;
        }
        // Keeping history of changes
        const historyColumn = Array.isArray(column)
            ? (typeof column[0] === 'number' ? column[0] : 0)
            : (typeof column === 'number' ? column : 0);
        const historyOldValue = Array.isArray(finalOldWidth) ? finalOldWidth[0] : finalOldWidth;
        history_1.setHistory.call(obj, {
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
    var _a, _b;
    const obj = this;
    if (!Array.isArray(colNumber)) {
        colNumber = [colNumber];
    }
    for (let i = 0; i < colNumber.length; i++) {
        const columnIndex = colNumber[i];
        obj.headers[columnIndex].style.display = "";
        obj.cols[columnIndex].colElement.style.display = "";
        if (obj.filter && obj.filter.children.length > columnIndex + 1) {
            obj.filter.children[columnIndex + 1].style.display = "";
        }
        for (let j = 0; j < (((_a = obj.options.data) === null || _a === void 0 ? void 0 : _a.length) || 0); j++) {
            obj.records[j][columnIndex].element.style.display = "";
        }
    }
    // Update footers
    if (obj.options.footers) {
        footer_1.setFooter.call(obj);
    }
    (_b = obj.resetSelection) === null || _b === void 0 ? void 0 : _b.call(obj);
};
exports.showColumn = showColumn;
/**
 * Hide column
 */
const hideColumn = function (colNumber) {
    var _a, _b;
    const obj = this;
    if (!Array.isArray(colNumber)) {
        colNumber = [colNumber];
    }
    for (let i = 0; i < colNumber.length; i++) {
        const columnIndex = colNumber[i];
        obj.headers[columnIndex].style.display = "none";
        obj.cols[columnIndex].colElement.style.display = "none";
        if (obj.filter && obj.filter.children.length > columnIndex + 1) {
            obj.filter.children[columnIndex + 1].style.display =
                "none";
        }
        for (let j = 0; j < (((_a = obj.options.data) === null || _a === void 0 ? void 0 : _a.length) || 0); j++) {
            obj.records[j][columnIndex].element.style.display = "none";
        }
    }
    // Update footers
    if (obj.options.footers) {
        footer_1.setFooter.call(obj);
    }
    (_b = obj.resetSelection) === null || _b === void 0 ? void 0 : _b.call(obj);
};
exports.hideColumn = hideColumn;
/**
 * Get a column data by columnNumber
 */
const getColumnData = function (columnNumber, processed) {
    var _a;
    const obj = this;
    const dataset = [];
    // Go through the rows to get the data
    for (let j = 0; j < (((_a = obj.options.data) === null || _a === void 0 ? void 0 : _a.length) || 0); j++) {
        if (processed) {
            dataset.push(obj.records[j][columnNumber].element.innerHTML);
        }
        else {
            const cellValue = (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[j]))
                ? obj.options.data[j][columnNumber]
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
    var _a;
    const obj = this;
    for (let j = 0; j < obj.rows.length; j++) {
        // Update cell
        const columnName = (0, internalHelpers_1.getColumnNameFromId)([colNumber, j]);
        // Set value
        if (data[j] != null) {
            (_a = obj.setValue) === null || _a === void 0 ? void 0 : _a.call(obj, columnName, data[j], force);
        }
    }
};
exports.setColumnData = setColumnData;
