"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setHeader = exports.getHeaders = exports.getHeader = void 0;
const history_1 = require("./history");
const dispatch_1 = __importDefault(require("./dispatch"));
const helpers_1 = require("./helpers");
/**
 * Get the column title
 *
 * @param column - column number (first column is: 0)
 * @param title - new column title
 */
const getHeader = function (column) {
    const obj = this;
    return obj.headers[column].textContent;
};
exports.getHeader = getHeader;
/**
 * Get the headers
 *
 * @param asArray
 * @return mixed
 */
const getHeaders = function (asArray) {
    const obj = this;
    const title = [];
    for (let i = 0; i < obj.headers.length; i++) {
        title.push(exports.getHeader.call(obj, i));
    }
    return asArray ? title : title.join(obj.options.csvDelimiter);
};
exports.getHeaders = getHeaders;
/**
 * Set the column title
 *
 * @param column - column number (first column is: 0)
 * @param title - new column title
 */
const setHeader = function (column, newValue) {
    const obj = this;
    if (obj.headers[column]) {
        const oldValue = obj.headers[column].textContent;
        const onchangeheaderOldValue = (obj.options.columns &&
            obj.options.columns[column] &&
            obj.options.columns[column].title) ||
            "";
        if (!newValue) {
            newValue = (0, helpers_1.getColumnName)(column);
        }
        obj.headers[column].textContent = newValue;
        // Keep the title property
        obj.headers[column].setAttribute("title", newValue);
        // Update title
        if (!obj.options.columns) {
            obj.options.columns = [];
        }
        if (!obj.options.columns[column]) {
            obj.options.columns[column] = {};
        }
        obj.options.columns[column].title = newValue;
        history_1.setHistory.call(obj, {
            action: "setHeader",
            column: column,
            oldValue: oldValue,
            newValue: newValue,
        });
        // On onchange header
        dispatch_1.default.call(obj, "onchangeheader", obj, column, newValue, onchangeheaderOldValue);
    }
};
exports.setHeader = setHeader;
