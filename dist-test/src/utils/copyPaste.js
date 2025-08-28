"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paste = exports.copy = void 0;
const jsuites_1 = __importDefault(require("jsuites"));
const helpers_1 = require("./helpers");
const dispatch_1 = __importDefault(require("./dispatch"));
const history_1 = require("./history");
const internal_1 = require("./internal");
const keys_1 = require("./keys");
const selection_1 = require("./selection");
const internalHelpers_1 = require("./internalHelpers");
/**
 * Copy method
 *
 * @param bool highlighted - Get only highlighted cells
 * @param delimiter - \t default to keep compatibility with excel
 * @return string value
 */
const copy = function (highlighted, delimiter, returnData, includeHeaders, download, isCut, processed) {
    const obj = this;
    if (!delimiter) {
        delimiter = "\t";
    }
    const div = new RegExp(delimiter, "ig");
    // Controls
    const header = [];
    let col = [];
    let colLabel = [];
    const row = [];
    const rowLabel = [];
    const x = obj.options.data[0].length;
    const y = obj.options.data.length;
    let tmp = "";
    let copyHeader = false;
    let headers = "";
    let nestedHeaders = "";
    let numOfCols = 0;
    let numOfRows = 0;
    // Partial copy
    let copyX = 0;
    let copyY = 0;
    let isPartialCopy = true;
    // Go through the columns to get the data
    for (let j = 0; j < y; j++) {
        for (let i = 0; i < x; i++) {
            // If cell is highlighted
            if (!highlighted ||
                obj.records[j][i].element.classList.contains("highlight")) {
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
            for (let j = 0; j < tmp.length; j++) {
                const nested = [];
                for (let i = 0; i < tmp[j].length; i++) {
                    const colspan = parseInt(tmp[j][i].colspan);
                    nested.push(tmp[j][i].title);
                    for (let c = 0; c < colspan - 1; c++) {
                        nested.push("");
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
    for (let j = 0; j < y; j++) {
        col = [];
        colLabel = [];
        for (let i = 0; i < x; i++) {
            // If cell is highlighted
            if (!highlighted ||
                obj.records[j][i].element.classList.contains("highlight")) {
                if (copyHeader == true) {
                    header.push(obj.headers[i].textContent);
                }
                // Values
                let value = obj.options.data[j][i];
                if (value.match &&
                    (value.match(div) ||
                        value.match(/,/g) ||
                        value.match(/\n/) ||
                        value.match(/\"/))) {
                    value = value.replace(new RegExp('"', "g"), '""');
                    value = '"' + value + '"';
                }
                col.push(value);
                // Labels
                let label;
                if (obj.options.columns &&
                    obj.options.columns[i] &&
                    (obj.options.columns[i].type == "checkbox" ||
                        obj.options.columns[i].type == "radio")) {
                    label = value;
                }
                else {
                    label = obj.records[j][i].element.innerHTML;
                    if (label.match &&
                        (label.match(div) ||
                            label.match(/,/g) ||
                            label.match(/\n/) ||
                            label.match(/\"/))) {
                        // Scape double quotes
                        label = label.replace(new RegExp('"', "g"), '""');
                        label = '"' + label + '"';
                    }
                }
                colLabel.push(label);
                // Get style
                tmp = obj.records[j][i].element.getAttribute("style");
                tmp = tmp.replace("display: none;", "");
                obj.style.push(tmp ? tmp : "");
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
    const str = headers + row.join("\r\n");
    let strLabel = headers + rowLabel.join("\r\n");
    // Create a hidden textarea to copy the values
    if (!returnData) {
        // Paste event
        const selectedRange = [
            Math.min(obj.selectedCell[0], obj.selectedCell[2]),
            Math.min(obj.selectedCell[1], obj.selectedCell[3]),
            Math.max(obj.selectedCell[0], obj.selectedCell[2]),
            Math.max(obj.selectedCell[1], obj.selectedCell[3]),
        ];
        const result = dispatch_1.default.call(obj, "oncopy", obj, selectedRange, strLabel, isCut);
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
    obj.hashString = selection_1.hash.call(obj, obj.data);
    // Any exiting border should go
    if (!returnData) {
        selection_1.removeCopyingSelection.call(obj);
        // Border
        if (obj.highlighted) {
            for (let i = 0; i < obj.highlighted.length; i++) {
                obj.highlighted[i].element.classList.add("copying");
                if (obj.highlighted[i].element.classList.contains("highlight-left")) {
                    obj.highlighted[i].element.classList.add("copying-left");
                }
                if (obj.highlighted[i].element.classList.contains("highlight-right")) {
                    obj.highlighted[i].element.classList.add("copying-right");
                }
                if (obj.highlighted[i].element.classList.contains("highlight-top")) {
                    obj.highlighted[i].element.classList.add("copying-top");
                }
                if (obj.highlighted[i].element.classList.contains("highlight-bottom")) {
                    obj.highlighted[i].element.classList.add("copying-bottom");
                }
            }
        }
    }
    return obj.data;
};
exports.copy = copy;
/**
 * Jspreadsheet paste method
 *
 * @param x target column
 * @param y target row
 * @param data paste data. if data hash is the same as the copied data, apply style from copied cells
 * @return string value
 */
const paste = function (x, y, data) {
    const obj = this;
    // Controls
    const dataHash = (0, selection_1.hash)(data);
    let style = dataHash == obj.hashString ? obj.style : null;
    // Depending on the behavior
    if (dataHash == obj.hashString) {
        data = obj.data;
    }
    // Split new line
    data = (0, helpers_1.parseCSV)(data, "\t");
    const ex = obj.selectedCell[2];
    const ey = obj.selectedCell[3];
    const w = ex - x + 1;
    const h = ey - y + 1;
    // Modify data to allow wor extending paste range in multiples of input range
    const srcW = data[0].length;
    if (w > 1 && Number.isInteger(w / srcW)) {
        const repeats = w / srcW;
        if (style) {
            const newStyle = [];
            for (let i = 0; i < style.length; i += srcW) {
                const chunk = style.slice(i, i + srcW);
                for (let j = 0; j < repeats; j++) {
                    newStyle.push(...chunk);
                }
            }
            style = newStyle;
        }
        const arrayB = data.map(function (row, i) {
            const arrayC = Array.from({ length: repeats * row.length }, (e, i) => {
                return row[i % row.length];
            });
            return arrayC;
        });
        data = arrayB;
    }
    const srcH = data.length;
    if (h > 1 && Number.isInteger(h / srcH)) {
        const repeats = h / srcH;
        if (style) {
            const newStyle = [];
            for (let j = 0; j < repeats; j++) {
                newStyle.push(...style);
            }
            style = newStyle;
        }
        const arrayB = Array.from({ length: repeats * srcH }, (e, i) => {
            return data[i % srcH];
        });
        data = arrayB;
    }
    // Paste filter
    const ret = dispatch_1.default.call(obj, "onbeforepaste", obj, data.map(function (row) {
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
        let i = 0;
        let j = 0;
        const records = [];
        const newStyle = {};
        const oldStyle = {};
        let styleIndex = 0;
        // Index
        let colIndex = x;
        let rowIndex = y;
        let row = null;
        const hiddenColCount = obj.headers
            .slice(colIndex)
            .filter((x) => x.style.display === "none").length;
        const expandedColCount = colIndex + hiddenColCount + data[0].length;
        const currentColCount = obj.headers.length;
        if (expandedColCount > currentColCount) {
            obj.skipUpdateTableReferences = true;
            obj.insertColumn(expandedColCount - currentColCount);
        }
        const hiddenRowCount = obj.rows
            .slice(rowIndex)
            .filter((x) => x.element.style.display === "none").length;
        const expandedRowCount = rowIndex + hiddenRowCount + data.length;
        const currentRowCount = obj.rows.length;
        if (expandedRowCount > currentRowCount) {
            obj.skipUpdateTableReferences = true;
            obj.insertRow(expandedRowCount - currentRowCount);
        }
        if (obj.skipUpdateTableReferences) {
            obj.skipUpdateTableReferences = false;
            internal_1.updateTableReferences.call(obj);
        }
        // Go through the columns to get the data
        while ((row = data[j])) {
            i = 0;
            colIndex = x;
            while (row[i] != null) {
                let value = row[i];
                if (obj.options.columns &&
                    obj.options.columns[i] &&
                    obj.options.columns[i].type == "calendar") {
                    value = jsuites_1.default.calendar.extractDateFromString(value, (obj.options.columns[i].options &&
                        obj.options.columns[i].options.format) ||
                        "YYYY-MM-DD");
                }
                // Update and keep history
                const record = internal_1.updateCell.call(obj, colIndex, rowIndex, value);
                // Keep history
                records.push(record);
                // Update all formulas in the chain
                internal_1.updateFormulaChain.call(obj, colIndex, rowIndex, records);
                // Style
                if (style && style[styleIndex]) {
                    const columnName = (0, internalHelpers_1.getColumnNameFromId)([colIndex, rowIndex]);
                    newStyle[columnName] = style[styleIndex];
                    oldStyle[columnName] = obj.getStyle(columnName);
                    obj.records[rowIndex][colIndex].element.setAttribute("style", style[styleIndex]);
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
                    colIndex = keys_1.rightGet.call(obj, colIndex, rowIndex);
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
                rowIndex = keys_1.downGet.call(obj, x, rowIndex);
            }
        }
        // Select the new cells
        selection_1.updateSelectionFromCoords.call(obj, x, y, colIndex, rowIndex);
        // Update history
        history_1.setHistory.call(obj, {
            action: "setValue",
            records: records,
            selection: obj.selectedCell,
            newStyle: newStyle,
            oldStyle: oldStyle,
        });
        // Update table
        internal_1.updateTable.call(obj);
        // Paste event
        const eventRecords = [];
        for (let j = 0; j < data.length; j++) {
            for (let i = 0; i < data[j].length; i++) {
                eventRecords.push({
                    x: i + x,
                    y: j + y,
                    value: data[j][i],
                });
            }
        }
        dispatch_1.default.call(obj, "onpaste", obj, eventRecords);
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
    (0, selection_1.removeCopyingSelection)();
    return true;
};
exports.paste = paste;
