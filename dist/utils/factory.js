var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import jSuites from 'jsuites';
import libraryBase from './libraryBase.js';
import { setEvents } from './events.js';
import { fullscreen, getWorksheetActive } from './internal.js';
import { hideToolbar, showToolbar, updateToolbar } from './toolbar.js';
import { buildWorksheet, createWorksheetObj, getNextDefaultWorksheetName } from './worksheets.js';
import dispatch from './dispatch.js';
import { createFromTable } from './helpers.js';
import { getSpreadsheetConfig, setConfig } from './config.js';
var factory = function () { };
var createWorksheets = function (spreadsheet, options, el) {
    return __awaiter(this, void 0, void 0, function () {
        var o, tabsOptions, sheetNumber, i, tabs, spreadsheetStyles_1, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    o = options.worksheets;
                    if (!o) return [3 /*break*/, 5];
                    tabsOptions = {
                        animation: true,
                        onbeforecreate: function (element, title) {
                            if (title) {
                                return title;
                            }
                            else {
                                return getNextDefaultWorksheetName(spreadsheet);
                            }
                        },
                        oncreate: function (element, newTabContent) {
                            if (!spreadsheet.creationThroughJss) {
                                var worksheetName = element.tabs.headers.children[element.tabs.headers.children.length - 2].innerHTML;
                                createWorksheetObj.call(spreadsheet.worksheets[0], {
                                    minDimensions: [10, 15],
                                    worksheetName: worksheetName,
                                });
                            }
                            else {
                                spreadsheet.creationThroughJss = false;
                            }
                            var newWorksheet = spreadsheet.worksheets[spreadsheet.worksheets.length - 1];
                            newWorksheet.element = newTabContent;
                            buildWorksheet.call(newWorksheet)
                                .then(function () {
                                updateToolbar(newWorksheet);
                                dispatch.call(newWorksheet, 'oncreateworksheet', newWorksheet, options, spreadsheet.worksheets.length - 1);
                            });
                        },
                        onchange: function (element, instance, tabIndex) {
                            if (spreadsheet.worksheets.length != 0 && spreadsheet.worksheets[tabIndex]) {
                                updateToolbar(spreadsheet.worksheets[tabIndex]);
                            }
                        }
                    };
                    if (options.tabs == true) {
                        tabsOptions.allowCreate = true;
                    }
                    else {
                        tabsOptions.hideHeaders = true;
                    }
                    tabsOptions.data = [];
                    sheetNumber = 1;
                    for (i = 0; i < o.length; i++) {
                        if (!o[i].worksheetName) {
                            o[i].worksheetName = 'Sheet' + sheetNumber++;
                        }
                        tabsOptions.data.push({
                            title: o[i].worksheetName,
                            content: ''
                        });
                    }
                    el.classList.add('jss_spreadsheet');
                    el.tabIndex = 0;
                    tabs = jSuites.tabs(el, tabsOptions);
                    spreadsheetStyles_1 = options.style;
                    delete options.style;
                    _loop_1 = function (i) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (o[i].style) {
                                        Object.entries(o[i].style).forEach(function (_a) {
                                            var cellName = _a[0], value = _a[1];
                                            if (typeof value === 'number') {
                                                o[i].style[cellName] = spreadsheetStyles_1[value];
                                            }
                                        });
                                    }
                                    spreadsheet.worksheets.push({
                                        parent: spreadsheet,
                                        element: tabs.content.children[i],
                                        options: o[i],
                                        filters: [],
                                        formula: [],
                                        history: [],
                                        selection: [],
                                        historyIndex: -1,
                                    });
                                    return [4 /*yield*/, buildWorksheet.call(spreadsheet.worksheets[i])];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < o.length)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 6];
                case 5: throw new Error('JSS: worksheets are not defined');
                case 6: return [2 /*return*/];
            }
        });
    });
};
factory.spreadsheet = function (el, options, worksheets) {
    return __awaiter(this, void 0, void 0, function () {
        var tableOptions, div, spreadsheet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (el.tagName == 'TABLE') {
                        if (!options) {
                            options = {};
                        }
                        if (!options.worksheets) {
                            options.worksheets = [];
                        }
                        tableOptions = createFromTable(el, options.worksheets[0]);
                        options.worksheets[0] = tableOptions;
                        div = document.createElement('div');
                        el.parentNode.insertBefore(div, el);
                        el.remove();
                        el = div;
                    }
                    spreadsheet = {
                        worksheets: worksheets,
                        config: options,
                        element: el,
                        el: el,
                    };
                    // Contextmenu container
                    spreadsheet.contextMenu = document.createElement('div');
                    spreadsheet.contextMenu.className = 'jss_contextmenu';
                    spreadsheet.getWorksheetActive = getWorksheetActive.bind(spreadsheet);
                    spreadsheet.fullscreen = fullscreen.bind(spreadsheet);
                    spreadsheet.showToolbar = showToolbar.bind(spreadsheet);
                    spreadsheet.hideToolbar = hideToolbar.bind(spreadsheet);
                    spreadsheet.getConfig = getSpreadsheetConfig.bind(spreadsheet);
                    spreadsheet.setConfig = setConfig.bind(spreadsheet);
                    spreadsheet.setPlugins = function (newPlugins) {
                        if (!spreadsheet.plugins) {
                            spreadsheet.plugins = {};
                        }
                        if (typeof newPlugins == 'object') {
                            Object.entries(newPlugins).forEach(function (_a) {
                                var pluginName = _a[0], plugin = _a[1];
                                spreadsheet.plugins[pluginName] = plugin.call(libraryBase.jspreadsheet, spreadsheet, {}, spreadsheet.config);
                            });
                        }
                    };
                    spreadsheet.setPlugins(options.plugins);
                    // Create as worksheets
                    return [4 /*yield*/, createWorksheets(spreadsheet, options, el)];
                case 1:
                    // Create as worksheets
                    _a.sent();
                    spreadsheet.element.appendChild(spreadsheet.contextMenu);
                    // Create element
                    jSuites.contextmenu(spreadsheet.contextMenu, {
                        onclick: function () {
                            spreadsheet.contextMenu.contextmenu.close(false);
                        }
                    });
                    // Fullscreen
                    if (spreadsheet.config.fullscreen == true) {
                        spreadsheet.element.classList.add('fullscreen');
                    }
                    showToolbar.call(spreadsheet);
                    // Build handlers
                    if (options.root) {
                        setEvents(options.root);
                    }
                    else {
                        setEvents(document);
                    }
                    el.spreadsheet = spreadsheet;
                    return [2 /*return*/, spreadsheet];
            }
        });
    });
};
factory.worksheet = function (spreadsheet, options, position) {
    // Worksheet object
    var w = {
        // Parent of a worksheet is always the spreadsheet
        parent: spreadsheet,
        // Options for this worksheet
        options: {},
    };
    // Create the worksheets object
    if (typeof (position) === 'undefined') {
        spreadsheet.worksheets.push(w);
    }
    else {
        spreadsheet.worksheets.splice(position, 0, w);
    }
    // Keep configuration used
    Object.assign(w.options, options);
    return w;
};
export default factory;
//# sourceMappingURL=factory.js.map