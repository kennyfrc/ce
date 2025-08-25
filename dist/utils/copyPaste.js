import jSuites from 'jsuites';
import { parseCSV } from "./helpers.js";
import dispatch from "./dispatch.js";
import { setHistory } from "./history.js";
import { updateCell, updateFormulaChain, updateTable, updateTableReferences } from "./internal.js";
import { downGet, rightGet } from "./keys.js";
import { hash, removeCopyingSelection, updateSelectionFromCoords } from "./selection.js";
import { getColumnNameFromId } from "./internalHelpers.js";
/**
 * Copy method
 *
 * @param bool highlighted - Get only highlighted cells
 * @param delimiter - \t default to keep compatibility with excel
 * @return string value
 */
export var copy = function (highlighted, delimiter, returnData, includeHeaders, download, isCut, processed) {
    var obj = this;
    if (!delimiter) {
        delimiter = "\t";
    }
    var div = new RegExp(delimiter, 'ig');
    // Controls
    var header = [];
    var col = [];
    var colLabel = [];
    var row = [];
    var rowLabel = [];
    var x = obj.options.data[0].length;
    var y = obj.options.data.length;
    var tmp = '';
    var copyHeader = false;
    var headers = '';
    var nestedHeaders = '';
    var numOfCols = 0;
    var numOfRows = 0;
    // Partial copy
    var copyX = 0;
    var copyY = 0;
    var isPartialCopy = true;
    // Go through the columns to get the data
    for (var j = 0; j < y; j++) {
        for (var i = 0; i < x; i++) {
            // If cell is highlighted
            if (!highlighted || obj.records[j][i].element.classList.contains('highlight')) {
                if (copyX <= i) {
                    copyX = i;
                }
                if (copyY <= j) {
                    copyY = j;
                }
            }
        }
    }
    if (x === copyX + 1 && y === copyY + 1) {
        isPartialCopy = false;
    }
    if (download &&
        (obj.parent.config.includeHeadersOnDownload == true || includeHeaders)) {
        // Nested headers
        if (obj.options.nestedHeaders && obj.options.nestedHeaders.length > 0) {
            tmp = obj.options.nestedHeaders;
            for (var j = 0; j < tmp.length; j++) {
                var nested = [];
                for (var i = 0; i < tmp[j].length; i++) {
                    var colspan = parseInt(tmp[j][i].colspan);
                    nested.push(tmp[j][i].title);
                    for (var c = 0; c < colspan - 1; c++) {
                        nested.push('');
                    }
                }
                nestedHeaders += nested.join(delimiter) + "\r\n";
            }
        }
        copyHeader = true;
    }
    // Reset container
    obj.style = [];
    // Go through the columns to get the data
    for (var j = 0; j < y; j++) {
        col = [];
        colLabel = [];
        for (var i = 0; i < x; i++) {
            // If cell is highlighted
            if (!highlighted || obj.records[j][i].element.classList.contains('highlight')) {
                if (copyHeader == true) {
                    header.push(obj.headers[i].textContent);
                }
                // Values
                var value = obj.options.data[j][i];
                if (value.match && (value.match(div) || value.match(/,/g) || value.match(/\n/) || value.match(/\"/))) {
                    value = value.replace(new RegExp('"', 'g'), '""');
                    value = '"' + value + '"';
                }
                col.push(value);
                // Labels
                var label = void 0;
                if (obj.options.columns &&
                    obj.options.columns[i] &&
                    (obj.options.columns[i].type == 'checkbox' ||
                        obj.options.columns[i].type == 'radio')) {
                    label = value;
                }
                else {
                    label = obj.records[j][i].element.innerHTML;
                    if (label.match && (label.match(div) || label.match(/,/g) || label.match(/\n/) || label.match(/\"/))) {
                        // Scape double quotes
                        label = label.replace(new RegExp('"', 'g'), '""');
                        label = '"' + label + '"';
                    }
                }
                colLabel.push(label);
                // Get style
                tmp = obj.records[j][i].element.getAttribute('style');
                tmp = tmp.replace('display: none;', '');
                obj.style.push(tmp ? tmp : '');
            }
        }
        if (col.length) {
            if (copyHeader) {
                numOfCols = col.length;
                row.push(header.join(delimiter));
            }
            row.push(col.join(delimiter));
        }
        if (colLabel.length) {
            numOfRows++;
            if (copyHeader) {
                rowLabel.push(header.join(delimiter));
                copyHeader = false;
            }
            rowLabel.push(colLabel.join(delimiter));
        }
    }
    if (x == numOfCols && y == numOfRows) {
        headers = nestedHeaders;
    }
    // Final string
    var str = headers + row.join("\r\n");
    var strLabel = headers + rowLabel.join("\r\n");
    // Create a hidden textarea to copy the values
    if (!returnData) {
        // Paste event
        var selectedRange = [
            Math.min(obj.selectedCell[0], obj.selectedCell[2]),
            Math.min(obj.selectedCell[1], obj.selectedCell[3]),
            Math.max(obj.selectedCell[0], obj.selectedCell[2]),
            Math.max(obj.selectedCell[1], obj.selectedCell[3]),
        ];
        var result = dispatch.call(obj, 'oncopy', obj, selectedRange, strLabel, isCut);
        if (result) {
            strLabel = result;
        }
        else if (result === false) {
            return false;
        }
        obj.textarea.value = strLabel;
        obj.textarea.select();
        document.execCommand("copy");
    }
    // Keep data
    if (processed == true) {
        obj.data = strLabel;
    }
    else {
        obj.data = str;
    }
    // Keep non visible information
    obj.hashString = hash.call(obj, obj.data);
    // Any exiting border should go
    if (!returnData) {
        removeCopyingSelection.call(obj);
        // Border
        if (obj.highlighted) {
            for (var i = 0; i < obj.highlighted.length; i++) {
                obj.highlighted[i].element.classList.add('copying');
                if (obj.highlighted[i].element.classList.contains('highlight-left')) {
                    obj.highlighted[i].element.classList.add('copying-left');
                }
                if (obj.highlighted[i].element.classList.contains('highlight-right')) {
                    obj.highlighted[i].element.classList.add('copying-right');
                }
                if (obj.highlighted[i].element.classList.contains('highlight-top')) {
                    obj.highlighted[i].element.classList.add('copying-top');
                }
                if (obj.highlighted[i].element.classList.contains('highlight-bottom')) {
                    obj.highlighted[i].element.classList.add('copying-bottom');
                }
            }
        }
    }
    return obj.data;
};
/**
 * Jspreadsheet paste method
 *
 * @param x target column
 * @param y target row
 * @param data paste data. if data hash is the same as the copied data, apply style from copied cells
 * @return string value
 */
export var paste = function (x, y, data) {
    var obj = this;
    // Controls
    var dataHash = hash(data);
    var style = (dataHash == obj.hashString) ? obj.style : null;
    // Depending on the behavior
    if (dataHash == obj.hashString) {
        data = obj.data;
    }
    // Split new line
    data = parseCSV(data, "\t");
    var ex = obj.selectedCell[2];
    var ey = obj.selectedCell[3];
    var w = ex - x + 1;
    var h = ey - y + 1;
    // Modify data to allow wor extending paste range in multiples of input range
    var srcW = data[0].length;
    if ((w > 1) & Number.isInteger(w / srcW)) {
        var repeats_1 = w / srcW;
        if (style) {
            var newStyle = [];
            for (var i = 0; i < style.length; i += srcW) {
                var chunk = style.slice(i, i + srcW);
                for (var j = 0; j < repeats_1; j++) {
                    newStyle.push.apply(newStyle, chunk);
                }
            }
            style = newStyle;
        }
        ;
        var arrayB = data.map(function (row, i) {
            var arrayC = Array.apply(null, { length: repeats_1 * row.length }).map(function (e, i) { return row[i % row.length]; });
            return arrayC;
        });
        data = arrayB;
    }
    var srcH = data.length;
    if ((h > 1) & Number.isInteger(h / srcH)) {
        var repeats = h / srcH;
        if (style) {
            var newStyle = [];
            for (var j = 0; j < repeats; j++) {
                newStyle.push.apply(newStyle, style);
            }
            style = newStyle;
        }
        ;
        var arrayB = Array.apply(null, { length: repeats * srcH }).map(function (e, i) { return data[i % srcH]; });
        data = arrayB;
    }
    // Paste filter
    var ret = dispatch.call(obj, 'onbeforepaste', obj, data.map(function (row) {
        return row.map(function (item) {
            return { value: item };
        });
    }), x, y);
    if (ret === false) {
        return false;
    }
    else if (ret) {
        data = ret;
    }
    if (x != null && y != null && data) {
        // Records
        var i = 0;
        var j = 0;
        var records = [];
        var newStyle = {};
        var oldStyle = {};
        var styleIndex = 0;
        // Index
        var colIndex = parseInt(x);
        var rowIndex = parseInt(y);
        var row = null;
        var hiddenColCount = obj.headers.slice(colIndex).filter(function (x) { return x.style.display === 'none'; }).length;
        var expandedColCount = colIndex + hiddenColCount + data[0].length;
        var currentColCount = obj.headers.length;
        if (expandedColCount > currentColCount) {
            obj.skipUpdateTableReferences = true;
            obj.insertColumn(expandedColCount - currentColCount);
        }
        var hiddenRowCount = obj.rows.slice(rowIndex).filter(function (x) { return x.element.style.display === 'none'; }).length;
        var expandedRowCount = rowIndex + hiddenRowCount + data.length;
        var currentRowCount = obj.rows.length;
        if (expandedRowCount > currentRowCount) {
            obj.skipUpdateTableReferences = true;
            obj.insertRow(expandedRowCount - currentRowCount);
        }
        if (obj.skipUpdateTableReferences) {
            obj.skipUpdateTableReferences = false;
            updateTableReferences.call(obj);
        }
        // Go through the columns to get the data
        while (row = data[j]) {
            i = 0;
            colIndex = parseInt(x);
            while (row[i] != null) {
                var value = row[i];
                if (obj.options.columns &&
                    obj.options.columns[i] &&
                    (obj.options.columns[i].type == 'calendar')) {
                    value = jSuites.calendar.extractDateFromString(value, (obj.options.columns[i].options && obj.options.columns[i].options.format) || 'YYYY-MM-DD');
                }
                // Update and keep history
                var record = updateCell.call(obj, colIndex, rowIndex, value);
                // Keep history
                records.push(record);
                // Update all formulas in the chain
                updateFormulaChain.call(obj, colIndex, rowIndex, records);
                // Style
                if (style && style[styleIndex]) {
                    var columnName = getColumnNameFromId([colIndex, rowIndex]);
                    newStyle[columnName] = style[styleIndex];
                    oldStyle[columnName] = obj.getStyle(columnName);
                    obj.records[rowIndex][colIndex].element.setAttribute('style', style[styleIndex]);
                    styleIndex++;
                }
                i++;
                if (row[i] != null) {
                    if (colIndex >= obj.headers.length - 1) {
                        // If the pasted column is out of range, create it if possible
                        if (obj.options.allowInsertColumn != false) {
                            obj.insertColumn();
                            // Otherwise skip the pasted data that overflows
                        }
                        else {
                            break;
                        }
                    }
                    colIndex = rightGet.call(obj, colIndex, rowIndex);
                }
            }
            j++;
            if (data[j]) {
                if (rowIndex >= obj.rows.length - 1) {
                    // If the pasted row is out of range, create it if possible
                    if (obj.options.allowInsertRow != false) {
                        obj.insertRow();
                        // Otherwise skip the pasted data that overflows
                    }
                    else {
                        break;
                    }
                }
                rowIndex = downGet.call(obj, x, rowIndex);
            }
        }
        // Select the new cells
        updateSelectionFromCoords.call(obj, x, y, colIndex, rowIndex);
        // Update history
        setHistory.call(obj, {
            action: 'setValue',
            records: records,
            selection: obj.selectedCell,
            newStyle: newStyle,
            oldStyle: oldStyle,
        });
        // Update table
        updateTable.call(obj);
        // Paste event
        var eventRecords = [];
        for (var j_1 = 0; j_1 < data.length; j_1++) {
            for (var i_1 = 0; i_1 < data[j_1].length; i_1++) {
                eventRecords.push({
                    x: i_1 + x,
                    y: j_1 + y,
                    value: data[j_1][i_1],
                });
            }
        }
        dispatch.call(obj, 'onpaste', obj, eventRecords);
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
    removeCopyingSelection();
};
//# sourceMappingURL=copyPaste.js.map