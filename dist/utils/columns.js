var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import jSuites from 'jsuites';
import dispatch from './dispatch.js';
import { getColumnName } from './helpers.js';
import { setHistory } from './history.js';
import { isColMerged } from './merges.js';
import { createCell, updateTableReferences } from './internal.js';
import { conditionalSelectionUpdate, updateCornerPosition } from './selection.js';
import { setFooter } from './footer.js';
import { getColumnNameFromId, injectArray } from './internalHelpers.js';
export var getNumberOfColumns = function () {
    var obj = this;
    var numberOfColumns = (obj.options.columns && obj.options.columns.length) || 0;
    if (obj.options.data && typeof (obj.options.data[0]) !== 'undefined') {
        // Data keys
        var keys = Object.keys(obj.options.data[0]);
        if (keys.length > numberOfColumns) {
            numberOfColumns = keys.length;
        }
    }
    if (obj.options.minDimensions && obj.options.minDimensions[0] > numberOfColumns) {
        numberOfColumns = obj.options.minDimensions[0];
    }
    return numberOfColumns;
};
export var createCellHeader = function (colNumber) {
    var obj = this;
    // Create col global control
    var colWidth = (obj.options.columns && obj.options.columns[colNumber] && obj.options.columns[colNumber].width) || obj.options.defaultColWidth || 100;
    var colAlign = (obj.options.columns && obj.options.columns[colNumber] && obj.options.columns[colNumber].align) || obj.options.defaultColAlign || 'center';
    // Create header cell
    obj.headers[colNumber] = document.createElement('td');
    obj.headers[colNumber].textContent = (obj.options.columns && obj.options.columns[colNumber] && obj.options.columns[colNumber].title) || getColumnName(colNumber);
    obj.headers[colNumber].setAttribute('data-x', colNumber);
    obj.headers[colNumber].style.textAlign = colAlign;
    if (obj.options.columns && obj.options.columns[colNumber] && obj.options.columns[colNumber].title) {
        obj.headers[colNumber].setAttribute('title', obj.headers[colNumber].innerText);
    }
    if (obj.options.columns && obj.options.columns[colNumber] && obj.options.columns[colNumber].id) {
        obj.headers[colNumber].setAttribute('id', obj.options.columns[colNumber].id);
    }
    // Width control
    var colElement = document.createElement('col');
    colElement.setAttribute('width', colWidth);
    obj.cols[colNumber] = {
        colElement: colElement,
        x: colNumber,
    };
    // Hidden column
    if (obj.options.columns && obj.options.columns[colNumber] && obj.options.columns[colNumber].type == 'hidden') {
        obj.headers[colNumber].style.display = 'none';
        colElement.style.display = 'none';
    }
};
/**
 * Insert a new column
 *
 * @param mixed - num of columns to be added or data to be added in one single column
 * @param int columnNumber - number of columns to be created
 * @param bool insertBefore
 * @param object properties - column properties
 * @return void
 */
