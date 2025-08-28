"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyEvents = exports.setEvents = exports.scrollControls = exports.wheelControls = exports.cutControls = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const editor_1 = require("./editor");
const libraryBase_1 = __importDefault(require("./libraryBase"));
const keys_1 = require("./keys");
const merges_1 = require("./merges");
const selection_1 = require("./selection");
const copyPaste_1 = require("./copyPaste");
const filter_1 = require("./filter");
const lazyLoading_1 = require("./lazyLoading");
const columns_1 = require("./columns");
const rows_1 = require("./rows");
const version_1 = __importDefault(require("./version"));
const helpers_1 = require("./helpers");
const getAttrSafe = (el, name) => { var _a; return (_a = el === null || el === void 0 ? void 0 : el.getAttribute(name)) !== null && _a !== void 0 ? _a : ""; };
const getAttrInt = (el, name) => parseInt(getAttrSafe(el, name), 10);
const getHTMLElement = (element) => element instanceof HTMLElement ? element : null;
const getElement = function (element) {
    let jssSection = 0;
    let jssElement = null;
    function path(el) {
        if (!el)
            return;
        if (el.classList) {
            const cls = el.classList;
            if (cls.contains("jss_container")) {
                jssElement = el;
            }
            if (cls.contains("jss_spreadsheet")) {
                const found = el.querySelector(":scope > .jtabs-content > .jtabs-selected");
                if (found instanceof HTMLElement)
                    jssElement = found;
            }
        }
        const tagName = el.tagName;
        if (tagName == "THEAD") {
            jssSection = 1;
        }
        else if (tagName == "TBODY") {
            jssSection = 2;
        }
        const parent = el.parentElement;
        if (parent && !jssElement) {
            path(parent);
        }
    }
    path(element);
    return [jssElement, jssSection];
};
const mouseUpControls = function (e) {
    if (libraryBase_1.default.jspreadsheet.current) {
        // Update cell size
        if (libraryBase_1.default.jspreadsheet.current.resizing) {
            // Columns to be updated
            if (libraryBase_1.default.jspreadsheet.current.resizing.column) {
                // New width
                const newWidth = getAttrInt(libraryBase_1.default.jspreadsheet.current.cols[libraryBase_1.default.jspreadsheet.current.resizing.column].colElement, "width");
                // Columns
                const columns = libraryBase_1.default.jspreadsheet.current.getSelectedColumns();
                if (columns.length > 1) {
                    const currentWidth = [];
                    for (let i = 0; i < columns.length; i++) {
                        currentWidth.push(getAttrInt(libraryBase_1.default.jspreadsheet.current.cols[columns[i]].colElement, "width"));
                    }
                    // Previous width
                    const index = columns.indexOf(libraryBase_1.default.jspreadsheet.current.resizing.column);
                    currentWidth[index] = libraryBase_1.default.jspreadsheet.current.resizing.width;
                    columns_1.setWidth.call(libraryBase_1.default.jspreadsheet.current.parent, columns, newWidth, currentWidth);
                }
                else {
                    columns_1.setWidth.call(libraryBase_1.default.jspreadsheet.current.parent, libraryBase_1.default.jspreadsheet.current.resizing.column, newWidth, libraryBase_1.default.jspreadsheet.current.resizing.width);
                }
                // Remove border
                libraryBase_1.default.jspreadsheet.current.headers[libraryBase_1.default.jspreadsheet.current.resizing.column].classList.remove("resizing");
                for (let j = 0; j < libraryBase_1.default.jspreadsheet.current.records.length; j++) {
                    if (libraryBase_1.default.jspreadsheet.current.records[j][libraryBase_1.default.jspreadsheet.current.resizing.column]) {
                        libraryBase_1.default.jspreadsheet.current.records[j][libraryBase_1.default.jspreadsheet.current.resizing.column].element.classList.remove("resizing");
                    }
                }
            }
            else {
                // Remove Class
                libraryBase_1.default.jspreadsheet.current.rows[libraryBase_1.default.jspreadsheet.current.resizing.row].element.children[0].classList.remove("resizing");
                let newHeight = getAttrInt(libraryBase_1.default.jspreadsheet.current.rows[libraryBase_1.default.jspreadsheet.current.resizing.row].element, "height");
                rows_1.setHeight.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.resizing.row, newHeight, libraryBase_1.default.jspreadsheet.current.resizing.height);
                // Remove border
                libraryBase_1.default.jspreadsheet.current.resizing.element.classList.remove("resizing");
            }
            // Reset resizing helper
            libraryBase_1.default.jspreadsheet.current.resizing = null;
        }
        else if (libraryBase_1.default.jspreadsheet.current.dragging) {
            // Reset dragging helper
            if (libraryBase_1.default.jspreadsheet.current.dragging) {
                if (libraryBase_1.default.jspreadsheet.current.dragging.column) {
                    // Target
                    const columnIdAttr = getAttrSafe(e.target, "data-x");
                    const columnId = columnIdAttr ? parseInt(columnIdAttr, 10) : undefined;
                    // Remove move style
                    libraryBase_1.default.jspreadsheet.current.headers[libraryBase_1.default.jspreadsheet.current.dragging.column].classList.remove("dragging");
                    for (let j = 0; j < libraryBase_1.default.jspreadsheet.current.rows.length; j++) {
                        if (libraryBase_1.default.jspreadsheet.current.records[j][libraryBase_1.default.jspreadsheet.current.dragging.column]) {
                            libraryBase_1.default.jspreadsheet.current.records[j][libraryBase_1.default.jspreadsheet.current.dragging.column].element.classList.remove("dragging");
                        }
                    }
                    for (let i = 0; i < libraryBase_1.default.jspreadsheet.current.headers.length; i++) {
                        libraryBase_1.default.jspreadsheet.current.headers[i].classList.remove("dragging-left");
                        libraryBase_1.default.jspreadsheet.current.headers[i].classList.remove("dragging-right");
                    }
                    // Update position
                    if (columnId !== undefined) {
                        if (libraryBase_1.default.jspreadsheet.current.dragging.column !=
                            libraryBase_1.default.jspreadsheet.current.dragging.destination) {
                            libraryBase_1.default.jspreadsheet.current.moveColumn(libraryBase_1.default.jspreadsheet.current.dragging.column, libraryBase_1.default.jspreadsheet.current.dragging.destination);
                        }
                    }
                }
                else {
                    let position;
                    if (libraryBase_1.default.jspreadsheet.current.dragging.element.nextSibling) {
                        position = parseInt(libraryBase_1.default.jspreadsheet.current.dragging.element.nextSibling.getAttribute("data-y"));
                        if (libraryBase_1.default.jspreadsheet.current.dragging.row < position) {
                            position -= 1;
                        }
                    }
                    else {
                        position = parseInt(libraryBase_1.default.jspreadsheet.current.dragging.element.previousSibling.getAttribute("data-y"));
                    }
                    if (libraryBase_1.default.jspreadsheet.current.dragging.row !=
                        libraryBase_1.default.jspreadsheet.current.dragging.destination) {
                        rows_1.moveRow.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.dragging.row, position, true);
                    }
                    libraryBase_1.default.jspreadsheet.current.dragging.element.classList.remove("dragging");
                }
                libraryBase_1.default.jspreadsheet.current.dragging = null;
            }
        }
        else {
            // Close any corner selection
            if (libraryBase_1.default.jspreadsheet.current.selectedCorner) {
                libraryBase_1.default.jspreadsheet.current.selectedCorner = false;
                // Data to be copied
                if (libraryBase_1.default.jspreadsheet.current.selection.length > 0) {
                    // Copy data
                    selection_1.copyData.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.selection[0], libraryBase_1.default.jspreadsheet.current.selection[libraryBase_1.default.jspreadsheet.current.selection.length - 1]);
                    // Remove selection
                    selection_1.removeCopySelection.call(libraryBase_1.default.jspreadsheet.current);
                }
            }
        }
    }
    // Clear any time control
    if (libraryBase_1.default.jspreadsheet.timeControl) {
        clearTimeout(libraryBase_1.default.jspreadsheet.timeControl);
        libraryBase_1.default.jspreadsheet.timeControl = null;
    }
    // Mouse up
    libraryBase_1.default.jspreadsheet.isMouseAction = false;
};
const mouseDownControls = function (e) {
    e = e || window.event;
    let mouseButton;
    if (e.buttons) {
        mouseButton = e.buttons;
    }
    else if (e.button) {
        mouseButton = e.button;
    }
    else {
        mouseButton = e.which;
    }
    // Get elements
    const target = getHTMLElement(e.target);
    const jssTable = getElement(target);
    if (!target) {
        libraryBase_1.default.jspreadsheet.isMouseAction = false;
        return;
    }
    if (jssTable[0]) {
        if (libraryBase_1.default.jspreadsheet.current != jssTable[0].jssWorksheet) {
            if (libraryBase_1.default.jspreadsheet.current) {
                if (libraryBase_1.default.jspreadsheet.current.edition) {
                    editor_1.closeEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.edition[0], true);
                }
                libraryBase_1.default.jspreadsheet.current.resetSelection();
            }
            libraryBase_1.default.jspreadsheet.current = jssTable[0].jssWorksheet;
        }
    }
    else {
        if (libraryBase_1.default.jspreadsheet.current) {
            if (libraryBase_1.default.jspreadsheet.current.edition) {
                editor_1.closeEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.edition[0], true);
            }
            if (!target.classList.contains("jss_object")) {
                selection_1.resetSelection.call(libraryBase_1.default.jspreadsheet.current, true);
                libraryBase_1.default.jspreadsheet.current = null;
            }
        }
    }
    if (libraryBase_1.default.jspreadsheet.current && mouseButton == 1) {
        if (target.classList.contains("jss_selectall")) {
            if (libraryBase_1.default.jspreadsheet.current) {
                selection_1.selectAll.call(libraryBase_1.default.jspreadsheet.current);
            }
        }
        else if (target.classList.contains("jss_corner")) {
            if (libraryBase_1.default.jspreadsheet.current.options.editable != false) {
                libraryBase_1.default.jspreadsheet.current.selectedCorner = true;
            }
        }
        else {
            // Header found
            if (jssTable[1] == 1) {
                const columnIdAttr = target.getAttribute("data-x");
                const columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
                if (columnId !== undefined) {
                    // Update cursor
                    const info = target.getBoundingClientRect();
                    if (libraryBase_1.default.jspreadsheet.current.options.columnResize != false &&
                        info.width - e.offsetX < 6) {
                        // Resize helper
                        libraryBase_1.default.jspreadsheet.current.resizing = {
                            mousePosition: e.pageX,
                            column: columnId,
                            width: info.width,
                        };
                        // Border indication
                        libraryBase_1.default.jspreadsheet.current.headers[columnId].classList.add("resizing");
                        for (let j = 0; j < libraryBase_1.default.jspreadsheet.current.records.length; j++) {
                            if (libraryBase_1.default.jspreadsheet.current.records[j][columnId]) {
                                libraryBase_1.default.jspreadsheet.current.records[j][columnId].element.classList.add("resizing");
                            }
                        }
                    }
                    else if (libraryBase_1.default.jspreadsheet.current.options.columnDrag != false &&
                        info.height - e.offsetY < 6) {
                        if (merges_1.isColMerged.call(libraryBase_1.default.jspreadsheet.current, columnId)
                            .length) {
                            console.error("Jspreadsheet: This column is part of a merged cell.");
                        }
                        else {
                            // Reset selection
                            libraryBase_1.default.jspreadsheet.current.resetSelection();
                            // Drag helper
                            libraryBase_1.default.jspreadsheet.current.dragging = {
                                element: target,
                                column: columnId,
                                destination: columnId,
                            };
                            // Border indication
                            libraryBase_1.default.jspreadsheet.current.headers[columnId].classList.add("dragging");
                            for (let j = 0; j < libraryBase_1.default.jspreadsheet.current.records.length; j++) {
                                if (libraryBase_1.default.jspreadsheet.current.records[j][columnId]) {
                                    libraryBase_1.default.jspreadsheet.current.records[j][columnId].element.classList.add("dragging");
                                }
                            }
                        }
                    }
                    else {
                        let o, d;
                        if (libraryBase_1.default.jspreadsheet.current.selectedHeader &&
                            (e.shiftKey || e.ctrlKey)) {
                            o = libraryBase_1.default.jspreadsheet.current.selectedHeader;
                            d = columnId;
                        }
                        else {
                            // Press to rename
                            if (libraryBase_1.default.jspreadsheet.current.selectedHeader == columnId &&
                                libraryBase_1.default.jspreadsheet.current.options.allowRenameColumn !=
                                    false) {
                                libraryBase_1.default.jspreadsheet.timeControl = setTimeout(function () {
                                    libraryBase_1.default.jspreadsheet.current.setHeader(columnId);
                                }, 800);
                            }
                            // Keep track of which header was selected first
                            libraryBase_1.default.jspreadsheet.current.selectedHeader = columnId;
                            // Update selection single column
                            o = columnId;
                            d = columnId;
                        }
                        // Update selection
                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, o, 0, d, libraryBase_1.default.jspreadsheet.current.options.data.length - 1, e);
                    }
                }
                else {
                    if (e.target.parentNode.classList.contains("jss_nested")) {
                        let c1, c2;
                        if (e.target.getAttribute("data-column")) {
                            const column = e.target.getAttribute("data-column").split(",");
                            c1 = parseInt(column[0]);
                            c2 = parseInt(column[column.length - 1]);
                        }
                        else {
                            c1 = 0;
                            c2 = libraryBase_1.default.jspreadsheet.current.options.columns.length - 1;
                        }
                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, c1, 0, c2, libraryBase_1.default.jspreadsheet.current.options.data.length - 1, e);
                    }
                }
            }
            else {
                libraryBase_1.default.jspreadsheet.current.selectedHeader = false;
            }
            // Body found
            if (jssTable[1] == 2) {
                const rowId = parseInt(e.target.getAttribute("data-y"));
                if (e.target.classList.contains("jss_row")) {
                    const info = e.target.getBoundingClientRect();
                    if (libraryBase_1.default.jspreadsheet.current.options.rowResize != false &&
                        info.height - e.offsetY < 6) {
                        // Resize helper
                        libraryBase_1.default.jspreadsheet.current.resizing = {
                            element: e.target.parentNode,
                            mousePosition: e.pageY,
                            row: rowId,
                            height: info.height,
                        };
                        // Border indication
                        e.target.parentNode.classList.add("resizing");
                    }
                    else if (libraryBase_1.default.jspreadsheet.current.options.rowDrag != false &&
                        info.width - e.offsetX < 6) {
                        if (merges_1.isRowMerged.call(libraryBase_1.default.jspreadsheet.current, rowId, false)
                            .length) {
                            console.error("Jspreadsheet: This row is part of a merged cell");
                        }
                        else if (libraryBase_1.default.jspreadsheet.current.options.search == true &&
                            libraryBase_1.default.jspreadsheet.current.results) {
                            console.error("Jspreadsheet: Please clear your search before perform this action");
                        }
                        else {
                            // Reset selection
                            libraryBase_1.default.jspreadsheet.current.resetSelection();
                            // Drag helper
                            libraryBase_1.default.jspreadsheet.current.dragging = {
                                element: e.target.parentNode,
                                row: rowId,
                                destination: rowId,
                            };
                            // Border indication
                            e.target.parentNode.classList.add("dragging");
                        }
                    }
                    else {
                        let o, d;
                        if (libraryBase_1.default.jspreadsheet.current.selectedRow != null &&
                            (e.shiftKey || e.ctrlKey)) {
                            o = libraryBase_1.default.jspreadsheet.current.selectedRow;
                            d = rowId;
                        }
                        else {
                            // Keep track of which header was selected first
                            libraryBase_1.default.jspreadsheet.current.selectedRow = rowId;
                            // Update selection single column
                            o = rowId;
                            d = rowId;
                        }
                        // Update selection
                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, 0, o, libraryBase_1.default.jspreadsheet.current.options.data[0].length - 1, d, e);
                    }
                }
                else {
                    // Jclose
                    if (e.target.classList.contains("jclose") &&
                        e.target.clientWidth - e.offsetX < 50 &&
                        e.offsetY < 50) {
                        editor_1.closeEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.edition[0], true);
                    }
                    else {
                        const getCellCoords = function (element) {
                            const x = element.getAttribute("data-x");
                            const y = element.getAttribute("data-y");
                            if (x && y) {
                                return [x, y];
                            }
                            else {
                                if (element.parentNode) {
                                    return getCellCoords(element.parentNode);
                                }
                                return undefined;
                            }
                        };
                        const position = getCellCoords(e.target);
                        if (position) {
                            const columnId = parseInt(position[0]);
                            const rowId = parseInt(position[1]);
                            // Close edition
                            if (libraryBase_1.default.jspreadsheet.current.edition) {
                                if (libraryBase_1.default.jspreadsheet.current.edition[2] != columnId ||
                                    libraryBase_1.default.jspreadsheet.current.edition[3] != rowId) {
                                    editor_1.closeEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.edition[0], true);
                                }
                            }
                            if (!libraryBase_1.default.jspreadsheet.current.edition) {
                                // Update cell selection
                                if (e.shiftKey &&
                                    libraryBase_1.default.jspreadsheet.current.selectedCell) {
                                    selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.selectedCell[0], libraryBase_1.default.jspreadsheet.current.selectedCell[1], columnId, rowId, e);
                                }
                                else {
                                    selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, columnId, rowId, columnId, rowId, e);
                                }
                            }
                            // No full row selected
                            libraryBase_1.default.jspreadsheet.current.selectedHeader = null;
                            libraryBase_1.default.jspreadsheet.current.selectedRow = null;
                        }
                    }
                }
            }
            else {
                libraryBase_1.default.jspreadsheet.current.selectedRow = false;
            }
            // Pagination
            if (e.target.classList.contains("jss_page")) {
                if (e.target.textContent == "<") {
                    libraryBase_1.default.jspreadsheet.current.page(0);
                }
                else if (e.target.textContent == ">") {
                    libraryBase_1.default.jspreadsheet.current.page(e.target.getAttribute("title") - 1);
                }
                else {
                    libraryBase_1.default.jspreadsheet.current.page(e.target.textContent - 1);
                }
            }
        }
        if (libraryBase_1.default.jspreadsheet.current.edition) {
            libraryBase_1.default.jspreadsheet.isMouseAction = false;
        }
        else {
            libraryBase_1.default.jspreadsheet.isMouseAction = true;
        }
    }
    else {
        libraryBase_1.default.jspreadsheet.isMouseAction = false;
    }
};
// Mouse move controls
const mouseMoveControls = function (e) {
    e = e || window.event;
    let mouseButton;
    if (e.buttons) {
        mouseButton = e.buttons;
    }
    else if (e.button) {
        mouseButton = e.button;
    }
    else {
        mouseButton = e.which;
    }
    if (!mouseButton) {
        libraryBase_1.default.jspreadsheet.isMouseAction = false;
    }
    if (libraryBase_1.default.jspreadsheet.current) {
        if (libraryBase_1.default.jspreadsheet.isMouseAction == true) {
            // Resizing is ongoing
            if (libraryBase_1.default.jspreadsheet.current.resizing) {
                if (libraryBase_1.default.jspreadsheet.current.resizing.column) {
                    const width = e.pageX - libraryBase_1.default.jspreadsheet.current.resizing.mousePosition;
                    if (libraryBase_1.default.jspreadsheet.current.resizing.width + width > 0) {
                        const tempWidth = libraryBase_1.default.jspreadsheet.current.resizing.width + width;
                        libraryBase_1.default.jspreadsheet.current.cols[libraryBase_1.default.jspreadsheet.current.resizing.column].colElement.setAttribute("width", tempWidth);
                        selection_1.updateCornerPosition.call(libraryBase_1.default.jspreadsheet.current);
                    }
                }
                else {
                    const height = e.pageY - libraryBase_1.default.jspreadsheet.current.resizing.mousePosition;
                    if (libraryBase_1.default.jspreadsheet.current.resizing.height + height > 0) {
                        const tempHeight = libraryBase_1.default.jspreadsheet.current.resizing.height + height;
                        libraryBase_1.default.jspreadsheet.current.rows[libraryBase_1.default.jspreadsheet.current.resizing.row].element.setAttribute("height", tempHeight);
                        selection_1.updateCornerPosition.call(libraryBase_1.default.jspreadsheet.current);
                    }
                }
            }
            else if (libraryBase_1.default.jspreadsheet.current.dragging) {
                if (libraryBase_1.default.jspreadsheet.current.dragging.column) {
                    const columnIdAttr = e.target.getAttribute("data-x");
                    const columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
                    if (columnId !== undefined) {
                        if (merges_1.isColMerged.call(libraryBase_1.default.jspreadsheet.current, columnId)
                            .length) {
                            console.error("Jspreadsheet: This column is part of a merged cell.");
                        }
                        else {
                            for (let i = 0; i < libraryBase_1.default.jspreadsheet.current.headers.length; i++) {
                                libraryBase_1.default.jspreadsheet.current.headers[i].classList.remove("dragging-left");
                                libraryBase_1.default.jspreadsheet.current.headers[i].classList.remove("dragging-right");
                            }
                            if (libraryBase_1.default.jspreadsheet.current.dragging.column == columnId) {
                                libraryBase_1.default.jspreadsheet.current.dragging.destination =
                                    columnId;
                            }
                            else {
                                if (e.target.clientWidth / 2 > e.offsetX) {
                                    if (libraryBase_1.default.jspreadsheet.current.dragging.column < columnId) {
                                        libraryBase_1.default.jspreadsheet.current.dragging.destination =
                                            columnId - 1;
                                    }
                                    else {
                                        libraryBase_1.default.jspreadsheet.current.dragging.destination =
                                            columnId;
                                    }
                                    libraryBase_1.default.jspreadsheet.current.headers[columnId].classList.add("dragging-left");
                                }
                                else {
                                    if (libraryBase_1.default.jspreadsheet.current.dragging.column < columnId) {
                                        libraryBase_1.default.jspreadsheet.current.dragging.destination =
                                            columnId;
                                    }
                                    else {
                                        libraryBase_1.default.jspreadsheet.current.dragging.destination =
                                            columnId + 1;
                                    }
                                    libraryBase_1.default.jspreadsheet.current.headers[columnId].classList.add("dragging-right");
                                }
                            }
                        }
                    }
                }
                else {
                    const rowId = e.target.getAttribute("data-y");
                    if (rowId) {
                        if (merges_1.isRowMerged.call(libraryBase_1.default.jspreadsheet.current, rowId, false)
                            .length) {
                            console.error("Jspreadsheet: This row is part of a merged cell.");
                        }
                        else {
                            const target = e.target.clientHeight / 2 > e.offsetY
                                ? e.target.parentNode.nextSibling
                                : e.target.parentNode;
                            if (libraryBase_1.default.jspreadsheet.current.dragging.element != target) {
                                e.target.parentNode.parentNode.insertBefore(libraryBase_1.default.jspreadsheet.current.dragging.element, target);
                                libraryBase_1.default.jspreadsheet.current.dragging.destination =
                                    Array.prototype.indexOf.call(libraryBase_1.default.jspreadsheet.current.dragging.element.parentNode
                                        .children, libraryBase_1.default.jspreadsheet.current.dragging.element);
                            }
                        }
                    }
                }
            }
        }
        else {
            const x = e.target.getAttribute("data-x");
            const y = e.target.getAttribute("data-y");
            const rect = e.target.getBoundingClientRect();
            if (libraryBase_1.default.jspreadsheet.current.cursor) {
                libraryBase_1.default.jspreadsheet.current.cursor.style.cursor = "";
                libraryBase_1.default.jspreadsheet.current.cursor = null;
            }
            if (e.target.parentNode.parentNode &&
                e.target.parentNode.parentNode.className) {
                if (e.target.parentNode.parentNode.classList.contains("resizable")) {
                    if (e.target && x && !y && rect.width - (e.clientX - rect.left) < 6) {
                        libraryBase_1.default.jspreadsheet.current.cursor = e.target;
                        libraryBase_1.default.jspreadsheet.current.cursor.style.cursor = "col-resize";
                    }
                    else if (e.target &&
                        !x &&
                        y &&
                        rect.height - (e.clientY - rect.top) < 6) {
                        libraryBase_1.default.jspreadsheet.current.cursor = e.target;
                        libraryBase_1.default.jspreadsheet.current.cursor.style.cursor = "row-resize";
                    }
                }
                if (e.target.parentNode.parentNode.classList.contains("draggable")) {
                    if (e.target && !x && y && rect.width - (e.clientX - rect.left) < 6) {
                        libraryBase_1.default.jspreadsheet.current.cursor = e.target;
                        libraryBase_1.default.jspreadsheet.current.cursor.style.cursor = "move";
                    }
                    else if (e.target &&
                        x &&
                        !y &&
                        rect.height - (e.clientY - rect.top) < 6) {
                        libraryBase_1.default.jspreadsheet.current.cursor = e.target;
                        libraryBase_1.default.jspreadsheet.current.cursor.style.cursor = "move";
                    }
                }
            }
        }
    }
};
/**
 * Update copy selection
 *
 * @param int x, y
 * @return void
 */
