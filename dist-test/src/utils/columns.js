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
    if (obj.options.data && typeof obj.options.data[0] !== "undefined") {
        // Data keys
        const keys = Object.keys(obj.options.data[0]);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
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
        const currentNumOfColumns = Math.max(((_a = obj.options.columns) === null || _a === void 0 ? void 0 : _a.length) || 0, ...(((_b = obj.options.data) === null || _b === void 0 ? void 0 : _b.map(function (row) {
            return row.length;
        })) || []));
        const lastColumn = currentNumOfColumns - 1;
        // Confirm position
        if (columnNumber == undefined ||
            columnNumber >= lastColumn ||
            columnNumber < 0) {
            columnNumber = lastColumn;
        }
        // Create default properties
        if (!properties) {
            properties = [];
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
        if (obj.options.mergeCells &&
            Object.keys(obj.options.mergeCells).length > 0) {
            if (merges_1.isColMerged.call(obj, columnNumber, insertBefore).length) {
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
            const currentData = ((_j = (_h = obj.options.data) === null || _h === void 0 ? void 0 : _h[row]) === null || _j === void 0 ? void 0 : _j.splice(columnIndex)) || [];
            const currentRecord = obj.records[row].splice(columnIndex);
            // History
            historyData[row] = [];
            historyRecords[row] = [];
            for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
                // New value
                const value = data[row] ? data[row] : "";
                if (obj.options.data && obj.options.data[row]) {
                    obj.options.data[row][col] = value;
                }
                // New cell
                const td = internal_1.createCell.call(obj.worksheets[0], col, row, (_m = (_l = (_k = obj.options.data) === null || _k === void 0 ? void 0 : _k[row]) === null || _l === void 0 ? void 0 : _l[col]) !== null && _m !== void 0 ? _m : "");
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
                    (_p = (_o = obj.options.columns[col]).render) === null || _p === void 0 ? void 0 : _p.call(_o, td, value, col.toString(), row.toString(), obj, obj.options.columns[col]);
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
                (_s = (_r = (_q = obj.thead) === null || _q === void 0 ? void 0 : _q.children[j]) === null || _r === void 0 ? void 0 : _r.children[obj.thead.children[j].children.length - 1]) === null || _s === void 0 ? void 0 : _s.setAttribute("colspan", colspan.toString());
                const dataColumn = (_v = (_u = (_t = obj.thead) === null || _t === void 0 ? void 0 : _t.children[j]) === null || _u === void 0 ? void 0 : _u.children[obj.thead.children[j].children.length - 1]) === null || _v === void 0 ? void 0 : _v.getAttribute("data-column");
                let oArray = (dataColumn === null || dataColumn === void 0 ? void 0 : dataColumn.split(",")) || [];
                for (let col = columnIndex; col < numOfColumns + columnIndex; col++) {
                    oArray.push(col.toString());
                }
                (_y = (_x = (_w = obj.thead) === null || _w === void 0 ? void 0 : _w.children[j]) === null || _x === void 0 ? void 0 : _x.children[obj.thead.children[j].children.length - 1]) === null || _y === void 0 ? void 0 : _y.setAttribute("data-column", oArray.join(","));
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
        insertBefore = 1;
    }
    else {
        insertBefore = 0;
    }
    if (merges_1.isColMerged.call(obj, o).length ||
        merges_1.isColMerged.call(obj, d, !!insertBefore).length) {
        if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
            return false;
        }
        else {
            (_a = obj.destroyMerge) === null || _a === void 0 ? void 0 : _a.call(obj);
        }
    }
    // o and d are already numbers, no need for parseInt
    if (o > d) {
        (_b = obj.headerContainer) === null || _b === void 0 ? void 0 : _b.insertBefore(obj.headers[o], obj.headers[d]);
        (_c = obj.colgroupContainer) === null || _c === void 0 ? void 0 : _c.insertBefore(obj.cols[o].colElement, obj.cols[d].colElement);
        for (let j = 0; j < obj.rows.length; j++) {
            obj.rows[j].element.insertBefore(obj.records[j][o].element, obj.records[j][d].element);
        }
    }
    else {
        (_d = obj.headerContainer) === null || _d === void 0 ? void 0 : _d.insertBefore(obj.headers[o], obj.headers[d].nextSibling);
        (_e = obj.colgroupContainer) === null || _e === void 0 ? void 0 : _e.insertBefore(obj.cols[o].colElement, obj.cols[d].colElement.nextSibling);
        for (let j = 0; j < obj.rows.length; j++) {
            obj.rows[j].element.insertBefore(obj.records[j][o].element, obj.records[j][d].element.nextSibling);
        }
    }
    (_f = obj.options.columns) === null || _f === void 0 ? void 0 : _f.splice(d, 0, obj.options.columns.splice(o, 1)[0]);
    obj.headers.splice(d, 0, obj.headers.splice(o, 1)[0]);
    obj.cols.splice(d, 0, obj.cols.splice(o, 1)[0]);
    const firstAffectedIndex = Math.min(o, d);
    const lastAffectedIndex = Math.max(o, d);
    for (let j = 0; j < obj.rows.length; j++) {
        (_h = (_g = obj.options.data) === null || _g === void 0 ? void 0 : _g[j]) === null || _h === void 0 ? void 0 : _h.splice(d, 0, obj.options.data[j].splice(o, 1)[0]);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
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
                    columnNumber = number[0];
                    numOfColumns = number.length;
                }
            }
            // Lasat column
            const lastColumn = ((_c = (_b = obj.options.data) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.length)
                ? obj.options.data[0].length - 1
                : 0;
            if (columnNumber == undefined ||
                columnNumber > lastColumn ||
                columnNumber < 0) {
                columnNumber = lastColumn;
            }
            // Minimum of columns to be delete is 1
            if (!numOfColumns) {
                numOfColumns = 1;
            }
            // Can't delete more than the limit of the table
            if (((_d = obj.options.data) === null || _d === void 0 ? void 0 : _d[0]) &&
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
                        if (merges_1.isColMerged.call(obj, col, undefined).length) {
                            mergeExists = true;
                        }
                    }
                }
                if (mergeExists) {
                    if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                        return false;
                    }
                    else {
                        (_e = obj.destroyMerge) === null || _e === void 0 ? void 0 : _e.call(obj);
                    }
                }
                // Delete the column properties
                const columns = obj.options.columns
                    ? obj.options.columns.splice(columnNumber, numOfColumns)
                    : undefined;
                for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                    obj.cols[col].colElement.className = "";
                    obj.headers[col].className = "";
                    (_f = obj.cols[col].colElement.parentNode) === null || _f === void 0 ? void 0 : _f.removeChild(obj.cols[col].colElement);
                    (_g = obj.headers[col].parentNode) === null || _g === void 0 ? void 0 : _g.removeChild(obj.headers[col]);
                }
                const historyHeaders = obj.headers.splice(columnNumber, numOfColumns);
                const historyColgroup = obj.cols.splice(columnNumber, numOfColumns);
                const historyRecords = [];
                const historyData = [];
                const historyFooters = [];
                for (let row = 0; row < (((_h = obj.options.data) === null || _h === void 0 ? void 0 : _h.length) || 0); row++) {
                    for (let col = columnNumber; col < columnNumber + numOfColumns; col++) {
                        obj.records[row][col].element.className = "";
                        (_j = obj.records[row][col].element.parentNode) === null || _j === void 0 ? void 0 : _j.removeChild(obj.records[row][col].element);
                    }
                }
                // Delete headers
                for (let row = 0; row < (((_k = obj.options.data) === null || _k === void 0 ? void 0 : _k.length) || 0); row++) {
                    // History
                    historyData[row] =
                        ((_m = (_l = obj.options.data) === null || _l === void 0 ? void 0 : _l[row]) === null || _m === void 0 ? void 0 : _m.splice(columnNumber, numOfColumns)) || [];
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
                        const colspan = parseInt(String(((_p = (_o = obj.options.nestedHeaders[j]) === null || _o === void 0 ? void 0 : _o[obj.options.nestedHeaders[j].length - 1]) === null || _p === void 0 ? void 0 : _p.colspan) || "1")) - numOfColumns;
                        obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan = colspan;
                        (_s = (_r = (_q = obj.thead) === null || _q === void 0 ? void 0 : _q.children[j]) === null || _r === void 0 ? void 0 : _r.children[obj.thead.children[j].children.length - 1]) === null || _s === void 0 ? void 0 : _s.setAttribute("colspan", String(colspan));
                    }
                }
                // Keeping history of changes
                history_1.setHistory.call(obj, {
                    action: "deleteColumn",
                    columnNumber: columnNumber,
                    numOfColumns: numOfColumns,
                    insertBefore: 1,
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
        history_1.setHistory.call(obj, {
            action: "setWidth",
            column: column,
            oldValue: finalOldWidth,
            newValue: width,
        });
        // On resize column
        dispatch_1.default.call(obj, "onresizecolumn", obj, column, width, finalOldWidth);
        // Update corner position
        selection_1.updateCornerPosition.call(obj.worksheets[0]);
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
    var _a, _b, _c;
    const obj = this;
    const dataset = [];
    // Go through the rows to get the data
    for (let j = 0; j < (((_a = obj.options.data) === null || _a === void 0 ? void 0 : _a.length) || 0); j++) {
        if (processed) {
            dataset.push(obj.records[j][columnNumber].element.innerHTML);
        }
        else {
            dataset.push((_c = (_b = obj.options.data) === null || _b === void 0 ? void 0 : _b[j]) === null || _c === void 0 ? void 0 : _c[columnNumber]);
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
