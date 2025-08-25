import dispatch from "./dispatch.js";
/**
 * Get meta information from cell(s)
 *
 * @return integer
 */
export var getMeta = function (cell, key) {
    var obj = this;
    if (!cell) {
        return obj.options.meta;
    }
    else {
        if (key) {
            return obj.options.meta && obj.options.meta[cell] && obj.options.meta[cell][key] ? obj.options.meta[cell][key] : null;
        }
        else {
            return obj.options.meta && obj.options.meta[cell] ? obj.options.meta[cell] : null;
        }
    }
};
/**
 * Update meta information
 *
 * @return integer
 */
export var updateMeta = function (affectedCells) {
    var obj = this;
    if (obj.options.meta) {
        var newMeta = {};
        var keys = Object.keys(obj.options.meta);
        for (var i = 0; i < keys.length; i++) {
            if (affectedCells[keys[i]]) {
                newMeta[affectedCells[keys[i]]] = obj.options.meta[keys[i]];
            }
            else {
                newMeta[keys[i]] = obj.options.meta[keys[i]];
            }
        }
        // Update meta information
        obj.options.meta = newMeta;
    }
};
/**
 * Set meta information to cell(s)
 *
 * @return integer
 */
export var setMeta = function (o, k, v) {
    var _a, _b;
    var obj = this;
    if (!obj.options.meta) {
        obj.options.meta = {};
    }
    if (k && v) {
        // Set data value
        if (!obj.options.meta[o]) {
            obj.options.meta[o] = {};
        }
        obj.options.meta[o][k] = v;
        dispatch.call(obj, 'onchangemeta', obj, (_a = {}, _a[o] = (_b = {}, _b[k] = v, _b), _a));
    }
    else {
        // Apply that for all cells
        var keys = Object.keys(o);
        for (var i = 0; i < keys.length; i++) {
            if (!obj.options.meta[keys[i]]) {
                obj.options.meta[keys[i]] = {};
            }
            var prop = Object.keys(o[keys[i]]);
            for (var j = 0; j < prop.length; j++) {
                obj.options.meta[keys[i]][prop[j]] = o[keys[i]][prop[j]];
            }
        }
        dispatch.call(obj, 'onchangemeta', obj, o);
    }
};
//# sourceMappingURL=meta.js.map