export var insertColumn = function (mixed, columnNumber, insertBefore, properties) {
    var obj = this;
    // Configuration
    if (obj.options.allowInsertColumn != false) {
        // Records
        var records = [];
        // Data to be insert
        var data = [];
        // The insert could be lead by number of rows or the array of data
        var numOfColumns = void 0;
        if (!Array.isArray(mixed)) {
            numOfColumns = typeof mixed === 'number' ? mixed : 1;
        }
        else {
            numOfColumns = 1;
            if (mixed) {
                data = mixed;
            }
        }
        // Direction
        insertBefore = insertBefore ? true : false;
        // Current column number
        var currentNumOfColumns = Math.max.apply(Math, __spreadArray([obj.options.columns.length], obj.options.data.map(function (row) {
            return row.length;
        }), false));
        var lastColumn = currentNumOfColumns - 1;
        // Confirm position
        if (columnNumber == undefined || columnNumber >= parseInt(lastColumn) || columnNumber < 0) {
            columnNumber = lastColumn;
        }
        // Create default properties
        if (!properties) {
            properties = [];
        }
        for (var i = 0; i < numOfColumns; i++) {
            if (!properties[i]) {
                properties[i] = {};
            }
        }
        var columns = [];
        if (!Array.isArray(mixed)) {
            for (var i = 0; i < mixed; i++) {
                var column = {
                    column: columnNumber + i + (insertBefore ? 0 : 1),
                    options: Object.assign({}, properties[i]),
                };
                columns.push(column);
            }
        }
        else {
            var data_1 = [];
            for (var i = 0; i < obj.options.data.length; i++) {
                data_1.push(i < mixed.length ? mixed[i] : '');
            }
            var column = {
                column: columnNumber + (insertBefore ? 0 : 1),
                options: Object.assign({}, properties[0]),
                data: data_1,
            };
            columns.push(column);
        }
        // Onbeforeinsertcolumn
        if (dispatch.call(obj, 'onbeforeinsertcolumn', obj, columns) === false) {
            return false;
        }
        // Merged cells
        if (obj.options.mergeCells && Object.keys(obj.options.mergeCells).length > 0) {
            if (isColMerged.call(obj, columnNumber, insertBefore).length) {
                if (!confirm(jSuites.translate('This action will destroy any existing merged cells. Are you sure?'))) {
                    return false;
                }
                else {
                    obj.destroyMerge();
                }
            }
        }
        // Insert before
        var columnIndex = (!insertBefore) ? columnNumber + 1 : columnNumber;
        obj.options.columns = injectArray(obj.options.columns, columnIndex, properties);
        // Open space in the containers
        var currentHeaders = obj.headers.splice(columnIndex);
        var currentColgroup = obj.cols.splice(columnIndex);
        // History
        var historyHeaders = [];
        var historyColgroup = [];
        var historyRecords = [];
        var historyData = [];
        var historyFooters = [];
        // Add new headers
        for (var col = columnIndex; col < (numOfColumns + columnIndex); col++) {
            createCellHeader.call(obj, col);
            obj.headerContainer.insertBefore(obj.headers[col], obj.headerContainer.children[col + 1]);
            obj.colgroupContainer.insertBefore(obj.cols[col].colElement, obj.colgroupContainer.children[col + 1]);
            historyHeaders.push(obj.headers[col]);
            historyColgroup.push(obj.cols[col]);
        }
        // Add new footer cells
        if (obj.options.footers) {
            for (var j = 0; j < obj.options.footers.length; j++) {
                historyFooters[j] = [];
                for (var i = 0; i < numOfColumns; i++) {
                    historyFooters[j].push('');
                }
                obj.options.footers[j].splice(columnIndex, 0, historyFooters[j]);
            }
        }
        // Adding visual columns
        for (var row = 0; row < obj.options.data.length; row++) {
            // Keep the current data
            var currentData = obj.options.data[row].splice(columnIndex);
            var currentRecord = obj.records[row].splice(columnIndex);
            // History
            historyData[row] = [];
            historyRecords[row] = [];
            for (var col = columnIndex; col < (numOfColumns + columnIndex); col++) {
                // New value
                var value = data[row] ? data[row] : '';
                obj.options.data[row][col] = value;
                // New cell
                var td = createCell.call(obj, col, row, obj.options.data[row][col]);
                obj.records[row][col] = {
                    element: td,
                    y: row,
                };
                // Add cell to the row
                if (obj.rows[row]) {
                    obj.rows[row].element.insertBefore(td, obj.rows[row].element.children[col + 1]);
                }
                if (obj.options.columns && obj.options.columns[col] && typeof obj.options.columns[col].render === 'function') {
                    obj.options.columns[col].render(td, value, parseInt(col), parseInt(row), obj, obj.options.columns[col]);
                }
                // Record History
                historyData[row].push(value);
                historyRecords[row].push({ element: td, x: col, y: row });
            }
            // Copy the data back to the main data
            Array.prototype.push.apply(obj.options.data[row], currentData);
            Array.prototype.push.apply(obj.records[row], currentRecord);
        }
        Array.prototype.push.apply(obj.headers, currentHeaders);
        Array.prototype.push.apply(obj.cols, currentColgroup);
        for (var i = columnIndex; i < obj.cols.length; i++) {
            obj.cols[i].x = i;
        }
        for (var j = 0; j < obj.records.length; j++) {
            for (var i = 0; i < obj.records[j].length; i++) {
                obj.records[j][i].x = i;
            }
        }
        // Adjust nested headers
        if (obj.options.nestedHeaders &&
            obj.options.nestedHeaders.length > 0 &&
            obj.options.nestedHeaders[0] &&
            obj.options.nestedHeaders[0][0]) {
            for (var j = 0; j < obj.options.nestedHeaders.length; j++) {
                var colspan = parseInt(obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan) + numOfColumns;
                obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan = colspan;
                obj.thead.children[j].children[obj.thead.children[j].children.length - 1].setAttribute('colspan', colspan);
                var o = obj.thead.children[j].children[obj.thead.children[j].children.length - 1].getAttribute('data-column');
                o = o.split(',');
                for (var col = columnIndex; col < (numOfColumns + columnIndex); col++) {
                    o.push(col);
                }
                obj.thead.children[j].children[obj.thead.children[j].children.length - 1].setAttribute('data-column', o);
            }
        }
        // Keep history
        setHistory.call(obj, {
            action: 'insertColumn',
            columnNumber: columnNumber,
            numOfColumns: numOfColumns,
            insertBefore: insertBefore,
            columns: properties,
            headers: historyHeaders,
            cols: historyColgroup,
            records: historyRecords,
            footers: historyFooters,
            data: historyData,
        });
        // Remove table references
        updateTableReferences.call(obj);
        // Events
        dispatch.call(obj, 'oninsertcolumn', obj, columns);
    }
};
/**
 * Move column
 *
 * @return void
 */
