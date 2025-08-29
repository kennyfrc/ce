"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCheckRadioValue = exports.closeEditor = exports.openEditor = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const dispatch_1 = __importDefault(require("./dispatch"));
const internal_1 = require("./internal");
const history_1 = require("./history");
/**
 * Open the editor
 *
 * @param object cell
 * @return void
 */
const openEditor = function (cell, empty, e) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const obj = this;
    // Get cell position
    const y = cell.getAttribute("data-y");
    const x = cell.getAttribute("data-x");
    // Convert to numbers with null checks
    const xNum = x ? parseInt(x) : 0;
    const yNum = y ? parseInt(y) : 0;
    // On edition start
    dispatch_1.default.call(obj, "oneditionstart", obj, cell, xNum, yNum);
    // Overflow
    if (xNum > 0 && yNum >= 0) {
        obj.records[yNum][xNum - 1].element.style.overflow = "hidden";
    }
    // Create editor
    const createEditor = function (type) {
        // Cell information
        const info = cell.getBoundingClientRect();
        // Create dropdown
        const editor = document.createElement(type);
        editor.style.width = info.width + "px";
        editor.style.height = info.height - 2 + "px";
        editor.style.minHeight = info.height - 2 + "px";
        // Edit cell
        cell.classList.add("editor");
        cell.innerHTML = "";
        cell.appendChild(editor);
        return editor;
    };
    // Readonly
    if (cell.classList.contains("readonly") == true) {
        // Do nothing
    }
    else {
        // Holder
        obj.edition = [
            obj.records[yNum][xNum].element,
            obj.records[yNum][xNum].element.innerHTML,
            xNum,
            yNum,
        ];
        // If there is a custom editor for it
        if (obj.options.columns &&
            obj.options.columns[parseInt(x || "0")] &&
            typeof obj.options.columns[xNum].type === "object") {
            // Custom editors
            const cellValue = obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[yNum])
                ? (_a = obj.options.data[yNum][xNum]) !== null && _a !== void 0 ? _a : ""
                : "";
            const customType = obj.options.columns[xNum].type;
            (_b = customType.openEditor) === null || _b === void 0 ? void 0 : _b.call(customType, cell, cellValue, xNum, yNum, obj, obj.options.columns[xNum], e);
            // On edition start
            dispatch_1.default.call(obj, "oncreateeditor", obj, cell, xNum, yNum, null, obj.options.columns[parseInt(x || "0")]);
        }
        else {
            // Native functions
            if (obj.options.columns &&
                obj.options.columns[parseInt(x || "0")] &&
                obj.options.columns[parseInt(x || "0")].type == "hidden") {
                // Do nothing
            }
            else if (obj.options.columns &&
                obj.options.columns[parseInt(x || "0")] &&
                (obj.options.columns[parseInt(x || "0")].type == "checkbox" ||
                    obj.options.columns[parseInt(x || "0")].type == "radio")) {
                // Get value
                const value = cell.children[0] && cell.children[0].checked
                    ? false
                    : true;
                // Toogle value
                (_c = obj.setValue) === null || _c === void 0 ? void 0 : _c.call(obj, [{ element: cell }], value);
                // Do not keep edition open
                obj.edition = undefined;
            }
            else if (obj.options.columns &&
                x &&
                obj.options.columns[xNum] &&
                obj.options.columns[xNum].type == "dropdown" &&
                y) {
                // Get current value
                let value = obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[yNum])
                    ? (_d = obj.options.data[yNum][xNum]) !== null && _d !== void 0 ? _d : ""
                    : "";
                if (obj.options.columns[xNum].multiple && !Array.isArray(value)) {
                    value = String(value).split(";");
                }
                // Create dropdown
                let source;
                if (typeof obj.options.columns[xNum].filter == "function") {
                    source = obj.options.columns[xNum].filter(obj.element, cell, x, y, obj.options.columns[xNum].source);
                }
                else {
                    source = obj.options.columns[xNum].source;
                }
                // Do not change the original source
                const data = [];
                if (source) {
                    for (let j = 0; j < source.length; j++) {
                        data.push(source[j]);
                    }
                }
                // Create editor
                const editor = createEditor("div");
                // On edition start
                dispatch_1.default.call(obj, "oncreateeditor", obj, cell, parseInt(x || "0"), parseInt(y || "0"), null, x ? obj.options.columns[xNum] : null);
                const options = {
                    data: data,
                    multiple: x && obj.options.columns[xNum].multiple ? true : false,
                    autocomplete: x && obj.options.columns[xNum].autocomplete ? true : false,
                    opened: true,
                    value: value,
                    width: "100%",
                    height: editor.style.minHeight,
                    position: obj.options.tableOverflow == true ||
                        obj.parent.config.fullscreen == true
                        ? true
                        : false,
                    onclose: function () {
                        exports.closeEditor.call(obj, cell, true);
                    },
                };
                if (obj.options.columns[xNum].options &&
                    obj.options.columns[xNum].options.type) {
                    options.type = obj.options.columns[xNum].options.type;
                }
                jsuites_1.default.dropdown(editor, options);
            }
            else if (obj.options.columns &&
                obj.options.columns[xNum] &&
                (obj.options.columns[xNum].type == "calendar" ||
                    obj.options.columns[xNum].type == "color")) {
                // Value
                const value = obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[yNum])
                    ? (_e = obj.options.data[yNum][xNum]) !== null && _e !== void 0 ? _e : ""
                    : "";
                // Create editor
                const editor = createEditor("input");
                dispatch_1.default.call(obj, "oncreateeditor", obj, cell, parseInt(x || "0"), parseInt(y || "0"), null, x ? obj.options.columns[xNum] : null);
                editor.value = String(value);
                const options = x && obj.options.columns[xNum].options
                    ? { ...obj.options.columns[xNum].options }
                    : {};
                if (obj.options.tableOverflow == true ||
                    obj.parent.config.fullscreen == true) {
                    options.position = true;
                }
                options.value = obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[yNum])
                    ? (_f = obj.options.data[yNum][xNum]) !== null && _f !== void 0 ? _f : ""
                    : "";
                options.opened = true;
                options.onclose = function (el, value) {
                    exports.closeEditor.call(obj, cell, true);
                };
                // Current value
                if (obj.options.columns[xNum].type == "color") {
                    jsuites_1.default.color(editor, options);
                    const rect = cell.getBoundingClientRect();
                    if (options.position &&
                        editor.nextSibling &&
                        "children" in editor.nextSibling) {
                        const nextSibling = editor.nextSibling;
                        if (nextSibling.children && nextSibling.children[1]) {
                            const childElement = nextSibling.children[1];
                            childElement.style.top = rect.top + rect.height + "px";
                            childElement.style.left = rect.left + "px";
                        }
                    }
                }
                else {
                    if (!options.format) {
                        options.format = "YYYY-MM-DD";
                    }
                    jsuites_1.default.calendar(editor, options);
                }
                // Focus on editor
                editor.focus();
            }
            else if (obj.options.columns &&
                obj.options.columns[xNum] &&
                obj.options.columns[xNum].type == "html") {
                const value = x && y && obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[yNum])
                    ? (_g = obj.options.data[yNum][xNum]) !== null && _g !== void 0 ? _g : ""
                    : "";
                // Create editor
                const editor = createEditor("div");
                dispatch_1.default.call(obj, "oncreateeditor", obj, cell, parseInt(x || "0"), parseInt(y || "0"), null, x ? obj.options.columns[xNum] : null);
                editor.style.position = "relative";
                const div = document.createElement("div");
                div.classList.add("jss_richtext");
                editor.appendChild(div);
                jsuites_1.default.editor(div, {
                    focus: true,
                    value: String(value),
                });
                const rect = cell.getBoundingClientRect();
                const rectContent = div.getBoundingClientRect();
                if (window.innerHeight < rect.bottom + rectContent.height) {
                    div.style.top = rect.bottom - (rectContent.height + 2) + "px";
                }
                else {
                    div.style.top = rect.top + "px";
                }
                if (window.innerWidth < rect.left + rectContent.width) {
                    div.style.left = rect.right - (rectContent.width + 2) + "px";
                }
                else {
                    div.style.left = rect.left + "px";
                }
            }
            else if (obj.options.columns &&
                obj.options.columns[xNum] &&
                obj.options.columns[xNum].type == "image") {
                // Value
                const img = cell.children[0];
                // Create editor
                const editor = createEditor("div");
                dispatch_1.default.call(obj, "oncreateeditor", obj, cell, parseInt(x || "0"), parseInt(y || "0"), null, x ? obj.options.columns[xNum] : null);
                editor.style.position = "relative";
                const div = document.createElement("div");
                div.classList.add("jclose");
                if (img && img.src) {
                    div.appendChild(img);
                }
                editor.appendChild(div);
                jsuites_1.default.image(div, obj.options.columns[xNum]);
                const rect = cell.getBoundingClientRect();
                const rectContent = div.getBoundingClientRect();
                if (window.innerHeight < rect.bottom + rectContent.height) {
                    div.style.top = rect.top - (rectContent.height + 2) + "px";
                }
                else {
                    div.style.top = rect.top + "px";
                }
                div.style.left = rect.left + "px";
            }
            else {
                // Value
                const value = empty == true ? "" : (obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[yNum])
                    ? (_h = obj.options.data[yNum][xNum]) !== null && _h !== void 0 ? _h : ""
                    : "");
                // Basic editor
                let editor;
                if ((!obj.options.columns ||
                    !obj.options.columns[xNum] ||
                    obj.options.columns[xNum].wordWrap != false) &&
                    (obj.options.wordWrap == true ||
                        (obj.options.columns &&
                            obj.options.columns[xNum] &&
                            obj.options.columns[xNum].wordWrap == true))) {
                    editor = createEditor("textarea");
                }
                else {
                    editor = createEditor("input");
                }
                dispatch_1.default.call(obj, "oncreateeditor", obj, cell, parseInt(x || "0"), parseInt(y || "0"), null, x ? obj.options.columns[xNum] : null);
                editor.focus();
                editor.value = String(value);
                // Column options
                const options = obj.options.columns && obj.options.columns[xNum];
                // Apply format when is not a formula
                if (!(0, internal_1.isFormula)(value)) {
                    if (options) {
                        // Format
                        const opt = (0, internal_1.getMask)(options);
                        if (opt) {
                            // Masking
                            if (!options.disabledMaskOnEdition) {
                                if (options.mask) {
                                    const m = options.mask.split(";");
                                    editor.setAttribute("data-mask", m[0]);
                                }
                                else if (options.locale) {
                                    editor.setAttribute("data-locale", String(options.locale));
                                }
                            }
                            // Input
                            opt.input = editor;
                            // Configuration
                            editor.mask = opt;
                            // Do not treat the decimals
                            jsuites_1.default.mask.render(String(value), opt, false);
                        }
                    }
                }
                editor.onblur = function () {
                    exports.closeEditor.call(obj, cell, true);
                };
                editor.scrollLeft = editor.scrollWidth;
            }
        }
    }
};
exports.openEditor = openEditor;
/**
 * Close the editor and save the information
 *
 * @param object cell
 * @param boolean save
 * @return void
 */
