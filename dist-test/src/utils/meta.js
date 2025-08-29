"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMeta = exports.updateMeta = exports.getMeta = void 0;
const dispatch_1 = __importDefault(require("./dispatch"));
/**
 * Get meta information from cell(s)
 *
 * @return unknown
 */
const getMeta = function (cell, key) {
    const obj = this;
    if (!cell) {
        return obj.options.meta;
    }
    else {
        if (key) {
            return obj.options.meta &&
                obj.options.meta[cell] &&
                obj.options.meta[cell][key]
                ? obj.options.meta[cell][key]
                : null;
        }
        else {
            return obj.options.meta && obj.options.meta[cell]
                ? obj.options.meta[cell]
                : null;
        }
    }
};
exports.getMeta = getMeta;
/**
 * Update meta information
 *
 * @return void
 */
const updateMeta = function (affectedCells) {
    const obj = this;
    if (obj.options.meta) {
        const newMeta = {};
        const keys = Object.keys(obj.options.meta);
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            if (affectedCells[k]) {
                newMeta[affectedCells[k]] = obj.options.meta[k];
            }
            else {
                newMeta[k] = obj.options.meta[k];
            }
        }
        // Update meta information
        obj.options.meta = newMeta;
    }
};
exports.updateMeta = updateMeta;
/**
 * Set meta information to cell(s)
 *
 * @return void
 */
const setMeta = function (o, k, v) {
    const obj = this;
    if (!obj.options.meta) {
        obj.options.meta = {};
    }
    if (k !== undefined && v !== undefined) {
        // Set data value
        const cellId = o;
        if (!obj.options.meta[cellId]) {
            obj.options.meta[cellId] = {};
        }
        obj.options.meta[cellId][k] = v;
        dispatch_1.default.call(obj, "onchangemeta", obj, { [cellId]: { [k]: v } });
    }
    else {
        // Apply that for all cells
        const source = o;
        const keys = Object.keys(source);
        for (let i = 0; i < keys.length; i++) {
            const cellId = keys[i];
            if (!obj.options.meta[cellId]) {
                obj.options.meta[cellId] = {};
            }
            const prop = Object.keys(source[cellId]);
            for (let j = 0; j < prop.length; j++) {
                const p = prop[j];
                obj.options.meta[cellId][p] = source[cellId][p];
            }
        }
        dispatch_1.default.call(obj, "onchangemeta", obj, o);
    }
};
exports.setMeta = setMeta;