export var moveColumn = function (o, d) {
    var obj = this;
    if (obj.options.mergeCells && Object.keys(obj.options.mergeCells).length > 0) {
        var insertBefore = void 0;
        if (o > d) {
            insertBefore = 1;
        }
        else {
            insertBefore = 0;
        }
        if (isColMerged.call(obj, o).length || isColMerged.call(obj, d, insertBefore).length) {
            if (!confirm(jSuites.translate('This action will destroy any existing merged cells. Are you sure?'))) {
                return false;
            }
            else {
                obj.destroyMerge();
            }
        }
    }
    o = parseInt(o);
    d = parseInt(d);
    if (o > d) {
        obj.headerContainer.insertBefore(obj.headers[o], obj.headers[d]);
        obj.colgroupContainer.insertBefore(obj.cols[o].colElement, obj.cols[d].colElement);
        for (var j = 0; j < obj.rows.length; j++) {
            obj.rows[j].element.insertBefore(obj.records[j][o].element, obj.records[j][d].element);
        }
    }
    else {
        obj.headerContainer.insertBefore(obj.headers[o], obj.headers[d].nextSibling);
        obj.colgroupContainer.insertBefore(obj.cols[o].colElement, obj.cols[d].colElement.nextSibling);
        for (var j = 0; j < obj.rows.length; j++) {
            obj.rows[j].element.insertBefore(obj.records[j][o].element, obj.records[j][d].element.nextSibling);
        }
    }
    obj.options.columns.splice(d, 0, obj.options.columns.splice(o, 1)[0]);
    obj.headers.splice(d, 0, obj.headers.splice(o, 1)[0]);
    obj.cols.splice(d, 0, obj.cols.splice(o, 1)[0]);
    var firstAffectedIndex = Math.min(o, d);
    var lastAffectedIndex = Math.max(o, d);
    for (var j = 0; j < obj.rows.length; j++) {
        obj.options.data[j].splice(d, 0, obj.options.data[j].splice(o, 1)[0]);
        obj.records[j].splice(d, 0, obj.records[j].splice(o, 1)[0]);
    }
    for (var i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
        obj.cols[i].x = i;
    }
    for (var j = 0; j < obj.records.length; j++) {
        for (var i = firstAffectedIndex; i <= lastAffectedIndex; i++) {
            obj.records[j][i].x = i;
        }
    }
    // Update footers position
    if (obj.options.footers) {
        for (var j = 0; j < obj.options.footers.length; j++) {
            obj.options.footers[j].splice(d, 0, obj.options.footers[j].splice(o, 1)[0]);
        }
    }
    // Keeping history of changes
    setHistory.call(obj, {
        action: 'moveColumn',
        oldValue: o,
        newValue: d,
    });
    // Update table references
    updateTableReferences.call(obj);
    // Events
    dispatch.call(obj, 'onmovecolumn', obj, o, d, 1);
};
/**
 * Delete a column by number
 *
 * @param integer columnNumber - reference column to be excluded
 * @param integer numOfColumns - number of columns to be excluded from the reference column
 * @return void
 */
