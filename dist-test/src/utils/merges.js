"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyMerge = exports.removeMerge = exports.setMerge = exports.getMerge = exports.isRowMerged = exports.isColMerged = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const internalHelpers_1 = require("./internalHelpers");
const internal_1 = require("./internal");
const history_1 = require("./history");
const dispatch_1 = __importDefault(require("./dispatch"));
const selection_1 = require("./selection");
/**
 * Is column merged
 */
const isColMerged = function (x, insertBefore) {
    const obj = this;
    const cols = [];
    // Remove any merged cells
    if (obj.options.mergeCells) {
        const keys = Object.keys(obj.options.mergeCells);
        for (let i = 0; i < keys.length; i++) {
            const info = (0, internalHelpers_1.getIdFromColumnName)(keys[i], true);
            if (typeof info === "string")
                return cols;
            const mergeInfo = obj.options.mergeCells[keys[i]];
            if (!mergeInfo)
                continue;
            const colspan = mergeInfo[0];
            const x1 = info[0];
            const x2 = info[0] + (colspan > 1 ? colspan - 1 : 0);
            if (insertBefore == null) {
                if (x1 <= x && x2 >= x) {
                    cols.push(keys[i]);
                }
            }
            else {
                if (insertBefore) {
                    if (x1 < x && x2 >= x) {
                        cols.push(keys[i]);
                    }
                }
                else {
                    if (x1 <= x && x2 > x) {
                        cols.push(keys[i]);
                    }
                }
            }
        }
    }
    return cols;
};
exports.isColMerged = isColMerged;
/**
 * Is rows merged
 */
const isRowMerged = function (y, insertBefore) {
    const obj = this;
    const rows = [];
    // Remove any merged cells
    if (obj.options.mergeCells) {
        const keys = Object.keys(obj.options.mergeCells);
        for (let i = 0; i < keys.length; i++) {
            const info = (0, internalHelpers_1.getIdFromColumnName)(keys[i], true);
            if (typeof info === "string")
                return [];
            const mergeInfo = obj.options.mergeCells[keys[i]];
            if (!mergeInfo)
                continue;
            const rowspan = mergeInfo[1];
            const y1 = info[1];
            const y2 = info[1] + (rowspan > 1 ? rowspan - 1 : 0);
            if (insertBefore == null) {
                if (y1 <= y && y2 >= y) {
                    rows.push(keys[i]);
                }
            }
            else {
                if (insertBefore) {
                    if (y1 < y && y2 >= y) {
                        rows.push(keys[i]);
                    }
                }
                else {
                    if (y1 <= y && y2 > y) {
                        rows.push(keys[i]);
                    }
                }
            }
        }
    }
    return rows;
};
exports.isRowMerged = isRowMerged;
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
const getMerge = function (cellName) {
    const obj = this;
    if (cellName) {
        if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
            const mergeInfo = obj.options.mergeCells[cellName];
            if (!mergeInfo)
                return null;
            return [mergeInfo[0], mergeInfo[1]];
        }
        else {
            return null;
        }
    }
    else {
        const data = {};
        if (obj.options.mergeCells) {
            const keys = Object.keys(obj.options.mergeCells);
            for (let i = 0; i < keys.length; i++) {
                const mergeInfo = obj.options.mergeCells[keys[i]];
                if (mergeInfo) {
                    data[keys[i]] = [mergeInfo[0], mergeInfo[1]];
                }
            }
        }
        return data;
    }
};
exports.getMerge = getMerge;
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
const setMerge = function (cellName, colspan, rowspan, ignoreHistoryAndEvents) {
    const obj = this;
    let test = false;
    if (!cellName) {
        if (!obj.highlighted || !obj.highlighted.length) {
            alert(jsuites_1.default.translate("No cells selected"));
            return;
        }
        else {
            const firstHighlighted = obj.highlighted[0];
            const lastHighlighted = obj.highlighted[obj.highlighted.length - 1];
            if (!firstHighlighted || !lastHighlighted)
                return;
            const x1Attr = firstHighlighted.element.getAttribute("data-x");
            const y1Attr = firstHighlighted.element.getAttribute("data-y");
            const x2Attr = lastHighlighted.element.getAttribute("data-x");
            const y2Attr = lastHighlighted.element.getAttribute("data-y");
            if (!x1Attr || !y1Attr || !x2Attr || !y2Attr)
                return;
            const x1 = parseInt(x1Attr);
            const y1 = parseInt(y1Attr);
            const x2 = parseInt(x2Attr);
            const y2 = parseInt(y2Attr);
            cellName = (0, internalHelpers_1.getColumnNameFromId)([x1, y1]);
            colspan = x2 - x1 + 1;
            rowspan = y2 - y1 + 1;
        }
    }
    else if (typeof cellName !== "string") {
        return;
    }
    const cell = (0, internalHelpers_1.getIdFromColumnName)(cellName, true);
    if (typeof cell === "string")
        return;
    if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
        if (obj.records[cell[1]][cell[0]].element.getAttribute("data-merged")) {
            test = "Cell already merged";
        }
    }
    else if ((!colspan || colspan < 2) && (!rowspan || rowspan < 2)) {
        test = "Invalid merged properties";
    }
    else {
        for (let j = cell[1]; j < cell[1] + (rowspan || 0); j++) {
            for (let i = cell[0]; i < cell[0] + (colspan || 0); i++) {
                const columnName = (0, internalHelpers_1.getColumnNameFromId)([i, j]);
                if (obj.records[j] && obj.records[j][i] && obj.records[j][i].element.getAttribute("data-merged")) {
                    test = "There is a conflict with another merged cell";
                }
            }
        }
    }
    if (test) {
        alert(jsuites_1.default.translate(test));
    }
    else {
        // Add property
        if (colspan && colspan > 1) {
            obj.records[cell[1]][cell[0]].element.setAttribute("colspan", String(colspan));
        }
        else {
            colspan = 1;
        }
        if (rowspan && rowspan > 1) {
            obj.records[cell[1]][cell[0]].element.setAttribute("rowspan", String(rowspan));
        }
        else {
            rowspan = 1;
        }
        // Keep links to the existing nodes
        if (!obj.options.mergeCells) {
            obj.options.mergeCells = {};
        }
        obj.options.mergeCells[cellName] = [colspan, rowspan, []];
        // Mark cell as merged
        obj.records[cell[1]][cell[0]].element.setAttribute("data-merged", "true");
        // Overflow
        obj.records[cell[1]][cell[0]].element.style.overflow = "hidden";
        // History data
        const data = [];
        // Adjust the nodes
        for (let y = cell[1]; y < cell[1] + rowspan; y++) {
            const rowData = [];
            for (let x = cell[0]; x < cell[0] + colspan; x++) {
                if (!(cell[0] == x && cell[1] == y)) {
                    // Collect data for history
                    if (obj.options.data && obj.options.data[y]) {
                        if (Array.isArray(obj.options.data[y])) {
                            rowData.push(obj.options.data[y][x]);
                        }
                        else {
                            rowData.push(obj.options.data[y][x]);
                        }
                    }
                    else {
                        rowData.push("");
                    }
                    // Update cell and handle merge
                    internal_1.updateCell.call(obj, x, y, "", true);
                    if (obj.options.mergeCells[cellName] && obj.options.mergeCells[cellName] !== false && obj.records[y] && obj.records[y][x]) {
                        obj.options.mergeCells[cellName][2].push(obj.records[y][x].element);
                        obj.records[y][x].element.style.display = "none";
                        obj.records[y][x].element = obj.records[cell[1]][cell[0]].element;
                    }
                }
                else {
                    rowData.push("");
                }
            }
            data.push(rowData);
        }
        // In the initialization is not necessary keep the history
        if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
            selection_1.updateSelection.call(obj, obj.records[cell[1]][cell[0]].element, null);
        }
        if (!ignoreHistoryAndEvents) {
            history_1.setHistory.call(obj, {
                action: "setMerge",
                column: cellName,
                colspan: colspan,
                rowspan: rowspan,
                data: data,
            });
            dispatch_1.default.call(obj, "onmerge", obj, { [cellName]: [colspan, rowspan] });
        }
    }
};
exports.setMerge = setMerge;
/**
 * Remove merge by cellname
 * @param cellName
 */
