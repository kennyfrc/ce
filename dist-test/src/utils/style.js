"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetStyle = exports.setStyle = exports.getStyle = void 0;
const dispatch_1 = __importDefault(require("./dispatch"));
const internalHelpers_1 = require("./internalHelpers");
const history_1 = require("./history");
/**
 * Get style information from cell(s)
 *
 * @return integer
 */
const getStyle = function (cell, key) {
    const obj = this;
    // Cell
    if (!cell) {
        // Control vars
        const data = {};
        // Column and row length
        const x = obj.options.data[0].length;
        const y = obj.options.data.length;
        // Go through the columns to get the data
        for (let j = 0; j < y; j++) {
            for (let i = 0; i < x; i++) {
                // Value
                const v = key
                    ? obj.records[j][i].element.style[key]
                    : obj.records[j][i].element.getAttribute("style");
                // Any meta data for this column?
                if (v) {
                    // Column name
                    const k = (0, internalHelpers_1.getColumnNameFromId)([i, j]);
                    // Value
                    data[k] = v;
                }
            }
        }
        return data;
    }
    else {
        cell = (0, internalHelpers_1.getIdFromColumnName)(cell, true);
        return key
            ? obj.records[cell[1]][cell[0]].element.style[key]
            : obj.records[cell[1]][cell[0]].element.getAttribute("style");
    }
};
exports.getStyle = getStyle;
/**
 * Set meta information to cell(s)
 *
 * @return integer
 */
const setStyle = function (o, k, v, force, ignoreHistoryAndEvents) {
    const obj = this;
    const newValue = {};
    const oldValue = {};
    // Apply style
    const applyStyle = function (cellId, key, value) {
        // Position
        const cell = (0, internalHelpers_1.getIdFromColumnName)(cellId, true);
        if (obj.records[cell[1]] &&
            obj.records[cell[1]][cell[0]] &&
            (obj.records[cell[1]][cell[0]].element.classList.contains("readonly") ==
                false ||
                force)) {
            // Current value
            const currentValue = obj.records[cell[1]][cell[0]].element.style[key];
            // Change layout
            if (currentValue == value && !force) {
                value = "";
                obj.records[cell[1]][cell[0]].element.style[key] = "";
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
            oldValue[cellId].push([key + ":" + currentValue]);
            newValue[cellId].push([key + ":" + value]);
        }
    };
    if (k && v) {
        // Get object from string
        if (typeof o == "string") {
            applyStyle(o, k, v);
        }
    }
    else {
        const keys = Object.keys(o);
        for (let i = 0; i < keys.length; i++) {
            let style = o[keys[i]];
            if (typeof style == "string") {
                style = style.split(";");
            }
            for (let j = 0; j < style.length; j++) {
                if (typeof style[j] == "string") {
                    style[j] = style[j].split(":");
                }
                // Apply value
                if (style[j][0].trim()) {
                    applyStyle(keys[i], style[j][0].trim(), style[j][1]);
                }
            }
        }
    }
    let keys = Object.keys(oldValue);
    for (let i = 0; i < keys.length; i++) {
        oldValue[keys[i]] = oldValue[keys[i]].join(";");
    }
    keys = Object.keys(newValue);
    for (let i = 0; i < keys.length; i++) {
        newValue[keys[i]] = newValue[keys[i]].join(";");
    }
    if (!ignoreHistoryAndEvents) {
        // Keeping history of changes
        history_1.setHistory.call(obj, {
            action: "setStyle",
            oldValue: oldValue,
            newValue: newValue,
        });
    }
    dispatch_1.default.call(obj, "onchangestyle", obj, newValue);
};
exports.setStyle = setStyle;
const resetStyle = function (o, ignoreHistoryAndEvents) {
    const obj = this;
    const keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
        // Position
        const cell = (0, internalHelpers_1.getIdFromColumnName)(keys[i], true);
        if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
            obj.records[cell[1]][cell[0]].element.setAttribute("style", "");
        }
    }
    obj.setStyle(o, null, null, null, ignoreHistoryAndEvents);
};
exports.resetStyle = resetStyle;
