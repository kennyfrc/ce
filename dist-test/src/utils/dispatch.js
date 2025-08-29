"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsuites_1 = __importDefault(require("jsuites"));
/**
 * Prepare JSON in the correct format
 */
const prepareJson = function (data) {
    const obj = this;
    if (!Array.isArray(data)) {
        return [];
    }
    const arr = data;
    const rows = [];
    for (let i = 0; i < arr.length; i++) {
        const x = arr[i].x;
        const y = arr[i].y;
        const col = obj.options.columns && obj.options.columns[x];
        const k = col && typeof col.name === "string" ? col.name : String(x);
        if (!rows[y]) {
            rows[y] = {
                row: y,
                data: {},
            };
        }
        if (rows[y]) {
            rows[y].data[k] = arr[i].value;
        }
    }
    return rows.filter(function (el) {
        return el != null;
    });
};
/**
 * Post json to a remote server
 */
const save = function (url, data) {
    var _a;
    const obj = this;
    // Parse anything in the data before sending to the server
    const ret = dispatch.call(obj.parent, "onbeforesave", obj.parent, obj, data);
    if (ret) {
        if (Array.isArray(ret)) {
            data = ret;
        }
        else if (ret === false) {
            return false;
        }
        else {
            return undefined;
        }
    }
    else {
        return undefined;
    }
    const jsuitesLib = jsuites_1.default;
    (_a = jsuitesLib.ajax) === null || _a === void 0 ? void 0 : _a.call(jsuitesLib, {
        url,
        method: "POST",
        dataType: "json",
        data: { data: JSON.stringify(data) },
        success: function (result) {
            // Event
            dispatch.call(obj, "onsave", obj.parent, obj, data);
        },
    });
    return true;
};
/**
 * Trigger events
 */
const dispatch = function (event, ...args) {
    const obj = this;
    let ret = null;
    // Get the spreadsheet instance
    let spreadsheet;
    if ('parent' in obj && obj.parent) {
        spreadsheet = obj.parent;
    }
    else {
        spreadsheet = obj;
    }
    // Dispatch events
    if (!spreadsheet.ignoreEvents) {
        // Handle global onevent handler
        if (spreadsheet.config && typeof spreadsheet.config.onevent === "function") {
            ret = spreadsheet.config.onevent.call(this, event, ...args);
        }
        // Handle specific event handlers
        if (spreadsheet.config && typeof spreadsheet.config[event] === "function") {
            const specificHandler = spreadsheet.config[event];
            ret = specificHandler.apply(this, args);
        }
        // Handle plugin event handlers
        if (spreadsheet.plugins) {
            Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
                if (plugin && typeof plugin.onevent === "function") {
                    ret = plugin.onevent.apply(obj, [event, ...args]);
                }
            });
        }
    }
    if (event === "onafterchanges" && args.length >= 3) {
        if (spreadsheet.plugins) {
            Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
                if (plugin && typeof plugin.persistence === "function") {
                    plugin.persistence(obj, "setValue", { data: args[2] });
                }
            });
        }
        if (obj.options.persistence) {
            const rawUrl = obj.options.persistence === true ? obj.options.url : obj.options.persistence;
            if (typeof rawUrl === "string") {
                const data = prepareJson.call(obj, args[2]);
                save.call(obj, rawUrl, data);
            }
        }
    }
    return ret;
};
exports.default = dispatch;
