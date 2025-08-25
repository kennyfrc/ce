var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { getColumnNameFromId } from "./internalHelpers";
/**
 * Get carret position for one element
 */
export var getCaretIndex = function (e) {
    var d;
    if (this.config.root) {
        d = this.config.root;
    }
    else {
        d = window;
    }
    var pos = 0;
    var s = d.getSelection();
    if (s) {
        if (s.rangeCount !== 0) {
            var r = s.getRangeAt(0);
            var p = r.cloneRange();
            p.selectNodeContents(e);
            p.setEnd(r.endContainer, r.endOffset);
            pos = p.toString().length;
        }
    }
    return pos;
};
/**
 * Invert keys and values
 */
export var invert = function (o) {
    var d = [];
    var k = Object.keys(o);
    for (var i = 0; i < k.length; i++) {
        d[o[k[i]]] = k[i];
    }
    return d;
};
/**
 * Get letter based on a number
 *
 * @param {number} columnNumber
 * @return string letter
 */
export var getColumnName = function (columnNumber) {
    var dividend = columnNumber + 1;
    var columnName = "";
    var modulo;
    while (dividend > 0) {
        modulo = (dividend - 1) % 26;
        columnName = String.fromCharCode(65 + modulo).toString() + columnName;
        dividend = parseInt((dividend - modulo) / 26);
    }
    return columnName;
};
/**
 * Get column name from coords
 */
export var getCellNameFromCoords = function (x, y) {
    return getColumnName(parseInt(x)) + (parseInt(y) + 1);
};
export var getCoordsFromCellName = function (columnName) {
    // Get the letters
    var t = /^[a-zA-Z]+/.exec(columnName);
    if (t) {
        // Base 26 calculation
        var code = 0;
        for (var i = 0; i < t[0].length; i++) {
            code +=
                parseInt(t[0].charCodeAt(i) - 64) * Math.pow(26, t[0].length - 1 - i);
        }
        code--;
        // Make sure jspreadsheet starts on zero
        if (code < 0) {
            code = 0;
        }
        // Number
        var number = parseInt(/[0-9]+$/.exec(columnName)) || null;
        if (number > 0) {
            number--;
        }
        return [code, number];
    }
};
export var getCoordsFromRange = function (range) {
    var _a = range.split(":"), start = _a[0], end = _a[1];
    return __spreadArray(__spreadArray([], getCoordsFromCellName(start), true), getCoordsFromCellName(end), true);
};
/**
 * From stack overflow contributions
 */
