"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toColumnNumber = toColumnNumber;
exports.toColumnName = toColumnName;
exports.getColumnDefinition = getColumnDefinition;
exports.validateColumnNumber = validateColumnNumber;
/**
 * Convert a column identifier (number or string) to a numeric column index
 * Strings can be either numeric strings ("1", "2") or column names ("A", "B")
 */
function toColumnNumber(mixed) {
    if (typeof mixed === "number") {
        if (mixed < 0)
            throw new Error(`Column number cannot be negative: ${mixed}`);
        return mixed;
    }
    if (typeof mixed === "string") {
        // Handle numeric strings
        if (!isNaN(Number(mixed))) {
            const num = Number(mixed);
            if (num < 0)
                throw new Error(`Column number cannot be negative: ${mixed}`);
            return num;
        }
        // Handle column names like "A", "B", "AA", etc.
        if (mixed.match(/^[A-Z]+$/i)) {
            let result = 0;
            const str = mixed.toUpperCase();
            for (let i = 0; i < str.length; i++) {
                result *= 26;
                result += str.charCodeAt(i) - 64; // 'A' is 65, so 65-64=1
            }
            return result - 1; // Convert to 0-based index
        }
        throw new Error(`Invalid column identifier: ${mixed}`);
    }
    throw new Error(`Invalid column identifier type: ${typeof mixed}`);
}
/**
 * Convert a column number to a column name (e.g., 0 -> "A", 1 -> "B")
 */
function toColumnName(columnNumber) {
    if (columnNumber < 0)
        throw new Error(`Column number cannot be negative: ${columnNumber}`);
    let result = "";
    let num = columnNumber + 1; // Convert to 1-based for calculation
    while (num > 0) {
        const remainder = (num - 1) % 26;
        result = String.fromCharCode(65 + remainder) + result;
        num = Math.floor((num - 1) / 26);
    }
    return result;
}
/**
 * Safely get a column definition from the context
 */
function getColumnDefinition(context, columnIdentifier) {
    var _a;
    const columnNumber = toColumnNumber(columnIdentifier);
    return (_a = context.options.columns) === null || _a === void 0 ? void 0 : _a[columnNumber];
}
/**
 * Validate that a column identifier is within valid bounds for the spreadsheet
 */
function validateColumnNumber(context, columnNumber) {
    var _a;
    const numColumns = ((_a = context.options.columns) === null || _a === void 0 ? void 0 : _a.length) || 0;
    return columnNumber >= 0 && columnNumber < numColumns;
}
