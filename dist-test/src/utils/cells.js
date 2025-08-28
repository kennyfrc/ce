"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReadOnly = exports.setReadOnly = void 0;
const helpers_1 = require("./helpers");
const setReadOnly = function (cell, state) {
    const obj = this;
    let record;
    if (typeof cell === "string") {
        const coords = (0, helpers_1.getCoordsFromCellName)(cell);
        if (coords[0] === null || coords[1] === null) {
            return;
        }
        record = obj.records[coords[1]][coords[0]];
    }
    else {
        const xAttr = cell.getAttribute("data-x");
        const yAttr = cell.getAttribute("data-y");
        if (xAttr === null || yAttr === null) {
            return;
        }
        const x = parseInt(xAttr);
        const y = parseInt(yAttr);
        if (obj.records[y] && obj.records[y][x]) {
            record = obj.records[y][x];
        }
        else {
            return;
        }
    }
    if (state) {
        record.element.classList.add("readonly");
    }
    else {
        record.element.classList.remove("readonly");
    }
};
exports.setReadOnly = setReadOnly;
const isReadOnly = function (x, y) {
    const obj = this;
    if (typeof x === "string" && typeof y === "undefined") {
        const coords = (0, helpers_1.getCoordsFromCellName)(x);
        if (coords[0] === null || coords[1] === null) {
            return false;
        }
        [x, y] = coords;
    }
    if (y !== undefined && obj.records[y] && obj.records[y][x]) {
        return obj.records[y][x].element.classList.contains("readonly");
    }
    return false;
};
exports.isReadOnly = isReadOnly;
