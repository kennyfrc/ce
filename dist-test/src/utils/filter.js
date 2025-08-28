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
    const obj = this;
    if (!obj.options.filters) {
        console.log("Jspreadsheet: filters not enabled.");
    }
    else {
        // Make sure is integer
        const columnIdNum = parseInt(columnId);
        // Reset selection
        obj.resetSelection();
        // Load options
        let optionsFiltered = [];
        if (obj.options.columns[columnIdNum].type == "checkbox") {
            optionsFiltered.push({ id: "true", name: "True" });
            optionsFiltered.push({ id: "false", name: "False" });
        }
        else {
            const options = {};
            let hasBlanks = false;
            for (let j = 0; j < obj.options.data.length; j++) {
                const k = obj.options.data[j][columnIdNum];
                const v = obj.records[j][columnIdNum].element.innerHTML;
                if (k && v) {
                    options[k] = v;
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
                optionsFiltered.push({ value: "", id: "", name: "(Blanks)" });
            }
        }
        // Create dropdown
        const div = document.createElement("div");
        obj.filter.children[columnIdNum + 1].innerHTML = "";
        obj.filter.children[columnIdNum + 1].appendChild(div);
        obj.filter.children[columnIdNum + 1].style.paddingLeft = "0px";
        obj.filter.children[columnIdNum + 1].style.paddingRight = "0px";
        obj.filter.children[columnIdNum + 1].style.overflow = "initial";
        const opt = {
            data: optionsFiltered,
            multiple: true,
            autocomplete: true,
            opened: true,
            value: obj.filters[columnId] !== undefined ? obj.filters[columnId] : null,
            width: 100,
            position: obj.options.tableOverflow == true ||
                obj.parent.config.fullscreen == true
                ? true
                : false,
            onclose: function (o) {
                exports.resetFilters.call(obj);
                obj.filters[columnIdNum] = o.dropdown.getValue(true);
                obj.filter.children[columnIdNum + 1].innerHTML = o.dropdown.getText();
                obj.filter.children[columnIdNum + 1].style.paddingLeft = "";
                obj.filter.children[columnIdNum + 1].style.paddingRight = "";
                obj.filter.children[columnIdNum + 1].style.overflow = "";
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
    const obj = this;
    if (!columnId) {
        for (let i = 0; i < obj.filter.children.length; i++) {
            if (obj.filters[i]) {
                columnId = i;
            }
        }
    }
    // Search filter
    const search = function (query, x, y) {
        for (let i = 0; i < query.length; i++) {
            const value = "" + obj.options.data[y][x];
            const label = "" + obj.records[y][x].element.innerHTML;
            if (query[i] == value || query[i] == label) {
                return true;
            }
        }
        return false;
    };
    const query = obj.filters[columnId];
    obj.results = [];
    for (let j = 0; j < obj.options.data.length; j++) {
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
    const obj = this;
    if (obj.options.filters) {
        for (let i = 0; i < obj.filter.children.length; i++) {
            obj.filter.children[i].innerHTML = "&nbsp;";
            obj.filters[i] = null;
        }
    }
    obj.results = null;
    internal_1.updateResult.call(obj);
};
exports.resetFilters = resetFilters;
