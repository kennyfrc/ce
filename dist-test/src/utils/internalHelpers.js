"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getColumnNameFromId = exports.getIdFromColumnName = exports.injectArray = void 0;
const helpers_1 = require("./helpers");
/**
 * Helper injectArray
 */
const injectArray = function (o, idx, arr) {
    if (idx <= o.length) {
        return o.slice(0, idx).concat(arr).concat(o.slice(idx));
    }
    const array = o.slice(0, o.length);
    while (idx > array.length) {
        array.push(undefined);
    }
    return array.concat(arr);
};
exports.injectArray = injectArray;
/**
 * Convert excel like column to jss id
 *
 * @param string id
 * @return string id
 */
const getIdFromColumnName = function (id, arr) {
    // Get the letters
    const t = /^[a-zA-Z]+/.exec(id);
    if (t) {
        // Base 26 calculation
        let code = 0;
        for (let i = 0; i < t[0].length; i++) {
            code +=
                parseInt(String(t[0].charCodeAt(i) - 64)) *
                    Math.pow(26, t[0].length - 1 - i);
        }
        code--;
        // Make sure jss starts on zero
        if (code < 0) {
            code = 0;
        }
        // Number
        const numberMatch = /[0-9]+$/.exec(id);
        let number = numberMatch ? parseInt(numberMatch[0]) : 0;
        if (number > 0) {
            number--;
        }
        if (arr == true) {
            return [code, number];
        }
        else {
            return code + "-" + number;
        }
    }
    return id;
};
exports.getIdFromColumnName = getIdFromColumnName;
/**
 * Convert jss id to excel like column name
 *
 * @param string id
 * @return string id
 */
const getColumnNameFromId = function (cellId) {
    if (!Array.isArray(cellId)) {
        const parts = cellId.split("-");
        return ((0, helpers_1.getColumnName)(parseInt(String(parts[0]))) +
            (parseInt(String(parts[1])) + 1));
    }
    return ((0, helpers_1.getColumnName)(parseInt(String(cellId[0]))) +
        (parseInt(String(cellId[1])) + 1));
};
exports.getColumnNameFromId = getColumnNameFromId;
