"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.getSpreadsheetConfig = exports.getWorksheetConfig = void 0;
/**
 * Get table config information
 */
const getWorksheetConfig = function () {
    const obj = this;
    return obj.options;
};
exports.getWorksheetConfig = getWorksheetConfig;
const getSpreadsheetConfig = function () {
    const spreadsheet = this;
    return spreadsheet.config;
};
exports.getSpreadsheetConfig = getSpreadsheetConfig;
const setConfig = function (config, spreadsheetLevel) {
    const obj = this;
    if (typeof config !== 'object' || config === null) {
        return;
    }
    const configRecord = config;
    const keys = Object.keys(configRecord);
    let spreadsheet;
    if (!obj.parent) {
        spreadsheetLevel = true;
        spreadsheet = obj;
    }
    else {
        spreadsheet = obj.parent;
    }
    keys.forEach(function (key) {
        var _a, _b;
        if (spreadsheetLevel) {
            spreadsheet.config[key] = configRecord[key];
            if (key === "toolbar") {
                const spreadsheetInstance = spreadsheet;
                if (configRecord[key] === true) {
                    (_a = spreadsheetInstance.showToolbar) === null || _a === void 0 ? void 0 : _a.call(spreadsheetInstance);
                }
                else if (configRecord[key] === false) {
                    (_b = spreadsheetInstance.hideToolbar) === null || _b === void 0 ? void 0 : _b.call(spreadsheetInstance);
                }
            }
        }
        else {
            obj.options[key] = configRecord[key];
        }
    });
};
exports.setConfig = setConfig;
