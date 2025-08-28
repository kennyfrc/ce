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
 * @return integer
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
 * @return integer
 */
const updateMeta = function (affectedCells) {
    const obj = this;
    if (obj.options.meta) {
        const newMeta = {};
        const keys = Object.keys(obj.options.meta);
        for (let i = 0; i < keys.length; i++) {
            if (affectedCells[keys[i]]) {
                newMeta[affectedCells[keys[i]]] = obj.options.meta[keys[i]];
            }
            else {
                newMeta[keys[i]] = obj.options.meta[keys[i]];
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
 * @return integer
 */
const setMeta = function (o, k, v) {
    const obj = this;
    if (!obj.options.meta) {
        obj.options.meta = {};
    }
    if (k && v) {
        // Set data value
        if (!obj.options.meta[o]) {
            obj.options.meta[o] = {};
        }
        obj.options.meta[o][k] = v;
        dispatch_1.default.call(obj, "onchangemeta", obj, { [o]: { [k]: v } });
    }
    else {
        // Apply that for all cells
        const keys = Object.keys(o);
        for (let i = 0; i < keys.length; i++) {
            if (!obj.options.meta[keys[i]]) {
                obj.options.meta[keys[i]] = {};
            }
            const prop = Object.keys(o[keys[i]]);
            for (let j = 0; j < prop.length; j++) {
                obj.options.meta[keys[i]][prop[j]] = o[keys[i]][prop[j]];
            }
        }
        dispatch_1.default.call(obj, "onchangemeta", obj, o);
    }
};
exports.setMeta = setMeta;
