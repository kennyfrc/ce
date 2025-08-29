"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataFromRange = exports.getData = exports.setValueFromCoords = exports.setValue = exports.getValueFromCoords = exports.getValue = exports.setData = void 0;
const rows_1 = require("./rows");
const internal_1 = require("./internal");
const internalHelpers_1 = require("./internalHelpers");
const dispatch_1 = __importDefault(require("./dispatch"));
const history_1 = require("./history");
const pagination_1 = require("./pagination");
const merges_1 = require("./merges");
const helpers_1 = require("./helpers");
const setData = function (data) {
    var _a, _b, _c, _d, _e, _f, _g;
    const obj = this;
    // Local aliases and defaults to satisfy strict checks
    const columns = (_a = obj.options.columns) !== null && _a !== void 0 ? _a : [];
    // Update data
    if (data) {
        obj.options.data = data;
    }
    // Data
    if (!obj.options.data) {
        obj.options.data = [];
    }
    // Prepare data: support both array-of-arrays and array-of-objects
    if (obj.options.data && obj.options.data[0]) {
        if (!Array.isArray(obj.options.data[0])) {
            data = [];
            for (let j = 0; j < obj.options.data.length; j++) {
                const row = [];
                const rowObj = obj.options.data[j];
                for (let i = 0; i < columns.length; i++) {
                    const key = (_c = (_b = columns[i]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : String(i);
                    row[i] = rowObj[key];
                }
                data.push(row);
            }
            obj.options.data = data;
        }
    }
    // Adjust minimal dimensions
    let j = 0;
    let i = 0;
    const size_i = columns.length;
    const size_j = obj.options.data.length;
    const minDims = (_d = obj.options.minDimensions) !== null && _d !== void 0 ? _d : [0, 0];
    const min_i = minDims[0];
    const min_j = minDims[1];
    const max_i = min_i > size_i ? min_i : size_i;
    const max_j = min_j > size_j ? min_j : size_j;
    for (j = 0; j < max_j; j++) {
        if (!obj.options.data[j]) {
            obj.options.data[j] = [];
        }
        const row = obj.options.data[j];
        if (Array.isArray(row)) {
            const arr = row;
            for (i = 0; i < max_i; i++) {
                if (arr[i] == undefined) {
                    arr[i] = "";
                }
            }
        }
        else {
            const rowObj = row;
            for (i = 0; i < max_i; i++) {
                const key = (_f = (_e = columns[i]) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : String(i);
                if (rowObj[key] == undefined) {
                    rowObj[key] = "";
                }
            }
        }
    }
    // Reset containers
    obj.rows = [];
    obj.results = null;
    obj.records = [];
    obj.history = [];
    // Reset internal controllers
    obj.historyIndex = -1;
    // Reset data
    obj.tbody.innerHTML = "";
    let startNumber;
    let finalNumber;
    // Lazy loading
    if (obj.options.lazyLoading == true) {
        // Load only 100 records
        startNumber = 0;
        finalNumber = obj.options.data.length < 100 ? obj.options.data.length : 100;
        if (obj.options.pagination) {
            obj.options.pagination = false;
            console.error("Jspreadsheet: Pagination will be disable due the lazyLoading");
        }
    }
    else if (obj.options.pagination) {
        // Pagination
        if (!obj.pageNumber) {
            obj.pageNumber = 0;
        }
        var quantityPerPage = obj.options.pagination;
        startNumber = obj.options.pagination * obj.pageNumber;
        finalNumber =
            obj.options.pagination * obj.pageNumber + obj.options.pagination;
        if (obj.options.data.length < finalNumber) {
            finalNumber = obj.options.data.length;
        }
    }
    else {
        startNumber = 0;
        finalNumber = obj.options.data.length;
    }
    // Append nodes to the HTML
    for (j = 0; j < obj.options.data.length; j++) {
        const rawRow = obj.options.data[j];
        const rowData = Array.isArray(rawRow)
            ? rawRow
            : ((_g = obj.options.columns) !== null && _g !== void 0 ? _g : []).map((col, idx) => { var _a; return rawRow[(_a = col === null || col === void 0 ? void 0 : col.name) !== null && _a !== void 0 ? _a : String(idx)]; });
        const row = rows_1.createRow.call(obj, j, rowData);
        if (j >= startNumber && j < finalNumber) {
            obj.tbody.appendChild(row.element);
        }
    }
    if (obj.options.lazyLoading == true) {
        // Do not create pagination with lazyloading activated
    }
    else if (obj.options.pagination) {
        pagination_1.updatePagination.call(obj);
    }
    // Merge cells
    if (obj.options.mergeCells) {
        const mergeCells = obj.options.mergeCells;
        const keys = Object.keys(mergeCells);
        for (let i = 0; i < keys.length; i++) {
            const num = mergeCells[keys[i]];
            if (Array.isArray(num)) {
                merges_1.setMerge.call(obj, keys[i], num[0], num[1], true);
            }
        }
    }
    // Updata table with custom configurations if applicable
    internal_1.updateTable.call(obj);
};
exports.setData = setData;
/**
 * Get the value from a cell
 *
 * @param object cell
 * @return string value
 */
const getValue = function (cell, processedValue) {
    var _a, _b, _c;
    const obj = this;
    let x;
    let y;
    if (typeof cell !== "string") {
        return null;
    }
    const columnId = (0, internalHelpers_1.getIdFromColumnName)(cell, true);
    x = columnId[0];
    y = columnId[1];
    let value = null;
    if (x != null && y != null) {
        if (obj.records[y] && obj.records[y][x] && processedValue) {
            value = obj.records[y][x].element.innerHTML;
        }
        else {
            const data = obj.options.data;
            if (data && data[y] !== undefined) {
                const row = data[y];
                if (Array.isArray(row)) {
                    if (row[x] !== undefined) {
                        value = row[x];
                    }
                }
                else {
                    const rowObj = row;
                    const key = (_c = (_b = ((_a = obj.options.columns) !== null && _a !== void 0 ? _a : [])[x]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : String(x);
                    if (key in rowObj) {
                        value = rowObj[key];
                    }
                }
            }
        }
    }
    return value;
};
exports.getValue = getValue;
/**
 * Get the value from a coords
 *
 * @param int x
 * @param int y
 * @return string value
 */
const getValueFromCoords = function (x, y, processedValue) {
    var _a, _b, _c;
    const obj = this;
    let value = null;
    if (x != null && y != null) {
        if (obj.records[y] && obj.records[y][x] && processedValue) {
            value = obj.records[y][x].element.innerHTML;
        }
        else {
            const data = obj.options.data;
            if (data && data[y] !== undefined) {
                const row = data[y];
                if (Array.isArray(row)) {
                    if (row[x] !== undefined) {
                        value = row[x];
                    }
                }
                else {
                    const rowObj = row;
                    const key = (_c = (_b = ((_a = obj.options.columns) !== null && _a !== void 0 ? _a : [])[x]) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : String(x);
                    if (key in rowObj) {
                        value = rowObj[key];
                    }
                }
            }
        }
    }
    return value;
};
exports.getValueFromCoords = getValueFromCoords;
/**
 * Set a cell value
 *
 * @param mixed cell destination cell
 * @param string value value
 * @return void
 */
const setValue = function (cell, value, force) {
    const obj = this;
    const records = [];
    if (typeof cell == "string") {
        const columnId = (0, internalHelpers_1.getIdFromColumnName)(cell, true);
        if (Array.isArray(columnId) && columnId.length >= 2) {
            const x = columnId[0];
            const y = columnId[1];
            // Update cell
            records.push(internal_1.updateCell.call(obj, x, y, value, force));
            // Update all formulas in the chain
            internal_1.updateFormulaChain.call(obj, x, y, records);
        }
    }
    else {
        // Single HTMLElement passed (non-array)
        if (!Array.isArray(cell) && (cell === null || cell === void 0 ? void 0 : cell.getAttribute)) {
            const el = cell;
            const xVal = parseInt(el.getAttribute("data-x") || "", 10);
            const yVal = parseInt(el.getAttribute("data-y") || "", 10);
            if (!isNaN(xVal) && !isNaN(yVal)) {
                records.push(internal_1.updateCell.call(obj, xVal, yVal, value, force));
                internal_1.updateFormulaChain.call(obj, xVal, yVal, records);
            }
        }
        else {
            const items = Array.isArray(cell)
                ? cell
                : Object.keys(cell).map((k) => cell[k]);
            for (let idx = 0; idx < items.length; idx++) {
                const item = items[idx];
                let xi = null;
                let yi = null;
                if (typeof item === "string") {
                    const columnId = (0, internalHelpers_1.getIdFromColumnName)(item, true);
                    xi = columnId[0];
                    yi = columnId[1];
                }
                else if (item && typeof item === "object") {
                    if ("x" in item && "y" in item) {
                        xi = Number(item.x);
                        yi = Number(item.y);
                        if ("value" in item)
                            value = item.value;
                    }
                    else {
                        const el = "element" in item && item.element && item.element.getAttribute
                            ? item.element
                            : item;
                        xi = parseInt(el.getAttribute("data-x") || "", 10);
                        yi = parseInt(el.getAttribute("data-y") || "", 10);
                    }
                }
                if (xi != null && yi != null && !isNaN(xi) && !isNaN(yi)) {
                    records.push(internal_1.updateCell.call(obj, xi, yi, value, force));
                    internal_1.updateFormulaChain.call(obj, xi, yi, records);
                }
            }
        }
    }
    // Update history
    history_1.setHistory.call(obj, {
        action: "setValue",
        records: records,
        selection: obj.selectedCell,
    });
    // Update table with custom configurations if applicable
    internal_1.updateTable.call(obj);
    // On after changes
    const onafterchangesRecords = records.map(function (record) {
        var _a, _b;
        return {
            x: record.x,
            y: record.y,
            value: (_a = record.value) !== null && _a !== void 0 ? _a : "",
            oldValue: (_b = record.oldValue) !== null && _b !== void 0 ? _b : "",
        };
    });
    dispatch_1.default.call(obj, "onafterchanges", obj, onafterchangesRecords);
};
exports.setValue = setValue;
/**
 * Set a cell value based on coordinates
 *
 * @param int x destination cell
 * @param int y destination cell
 * @param string value
 * @return void
 */
const setValueFromCoords = function (x, y, value, force) {
    const obj = this;
    const records = [];
    records.push(internal_1.updateCell.call(obj, x, y, value, force));
    // Update all formulas in the chain
    internal_1.updateFormulaChain.call(obj, x, y, records);
    // Update history
    history_1.setHistory.call(obj, {
        action: "setValue",
        records: records,
        selection: obj.selectedCell,
    });
    // Update table with custom configurations if applicable
    internal_1.updateTable.call(obj);
    // On after changes
    const onafterchangesRecords = records.map(function (record) {
        var _a, _b;
        return {
            x: record.x,
            y: record.y,
            value: (_a = record.value) !== null && _a !== void 0 ? _a : "",
            oldValue: (_b = record.oldValue) !== null && _b !== void 0 ? _b : "",
        };
    });
    dispatch_1.default.call(obj, "onafterchanges", obj, onafterchangesRecords);
};
exports.setValueFromCoords = setValueFromCoords;
/**
 * Get the whole table data
 *
 * @param bool get highlighted cells only
 * @return array data
 */
const getData = function (highlighted, processed, delimiter, asJson) {
    var _a, _b, _c, _d, _e, _f, _g;
    const obj = this;
    // Control vars
    const dataset = [];
    let px = 0;
    let py = 0;
    // Column and row length
    const columnsLen = obj.options.columns ? obj.options.columns.length : 0;
    const data = (_a = obj.options.data) !== null && _a !== void 0 ? _a : [];
    const x = Math.max(0, ...data.map(function (row) {
        return Array.isArray(row) ? row.length : columnsLen;
    }));
    const y = data.length;
    // Go through the columns to get the data
    for (let j = 0; j < y; j++) {
        px = 0;
        for (let i = 0; i < x; i++) {
            // Cell selected or fullset
            if (!highlighted ||
                obj.records[j][i].element.classList.contains("highlight")) {
                // Get value
                if (!dataset[py]) {
                    dataset[py] = [];
                }
                if (processed) {
                    dataset[py][px] = obj.records[j][i].element.innerHTML;
                }
                else {
                    const data = (_b = obj.options.data) !== null && _b !== void 0 ? _b : [];
                    const rawRow = data[j];
                    if (rawRow !== undefined) {
                        if (Array.isArray(rawRow)) {
                            dataset[py][px] = (_c = rawRow[i]) !== null && _c !== void 0 ? _c : "";
                        }
                        else {
                            const columns = (_d = obj.options.columns) !== null && _d !== void 0 ? _d : [];
                            const key = (_f = (_e = columns[i]) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : String(i);
                            dataset[py][px] = (_g = rawRow[key]) !== null && _g !== void 0 ? _g : "";
                        }
                    }
                    else {
                        dataset[py][px] = "";
                    }
                }
                px++;
            }
        }
        if (px > 0) {
            py++;
        }
    }
    if (delimiter) {
        return (dataset
            .map(function (row) {
            return row.map(cell => String(cell !== null && cell !== void 0 ? cell : "")).join(delimiter);
        })
            .join("\r\n") + "\r\n");
    }
    if (asJson) {
        return dataset.map(function (row) {
            const resultRow = {};
            row.forEach(function (item, index) {
                resultRow[index] = item;
            });
            return resultRow;
        });
    }
    return dataset;
};
exports.getData = getData;
const getDataFromRange = function (range, processed) {
    var _a, _b, _c, _d, _e, _f;
    const obj = this;
    const coords = (0, helpers_1.getCoordsFromRange)(range);
    const dataset = [];
    for (let y = coords[1]; y <= coords[3]; y++) {
        dataset.push([]);
        for (let x = coords[0]; x <= coords[2]; x++) {
            if (processed) {
                dataset[dataset.length - 1].push(obj.records[y][x].element.innerHTML);
            }
            else {
                const data = (_a = obj.options.data) !== null && _a !== void 0 ? _a : [];
                const rawRow = data[y];
                if (rawRow !== undefined) {
                    if (Array.isArray(rawRow)) {
                        dataset[dataset.length - 1].push((_b = rawRow[x]) !== null && _b !== void 0 ? _b : "");
                    }
                    else {
                        const columns = (_c = obj.options.columns) !== null && _c !== void 0 ? _c : [];
                        const key = (_e = (_d = columns[x]) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : String(x);
                        dataset[dataset.length - 1].push((_f = rawRow[key]) !== null && _f !== void 0 ? _f : "");
                    }
                }
                else {
                    dataset[dataset.length - 1].push("");
                }
            }
        }
    }
    return dataset;
};
exports.getDataFromRange = getDataFromRange;
