import dispatch from "./dispatch.js";
import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers.js";
import { setHistory } from "./history.js";
/**
 * Get style information from cell(s)
 *
 * @return integer
 */
export var getStyle = function (cell, key) {
    var obj = this;
    // Cell
    if (!cell) {
        // Control vars
        var data = {};
        // Column and row length
        var x = obj.options.data[0].length;
        var y = obj.options.data.length;
        // Go through the columns to get the data
        for (var j = 0; j < y; j++) {
            for (var i = 0; i < x; i++) {
                // Value
                var v = key ? obj.records[j][i].element.style[key] : obj.records[j][i].element.getAttribute('style');
                // Any meta data for this column?
                if (v) {
                    // Column name
                    var k = getColumnNameFromId([i, j]);
                    // Value
                    data[k] = v;
                }
            }
        }
        return data;
    }
    else {
        cell = getIdFromColumnName(cell, true);
        return key ? obj.records[cell[1]][cell[0]].element.style[key] : obj.records[cell[1]][cell[0]].element.getAttribute('style');
    }
};
/**
 * Set meta information to cell(s)
 *
 * @return integer
 */
export var setStyle = function (o, k, v, force, ignoreHistoryAndEvents) {
    var obj = this;
    var newValue = {};
    var oldValue = {};
    // Apply style
    var applyStyle = function (cellId, key, value) {
        // Position
        var cell = getIdFromColumnName(cellId, true);
        if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]] && (obj.records[cell[1]][cell[0]].element.classList.contains('readonly') == false || force)) {
            // Current value
            var currentValue = obj.records[cell[1]][cell[0]].element.style[key];
            // Change layout
            if (currentValue == value && !force) {
                value = '';
                obj.records[cell[1]][cell[0]].element.style[key] = '';
            }
            else {
                obj.records[cell[1]][cell[0]].element.style[key] = value;
            }
            // History
            if (!oldValue[cellId]) {
                oldValue[cellId] = [];
            }
            if (!newValue[cellId]) {
                newValue[cellId] = [];
            }
            oldValue[cellId].push([key + ':' + currentValue]);
            newValue[cellId].push([key + ':' + value]);
        }
    };
    if (k && v) {
        // Get object from string
        if (typeof (o) == 'string') {
            applyStyle(o, k, v);
        }
    }
    else {
        var keys_1 = Object.keys(o);
        for (var i = 0; i < keys_1.length; i++) {
            var style = o[keys_1[i]];
            if (typeof (style) == 'string') {
                style = style.split(';');
            }
            for (var j = 0; j < style.length; j++) {
                if (typeof (style[j]) == 'string') {
                    style[j] = style[j].split(':');
                }
                // Apply value
                if (style[j][0].trim()) {
                    applyStyle(keys_1[i], style[j][0].trim(), style[j][1]);
                }
            }
        }
    }
    var keys = Object.keys(oldValue);
    for (var i = 0; i < keys.length; i++) {
        oldValue[keys[i]] = oldValue[keys[i]].join(';');
    }
    keys = Object.keys(newValue);
    for (var i = 0; i < keys.length; i++) {
        newValue[keys[i]] = newValue[keys[i]].join(';');
    }
    if (!ignoreHistoryAndEvents) {
        // Keeping history of changes
        setHistory.call(obj, {
            action: 'setStyle',
            oldValue: oldValue,
            newValue: newValue,
        });
    }
    dispatch.call(obj, 'onchangestyle', obj, newValue);
};
export var resetStyle = function (o, ignoreHistoryAndEvents) {
    var obj = this;
    var keys = Object.keys(o);
    for (var i = 0; i < keys.length; i++) {
        // Position
        var cell = getIdFromColumnName(keys[i], true);
        if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
            obj.records[cell[1]][cell[0]].element.setAttribute('style', '');
        }
    }
    obj.setStyle(o, null, null, null, ignoreHistoryAndEvents);
};
//# sourceMappingURL=style.js.map