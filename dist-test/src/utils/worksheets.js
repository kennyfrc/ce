"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorksheet = exports.openWorksheet = exports.createWorksheet = exports.createWorksheetObj = exports.buildWorksheet = exports.getNextDefaultWorksheetName = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const libraryBase_1 = __importDefault(require("./libraryBase"));
const helpers_1 = require("./helpers");
const columns_1 = require("./columns");
const data_1 = require("./data");
const events_1 = require("./events");
const selection_1 = require("./selection");
const rows_1 = require("./rows");
const merges_1 = require("./merges");
const search_1 = require("./search");
const headers_1 = require("./headers");
const style_1 = require("./style");
const pagination_1 = require("./pagination");
const download_1 = require("./download");
const keys_1 = require("./keys");
const internal_1 = require("./internal");
const comments_1 = require("./comments");
const orderBy_1 = require("./orderBy");
const config_1 = require("./config");
const meta_1 = require("./meta");
const editor_1 = require("./editor");
const dispatch_1 = __importDefault(require("./dispatch"));
const internalHelpers_1 = require("./internalHelpers");
const copyPaste_1 = require("./copyPaste");
const cells_1 = require("./cells");
const filter_1 = require("./filter");
const history_1 = require("./history");
const setWorksheetFunctions = function (worksheet) {
    for (let i = 0; i < worksheetPublicMethodsLength; i++) {
        const [methodName, method] = worksheetPublicMethods[i];
        worksheet[methodName] = method.bind(worksheet);
    }
};
const createTable = function () {
    var _a, _b, _c, _d;
    let obj = this;
    setWorksheetFunctions(obj);
    // Elements
    obj.table = document.createElement("table");
    obj.thead = document.createElement("thead");
    obj.tbody = document.createElement("tbody");
    // Create headers controllers
    obj.headers = [];
    obj.cols = [];
    // Create table container
    obj.content = document.createElement("div");
    obj.content.classList.add("jss_content");
    obj.content.onscroll = function (e) {
        events_1.scrollControls.call(obj, e);
    };
    obj.content.onwheel = function (e) {
        events_1.wheelControls.call(obj, e);
    };
    // Search
    const searchContainer = document.createElement("div");
    const searchLabel = document.createElement("label");
    searchLabel.innerHTML = jsuites_1.default.translate("Search") + ": ";
    searchContainer.appendChild(searchLabel);
    obj.searchInput = document.createElement("input");
    obj.searchInput.classList.add("jss_search");
    searchLabel.appendChild(obj.searchInput);
    obj.searchInput.onfocus = function () {
        if (typeof obj.resetSelection === "function") {
            obj.resetSelection();
        }
    };
    // Pagination select option
    const paginationUpdateContainer = document.createElement("div");
    if (obj.options.pagination &&
        typeof obj.options.pagination === "number" &&
        obj.options.pagination > 0 &&
        obj.options.paginationOptions &&
        Array.isArray(obj.options.paginationOptions) &&
        obj.options.paginationOptions.length > 0) {
        obj.paginationDropdown = document.createElement("select");
        obj.paginationDropdown.classList.add("jss_pagination_dropdown");
        obj.paginationDropdown.onchange = function () {
            const selectElement = this;
            obj.options.pagination = parseInt(selectElement.value || "0");
            if (typeof obj.page === "function") {
                obj.page(0);
            }
        };
        for (let i = 0; i < obj.options.paginationOptions.length; i++) {
            const temp = document.createElement("option");
            temp.value = String(obj.options.paginationOptions[i]);
            temp.innerHTML = String(obj.options.paginationOptions[i]);
            obj.paginationDropdown.appendChild(temp);
        }
        // Set initial pagination value
        obj.paginationDropdown.value = String(obj.options.pagination);
        paginationUpdateContainer.appendChild(document.createTextNode(jsuites_1.default.translate("Show ")));
        paginationUpdateContainer.appendChild(obj.paginationDropdown);
        paginationUpdateContainer.appendChild(document.createTextNode(jsuites_1.default.translate("entries")));
    }
    // Filter and pagination container
    const filter = document.createElement("div");
    filter.classList.add("jss_filter");
    filter.appendChild(paginationUpdateContainer);
    filter.appendChild(searchContainer);
    // Colsgroup
    obj.colgroupContainer = document.createElement("colgroup");
    let tempColElement = document.createElement("col");
    tempColElement.setAttribute("width", "50");
    obj.colgroupContainer.appendChild(tempColElement);
    // Nested
    if (obj.options.nestedHeaders &&
        obj.options.nestedHeaders.length > 0 &&
        obj.options.nestedHeaders[0] &&
        obj.options.nestedHeaders[0][0]) {
        for (let j = 0; j < obj.options.nestedHeaders.length; j++) {
            obj.thead.appendChild(internal_1.createNestedHeader.call(obj, obj.options.nestedHeaders[j]));
        }
    }
    // Row
    obj.headerContainer = document.createElement("tr");
    let tempTdElement = document.createElement("td");
    tempTdElement.classList.add("jss_selectall");
    obj.headerContainer.appendChild(tempTdElement);
    const numberOfColumns = columns_1.getNumberOfColumns.call(obj);
    for (let i = 0; i < numberOfColumns; i++) {
        // Create header
        columns_1.createCellHeader.call(obj, i);
        // Append cell to the container
        obj.headerContainer.appendChild(obj.headers[i]);
        obj.colgroupContainer.appendChild(obj.cols[i].colElement);
    }
    obj.thead.appendChild(obj.headerContainer);
    // Filters
    if (obj.options.filters == true) {
        obj.filter = document.createElement("tr");
        const td = document.createElement("td");
        obj.filter.appendChild(td);
        if (obj.options.columns) {
            for (let i = 0; i < obj.options.columns.length; i++) {
                const td = document.createElement("td");
                td.innerHTML = "&nbsp;";
                td.setAttribute("data-x", i.toString());
                td.className = "jss_column_filter";
                if (obj.options.columns[i] && obj.options.columns[i].type == "hidden") {
                    td.style.display = "none";
                }
                obj.filter.appendChild(td);
            }
        }
        obj.thead.appendChild(obj.filter);
    }
    // Content table
    obj.table = document.createElement("table");
    obj.table.classList.add("jss_worksheet");
    obj.table.setAttribute("cellpadding", "0");
    obj.table.setAttribute("cellspacing", "0");
    obj.table.setAttribute("unselectable", "yes");
    //obj.table.setAttribute('onselectstart', 'return false');
    obj.table.appendChild(obj.colgroupContainer);
    obj.table.appendChild(obj.thead);
    obj.table.appendChild(obj.tbody);
    if (!obj.options.textOverflow) {
        obj.table.classList.add("jss_overflow");
    }
    // Spreadsheet corner
    obj.corner = document.createElement("div");
    obj.corner.className = "jss_corner";
    obj.corner.setAttribute("unselectable", "on");
    obj.corner.setAttribute("onselectstart", "return false");
    if (obj.options.selectionCopy == false) {
        obj.corner.style.display = "none";
    }
    // Textarea helper
    obj.textarea = document.createElement("textarea");
    obj.textarea.className = "jss_textarea";
    obj.textarea.id = "jss_textarea";
    obj.textarea.tabIndex = -1;
    obj.textarea.ariaHidden = "true";
    // Powered by Jspreadsheet
    const ads = document.createElement("a");
    ads.setAttribute("href", "https://bossanova.uk/jspreadsheet/");
    obj.ads = document.createElement("div");
    obj.ads.className = "jss_about";
    const span = document.createElement("span");
    span.innerHTML = "Jspreadsheet CE";
    ads.appendChild(span);
    obj.ads.appendChild(ads);
    // Create table container TODO: frozen columns
    const container = document.createElement("div");
    container.classList.add("jss_table");
    // Pagination
    obj.pagination = document.createElement("div");
    obj.pagination.classList.add("jss_pagination");
    const paginationInfo = document.createElement("div");
    const paginationPages = document.createElement("div");
    obj.pagination.appendChild(paginationInfo);
    obj.pagination.appendChild(paginationPages);
    // Hide pagination if not in use
    if (!obj.options.pagination) {
        obj.pagination.style.display = "none";
    }
    // Append containers to the table
    if (obj.options.search == true) {
        obj.element.appendChild(filter);
    }
    // Elements
    obj.content.appendChild(obj.table);
    obj.content.appendChild(obj.corner);
    obj.content.appendChild(obj.textarea);
    obj.element.appendChild(obj.content);
    obj.element.appendChild(obj.pagination);
    obj.element.appendChild(obj.ads);
    obj.element.classList.add("jss_container");
    obj.element.jssWorksheet = obj;
    obj.element.jspreadsheet = obj;
    // Overflow
    if (obj.options.tableOverflow == true) {
        if (obj.options.tableHeight) {
            obj.content.style["overflow-y"] = "auto";
            obj.content.style["box-shadow"] = "rgb(221 221 221) 2px 2px 5px 0.1px";
            obj.content.style.maxHeight =
                typeof obj.options.tableHeight === "string"
                    ? obj.options.tableHeight
                    : obj.options.tableHeight + "px";
        }
        if (obj.options.tableWidth) {
            obj.content.style["overflow-x"] = "auto";
            obj.content.style.width =
                typeof obj.options.tableWidth === "string"
                    ? obj.options.tableWidth
                    : obj.options.tableWidth + "px";
        }
    }
    // With toolbars
    if (obj.options.tableOverflow != true && obj.parent.config.toolbar) {
        obj.element.classList.add("with-toolbar");
    }
    // Actions
    if (obj.options.columnDrag != false) {
        obj.thead.classList.add("draggable");
    }
    if (obj.options.columnResize != false) {
        obj.thead.classList.add("resizable");
    }
    if (obj.options.rowDrag != false) {
        obj.tbody.classList.add("draggable");
    }
    if (obj.options.rowResize != false) {
        obj.tbody.classList.add("resizable");
    }
    // Load data
    (_a = obj.setData) === null || _a === void 0 ? void 0 : _a.call(obj, undefined);
    // Style
    if (obj.options.style) {
        // Convert CSSStyleDeclaration to string format for setStyle
        const styleObj = {};
        if (Array.isArray(obj.options.style)) {
            // Handle array format - not sure how to convert this, skip for now
        }
        else if (typeof obj.options.style === 'object') {
            for (const [key, value] of Object.entries(obj.options.style)) {
                if (typeof value === 'string') {
                    styleObj[key] = value;
                }
                else if (typeof value === 'number') {
                    styleObj[key] = value.toString();
                }
                // Skip CSSStyleDeclaration for now as conversion is complex
            }
        }
        if (Object.keys(styleObj).length > 0) {
            (_b = obj.setStyle) === null || _b === void 0 ? void 0 : _b.call(obj, styleObj, null, null, true, true);
        }
        delete obj.options.style;
    }
    Object.defineProperty(obj.options, "style", {
        enumerable: true,
        configurable: true,
        get() {
            var _a;
            return (_a = obj.getStyle) === null || _a === void 0 ? void 0 : _a.call(obj);
        },
    });
    if (obj.options.comments) {
        (_c = obj.setComments) === null || _c === void 0 ? void 0 : _c.call(obj, obj.options.comments);
    }
    // Classes
    if (obj.options.classes) {
        for (const [key, className] of Object.entries(obj.options.classes)) {
            const cell = (0, internalHelpers_1.getIdFromColumnName)(key, true);
            const record = (_d = obj.records[cell[1]]) === null || _d === void 0 ? void 0 : _d[cell[0]];
            if (record && className) {
                record.element.classList.add(className);
            }
        }
    }
};
/**
 * Prepare the jspreadsheet table
 *
 * @Param config
 */