export var parseCSV = function (str, delimiter) {
    // user-supplied delimeter or default comma
    delimiter = delimiter || ",";
    // Remove last line break
    str = str.replace(/\r?\n$|\r$|\n$/g, "");
    var arr = [];
    var quote = false; // true means we're inside a quoted field
    // iterate over each character, keep track of current row and column (of the returned array)
    var maxCol = 0;
    var row = 0, col = 0;
    for (var c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || "";
        // If the current character is a quotation mark, and we're inside a quoted field, and the next character is also a quotation mark, add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') {
            arr[row][col] += cc;
            ++c;
            continue;
        }
        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') {
            quote = !quote;
            continue;
        }
        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == delimiter && !quote) {
            ++col;
            continue;
        }
        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character and move on to the next row and move to column 0 of that new row
        if (cc == "\r" && nc == "\n" && !quote) {
            ++row;
            maxCol = Math.max(maxCol, col);
            col = 0;
            ++c;
            continue;
        }
        // If it's a newline (LF or CR) and we're not in a quoted field, move on to the next row and move to column 0 of that new row
        if (cc == "\n" && !quote) {
            ++row;
            maxCol = Math.max(maxCol, col);
            col = 0;
            continue;
        }
        if (cc == "\r" && !quote) {
            ++row;
            maxCol = Math.max(maxCol, col);
            col = 0;
            continue;
        }
        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    // fix array length
    arr.forEach(function (row, i) {
        for (var i_1 = row.length; i_1 <= maxCol; i_1++) {
            row.push("");
        }
    });
    return arr;
};
export var createFromTable = function (el, options) {
    if (el.tagName != "TABLE") {
        console.log("Element is not a table");
    }
    else {
        // Configuration
        if (!options) {
            options = {};
        }
        options.columns = [];
        options.data = [];
        // Colgroup
        var colgroup = el.querySelectorAll("colgroup > col");
        if (colgroup.length) {
            // Get column width
            for (var i = 0; i < colgroup.length; i++) {
                var width = colgroup[i].style.width;
                if (!width) {
                    width = colgroup[i].getAttribute("width");
                }
                // Set column width
                if (width) {
                    if (!options.columns[i]) {
                        options.columns[i] = {};
                    }
                    options.columns[i].width = width;
                }
            }
        }
        // Parse header
        var parseHeader = function (header, i) {
            // Get width information
            var info = header.getBoundingClientRect();
            var width = info.width > 50 ? info.width : 50;
            // Create column option
            if (!options.columns[i]) {
                options.columns[i] = {};
            }
            if (header.getAttribute("data-celltype")) {
                options.columns[i].type = header.getAttribute("data-celltype");
            }
            else {
                options.columns[i].type = "text";
            }
            options.columns[i].width = width + "px";
            options.columns[i].title = header.innerHTML;
            if (header.style.textAlign) {
                options.columns[i].align = header.style.textAlign;
            }
            if ((info = header.getAttribute("name"))) {
                options.columns[i].name = info;
            }
            if ((info = header.getAttribute("id"))) {
                options.columns[i].id = info;
            }
            if ((info = header.getAttribute("data-mask"))) {
                options.columns[i].mask = info;
            }
        };
        // Headers
        var nested = [];
        var headers = el.querySelectorAll(":scope > thead > tr");
        if (headers.length) {
            for (var j = 0; j < headers.length - 1; j++) {
                var cells = [];
                for (var i = 0; i < headers[j].children.length; i++) {
                    var row = {
                        title: headers[j].children[i].textContent,
                        colspan: headers[j].children[i].getAttribute("colspan") || 1,
                    };
                    cells.push(row);
                }
                nested.push(cells);
            }
            // Get the last row in the thead
            headers = headers[headers.length - 1].children;
            // Go though the headers
            for (var i = 0; i < headers.length; i++) {
                parseHeader(headers[i], i);
            }
        }
        // Content
        var rowNumber = 0;
        var mergeCells = {};
        var rows = {};
        var style = {};
        var classes = {};
        var content = el.querySelectorAll(":scope > tr, :scope > tbody > tr");
        for (var j = 0; j < content.length; j++) {
            options.data[rowNumber] = [];
            if (options.parseTableFirstRowAsHeader == true &&
                !headers.length &&
                j == 0) {
                for (var i = 0; i < content[j].children.length; i++) {
                    parseHeader(content[j].children[i], i);
                }
            }
            else {
                for (var i = 0; i < content[j].children.length; i++) {
                    // WickedGrid formula compatibility
                    var value = content[j].children[i].getAttribute("data-formula");
                    if (value) {
                        if (value.substr(0, 1) != "=") {
                            value = "=" + value;
                        }
                    }
                    else {
                        value = content[j].children[i].innerHTML;
                    }
                    options.data[rowNumber].push(value);
                    // Key
                    var cellName = getColumnNameFromId([i, j]);
                    // Classes
                    var tmp = content[j].children[i].getAttribute("class");
                    if (tmp) {
                        classes[cellName] = tmp;
                    }
                    // Merged cells
                    var mergedColspan = parseInt(content[j].children[i].getAttribute("colspan")) || 0;
                    var mergedRowspan = parseInt(content[j].children[i].getAttribute("rowspan")) || 0;
                    if (mergedColspan || mergedRowspan) {
                        mergeCells[cellName] = [mergedColspan || 1, mergedRowspan || 1];
                    }
                    // Avoid problems with hidden cells
                    if (content[j].children[i].style &&
                        content[j].children[i].style.display == "none") {
                        content[j].children[i].style.display = "";
                    }
                    // Get style
                    var s = content[j].children[i].getAttribute("style");
                    if (s) {
                        style[cellName] = s;
                    }
                    // Bold
                    if (content[j].children[i].classList.contains("styleBold")) {
                        if (style[cellName]) {
                            style[cellName] += "; font-weight:bold;";
                        }
                        else {
                            style[cellName] = "font-weight:bold;";
                        }
                    }
                }
                // Row Height
                if (content[j].style && content[j].style.height) {
                    rows[j] = { height: content[j].style.height };
                }
                // Index
                rowNumber++;
            }
        }
        // Nested
        if (Object.keys(nested).length > 0) {
            options.nestedHeaders = nested;
        }
        // Style
        if (Object.keys(style).length > 0) {
            options.style = style;
        }
        // Merged
        if (Object.keys(mergeCells).length > 0) {
            options.mergeCells = mergeCells;
        }
        // Row height
        if (Object.keys(rows).length > 0) {
            options.rows = rows;
        }
        // Classes
        if (Object.keys(classes).length > 0) {
            options.classes = classes;
        }
        content = el.querySelectorAll("tfoot tr");
        if (content.length) {
            var footers = [];
            for (var j = 0; j < content.length; j++) {
                var footer = [];
                for (var i = 0; i < content[j].children.length; i++) {
                    footer.push(content[j].children[i].textContent);
                }
                footers.push(footer);
            }
            if (Object.keys(footers).length > 0) {
                options.footers = footers;
            }
        }
        // TODO: data-hiddencolumns="3,4"
        // I guess in terms the better column type
        if (options.parseTableAutoCellType == true) {
            var pattern = [];
            for (var i = 0; i < options.columns.length; i++) {
                var test_1 = true;
                var testCalendar = true;
                pattern[i] = [];
                for (var j = 0; j < options.data.length; j++) {
                    var value = options.data[j][i];
                    if (!pattern[i][value]) {
                        pattern[i][value] = 0;
                    }
                    pattern[i][value]++;
                    if (value.length > 25) {
                        test_1 = false;
                    }
                    if (value.length == 10) {
                        if (!(value.substr(4, 1) == "-" && value.substr(7, 1) == "-")) {
                            testCalendar = false;
                        }
                    }
                    else {
                        testCalendar = false;
                    }
                }
                var keys = Object.keys(pattern[i]).length;
                if (testCalendar) {
                    options.columns[i].type = "calendar";
                }
                else if (test_1 == true &&
                    keys > 1 &&
                    keys <= parseInt(options.data.length * 0.1)) {
                    options.columns[i].type = "dropdown";
                    options.columns[i].source = Object.keys(pattern[i]);
                }
            }
        }
        return options;
    }
};
//# sourceMappingURL=helpers.js.map