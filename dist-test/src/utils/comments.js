"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setComments = exports.getComments = void 0;
const dispatch_1 = __importDefault(require("./dispatch"));
const helpers_1 = require("./helpers");
const history_1 = require("./history");
const internalHelpers_1 = require("./internalHelpers");
/**
 * Get cell comments, null cell for all
 */
const getComments = function (cellParam) {
    var _a, _b, _c, _d;
    const obj = this;
    let cell = cellParam;
    if (cell) {
        if (typeof cell !== "string") {
            return exports.getComments.call(obj);
        }
        const cellCoords = (0, internalHelpers_1.getIdFromColumnName)(cell, true);
        if (!cellCoords || typeof cellCoords === "string")
            return "";
        return (obj.records[cellCoords[1]][cellCoords[0]].element.getAttribute("title") ||
            "");
    }
    else {
        const data = {};
        const dataRows = (_a = obj.options.data) !== null && _a !== void 0 ? _a : [];
        const columns = (_b = obj.options.columns) !== null && _b !== void 0 ? _b : [];
        for (let j = 0; j < dataRows.length; j++) {
            for (let i = 0; i < columns.length; i++) {
                const comments = (_d = (_c = obj.records[j]) === null || _c === void 0 ? void 0 : _c[i]) === null || _d === void 0 ? void 0 : _d.element.getAttribute("title");
                if (comments) {
                    const cell = (0, internalHelpers_1.getColumnNameFromId)([i, j]);
                    data[cell] = comments;
                }
            }
        }
        return data;
    }
};
exports.getComments = getComments;
/**
 * Set cell comments
 */
const setComments = function (cellId, comments) {
    const obj = this;
    let commentsObj;
    if (typeof cellId == "string") {
        commentsObj = { [cellId]: comments };
    }
    else {
        commentsObj = cellId;
    }
    const oldValue = {};
    Object.entries(commentsObj).forEach(function ([cellName, comment]) {
        var _a, _b, _c, _d;
        const cellCoords = (0, helpers_1.getCoordsFromCellName)(cellName);
        if (!cellCoords[0] || !cellCoords[1])
            return;
        // Keep old value
        oldValue[cellName] =
            obj.records[cellCoords[1]][cellCoords[0]].element.getAttribute("title");
        // Set new values
        obj.records[cellCoords[1]][cellCoords[0]].element.setAttribute("title", comment ? comment : "");
        // Remove class if there is no comment
        if (comment) {
            (_b = (_a = obj.records[cellCoords[1]]) === null || _a === void 0 ? void 0 : _a[cellCoords[0]]) === null || _b === void 0 ? void 0 : _b.element.classList.add("jss_comments");
            if (!obj.options.comments) {
                obj.options.comments = {};
            }
            obj.options.comments[cellName] = comment;
        }
        else {
            (_d = (_c = obj.records[cellCoords[1]]) === null || _c === void 0 ? void 0 : _c[cellCoords[0]]) === null || _d === void 0 ? void 0 : _d.element.classList.remove("jss_comments");
            const commentsRecord = obj.options.comments;
            if (commentsRecord && commentsRecord[cellName]) {
                delete commentsRecord[cellName];
            }
        }
    });
    // Save history
    history_1.setHistory.call(obj, {
        action: "setComments",
        newValue: commentsObj,
        oldValue: oldValue,
    });
    // Set comments
    dispatch_1.default.call(obj, "oncomments", obj, commentsObj, oldValue);
};
exports.setComments = setComments;
