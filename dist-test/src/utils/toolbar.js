"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideToolbar = exports.showToolbar = exports.updateToolbar = exports.createToolbar = exports.getDefault = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const helpers_1 = require("./helpers");
const internal_1 = require("./internal");
const setItemStatus = function (toolbarItem, worksheet) {
    if (worksheet.options.editable != false) {
        toolbarItem.classList.remove("jtoolbar-disabled");
    }
    else {
        toolbarItem.classList.add("jtoolbar-disabled");
    }
};
const getDefault = function () {
    const items = [];
    const spreadsheet = this;
    const getActive = function () {
        return internal_1.getWorksheetInstance.call(spreadsheet);
    };
    items.push({
        content: "undo",
        onclick: function () {
            var _a;
            const worksheet = getActive();
            (_a = worksheet.undo) === null || _a === void 0 ? void 0 : _a.call(worksheet);
        },
    });
    items.push({
        content: "redo",
        onclick: function () {
            var _a;
            const worksheet = getActive();
            (_a = worksheet.redo) === null || _a === void 0 ? void 0 : _a.call(worksheet);
        },
    });
    items.push({
        content: "save",
        onclick: function () {
            var _a;
            const worksheet = getActive();
            if (worksheet) {
                (_a = worksheet.download) === null || _a === void 0 ? void 0 : _a.call(worksheet);
            }
        },
    });
    items.push({
        type: "divisor",
    });
    items.push({
        type: "select",
        width: "120px",
        options: ["Default", "Verdana", "Arial", "Courier New"],
        render: function (element, value) {
            return '<span style="font-family:' + value + '">' + value + "</span>";
        },
        onchange: function (a, b, c, d, e) {
            var _a, _b;
            const worksheet = getActive();
            let cells = (_a = worksheet.getSelected) === null || _a === void 0 ? void 0 : _a.call(worksheet, true);
            if (!Array.isArray(cells)) {
                return;
            }
            let value = !e ? "" : d;
            (_b = worksheet.setStyle) === null || _b === void 0 ? void 0 : _b.call(worksheet, Object.fromEntries(cells.map(function (cellName) {
                return [cellName, "font-family: " + value];
            })));
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        type: "select",
        width: "48px",
        content: "format_size",
        options: ["x-small", "small", "medium", "large", "x-large"],
        render: function (element, value) {
            return '<span style="font-size:' + value + '">' + value + "</span>";
        },
        onchange: function (a, b, c, value) {
            var _a, _b;
            const worksheet = getActive();
            let cells = (_a = worksheet.getSelected) === null || _a === void 0 ? void 0 : _a.call(worksheet, true);
            if (!Array.isArray(cells)) {
                return;
            }
            (_b = worksheet.setStyle) === null || _b === void 0 ? void 0 : _b.call(worksheet, Object.fromEntries(cells.map(function (cellName) {
                return [cellName, "font-size: " + value];
            })));
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        type: "select",
        options: ["left", "center", "right", "justify"],
        render: function (element, value) {
            return '<i class="material-icons">format_align_' + value + "</i>";
        },
        onchange: function (a, b, c, value) {
            var _a, _b;
            const worksheet = getActive();
            let cells = (_a = worksheet.getSelected) === null || _a === void 0 ? void 0 : _a.call(worksheet, true);
            if (!Array.isArray(cells)) {
                return;
            }
            (_b = worksheet.setStyle) === null || _b === void 0 ? void 0 : _b.call(worksheet, Object.fromEntries(cells.map(function (cellName) {
                return [cellName, "text-align: " + value];
            })));
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        content: "format_bold",
        onclick: function (a, b, c) {
            var _a, _b;
            const worksheet = getActive();
            let cells = (_a = worksheet.getSelected) === null || _a === void 0 ? void 0 : _a.call(worksheet, true);
            if (!Array.isArray(cells)) {
                return;
            }
            (_b = worksheet.setStyle) === null || _b === void 0 ? void 0 : _b.call(worksheet, Object.fromEntries(cells.map(function (cellName) {
                return [cellName, "font-weight:bold"];
            })));
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        type: "color",
        content: "format_color_text",
        k: "color",
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        type: "color",
        content: "format_color_fill",
        k: "background-color",
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    let verticalAlign = ["top", "middle", "bottom"];
    items.push({
        type: "select",
        options: [
            "vertical_align_top",
            "vertical_align_center",
            "vertical_align_bottom",
        ],
        render: function (element, value) {
            return '<i class="material-icons">' + value + "</i>";
        },
        value: 1,
        onchange: function (a, b, c, d, value) {
            var _a, _b;
            const worksheet = getActive();
            let cells = (_a = worksheet.getSelected) === null || _a === void 0 ? void 0 : _a.call(worksheet, true);
            if (!Array.isArray(cells)) {
                return;
            }
            (_b = worksheet.setStyle) === null || _b === void 0 ? void 0 : _b.call(worksheet, Object.fromEntries(cells.map(function (cellName) {
                return [
                    cellName,
                    "vertical-align: " + verticalAlign[value],
                ];
            })));
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        content: "web",
        tooltip: jsuites_1.default.translate("Merge the selected cells"),
        onclick: function () {
            var _a, _b;
            const worksheet = getActive();
            if (worksheet.selectedCell &&
                confirm(jsuites_1.default.translate("The merged cells will retain the value of the top-left cell only. Are you sure?"))) {
                const selectedRange = [
                    Math.min(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.min(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                    Math.max(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.max(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                ];
                let cell = (0, helpers_1.getCellNameFromCoords)(selectedRange[0], selectedRange[1]);
                if (worksheet.records[selectedRange[1]][selectedRange[0]].element.getAttribute("data-merged")) {
                    (_a = worksheet.removeMerge) === null || _a === void 0 ? void 0 : _a.call(worksheet, cell);
                }
                else {
                    let colspan = selectedRange[2] - selectedRange[0] + 1;
                    let rowspan = selectedRange[3] - selectedRange[1] + 1;
                    if (colspan !== 1 || rowspan !== 1) {
                        (_b = worksheet.setMerge) === null || _b === void 0 ? void 0 : _b.call(worksheet, cell, colspan, rowspan);
                    }
                }
            }
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        type: "select",
        options: [
            "border_all",
            "border_outer",
            "border_inner",
            "border_horizontal",
            "border_vertical",
            "border_left",
            "border_top",
            "border_right",
            "border_bottom",
            "border_clear",
        ],
        columns: 5,
        render: function (element, value) {
            return '<i class="material-icons">' + value + "</i>";
        },
        right: true,
        onchange: function (a, b, c, d, e) {
            var _a;
            const worksheet = getActive();
            if (worksheet.selectedCell) {
                const selectedRange = [
                    Math.min(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.min(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                    Math.max(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.max(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                ];
                let type = d;
                if (selectedRange) {
                    // Type guard for border options
                    const borderOptions = b;
                    // Default options
                    let thickness = borderOptions.thickness || 1;
                    let color = borderOptions.color || "black";
                    const borderStyle = borderOptions.style || "solid";
                    if (borderStyle === "double") {
                        thickness += 2;
                    }
                    let style = {};
                    // Matrix
                    let px = selectedRange[0];
                    let py = selectedRange[1];
                    let ux = selectedRange[2];
                    let uy = selectedRange[3];
                    const setBorder = function (columnName, i, j) {
                        let border = ["", "", "", ""];
                        if (((type === "border_top" || type === "border_outer") &&
                            j === py) ||
                            ((type === "border_inner" || type === "border_horizontal") &&
                                j > py) ||
                            type === "border_all") {
                            border[0] =
                                "border-top: " + thickness + "px " + borderStyle + " " + color;
                        }
                        else {
                            border[0] = "border-top: ";
                        }
                        if ((type === "border_all" ||
                            type === "border_right" ||
                            type === "border_outer") &&
                            i === ux) {
                            border[1] =
                                "border-right: " +
                                    thickness +
                                    "px " +
                                    borderStyle +
                                    " " +
                                    color;
                        }
                        else {
                            border[1] = "border-right: ";
                        }
                        if ((type === "border_all" ||
                            type === "border_bottom" ||
                            type === "border_outer") &&
                            j === uy) {
                            border[2] =
                                "border-bottom: " +
                                    thickness +
                                    "px " +
                                    borderStyle +
                                    " " +
                                    color;
                        }
                        else {
                            border[2] = "border-bottom: ";
                        }
                        if (((type === "border_left" || type === "border_outer") &&
                            i === px) ||
                            ((type === "border_inner" || type === "border_vertical") &&
                                i > px) ||
                            type === "border_all") {
                            border[3] =
                                "border-left: " + thickness + "px " + borderStyle + " " + color;
                        }
                        else {
                            border[3] = "border-left: ";
                        }
                        style[columnName] = border.join(";");
                    };
                    for (let j = selectedRange[1]; j <= selectedRange[3]; j++) {
                        // Row - py - uy
                        for (let i = selectedRange[0]; i <= selectedRange[2]; i++) {
                            // Col - px - ux
                            setBorder((0, helpers_1.getCellNameFromCoords)(i, j), i, j);
                            if (worksheet.records[j][i].element.getAttribute("data-merged")) {
                                setBorder((0, helpers_1.getCellNameFromCoords)(selectedRange[0], selectedRange[1]), i, j);
                            }
                        }
                    }
                    if (Object.keys(style)) {
                        (_a = worksheet.setStyle) === null || _a === void 0 ? void 0 : _a.call(worksheet, style);
                    }
                }
            }
        },
        onload: function (a, b) {
            // Border color
            const element = a;
            const config = b;
            let container = document.createElement("div");
            let div = document.createElement("div");
            container.appendChild(div);
            let colorPicker = jsuites_1.default.color(div, {
                closeOnChange: false,
                onchange: function (o, v) {
                    if (o.parentNode && o.parentNode.children[1]) {
                        const child = o.parentNode.children[1];
                        child.style.color = v;
                    }
                    config.color = v;
                },
            });
            let i = document.createElement("i");
            i.classList.add("material-icons");
            i.innerHTML = "color_lens";
            i.onclick = function () {
                colorPicker.open();
            };
            container.appendChild(i);
            element.children[1].appendChild(container);
            div = document.createElement("div");
            jsuites_1.default.picker(div, {
                type: "select",
                data: ["1", "2", "3", "4", "5"],
                render: function (value) {
                    return ('<div style="height: ' +
                        value +
                        'px; width: 30px; background-color: black;"></div>');
                },
                onchange: function (a, k, c, d) {
                    config.thickness = d;
                },
                width: 50,
            });
            element.children[1].appendChild(div);
            const borderStylePicker = document.createElement("div");
            jsuites_1.default.picker(borderStylePicker, {
                type: "select",
                data: ["solid", "dotted", "dashed", "double"],
                render: function (value) {
                    if (value === "double") {
                        return ('<div style="width: 30px; border-top: 3px ' +
                            value +
                            ' black;"></div>');
                    }
                    return ('<div style="width: 30px; border-top: 2px ' + value + ' black;"></div>');
                },
                onchange: function (a, k, c, d) {
                    config.style = d;
                },
                width: 50,
            });
            element.children[1].appendChild(borderStylePicker);
            div = document.createElement("div");
            div.style.flex = "1";
            element.children[1].appendChild(div);
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        },
    });
    items.push({
        type: "divisor",
    });
    items.push({
        content: "fullscreen",
        tooltip: "Toggle Fullscreen",
        onclick: function (a, b, c) {
            var _a, _b, _c;
            if (!(c instanceof HTMLElement))
                return;
            const label = (_a = c.children) === null || _a === void 0 ? void 0 : _a[0];
            if (label && label.textContent === "fullscreen") {
                (_b = spreadsheet.fullscreen) === null || _b === void 0 ? void 0 : _b.call(spreadsheet, true);
                label.textContent = "fullscreen_exit";
            }
            else if (label) {
                (_c = spreadsheet.fullscreen) === null || _c === void 0 ? void 0 : _c.call(spreadsheet, false);
                label.textContent = "fullscreen";
            }
        },
        updateState: function (a, b, toolbarItem) {
            const config = a;
            if (config.parent.config.fullscreen === true) {
                toolbarItem.children[0].textContent = "fullscreen_exit";
            }
            else {
                toolbarItem.children[0].textContent = "fullscreen";
            }
        },
    });
    return items;
};
exports.getDefault = getDefault;
const adjustToolbarSettingsForJSuites = function (toolbar) {
    const spreadsheet = this;
    const items = toolbar.items;
    for (let i = 0; i < items.length; i++) {
        // Tooltip
        if (items[i].tooltip) {
            items[i].title = items[i].tooltip;
            delete items[i].tooltip;
        }
        if (items[i].type == "select") {
            if (items[i].options) {
                items[i].data = items[i].options;
                delete items[i].options;
            }
            else {
                items[i].data = items[i].v;
                delete items[i].v;
                if (items[i].k && !items[i].onchange) {
                    items[i].onchange = function (el, config, value) {
                        var _a, _b;
                        const worksheet = internal_1.getWorksheetInstance.call(spreadsheet);
                        const cells = (_a = worksheet.getSelected) === null || _a === void 0 ? void 0 : _a.call(worksheet, true);
                        if (!Array.isArray(cells))
                            return;
                        const val = value == null ? "" : String(value);
                        (_b = worksheet.setStyle) === null || _b === void 0 ? void 0 : _b.call(worksheet, Object.fromEntries(cells.map(function (cellName) {
                            return [cellName, items[i].k + ": " + val];
                        })));
                    };
                }
            }
        }
        else if (items[i].type == "color") {
            items[i].type = "i";
            items[i].onclick = function (a, b, c) {
                var _a;
                const target = c;
                if (!target.color) {
                    jsuites_1.default.color(target, {
                        onchange: function (o, v) {
                            var _a, _b;
                            const worksheet = internal_1.getWorksheetInstance.call(spreadsheet);
                            const cells = (_a = worksheet.getSelected) === null || _a === void 0 ? void 0 : _a.call(worksheet, true);
                            if (!Array.isArray(cells))
                                return;
                            (_b = worksheet.setStyle) === null || _b === void 0 ? void 0 : _b.call(worksheet, Object.fromEntries(cells.map(function (cellName) {
                                return [cellName, items[i].k + ": " + v];
                            })));
                        },
                        onopen: function (o) {
                            var _a;
                            const widget = o;
                            if ((_a = widget.color) === null || _a === void 0 ? void 0 : _a.select) {
                                widget.color.select("");
                            }
                        },
                    });
                    const colorWidget = target;
                    if ((_a = colorWidget.color) === null || _a === void 0 ? void 0 : _a.open) {
                        colorWidget.color.open();
                    }
                }
            };
        }
    }
};
/**
 * Create toolbar
 */
const createToolbar = function (toolbar) {
    const spreadsheet = this;
    const toolbarElement = document.createElement("div");
    toolbarElement.classList.add("jss_toolbar");
    adjustToolbarSettingsForJSuites.call(spreadsheet, toolbar);
    if (typeof spreadsheet.plugins === "object") {
        Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
            const p = plugin;
            if (typeof p.toolbar === "function") {
                const result = p.toolbar(toolbar);
                if (result) {
                    toolbar = result;
                }
            }
        });
    }
    jsuites_1.default.toolbar(toolbarElement, toolbar);
    return toolbarElement;
};
exports.createToolbar = createToolbar;
const updateToolbar = function (worksheet) {
    var _a;
    if ((_a = worksheet.parent.toolbar) === null || _a === void 0 ? void 0 : _a.toolbar) {
        worksheet.parent.toolbar.toolbar.update(worksheet);
    }
};
exports.updateToolbar = updateToolbar;
const showToolbar = function () {
    const spreadsheet = this;
    if (spreadsheet.config.toolbar && !spreadsheet.toolbar) {
        let toolbar;
        if (Array.isArray(spreadsheet.config.toolbar)) {
            toolbar = {
                items: spreadsheet.config.toolbar,
            };
        }
        else if (typeof spreadsheet.config.toolbar === "object") {
            toolbar = spreadsheet.config.toolbar;
        }
        else {
            toolbar = {
                items: exports.getDefault.call(spreadsheet),
            };
            if (typeof spreadsheet.config.toolbar === "function") {
                toolbar = spreadsheet.config.toolbar(toolbar);
            }
        }
        spreadsheet.toolbar = spreadsheet.element.insertBefore(exports.createToolbar.call(spreadsheet, toolbar), spreadsheet.element.children[1]);
    }
};
exports.showToolbar = showToolbar;
const hideToolbar = function () {
    var _a;
    const spreadsheet = this;
    if (spreadsheet.toolbar) {
        (_a = spreadsheet.toolbar.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(spreadsheet.toolbar);
        delete spreadsheet.toolbar;
    }
};
exports.hideToolbar = hideToolbar;
