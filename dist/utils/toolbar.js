import jSuites from "jsuites";
import { getCellNameFromCoords } from "./helpers.js";
import { getWorksheetInstance } from "./internal.js";
var setItemStatus = function (toolbarItem, worksheet) {
    if (worksheet.options.editable != false) {
        toolbarItem.classList.remove('jtoolbar-disabled');
    }
    else {
        toolbarItem.classList.add('jtoolbar-disabled');
    }
};
export var getDefault = function () {
    var items = [];
    var spreadsheet = this;
    var getActive = function () {
        return getWorksheetInstance.call(spreadsheet);
    };
    items.push({
        content: 'undo',
        onclick: function () {
            var worksheet = getActive();
            worksheet.undo();
        }
    });
    items.push({
        content: 'redo',
        onclick: function () {
            var worksheet = getActive();
            worksheet.redo();
        }
    });
    items.push({
        content: 'save',
        onclick: function () {
            var worksheet = getActive();
            if (worksheet) {
                worksheet.download();
            }
        }
    });
    items.push({
        type: 'divisor',
    });
    items.push({
        type: 'select',
        width: '120px',
        options: ['Default', 'Verdana', 'Arial', 'Courier New'],
        render: function (e) {
            return '<span style="font-family:' + e + '">' + e + '</span>';
        },
        onchange: function (a, b, c, d, e) {
            var worksheet = getActive();
            var cells = worksheet.getSelected(true);
            if (cells) {
                var value_1 = (!e) ? '' : d;
                worksheet.setStyle(Object.fromEntries(cells.map(function (cellName) {
                    return [cellName, 'font-family: ' + value_1];
                })));
            }
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        type: 'select',
        width: '48px',
        content: 'format_size',
        options: ['x-small', 'small', 'medium', 'large', 'x-large'],
        render: function (e) {
            return '<span style="font-size:' + e + '">' + e + '</span>';
        },
        onchange: function (a, b, c, value) {
            var worksheet = getActive();
            var cells = worksheet.getSelected(true);
            if (cells) {
                worksheet.setStyle(Object.fromEntries(cells.map(function (cellName) {
                    return [cellName, 'font-size: ' + value];
                })));
            }
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        type: 'select',
        options: ['left', 'center', 'right', 'justify'],
        render: function (e) {
            return '<i class="material-icons">format_align_' + e + '</i>';
        },
        onchange: function (a, b, c, value) {
            var worksheet = getActive();
            var cells = worksheet.getSelected(true);
            if (cells) {
                worksheet.setStyle(Object.fromEntries(cells.map(function (cellName) {
                    return [cellName, 'text-align: ' + value];
                })));
            }
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        content: 'format_bold',
        onclick: function (a, b, c) {
            var worksheet = getActive();
            var cells = worksheet.getSelected(true);
            if (cells) {
                worksheet.setStyle(Object.fromEntries(cells.map(function (cellName) {
                    return [cellName, 'font-weight:bold'];
                })));
            }
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        type: 'color',
        content: 'format_color_text',
        k: 'color',
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        type: 'color',
        content: 'format_color_fill',
        k: 'background-color',
        updateState: function (a, b, toolbarItem, d) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    var verticalAlign = ['top', 'middle', 'bottom'];
    items.push({
        type: 'select',
        options: ['vertical_align_top', 'vertical_align_center', 'vertical_align_bottom'],
        render: function (e) {
            return '<i class="material-icons">' + e + '</i>';
        },
        value: 1,
        onchange: function (a, b, c, d, value) {
            var worksheet = getActive();
            var cells = worksheet.getSelected(true);
            if (cells) {
                worksheet.setStyle(Object.fromEntries(cells.map(function (cellName) {
                    return [cellName, 'vertical-align: ' + verticalAlign[value]];
                })));
            }
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        content: 'web',
        tooltip: jSuites.translate('Merge the selected cells'),
        onclick: function () {
            var worksheet = getActive();
            if (worksheet.selectedCell && confirm(jSuites.translate('The merged cells will retain the value of the top-left cell only. Are you sure?'))) {
                var selectedRange = [
                    Math.min(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.min(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                    Math.max(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.max(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                ];
                var cell = getCellNameFromCoords(selectedRange[0], selectedRange[1]);
                if (worksheet.records[selectedRange[1]][selectedRange[0]].element.getAttribute('data-merged')) {
                    worksheet.removeMerge(cell);
                }
                else {
                    var colspan = selectedRange[2] - selectedRange[0] + 1;
                    var rowspan = selectedRange[3] - selectedRange[1] + 1;
                    if (colspan !== 1 || rowspan !== 1) {
                        worksheet.setMerge(cell, colspan, rowspan);
                    }
                }
            }
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        type: 'select',
        options: ['border_all', 'border_outer', 'border_inner', 'border_horizontal', 'border_vertical', 'border_left', 'border_top', 'border_right', 'border_bottom', 'border_clear'],
        columns: 5,
        render: function (e) {
            return '<i class="material-icons">' + e + '</i>';
        },
        right: true,
        onchange: function (a, b, c, d) {
            var worksheet = getActive();
            if (worksheet.selectedCell) {
                var selectedRange = [
                    Math.min(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.min(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                    Math.max(worksheet.selectedCell[0], worksheet.selectedCell[2]),
                    Math.max(worksheet.selectedCell[1], worksheet.selectedCell[3]),
                ];
                var type_1 = d;
                if (selectedRange) {
                    // Default options
                    var thickness_1 = b.thickness || 1;
                    var color_1 = b.color || 'black';
                    var borderStyle_1 = b.style || 'solid';
                    if (borderStyle_1 === 'double') {
                        thickness_1 += 2;
                    }
                    var style_1 = {};
                    // Matrix
                    var px_1 = selectedRange[0];
                    var py_1 = selectedRange[1];
                    var ux_1 = selectedRange[2];
                    var uy_1 = selectedRange[3];
                    var setBorder = function (columnName, i, j) {
                        var border = ['', '', '', ''];
                        if (((type_1 === 'border_top' || type_1 === 'border_outer') && j === py_1) ||
                            ((type_1 === 'border_inner' || type_1 === 'border_horizontal') && j > py_1) ||
                            (type_1 === 'border_all')) {
                            border[0] = 'border-top: ' + thickness_1 + 'px ' + borderStyle_1 + ' ' + color_1;
                        }
                        else {
                            border[0] = 'border-top: ';
                        }
                        if ((type_1 === 'border_all' || type_1 === 'border_right' || type_1 === 'border_outer') && i === ux_1) {
                            border[1] = 'border-right: ' + thickness_1 + 'px ' + borderStyle_1 + ' ' + color_1;
                        }
                        else {
                            border[1] = 'border-right: ';
                        }
                        if ((type_1 === 'border_all' || type_1 === 'border_bottom' || type_1 === 'border_outer') && j === uy_1) {
                            border[2] = 'border-bottom: ' + thickness_1 + 'px ' + borderStyle_1 + ' ' + color_1;
                        }
                        else {
                            border[2] = 'border-bottom: ';
                        }
                        if (((type_1 === 'border_left' || type_1 === 'border_outer') && i === px_1) ||
                            ((type_1 === 'border_inner' || type_1 === 'border_vertical') && i > px_1) ||
                            (type_1 === 'border_all')) {
                            border[3] = 'border-left: ' + thickness_1 + 'px ' + borderStyle_1 + ' ' + color_1;
                        }
                        else {
                            border[3] = 'border-left: ';
                        }
                        style_1[columnName] = border.join(';');
                    };
                    for (var j = selectedRange[1]; j <= selectedRange[3]; j++) { // Row - py - uy
                        for (var i = selectedRange[0]; i <= selectedRange[2]; i++) { // Col - px - ux
                            setBorder(getCellNameFromCoords(i, j), i, j);
                            if (worksheet.records[j][i].element.getAttribute('data-merged')) {
                                setBorder(getCellNameFromCoords(selectedRange[0], selectedRange[1]), i, j);
                            }
                        }
                    }
                    if (Object.keys(style_1)) {
                        worksheet.setStyle(style_1);
                    }
                }
            }
        },
        onload: function (a, b) {
            // Border color
            var container = document.createElement('div');
            var div = document.createElement('div');
            container.appendChild(div);
            var colorPicker = jSuites.color(div, {
                closeOnChange: false,
                onchange: function (o, v) {
                    o.parentNode.children[1].style.color = v;
                    b.color = v;
                },
            });
            var i = document.createElement('i');
            i.classList.add('material-icons');
            i.innerHTML = 'color_lens';
            i.onclick = function () {
                colorPicker.open();
            };
            container.appendChild(i);
            a.children[1].appendChild(container);
            div = document.createElement('div');
            jSuites.picker(div, {
                type: 'select',
                data: [1, 2, 3, 4, 5],
                render: function (e) {
                    return '<div style="height: ' + e + 'px; width: 30px; background-color: black;"></div>';
                },
                onchange: function (a, k, c, d) {
                    b.thickness = d;
                },
                width: '50px',
            });
            a.children[1].appendChild(div);
            var borderStylePicker = document.createElement('div');
            jSuites.picker(borderStylePicker, {
                type: 'select',
                data: ['solid', 'dotted', 'dashed', 'double'],
                render: function (e) {
                    if (e === 'double') {
                        return '<div style="width: 30px; border-top: 3px ' + e + ' black;"></div>';
                    }
                    return '<div style="width: 30px; border-top: 2px ' + e + ' black;"></div>';
                },
                onchange: function (a, k, c, d) {
                    b.style = d;
                },
                width: '50px',
            });
            a.children[1].appendChild(borderStylePicker);
            div = document.createElement('div');
            div.style.flex = '1';
            a.children[1].appendChild(div);
        },
        updateState: function (a, b, toolbarItem) {
            setItemStatus(toolbarItem, getActive());
        }
    });
    items.push({
        type: 'divisor',
    });
    items.push({
        content: 'fullscreen',
        tooltip: 'Toggle Fullscreen',
        onclick: function (a, b, c) {
            if (c.children[0].textContent === 'fullscreen') {
                spreadsheet.fullscreen(true);
                c.children[0].textContent = 'fullscreen_exit';
            }
            else {
                spreadsheet.fullscreen(false);
                c.children[0].textContent = 'fullscreen';
            }
        },
        updateState: function (a, b, c, d) {
            if (d.parent.config.fullscreen === true) {
                c.children[0].textContent = 'fullscreen_exit';
            }
            else {
                c.children[0].textContent = 'fullscreen';
            }
        }
    });
    return items;
};
var adjustToolbarSettingsForJSuites = function (toolbar) {
    var spreadsheet = this;
    var items = toolbar.items;
    var _loop_1 = function (i) {
        // Tooltip
        if (items[i].tooltip) {
            items[i].title = items[i].tooltip;
            delete items[i].tooltip;
        }
        if (items[i].type == 'select') {
            if (items[i].options) {
                items[i].data = items[i].options;
                delete items[i].options;
            }
            else {
                items[i].data = items[i].v;
                delete items[i].v;
                if (items[i].k && !items[i].onchange) {
                    items[i].onchange = function (el, config, value) {
                        var worksheet = getWorksheetInstance.call(spreadsheet);
                        var cells = worksheet.getSelected(true);
                        worksheet.setStyle(Object.fromEntries(cells.map(function (cellName) {
                            return [cellName, items[i].k + ': ' + value];
                        })));
                    };
                }
            }
        }
        else if (items[i].type == 'color') {
            items[i].type = 'i';
            items[i].onclick = function (a, b, c) {
                if (!c.color) {
                    jSuites.color(c, {
                        onchange: function (o, v) {
                            var worksheet = getWorksheetInstance.call(spreadsheet);
                            var cells = worksheet.getSelected(true);
                            worksheet.setStyle(Object.fromEntries(cells.map(function (cellName) {
                                return [cellName, items[i].k + ': ' + v];
                            })));
                        },
                        onopen: function (o) {
                            o.color.select('');
                        }
                    });
                    c.color.open();
                }
            };
        }
    };
    for (var i = 0; i < items.length; i++) {
        _loop_1(i);
    }
};
/**
 * Create toolbar
 */
export var createToolbar = function (toolbar) {
    var spreadsheet = this;
    var toolbarElement = document.createElement('div');
    toolbarElement.classList.add('jss_toolbar');
    adjustToolbarSettingsForJSuites.call(spreadsheet, toolbar);
    if (typeof spreadsheet.plugins === 'object') {
        Object.entries(spreadsheet.plugins).forEach(function (_a) {
            var plugin = _a[1];
            if (typeof plugin.toolbar === 'function') {
                var result = plugin.toolbar(toolbar);
                if (result) {
                    toolbar = result;
                }
            }
        });
    }
    jSuites.toolbar(toolbarElement, toolbar);
    return toolbarElement;
};
export var updateToolbar = function (worksheet) {
    if (worksheet.parent.toolbar) {
        worksheet.parent.toolbar.toolbar.update(worksheet);
    }
};
export var showToolbar = function () {
    var spreadsheet = this;
    if (spreadsheet.config.toolbar && !spreadsheet.toolbar) {
        var toolbar_1;
        if (Array.isArray(spreadsheet.config.toolbar)) {
            toolbar_1 = {
                items: spreadsheet.config.toolbar,
            };
        }
        else if (typeof spreadsheet.config.toolbar === 'object') {
            toolbar_1 = spreadsheet.config.toolbar;
        }
        else {
            toolbar_1 = {
                items: getDefault.call(spreadsheet),
            };
            if (typeof spreadsheet.config.toolbar === 'function') {
                toolbar_1 = spreadsheet.config.toolbar(toolbar_1);
            }
        }
        spreadsheet.toolbar = spreadsheet.element.insertBefore(createToolbar.call(spreadsheet, toolbar_1), spreadsheet.element.children[1]);
    }
};
export var hideToolbar = function () {
    var spreadsheet = this;
    if (spreadsheet.toolbar) {
        spreadsheet.toolbar.parentNode.removeChild(spreadsheet.toolbar);
        delete spreadsheet.toolbar;
    }
};
//# sourceMappingURL=toolbar.js.map