import { createRow } from "./rows";
import { updateCell, updateFormulaChain, updateTable } from "./internal";
import { getIdFromColumnName } from "./internalHelpers";
import dispatch from "./dispatch";
import { setHistory } from "./history";
import { updatePagination } from "./pagination";
import { setMerge } from "./merges";
export var setData = function (data) {
    var obj = this;
    // Update data
    if (data) {
        obj.options.data = data;
    }
    // Data
    if (!obj.options.data) {
        obj.options.data = [];
    }
    // Prepare data - handle both array and object formats
    if (obj.options.data && obj.options.data[0]) {
        if (!Array.isArray(obj.options.data[0])) {
            data = [];
            for (var j_1 = 0; j_1 < obj.options.data.length; j_1++) {
                var row = [];
                for (var i_1 = 0; i_1 < (obj.options.columns || []).length; i_1++) {
                    var columnName = (obj.options.columns || [])[i_1].name || i_1;
                    var dataRow = obj.options.data[j_1];
                    row[i_1] = dataRow[columnName.toString()];
                }
                data.push(row);
            }
            obj.options.data = data;
        }
    }
    // Adjust minimal dimensions
    var j = 0;
    var i = 0;
    var size_i = (obj.options.columns && obj.options.columns.length) || 0;
    var size_j = obj.options.data ? obj.options.data.length : 0;
    var min_i = (obj.options.minDimensions && obj.options.minDimensions[0]) || 0;
    var min_j = (obj.options.minDimensions && obj.options.minDimensions[1]) || 0;
    var max_i = min_i > size_i ? min_i : size_i;
    var max_j = min_j > size_j ? min_j : size_j;
    for (j = 0; j < max_j; j++) {
        for (i = 0; i < max_i; i++) {
            if (obj.options.data[j] == undefined) {
                obj.options.data[j] = [];
            }
            if (obj.options.data[j][i] == undefined) {
                obj.options.data[j][i] = "";
            }
        }
    }
    // Reset containers
    obj.rows = [];
    obj.results = undefined;
    obj.records = [];
    obj.history = [];
    // Reset internal controllers
    obj.historyIndex = -1;
    // Reset data
    obj.tbody.innerHTML = "";
    var startNumber;
    var finalNumber;
    // Lazy loading
    if (obj.options.lazyLoading == true) {
        // Load only 100 records
        startNumber = 0;
        finalNumber = obj.options.data && obj.options.data.length < 100 ? obj.options.data.length : 100;
        if (obj.options.pagination !== undefined && obj.options.pagination) {
            obj.options.pagination = false;
            console.error("Jspreadsheet: Pagination will be disable due the lazyLoading");
        }
    }
    else if (obj.options.pagination) {
        // Pagination
        if (!obj.pageNumber) {
            obj.pageNumber = 0;
        }
        var quantityPerPage = obj.options.pagination;
        startNumber = obj.options.pagination * obj.pageNumber;
        finalNumber =
            obj.options.pagination * obj.pageNumber + obj.options.pagination;
        if (obj.options.data && obj.options.data.length < finalNumber) {
            finalNumber = obj.options.data ? obj.options.data.length : 0;
        }
    }
    else {
        startNumber = 0;
        finalNumber = obj.options.data.length;
    }
    // Append nodes to the HTML
    for (j = 0; j < (obj.options.data ? obj.options.data.length : 0); j++) {
        // Create row
        var row = createRow.call(obj, j, obj.options.data ? obj.options.data[j] : undefined);
        // Append line to the table
        if (j >= startNumber && j < finalNumber) {
            obj.tbody.appendChild(row.element);
        }
    }
    if (obj.options.lazyLoading == true) {
        // Do not create pagination with lazyloading activated
    }
    else if (obj.options.pagination) {
        updatePagination.call(obj);
    }
    // Merge cells
    if (obj.options.mergeCells &&
        typeof obj.options.mergeCells === "object" &&
        !Array.isArray(obj.options.mergeCells)) {
        var keys = Object.keys(obj.options.mergeCells);
        for (var i_2 = 0; i_2 < keys.length; i_2++) {
            var num = obj.options.mergeCells[keys[i_2]];
            setMerge.call(obj, keys[i_2], num[0], num[1], 1);
        }
    }
    // Updata table with custom configurations if applicable
    updateTable.call(obj);
};
/**
 * Get the value from a cell
 *
 * @param object cell
 * @return string value
 */
