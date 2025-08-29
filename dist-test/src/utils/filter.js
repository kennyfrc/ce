"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetFilters = exports.closeFilter = exports.openFilter = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const internal_1 = require("./internal");
const selection_1 = require("./selection");
/**
 * Open the column filter
 */
const openFilter = function (columnId) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const obj = this;
    if (!obj.options.filters) {
        console.log("Jspreadsheet: filters not enabled.");
    }
    else {
        // Make sure is integer
        const columnIdNum = parseInt(columnId);
        // Reset selection
        (_a = obj.resetSelection) === null || _a === void 0 ? void 0 : _a.call(obj);
        // Load options
        let optionsFiltered = [];
        const columns = (_b = obj.options.columns) !== null && _b !== void 0 ? _b : [];
        if (((_c = columns[columnIdNum]) === null || _c === void 0 ? void 0 : _c.type) == "checkbox") {
            optionsFiltered.push({ id: "true", name: "True" });
            optionsFiltered.push({ id: "false", name: "False" });
        }
        else {
            const options = {};
            let hasBlanks = false;
            const dataRows = (_d = obj.options.data) !== null && _d !== void 0 ? _d : [];
            for (let j = 0; j < dataRows.length; j++) {
                const row = Array.isArray(dataRows[j]) ? dataRows[j] : [];
                const k = Array.isArray(row) ? row[columnIdNum] : undefined;
                const v = (_f = (_e = obj.records[j]) === null || _e === void 0 ? void 0 : _e[columnIdNum]) === null || _f === void 0 ? void 0 : _f.element.innerHTML;
                if (k !== undefined && k !== null && v) {
                    options[String(k)] = v;
                }
                else {
                    hasBlanks = true;
                }
            }
            const keys = Object.keys(options);
            optionsFiltered = [];
            for (let j = 0; j < keys.length; j++) {
                optionsFiltered.push({ id: keys[j], name: options[keys[j]] });
            }
            // Has blank options
            if (hasBlanks) {
                optionsFiltered.push({ id: "", name: "(Blanks)" });
            }
        }
        // Create dropdown
        const div = document.createElement("div");
        const filterElement = (_g = obj.filter) === null || _g === void 0 ? void 0 : _g.children[columnIdNum + 1];
        if (filterElement) {
            filterElement.innerHTML = "";
            filterElement.appendChild(div);
            filterElement.style.paddingLeft = "0px";
            filterElement.style.paddingRight = "0px";
            filterElement.style.overflow = "initial";
        }
        const filters = (_h = obj.filters) !== null && _h !== void 0 ? _h : {};
        const opt = {
            data: optionsFiltered,
            multiple: true,
            autocomplete: true,
            opened: true,
            value: filters[columnId] !== undefined ? filters[columnId] : null,
            width: 100,
            position: obj.options.tableOverflow == true ||
                ((_k = (_j = obj.parent) === null || _j === void 0 ? void 0 : _j.config) === null || _k === void 0 ? void 0 : _k.fullscreen) == true
                ? true
                : false,
            onclose: function (element, instance) {
                var _a;
                exports.resetFilters.call(obj);
                const dropdownInstance = instance;
                const dropdownValue = dropdownInstance.getValue(true);
                filters[columnIdNum] = dropdownValue;
                const filterChild = (_a = obj.filter) === null || _a === void 0 ? void 0 : _a.children[columnIdNum + 1];
                if (filterChild) {
                    filterChild.innerHTML = dropdownInstance.getText();
                    filterChild.style.paddingLeft = "";
                    filterChild.style.paddingRight = "";
                    filterChild.style.overflow = "";
                }
                exports.closeFilter.call(obj, columnIdNum);
                selection_1.refreshSelection.call(obj);
            },
        };
        // Dynamic dropdown
        jsuites_1.default.dropdown(div, opt);
    }
};
exports.openFilter = openFilter;
const closeFilter = function (columnId) {
    var _a, _b, _c, _d;
    const obj = this;
    const filters = (_a = obj.filters) !== null && _a !== void 0 ? _a : {};
    if (!columnId) {
        const filterChildren = (_c = (_b = obj.filter) === null || _b === void 0 ? void 0 : _b.children) !== null && _c !== void 0 ? _c : [];
        for (let i = 0; i < filterChildren.length; i++) {
            if (filters[i]) {
                columnId = i;
            }
        }
    }
    // Search filter
    const search = function (query, x, y) {
        var _a, _b, _c;
        const dataRows = (_a = obj.options.data) !== null && _a !== void 0 ? _a : [];
        const row = Array.isArray(dataRows[y]) ? dataRows[y] : [];
        const value = "" + row[x];
        const label = "" + ((_c = (_b = obj.records[y]) === null || _b === void 0 ? void 0 : _b[x]) === null || _c === void 0 ? void 0 : _c.element.innerHTML);
        for (let i = 0; i < query.length; i++) {
            if (query[i] == value || query[i] == label) {
                return true;
            }
        }
        return false;
    };
    const query = filters[columnId];
    obj.results = [];
    const dataRows = (_d = obj.options.data) !== null && _d !== void 0 ? _d : [];
    for (let j = 0; j < dataRows.length; j++) {
        if (search(query, columnId, j)) {
            obj.results.push(j);
        }
    }
    if (!obj.results.length) {
        obj.results = null;
    }
    internal_1.updateResult.call(obj);
};
exports.closeFilter = closeFilter;
const resetFilters = function () {
    var _a, _b, _c;
    const obj = this;
    if (obj.options.filters) {
        const filterChildren = (_b = (_a = obj.filter) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [];
        const filters = (_c = obj.filters) !== null && _c !== void 0 ? _c : {};
        for (let i = 0; i < filterChildren.length; i++) {
            const child = filterChildren[i];
            if (child) {
                child.innerHTML = "&nbsp;";
            }
            filters[i] = null;
        }
    }
    obj.results = null;
    internal_1.updateResult.call(obj);
};
exports.resetFilters = resetFilters;
