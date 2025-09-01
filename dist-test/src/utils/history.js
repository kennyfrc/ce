"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redo = exports.undo = exports.setHistory = void 0;
const dispatch_1 = __importDefault(require("./dispatch"));
const internalHelpers_1 = require("./internalHelpers");
const internal_1 = require("./internal");
const merges_1 = require("./merges");
const orderBy_1 = require("./orderBy");
const selection_1 = require("./selection");
/**
 * Initializes a new history record for undo/redo
 *
 * @return null
 */
const setHistory = function (changes) {
    const obj = this;
    if (obj.ignoreHistory !== true) {
        // Increment and get the current history index
        if (obj.historyIndex !== undefined) {
            const index = ++obj.historyIndex;
            // Slice the array to discard undone changes
            if (obj.history) {
                obj.history = obj.history.slice(0, index + 1);
                // Keep history
                obj.history[index] = changes;
            }
        }
    }
};
exports.setHistory = setHistory;
/**
 * Process row
 */
const historyProcessRow = function (type, historyRecord) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    const obj = this;
    const rowIndex = !historyRecord.insertBefore
        ? ((_a = historyRecord.rowNumber) !== null && _a !== void 0 ? _a : 0) + 1
        : +((_b = historyRecord.rowNumber) !== null && _b !== void 0 ? _b : 0);
    if (obj.options.search === true) {
        // Temporarily disabled resetSearch call due to type issues
        // if (obj.results && obj.results.length !== obj.rows.length) {
        //   (obj.resetSearch as any)?.();
        // }
    }
    // Remove row
    if (type === 1) {
        const numOfRows = (_c = historyRecord.numOfRows) !== null && _c !== void 0 ? _c : 0;
        // Remove nodes
        for (let j = rowIndex; j < numOfRows + rowIndex; j++) {
            (_f = (_e = (_d = obj.rows[j]) === null || _d === void 0 ? void 0 : _d.element) === null || _e === void 0 ? void 0 : _e.parentNode) === null || _f === void 0 ? void 0 : _f.removeChild(obj.rows[j].element);
        }
        // Remove references
        obj.records.splice(rowIndex, numOfRows);
        if (Array.isArray(obj.options.data)) {
            obj.options.data.splice(rowIndex, numOfRows);
        }
        obj.rows.splice(rowIndex, numOfRows);
        selection_1.conditionalSelectionUpdate.call(obj, 1, rowIndex, numOfRows + rowIndex - 1);
    }
    else {
        // Insert data
        const records = (_h = (_g = historyRecord.rowRecords) === null || _g === void 0 ? void 0 : _g.map((row) => {
            return [...row];
        })) !== null && _h !== void 0 ? _h : [];
        obj.records = (0, internalHelpers_1.injectArray)(obj.records, rowIndex, records);
        const data = (_k = (_j = historyRecord.rowData) === null || _j === void 0 ? void 0 : _j.map((row) => {
            return [...row];
        })) !== null && _k !== void 0 ? _k : [];
        if (Array.isArray(obj.options.data)) {
            obj.options.data = (0, internalHelpers_1.injectArray)(obj.options.data, rowIndex, data);
        }
        obj.rows = (0, internalHelpers_1.injectArray)(obj.rows, rowIndex, (_l = historyRecord.rowNode) !== null && _l !== void 0 ? _l : []);
        // Insert nodes
        let index = 0;
        for (let j = rowIndex; j < ((_m = historyRecord.numOfRows) !== null && _m !== void 0 ? _m : 0) + rowIndex; j++) {
            const element = (_p = (_o = historyRecord.rowNode) === null || _o === void 0 ? void 0 : _o[index]) === null || _p === void 0 ? void 0 : _p.element;
            if (element) {
                obj.tbody.insertBefore(element, obj.tbody.children[j]);
            }
            index++;
        }
    }
    for (let j = rowIndex; j < obj.rows.length; j++) {
        obj.rows[j].y = j;
    }
    for (let j = rowIndex; j < obj.records.length; j++) {
        if (obj.records[j]) {
            for (let i = 0; i < obj.records[j].length; i++) {
                if (obj.records[j][i]) {
                    obj.records[j][i].y = j;
                }
            }
        }
    }
    // Respect pagination
    if (typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
        if (obj.pageNumber !== undefined) {
            (_q = obj.page) === null || _q === void 0 ? void 0 : _q.call(obj, obj.pageNumber);
        }
    }
    internal_1.updateTableReferences.call(obj);
};
/**
 * Process column
 */
