var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import jSuites from 'jsuites';
import dispatch from "./dispatch.js";
import { getMask, isFormula, updateCell } from "./internal.js";
import { setHistory } from './history.js';
/**
 * Open the editor
 *
 * @param object cell
 * @return void
 */
export var openEditor = function (cell, empty, e) {
    var obj = this;
    // Get cell position
    var y = cell.getAttribute('data-y');
    var x = cell.getAttribute('data-x');
    // On edition start
    dispatch.call(obj, 'oneditionstart', obj, cell, parseInt(x), parseInt(y));
    // Overflow
    if (x > 0) {
        obj.records[y][x - 1].element.style.overflow = 'hidden';
    }
    // Create editor
    var createEditor = function (type) {
        // Cell information
        var info = cell.getBoundingClientRect();
        // Create dropdown
        var editor = document.createElement(type);
        editor.style.width = (info.width) + 'px';
        editor.style.height = (info.height - 2) + 'px';
        editor.style.minHeight = (info.height - 2) + 'px';
        // Edit cell
        cell.classList.add('editor');
        cell.innerHTML = '';
        cell.appendChild(editor);
        return editor;
    };
    // Readonly
    if (cell.classList.contains('readonly') == true) {
        // Do nothing
    }
    else {
        // Holder
        obj.edition = [obj.records[y][x].element, obj.records[y][x].element.innerHTML, x, y];
        // If there is a custom editor for it
        if (obj.options.columns && obj.options.columns[x] && typeof obj.options.columns[x].type === 'object') {
            // Custom editors
            obj.options.columns[x].type.openEditor(cell, obj.options.data[y][x], parseInt(x), parseInt(y), obj, obj.options.columns[x], e);
            // On edition start
            dispatch.call(obj, 'oncreateeditor', obj, cell, parseInt(x), parseInt(y), null, obj.options.columns[x]);
        }
        else {
            // Native functions
            if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'hidden') {
                // Do nothing
            }
            else if (obj.options.columns && obj.options.columns[x] && (obj.options.columns[x].type == 'checkbox' || obj.options.columns[x].type == 'radio')) {
                // Get value
                var value = cell.children[0].checked ? false : true;
                // Toogle value
                obj.setValue(cell, value);
                // Do not keep edition open
                obj.edition = null;
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'dropdown') {
                // Get current value
                var value = obj.options.data[y][x];
                if (obj.options.columns[x].multiple && !Array.isArray(value)) {
                    value = value.split(';');
                }
                // Create dropdown
                var source = void 0;
                if (typeof (obj.options.columns[x].filter) == 'function') {
                    source = obj.options.columns[x].filter(obj.element, cell, x, y, obj.options.columns[x].source);
                }
                else {
                    source = obj.options.columns[x].source;
                }
                // Do not change the original source
                var data = [];
                if (source) {
                    for (var j = 0; j < source.length; j++) {
                        data.push(source[j]);
                    }
                }
                // Create editor
                var editor = createEditor('div');
                // On edition start
                dispatch.call(obj, 'oncreateeditor', obj, cell, parseInt(x), parseInt(y), null, obj.options.columns[x]);
                var options = {
                    data: data,
                    multiple: obj.options.columns[x].multiple ? true : false,
                    autocomplete: obj.options.columns[x].autocomplete ? true : false,
                    opened: true,
                    value: value,
                    width: '100%',
                    height: editor.style.minHeight,
                    position: (obj.options.tableOverflow == true || obj.parent.config.fullscreen == true) ? true : false,
                    onclose: function () {
                        closeEditor.call(obj, cell, true);
                    }
                };
                if (obj.options.columns[x].options && obj.options.columns[x].options.type) {
                    options.type = obj.options.columns[x].options.type;
                }
                jSuites.dropdown(editor, options);
            }
            else if (obj.options.columns && obj.options.columns[x] && (obj.options.columns[x].type == 'calendar' || obj.options.columns[x].type == 'color')) {
                // Value
                var value = obj.options.data[y][x];
                // Create editor
                var editor = createEditor('input');
                dispatch.call(obj, 'oncreateeditor', obj, cell, parseInt(x), parseInt(y), null, obj.options.columns[x]);
                editor.value = value;
                var options = obj.options.columns[x].options ? __assign({}, obj.options.columns[x].options) : {};
                if (obj.options.tableOverflow == true || obj.parent.config.fullscreen == true) {
                    options.position = true;
                }
                options.value = obj.options.data[y][x];
                options.opened = true;
                options.onclose = function (el, value) {
                    closeEditor.call(obj, cell, true);
                };
                // Current value
                if (obj.options.columns[x].type == 'color') {
                    jSuites.color(editor, options);
                    var rect = cell.getBoundingClientRect();
                    if (options.position) {
                        editor.nextSibling.children[1].style.top = (rect.top + rect.height) + 'px';
                        editor.nextSibling.children[1].style.left = rect.left + 'px';
                    }
                }
                else {
                    if (!options.format) {
                        options.format = 'YYYY-MM-DD';
                    }
                    jSuites.calendar(editor, options);
                }
                // Focus on editor
                editor.focus();
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'html') {
                var value = obj.options.data[y][x];
                // Create editor
                var editor = createEditor('div');
                dispatch.call(obj, 'oncreateeditor', obj, cell, parseInt(x), parseInt(y), null, obj.options.columns[x]);
                editor.style.position = 'relative';
                var div = document.createElement('div');
                div.classList.add('jss_richtext');
                editor.appendChild(div);
                jSuites.editor(div, {
                    focus: true,
                    value: value,
                });
                var rect = cell.getBoundingClientRect();
                var rectContent = div.getBoundingClientRect();
                if (window.innerHeight < rect.bottom + rectContent.height) {
                    div.style.top = (rect.bottom - (rectContent.height + 2)) + 'px';
                }
                else {
                    div.style.top = (rect.top) + 'px';
                }
                if (window.innerWidth < rect.left + rectContent.width) {
                    div.style.left = (rect.right - (rectContent.width + 2)) + 'px';
                }
                else {
                    div.style.left = rect.left + 'px';
                }
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'image') {
                // Value
                var img = cell.children[0];
                // Create editor
                var editor = createEditor('div');
                dispatch.call(obj, 'oncreateeditor', obj, cell, parseInt(x), parseInt(y), null, obj.options.columns[x]);
                editor.style.position = 'relative';
                var div = document.createElement('div');
                div.classList.add('jclose');
                if (img && img.src) {
                    div.appendChild(img);
                }
                editor.appendChild(div);
                jSuites.image(div, obj.options.columns[x]);
                var rect = cell.getBoundingClientRect();
                var rectContent = div.getBoundingClientRect();
                if (window.innerHeight < rect.bottom + rectContent.height) {
                    div.style.top = (rect.top - (rectContent.height + 2)) + 'px';
                }
                else {
                    div.style.top = (rect.top) + 'px';
                }
                div.style.left = rect.left + 'px';
            }
            else {
                // Value
                var value = empty == true ? '' : obj.options.data[y][x];
                // Basic editor
                var editor = void 0;
                if ((!obj.options.columns || !obj.options.columns[x] || obj.options.columns[x].wordWrap != false) && (obj.options.wordWrap == true || (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].wordWrap == true))) {
                    editor = createEditor('textarea');
                }
                else {
                    editor = createEditor('input');
                }
                dispatch.call(obj, 'oncreateeditor', obj, cell, parseInt(x), parseInt(y), null, obj.options.columns[x]);
                editor.focus();
                editor.value = value;
                // Column options
                var options = obj.options.columns && obj.options.columns[x];
                // Apply format when is not a formula
                if (!isFormula(value)) {
                    if (options) {
                        // Format
                        var opt = getMask(options);
                        if (opt) {
                            // Masking
                            if (!options.disabledMaskOnEdition) {
                                if (options.mask) {
                                    var m = options.mask.split(';');
                                    editor.setAttribute('data-mask', m[0]);
                                }
                                else if (options.locale) {
                                    editor.setAttribute('data-locale', options.locale);
                                }
                            }
                            // Input
                            opt.input = editor;
                            // Configuration
                            editor.mask = opt;
                            // Do not treat the decimals
                            jSuites.mask.render(value, opt, false);
                        }
                    }
                }
                editor.onblur = function () {
                    closeEditor.call(obj, cell, true);
                };
                editor.scrollLeft = editor.scrollWidth;
            }
        }
    }
};
/**
 * Close the editor and save the information
 *
 * @param object cell
 * @param boolean save
 * @return void
 */