export var deleteColumn = function (columnNumber, numOfColumns) {
    var obj = this;
    // Global Configuration
    if (obj.options.allowDeleteColumn != false) {
        if (obj.headers.length > 1) {
            // Delete column definitions
            if (columnNumber == undefined) {
                var number = obj.getSelectedColumns(true);
                if (!number.length) {
                    // Remove last column
                    columnNumber = obj.headers.length - 1;
                    numOfColumns = 1;
                }
                else {
                    // Remove selected
                    columnNumber = parseInt(number[0]);
                    numOfColumns = parseInt(number.length);
                }
            }
            // Lasat column
            var lastColumn = obj.options.data[0].length - 1;
            if (columnNumber == undefined || columnNumber > lastColumn || columnNumber < 0) {
                columnNumber = lastColumn;
            }
            // Minimum of columns to be delete is 1
            if (!numOfColumns) {
                numOfColumns = 1;
            }
            // Can't delete more than the limit of the table
            if (numOfColumns > obj.options.data[0].length - columnNumber) {
                numOfColumns = obj.options.data[0].length - columnNumber;
            }
            var removedColumns = [];
            for (var i = 0; i < numOfColumns; i++) {
                removedColumns.push(i + columnNumber);
            }
            // onbeforedeletecolumn
            if (dispatch.call(obj, 'onbeforedeletecolumn', obj, removedColumns) === false) {
                return false;
            }
            // Can't remove the last column
            if (parseInt(columnNumber) > -1) {
                // Merged cells
                var mergeExists = false;
                if (obj.options.mergeCells && Object.keys(obj.options.mergeCells).length > 0) {
                    for (var col = columnNumber; col < columnNumber + numOfColumns; col++) {
                        if (isColMerged.call(obj, col, null).length) {
                            mergeExists = true;
                        }
                    }
                }
                if (mergeExists) {
                    if (!confirm(jSuites.translate('This action will destroy any existing merged cells. Are you sure?'))) {
                        return false;
                    }
                    else {
                        obj.destroyMerge();
                    }
                }
                // Delete the column properties
                var columns = obj.options.columns ? obj.options.columns.splice(columnNumber, numOfColumns) : undefined;
                for (var col = columnNumber; col < columnNumber + numOfColumns; col++) {
                    obj.cols[col].colElement.className = '';
                    obj.headers[col].className = '';
                    obj.cols[col].colElement.parentNode.removeChild(obj.cols[col].colElement);
                    obj.headers[col].parentNode.removeChild(obj.headers[col]);
                }
                var historyHeaders = obj.headers.splice(columnNumber, numOfColumns);
                var historyColgroup = obj.cols.splice(columnNumber, numOfColumns);
                var historyRecords = [];
                var historyData = [];
                var historyFooters = [];
                for (var row = 0; row < obj.options.data.length; row++) {
                    for (var col = columnNumber; col < columnNumber + numOfColumns; col++) {
                        obj.records[row][col].element.className = '';
                        obj.records[row][col].element.parentNode.removeChild(obj.records[row][col].element);
                    }
                }
                // Delete headers
                for (var row = 0; row < obj.options.data.length; row++) {
                    // History
                    historyData[row] = obj.options.data[row].splice(columnNumber, numOfColumns);
                    historyRecords[row] = obj.records[row].splice(columnNumber, numOfColumns);
                }
                for (var i = columnNumber; i < obj.cols.length; i++) {
                    obj.cols[i].x = i;
                }
                for (var j = 0; j < obj.records.length; j++) {
                    for (var i = columnNumber; i < obj.records[j].length; i++) {
                        obj.records[j][i].x = i;
                    }
                }
                // Delete footers
                if (obj.options.footers) {
                    for (var row = 0; row < obj.options.footers.length; row++) {
                        historyFooters[row] = obj.options.footers[row].splice(columnNumber, numOfColumns);
                    }
                }
                // Remove selection
                conditionalSelectionUpdate.call(obj, 0, columnNumber, (columnNumber + numOfColumns) - 1);
                // Adjust nested headers
                if (obj.options.nestedHeaders &&
                    obj.options.nestedHeaders.length > 0 &&
                    obj.options.nestedHeaders[0] &&
                    obj.options.nestedHeaders[0][0]) {
                    for (var j = 0; j < obj.options.nestedHeaders.length; j++) {
                        var colspan = parseInt(obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan) - numOfColumns;
                        obj.options.nestedHeaders[j][obj.options.nestedHeaders[j].length - 1].colspan = colspan;
                        obj.thead.children[j].children[obj.thead.children[j].children.length - 1].setAttribute('colspan', colspan);
                    }
                }
                // Keeping history of changes
                setHistory.call(obj, {
                    action: 'deleteColumn',
                    columnNumber: columnNumber,
                    numOfColumns: numOfColumns,
                    insertBefore: 1,
                    columns: columns,
                    headers: historyHeaders,
                    cols: historyColgroup,
                    records: historyRecords,
                    footers: historyFooters,
                    data: historyData,
                });
                // Update table references
                updateTableReferences.call(obj);
                // Delete
                dispatch.call(obj, 'ondeletecolumn', obj, removedColumns);
            }
        }
        else {
            console.error('Jspreadsheet: It is not possible to delete the last column');
        }
    }
};
/**
 * Get the column width
 *
 * @param int column column number (first column is: 0)
 * @return int current width
 */