const historyProcessColumn = function (type, historyRecord) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
    const obj = this;
    const columnIndex = !historyRecord.insertBefore
        ? ((_a = historyRecord.columnNumber) !== null && _a !== void 0 ? _a : 0) + 1
        : ((_b = historyRecord.columnNumber) !== null && _b !== void 0 ? _b : 0);
    // Remove column
    if (type === 1) {
        const numOfColumns = (_c = historyRecord.numOfColumns) !== null && _c !== void 0 ? _c : 0;
        if (obj.options.columns) {
            obj.options.columns.splice(columnIndex, numOfColumns);
        }
        for (let i = columnIndex; i < numOfColumns + columnIndex; i++) {
            if (obj.headers[i]) {
                (_d = obj.headers[i].parentNode) === null || _d === void 0 ? void 0 : _d.removeChild(obj.headers[i]);
            }
            if ((_e = obj.cols[i]) === null || _e === void 0 ? void 0 : _e.colElement) {
                (_f = obj.cols[i].colElement.parentNode) === null || _f === void 0 ? void 0 : _f.removeChild(obj.cols[i].colElement);
            }
        }
        obj.headers.splice(columnIndex, numOfColumns);
        obj.cols.splice(columnIndex, numOfColumns);
        if (historyRecord.data) {
            for (let j = 0; j < historyRecord.data.length; j++) {
                for (let i = columnIndex; i < numOfColumns + columnIndex; i++) {
                    const record = (_g = obj.records[j]) === null || _g === void 0 ? void 0 : _g[i];
                    if ((_h = record === null || record === void 0 ? void 0 : record.element) === null || _h === void 0 ? void 0 : _h.parentNode) {
                        record.element.parentNode.removeChild(record.element);
                    }
                }
                if (obj.records[j]) {
                    obj.records[j].splice(columnIndex, numOfColumns);
                }
                if (Array.isArray(obj.options.data) && Array.isArray(obj.options.data[j])) {
                    obj.options.data[j].splice(columnIndex, numOfColumns);
                }
            }
        }
        // Process footers
        if (obj.options.footers) {
            for (let j = 0; j < obj.options.footers.length; j++) {
                if (obj.options.footers[j]) {
                    obj.options.footers[j].splice(columnIndex, numOfColumns);
                }
            }
        }
    }
    else {
        // Insert data
        obj.options.columns = (0, internalHelpers_1.injectArray)((_j = obj.options.columns) !== null && _j !== void 0 ? _j : [], columnIndex, (_k = historyRecord.columns) !== null && _k !== void 0 ? _k : []);
        obj.headers = (0, internalHelpers_1.injectArray)(obj.headers, columnIndex, (_l = historyRecord.headers) !== null && _l !== void 0 ? _l : []);
        obj.cols = (0, internalHelpers_1.injectArray)(obj.cols, columnIndex, (_m = historyRecord.cols) !== null && _m !== void 0 ? _m : []);
        // Debug: show what will be inserted for columns
        let index = 0;
        for (let i = columnIndex; i < ((_o = historyRecord.numOfColumns) !== null && _o !== void 0 ? _o : 0) + columnIndex; i++) {
            const headerElement = (_p = historyRecord.headers) === null || _p === void 0 ? void 0 : _p[index];
            if (headerElement) {
                (_q = obj.headerContainer) === null || _q === void 0 ? void 0 : _q.insertBefore(headerElement, obj.headerContainer.children[i + 1]);
            }
            const colElement = (_s = (_r = historyRecord.cols) === null || _r === void 0 ? void 0 : _r[index]) === null || _s === void 0 ? void 0 : _s.colElement;
            if (colElement) {
                (_t = obj.colgroupContainer) === null || _t === void 0 ? void 0 : _t.insertBefore(colElement, obj.colgroupContainer.children[i + 1]);
            }
            index++;
        }
        if (historyRecord.data && Array.isArray(historyRecord.data)) {
            for (let j = 0; j < historyRecord.data.length; j++) {
                if (Array.isArray(obj.options.data) && obj.options.data[j]) {
                    obj.options.data[j] = (0, internalHelpers_1.injectArray)(obj.options.data[j], columnIndex, historyRecord.data[j]);
                }
                if (obj.records[j]) {
                    obj.records[j] = (0, internalHelpers_1.injectArray)(obj.records[j], columnIndex, ((_v = (_u = historyRecord.records) === null || _u === void 0 ? void 0 : _u[j]) !== null && _v !== void 0 ? _v : []));
                }
                if (historyRecord.numOfColumns !== undefined) {
                    let index = 0;
                    for (let i = columnIndex; i < historyRecord.numOfColumns + columnIndex; i++) {
                        // Check if records is the nested array variant
                        const recordRow = (_w = historyRecord.records) === null || _w === void 0 ? void 0 : _w[j];
                        let recordElement;
                        if (Array.isArray(recordRow) && recordRow[index] && typeof recordRow[index] === 'object' && 'element' in recordRow[index]) {
                            recordElement = recordRow[index].element;
                        }
                        const targetElement = (_y = (_x = obj.rows[j]) === null || _x === void 0 ? void 0 : _x.element) === null || _y === void 0 ? void 0 : _y.children[i + 1];
                        if (recordElement && targetElement && ((_z = obj.rows[j]) === null || _z === void 0 ? void 0 : _z.element)) {
                            obj.rows[j].element.insertBefore(recordElement, targetElement);
                        }
                        index++;
                    }
                }
            }
        }
        // Process footers
        if (obj.options.footers) {
            for (let j = 0; j < obj.options.footers.length; j++) {
                if (obj.options.footers[j]) {
                    const footerData = (_0 = historyRecord.footers) === null || _0 === void 0 ? void 0 : _0[j];
                    obj.options.footers[j] = (0, internalHelpers_1.injectArray)(obj.options.footers[j], columnIndex, footerData !== null && footerData !== void 0 ? footerData : []);
                }
            }
        }
    }
    for (let i = columnIndex; i < obj.cols.length; i++) {
        obj.cols[i].x = i;
    }
    for (let j = 0; j < obj.records.length; j++) {
        if (obj.records[j]) {
            for (let i = columnIndex; i < obj.records[j].length; i++) {
                if (obj.records[j][i]) {
                    obj.records[j][i].x = i;
                }
            }
        }
    }
    // Adjust nested headers
    if (obj.options.nestedHeaders &&
        obj.options.nestedHeaders.length > 0 &&
        obj.options.nestedHeaders[0] &&
        obj.options.nestedHeaders[0][0]) {
        for (let j = 0; j < obj.options.nestedHeaders.length; j++) {
            let colspan;
            if (type === 1) {
                colspan =
                    parseInt(obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan) - ((_1 = historyRecord.numOfColumns) !== null && _1 !== void 0 ? _1 : 0);
            }
            else {
                colspan =
                    parseInt(obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan) + ((_2 = historyRecord.numOfColumns) !== null && _2 !== void 0 ? _2 : 0);
            }
            obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan = colspan;
            (_5 = (_4 = (_3 = obj.thead) === null || _3 === void 0 ? void 0 : _3.children[j]) === null || _4 === void 0 ? void 0 : _4.children[obj.thead.children[j].children.length - 1]) === null || _5 === void 0 ? void 0 : _5.setAttribute("colspan", colspan.toString());
        }
    }
    internal_1.updateTableReferences.call(obj);
};
/**
 * Undo last action
 */