export var getValue = function (cell, processedValue) {
    var obj = this;
    var x;
    var y;
    if (typeof cell !== "string") {
        return null;
    }
    var cellCoords = getIdFromColumnName(cell, true);
    if (Array.isArray(cellCoords) && cellCoords.length === 2) {
        x = cellCoords[0];
        y = cellCoords[1];
    }
    else if (typeof cellCoords === "string") {
        // Handle the case where it returns a string (shouldn't happen with arr=true)
        var parts = cellCoords.split("-");
        x = parseInt(parts[0]);
        y = parseInt(parts[1]);
    }
    else {
        // Fallback for unexpected return types
        return null;
    }
    var value = null;
    if (x != null && y != null) {
        if (obj.records[y] && obj.records[y][x] && processedValue) {
            value = obj.records[y][x].element.innerHTML;
        }
        else {
            if (obj.options.data[y] && obj.options.data[y][x] != "undefined") {
                value = obj.options.data[y][x];
            }
        }
    }
    return value;
};
/**
 * Get the value from a coords
 *
 * @param int x
 * @param int y
 * @return string value
 */
export var getValueFromCoords = function (x, y, processedValue) {
    var obj = this;
    var value = null;
    if (x != null && y != null) {
        if (obj.records[y] && obj.records[y][x] && processedValue) {
            value = obj.records[y][x].element.innerHTML;
        }
        else {
            if (obj.options.data[y] && obj.options.data[y][x] != "undefined") {
                value = obj.options.data[y][x];
            }
        }
    }
    return value;
};
/**
 * Set a cell value
 *
 * @param mixed cell destination cell
 * @param string value value
 * @return void
 */
export var setValue = function (cell, value, force) {
    var obj = this;
    var records = [];
    if (typeof cell == "string") {
        var columnId = getIdFromColumnName(cell, true);
        if (Array.isArray(columnId) && columnId.length >= 2) {
            var x = columnId[0];
            var y = columnId[1];
            // Update cell
            records.push(updateCell.call(obj, x, y, value, force));
            // Update all formulas in the chain
            updateFormulaChain.call(obj, x, y, records);
        }
    }
    else {
        var x = null;
        var y = null;
        if (Array.isArray(cell) && cell.length >= 2) {
            // cell is a number array [x, y]
            x = cell[0];
            y = cell[1];
        }
        else if (cell && typeof cell === "object" && "getAttribute" in cell) {
            // cell is an HTMLElement with getAttribute
            x = parseInt(cell.getAttribute("data-x") || "", 10);
            y = parseInt(cell.getAttribute("data-y") || "", 10);
        }
        // Update cell
        if (x !== null && y !== null && !isNaN(x) && !isNaN(y)) {
            records.push(updateCell.call(obj, x, y, value, force));
            // Update all formulas in the chain
            updateFormulaChain.call(obj, x, y, records);
        }
        // Update cell
        if (x != null && y != null) {
            records.push(updateCell.call(obj, x, y, value, force));
            // Update all formulas in the chain
            updateFormulaChain.call(obj, x, y, records);
        }
        else {
            var keys = Object.keys(cell);
            if (keys.length > 0) {
                for (var i = 0; i < keys.length; i++) {
                    var x_1 = void 0, y_1 = void 0;
                    if (typeof cell[i] == "string") {
                        var columnId = getIdFromColumnName(cell[i], true);
                        x_1 = columnId[0];
                        y_1 = columnId[1];
                    }
                    else {
                        var currentCell = cell[i];
                        if (typeof currentCell === 'object' && currentCell !== null) {
                            if ('x' in currentCell && 'y' in currentCell && currentCell.x != null && currentCell.y != null) {
                                x_1 = currentCell.x;
                                y_1 = currentCell.y;
                                // Flexible setup
                                if ('value' in currentCell && currentCell.value != null) {
                                    value = currentCell.value;
                                }
                            }
                            else if ('getAttribute' in currentCell) {
                                x_1 = currentCell.getAttribute("data-x");
                                y_1 = currentCell.getAttribute("data-y");
                            }
                        }
                        // Update cell
                        if (x_1 != null && y_1 != null) {
                            records.push(updateCell.call(obj, x_1, y_1, value, force));
                            // Update all formulas in the chain
                            updateFormulaChain.call(obj, x_1, y_1, records);
                        }
                    }
                }
            }
        }
        // Update history
        setHistory.call(obj, {
            action: "setValue",
            records: records,
            selection: obj.selectedCell,
        });
        // Update table with custom configurations if applicable
        updateTable.call(obj);
        // On after changes
        var onafterchangesRecords = records.map(function (record) {
            return {
                x: record.x,
                y: record.y,
                value: record.value,
                oldValue: record.oldValue,
            };
        });
        dispatch.call(obj, "onafterchanges", obj, onafterchangesRecords);
    }
    ;
    /**
     * Set a cell value based on coordinates
     *
     
};
/**
 * Set a cell value based on coordinates
 *
 
//# sourceMappingURL=data_test3.js.map