const removeMerge = function (cellName, data, keepOptions) {
    const obj = this;
    if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
        const cell = (0, internalHelpers_1.getIdFromColumnName)(cellName, true);
        if (typeof cell === "string")
            return;
        if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
            obj.records[cell[1]][cell[0]].element.removeAttribute("colspan");
            obj.records[cell[1]][cell[0]].element.removeAttribute("rowspan");
            obj.records[cell[1]][cell[0]].element.removeAttribute("data-merged");
        }
        const info = obj.options.mergeCells[cellName];
        if (!info)
            return;
        let index = 0;
        let j = 0, i = 0;
        for (j = 0; j < info[1]; j++) {
            for (i = 0; i < info[0]; i++) {
                if (j > 0 || i > 0) {
                    if (info[2] && info[2][index]) {
                        if (obj.records[cell[1] + j] && obj.records[cell[1] + j][cell[0] + i]) {
                            obj.records[cell[1] + j][cell[0] + i].element = info[2][index];
                            obj.records[cell[1] + j][cell[0] + i].element.style.display = "";
                            // Recover data
                            if (data && data[index]) {
                                internal_1.updateCell.call(obj, cell[0] + i, cell[1] + j, data[index]);
                            }
                        }
                    }
                    index++;
                }
            }
        }
        // Update selection
        selection_1.updateSelection.call(obj, obj.records[cell[1]][cell[0]].element, obj.records[cell[1] + j - 1][cell[0] + i - 1].element, undefined);
        if (!keepOptions) {
            delete obj.options.mergeCells[cellName];
        }
    }
};
exports.removeMerge = removeMerge;
/**
 * Remove all merged cells
 */
const destroyMerge = function (keepOptions) {
    const obj = this;
    // Remove any merged cells
    if (obj.options.mergeCells) {
        const keys = Object.keys(obj.options.mergeCells);
        for (let i = 0; i < keys.length; i++) {
            exports.removeMerge.call(obj, keys[i], null, keepOptions);
        }
    }
};
exports.destroyMerge = destroyMerge;