export var closeEditor = function (cell, save) {
    var obj = this;
    var x = parseInt(cell.getAttribute('data-x'));
    var y = parseInt(cell.getAttribute('data-y'));
    var value;
    // Get cell properties
    if (save == true) {
        // If custom editor
        if (obj.options.columns && obj.options.columns[x] && typeof obj.options.columns[x].type === 'object') {
            // Custom editor
            value = obj.options.columns[x].type.closeEditor(cell, save, parseInt(x), parseInt(y), obj, obj.options.columns[x]);
        }
        else {
            // Native functions
            if (obj.options.columns && obj.options.columns[x] && (obj.options.columns[x].type == 'checkbox' || obj.options.columns[x].type == 'radio' || obj.options.columns[x].type == 'hidden')) {
                // Do nothing
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'dropdown') {
                value = cell.children[0].dropdown.close(true);
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'calendar') {
                value = cell.children[0].calendar.close(true);
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'color') {
                value = cell.children[0].color.close(true);
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'html') {
                value = cell.children[0].children[0].editor.getData();
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'image') {
                var img = cell.children[0].children[0].children[0];
                value = img && img.tagName == 'IMG' ? img.src : '';
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'numeric') {
                value = cell.children[0].value;
                if (('' + value).substr(0, 1) != '=') {
                    if (value == '') {
                        value = obj.options.columns[x].allowEmpty ? '' : 0;
                    }
                }
                cell.children[0].onblur = null;
            }
            else {
                value = cell.children[0].value;
                cell.children[0].onblur = null;
                // Column options
                var options = obj.options.columns && obj.options.columns[x];
                if (options) {
                    // Format
                    var opt = getMask(options);
                    if (opt) {
                        // Keep numeric in the raw data
                        if (value !== '' && !isFormula(value) && typeof (value) !== 'number') {
                            var t = jSuites.mask.extract(value, opt, true);
                            if (t && t.value !== '') {
                                value = t.value;
                            }
                        }
                    }
                }
            }
        }
        // Ignore changes if the value is the same
        if (obj.options.data[y][x] == value) {
            cell.innerHTML = obj.edition[1];
        }
        else {
            obj.setValue(cell, value);
        }
    }
    else {
        if (obj.options.columns && obj.options.columns[x] && typeof obj.options.columns[x].type === 'object') {
            // Custom editor
            obj.options.columns[x].type.closeEditor(cell, save, parseInt(x), parseInt(y), obj, obj.options.columns[x]);
        }
        else {
            if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'dropdown') {
                cell.children[0].dropdown.close(true);
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'calendar') {
                cell.children[0].calendar.close(true);
            }
            else if (obj.options.columns && obj.options.columns[x] && obj.options.columns[x].type == 'color') {
                cell.children[0].color.close(true);
            }
            else {
                cell.children[0].onblur = null;
            }
        }
        // Restore value
        cell.innerHTML = obj.edition && obj.edition[1] ? obj.edition[1] : '';
    }
    // On edition end
    dispatch.call(obj, 'oneditionend', obj, cell, x, y, value, save);
    // Remove editor class
    cell.classList.remove('editor');
    // Finish edition
    obj.edition = null;
};
/**
 * Toogle
 */
export var setCheckRadioValue = function () {
    var obj = this;
    var records = [];
    var keys = Object.keys(obj.highlighted);
    for (var i = 0; i < keys.length; i++) {
        var x = obj.highlighted[i].element.getAttribute('data-x');
        var y = obj.highlighted[i].element.getAttribute('data-y');
        if (obj.options.columns[x].type == 'checkbox' || obj.options.columns[x].type == 'radio') {
            // Update cell
            records.push(updateCell.call(obj, x, y, !obj.options.data[y][x]));
        }
    }
    if (records.length) {
        // Update history
        setHistory.call(obj, {
            action: 'setValue',
            records: records,
            selection: obj.selectedCell,
        });
        // On after changes
        var onafterchangesRecords = records.map(function (record) {
            return {
                x: record.x,
                y: record.y,
                value: record.value,
                oldValue: record.oldValue,
            };
        });
        dispatch.call(obj, 'onafterchanges', obj, onafterchangesRecords);
    }
};
//# sourceMappingURL=editor.js.map