const updateCopySelection = function (x3, y3) {
    const obj = this;
    // Remove selection
    selection_1.removeCopySelection.call(obj);
    // Get elements first and last
    const x1 = obj.selectedContainer[0];
    const y1 = obj.selectedContainer[1];
    const x2 = obj.selectedContainer[2];
    const y2 = obj.selectedContainer[3];
    if (x3 != null && y3 != null) {
        let px, ux;
        if (x3 - x2 > 0) {
            px = x2 + 1;
            ux = x3;
        }
        else {
            px = x3;
            ux = x1 - 1;
        }
        let py, uy;
        if (y3 - y2 > 0) {
            py = y2 + 1;
            uy = y3;
        }
        else {
            py = y3;
            uy = y1 - 1;
        }
        if (ux - px <= uy - py) {
            px = parseInt(x1);
            ux = parseInt(x2);
        }
        else {
            py = parseInt(y1);
            uy = parseInt(y2);
        }
        for (let j = py; j <= uy; j++) {
            for (let i = px; i <= ux; i++) {
                if (obj.records[j][i] &&
                    obj.rows[j].element.style.display != "none" &&
                    obj.records[j][i].element.style.display != "none") {
                    obj.records[j][i].element.classList.add("selection");
                    obj.records[py][i].element.classList.add("selection-top");
                    obj.records[uy][i].element.classList.add("selection-bottom");
                    obj.records[j][px].element.classList.add("selection-left");
                    obj.records[j][ux].element.classList.add("selection-right");
                    // Persist selected elements
                    obj.selection.push(obj.records[j][i].element);
                }
            }
        }
    }
};
const mouseOverControls = function (e) {
    e = e || window.event;
    let mouseButton;
    if (e.buttons) {
        mouseButton = e.buttons;
    }
    else if (e.button) {
        mouseButton = e.button;
    }
    else {
        mouseButton = e.which;
    }
    if (!mouseButton) {
        libraryBase_1.default.jspreadsheet.isMouseAction = false;
    }
    if (libraryBase_1.default.jspreadsheet.current &&
        libraryBase_1.default.jspreadsheet.isMouseAction == true) {
        // Get elements
        const jssTable = getElement(e.target);
        if (jssTable[0]) {
            // Avoid cross reference
            if (libraryBase_1.default.jspreadsheet.current != jssTable[0].jssWorksheet) {
                if (libraryBase_1.default.jspreadsheet.current) {
                    return false;
                }
            }
            const columnIdAttr = e.target.getAttribute("data-x");
            let columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
            const rowIdAttr = e.target.getAttribute("data-y");
            const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
            if (libraryBase_1.default.jspreadsheet.current.resizing ||
                libraryBase_1.default.jspreadsheet.current.dragging) {
            }
            else {
                // Header found
                if (jssTable[1] == 1) {
                    if (libraryBase_1.default.jspreadsheet.current.selectedHeader) {
                        const columnIdAttr2 = e.target.getAttribute("data-x");
                        columnId = columnIdAttr2 !== null ? parseInt(columnIdAttr2, 10) : undefined;
                        const o = libraryBase_1.default.jspreadsheet.current.selectedHeader;
                        const d = columnId;
                        // Update selection
                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, o, 0, d, libraryBase_1.default.jspreadsheet.current.options.data.length - 1, e);
                    }
                }
                // Body found
                if (jssTable[1] == 2) {
                    if (e.target.classList.contains("jss_row")) {
                        if (libraryBase_1.default.jspreadsheet.current.selectedRow != null) {
                            const o = libraryBase_1.default.jspreadsheet.current.selectedRow;
                            const d = rowId;
                            // Update selection
                            selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, 0, o, libraryBase_1.default.jspreadsheet.current.options.data[0].length - 1, d, e);
                        }
                    }
                    else {
                        // Do not select edtion is in progress
                        if (!libraryBase_1.default.jspreadsheet.current.edition) {
                            if (columnId !== undefined && rowId !== undefined) {
                                if (libraryBase_1.default.jspreadsheet.current.selectedCorner) {
                                    updateCopySelection.call(libraryBase_1.default.jspreadsheet.current, columnId, rowId);
                                }
                                else {
                                    if (libraryBase_1.default.jspreadsheet.current.selectedCell) {
                                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.selectedCell[0], libraryBase_1.default.jspreadsheet.current.selectedCell[1], columnId, rowId, e);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // Clear any time control
    if (libraryBase_1.default.jspreadsheet.timeControl) {
        clearTimeout(libraryBase_1.default.jspreadsheet.timeControl);
        libraryBase_1.default.jspreadsheet.timeControl = null;
    }
};
const doubleClickControls = function (e) {
    // Jss is selected
    if (libraryBase_1.default.jspreadsheet.current) {
        // Corner action
        if (e.target.classList.contains("jss_corner")) {
            // Any selected cells
            if (libraryBase_1.default.jspreadsheet.current.highlighted.length > 0) {
                // Copy from this
                const x1 = libraryBase_1.default.jspreadsheet.current.highlighted[0].element.getAttribute("data-x");
                const y1 = parseInt(libraryBase_1.default.jspreadsheet.current.highlighted[libraryBase_1.default.jspreadsheet.current.highlighted.length - 1].element.getAttribute("data-y")) + 1;
                // Until this
                const x2 = libraryBase_1.default.jspreadsheet.current.highlighted[libraryBase_1.default.jspreadsheet.current.highlighted.length - 1].element.getAttribute("data-x");
                const y2 = libraryBase_1.default.jspreadsheet.current.records.length - 1;
                // Execute copy
                selection_1.copyData.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.records[y1][x1].element, libraryBase_1.default.jspreadsheet.current.records[y2][x2].element);
            }
        }
        else if (e.target.classList.contains("jss_column_filter")) {
            // Column
            const columnId = e.target.getAttribute("data-x");
            // Open filter
            filter_1.openFilter.call(libraryBase_1.default.jspreadsheet.current, columnId);
        }
        else {
            // Get table
            const jssTable = getElement(e.target);
            // Double click over header
            if (jssTable[1] == 1 &&
                libraryBase_1.default.jspreadsheet.current.options.columnSorting != false) {
                // Check valid column header coords
                const columnId = e.target.getAttribute("data-x");
                if (columnId) {
                    libraryBase_1.default.jspreadsheet.current.orderBy(parseInt(columnId));
                }
            }
            // Double click over body
            if (jssTable[1] == 2 &&
                libraryBase_1.default.jspreadsheet.current.options.editable != false) {
                if (!libraryBase_1.default.jspreadsheet.current.edition) {
                    const getCellCoords = function (element) {
                        if (element.parentNode) {
                            const x = element.getAttribute("data-x");
                            const y = element.getAttribute("data-y");
                            if (x && y) {
                                return element;
                            }
                            else {
                                return getCellCoords(element.parentNode);
                            }
                        }
                        return undefined;
                    };
                    const cell = getCellCoords(e.target);
                    if (cell && cell.classList.contains("highlight")) {
                        editor_1.openEditor.call(libraryBase_1.default.jspreadsheet.current, cell, false, e);
                    }
                }
            }
        }
    }
};
const pasteControls = function (e) {
    if (libraryBase_1.default.jspreadsheet.current &&
        libraryBase_1.default.jspreadsheet.current.selectedCell) {
        if (!libraryBase_1.default.jspreadsheet.current.edition) {
            if (libraryBase_1.default.jspreadsheet.current.options.editable != false) {
                if (e && e.clipboardData) {
                    copyPaste_1.paste.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.selectedCell[0], libraryBase_1.default.jspreadsheet.current.selectedCell[1], e.clipboardData.getData("text"));
                    e.preventDefault();
                }
                else if (window.clipboardData) {
                    copyPaste_1.paste.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.selectedCell[0], libraryBase_1.default.jspreadsheet.current.selectedCell[1], window.clipboardData.getData("text"));
                }
            }
        }
    }
};
const getRole = function (element) {
    if (element.classList.contains("jss_selectall")) {
        return "select-all";
    }
    if (element.classList.contains("jss_corner")) {
        return "fill-handle";
    }
    let tempElement = element;
    while (tempElement && !tempElement.classList.contains("jss_spreadsheet")) {
        if (tempElement.classList.contains("jss_row")) {
            return "row";
        }
        if (tempElement.classList.contains("jss_nested")) {
            return "nested";
        }
        if (tempElement.classList.contains("jtabs-headers")) {
            return "tabs";
        }
        if (tempElement.classList.contains("jtoolbar")) {
            return "toolbar";
        }
        if (tempElement.classList.contains("jss_pagination")) {
            return "pagination";
        }
        if (tempElement.tagName === "TBODY") {
            return "cell";
        }
        if (tempElement.tagName === "TFOOT") {
            return getElementIndex(element) === 0 ? "grid" : "footer";
        }
        if (tempElement.tagName === "THEAD") {
            return "header";
        }
        tempElement = tempElement.parentElement;
    }
    return "applications";
};
const defaultContextMenu = function (worksheet, x, y, role) {
    const items = [];
    if (role === "header") {
        // Insert a new column
        if (worksheet.options.allowInsertColumn != false) {
            items.push({
                title: jsuites_1.default.translate("Insert a new column before"),
                onclick: function () {
                    worksheet.insertColumn(1, x, 1);
                },
            });
        }
        if (worksheet.options.allowInsertColumn != false) {
            items.push({
                title: jsuites_1.default.translate("Insert a new column after"),
                onclick: function () {
                    worksheet.insertColumn(1, x, 0);
                },
            });
        }
        // Delete a column
        if (worksheet.options.allowDeleteColumn != false) {
            items.push({
                title: jsuites_1.default.translate("Delete selected columns"),
                onclick: function () {
                    worksheet.deleteColumn(worksheet.getSelectedColumns().length ? undefined : x);
                },
            });
        }
        // Rename column
        if (worksheet.options.allowRenameColumn != false) {
            items.push({
                title: jsuites_1.default.translate("Rename this column"),
                onclick: function () {
                    const oldValue = worksheet.getHeader(x);
                    const newValue = prompt(jsuites_1.default.translate("Column name"), oldValue);
                    worksheet.setHeader(x, newValue);
                },
            });
        }
        // Sorting
        if (worksheet.options.columnSorting != false) {
            // Line
            items.push({ type: "line" });
            items.push({
                title: jsuites_1.default.translate("Order ascending"),
                onclick: function () {
                    worksheet.orderBy(x, 0);
                },
            });
            items.push({
                title: jsuites_1.default.translate("Order descending"),
                onclick: function () {
                    worksheet.orderBy(x, 1);
                },
            });
        }
    }
    if (role === "row" || role === "cell") {
        // Insert new row
        if (worksheet.options.allowInsertRow != false) {
            items.push({
                title: jsuites_1.default.translate("Insert a new row before"),
                onclick: function () {
                    worksheet.insertRow(1, y, 1);
                },
            });
            items.push({
                title: jsuites_1.default.translate("Insert a new row after"),
                onclick: function () {
                    worksheet.insertRow(1, y);
                },
            });
        }
        if (worksheet.options.allowDeleteRow != false) {
            items.push({
                title: jsuites_1.default.translate("Delete selected rows"),
                onclick: function () {
                    worksheet.deleteRow(worksheet.getSelectedRows().length ? undefined : y);
                },
            });
        }
    }
    if (role === "cell") {
        if (worksheet.options.allowComments != false) {
            items.push({ type: "line" });
            const title = worksheet.records[y][x].element.getAttribute("title") || "";
            items.push({
                title: jsuites_1.default.translate(title ? "Edit comments" : "Add comments"),
                onclick: function () {
                    const comment = prompt(jsuites_1.default.translate("Comments"), title);
                    if (comment) {
                        worksheet.setComments((0, helpers_1.getCellNameFromCoords)(x, y), comment);
                    }
                },
            });
            if (title) {
                items.push({
                    title: jsuites_1.default.translate("Clear comments"),
                    onclick: function () {
                        worksheet.setComments((0, helpers_1.getCellNameFromCoords)(x, y), "");
                    },
                });
            }
        }
    }
    // Line
    if (items.length !== 0) {
        items.push({ type: "line" });
    }
    // Copy
    if (role === "header" || role === "row" || role === "cell") {
        items.push({
            title: jsuites_1.default.translate("Copy") + "...",
            shortcut: "Ctrl + C",
            onclick: function () {
                copyPaste_1.copy.call(worksheet, true);
            },
        });
        // Paste
        if (navigator && navigator.clipboard) {
            items.push({
                title: jsuites_1.default.translate("Paste") + "...",
                shortcut: "Ctrl + V",
                onclick: function () {
                    if (worksheet.selectedCell) {
                        navigator.clipboard.readText().then(function (text) {
                            if (text) {
                                copyPaste_1.paste.call(worksheet, worksheet.selectedCell[0], worksheet.selectedCell[1], text);
                            }
                        });
                    }
                },
            });
        }
    }
    // Save
    if (worksheet.parent.config.allowExport != false) {
        items.push({
            title: jsuites_1.default.translate("Save as") + "...",
            shortcut: "Ctrl + S",
            onclick: function () {
                worksheet.download();
            },
        });
    }
    // About
    if (worksheet.parent.config.about != false) {
        items.push({
            title: jsuites_1.default.translate("About"),
            onclick: function () {
                if (typeof worksheet.parent.config.about === "undefined" ||
                    worksheet.parent.config.about === true) {
                    alert(version_1.default.print());
                }
                else {
                    alert(worksheet.parent.config.about);
                }
            },
        });
    }
    return items;
};
const getElementIndex = function (element) {
    var _a;
    const parentChildren = (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.children;
    if (!parentChildren)
        return -1;
    for (let i = 0; i < parentChildren.length; i++) {
        const currentElement = parentChildren[i];
        if (element === currentElement) {
            return i;
        }
    }
    return -1;
};
const contextMenuControls = function (e) {
    e = e || window.event;
    if ("buttons" in e) {
        var mouseButton = e.buttons;
    }
    else {
        var mouseButton = e.which || e.button;
    }
    if (libraryBase_1.default.jspreadsheet.current) {
        const spreadsheet = libraryBase_1.default.jspreadsheet.current.parent;
        if (libraryBase_1.default.jspreadsheet.current.edition) {
            e.preventDefault();
        }
        else {
            spreadsheet.contextMenu.contextmenu.close();
            if (libraryBase_1.default.jspreadsheet.current) {
                const targetEl = e.target || null;
                if (!targetEl)
                    return;
                const role = getRole(targetEl);
                let x = null, y = null;
                if (role === "cell") {
                    let cellElement = targetEl;
                    while (cellElement && cellElement.tagName !== "TD") {
                        cellElement = cellElement.parentElement;
                    }
                    if (!cellElement)
                        return;
                    y = cellElement.getAttribute("data-y");
                    x = cellElement.getAttribute("data-x");
                    if (!libraryBase_1.default.jspreadsheet.current.selectedCell ||
                        x < parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[0]) ||
                        x > parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[2]) ||
                        y < parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[1]) ||
                        y > parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[3])) {
                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, x, y, x, y, e);
                    }
                }
                else if (role === "row" || role === "header") {
                    if (role === "row") {
                        y = targetEl.getAttribute("data-y");
                    }
                    else {
                        x = targetEl.getAttribute("data-x");
                    }
                    if (!libraryBase_1.default.jspreadsheet.current.selectedCell ||
                        x < parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[0]) ||
                        x > parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[2]) ||
                        y < parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[1]) ||
                        y > parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[3])) {
                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, x, y, x, y, e);
                    }
                }
                else if (role === "nested") {
                    const columns = targetEl.getAttribute("data-column").split(",");
                    x = getElementIndex(targetEl) - 1;
                    y = getElementIndex(targetEl.parentElement);
                    if (!libraryBase_1.default.jspreadsheet.current.selectedCell ||
                        columns[0] !=
                            parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[0]) ||
                        columns[columns.length - 1] !=
                            parseInt(libraryBase_1.default.jspreadsheet.current.selectedCell[2]) ||
                        libraryBase_1.default.jspreadsheet.current.selectedCell[1] != null ||
                        libraryBase_1.default.jspreadsheet.current.selectedCell[3] != null) {
                        selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, columns[0], 0, columns[columns.length - 1], libraryBase_1.default.jspreadsheet.current.options.data.length - 1, e);
                    }
                }
                else if (role === "select-all") {
                    selection_1.selectAll.call(libraryBase_1.default.jspreadsheet.current);
                }
                else if (role === "tabs") {
                    x = getElementIndex(targetEl);
                }
                else if (role === "footer") {
                    x = getElementIndex(targetEl) - 1;
                    y = getElementIndex(targetEl.parentElement);
                }
                // Table found
                let items = defaultContextMenu(libraryBase_1.default.jspreadsheet.current, parseInt(x), parseInt(y), role);
                if (typeof spreadsheet.config.contextMenu === "function") {
                    const result = spreadsheet.config.contextMenu(libraryBase_1.default.jspreadsheet.current, x, y, e, items, role, x, y);
                    if (result) {
                        items = result;
                    }
                    else if (result === false) {
                        return;
                    }
                }
                // Plugins may provide their own contextMenu hook. Narrow from unknown
                // and validate the return value instead of using `any`.
                const isPluginWithContextMenu = (p) => {
                    if (typeof p !== "object" || p === null)
                        return false;
                    const c = p["contextMenu"];
                    return typeof c === "function";
                };
                if (typeof spreadsheet.plugins === "object" && spreadsheet.plugins !== null) {
                    for (const plugin of Object.values(spreadsheet.plugins)) {
                        if (isPluginWithContextMenu(plugin)) {
                            const result = plugin.contextMenu(libraryBase_1.default.jspreadsheet.current, x !== null ? parseInt(x) : null, y !== null ? parseInt(y) : null, e, items, role, x !== null ? parseInt(x) : null, y !== null ? parseInt(y) : null);
                            if (result === false) {
                                // Plugin vetoes the menu; abort
                                return;
                            }
                            if (Array.isArray(result)) {
                                items = result;
                            }
                        }
                    }
                }
                // The id is depending on header and body
                spreadsheet.contextMenu.contextmenu.open(e, items);
                // Avoid the real one
                e.preventDefault();
            }
        }
    }
};
const touchStartControls = function (e) {
    const jssTable = getElement(e.target);
    if (jssTable[0]) {
        if (libraryBase_1.default.jspreadsheet.current != jssTable[0].jssWorksheet) {
            if (libraryBase_1.default.jspreadsheet.current) {
                libraryBase_1.default.jspreadsheet.current.resetSelection();
            }
            libraryBase_1.default.jspreadsheet.current = jssTable[0].jssWorksheet;
        }
    }
    else {
        if (libraryBase_1.default.jspreadsheet.current) {
            libraryBase_1.default.jspreadsheet.current.resetSelection();
            libraryBase_1.default.jspreadsheet.current = null;
        }
    }
    if (libraryBase_1.default.jspreadsheet.current) {
        if (!libraryBase_1.default.jspreadsheet.current.edition) {
            const target = e.target;
            const columnAttr = target.getAttribute("data-x");
            const rowAttr = target.getAttribute("data-y");
            const columnId = columnAttr != null ? parseInt(columnAttr, 10) : null;
            const rowId = rowAttr != null ? parseInt(rowAttr, 10) : null;
            if (columnId !== null && rowId !== null) {
                selection_1.updateSelectionFromCoords.call(libraryBase_1.default.jspreadsheet.current, columnId, rowId, columnId, rowId);
                libraryBase_1.default.jspreadsheet.timeControl = setTimeout(function () {
                    if (libraryBase_1.default.jspreadsheet.current.options.columns[columnId].type ==
                        "color") {
                        libraryBase_1.default.jspreadsheet.tmpElement = null;
                    }
                    else {
                        libraryBase_1.default.jspreadsheet.tmpElement = target;
                    }
                    editor_1.openEditor.call(libraryBase_1.default.jspreadsheet.current, target, false, e);
                }, 500);
            }
        }
    }
};
const touchEndControls = function (e) {
    // Clear any time control
    if (libraryBase_1.default.jspreadsheet.timeControl) {
        clearTimeout(libraryBase_1.default.jspreadsheet.timeControl);
        libraryBase_1.default.jspreadsheet.timeControl = null;
        // Element
        if (libraryBase_1.default.jspreadsheet.tmpElement &&
            libraryBase_1.default.jspreadsheet.tmpElement.children[0].tagName == "INPUT") {
            libraryBase_1.default.jspreadsheet.tmpElement.children[0].focus();
        }
        libraryBase_1.default.jspreadsheet.tmpElement = null;
    }
};
const cutControls = function (e) {
    if (libraryBase_1.default.jspreadsheet.current) {
        if (!libraryBase_1.default.jspreadsheet.current.edition) {
            copyPaste_1.copy.call(libraryBase_1.default.jspreadsheet.current, true, undefined, undefined, undefined, undefined, true);
            if (libraryBase_1.default.jspreadsheet.current.options.editable != false) {
                libraryBase_1.default.jspreadsheet.current.setValue(libraryBase_1.default.jspreadsheet.current.highlighted.map(function (record) {
                    return record.element;
                }), "");
            }
        }
    }
};
exports.cutControls = cutControls;
const copyControls = function (e) {
    if (libraryBase_1.default.jspreadsheet.current) {
        if (!libraryBase_1.default.jspreadsheet.current.edition) {
            copyPaste_1.copy.call(libraryBase_1.default.jspreadsheet.current, true);
        }
    }
};
const isMac = function () {
    return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};