const undo = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const obj = this;
    // Ignore events and history
    const ignoreEvents = ((_a = obj.parent) === null || _a === void 0 ? void 0 : _a.ignoreEvents) ? true : false;
    const ignoreHistory = obj.ignoreHistory ? true : false;
    if (obj.parent) {
        obj.parent.ignoreEvents = true;
    }
    obj.ignoreHistory = true;
    // Records
    const records = [];
    // Update cells
    let historyRecord;
    if (obj.historyIndex !== undefined && obj.historyIndex >= 0 && obj.history) {
        // History
        historyRecord = obj.history[obj.historyIndex--];
        if (historyRecord.action === "insertRow") {
            historyProcessRow.call(obj, 1, historyRecord);
        }
        else if (historyRecord.action === "deleteRow") {
            historyProcessRow.call(obj, 0, historyRecord);
        }
        else if (historyRecord.action === "insertColumn") {
            historyProcessColumn.call(obj, 1, historyRecord);
        }
        else if (historyRecord.action === "deleteColumn") {
            historyProcessColumn.call(obj, 0, historyRecord);
        }
        else if (historyRecord.action === "moveRow") {
            (_b = obj.moveRow) === null || _b === void 0 ? void 0 : _b.call(obj, historyRecord.newValue, historyRecord.oldValue);
        }
        else if (historyRecord.action === "moveColumn") {
            (_c = obj.moveColumn) === null || _c === void 0 ? void 0 : _c.call(obj, historyRecord.newValue, historyRecord.oldValue);
        }
        else if (historyRecord.action === "setMerge") {
            (_d = obj.removeMerge) === null || _d === void 0 ? void 0 : _d.call(obj, historyRecord.column);
        }
        else if (historyRecord.action === "setStyle") {
            (_e = obj.setStyle) === null || _e === void 0 ? void 0 : _e.call(obj, historyRecord.newValue, null, null, true);
        }
        else if (historyRecord.action === "setWidth") {
            (_f = obj.setWidth) === null || _f === void 0 ? void 0 : _f.call(obj, historyRecord.column, historyRecord.oldValue);
        }
        else if (historyRecord.action === "setHeight") {
            (_g = obj.setHeight) === null || _g === void 0 ? void 0 : _g.call(obj, historyRecord.row, historyRecord.oldValue);
        }
        else if (historyRecord.action === "setHeader") {
            (_h = obj.setHeader) === null || _h === void 0 ? void 0 : _h.call(obj, historyRecord.column, historyRecord.oldValue);
        }
        else if (historyRecord.action === "setComments") {
            (_j = obj.setComments) === null || _j === void 0 ? void 0 : _j.call(obj, historyRecord.oldValue);
        }
        else if (historyRecord.action === "orderBy") {
            if (historyRecord.rows) {
                let rows = [];
                for (let j = 0; j < historyRecord.rows.length; j++) {
                    rows[historyRecord.rows[j]] = j;
                }
                orderBy_1.updateOrderArrow.call(obj, historyRecord.column, Boolean(historyRecord.order));
                orderBy_1.updateOrder.call(obj, rows);
            }
        }
        else if (historyRecord.action === "setValue") {
            // Undo for changes in cells
            if (historyRecord.records) {
                for (let i = 0; i < historyRecord.records.length; i++) {
                    const record = historyRecord.records[i];
                    // Check if record is an array (nested structure) or object (flat structure)
                    if (Array.isArray(record)) {
                        // Handle array of arrays case - take first element
                        const firstElement = record[0];
                        if (firstElement && typeof firstElement === 'object' && 'x' in firstElement && 'y' in firstElement) {
                            records.push({
                                x: firstElement.x,
                                y: firstElement.y,
                                value: firstElement.oldValue,
                            });
                        }
                    }
                    else if (record && typeof record === 'object' && 'x' in record && 'y' in record) {
                        // Handle flat array case
                        records.push({
                            x: record.x,
                            y: record.y,
                            value: record.oldValue,
                        });
                    }
                }
            }
            // Update records
            (_k = obj.setValue) === null || _k === void 0 ? void 0 : _k.call(obj, records, undefined, true);
            if (historyRecord.oldStyle) {
                (_l = obj.resetStyle) === null || _l === void 0 ? void 0 : _l.call(obj, historyRecord.oldStyle, true);
            }
            // Update selection
            if (historyRecord.selection) {
                (_m = obj.updateSelectionFromCoords) === null || _m === void 0 ? void 0 : _m.call(obj, historyRecord.selection[0], historyRecord.selection[1], historyRecord.selection[2], historyRecord.selection[3]);
            }
        }
    }
    if (obj.parent) {
        obj.parent.ignoreEvents = ignoreEvents;
    }
    obj.ignoreHistory = ignoreHistory;
    // Events
    dispatch_1.default.call(obj, "onundo", obj, historyRecord);
};
exports.undo = undo;
/**
 * Redo previously undone action
 */
