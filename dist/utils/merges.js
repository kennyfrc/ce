import jSuites from "jsuites";
import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers.js";
import { updateCell } from "./internal.js";
import { setHistory } from "./history.js";
import dispatch from "./dispatch.js";
import { updateSelection } from "./selection.js";
/**
 * Is column merged
 */
export var isColMerged = function (x, insertBefore) {
    var obj = this;
    var cols = [];
    // Remove any merged cells
    if (obj.options.mergeCells) {
        var keys = Object.keys(obj.options.mergeCells);
        for (var i = 0; i < keys.length; i++) {
            var info = getIdFromColumnName(keys[i], true);
            var colspan = obj.options.mergeCells[keys[i]][0];
            var x1 = info[0];
            var x2 = info[0] + (colspan > 1 ? colspan - 1 : 0);
            if (insertBefore == null) {
                if ((x1 <= x && x2 >= x)) {
                    cols.push(keys[i]);
                }
            }
            else {
                if (insertBefore) {
                    if ((x1 < x && x2 >= x)) {
                        cols.push(keys[i]);
                    }
                }
                else {
                    if ((x1 <= x && x2 > x)) {
                        cols.push(keys[i]);
                    }
                }
            }
        }
    }
    return cols;
};
/**
 * Is rows merged
 */
export var isRowMerged = function (y, insertBefore) {
    var obj = this;
    var rows = [];
    // Remove any merged cells
    if (obj.options.mergeCells) {
        var keys = Object.keys(obj.options.mergeCells);
        for (var i = 0; i < keys.length; i++) {
            var info = getIdFromColumnName(keys[i], true);
            var rowspan = obj.options.mergeCells[keys[i]][1];
            var y1 = info[1];
            var y2 = info[1] + (rowspan > 1 ? rowspan - 1 : 0);
            if (insertBefore == null) {
                if ((y1 <= y && y2 >= y)) {
                    rows.push(keys[i]);
                }
            }
            else {
                if (insertBefore) {
                    if ((y1 < y && y2 >= y)) {
                        rows.push(keys[i]);
                    }
                }
                else {
                    if ((y1 <= y && y2 > y)) {
                        rows.push(keys[i]);
                    }
                }
            }
        }
    }
    return rows;
};
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export var getMerge = function (cellName) {
    var obj = this;
    var data = {};
    if (cellName) {
        if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
            data = [obj.options.mergeCells[cellName][0], obj.options.mergeCells[cellName][1]];
        }
        else {
            data = null;
        }
    }
    else {
        if (obj.options.mergeCells) {
            var mergedCells = obj.options.mergeCells;
            var keys = Object.keys(obj.options.mergeCells);
            for (var i = 0; i < keys.length; i++) {
                data[keys[i]] = [obj.options.mergeCells[keys[i]][0], obj.options.mergeCells[keys[i]][1]];
            }
        }
    }
    return data;
};
/**
 * Merge cells
 * @param cellName
 * @param colspan
 * @param rowspan
 * @param ignoreHistoryAndEvents
 */