const isCtrl = function (e) {
    if (isMac()) {
        return e.metaKey;
    }
    else {
        return e.ctrlKey;
    }
};
const keyDownControls = function (e) {
    if (libraryBase_1.default.jspreadsheet.current) {
        if (libraryBase_1.default.jspreadsheet.current.edition) {
            if (e.which == 27) {
                // Escape
                if (libraryBase_1.default.jspreadsheet.current.edition) {
                    // Exit without saving
                    editor_1.closeEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.edition[0], false);
                }
                e.preventDefault();
            }
            else if (e.which == 13) {
                // Enter
                if (libraryBase_1.default.jspreadsheet.current.options.columns &&
                    libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]] &&
                    libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]].type == "calendar") {
                    editor_1.closeEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.edition[0], true);
                }
                else if (libraryBase_1.default.jspreadsheet.current.options.columns &&
                    libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]] &&
                    libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]].type == "dropdown") {
                    // Do nothing
                }
                else {
                    // Alt enter -> do not close editor
                    if ((libraryBase_1.default.jspreadsheet.current.options.wordWrap == true ||
                        (libraryBase_1.default.jspreadsheet.current.options.columns &&
                            libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]] &&
                            libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]].wordWrap == true) ||
                        (libraryBase_1.default.jspreadsheet.current.options.data[libraryBase_1.default.jspreadsheet.current.edition[3]][libraryBase_1.default.jspreadsheet.current.edition[2]] &&
                            libraryBase_1.default.jspreadsheet.current.options.data[libraryBase_1.default.jspreadsheet.current.edition[3]][libraryBase_1.default.jspreadsheet.current.edition[2]].length > 200)) &&
                        e.altKey) {
                        // Add new line to the editor
                        const editorTextarea = libraryBase_1.default.jspreadsheet.current.edition[0].children[0];
                        let editorValue = libraryBase_1.default.jspreadsheet.current.edition[0].children[0].value;
                        const editorIndexOf = editorTextarea.selectionStart;
                        editorValue =
                            editorValue.slice(0, editorIndexOf) +
                                "\n" +
                                editorValue.slice(editorIndexOf);
                        editorTextarea.value = editorValue;
                        editorTextarea.focus();
                        editorTextarea.selectionStart = editorIndexOf + 1;
                        editorTextarea.selectionEnd = editorIndexOf + 1;
                    }
                    else {
                        libraryBase_1.default.jspreadsheet.current.edition[0].children[0].blur();
                    }
                }
            }
            else if (e.which == 9) {
                // Tab
                if (libraryBase_1.default.jspreadsheet.current.options.columns &&
                    libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]] &&
                    ["calendar", "html"].includes(libraryBase_1.default.jspreadsheet.current.options.columns[libraryBase_1.default.jspreadsheet.current.edition[2]].type)) {
                    editor_1.closeEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.edition[0], true);
                }
                else {
                    libraryBase_1.default.jspreadsheet.current.edition[0].children[0].blur();
                }
            }
        }
        if (!libraryBase_1.default.jspreadsheet.current.edition &&
            libraryBase_1.default.jspreadsheet.current.selectedCell) {
            // Which key
            if (e.which == 37) {
                keys_1.left.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 39) {
                keys_1.right.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 38) {
                keys_1.up.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 40) {
                keys_1.down.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 36) {
                keys_1.first.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 35) {
                keys_1.last.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 46 || e.which == 8) {
                // Delete
                if (libraryBase_1.default.jspreadsheet.current.options.editable != false) {
                    if (libraryBase_1.default.jspreadsheet.current.selectedRow != null) {
                        if (libraryBase_1.default.jspreadsheet.current.options.allowDeleteRow != false) {
                            if (confirm(jsuites_1.default.translate("Are you sure to delete the selected rows?"))) {
                                libraryBase_1.default.jspreadsheet.current.deleteRow();
                            }
                        }
                    }
                    else if (libraryBase_1.default.jspreadsheet.current.selectedHeader) {
                        if (libraryBase_1.default.jspreadsheet.current.options.allowDeleteColumn !=
                            false) {
                            if (confirm(jsuites_1.default.translate("Are you sure to delete the selected columns?"))) {
                                libraryBase_1.default.jspreadsheet.current.deleteColumn();
                            }
                        }
                    }
                    else {
                        // Change value
                        libraryBase_1.default.jspreadsheet.current.setValue(libraryBase_1.default.jspreadsheet.current.highlighted.map(function (record) {
                            return record.element;
                        }), "");
                    }
                }
            }
            else if (e.which == 13) {
                // Move cursor
                if (e.shiftKey) {
                    keys_1.up.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                }
                else {
                    if (libraryBase_1.default.jspreadsheet.current.options.allowInsertRow != false) {
                        if (libraryBase_1.default.jspreadsheet.current.options.allowManualInsertRow !=
                            false) {
                            if (libraryBase_1.default.jspreadsheet.current.selectedCell[1] ==
                                libraryBase_1.default.jspreadsheet.current.options.data.length - 1) {
                                // New record in case selectedCell in the last row
                                libraryBase_1.default.jspreadsheet.current.insertRow();
                            }
                        }
                    }
                    keys_1.down.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                }
                e.preventDefault();
            }
            else if (e.which == 9) {
                // Tab
                if (e.shiftKey) {
                    keys_1.left.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                }
                else {
                    if (libraryBase_1.default.jspreadsheet.current.options.allowInsertColumn != false) {
                        if (libraryBase_1.default.jspreadsheet.current.options
                            .allowManualInsertColumn != false) {
                            if (libraryBase_1.default.jspreadsheet.current.selectedCell[0] ==
                                libraryBase_1.default.jspreadsheet.current.options.data[0].length - 1) {
                                // New record in case selectedCell in the last column
                                libraryBase_1.default.jspreadsheet.current.insertColumn();
                            }
                        }
                    }
                    keys_1.right.call(libraryBase_1.default.jspreadsheet.current, e.shiftKey, e.ctrlKey);
                }
                e.preventDefault();
            }
            else {
                if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                    if (e.which == 65) {
                        // Ctrl + A
                        selection_1.selectAll.call(libraryBase_1.default.jspreadsheet.current);
                        e.preventDefault();
                    }
                    else if (e.which == 83) {
                        // Ctrl + S
                        libraryBase_1.default.jspreadsheet.current.download();
                        e.preventDefault();
                    }
                    else if (e.which == 89) {
                        // Ctrl + Y
                        libraryBase_1.default.jspreadsheet.current.redo();
                        e.preventDefault();
                    }
                    else if (e.which == 90) {
                        // Ctrl + Z
                        libraryBase_1.default.jspreadsheet.current.undo();
                        e.preventDefault();
                    }
                    else if (e.which == 67) {
                        // Ctrl + C
                        copyPaste_1.copy.call(libraryBase_1.default.jspreadsheet.current, true);
                        e.preventDefault();
                    }
                    else if (e.which == 88) {
                        // Ctrl + X
                        if (libraryBase_1.default.jspreadsheet.current.options.editable != false) {
                            exports.cutControls.call(libraryBase_1.default.jspreadsheet.current, e);
                        }
                        else {
                            copyControls.call(libraryBase_1.default.jspreadsheet.current, e);
                        }
                        e.preventDefault();
                    }
                    else if (e.which == 86) {
                        // Ctrl + V
                        pasteControls.call(libraryBase_1.default.jspreadsheet.current, e);
                    }
                }
                else {
                    if (libraryBase_1.default.jspreadsheet.current.selectedCell) {
                        if (libraryBase_1.default.jspreadsheet.current.options.editable != false) {
                            const rowId = libraryBase_1.default.jspreadsheet.current.selectedCell[1];
                            const columnId = libraryBase_1.default.jspreadsheet.current.selectedCell[0];
                            // Characters able to start a edition
                            if (e.keyCode == 32) {
                                // Space
                                e.preventDefault();
                                if (libraryBase_1.default.jspreadsheet.current.options.columns[columnId]
                                    .type == "checkbox" ||
                                    libraryBase_1.default.jspreadsheet.current.options.columns[columnId]
                                        .type == "radio") {
                                    editor_1.setCheckRadioValue.call(libraryBase_1.default.jspreadsheet.current);
                                }
                                else {
                                    // Start edition
                                    editor_1.openEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.records[rowId][columnId]
                                        .element, true, e);
                                }
                            }
                            else if (e.keyCode == 113) {
                                // Start edition with current content F2
                                editor_1.openEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.records[rowId][columnId]
                                    .element, false, e);
                            }
                            else if ((e.key.length === 1 || e.key === "Process") &&
                                !(e.altKey || isCtrl(e))) {
                                // Start edition
                                editor_1.openEditor.call(libraryBase_1.default.jspreadsheet.current, libraryBase_1.default.jspreadsheet.current.records[rowId][columnId]
                                    .element, true, e);
                                // Prevent entries in the calendar
                                if (libraryBase_1.default.jspreadsheet.current.options.columns &&
                                    libraryBase_1.default.jspreadsheet.current.options.columns[columnId] &&
                                    libraryBase_1.default.jspreadsheet.current.options.columns[columnId]
                                        .type == "calendar") {
                                    e.preventDefault();
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            if (e.target.classList.contains("jss_search")) {
                if (libraryBase_1.default.jspreadsheet.timeControl) {
                    clearTimeout(libraryBase_1.default.jspreadsheet.timeControl);
                }
                libraryBase_1.default.jspreadsheet.timeControl = setTimeout(function () {
                    libraryBase_1.default.jspreadsheet.current.search(e.target.value);
                }, 200);
            }
        }
    }
};
const wheelControls = function (e) {
    const obj = this;
    if (obj.options.lazyLoading == true) {
        if (libraryBase_1.default.jspreadsheet.timeControlLoading == null) {
            libraryBase_1.default.jspreadsheet.timeControlLoading = setTimeout(function () {
                if (obj.content.scrollTop + obj.content.clientHeight >=
                    obj.content.scrollHeight - 10) {
                    if (lazyLoading_1.loadDown.call(obj)) {
                        if (obj.content.scrollTop + obj.content.clientHeight >
                            obj.content.scrollHeight - 10) {
                            obj.content.scrollTop =
                                obj.content.scrollTop - obj.content.clientHeight;
                        }
                        selection_1.updateCornerPosition.call(obj);
                    }
                }
                else if (obj.content.scrollTop <= obj.content.clientHeight) {
                    if (lazyLoading_1.loadUp.call(obj)) {
                        if (obj.content.scrollTop < 10) {
                            obj.content.scrollTop =
                                obj.content.scrollTop + obj.content.clientHeight;
                        }
                        selection_1.updateCornerPosition.call(obj);
                    }
                }
                libraryBase_1.default.jspreadsheet.timeControlLoading = null;
            }, 100);
        }
    }
};
exports.wheelControls = wheelControls;
let scrollLeft = 0;
const updateFreezePosition = function () {
    const obj = this;
    scrollLeft = obj.content.scrollLeft;
    let width = 0;
    if (scrollLeft > 50) {
        for (let i = 0; i < obj.options.freezeColumns; i++) {
            if (i > 0) {
                // Must check if the previous column is hidden or not to determin whether the width shoule be added or not!
                if (!obj.options.columns ||
                    !obj.options.columns[i - 1] ||
                    obj.options.columns[i - 1].type !== "hidden") {
                    let columnWidth;
                    if (obj.options.columns &&
                        obj.options.columns[i - 1] &&
                        obj.options.columns[i - 1].width !== undefined) {
                        columnWidth = parseInt(obj.options.columns[i - 1].width);
                    }
                    else {
                        columnWidth =
                            obj.options.defaultColWidth !== undefined
                                ? parseInt(obj.options.defaultColWidth)
                                : 100;
                    }
                    width += columnWidth;
                }
            }
            obj.headers[i].classList.add("jss_freezed");
            obj.headers[i].style.left = width + "px";
            for (let j = 0; j < obj.rows.length; j++) {
                if (obj.rows[j] && obj.records[j][i]) {
                    const shifted = scrollLeft +
                        (i > 0 ? obj.records[j][i - 1].element.style.width : 0) -
                        51 +
                        "px";
                    obj.records[j][i].element.classList.add("jss_freezed");
                    obj.records[j][i].element.style.left = shifted;
                }
            }
        }
    }
    else {
        for (let i = 0; i < obj.options.freezeColumns; i++) {
            obj.headers[i].classList.remove("jss_freezed");
            obj.headers[i].style.left = "";
            for (let j = 0; j < obj.rows.length; j++) {
                if (obj.records[j][i]) {
                    obj.records[j][i].element.classList.remove("jss_freezed");
                    obj.records[j][i].element.style.left = "";
                }
            }
        }
    }
    // Place the corner in the correct place
    selection_1.updateCornerPosition.call(obj);
};
const scrollControls = function (e) {
    const obj = this;
    exports.wheelControls.call(obj, e);
    if (obj.options.freezeColumns > 0 && obj.content.scrollLeft != scrollLeft) {
        updateFreezePosition.call(obj);
    }
    // Close editor
    if (obj.options.lazyLoading == true || obj.options.tableOverflow == true) {
        if (obj.edition && e.target.className.substr(0, 9) != "jdropdown") {
            editor_1.closeEditor.call(obj, obj.edition[0], true);
        }
    }
};
exports.scrollControls = scrollControls;
const setEvents = function (root) {
    (0, exports.destroyEvents)(root);
    root.addEventListener("mouseup", mouseUpControls);
    root.addEventListener("mousedown", mouseDownControls);
    root.addEventListener("mousemove", mouseMoveControls);
    root.addEventListener("mouseover", mouseOverControls);
    root.addEventListener("dblclick", doubleClickControls);
    root.addEventListener("paste", pasteControls);
    root.addEventListener("contextmenu", contextMenuControls);
    root.addEventListener("touchstart", touchStartControls);
    root.addEventListener("touchend", touchEndControls);
    root.addEventListener("touchcancel", touchEndControls);
    root.addEventListener("touchmove", touchEndControls);
    document.addEventListener("keydown", keyDownControls);
};
exports.setEvents = setEvents;
const destroyEvents = function (root) {
    root.removeEventListener("mouseup", mouseUpControls);
    root.removeEventListener("mousedown", mouseDownControls);
    root.removeEventListener("mousemove", mouseMoveControls);
    root.removeEventListener("mouseover", mouseOverControls);
    root.removeEventListener("dblclick", doubleClickControls);
    root.removeEventListener("paste", pasteControls);
    root.removeEventListener("contextmenu", contextMenuControls);
    root.removeEventListener("touchstart", touchStartControls);
    root.removeEventListener("touchend", touchEndControls);
    root.removeEventListener("touchcancel", touchEndControls);
    document.removeEventListener("keydown", keyDownControls);
};
exports.destroyEvents = destroyEvents;