const prepareTable = function () {
    const obj = this;
    // Lazy loading
    if (obj.options.lazyLoading == true &&
        obj.options.tableOverflow != true &&
        obj.parent.config.fullscreen != true) {
        console.error("Jspreadsheet: The lazyloading only works when tableOverflow = yes or fullscreen = yes");
        obj.options.lazyLoading = false;
    }
    if (!obj.options.columns) {
        obj.options.columns = [];
    }
    // Number of columns
    let size = obj.options.columns.length;
    let keys;
    if (obj.options.data && typeof obj.options.data[0] !== "undefined") {
        if (!Array.isArray(obj.options.data[0])) {
            // Data keys
            keys = Object.keys(obj.options.data[0]);
            if (keys.length > size) {
                size = keys.length;
            }
        }
        else {
            const numOfColumns = obj.options.data[0].length;
            if (numOfColumns > size) {
                size = numOfColumns;
            }
        }
    }
    // Minimal dimensions
    if (!obj.options.minDimensions) {
        obj.options.minDimensions = [0, 0];
    }
    if (obj.options.minDimensions[0] > size) {
        size = obj.options.minDimensions[0];
    }
    // Requests
    const multiple = [];
    // Preparations
    for (let i = 0; i < size; i++) {
        // Default column description
        if (!obj.options.columns[i]) {
            obj.options.columns[i] = {};
        }
        if (!obj.options.columns[i].name && keys && keys[i]) {
            obj.options.columns[i].name = keys[i];
        }
        // Pre-load initial source for json dropdown
        if (obj.options.columns[i].type == "dropdown") {
            // if remote content
            if (obj.options.columns[i].url) {
                multiple.push({
                    url: obj.options.columns[i].url,
                    index: i,
                    method: "GET",
                    dataType: "json",
                    success: function (data) {
                        if (!obj.options.columns || !obj.options.columns[i]) {
                            return;
                        }
                        if (!obj.options.columns[i].source) {
                            obj.options.columns[i].source = [];
                        }
                        const source = obj.options.columns[i].source;
                        if (Array.isArray(source) && Array.isArray(data)) {
                            for (let j = 0; j < data.length; j++) {
                                source.push(data[j]);
                            }
                        }
                    },
                });
            }
        }
    }
    // Create the table when is ready
    if (!multiple.length) {
        createTable.call(obj);
    }
    else {
        // Make ajax calls for each remote source
        let completed = 0;
        const total = multiple.length;
        multiple.forEach((config) => {
            jsuites_1.default.ajax({
                url: config.url,
                method: (config.method || "GET"),
                dataType: (config.dataType || "json"),
                success: function (data) {
                    // Call the original success callback with the data
                    if (config.success) {
                        config.success.call(obj, data);
                    }
                    completed++;
                    if (completed >= total) {
                        createTable.call(obj);
                    }
                },
                error: function () {
                    completed++;
                    if (completed >= total) {
                        createTable.call(obj);
                    }
                }
            });
        });
    }
};
const getNextDefaultWorksheetName = function (spreadsheet) {
    const defaultWorksheetNameRegex = /^Sheet(\d+)$/;
    let largestWorksheetNumber = 0;
    spreadsheet.worksheets.forEach(function (worksheet) {
        const regexResult = defaultWorksheetNameRegex.exec(worksheet.options.worksheetName || "");
        if (regexResult) {
            largestWorksheetNumber = Math.max(largestWorksheetNumber, parseInt(regexResult[1]));
        }
    });
    return "Sheet" + (largestWorksheetNumber + 1);
};
exports.getNextDefaultWorksheetName = getNextDefaultWorksheetName;
const buildWorksheet = async function () {
    const obj = this;
    const el = obj.element;
    const spreadsheet = obj.parent;
    if (typeof spreadsheet.plugins === "object") {
        Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
            const typedPlugin = plugin;
            if (typeof typedPlugin.beforeinit === "function") {
                typedPlugin.beforeinit(obj);
            }
        });
    }
    libraryBase_1.default.jspreadsheet.current = obj;
    const promises = [];
    // Load the table data based on an CSV file
    if (obj.options.csv) {
        const promise = new Promise((resolve) => {
            // Load CSV file
            jsuites_1.default.ajax({
                url: obj.options.csv,
                method: "GET",
                dataType: "text",
                success: function (result) {
                    // Convert data
                    const newData = (0, helpers_1.parseCSV)(result, obj.options.csvDelimiter);
                    // Headers
                    if (obj.options.csvHeaders == true && newData.length > 0) {
                        const headers = newData.shift();
                        if (headers && headers.length > 0) {
                            if (!obj.options.columns) {
                                obj.options.columns = [];
                            }
                            for (let i = 0; i < headers.length; i++) {
                                if (!obj.options.columns[i]) {
                                    obj.options.columns[i] = {};
                                }
                                // Precedence over pre-configurated titles
                                if (typeof obj.options.columns[i].title === "undefined") {
                                    obj.options.columns[i].title = headers[i];
                                }
                            }
                        }
                    }
                    // Data
                    obj.options.data = newData;
                    // Prepare table
                    prepareTable.call(obj);
                    resolve();
                },
            });
        });
        promises.push(promise);
    }
    else if (obj.options.url) {
        const promise = new Promise((resolve) => {
            jsuites_1.default.ajax({
                url: obj.options.url,
                method: "GET",
                dataType: "json",
                success: function (result) {
                    // Data
                    const data = result;
                    obj.options.data = (data && typeof data === 'object' && 'data' in data && data.data) ? data.data : data;
                    // Prepare table
                    prepareTable.call(obj);
                    resolve();
                },
            });
        });
        promises.push(promise);
    }
    else {
        // Prepare table
        prepareTable.call(obj);
    }
    await Promise.all(promises);
    if (typeof spreadsheet.plugins === "object") {
        Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
            const typedPlugin = plugin;
            if (typeof typedPlugin.init === "function") {
                typedPlugin.init(obj);
            }
        });
    }
};
exports.buildWorksheet = buildWorksheet;
const createWorksheetObj = function (options) {
    const obj = this;
    const spreadsheet = obj.parent;
    if (!options.worksheetName) {
        options.worksheetName = (0, exports.getNextDefaultWorksheetName)(obj.parent);
    }
    const newWorksheet = {
        parent: spreadsheet,
        options: options,
        filters: [],
        formula: [],
        history: [],
        selection: [],
        historyIndex: -1,
    };
    if (!spreadsheet.config.worksheets) {
        spreadsheet.config.worksheets = [];
    }
    spreadsheet.config.worksheets.push(newWorksheet.options);
    spreadsheet.worksheets.push(newWorksheet);
    return newWorksheet;
};
exports.createWorksheetObj = createWorksheetObj;
const createWorksheet = function (options) {
    const obj = this;
    const spreadsheet = obj.parent;
    spreadsheet.creationThroughJss = true;
    exports.createWorksheetObj.call(obj, options);
    spreadsheet.element.tabs.create(options.worksheetName);
};
exports.createWorksheet = createWorksheet;
const openWorksheet = function (position) {
    const obj = this;
    const spreadsheet = obj.parent;
    spreadsheet.element.tabs.open(position);
};
exports.openWorksheet = openWorksheet;
const deleteWorksheet = function (position) {
    const obj = this;
    obj.parent.element.tabs.remove(position);
    const removedWorksheet = obj.parent.worksheets.splice(position, 1)[0];
    dispatch_1.default.call(obj.parent, "ondeleteworksheet", removedWorksheet, position);
};
exports.deleteWorksheet = deleteWorksheet;
const worksheetPublicMethods = [
    ["selectAll", selection_1.selectAll],
    [
        "updateSelectionFromCoords",
        function (x1, y1, x2, y2) {
            return selection_1.updateSelectionFromCoords.call(this, x1, y1, x2, y2);
        },
    ],
    [
        "resetSelection",
        function () {
            return selection_1.resetSelection.call(this, false);
        },
    ],
    ["getSelection", selection_1.getSelection],
    ["getSelected", selection_1.getSelected],
    ["getSelectedColumns", selection_1.getSelectedColumns],
    ["getSelectedRows", selection_1.getSelectedRows],
    ["getData", data_1.getData],
    ["setData", data_1.setData],
    ["getValue", data_1.getValue],
    ["getValueFromCoords", data_1.getValueFromCoords],
    ["setValue", data_1.setValue],
    ["setValueFromCoords", data_1.setValueFromCoords],
    ["getWidth", columns_1.getWidth],
    [
        "setWidth",
        function (column, width) {
            return columns_1.setWidth.call(this, column, width, undefined);
        },
    ],
    ["insertRow", rows_1.insertRow],
    [
        "moveRow",
        function (rowNumber, newPositionNumber) {
            return rows_1.moveRow.call(this, rowNumber, newPositionNumber, false);
        },
    ],
    ["deleteRow", rows_1.deleteRow],
    ["hideRow", rows_1.hideRow],
    ["showRow", rows_1.showRow],
    ["getRowData", rows_1.getRowData],
    ["setRowData", rows_1.setRowData],
    ["getHeight", rows_1.getHeight],
    [
        "setHeight",
        function (row, height) {
            return rows_1.setHeight.call(this, row, height, undefined);
        },
    ],
    ["getMerge", merges_1.getMerge],
    [
        "setMerge",
        function (cellName, colspan, rowspan) {
            return merges_1.setMerge.call(this, cellName, colspan, rowspan, undefined);
        },
    ],
    [
        "destroyMerge",
        function () {
            return merges_1.destroyMerge.call(this, undefined);
        },
    ],
    [
        "removeMerge",
        function (cellName, data) {
            return merges_1.removeMerge.call(this, cellName, data, undefined);
        },
    ],
    ["search", search_1.search],
    ["resetSearch", search_1.resetSearch],
    ["getHeader", headers_1.getHeader],
    ["getHeaders", headers_1.getHeaders],
    ["setHeader", headers_1.setHeader],
    ["getStyle", style_1.getStyle],
    [
        "setStyle",
        function (o, k, v, force, ignoreHistoryAndEvents) {
            return style_1.setStyle.call(this, o, k, v, force, ignoreHistoryAndEvents);
        },
    ],
    ["resetStyle", style_1.resetStyle],
    ["insertColumn", columns_1.insertColumn],
    ["moveColumn", columns_1.moveColumn],
    ["deleteColumn", columns_1.deleteColumn],
    ["getColumnData", columns_1.getColumnData],
    ["setColumnData", columns_1.setColumnData],
    ["whichPage", pagination_1.whichPage],
    ["page", pagination_1.page],
    ["download", download_1.download],
    ["getComments", comments_1.getComments],
    ["setComments", comments_1.setComments],
    ["orderBy", orderBy_1.orderBy],
    ["undo", history_1.undo],
    ["redo", history_1.redo],
    ["getCell", internal_1.getCell],
    ["getCellFromCoords", internal_1.getCellFromCoords],
    ["getLabel", internal_1.getLabel],
    ["getConfig", config_1.getWorksheetConfig],
    ["setConfig", config_1.setConfig],
    [
        "getMeta",
        function (cell) {
            return meta_1.getMeta.call(this, cell, undefined);
        },
    ],
    ["setMeta", meta_1.setMeta],
    ["showColumn", columns_1.showColumn],
    ["hideColumn", columns_1.hideColumn],
    ["showIndex", internal_1.showIndex],
    ["hideIndex", internal_1.hideIndex],
    ["getWorksheetActive", internal_1.getWorksheetActive],
    ["openEditor", editor_1.openEditor],
    ["closeEditor", editor_1.closeEditor],
    ["createWorksheet", exports.createWorksheet],
    ["openWorksheet", exports.openWorksheet],
    ["deleteWorksheet", exports.deleteWorksheet],
    [
        "copy",
        function (cut) {
            if (cut) {
                events_1.cutControls.call(this, undefined);
            }
            else {
                copyPaste_1.copy.call(this, true);
            }
        },
    ],
    ["paste", copyPaste_1.paste],
    ["executeFormula", internal_1.executeFormula],
    ["getDataFromRange", data_1.getDataFromRange],
    ["quantiyOfPages", quantiyOfPages],
    ["getRange", selection_1.getRange],
    ["isSelected", selection_1.isSelected],
    ["setReadOnly", cells_1.setReadOnly],
    ["isReadOnly", cells_1.isReadOnly],
    ["getHighlighted", selection_1.getHighlighted],
    ["dispatch", dispatch_1.default],
    ["down", keys_1.down],
    ["first", keys_1.first],
    ["last", keys_1.last],
    ["left", keys_1.left],
    ["right", keys_1.right],
    ["up", keys_1.up],
    ["openFilter", filter_1.openFilter],
    ["resetFilters", filter_1.resetFilters],
];
const worksheetPublicMethodsLength = worksheetPublicMethods.length;
