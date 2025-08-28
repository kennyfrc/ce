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
        for (let j = 0; j < obj.options.data.length; j++) {
            for (let i = 0; i < obj.options.columns.length; i++) {
                const comments = obj.records[j][i].element.getAttribute("title");
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
            obj.records[cellCoords[1]][cellCoords[0]].element.classList.add("jss_comments");
            if (!obj.options.comments) {
                obj.options.comments = {};
            }
            obj.options.comments[cellName] = comment;
        }
        else {
            obj.records[cellCoords[1]][cellCoords[0]].element.classList.remove("jss_comments");
            if (obj.options.comments && obj.options.comments[cellName]) {
                delete obj.options.comments[cellName];
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