export var setMerge = function (cellName, colspan, rowspan, ignoreHistoryAndEvents) {
    var _a;
    var obj = this;
    var test = false;
    if (!cellName) {
        if (!obj.highlighted.length) {
            alert(jSuites.translate('No cells selected'));
            return null;
        }
        else {
            var x1 = parseInt(obj.highlighted[0].getAttribute('data-x'));
            var y1 = parseInt(obj.highlighted[0].getAttribute('data-y'));
            var x2 = parseInt(obj.highlighted[obj.highlighted.length - 1].getAttribute('data-x'));
            var y2 = parseInt(obj.highlighted[obj.highlighted.length - 1].getAttribute('data-y'));
            cellName = getColumnNameFromId([x1, y1]);
            colspan = (x2 - x1) + 1;
            rowspan = (y2 - y1) + 1;
        }
    }
    else if (typeof cellName !== 'string') {
        return null;
    }
    var cell = getIdFromColumnName(cellName, true);
    if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
        if (obj.records[cell[1]][cell[0]].element.getAttribute('data-merged')) {
            test = 'Cell already merged';
        }
    }
    else if ((!colspan || colspan < 2) && (!rowspan || rowspan < 2)) {
        test = 'Invalid merged properties';
    }
    else {
        var cells = [];
        for (var j = cell[1]; j < cell[1] + rowspan; j++) {
            for (var i = cell[0]; i < cell[0] + colspan; i++) {
                var columnName = getColumnNameFromId([i, j]);
                if (obj.records[j][i].element.getAttribute('data-merged')) {
                    test = 'There is a conflict with another merged cell';
                }
            }
        }
    }
    if (test) {
        alert(jSuites.translate(test));
    }
    else {
        // Add property
        if (colspan > 1) {
            obj.records[cell[1]][cell[0]].element.setAttribute('colspan', colspan);
        }
        else {
            colspan = 1;
        }
        if (rowspan > 1) {
            obj.records[cell[1]][cell[0]].element.setAttribute('rowspan', rowspan);
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
        obj.records[cell[1]][cell[0]].element.setAttribute('data-merged', 'true');
        // Overflow
        obj.records[cell[1]][cell[0]].element.style.overflow = 'hidden';
        // History data
        var data = [];
        // Adjust the nodes
        for (var y = cell[1]; y < cell[1] + rowspan; y++) {
            for (var x = cell[0]; x < cell[0] + colspan; x++) {
                if (!(cell[0] == x && cell[1] == y)) {
                    data.push(obj.options.data[y][x]);
                    updateCell.call(obj, x, y, '', true);
                    obj.options.mergeCells[cellName][2].push(obj.records[y][x].element);
                    obj.records[y][x].element.style.display = 'none';
                    obj.records[y][x].element = obj.records[cell[1]][cell[0]].element;
                }
            }
        }
        // In the initialization is not necessary keep the history
        updateSelection.call(obj, obj.records[cell[1]][cell[0]].element);
        if (!ignoreHistoryAndEvents) {
            setHistory.call(obj, {
                action: 'setMerge',
                column: cellName,
                colspan: colspan,
                rowspan: rowspan,
                data: data,
            });
            dispatch.call(obj, 'onmerge', obj, (_a = {}, _a[cellName] = [colspan, rowspan], _a));
        }
    }
};
/**
 * Remove merge by cellname
 * @param cellName
 */
export var removeMerge = function (cellName, data, keepOptions) {
    var obj = this;
    if (obj.options.mergeCells && obj.options.mergeCells[cellName]) {
        var cell = getIdFromColumnName(cellName, true);
        obj.records[cell[1]][cell[0]].element.removeAttribute('colspan');
        obj.records[cell[1]][cell[0]].element.removeAttribute('rowspan');
        obj.records[cell[1]][cell[0]].element.removeAttribute('data-merged');
        var info = obj.options.mergeCells[cellName];
        var index = 0;
        var j = void 0, i = void 0;
        for (j = 0; j < info[1]; j++) {
            for (i = 0; i < info[0]; i++) {
                if (j > 0 || i > 0) {
                    obj.records[cell[1] + j][cell[0] + i].element = info[2][index];
                    obj.records[cell[1] + j][cell[0] + i].element.style.display = '';
                    // Recover data
                    if (data && data[index]) {
                        updateCell.call(obj, cell[0] + i, cell[1] + j, data[index]);
                    }
                    index++;
                }
            }
        }
        // Update selection
        updateSelection.call(obj, obj.records[cell[1]][cell[0]].element, obj.records[cell[1] + j - 1][cell[0] + i - 1].element);
        if (!keepOptions) {
            delete (obj.options.mergeCells[cellName]);
        }
    }
};
/**
 * Remove all merged cells
 */
export var destroyMerge = function (keepOptions) {
    var obj = this;
    // Remove any merged cells
    if (obj.options.mergeCells) {
        var mergedCells = obj.options.mergeCells;
        var keys = Object.keys(obj.options.mergeCells);
        for (var i = 0; i < keys.length; i++) {
            removeMerge.call(obj, keys[i], null, keepOptions);
        }
    }
};
//# sourceMappingURL=merges.js.map