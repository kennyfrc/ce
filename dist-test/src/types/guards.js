"use strict";
// Type guards for runtime type checking
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasHeaders = hasHeaders;
exports.hasOptionsData = hasOptionsData;
exports.hasOptionsColumns = hasOptionsColumns;
exports.hasParent = hasParent;
exports.isHTMLElement = isHTMLElement;
exports.isHTMLInputElement = isHTMLInputElement;
exports.isHTMLTableCellElement = isHTMLTableCellElement;
exports.getHTMLElement = getHTMLElement;
exports.getHTMLInputElement = getHTMLInputElement;
exports.getHTMLTableCellElement = getHTMLTableCellElement;
exports.hasElement = hasElement;
exports.hasConfig = hasConfig;
exports.assertHasHeaders = assertHasHeaders;
exports.assertHasOptionsData = assertHasOptionsData;
function hasHeaders(obj) {
    return obj.headers != null && Array.isArray(obj.headers);
}
function hasOptionsData(obj) {
    var _a;
    return ((_a = obj.options) === null || _a === void 0 ? void 0 : _a.data) != null && Array.isArray(obj.options.data);
}
function hasOptionsColumns(obj) {
    var _a;
    return ((_a = obj.options) === null || _a === void 0 ? void 0 : _a.columns) != null && Array.isArray(obj.options.columns);
}
function hasParent(obj) {
    return obj.parent != null;
}
// DOM element type guards
function isHTMLElement(element) {
    return element instanceof HTMLElement;
}
function isHTMLInputElement(element) {
    return element instanceof HTMLInputElement;
}
function isHTMLTableCellElement(element) {
    return element instanceof HTMLTableCellElement;
}
function getHTMLElement(element) {
    return isHTMLElement(element) ? element : null;
}
function getHTMLInputElement(element) {
    return isHTMLInputElement(element) ? element : null;
}
function getHTMLTableCellElement(element) {
    return isHTMLTableCellElement(element) ? element : null;
}
function hasElement(obj) {
    return obj.element != null;
}
function hasConfig(obj) {
    return obj.config != null;
}
// Runtime assertion functions
function assertHasHeaders(obj) {
    if (!hasHeaders(obj)) {
        throw new Error("SpreadsheetContext is missing headers property");
    }
}
function assertHasOptionsData(obj) {
    if (!hasOptionsData(obj)) {
        throw new Error("SpreadsheetContext options is missing data property");
    }
}
// Add similar assertion functions for other properties as needed
