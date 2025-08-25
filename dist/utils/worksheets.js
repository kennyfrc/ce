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
import { parseCSV } from './helpers.js';
import { createCellHeader, deleteColumn, getColumnData, getNumberOfColumns, getWidth, hideColumn, insertColumn, moveColumn, setColumnData, setWidth, showColumn } from './columns.js';
import { getData, getDataFromRange, getValue, getValueFromCoords, setData, setValue, setValueFromCoords } from './data.js';
import { cutControls, scrollControls, wheelControls } from './events.js';
import { getHighlighted, getRange, getSelected, getSelectedColumns, getSelectedRows, getSelection, isSelected, resetSelection, selectAll, updateSelectionFromCoords } from './selection.js';
import { deleteRow, getHeight, getRowData, hideRow, insertRow, moveRow, setHeight, setRowData, showRow } from './rows.js';
import { destroyMerge, getMerge, removeMerge, setMerge } from './merges.js';
import { resetSearch, search } from './search.js';
import { getHeader, getHeaders, setHeader } from './headers.js';
import { getStyle, resetStyle, setStyle } from './style.js';
import { page, quantiyOfPages, whichPage } from './pagination.js';
import { download } from './download.js';
import { down, first, last, left, right, up } from './keys.js';
import { createNestedHeader, executeFormula, getCell, getCellFromCoords, getLabel, getWorksheetActive, hideIndex, showIndex } from './internal.js';
import { getComments, setComments } from './comments.js';
import { orderBy } from './orderBy.js';
import { getWorksheetConfig, setConfig } from './config.js';
import { getMeta, setMeta } from './meta.js';
import { closeEditor, openEditor } from './editor.js';
import dispatch from './dispatch.js';
import { getIdFromColumnName } from './internalHelpers.js';
import { copy, paste } from './copyPaste.js';
import { isReadOnly, setReadOnly } from './cells.js';
import { openFilter, resetFilters } from './filter.js';
import { redo, undo } from './history.js';
var setWorksheetFunctions = function (worksheet) {
    for (var i = 0; i < worksheetPublicMethodsLength; i++) {
        var _a = worksheetPublicMethods[i], methodName = _a[0], method = _a[1];
        worksheet[methodName] = method.bind(worksheet);
    }
};
var createTable = function () {
    var obj = this;
    setWorksheetFunctions(obj);
    // Elements
    obj.table = document.createElement('table');
    obj.thead = document.createElement('thead');
    obj.tbody = document.createElement('tbody');
    // Create headers controllers
    obj.headers = [];
    obj.cols = [];
    // Create table container
    obj.content = document.createElement('div');
    obj.content.classList.add('jss_content');
    obj.content.onscroll = function (e) {
        scrollControls.call(obj, e);
    };
    obj.content.onwheel = function (e) {
        wheelControls.call(obj, e);
    };
    // Search
    var searchContainer = document.createElement('div');
    var searchLabel = document.createElement('label');
    searchLabel.innerHTML = jSuites.translate('Search') + ': ';
    searchContainer.appendChild(searchLabel);
    obj.searchInput = document.createElement('input');
    obj.searchInput.classList.add('jss_search');
    searchLabel.appendChild(obj.searchInput);
    obj.searchInput.onfocus = function () {
        obj.resetSelection();
    };
    // Pagination select option
    var paginationUpdateContainer = document.createElement('div');
    if (obj.options.pagination > 0 && obj.options.paginationOptions && obj.options.paginationOptions.length > 0) {
        obj.paginationDropdown = document.createElement('select');
        obj.paginationDropdown.classList.add('jss_pagination_dropdown');
        obj.paginationDropdown.onchange = function () {
            obj.options.pagination = parseInt(this.value);
            obj.page(0);
        };
        for (var i = 0; i < obj.options.paginationOptions.length; i++) {
            var temp = document.createElement('option');
            temp.value = obj.options.paginationOptions[i];
            temp.innerHTML = obj.options.paginationOptions[i];
            obj.paginationDropdown.appendChild(temp);
        }
        // Set initial pagination value
        obj.paginationDropdown.value = obj.options.pagination;
        paginationUpdateContainer.appendChild(document.createTextNode(jSuites.translate('Show ')));
        paginationUpdateContainer.appendChild(obj.paginationDropdown);
        paginationUpdateContainer.appendChild(document.createTextNode(jSuites.translate('entries')));
    }
    // Filter and pagination container
    var filter = document.createElement('div');
    filter.classList.add('jss_filter');
    filter.appendChild(paginationUpdateContainer);
    filter.appendChild(searchContainer);
    // Colsgroup
    obj.colgroupContainer = document.createElement('colgroup');
    var tempCol = document.createElement('col');
    tempCol.setAttribute('width', '50');
    obj.colgroupContainer.appendChild(tempCol);
    // Nested
    if (obj.options.nestedHeaders &&
        obj.options.nestedHeaders.length > 0 &&
        obj.options.nestedHeaders[0] &&
        obj.options.nestedHeaders[0][0]) {
        for (var j = 0; j < obj.options.nestedHeaders.length; j++) {
            obj.thead.appendChild(createNestedHeader.call(obj, obj.options.nestedHeaders[j]));
        }
    }
    // Row
    obj.headerContainer = document.createElement('tr');
    tempCol = document.createElement('td');
    tempCol.classList.add('jss_selectall');
    obj.headerContainer.appendChild(tempCol);
    var numberOfColumns = getNumberOfColumns.call(obj);
    for (var i = 0; i < numberOfColumns; i++) {
        // Create header
        createCellHeader.call(obj, i);
        // Append cell to the container
        obj.headerContainer.appendChild(obj.headers[i]);
        obj.colgroupContainer.appendChild(obj.cols[i].colElement);
    }
    obj.thead.appendChild(obj.headerContainer);
    // Filters
    if (obj.options.filters == true) {
        obj.filter = document.createElement('tr');
        var td = document.createElement('td');
        obj.filter.appendChild(td);
        for (var i = 0; i < obj.options.columns.length; i++) {
            var td_1 = document.createElement('td');
            td_1.innerHTML = '&nbsp;';
            td_1.setAttribute('data-x', i);
            td_1.className = 'jss_column_filter';
            if (obj.options.columns[i].type == 'hidden') {
                td_1.style.display = 'none';
            }
            obj.filter.appendChild(td_1);
        }
        obj.thead.appendChild(obj.filter);
    }
    // Content table
    obj.table = document.createElement('table');
    obj.table.classList.add('jss_worksheet');
    obj.table.setAttribute('cellpadding', '0');
    obj.table.setAttribute('cellspacing', '0');
    obj.table.setAttribute('unselectable', 'yes');
    //obj.table.setAttribute('onselectstart', 'return false');
    obj.table.appendChild(obj.colgroupContainer);
    obj.table.appendChild(obj.thead);
    obj.table.appendChild(obj.tbody);
    if (!obj.options.textOverflow) {
        obj.table.classList.add('jss_overflow');
    }
    // Spreadsheet corner
    obj.corner = document.createElement('div');
    obj.corner.className = 'jss_corner';
    obj.corner.setAttribute('unselectable', 'on');
    obj.corner.setAttribute('onselectstart', 'return false');
    if (obj.options.selectionCopy == false) {
        obj.corner.style.display = 'none';
    }
    // Textarea helper
    obj.textarea = document.createElement('textarea');
    obj.textarea.className = 'jss_textarea';
    obj.textarea.id = 'jss_textarea';
    obj.textarea.tabIndex = '-1';
    obj.textarea.ariaHidden = 'true';
    // Powered by Jspreadsheet
    var ads = document.createElement('a');
    ads.setAttribute('href', 'https://bossanova.uk/jspreadsheet/');
    obj.ads = document.createElement('div');
    obj.ads.className = 'jss_about';
    var span = document.createElement('span');
    span.innerHTML = 'Jspreadsheet CE';
    ads.appendChild(span);
    obj.ads.appendChild(ads);
    // Create table container TODO: frozen columns
    var container = document.createElement('div');
    container.classList.add('jss_table');
    // Pagination
    obj.pagination = document.createElement('div');
    obj.pagination.classList.add('jss_pagination');
    var paginationInfo = document.createElement('div');
    var paginationPages = document.createElement('div');
    obj.pagination.appendChild(paginationInfo);
    obj.pagination.appendChild(paginationPages);
    // Hide pagination if not in use
    if (!obj.options.pagination) {
        obj.pagination.style.display = 'none';
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
    obj.element.classList.add('jss_container');
    obj.element.jssWorksheet = obj;
    obj.element.jspreadsheet = obj;
    // Overflow
    if (obj.options.tableOverflow == true) {
        if (obj.options.tableHeight) {
            obj.content.style['overflow-y'] = 'auto';
            obj.content.style['box-shadow'] = 'rgb(221 221 221) 2px 2px 5px 0.1px';
            obj.content.style.maxHeight = typeof obj.options.tableHeight === 'string' ? obj.options.tableHeight : obj.options.tableHeight + 'px';
        }
        if (obj.options.tableWidth) {
            obj.content.style['overflow-x'] = 'auto';
            obj.content.style.width = typeof obj.options.tableWidth === 'string' ? obj.options.tableWidth : obj.options.tableWidth + 'px';
        }
    }
    // With toolbars
    if (obj.options.tableOverflow != true && obj.parent.config.toolbar) {
        obj.element.classList.add('with-toolbar');
    }
    // Actions
    if (obj.options.columnDrag != false) {
        obj.thead.classList.add('draggable');
    }
    if (obj.options.columnResize != false) {
        obj.thead.classList.add('resizable');
    }
    if (obj.options.rowDrag != false) {
        obj.tbody.classList.add('draggable');
    }
    if (obj.options.rowResize != false) {
        obj.tbody.classList.add('resizable');
    }
    // Load data
    obj.setData.call(obj);
    // Style
    if (obj.options.style) {
        obj.setStyle(obj.options.style, null, null, 1, 1);
        delete obj.options.style;
    }
    Object.defineProperty(obj.options, 'style', {
        enumerable: true,
        configurable: true,
        get: function () {
            return obj.getStyle();
        },
    });
    if (obj.options.comments) {
        obj.setComments(obj.options.comments);
    }
    // Classes
    if (obj.options.classes) {
        var k = Object.keys(obj.options.classes);
        for (var i = 0; i < k.length; i++) {
            var cell = getIdFromColumnName(k[i], true);
            obj.records[cell[1]][cell[0]].element.classList.add(obj.options.classes[k[i]]);
        }
    }
};
/**
 * Prepare the jspreadsheet table
 *
 * @Param config
 */
var prepareTable = function () {
    var obj = this;
    // Lazy loading
    if (obj.options.lazyLoading == true && (obj.options.tableOverflow != true && obj.parent.config.fullscreen != true)) {
        console.error('Jspreadsheet: The lazyloading only works when tableOverflow = yes or fullscreen = yes');
        obj.options.lazyLoading = false;
    }
    if (!obj.options.columns) {
        obj.options.columns = [];
    }
    // Number of columns
    var size = obj.options.columns.length;
    var keys;
    if (obj.options.data && typeof (obj.options.data[0]) !== 'undefined') {
        if (!Array.isArray(obj.options.data[0])) {
            // Data keys
            keys = Object.keys(obj.options.data[0]);
            if (keys.length > size) {
                size = keys.length;
            }
        }
        else {
            var numOfColumns = obj.options.data[0].length;
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
    var multiple = [];
    // Preparations
    for (var i = 0; i < size; i++) {
        // Default column description
        if (!obj.options.columns[i]) {
            obj.options.columns[i] = {};
        }
        if (!obj.options.columns[i].name && keys && keys[i]) {
            obj.options.columns[i].name = keys[i];
        }
        // Pre-load initial source for json dropdown
        if (obj.options.columns[i].type == 'dropdown') {
            // if remote content
            if (obj.options.columns[i].url) {
                multiple.push({
                    url: obj.options.columns[i].url,
                    index: i,
                    method: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if (!obj.options.columns[this.index].source) {
                            obj.options.columns[this.index].source = [];
                        }
                        for (var i_1 = 0; i_1 < data.length; i_1++) {
                            obj.options.columns[this.index].source.push(data[i_1]);
                        }
                    }
                });
            }
        }
    }
    // Create the table when is ready
    if (!multiple.length) {
        createTable.call(obj);
    }
    else {
        jSuites.ajax(multiple, function () {
            createTable.call(obj);
        });
    }
};
export var getNextDefaultWorksheetName = function (spreadsheet) {
    var defaultWorksheetNameRegex = /^Sheet(\d+)$/;
    var largestWorksheetNumber = 0;
    spreadsheet.worksheets.forEach(function (worksheet) {
        var regexResult = defaultWorksheetNameRegex.exec(worksheet.options.worksheetName);
        if (regexResult) {
            largestWorksheetNumber = Math.max(largestWorksheetNumber, parseInt(regexResult[1]));
        }
    });
    return 'Sheet' + (largestWorksheetNumber + 1);
};
export var buildWorksheet = function () {
    return __awaiter(this, void 0, void 0, function () {
        var obj, el, spreadsheet, promises, promise, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    obj = this;
                    el = obj.element;
                    spreadsheet = obj.parent;
                    if (typeof spreadsheet.plugins === 'object') {
                        Object.entries(spreadsheet.plugins).forEach(function (_a) {
                            var plugin = _a[1];
                            if (typeof plugin.beforeinit === 'function') {
                                plugin.beforeinit(obj);
                            }
                        });
                    }
                    libraryBase.jspreadsheet.current = obj;
                    promises = [];
                    // Load the table data based on an CSV file
                    if (obj.options.csv) {
                        promise = new Promise(function (resolve) {
                            // Load CSV file
                            jSuites.ajax({
                                url: obj.options.csv,
                                method: 'GET',
                                dataType: 'text',
                                success: function (result) {
                                    // Convert data
                                    var newData = parseCSV(result, obj.options.csvDelimiter);
                                    // Headers
                                    if (obj.options.csvHeaders == true && newData.length > 0) {
                                        var headers = newData.shift();
                                        if (headers.length > 0) {
                                            if (!obj.options.columns) {
                                                obj.options.columns = [];
                                            }
                                            for (var i = 0; i < headers.length; i++) {
                                                if (!obj.options.columns[i]) {
                                                    obj.options.columns[i] = {};
                                                }
                                                // Precedence over pre-configurated titles
                                                if (typeof obj.options.columns[i].title === 'undefined') {
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
                                }
                            });
                        });
                        promises.push(promise);
                    }
                    else if (obj.options.url) {
                        promise = new Promise(function (resolve) {
                            jSuites.ajax({
                                url: obj.options.url,
                                method: 'GET',
                                dataType: 'json',
                                success: function (result) {
                                    // Data
                                    obj.options.data = (result.data) ? result.data : result;
                                    // Prepare table
                                    prepareTable.call(obj);
                                    resolve();
                                }
                            });
                        });
                        promises.push(promise);
                    }
                    else {
                        // Prepare table
                        prepareTable.call(obj);
                    }
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    if (typeof spreadsheet.plugins === 'object') {
                        Object.entries(spreadsheet.plugins).forEach(function (_a) {
                            var plugin = _a[1];
                            if (typeof plugin.init === 'function') {
                                plugin.init(obj);
                            }
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
};
export var createWorksheetObj = function (options) {
    var obj = this;
    var spreadsheet = obj.parent;
    if (!options.worksheetName) {
        options.worksheetName = getNextDefaultWorksheetName(obj.parent);
    }
    var newWorksheet = {
        parent: spreadsheet,
        options: options,
        filters: [],
        formula: [],
        history: [],
        selection: [],
        historyIndex: -1,
    };
    spreadsheet.config.worksheets.push(newWorksheet.options);
    spreadsheet.worksheets.push(newWorksheet);
    return newWorksheet;
};
export var createWorksheet = function (options) {
    var obj = this;
    var spreadsheet = obj.parent;
    spreadsheet.creationThroughJss = true;
    createWorksheetObj.call(obj, options);
    spreadsheet.element.tabs.create(options.worksheetName);
};
export var openWorksheet = function (position) {
    var obj = this;
    var spreadsheet = obj.parent;
    spreadsheet.element.tabs.open(position);
};
export var deleteWorksheet = function (position) {
    var obj = this;
    obj.parent.element.tabs.remove(position);
    var removedWorksheet = obj.parent.worksheets.splice(position, 1)[0];
    dispatch.call(obj.parent, 'ondeleteworksheet', removedWorksheet, position);
};
var worksheetPublicMethods = [
    ['selectAll', selectAll],
    ['updateSelectionFromCoords', function (x1, y1, x2, y2) {
            return updateSelectionFromCoords.call(this, x1, y1, x2, y2);
        }],
    ['resetSelection', function () {
            return resetSelection.call(this);
        }],
    ['getSelection', getSelection],
    ['getSelected', getSelected],
    ['getSelectedColumns', getSelectedColumns],
    ['getSelectedRows', getSelectedRows],
    ['getData', getData],
    ['setData', setData],
    ['getValue', getValue],
    ['getValueFromCoords', getValueFromCoords],
    ['setValue', setValue],
    ['setValueFromCoords', setValueFromCoords],
    ['getWidth', getWidth],
    ['setWidth', function (column, width) {
            return setWidth.call(this, column, width);
        }],
    ['insertRow', insertRow],
    ['moveRow', function (rowNumber, newPositionNumber) {
            return moveRow.call(this, rowNumber, newPositionNumber);
        }],
    ['deleteRow', deleteRow],
    ['hideRow', hideRow],
    ['showRow', showRow],
    ['getRowData', getRowData],
    ['setRowData', setRowData],
    ['getHeight', getHeight],
    ['setHeight', function (row, height) {
            return setHeight.call(this, row, height);
        }],
    ['getMerge', getMerge],
    ['setMerge', function (cellName, colspan, rowspan) {
            return setMerge.call(this, cellName, colspan, rowspan);
        }],
    ['destroyMerge', function () {
            return destroyMerge.call(this);
        }],
    ['removeMerge', function (cellName, data) {
            return removeMerge.call(this, cellName, data);
        }],
    ['search', search],
    ['resetSearch', resetSearch],
    ['getHeader', getHeader],
    ['getHeaders', getHeaders],
    ['setHeader', setHeader],
    ['getStyle', getStyle],
    ['setStyle', function (cell, property, value, forceOverwrite) {
            return setStyle.call(this, cell, property, value, forceOverwrite);
        }],
    ['resetStyle', resetStyle],
    ['insertColumn', insertColumn],
    ['moveColumn', moveColumn],
    ['deleteColumn', deleteColumn],
    ['getColumnData', getColumnData],
    ['setColumnData', setColumnData],
    ['whichPage', whichPage],
    ['page', page],
    ['download', download],
    ['getComments', getComments],
    ['setComments', setComments],
    ['orderBy', orderBy],
    ['undo', undo],
    ['redo', redo],
    ['getCell', getCell],
    ['getCellFromCoords', getCellFromCoords],
    ['getLabel', getLabel],
    ['getConfig', getWorksheetConfig],
    ['setConfig', setConfig],
    ['getMeta', function (cell) {
            return getMeta.call(this, cell);
        }],
    ['setMeta', setMeta],
    ['showColumn', showColumn],
    ['hideColumn', hideColumn],
    ['showIndex', showIndex],
    ['hideIndex', hideIndex],
    ['getWorksheetActive', getWorksheetActive],
    ['openEditor', openEditor],
    ['closeEditor', closeEditor],
    ['createWorksheet', createWorksheet],
    ['openWorksheet', openWorksheet],
    ['deleteWorksheet', deleteWorksheet],
    ['copy', function (cut) {
            if (cut) {
                cutControls();
            }
            else {
                copy.call(this, true);
            }
        }],
    ['paste', paste],
    ['executeFormula', executeFormula],
    ['getDataFromRange', getDataFromRange],
    ['quantiyOfPages', quantiyOfPages],
    ['getRange', getRange],
    ['isSelected', isSelected],
    ['setReadOnly', setReadOnly],
    ['isReadOnly', isReadOnly],
    ['getHighlighted', getHighlighted],
    ['dispatch', dispatch],
    ['down', down],
    ['first', first],
    ['last', last],
    ['left', left],
    ['right', right],
    ['up', up],
    ['openFilter', openFilter],
    ['resetFilters', resetFilters],
];
var worksheetPublicMethodsLength = worksheetPublicMethods.length;
//# sourceMappingURL=worksheets.js.map