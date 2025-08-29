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
const getAttrSafe = (el, name) => {
    var _a;
    const elh = getHTMLElement(el);
    return (_a = elh === null || elh === void 0 ? void 0 : elh.getAttribute(name)) !== null && _a !== void 0 ? _a : "";
};
const getAttrInt = (el, name) => parseInt(getAttrSafe(el, name), 10);
const getHTMLElement = (element) => element instanceof HTMLElement ? element : null;
// Narrow mouse button from various event shapes (MouseEvent, legacy event)
const getMouseButton = (ev) => {
    if (!ev || typeof ev !== "object")
        return undefined;
    const e = ev;
    if (typeof e.buttons === "number")
        return e.buttons;
    if (typeof e.button === "number")
        return e.button;
    if (typeof e.which === "number")
        return e.which;
    return undefined;
};
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
    var _a, _b, _c, _d, _e, _f, _g;
    const current = libraryBase_1.default.jspreadsheet.current;
    if (current) {
        // Update cell size
        if (current.resizing) {
            const r = current.resizing;
            // Columns to be updated when a numeric column index is present
            if (typeof r.column === "number") {
                const colIndex = r.column;
                // New width
                const newWidth = getAttrInt(current.cols[colIndex].colElement, "width");
                // Columns
                const columns = (_b = (_a = current.getSelectedColumns) === null || _a === void 0 ? void 0 : _a.call(current)) !== null && _b !== void 0 ? _b : [];
                if (columns.length > 1) {
                    const currentWidth = [];
                    for (let i = 0; i < columns.length; i++) {
                        currentWidth.push(getAttrInt(current.cols[columns[i]].colElement, "width"));
                    }
                    const index = columns.indexOf(colIndex);
                    currentWidth[index] = (_d = (_c = r.width) !== null && _c !== void 0 ? _c : currentWidth[index]) !== null && _d !== void 0 ? _d : 0;
                    columns_1.setWidth.call(current, columns, newWidth, currentWidth);
                }
                else {
                    columns_1.setWidth.call(current, colIndex, newWidth, r.width);
                }
                // Remove border
                current.headers[colIndex].classList.remove("resizing");
                for (let j = 0; j < current.records.length; j++) {
                    if (current.records[j][colIndex]) {
                        current.records[j][colIndex].element.classList.remove("resizing");
                    }
                }
            }
            else {
                // Row resize
                const rowIndex = r.row;
                current.rows[rowIndex].element.children[0].classList.remove("resizing");
                const newHeight = getAttrInt(current.rows[rowIndex].element, "height");
                rows_1.setHeight.call(current, rowIndex, newHeight, r.height);
                // Remove border
                (_e = r.element) === null || _e === void 0 ? void 0 : _e.classList.remove("resizing");
            }
            // Reset resizing helper
            current.resizing = null;
        }
        else if (current.dragging) {
            // Reset dragging helper
            const d = current.dragging;
            if (d) {
                if (typeof d.column === "number") {
                    // Target
                    const columnIdAttr = getAttrSafe(e.target, "data-x");
                    const columnId = columnIdAttr ? parseInt(columnIdAttr, 10) : undefined;
                    const dragCol = d.column;
                    // Remove move style
                    current.headers[dragCol].classList.remove("dragging");
                    for (let j = 0; j < current.rows.length; j++) {
                        if (current.records[j][dragCol]) {
                            current.records[j][dragCol].element.classList.remove("dragging");
                        }
                    }
                    for (let i = 0; i < current.headers.length; i++) {
                        current.headers[i].classList.remove("dragging-left");
                        current.headers[i].classList.remove("dragging-right");
                    }
                    // Update position
                    if (columnId !== undefined) {
                        if (typeof d.destination === "number" && dragCol != d.destination) {
                            (_f = current.moveColumn) === null || _f === void 0 ? void 0 : _f.call(current, dragCol, d.destination);
                        }
                    }
                }
                else {
                    let position;
                    const elem = d.element;
                    if (elem && elem.nextSibling) {
                        position = parseInt(elem.nextSibling.getAttribute("data-y"), 10);
                        if (d.row < position) {
                            position -= 1;
                        }
                    }
                    else if (elem && elem.previousSibling) {
                        position = parseInt(elem.previousSibling.getAttribute("data-y"), 10);
                    }
                    else {
                        position = d.destination;
                    }
                    if (d.row != d.destination) {
                        rows_1.moveRow.call(current, d.row, position, true);
                    }
                    elem === null || elem === void 0 ? void 0 : elem.classList.remove("dragging");
                }
                current.dragging = null;
            }
        }
        else {
            // Close any corner selection
            if (current.selectedCorner) {
                current.selectedCorner = false;
                // Data to be copied (guard selection before use)
                const selection = (_g = current.selection) !== null && _g !== void 0 ? _g : [];
                if (selection.length > 0) {
                    // Copy data
                    selection_1.copyData.call(current, selection[0], selection[selection.length - 1]);
                    // Remove selection
                    selection_1.removeCopySelection.call(current);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
    let current = libraryBase_1.default.jspreadsheet.current;
    if (jssTable[0]) {
        if (current != jssTable[0].jssWorksheet) {
            if (current) {
                if (current.edition) {
                    editor_1.closeEditor.call(current, current.edition[0], true);
                }
                (_a = current.resetSelection) === null || _a === void 0 ? void 0 : _a.call(current);
            }
            libraryBase_1.default.jspreadsheet.current = jssTable[0].jssWorksheet;
            current = libraryBase_1.default.jspreadsheet.current;
        }
    }
    else {
        if (current) {
            if (current.edition) {
                editor_1.closeEditor.call(current, current.edition[0], true);
            }
            if (!target.classList.contains("jss_object")) {
                selection_1.resetSelection.call(current, true);
                libraryBase_1.default.jspreadsheet.current = null;
                current = null;
            }
        }
    }
    if (current && mouseButton == 1) {
        // Narrow common optional properties for safer access
        const data = (_b = current.options.data) !== null && _b !== void 0 ? _b : [];
        const dataRows = data.length;
        const dataCols = (data[0] ? data[0].length : 0);
        const columns = (_c = current.options.columns) !== null && _c !== void 0 ? _c : [];
        const columnResize = current.options.columnResize != false;
        const columnDrag = current.options.columnDrag != false;
        const rowResize = current.options.rowResize != false;
        const rowDrag = current.options.rowDrag != false;
        const search = current.options.search == true;
        const allowRenameColumn = current.options.allowRenameColumn != false;
        if (target.classList.contains("jss_selectall")) {
            if (current) {
                selection_1.selectAll.call(current);
            }
        }
        else if (target.classList.contains("jss_corner")) {
            if (current.options.editable != false) {
                current.selectedCorner = true;
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
                    if (columnResize &&
                        info.width - e.offsetX < 6) {
                        // Resize helper
                        current.resizing = {
                            mousePosition: e.pageX,
                            column: columnId,
                            width: info.width,
                        };
                        // Border indication
                        current.headers[columnId].classList.add("resizing");
                        for (let j = 0; j < current.records.length; j++) {
                            if (current.records[j][columnId]) {
                                current.records[j][columnId].element.classList.add("resizing");
                            }
                        }
                    }
                    else if (columnDrag &&
                        info.height - e.offsetY < 6) {
                        if (merges_1.isColMerged.call(current, columnId).length) {
                            console.error("Jspreadsheet: This column is part of a merged cell.");
                        }
                        else {
                            // Reset selection
                            (_d = current.resetSelection) === null || _d === void 0 ? void 0 : _d.call(current);
                            // Drag helper
                            current.dragging = {
                                element: target,
                                column: columnId,
                                destination: columnId,
                            };
                            // Border indication
                            current.headers[columnId].classList.add("dragging");
                            for (let j = 0; j < current.records.length; j++) {
                                if (current.records[j][columnId]) {
                                    current.records[j][columnId].element.classList.add("dragging");
                                }
                            }
                        }
                    }
                    else {
                        let o, d;
                        if (current.selectedHeader && (e.shiftKey || e.ctrlKey)) {
                            o = current.selectedHeader;
                            d = columnId;
                        }
                        else {
                            // Press to rename
                            if (current.selectedHeader == columnId &&
                                allowRenameColumn) {
                                libraryBase_1.default.jspreadsheet.timeControl = setTimeout(function () {
                                    var _a;
                                    (_a = current.setHeader) === null || _a === void 0 ? void 0 : _a.call(current, columnId);
                                }, 800);
                            }
                            // Keep track of which header was selected first
                            current.selectedHeader = columnId;
                            // Update selection single column
                            o = columnId;
                            d = columnId;
                        }
                        const oNum = typeof o === "number" ? o : 0;
                        const dNum = typeof d === "number" ? d : 0;
                        selection_1.updateSelectionFromCoords.call(current, oNum, 0, dNum, dataRows - 1, e);
                    }
                }
                else {
                    if ((_e = target.parentElement) === null || _e === void 0 ? void 0 : _e.classList.contains("jss_nested")) {
                        let c1, c2;
                        if (target.getAttribute("data-column")) {
                            const column = (target.getAttribute("data-column") || "").split(",");
                            c1 = parseInt(column[0]);
                            c2 = parseInt(column[column.length - 1]);
                        }
                        else {
                            c1 = 0;
                            c2 = columns.length - 1;
                        }
                        selection_1.updateSelectionFromCoords.call(current, c1, 0, c2, dataRows - 1, e);
                    }
                }
            }
            else {
                current.selectedHeader = false;
            }
            // Body found
            if (jssTable[1] == 2) {
                const rowIdAttr = target.getAttribute("data-y");
                const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
                if (target.classList.contains("jss_row")) {
                    const info = target.getBoundingClientRect();
                    if (rowResize &&
                        info.height - e.offsetY < 6) {
                        // Resize helper
                        current.resizing = {
                            element: target.parentElement,
                            mousePosition: e.pageY,
                            row: rowId,
                            height: info.height,
                        };
                        // Border indication
                        (_f = target.parentElement) === null || _f === void 0 ? void 0 : _f.classList.add("resizing");
                    }
                    else if (rowDrag &&
                        info.width - e.offsetX < 6) {
                        if (typeof rowId === "number" && merges_1.isRowMerged.call(current, rowId, false).length) {
                            console.error("Jspreadsheet: This row is part of a merged cell");
                        }
                        else if (search && current.results) {
                            console.error("Jspreadsheet: Please clear your search before perform this action");
                        }
                        else {
                            // Reset selection
                            (_g = current.resetSelection) === null || _g === void 0 ? void 0 : _g.call(current);
                            // Drag helper
                            current.dragging = {
                                element: target.parentElement,
                                row: rowId,
                                destination: rowId,
                            };
                            // Border indication
                            (_h = target.parentElement) === null || _h === void 0 ? void 0 : _h.classList.add("dragging");
                        }
                    }
                    else {
                        let o, d;
                        if (current.selectedRow != null && (e.shiftKey || e.ctrlKey)) {
                            o = current.selectedRow;
                            d = rowId;
                        }
                        else {
                            // Keep track of which header was selected first
                            current.selectedRow = rowId;
                            // Update selection single column
                            o = rowId;
                            d = rowId;
                        }
                        // Update selection
                        if (typeof o === "number" && typeof d === "number") {
                            selection_1.updateSelectionFromCoords.call(current, 0, o, dataCols - 1, d, e);
                        }
                    }
                }
                else {
                    // Jclose
                    if (target.classList.contains("jclose") &&
                        target.clientWidth - e.offsetX < 50 &&
                        e.offsetY < 50) {
                        editor_1.closeEditor.call(current, current.edition[0], true);
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
                        const position = getCellCoords(target);
                        if (position) {
                            const columnId = parseInt(position[0]);
                            const rowId = parseInt(position[1]);
                            // Close edition
                            if (current.edition) {
                                if (current.edition[2] != columnId || current.edition[3] != rowId) {
                                    editor_1.closeEditor.call(current, current.edition[0], true);
                                }
                            }
                            if (!current.edition) {
                                // Update cell selection
                                if (e.shiftKey && current.selectedCell) {
                                    selection_1.updateSelectionFromCoords.call(current, current.selectedCell[0], current.selectedCell[1], columnId, rowId, e);
                                }
                                else {
                                    selection_1.updateSelectionFromCoords.call(current, columnId, rowId, columnId, rowId, e);
                                }
                            }
                            // No full row selected
                            current.selectedHeader = null;
                            current.selectedRow = null;
                        }
                    }
                }
            }
            else {
                current.selectedRow = false;
            }
            // Pagination
            if (target.classList.contains("jss_page")) {
                if (target.textContent == "<") {
                    (_j = current.page) === null || _j === void 0 ? void 0 : _j.call(current, 0);
                }
                else if (target.textContent == ">") {
                    const titleAttr = target.getAttribute("title");
                    (_k = current.page) === null || _k === void 0 ? void 0 : _k.call(current, titleAttr !== null ? parseInt(titleAttr, 10) - 1 : 0);
                }
                else {
                    (_l = current.page) === null || _l === void 0 ? void 0 : _l.call(current, target.textContent ? parseInt(target.textContent, 10) - 1 : 0);
                }
            }
        }
        if (current.edition) {
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
    // Narrow event target to HTMLElement for safe DOM access
    const target = getHTMLElement(e.target);
    if (!target) {
        libraryBase_1.default.jspreadsheet.isMouseAction = false;
        return;
    }
    const current = libraryBase_1.default.jspreadsheet.current;
    if (current) {
        if (libraryBase_1.default.jspreadsheet.isMouseAction == true) {
            // Resizing is ongoing
            if (current.resizing) {
                if (current.resizing.column) {
                    const width = e.pageX - ((_a = current.resizing.mousePosition) !== null && _a !== void 0 ? _a : 0);
                    if (((_b = current.resizing.width) !== null && _b !== void 0 ? _b : 0) + width > 0) {
                        const tempWidth = ((_c = current.resizing.width) !== null && _c !== void 0 ? _c : 0) + width;
                        const columnIndex = current.resizing.column;
                        if (typeof columnIndex === "number" && current.cols[columnIndex]) {
                            current.cols[columnIndex].colElement.setAttribute("width", tempWidth.toString());
                        }
                        selection_1.updateCornerPosition.call(current);
                    }
                }
                else {
                    const height = e.pageY - ((_d = current.resizing.mousePosition) !== null && _d !== void 0 ? _d : 0);
                    if (((_e = current.resizing.height) !== null && _e !== void 0 ? _e : 0) + height > 0) {
                        const tempHeight = ((_f = current.resizing.height) !== null && _f !== void 0 ? _f : 0) + height;
                        const rowIndex = current.resizing.row;
                        if (typeof rowIndex === "number" && current.rows[rowIndex]) {
                            current.rows[rowIndex].element.setAttribute("height", tempHeight.toString());
                        }
                        selection_1.updateCornerPosition.call(current);
                    }
                }
            }
            else if (current.dragging) {
                if (current.dragging.column) {
                    const columnIdAttr = target.getAttribute("data-x");
                    const columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
                    if (columnId !== undefined) {
                        if (merges_1.isColMerged.call(current, columnId).length) {
                            console.error("Jspreadsheet: This column is part of a merged cell.");
                        }
                        else {
                            for (let i = 0; i < current.headers.length; i++) {
                                current.headers[i].classList.remove("dragging-left");
                                current.headers[i].classList.remove("dragging-right");
                            }
                            if (current.dragging.column == columnId) {
                                current.dragging.destination = columnId;
                            }
                            else {
                                if (target.clientWidth / 2 > e.offsetX) {
                                    if (current.dragging.column < columnId) {
                                        current.dragging.destination = columnId - 1;
                                    }
                                    else {
                                        current.dragging.destination = columnId;
                                    }
                                    current.headers[columnId].classList.add("dragging-left");
                                }
                                else {
                                    if (current.dragging.column < columnId) {
                                        current.dragging.destination = columnId;
                                    }
                                    else {
                                        current.dragging.destination = columnId + 1;
                                    }
                                    current.headers[columnId].classList.add("dragging-right");
                                }
                            }
                        }
                    }
                }
                else {
                    const rowIdAttr = target.getAttribute("data-y");
                    const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
                    if (rowId !== undefined) {
                        if (merges_1.isRowMerged.call(current, rowId, false).length) {
                            console.error("Jspreadsheet: This row is part of a merged cell.");
                        }
                        else {
                            const siblingTarget = target.clientHeight / 2 > e.offsetY
                                ? (_g = target.parentElement) === null || _g === void 0 ? void 0 : _g.nextSibling
                                : target.parentElement;
                            const container = (_h = target.parentElement) === null || _h === void 0 ? void 0 : _h.parentElement;
                            const dragEl = current.dragging.element;
                            if (dragEl && dragEl != siblingTarget && container) {
                                container.insertBefore(dragEl, siblingTarget);
                                if (dragEl.parentNode) {
                                    current.dragging.destination = Array.prototype.indexOf.call(dragEl.parentNode.children, dragEl);
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            const x = target.getAttribute("data-x");
            const y = target.getAttribute("data-y");
            const rect = target.getBoundingClientRect();
            if (current.cursor) {
                current.cursor.style.cursor = "";
                current.cursor = null;
            }
            const grandParent = (_j = target.parentElement) === null || _j === void 0 ? void 0 : _j.parentElement;
            if (grandParent && typeof grandParent.className === "string") {
                if (grandParent.classList.contains("resizable")) {
                    if (target && x && !y && rect.width - (e.clientX - rect.left) < 6) {
                        current.cursor = target;
                        current.cursor.style.cursor = "col-resize";
                    }
                    else if (!x && y && rect.height - (e.clientY - rect.top) < 6) {
                        current.cursor = target;
                        current.cursor.style.cursor = "row-resize";
                    }
                }
                if (grandParent.classList.contains("draggable")) {
                    if (!x && y && rect.width - (e.clientX - rect.left) < 6) {
                        current.cursor = target;
                        current.cursor.style.cursor = "move";
                    }
                    else if (x && !y && rect.height - (e.clientY - rect.top) < 6) {
                        current.cursor = target;
                        current.cursor.style.cursor = "move";
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
    const selectedContainer = obj.selectedContainer;
    if (!selectedContainer || selectedContainer.length < 4)
        return;
    const x1 = selectedContainer[0];
    const y1 = selectedContainer[1];
    const x2 = selectedContainer[2];
    const y2 = selectedContainer[3];
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
            px = parseInt(x1.toString());
            ux = parseInt(x2.toString());
        }
        else {
            py = parseInt(y1.toString());
            uy = parseInt(y2.toString());
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
                    if (obj.selection) {
                        obj.selection.push(obj.records[j][i].element);
                    }
                }
            }
        }
    }
};
const mouseOverControls = function (e) {
    var _a, _b;
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
    const current = libraryBase_1.default.jspreadsheet.current;
    if (current && libraryBase_1.default.jspreadsheet.isMouseAction == true) {
        // Local aliases for optional properties
        const data = (_a = current.options.data) !== null && _a !== void 0 ? _a : [];
        const dataRows = data.length;
        const dataCols = (data[0] ? data[0].length : 0);
        const columns = (_b = current.options.columns) !== null && _b !== void 0 ? _b : [];
        // Narrow event target early
        const target = getHTMLElement(e.target);
        if (!target)
            return false;
        // Get elements
        const jssTable = getElement(target);
        if (jssTable[0]) {
            // Avoid cross reference
            if (current != jssTable[0].jssWorksheet) {
                if (current) {
                    return false;
                }
            }
            const columnIdAttr = target.getAttribute("data-x");
            let columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
            const rowIdAttr = target.getAttribute("data-y");
            const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
            if (current.resizing || current.dragging) {
            }
            else {
                // Header found
                if (jssTable[1] == 1) {
                    if (current.selectedHeader) {
                        const columnIdAttr2 = target.getAttribute("data-x");
                        columnId = columnIdAttr2 !== null ? parseInt(columnIdAttr2, 10) : undefined;
                        const o = current.selectedHeader;
                        const d = columnId;
                        if (typeof d === "number") {
                            // Update selection
                            selection_1.updateSelectionFromCoords.call(current, o, 0, d, dataRows - 1, e);
                        }
                    }
                }
                // Body found
                if (jssTable[1] == 2) {
                    if (target.classList.contains("jss_row")) {
                        if (current.selectedRow != null) {
                            const o = current.selectedRow;
                            const d = rowId;
                            // Update selection
                            if (typeof o === "number" && typeof d === "number") {
                                selection_1.updateSelectionFromCoords.call(current, 0, o, dataCols - 1, d, e);
                            }
                        }
                    }
                    else {
                        // Do not select edtion is in progress
                        if (!current.edition) {
                            if (columnId !== undefined && rowId !== undefined) {
                                if (current.selectedCorner) {
                                    updateCopySelection.call(current, columnId, rowId);
                                }
                                else {
                                    if (current.selectedCell) {
                                        selection_1.updateSelectionFromCoords.call(current, current.selectedCell[0], current.selectedCell[1], columnId, rowId, e);
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
    var _a, _b, _c;
    // Narrow target
    const target = getHTMLElement(e.target);
    if (!target)
        return;
    const current = libraryBase_1.default.jspreadsheet.current;
    if (current) {
        // Local aliases for optional properties
        const data = (_a = current.options.data) !== null && _a !== void 0 ? _a : [];
        const dataRows = data.length;
        const dataCols = (data[0] ? data[0].length : 0);
        const columns = (_b = current.options.columns) !== null && _b !== void 0 ? _b : [];
        const editable = current.options.editable != false;
        const columnSorting = current.options.columnSorting != false;
        // Corner action
        if (target.classList.contains("jss_corner")) {
            // Any selected cells
            if (current.highlighted && current.highlighted.length > 0) {
                // Copy from this
                const x1Str = current.highlighted[0].element.getAttribute("data-x");
                const x1 = x1Str ? parseInt(x1Str, 10) : 0;
                const y1 = parseInt(current.highlighted[current.highlighted.length - 1].element.getAttribute("data-y") || "0") + 1;
                // Until this
                const x2Str = current.highlighted[current.highlighted.length - 1].element.getAttribute("data-x");
                const x2 = x2Str ? parseInt(x2Str, 10) : 0;
                const y2 = current.records.length - 1;
                // Execute copy
                if (current.records[y1] && current.records[y1][x1] && current.records[y2] && current.records[y2][x2]) {
                    selection_1.copyData.call(current, current.records[y1][x1].element, current.records[y2][x2].element);
                }
            }
        }
        else if (target.classList.contains("jss_column_filter")) {
            // Column
            const columnId = target.getAttribute("data-x");
            // Open filter
            if (columnId !== null) {
                filter_1.openFilter.call(current, columnId);
            }
        }
        else {
            // Get table
            const jssTable = getElement(target);
            // Double click over header
            if (jssTable[1] == 1 && columnSorting) {
                // Check valid column header coords
                const columnId = target.getAttribute("data-x");
                if (columnId) {
                    (_c = current.orderBy) === null || _c === void 0 ? void 0 : _c.call(current, parseInt(columnId));
                }
            }
            // Double click over body
            if (jssTable[1] == 2 && editable) {
                if (!current.edition) {
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
                    const cell = getCellCoords(target);
                    if (cell && cell.classList.contains("highlight")) {
                        editor_1.openEditor.call(current, cell, false, e);
                    }
                }
            }
        }
    }
};
const pasteControls = function (e) {
    const current = libraryBase_1.default.jspreadsheet.current;
    if (current && current.selectedCell) {
        if (!current.edition) {
            const editable = current.options.editable != false;
            if (editable) {
                if (e && "clipboardData" in e && e.clipboardData) {
                    copyPaste_1.paste.call(current, current.selectedCell[0], current.selectedCell[1], e.clipboardData.getData("text"));
                    e.preventDefault();
                }
                else if ("clipboardData" in window && window.clipboardData) {
                    copyPaste_1.paste.call(current, current.selectedCell[0], current.selectedCell[1], window.clipboardData.getData("text"));
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
                    var _a;
                    (_a = worksheet.insertColumn) === null || _a === void 0 ? void 0 : _a.call(worksheet, 1, x, true);
                },
            });
        }
        if (worksheet.options.allowInsertColumn != false) {
            items.push({
                title: jsuites_1.default.translate("Insert a new column after"),
                onclick: function () {
                    var _a;
                    (_a = worksheet.insertColumn) === null || _a === void 0 ? void 0 : _a.call(worksheet, 1, x, false);
                },
            });
        }
        // Delete a column
        if (worksheet.options.allowDeleteColumn != false) {
            items.push({
                title: jsuites_1.default.translate("Delete selected columns"),
                onclick: function () {
                    var _a, _b, _c;
                    const selectedColumns = (_b = (_a = worksheet.getSelectedColumns) === null || _a === void 0 ? void 0 : _a.call(worksheet)) !== null && _b !== void 0 ? _b : [];
                    const columnToDelete = selectedColumns.length > 0 ? selectedColumns[0] : x;
                    if (typeof columnToDelete === "number") {
                        (_c = worksheet.deleteColumn) === null || _c === void 0 ? void 0 : _c.call(worksheet, columnToDelete);
                    }
                },
            });
        }
        // Rename column
        if (worksheet.options.allowRenameColumn != false) {
            items.push({
                title: jsuites_1.default.translate("Rename this column"),
                onclick: function () {
                    var _a, _b;
                    const oldValue = (_a = worksheet.getHeader) === null || _a === void 0 ? void 0 : _a.call(worksheet, x);
                    const newValue = prompt(jsuites_1.default.translate("Column name"), oldValue);
                    if (newValue !== null) {
                        (_b = worksheet.setHeader) === null || _b === void 0 ? void 0 : _b.call(worksheet, x, newValue);
                    }
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
                    var _a;
                    (_a = worksheet.orderBy) === null || _a === void 0 ? void 0 : _a.call(worksheet, x, "asc");
                },
            });
            items.push({
                title: jsuites_1.default.translate("Order descending"),
                onclick: function () {
                    var _a;
                    (_a = worksheet.orderBy) === null || _a === void 0 ? void 0 : _a.call(worksheet, x, "desc");
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
                    var _a;
                    (_a = worksheet.insertRow) === null || _a === void 0 ? void 0 : _a.call(worksheet, 1, y, true);
                },
            });
            items.push({
                title: jsuites_1.default.translate("Insert a new row after"),
                onclick: function () {
                    var _a;
                    (_a = worksheet.insertRow) === null || _a === void 0 ? void 0 : _a.call(worksheet, 1, y, false);
                },
            });
        }
        if (worksheet.options.allowDeleteRow != false) {
            items.push({
                title: jsuites_1.default.translate("Delete selected rows"),
                onclick: function () {
                    var _a, _b, _c;
                    const selectedRows = (_b = (_a = worksheet.getSelectedRows) === null || _a === void 0 ? void 0 : _a.call(worksheet)) !== null && _b !== void 0 ? _b : [];
                    const rowToDelete = selectedRows.length > 0 ? selectedRows[0] : y;
                    if (typeof rowToDelete === "number") {
                        (_c = worksheet.deleteRow) === null || _c === void 0 ? void 0 : _c.call(worksheet, rowToDelete);
                    }
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
                    var _a;
                    const comment = prompt(jsuites_1.default.translate("Comments"), title);
                    if (comment) {
                        (_a = worksheet.setComments) === null || _a === void 0 ? void 0 : _a.call(worksheet, (0, helpers_1.getCellNameFromCoords)(x, y), comment);
                    }
                },
            });
            if (title) {
                items.push({
                    title: jsuites_1.default.translate("Clear comments"),
                    onclick: function () {
                        var _a;
                        (_a = worksheet.setComments) === null || _a === void 0 ? void 0 : _a.call(worksheet, (0, helpers_1.getCellNameFromCoords)(x, y), "");
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
                    const selectedCell = worksheet.selectedCell;
                    if (selectedCell && selectedCell.length >= 2) {
                        navigator.clipboard.readText().then(function (text) {
                            if (text) {
                                copyPaste_1.paste.call(worksheet, selectedCell[0], selectedCell[1], text);
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
                var _a;
                (_a = worksheet.download) === null || _a === void 0 ? void 0 : _a.call(worksheet);
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
    var _a, _b;
    e = e || window.event;
    const mouseButton = (_a = getMouseButton(e)) !== null && _a !== void 0 ? _a : 0;
    const current = libraryBase_1.default.jspreadsheet.current;
    if (current) {
        const spreadsheet = current.parent;
        if (current.edition) {
            e.preventDefault();
        }
        else {
            spreadsheet.contextMenu.contextmenu.close();
            const targetEl = getHTMLElement(e.target);
            if (!targetEl)
                return;
            // Local alias for current spreadsheet and its data
            const data = (_b = current.options.data) !== null && _b !== void 0 ? _b : [];
            const dataRows = data.length;
            const dataCols = (data[0] ? data[0].length : 0);
            const role = getRole(targetEl);
            let xStr = null, yStr = null;
            let xNum = null, yNum = null;
            if (role === "cell") {
                let cellElement = targetEl;
                while (cellElement && cellElement.tagName !== "TD") {
                    cellElement = cellElement.parentElement;
                }
                if (!cellElement)
                    return;
                yStr = cellElement.getAttribute("data-y");
                xStr = cellElement.getAttribute("data-x");
                xNum = xStr !== null ? parseInt(xStr, 10) : null;
                yNum = yStr !== null ? parseInt(yStr, 10) : null;
                if (xNum === null ||
                    yNum === null ||
                    !current.selectedCell ||
                    !current.selectedCell[0] ||
                    !current.selectedCell[1] ||
                    !current.selectedCell[2] ||
                    !current.selectedCell[3] ||
                    xNum < current.selectedCell[0] ||
                    xNum > current.selectedCell[2] ||
                    yNum < current.selectedCell[1] ||
                    yNum > current.selectedCell[3]) {
                    if (xNum !== null && yNum !== null) {
                        selection_1.updateSelectionFromCoords.call(current, xNum, yNum, xNum, yNum, e);
                    }
                }
            }
            else if (role === "row") {
                yStr = targetEl.getAttribute("data-y");
                yNum = yStr !== null ? parseInt(yStr, 10) : null;
                if (yNum !== null) {
                    selection_1.updateSelectionFromCoords.call(current, 0, yNum, dataCols - 1, yNum, e);
                }
            }
            else if (role === "header") {
                xStr = targetEl.getAttribute("data-x");
                xNum = xStr !== null ? parseInt(xStr, 10) : null;
                if (xNum !== null) {
                    selection_1.updateSelectionFromCoords.call(current, xNum, 0, xNum, dataRows - 1, e);
                }
            }
            else if (role === "nested") {
                const dataColumn = targetEl.getAttribute("data-column");
                const columns = dataColumn
                    ? dataColumn.split(",").map((v) => parseInt(v, 10))
                    : [];
                xNum = getElementIndex(targetEl) - 1;
                yNum = getElementIndex(targetEl.parentElement);
                // Compare against current selection safely
                const sel = current.selectedCell;
                if (!sel ||
                    columns[0] != sel[0] ||
                    columns[columns.length - 1] != sel[2] ||
                    sel[1] != null ||
                    sel[3] != null) {
                    selection_1.updateSelectionFromCoords.call(current, columns[0], 0, columns[columns.length - 1], dataRows - 1, e);
                }
            }
            else if (role === "select-all") {
                selection_1.selectAll.call(current);
            }
            else if (role === "tabs") {
                xNum = getElementIndex(targetEl);
            }
            else if (role === "footer") {
                xNum = getElementIndex(targetEl) - 1;
                yNum = getElementIndex(targetEl.parentElement);
            }
            // Table found
            const xArg = xNum !== null && xNum !== void 0 ? xNum : 0;
            const yArg = yNum !== null && yNum !== void 0 ? yNum : 0;
            let items = defaultContextMenu(current, xArg, yArg, role);
            if (typeof spreadsheet.config.contextMenu === "function") {
                const result = spreadsheet.config.contextMenu(current, xArg, yArg, e, items, role, xArg, yArg);
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
                        const result = plugin.contextMenu(current, xArg, yArg, e, items, role, xArg, yArg);
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
};
const touchStartControls = function (e) {
    var _a, _b;
    const jssTable = getElement(getHTMLElement(e.target));
    // Local alias of current to enable narrowing and reduce repeated property access
    let current = libraryBase_1.default.jspreadsheet.current;
    if (jssTable[0]) {
        if (current != jssTable[0].jssWorksheet) {
            if (current) {
                (_a = current.resetSelection) === null || _a === void 0 ? void 0 : _a.call(current);
            }
            libraryBase_1.default.jspreadsheet.current = jssTable[0].jssWorksheet;
            current = libraryBase_1.default.jspreadsheet.current;
        }
    }
    else {
        if (current) {
            (_b = current.resetSelection) === null || _b === void 0 ? void 0 : _b.call(current);
            libraryBase_1.default.jspreadsheet.current = null;
            current = null;
        }
    }
    if (current) {
        if (!current.edition) {
            const target = getHTMLElement(e.target);
            if (!target)
                return;
            const columnAttr = target.getAttribute("data-x");
            const rowAttr = target.getAttribute("data-y");
            const columnId = columnAttr != null ? parseInt(columnAttr, 10) : null;
            const rowId = rowAttr != null ? parseInt(rowAttr, 10) : null;
            if (columnId !== null && rowId !== null) {
                selection_1.updateSelectionFromCoords.call(current, columnId, rowId, columnId, rowId);
                libraryBase_1.default.jspreadsheet.timeControl = setTimeout(function () {
                    var _a;
                    const columns = (_a = current.options.columns) !== null && _a !== void 0 ? _a : [];
                    if (columns[columnId] &&
                        columns[columnId].type == "color") {
                        libraryBase_1.default.jspreadsheet.tmpElement = null;
                    }
                    else {
                        libraryBase_1.default.jspreadsheet.tmpElement = target;
                    }
                    editor_1.openEditor.call(current, target, false, e);
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
        if (libraryBase_1.default.jspreadsheet.tmpElement) {
            const child0 = libraryBase_1.default.jspreadsheet.tmpElement.children[0];
            if (child0 instanceof HTMLElement && child0.tagName === "INPUT") {
                child0.focus();
            }
            libraryBase_1.default.jspreadsheet.tmpElement = null;
        }
    }
};
const cutControls = function (e) {
    var _a;
    const current = libraryBase_1.default.jspreadsheet.current;
    if (!current)
        return;
    if (!current.edition) {
        copyPaste_1.copy === null || copyPaste_1.copy === void 0 ? void 0 : copyPaste_1.copy.call(current, true, undefined, undefined, undefined, undefined, true);
        const editable = current.options.editable != false;
        if (editable && current.highlighted) {
            (_a = current.setValue) === null || _a === void 0 ? void 0 : _a.call(current, current.highlighted.map(function (record) {
                return record.element;
            }), "");
        }
    }
};
exports.cutControls = cutControls;
const copyControls = function (e) {
    const current = libraryBase_1.default.jspreadsheet.current;
    if (!current)
        return;
    if (!current.edition) {
        copyPaste_1.copy.call(current, true);
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const current = libraryBase_1.default.jspreadsheet.current;
    if (current) {
        // Local alias for dataset dimensions
        const data = (_a = current.options.data) !== null && _a !== void 0 ? _a : [];
        const dataRows = data.length;
        const dataCols = (data[0] ? data[0].length : 0);
        const columns = (_b = current.options.columns) !== null && _b !== void 0 ? _b : [];
        const editable = current.options.editable != false;
        const allowDeleteRow = current.options.allowDeleteRow != false;
        const wordWrap = current.options.wordWrap == true;
        const allowDeleteColumn = current.options.allowDeleteColumn != false;
        const allowInsertRow = current.options.allowInsertRow != false;
        const allowManualInsertRow = current.options.allowManualInsertRow != false;
        const allowInsertColumn = current.options.allowInsertColumn != false;
        const allowManualInsertColumn = current.options.allowManualInsertColumn != false;
        if (current.edition) {
            if (e.which == 27) {
                // Escape
                if (current.edition) {
                    // Exit without saving
                    editor_1.closeEditor.call(current, current.edition[0], false);
                }
                e.preventDefault();
            }
            else if (e.which == 13) {
                // Enter
                if (columns[current.edition[2]] &&
                    columns[current.edition[2]].type == "calendar") {
                    editor_1.closeEditor.call(current, current.edition[0], true);
                }
                else if (columns[current.edition[2]] &&
                    columns[current.edition[2]].type == "dropdown") {
                    // Do nothing
                }
                else {
                    // Alt enter -> do not close editor
                    if ((wordWrap ||
                        (columns[current.edition[2]] &&
                            columns[current.edition[2]].wordWrap == true) ||
                        (Array.isArray(data) &&
                            data[current.edition[3]] &&
                            Array.isArray(data[current.edition[3]]) &&
                            data[current.edition[3]][current.edition[2]] &&
                            ((Array.isArray(data[current.edition[3]][current.edition[2]]) || typeof data[current.edition[3]][current.edition[2]] === 'string') && data[current.edition[3]][current.edition[2]].length > 200))) &&
                        e.altKey) {
                        // Add new line to the editor
                        const editorTextarea = current.edition[0].children[0];
                        let editorValue = editorTextarea.value;
                        const editorIndexOf = (_c = editorTextarea.selectionStart) !== null && _c !== void 0 ? _c : 0;
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
                        const el0 = current.edition[0].children[0];
                        if (el0 instanceof HTMLElement) {
                            el0.blur();
                        }
                    }
                }
            }
            else if (e.which == 9) {
                // Tab
                if (columns[current.edition[2]] &&
                    ["calendar", "html"].includes(columns[current.edition[2]].type)) {
                    editor_1.closeEditor.call(current, current.edition[0], true);
                }
                else {
                    const el0 = current.edition[0].children[0];
                    if (el0 instanceof HTMLElement) {
                        el0.blur();
                    }
                }
            }
        }
        if (!current.edition && current.selectedCell) {
            // Which key
            if (e.which == 37) {
                keys_1.left.call(current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 39) {
                keys_1.right.call(current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 38) {
                keys_1.up.call(current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 40) {
                keys_1.down.call(current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 36) {
                keys_1.first.call(current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 35) {
                keys_1.last.call(current, e.shiftKey, e.ctrlKey);
                e.preventDefault();
            }
            else if (e.which == 46 || e.which == 8) {
                // Delete
                if (editable) {
                    if (current.selectedRow != null) {
                        if (allowDeleteRow) {
                            if (confirm(jsuites_1.default.translate("Are you sure to delete the selected rows?"))) {
                                if (typeof current.selectedRow === "number") {
                                    (_d = current.deleteRow) === null || _d === void 0 ? void 0 : _d.call(current, current.selectedRow);
                                }
                            }
                        }
                    }
                    else if (current.selectedHeader) {
                        if (allowDeleteColumn) {
                            if (confirm(jsuites_1.default.translate("Are you sure to delete the selected columns?"))) {
                                if (typeof current.selectedHeader === "number") {
                                    (_e = current.deleteColumn) === null || _e === void 0 ? void 0 : _e.call(current, current.selectedHeader);
                                }
                            }
                        }
                    }
                    else {
                        // Change value
                        if (current.highlighted) {
                            (_f = current.setValue) === null || _f === void 0 ? void 0 : _f.call(current, current.highlighted.map(function (record) {
                                return record.element;
                            }), "");
                        }
                    }
                }
            }
            else if (e.which == 13) {
                // Move cursor
                if (e.shiftKey) {
                    keys_1.up.call(current, e.shiftKey, e.ctrlKey);
                }
                else {
                    if (allowInsertRow) {
                        if (allowManualInsertRow) {
                            if (current.selectedCell[1] == dataRows - 1) {
                                // New record in case selectedCell in the last row
                                (_g = current.insertRow) === null || _g === void 0 ? void 0 : _g.call(current, 1);
                            }
                        }
                    }
                    keys_1.down.call(current, e.shiftKey, e.ctrlKey);
                }
                e.preventDefault();
            }
            else if (e.which == 9) {
                // Tab
                if (e.shiftKey) {
                    keys_1.left.call(current, e.shiftKey, e.ctrlKey);
                }
                else {
                    if (allowInsertColumn) {
                        if (allowManualInsertColumn) {
                            if (current.selectedCell[0] == dataCols - 1) {
                                // New record in case selectedCell in the last column
                                (_h = current.insertColumn) === null || _h === void 0 ? void 0 : _h.call(current);
                            }
                        }
                    }
                    keys_1.right.call(current, e.shiftKey, e.ctrlKey);
                }
                e.preventDefault();
            }
            else {
                if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
                    if (e.which == 65) {
                        // Ctrl + A
                        selection_1.selectAll.call(current);
                        e.preventDefault();
                    }
                    else if (e.which == 83) {
                        // Ctrl + S
                        (_j = current.download) === null || _j === void 0 ? void 0 : _j.call(current);
                        e.preventDefault();
                    }
                    else if (e.which == 89) {
                        // Ctrl + Y
                        (_k = current.redo) === null || _k === void 0 ? void 0 : _k.call(current);
                        e.preventDefault();
                    }
                    else if (e.which == 90) {
                        // Ctrl + Z
                        (_l = current.undo) === null || _l === void 0 ? void 0 : _l.call(current);
                        e.preventDefault();
                    }
                    else if (e.which == 67) {
                        // Ctrl + C
                        copyPaste_1.copy.call(current, true);
                        e.preventDefault();
                    }
                    else if (e.which == 88) {
                        // Ctrl + X
                        if (editable) {
                            exports.cutControls.call(current, e);
                        }
                        else {
                            copyControls.call(current, e);
                        }
                        e.preventDefault();
                    }
                    else if (e.which == 86) {
                        // Ctrl + V
                        pasteControls.call(current, e);
                    }
                }
                else {
                    if (current.selectedCell) {
                        if (editable) {
                            const rowId = current.selectedCell[1];
                            const columnId = current.selectedCell[0];
                            // Characters able to start a edition
                            if (e.keyCode == 32) {
                                // Space
                                e.preventDefault();
                                if (columns[columnId] &&
                                    (columns[columnId].type == "checkbox" ||
                                        columns[columnId].type == "radio")) {
                                    editor_1.setCheckRadioValue.call(current);
                                }
                                else {
                                    // Start edition
                                    editor_1.openEditor.call(current, current.records[rowId][columnId].element, true, e);
                                }
                            }
                            else if (e.keyCode == 113) {
                                // Start edition with current content F2
                                editor_1.openEditor.call(current, current.records[rowId][columnId].element, false, e);
                            }
                            else if ((e.key.length === 1 || e.key === "Process") &&
                                !(e.altKey || isCtrl(e))) {
                                // Start edition
                                editor_1.openEditor.call(current, current.records[rowId][columnId].element, true, e);
                                // Prevent entries in the calendar
                                if (columns[columnId] &&
                                    columns[columnId].type == "calendar") {
                                    e.preventDefault();
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else {
        const kdTarget = getHTMLElement(e.target);
        if (kdTarget && kdTarget.classList.contains("jss_search")) {
            if (libraryBase_1.default.jspreadsheet.timeControl) {
                clearTimeout(libraryBase_1.default.jspreadsheet.timeControl);
            }
            const searchEl = kdTarget;
            libraryBase_1.default.jspreadsheet.timeControl = setTimeout(function () {
                var _a;
                const curr = libraryBase_1.default.jspreadsheet.current;
                if (curr) {
                    (_a = curr.search) === null || _a === void 0 ? void 0 : _a.call(curr, searchEl.value);
                }
            }, 200);
        }
    }
};
const wheelControls = function (e) {
    const obj = this;
    if (obj.options.lazyLoading == true) {
        if (libraryBase_1.default.jspreadsheet.timeControlLoading == null) {
            libraryBase_1.default.jspreadsheet.timeControlLoading = setTimeout(function () {
                if (obj.content &&
                    obj.content.scrollTop + obj.content.clientHeight >=
                        obj.content.scrollHeight - 10) {
                    if (lazyLoading_1.loadDown.call(obj)) {
                        if (obj.content &&
                            obj.content.scrollTop + obj.content.clientHeight >
                                obj.content.scrollHeight - 10) {
                            obj.content.scrollTop =
                                obj.content.scrollTop - obj.content.clientHeight;
                        }
                        selection_1.updateCornerPosition.call(obj);
                    }
                }
                else if (obj.content && obj.content.scrollTop <= obj.content.clientHeight) {
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
    if (!obj.content)
        return;
    scrollLeft = obj.content.scrollLeft;
    let width = 0;
    if (scrollLeft > 50 && obj.options.freezeColumns) {
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
                        columnWidth = parseInt(String(obj.options.columns[i - 1].width));
                    }
                    else {
                        columnWidth =
                            obj.options.defaultColWidth !== undefined
                                ? parseInt(String(obj.options.defaultColWidth))
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
                        (i > 0 ? parseInt(String(obj.records[j][i - 1].element.style.width)) : 0) -
                        51 +
                        "px";
                    obj.records[j][i].element.classList.add("jss_freezed");
                    obj.records[j][i].element.style.left = shifted;
                }
            }
        }
    }
    else if (obj.options.freezeColumns) {
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
    if (obj.options.freezeColumns && obj.options.freezeColumns > 0 && obj.content && obj.content.scrollLeft != scrollLeft) {
        updateFreezePosition.call(obj);
    }
    // Close editor
    if (obj.options.lazyLoading == true || obj.options.tableOverflow == true) {
        if (obj.edition) {
            const t = e.target;
            if (t && typeof t.className === "string" && t.className.substr(0, 9) != "jdropdown") {
                editor_1.closeEditor.call(obj, obj.edition[0], true);
            }
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