export var getWidth = function (column) {
    var obj = this;
    var data;
    if (typeof column === 'undefined') {
        // Get all headers
        data = [];
        for (var i = 0; i < obj.headers.length; i++) {
            data.push((obj.options.columns && obj.options.columns[i] && obj.options.columns[i].width) || obj.options.defaultColWidth || 100);
        }
    }
    else {
        data = parseInt(obj.cols[column].colElement.getAttribute('width'));
    }
    return data;
};
/**
 * Set the column width
 *
 * @param int column number (first column is: 0)
 * @param int new column width
 * @param int old column width
 */
export var setWidth = function (column, width, oldWidth) {
    var obj = this;
    if (width) {
        if (Array.isArray(column)) {
            // Oldwidth
            if (!oldWidth) {
                oldWidth = [];
            }
            // Set width
            for (var i = 0; i < column.length; i++) {
                if (!oldWidth[i]) {
                    oldWidth[i] = parseInt(obj.cols[column[i]].colElement.getAttribute('width'));
                }
                var w = Array.isArray(width) && width[i] ? width[i] : width;
                obj.cols[column[i]].colElement.setAttribute('width', w);
                if (!obj.options.columns) {
                    obj.options.columns = [];
                }
                if (!obj.options.columns[column[i]]) {
                    obj.options.columns[column[i]] = {};
                }
                obj.options.columns[column[i]].width = w;
            }
        }
        else {
            // Oldwidth
            if (!oldWidth) {
                oldWidth = parseInt(obj.cols[column].colElement.getAttribute('width'));
            }
            // Set width
            obj.cols[column].colElement.setAttribute('width', width);
            if (!obj.options.columns) {
                obj.options.columns = [];
            }
            if (!obj.options.columns[column]) {
                obj.options.columns[column] = {};
            }
            obj.options.columns[column].width = width;
        }
        // Keeping history of changes
        setHistory.call(obj, {
            action: 'setWidth',
            column: column,
            oldValue: oldWidth,
            newValue: width,
        });
        // On resize column
        dispatch.call(obj, 'onresizecolumn', obj, column, width, oldWidth);
        // Update corner position
        updateCornerPosition.call(obj);
    }
};
/**
 * Show column
 */
export var showColumn = function (colNumber) {
    var obj = this;
    if (!Array.isArray(colNumber)) {
        colNumber = [colNumber];
    }
    for (var i = 0; i < colNumber.length; i++) {
        var columnIndex = colNumber[i];
        obj.headers[columnIndex].style.display = '';
        obj.cols[columnIndex].colElement.style.display = '';
        if (obj.filter && obj.filter.children.length > columnIndex + 1) {
            obj.filter.children[columnIndex + 1].style.display = '';
        }
        for (var j = 0; j < obj.options.data.length; j++) {
            obj.records[j][columnIndex].element.style.display = '';
        }
    }
    // Update footers
    if (obj.options.footers) {
        setFooter.call(obj);
    }
    obj.resetSelection();
};
/**
 * Hide column
 */
export var hideColumn = function (colNumber) {
    var obj = this;
    if (!Array.isArray(colNumber)) {
        colNumber = [colNumber];
    }
    for (var i = 0; i < colNumber.length; i++) {
        var columnIndex = colNumber[i];
        obj.headers[columnIndex].style.display = 'none';
        obj.cols[columnIndex].colElement.style.display = 'none';
        if (obj.filter && obj.filter.children.length > columnIndex + 1) {
            obj.filter.children[columnIndex + 1].style.display = 'none';
        }
        for (var j = 0; j < obj.options.data.length; j++) {
            obj.records[j][columnIndex].element.style.display = 'none';
        }
    }
    // Update footers
    if (obj.options.footers) {
        setFooter.call(obj);
    }
    obj.resetSelection();
};
/**
 * Get a column data by columnNumber
 */
export var getColumnData = function (columnNumber, processed) {
    var obj = this;
    var dataset = [];
    // Go through the rows to get the data
    for (var j = 0; j < obj.options.data.length; j++) {
        if (processed) {
            dataset.push(obj.records[j][columnNumber].element.innerHTML);
        }
        else {
            dataset.push(obj.options.data[j][columnNumber]);
        }
    }
    return dataset;
};
/**
 * Set a column data by colNumber
 */
export var setColumnData = function (colNumber, data, force) {
    var obj = this;
    for (var j = 0; j < obj.rows.length; j++) {
        // Update cell
        var columnName = getColumnNameFromId([colNumber, j]);
        // Set value
        if (data[j] != null) {
            obj.setValue(columnName, data[j], force);
        }
    }
};
//# sourceMappingURL=columns.js.map