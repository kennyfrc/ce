"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderBy = exports.updateOrder = exports.updateOrderArrow = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const history_1 = require("./history");
const dispatch_1 = __importDefault(require("./dispatch"));
const internal_1 = require("./internal");
const lazyLoading_1 = require("./lazyLoading");
const filter_1 = require("./filter");
/**
 * Update order arrow
 */
const updateOrderArrow = function (column, order) {
    const obj = this;
    // Remove order
    for (let i = 0; i < obj.headers.length; i++) {
        obj.headers[i].classList.remove("arrow-up");
        obj.headers[i].classList.remove("arrow-down");
    }
    // No order specified then toggle order
    if (order) {
        obj.headers[column].classList.add("arrow-up");
    }
    else {
        obj.headers[column].classList.add("arrow-down");
    }
};
exports.updateOrderArrow = updateOrderArrow;
/**
 * Update rows position
 */
const updateOrder = function (rows) {
    var _a, _b, _c;
    const obj = this;
    // History
    const data = [];
    for (let j = 0; j < rows.length; j++) {
        if (obj.options.data) {
            data[j] = obj.options.data[rows[j]];
        }
    }
    if (obj.options.data) {
        obj.options.data = data;
    }
    const recordsData = [];
    for (let j = 0; j < rows.length; j++) {
        recordsData[j] = obj.records[rows[j]];
        for (let i = 0; i < recordsData[j].length; i++) {
            recordsData[j][i].y = j;
        }
    }
    obj.records = recordsData;
    const rowsData = [];
    for (let j = 0; j < rows.length; j++) {
        rowsData[j] = obj.rows[rows[j]];
        rowsData[j].y = j;
    }
    obj.rows = rowsData;
    // Update references
    internal_1.updateTableReferences.call(obj);
    // Redo search
    if (obj.results && obj.results.length) {
        if ((_a = obj.searchInput) === null || _a === void 0 ? void 0 : _a.value) {
            (_b = obj.search) === null || _b === void 0 ? void 0 : _b.call(obj, obj.searchInput.value);
        }
        else {
            filter_1.closeFilter.call(obj);
        }
    }
    else {
        // Create page
        obj.results = null;
        obj.pageNumber = 0;
        if (typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
            (_c = obj.page) === null || _c === void 0 ? void 0 : _c.call(obj, 0);
        }
        else if (obj.options.lazyLoading == true) {
            lazyLoading_1.loadPage.call(obj, 0);
        }
        else {
            for (let j = 0; j < obj.rows.length; j++) {
                obj.tbody.appendChild(obj.rows[j].element);
            }
        }
    }
};
exports.updateOrder = updateOrder;
/**
 * Sort data and reload table
 */
const orderBy = function (column, order) {
    var _a;
    const obj = this;
    if (column >= 0) {
        // Merged cells
        if (obj.options.mergeCells &&
            Object.keys(obj.options.mergeCells).length > 0) {
            if (!confirm(jsuites_1.default.translate("This action will destroy any existing merged cells. Are you sure?"))) {
                return false;
            }
            else {
                // Remove merged cells
                (_a = obj.destroyMerge) === null || _a === void 0 ? void 0 : _a.call(obj);
            }
        }
        // Direction
        let direction;
        if (order == null) {
            if (obj.headers[column]) {
                direction = obj.headers[column].classList.contains("arrow-down");
            }
            else {
                direction = false;
            }
        }
        else {
            direction = order ? true : false;
        }
        // Test order
        let temp = [];
        if (obj.options.columns &&
            obj.options.columns[column] &&
            (obj.options.columns[column].type === "numeric" ||
                obj.options.columns[column].type === "color")) {
            if (obj.options.data) {
                for (let j = 0; j < obj.options.data.length; j++) {
                    if (obj.options.data[j]) {
                        temp[j] = [j, Number(obj.options.data[j][column])];
                    }
                }
            }
        }
        else if (obj.options.columns &&
            obj.options.columns[column] &&
            (obj.options.columns[column].type == "calendar" ||
                obj.options.columns[column].type == "checkbox" ||
                obj.options.columns[column].type == "radio")) {
            if (obj.options.data) {
                for (let j = 0; j < obj.options.data.length; j++) {
                    if (obj.options.data[j]) {
                        temp[j] = [j, obj.options.data[j][column]];
                    }
                }
            }
        }
        else {
            if (obj.options.data) {
                for (let j = 0; j < obj.options.data.length; j++) {
                    if (obj.records[j] && obj.records[j][column] && obj.records[j][column].element) {
                        const textContent = obj.records[j][column].element.textContent;
                        temp[j] = [j, textContent ? textContent.toLowerCase() : ""];
                    }
                }
            }
        }
        // Default sorting method
        if (typeof obj.parent.config.sorting !== "function") {
            obj.parent.config.sorting = function (direction) {
                return function (a, b) {
                    const valueA = a[1];
                    const valueB = b[1];
                    if (!direction) {
                        return valueA === "" && valueB !== ""
                            ? 1
                            : valueA !== "" && valueB === ""
                                ? -1
                                : valueA > valueB
                                    ? 1
                                    : valueA < valueB
                                        ? -1
                                        : 0;
                    }
                    else {
                        return valueA === "" && valueB !== ""
                            ? 1
                            : valueA !== "" && valueB === ""
                                ? -1
                                : valueA > valueB
                                    ? -1
                                    : valueA < valueB
                                        ? 1
                                        : 0;
                    }
                };
            };
        }
        temp = temp.sort(obj.parent.config.sorting(direction));
        // Save history
        const newValue = [];
        for (let j = 0; j < temp.length; j++) {
            newValue[j] = temp[j][0];
        }
        // Save history
        history_1.setHistory.call(obj, {
            action: "orderBy",
            rows: newValue,
            column: column,
            order: direction,
        });
        // Update order
        exports.updateOrderArrow.call(obj, column, direction);
        exports.updateOrder.call(obj, newValue);
        // On sort event
        dispatch_1.default.call(obj, "onsort", obj, column, direction, newValue.map((row) => row));
        return true;
    }
    return false;
};
exports.orderBy = orderBy;