const redo = function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const obj = this;
    // Ignore events and history
    const ignoreEvents = ((_a = obj.parent) === null || _a === void 0 ? void 0 : _a.ignoreEvents) ? true : false;
    const ignoreHistory = obj.ignoreHistory ? true : false;
    if (obj.parent) {
        obj.parent.ignoreEvents = true;
    }
    obj.ignoreHistory = true;
    // Records
    const records = [];
    // Update cells
    let historyRecord;
    if (obj.historyIndex !== undefined && obj.history && obj.historyIndex < obj.history.length - 1) {
        // History
        historyRecord = obj.history[++obj.historyIndex];
        if (historyRecord.action === "insertRow") {
            historyProcessRow.call(obj, 0, historyRecord);
        }
        else if (historyRecord.action === "deleteRow") {
            historyProcessRow.call(obj, 1, historyRecord);
        }
        else if (historyRecord.action === "insertColumn") {
            historyProcessColumn.call(obj, 0, historyRecord);
        }
        else if (historyRecord.action === "deleteColumn") {
            historyProcessColumn.call(obj, 1, historyRecord);
        }
        else if (historyRecord.action === "moveRow") {
            (_b = obj.moveRow) === null || _b === void 0 ? void 0 : _b.call(obj, historyRecord.oldValue, historyRecord.newValue);
        }
        else if (historyRecord.action === "moveColumn") {
            (_c = obj.moveColumn) === null || _c === void 0 ? void 0 : _c.call(obj, historyRecord.oldValue, historyRecord.newValue);
        }
        else if (historyRecord.action === "setMerge") {
            merges_1.setMerge.call(obj, historyRecord.column, historyRecord.colspan, historyRecord.rowspan, true);
        }
        else if (historyRecord.action === "setStyle") {
            (_d = obj.setStyle) === null || _d === void 0 ? void 0 : _d.call(obj, historyRecord.newValue, null, null, true);
        }
        else if (historyRecord.action === "setWidth") {
            (_e = obj.setWidth) === null || _e === void 0 ? void 0 : _e.call(obj, historyRecord.column, String(historyRecord.newValue));
        }
        else if (historyRecord.action === "setHeight") {
            (_f = obj.setHeight) === null || _f === void 0 ? void 0 : _f.call(obj, historyRecord.row, historyRecord.newValue);
        }
        else if (historyRecord.action === "setHeader") {
            (_g = obj.setHeader) === null || _g === void 0 ? void 0 : _g.call(obj, historyRecord.column, String(historyRecord.newValue));
        }
        else if (historyRecord.action === "setComments") {
            (_h = obj.setComments) === null || _h === void 0 ? void 0 : _h.call(obj, historyRecord.newValue);
        }
        else if (historyRecord.action === "orderBy") {
            orderBy_1.updateOrderArrow.call(obj, historyRecord.column, Boolean(historyRecord.order));
            orderBy_1.updateOrder.call(obj, historyRecord.rows);
        }
        else if (historyRecord.action === "setValue") {
            // Redo for changes in cells
            if (historyRecord.records) {
                for (let i = 0; i < historyRecord.records.length; i++) {
                    const record = historyRecord.records[i];
                    // Check if record is an array (nested structure) or object (flat structure)
                    if (Array.isArray(record)) {
                        // Handle array of arrays case - take first element
                        const firstElement = record[0];
                        if (firstElement && typeof firstElement === 'object' && 'x' in firstElement && 'y' in firstElement) {
                            records.push({
                                x: firstElement.x,
                                y: firstElement.y,
                                value: firstElement.newValue,
                            });
                        }
                    }
                    else if (record && typeof record === 'object' && 'x' in record && 'y' in record) {
                        // Handle flat array case
                        records.push({
                            x: record.x,
                            y: record.y,
                            value: record.value,
                        });
                    }
                }
                // Update records
                (_j = obj.setValue) === null || _j === void 0 ? void 0 : _j.call(obj, records, undefined, true);
                // Reset old style if present (do this once, not in loop)
                if (historyRecord.oldStyle) {
                    (_k = obj.resetStyle) === null || _k === void 0 ? void 0 : _k.call(obj, historyRecord.oldStyle, true);
                }
            }
            // Update selection
            if (historyRecord.selection) {
                (_l = obj.updateSelectionFromCoords) === null || _l === void 0 ? void 0 : _l.call(obj, historyRecord.selection[0], historyRecord.selection[1], historyRecord.selection[2], historyRecord.selection[3]);
            }
        }
    }
    if (obj.parent) {
        obj.parent.ignoreEvents = ignoreEvents;
    }
    obj.ignoreHistory = ignoreHistory;
    // Events
    dispatch_1.default.call(obj, "onredo", obj, historyRecord);
};
exports.redo = redo;