const closeEditor = function (cell, save) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const obj = this;
    const xAttr = cell.getAttribute("data-x");
    const yAttr = cell.getAttribute("data-y");
    const x = xAttr ? parseInt(xAttr) : 0;
    const y = yAttr ? parseInt(yAttr) : 0;
    let value;
    // Get cell properties
    if (save == true) {
        // If custom editor
        if (obj.options.columns &&
            obj.options.columns[x] &&
            typeof obj.options.columns[x].type === "object") {
            // Custom editor
            const customType = obj.options.columns[x].type;
            value = (_a = customType.closeEditor) === null || _a === void 0 ? void 0 : _a.call(customType, cell, save, x, y, obj, obj.options.columns[x]);
        }
        else {
            // Native functions
            if (obj.options.columns &&
                obj.options.columns[x] &&
                (obj.options.columns[x].type == "checkbox" ||
                    obj.options.columns[x].type == "radio" ||
                    obj.options.columns[x].type == "hidden")) {
                // Do nothing
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "dropdown") {
                value = (_c = (_b = cell.children[0].dropdown) === null || _b === void 0 ? void 0 : _b.close) === null || _c === void 0 ? void 0 : _c.call(_b, true);
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "calendar") {
                value = (_e = (_d = cell.children[0].calendar) === null || _d === void 0 ? void 0 : _d.close) === null || _e === void 0 ? void 0 : _e.call(_d, true);
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "color") {
                value = (_f = cell.children[0].color) === null || _f === void 0 ? void 0 : _f.close(true);
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "html") {
                value = (_g = cell.children[0].children[0].editor) === null || _g === void 0 ? void 0 : _g.getData();
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "image") {
                const img = cell.children[0].children[0]
                    .children[0];
                value = img && img.tagName == "IMG" ? img.src : "";
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "numeric") {
                value = cell.children[0].value;
                if (("" + value).substr(0, 1) != "=") {
                    if (value == "") {
                        value = obj.options.columns[x].allowEmpty ? "" : 0;
                    }
                }
                cell.children[0].onblur = null;
            }
            else {
                value = cell.children[0].value;
                cell.children[0].onblur = null;
                // Column options
                const options = obj.options.columns && obj.options.columns[x];
                if (options) {
                    // Format
                    const opt = (0, internal_1.getMask)(options);
                    if (opt) {
                        // Keep numeric in the raw data
                        if (value !== "" &&
                            !(0, internal_1.isFormula)(value) &&
                            typeof value !== "number") {
                            const t = jsuites_1.default.mask.extract(value, opt, true);
                            if (t && t.value !== "") {
                                value = t.value;
                            }
                        }
                    }
                }
            }
        }
        // Ignore changes if the value is the same
        const currentValue = obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[y])
            ? (_h = obj.options.data[y][x]) !== null && _h !== void 0 ? _h : ""
            : "";
        if (currentValue == value) {
            cell.innerHTML = obj.edition[1];
        }
        else {
            (_j = obj.setValue) === null || _j === void 0 ? void 0 : _j.call(obj, [{ element: cell }], value);
        }
    }
    else {
        if (obj.options.columns &&
            obj.options.columns[x] &&
            typeof obj.options.columns[x].type === "object") {
            // Custom editor
            obj.options.columns[x].type.closeEditor(cell, save, x, y, obj, obj.options.columns[x]);
        }
        else {
            if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "dropdown") {
                (_k = cell.children[0].dropdown) === null || _k === void 0 ? void 0 : _k.close(true);
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "calendar") {
                (_l = cell.children[0].calendar) === null || _l === void 0 ? void 0 : _l.close(true);
            }
            else if (obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "color") {
                (_m = cell.children[0].color) === null || _m === void 0 ? void 0 : _m.close(true);
            }
            else {
                cell.children[0].onblur = null;
            }
        }
        // Restore value
        cell.innerHTML = obj.edition && obj.edition[1] ? obj.edition[1] : "";
    }
    // On edition end
    dispatch_1.default.call(obj, "oneditionend", obj, cell, x, y, value, save);
    // Remove editor class
    cell.classList.remove("editor");
    // Finish edition
    obj.edition = null;
};
exports.closeEditor = closeEditor;
/**
 * Toogle
 */
