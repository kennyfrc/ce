"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsuites_1 = __importDefault(require("jsuites"));
const libraryBase_1 = __importDefault(require("./libraryBase"));
const events_1 = require("./events");
const internal_1 = require("./internal");
const toolbar_1 = require("./toolbar");
const worksheets_1 = require("./worksheets");
const dispatch_1 = __importDefault(require("./dispatch"));
const helpers_1 = require("./helpers");
const config_1 = require("./config");
const factory = function () { };
const createWorksheets = async function (spreadsheet, options, el) {
    var _a;
    // Create worksheets
    let o = options.worksheets;
    if (o) {
        let tabsOptions = {
            animation: true,
            onbeforecreate: function (element, title) {
                if (title) {
                    return title;
                }
                else {
                    return (0, worksheets_1.getNextDefaultWorksheetName)(spreadsheet);
                }
            },
            oncreate: function (element, newTabContent) {
                if (!spreadsheet.creationThroughJss) {
                    const worksheetName = element.tabs.headers.children[element.tabs.headers.children.length - 2].innerHTML;
                    worksheets_1.createWorksheetObj.call(spreadsheet.worksheets[0], {
                        minDimensions: [10, 15],
                        worksheetName: worksheetName,
                    });
                }
                else {
                    spreadsheet.creationThroughJss = false;
                }
                const newWorksheet = spreadsheet.worksheets[spreadsheet.worksheets.length - 1];
                newWorksheet.element = newTabContent;
                worksheets_1.buildWorksheet.call(newWorksheet).then(function () {
                    toolbar_1.updateToolbar.call(spreadsheet, newWorksheet);
                    dispatch_1.default.call(newWorksheet, "oncreateworksheet", newWorksheet, options, spreadsheet.worksheets.length - 1);
                });
            },
            onchange: function (element, instance, tabIndex) {
                if (spreadsheet.worksheets.length != 0 &&
                    spreadsheet.worksheets[tabIndex]) {
                    toolbar_1.updateToolbar.call(spreadsheet, spreadsheet.worksheets[tabIndex]);
                }
            },
        };
        if (options.tabs == true) {
            tabsOptions.allowCreate = true;
        }
        else {
            tabsOptions.hideHeaders = true;
        }
        tabsOptions.data = [];
        let sheetNumber = 1;
        for (let i = 0; i < o.length; i++) {
            if (!o[i].worksheetName) {
                o[i].worksheetName = "Sheet" + sheetNumber++;
            }
            tabsOptions.data.push({
                title: o[i].worksheetName || "Sheet" + sheetNumber++,
                content: "",
            });
        }
        el.classList.add("jss_spreadsheet");
        el.tabIndex = 0;
        const tabs = jsuites_1.default.tabs(el, tabsOptions);
        const spreadsheetStyles = (_a = options.style) !== null && _a !== void 0 ? _a : {};
        delete options.style;
        for (let i = 0; i < o.length; i++) {
            if (o[i].style && typeof o[i].style === "object" && !Array.isArray(o[i].style)) {
                const styleObj = o[i].style;
                Object.entries(styleObj).forEach(function ([cellName, value]) {
                    if (typeof value === "number" && spreadsheetStyles[value]) {
                        styleObj[cellName] = spreadsheetStyles[value];
                    }
                });
            }
            spreadsheet.worksheets.push({
                parent: spreadsheet,
                element: tabs.content.children[i],
                options: o[i],
                filters: [],
                formula: {},
                history: [],
                selection: [],
                historyIndex: -1,
            });
            worksheets_1.buildWorksheet.call(spreadsheet.worksheets[i]);
        }
    }
    else {
        throw new Error("JSS: worksheets are not defined");
    }
};
factory.spreadsheet = async function (el, options, worksheets) {
    if (el.tagName == "TABLE") {
        if (!options) {
            options = {};
        }
        if (!options.worksheets) {
            options.worksheets = [];
        }
        const tableOptions = (0, helpers_1.createFromTable)(el, options.worksheets[0]);
        options.worksheets[0] = tableOptions;
        const div = document.createElement("div");
        if (el.parentNode) {
            el.parentNode.insertBefore(div, el);
            el.remove();
            el = div;
        }
    }
    let spreadsheet = {
        worksheets: worksheets,
        config: options,
        element: el,
        el,
        options: options,
        headers: [],
        rows: [],
        cols: [],
        tbody: document.createElement("tbody"),
        table: document.createElement("table"),
        parent: {},
        records: [],
    };
    // Contextmenu container
    spreadsheet.contextMenu = document.createElement("div");
    spreadsheet.contextMenu.className = "jss_contextmenu";
    spreadsheet.getWorksheetActive = internal_1.getWorksheetActive.bind(spreadsheet);
    spreadsheet.fullscreen = internal_1.fullscreen.bind(spreadsheet);
    spreadsheet.showToolbar = toolbar_1.showToolbar.bind(spreadsheet);
    spreadsheet.hideToolbar = toolbar_1.hideToolbar.bind(spreadsheet);
    spreadsheet.getConfig = config_1.getSpreadsheetConfig.bind(spreadsheet);
    spreadsheet.setConfig = config_1.setConfig.bind(spreadsheet);
    spreadsheet.setPlugins = function (newPlugins) {
        if (!spreadsheet.plugins) {
            spreadsheet.plugins = {};
        }
        if (typeof newPlugins == "object" && newPlugins) {
            Object.entries(newPlugins).forEach(function ([pluginName, plugin]) {
                spreadsheet.plugins[pluginName] = plugin.call(spreadsheet, libraryBase_1.default.jspreadsheet, {}, spreadsheet.config);
            });
        }
    };
    spreadsheet.setPlugins(options.plugins);
    // Create as worksheets
    createWorksheets.call(spreadsheet, spreadsheet, options, el);
    spreadsheet.element.appendChild(spreadsheet.contextMenu);
    // Create element
    jsuites_1.default.contextmenu(spreadsheet.contextMenu, {
        onclick: function () {
            spreadsheet.contextMenu.contextmenu.close(false);
        },
    });
    // Fullscreen
    if (spreadsheet.config.fullscreen == true) {
        spreadsheet.element.classList.add("fullscreen");
    }
    toolbar_1.showToolbar.call(spreadsheet.worksheets[0] || spreadsheet);
    // Build handlers
    if (options.root && options.root instanceof HTMLElement) {
        (0, events_1.setEvents)(options.root);
    }
    else {
        (0, events_1.setEvents)(document.body);
    }
    el.spreadsheet = spreadsheet;
    return spreadsheet;
};
factory.worksheet = function (spreadsheet, options, position) {
    // Worksheet object
    let w = {
        // Parent of a worksheet is always the spreadsheet
        parent: spreadsheet,
        // Options for this worksheet
        options: {},
        headers: [],
        rows: [],
        cols: [],
        element: document.createElement("div"),
        config: spreadsheet.config,
        worksheets: [],
        tbody: document.createElement("tbody"),
        table: document.createElement("table"),
        records: [],
    };
    // Create the worksheets object
    if (typeof position === "undefined") {
        spreadsheet.worksheets.push(w);
    }
    else {
        spreadsheet.worksheets.splice(position, 0, w);
    }
    // Keep configuration used
    Object.assign(w.options, options);
    return w;
};
exports.default = factory;