const setCheckRadioValue = function () {
    var _a;
    const obj = this;
    const records = [];
    const keys = Object.keys(obj.highlighted);
    for (let i = 0; i < keys.length; i++) {
        const x = obj.highlighted[i].element.getAttribute("data-x");
        const y = obj.highlighted[i].element.getAttribute("data-y");
        if (obj.options.columns[parseInt(x || "0")].type == "checkbox" ||
            obj.options.columns[parseInt(x || "0")].type == "radio") {
            // Update cell
            const currentValue = obj.options.data && Array.isArray(obj.options.data) && Array.isArray(obj.options.data[y])
                ? (_a = obj.options.data[y][x]) !== null && _a !== void 0 ? _a : ""
                : "";
            records.push(internal_1.updateCell.call(obj, x, y, !currentValue));
        }
    }
    if (records.length) {
        // Update history
        history_1.setHistory.call(obj, {
            action: "setValue",
            records: records,
            selection: obj.selectedCell,
        });
        // On after changes
        const onafterchangesRecords = records.map(function (record) {
            return {
                x: record.x,
                y: record.y,
                value: record.value,
                oldValue: record.oldValue,
            };
        });
        dispatch_1.default.call(obj, "onafterchanges", obj, onafterchangesRecords);
    }
};
exports.setCheckRadioValue = setCheckRadioValue;
