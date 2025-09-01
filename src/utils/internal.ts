import jSuites from "jsuites";
import formula from "@jspreadsheet/formula";

import dispatch from "./dispatch";
import { refreshSelection, updateCornerPosition } from "./selection";
import { getColumnName } from "./helpers";
import { updateMeta } from "./meta";
import { getFreezeWidth } from "./freeze";
import {
    SpreadsheetContext,
    WorksheetInstance,
    CellValue,
    NestedHeader,
} from "../types/core";
import { updatePagination } from "./pagination";
import { setFooter } from "./footer";
import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers";

/**
 * Safely get cell value from data array, handling both array and object shapes
 */
function getCellValue(data: CellValue[][] | Record<string, CellValue>[] | undefined, row: number, col: number): CellValue {
    if (!data || !data[row]) return "";
    if (Array.isArray(data[row])) {
        return (data[row] as CellValue[])[col] || "";
    } else {
        return (data[row] as Record<string, CellValue>)[col] || "";
    }
}

export const updateTable = function(this: WorksheetInstance) {
    const obj = this;

    // Check for spare
    if (obj.options.minSpareRows && obj.options.minSpareRows > 0) {
        let numBlankRows = 0;
        for (let j = obj.rows.length - 1; j >= 0; j--) {
            let test = false;
            for (let i = 0; i < obj.headers.length; i++) {
                if (getCellValue(obj.options.data, j, i)) {
                    test = true;
                }
            }
            if (test) {
                break;
            } else {
                numBlankRows++;
            }
        }

        if (
            obj.options.minSpareRows &&
            obj.options.minSpareRows - numBlankRows > 0 &&
            typeof obj.insertRow === "function"
        ) {
            obj.insertRow(obj.options.minSpareRows - numBlankRows);
        }
    }

    if (obj.options.minSpareCols && obj.options.minSpareCols > 0) {
        let numBlankCols = 0;
        for (let i = obj.headers.length - 1; i >= 0; i--) {
            let test = false;
            for (let j = 0; j < obj.rows.length; j++) {
                if (getCellValue(obj.options.data, j, i)) {
                    test = true;
                }
            }
            if (test) {
                break;
            } else {
                numBlankCols++;
            }
        }

        if (obj.options.minSpareCols - numBlankCols > 0 && typeof obj.insertColumn === "function") {
            obj.insertColumn(obj.options.minSpareCols - numBlankCols);
        }
    }

    // Update footers
    if (obj.options.footers) {
        setFooter.call(obj);
    }

    // Update corner position
    setTimeout(function() {
        updateCornerPosition.call(obj);
    }, 0);
};

/**
 * Trying to extract a number from a string
 */
const parseNumber = function(
    this: WorksheetInstance,
    value: CellValue,
    columnNumber: number
): number | null {
    const obj = this;

    // Decimal point
    const decimal =
        columnNumber &&
            obj.options.columns &&
            obj.options.columns[columnNumber] &&
            obj.options.columns[columnNumber].decimal
            ? obj.options.columns[columnNumber].decimal
            : ".";

    // Parse both parts of the number
    const numberStr = "" + value;
    const numberParts = numberStr.split(decimal);
    const matchResult0 = numberParts[0].match(/[+-]?[0-9]/g);
    const number0 = matchResult0 ? matchResult0.join("") : "";
    let number1 = "";
    if (numberParts[1]) {
        const matchResult1 = numberParts[1].match(/[0-9]*/g);
        number1 = matchResult1 ? matchResult1.join("") : "";
    }

    // Is a valid number
    if (number0 && Number.isInteger(Number(number0))) {
        if (!number1) {
            value = Number(number0 + ".00");
        } else {
            value = Number(number0 + "." + number1);
        }
    } else {
        value = null;
    }

    return value;
};

/**
 * Parse formulas
 */
export const executeFormula = function(
    this: WorksheetInstance,
    expression: string,
    x: number,
    y: number
): CellValue {
    const obj = this;

    const formulaResults: Record<string, unknown> = {};
    const formulaLoopProtection: Record<string, boolean> = {};

    // Execute formula with loop protection
    const execute = function(expression: string, x: number, y: number): unknown {
        // Parent column identification
        const parentId = getColumnNameFromId([x, y]);

        // Code protection
        if (formulaLoopProtection.hasOwnProperty(parentId)) {
            console.error("Reference loop detected");
            return "#ERROR";
        }

        formulaLoopProtection[parentId] = true;

        // Convert range tokens
        const tokensUpdate = function(tokens: string[]) {
            for (let index = 0; index < tokens.length; index++) {
                const f = [];
                const token = tokens[index].split(":");
                const e1 = getIdFromColumnName(token[0], true) as number[];
                const e2 = getIdFromColumnName(token[1], true) as number[];

                let x1, x2;

                if (e1[0] <= e2[0]) {
                    x1 = e1[0];
                    x2 = e2[0];
                } else {
                    x1 = e2[0];
                    x2 = e1[0];
                }

                let y1, y2;

                if (e1[1] <= e2[1]) {
                    y1 = e1[1];
                    y2 = e2[1];
                } else {
                    y1 = e2[1];
                    y2 = e1[1];
                }

                for (let j = y1; j <= y2; j++) {
                    for (let i = x1; i <= x2; i++) {
                        f.push(getColumnNameFromId([i, j]));
                    }
                }

                expression = expression.replace(tokens[index], f.join(","));
            }
        };

        // Range with $ remove $
        expression = expression.replace(/\$?([A-Z]+)\$?([0-9]+)/g, "$1$2");

        let tokens = expression.match(/([A-Z]+[0-9]+)\:([A-Z]+[0-9]+)/g);
        if (tokens && tokens.length) {
            tokensUpdate(tokens);
        }

        // Get tokens
        tokens = expression.match(/([A-Z]+[0-9]+)/g);

        // Direct self-reference protection
        if (tokens && tokens.indexOf(parentId) > -1) {
            console.error("Self Reference detected");
            return "#ERROR";
        } else {
            // Expressions to be used in the parsing
            const formulaExpressions: Record<string, unknown> = {};

            if (tokens) {
                for (let i = 0; i < tokens.length; i++) {
                    // Keep chain
                    if (obj.formula && !obj.formula[tokens[i]]) {
                        obj.formula[tokens[i]] = [];
                    }
                    // Is already in the register
                    if (
                        obj.formula &&
                        obj.formula[tokens[i]] &&
                        obj.formula[tokens[i]].indexOf(parentId) < 0
                    ) {
                        obj.formula[tokens[i]].push(parentId);
                    }

                    // Do not calculate again
                    if (eval("typeof(" + tokens[i] + ') == "undefined"')) {
                        // Coords
                        const position = getIdFromColumnName(tokens[i], true) as number[];
                        // Get value
                        let value;

                        value = getCellValue(obj.options.data, position[1], position[0]);
                        // Get column data
                        if (("" + value).substr(0, 1) == "=") {
                            if (typeof formulaResults[tokens[i]] !== "undefined") {
                                value = formulaResults[tokens[i]];
                            } else {
                                value = execute(String(value), position[0], position[1]);
                                formulaResults[tokens[i]] = value;
                            }
                        }
                        // Type!
                        if (("" + value).trim() == "") {
                            // Null
                            formulaExpressions[tokens[i]] = null;
                        } else {
                            if (
                                value == Number(value) &&
                                obj.parent.config.autoCasting != false
                            ) {
                                // Number
                                formulaExpressions[tokens[i]] = Number(value);
                            } else {
                                // Trying any formatted number
                                const number = parseNumber.call(
                                    obj,
                                    value as CellValue,
                                    position[0]
                                );
                                if (obj.parent.config.autoCasting != false && number) {
                                    formulaExpressions[tokens[i]] = number;
                                } else {
                                    formulaExpressions[tokens[i]] = '"' + String(value || "") + '"';
                                }
                            }
                        }
                    }
                }
            }

            const ret = dispatch.call(obj, "onbeforeformula", obj, expression, x, y);
            if (ret === false) {
                return expression;
            } else if (ret) {
                expression = String(ret);
            }

            // Convert formula to javascript
            let res;

            try {
                res = formula(expression.substr(1), formulaExpressions, x, y);

                if (typeof res === "function") {
                    res = "#ERROR";
                }
            } catch (e) {
                res = "#ERROR";

                if (obj.parent.config.debugFormulas === true) {
                    console.log(expression.substr(1), formulaExpressions, e);
                }
            }

            return res;
        }
    };

    return execute(expression, x, y) as CellValue;
};

export const parseValue = function(
    this: WorksheetInstance,
    i: number,
    j: number,
    value: CellValue,
    cell: HTMLElement
): CellValue {
    const obj = this;

    if (
        ("" + value).substr(0, 1) == "=" &&
        obj.parent.config.parseFormulas != false
    ) {
        value = executeFormula.call(obj, String(value), i, j);
    }

    // Column options
    const options = obj.options.columns && obj.options.columns[i];
    if (options && !isFormula(value)) {
        // Mask options
        let opt = null;
        if ((opt = getMask(options))) {
            if (value && value == Number(value)) {
                value = Number(value);
            }
            // Process the decimals to match the mask
            let masked = jSuites.mask.render(typeof value === "string" || typeof value === "number" ? value : String(value), opt, true);
            // Negative indication
            if (
                cell &&
                opt &&
                typeof opt === "object" &&
                "mask" in opt &&
                typeof opt.mask === "string"
            ) {
                const t = opt.mask.split(";");
                if (t[1]) {
                    const t1 = t[1].match(new RegExp("\\[Red\\]", "gi"));
                    if (t1) {
                        if (typeof value === "number" && value < 0) {
                            cell.classList.add("red");
                        } else {
                            cell.classList.remove("red");
                        }
                    }
                    const t2 = t[1].match(new RegExp("\\(", "gi"));
                    if (t2) {
                        if (typeof value === "number" && value < 0) {
                            masked = "(" + masked + ")";
                        }
                    }
                }
            }

            if (masked) {
                value = masked;
            }
        }
    }

    return value;
};

/**
 * Get dropdown value from key
 */
const getDropDownValue = function(
    this: WorksheetInstance,
    column: number,
    key: string | number
): string | number | null {
    const obj = this;

    const value = [];

    if (
        obj.options.columns &&
        obj.options.columns[column] &&
        obj.options.columns[column].source
    ) {
        // Create array from source
        const combo: Record<string | number, string | number> = {};
        const source = obj.options.columns[column].source as Array<
            string | number | { id: string | number; name: string }
        >;

        for (let i = 0; i < source.length; i++) {
            if (typeof source[i] == "object") {
                const item = source[i] as { id: string | number; name: string };
                combo[item.id] = item.name;
            } else {
                combo[source[i] as string | number] = source[i] as string | number;
            }
        }

        // Guarantee single multiple compatibility
        const keys = Array.isArray(key) ? key : ("" + key).split(";");

        for (let i = 0; i < keys.length; i++) {
            if (typeof keys[i] === "object") {
                value.push(combo[keys[i].id]);
            } else {
                if (combo[keys[i]]) {
                    value.push(combo[keys[i]]);
                }
            }
        }
    } else {
        console.error("Invalid column");
    }

    return value.length > 0 ? value.join("; ") : "";
};

const validDate = function(date: unknown): boolean {
    const dateStr = String(date);
    if (dateStr.substr(4, 1) == "-" && dateStr.substr(7, 1) == "-") {
        return true;
    } else {
        const dateParts = dateStr.split("-");
        if (
            dateParts[0].length == 4 &&
            Number(dateParts[0]).toString() == dateParts[0] &&
            dateParts[1].length == 2 &&
            Number(dateParts[1]).toString() == dateParts[1]
        ) {
            return true;
        }
    }
    return false;
};

/**
 * Strip tags
 */
const stripScript = function(a: string): string {
    const b = new Option();
    b.innerHTML = a;
    let c = null;
    const scripts = b.getElementsByTagName("script");
    for (let i = 0; i < scripts.length; i++) {
        scripts[i].parentNode?.removeChild(scripts[i]);
    }
    return b.innerHTML;
};

export const createCell = function(
    this: WorksheetInstance,
    i: number,
    j: number,
    value: CellValue
): HTMLElement {
    const obj = this;

    // Create cell and properties
    let td = document.createElement("td");
    td.setAttribute("data-x", i.toString());
    td.setAttribute("data-y", j.toString());

    if (obj.headers[i].style.display === "none") {
        td.style.display = "none";
    }
    // Security
    if (("" + value).substr(0, 1) == "=" && obj.options.secureFormulas == true) {
        const val = secureFormula("" + value);
        if (val != value) {
            // Update the data container
            value = val;
        }
    }

    // Custom column
    if (
        obj.options.columns &&
        obj.options.columns[i] &&
        typeof obj.options.columns[i].type === "object"
    ) {
        if (obj.parent.config.parseHTML === true) {
            td.innerHTML = String(value);
        } else {
            td.textContent = String(value);
        }
        if (typeof obj.options.columns[i].type.createCell == "function") {
            obj.options.columns[i].type.createCell(
                td,
                value,
                i,
                j,
                obj,
                obj.options.columns[i]
            );
        }
    } else {
        // Hidden column
        if (
            obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].type == "hidden"
        ) {
            td.style.display = "none";
            td.textContent = String(value);
        } else if (
            obj.options.columns &&
            obj.options.columns[i] &&
            (obj.options.columns[i].type == "checkbox" ||
                obj.options.columns[i].type == "radio")
        ) {
            // Create input
            const element = document.createElement("input");
            element.type = obj.options.columns[i].type;
            element.name = "c" + i;
            element.checked =
                value == 1 || value == true || value == "true" ? true : false;
            element.onclick = function() {
                if (typeof obj.setValue === "function") {
                    obj.setValue(
                        getColumnName(i) + (j + 1),
                        (this as HTMLInputElement).checked
                    );
                }
            };

            if (
                obj.options.columns[i].readOnly == true ||
                obj.options.editable == false
            ) {
                element.setAttribute("disabled", "disabled");
            }

            // Append to the table
            td.appendChild(element);
            // Make sure the values are correct
            if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[j]) {
                (obj.options.data as CellValue[][])[j][i] = element.checked;
            }
        } else if (
            obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].type == "calendar"
        ) {
            // Try formatted date
            let formatted = null;
            if (!validDate(value)) {
                const tmp = jSuites.calendar.extractDateFromString(
                    String(value),
                    (obj.options.columns[i].options &&
                        obj.options.columns[i].options.format) ||
                    "YYYY-MM-DD"
                );
                if (tmp) {
                    formatted = tmp;
                }
            }
            // Create calendar cell
            const dateValue = formatted ? (formatted as Date) : new Date(String(value));
            td.textContent = jSuites.calendar.getDateString(
                dateValue,
                (obj.options.columns[i].options && obj.options.columns[i].options.format) || "YYYY-MM-DD"
            );
        } else if (
            obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].type == "dropdown"
        ) {
            // Create dropdown cell
            td.classList.add("jss_dropdown");
            td.textContent = String(getDropDownValue.call(obj, i, String(value)));
        } else if (
            obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].type == "color"
        ) {
            if (obj.options.columns[i].render == "square") {
                const color = document.createElement("div");
                color.className = "color";
                color.style.backgroundColor = String(value);
                td.appendChild(color);
            } else {
                td.style.color = String(value);
                td.textContent = String(value);
            }
        } else if (
            obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].type == "image"
        ) {
            if (value && String(value).substr(0, 10) == "data:image") {
                const img = document.createElement("img");
                img.src = String(value);
                td.appendChild(img);
            }
        } else {
            if (
                obj.options.columns &&
                obj.options.columns[i] &&
                obj.options.columns[i].type == "html"
            ) {
                td.innerHTML = stripScript(String(parseValue.call(this, i, j, value, td)));
            } else {
                if (obj.parent.config.parseHTML === true) {
                    td.innerHTML = stripScript(String(parseValue.call(this, i, j, value, td)));
                } else {
                    td.textContent = String(parseValue.call(this, i, j, value, td));
                }
            }
        }
    }

    // Readonly
    if (
        obj.options.columns &&
        obj.options.columns[i] &&
        obj.options.columns[i].readOnly == true
    ) {
        td.className = "readonly";
    }

    // Text align
    const colAlign =
        (obj.options.columns &&
            obj.options.columns[i] &&
            obj.options.columns[i].align) ||
        obj.options.defaultColAlign ||
        "center";
    td.style.textAlign = String(colAlign);

    // Wrap option
    if (
        (!obj.options.columns ||
            !obj.options.columns[i] ||
            obj.options.columns[i].wordWrap != false) &&
        (obj.options.wordWrap == true ||
            (obj.options.columns &&
                obj.options.columns[i] &&
                obj.options.columns[i].wordWrap == true) ||
            td.innerHTML.length > 200)
    ) {
        td.style.whiteSpace = "pre-wrap";
    }

    // Overflow
    if (i > 0) {
        if (this.options.textOverflow == true) {
            if (value || td.innerHTML) {
                if (obj.records[j] && obj.records[j][i - 1]) {
                    obj.records[j][i - 1].element.style.overflow = "hidden";
                }
            } else {
                if (obj.options.columns && i == obj.options.columns.length - 1) {
                    td.style.overflow = "hidden";
                }
            }
        }
    }

    dispatch.call(obj, "oncreatecell", obj, td, i, j, value);

    return td;
};

/**
 * Update cell content
 *
 * @param object cell
 * @return void
 */
export const updateCell = function(
    this: WorksheetInstance,
    x: number,
    y: number,
    value: CellValue,
    force?: boolean
) {
    const obj = this;

    let record;

    // Changing value depending on the column type
    if (
        obj.records[y] && obj.records[y][x] &&
        obj.records[y][x].element.classList.contains("readonly") == true &&
        !force
    ) {
        // Do nothing
        record = {
            x: x,
            y: y,
            col: x,
            row: y,
        };
    } else {
        // Security
        if (
            ("" + value).substr(0, 1) == "=" &&
            obj.options.secureFormulas == true
        ) {
            const val = secureFormula("" + value);
            if (val != value) {
                // Update the data container
                value = val;
            }
        }

        // On change
        const val = obj.records[y] && obj.records[y][x] ? dispatch.call(
            obj,
            "onbeforechange",
            obj,
            obj.records[y][x].element,
            x,
            y,
            value
        ) : undefined;

        // If you return something this will overwrite the value
        if (val != undefined) {
            value = val as CellValue;
        }

        if (
            obj.options.columns &&
            obj.options.columns[x] &&
            typeof obj.options.columns[x].type === "object" &&
            obj.options.columns[x].type &&
            typeof (obj.options.columns[x].type as { updateCell?: Function }).updateCell === "function" &&
            obj.records[y] &&
            obj.records[y][x]
        ) {
            const result = (obj.options.columns[x].type as { updateCell: Function }).updateCell(
                obj.records[y][x].element,
                value,
                "" + x,
                "" + y,
                obj,
                obj.options.columns[x]
            );

            if (result !== undefined) {
                value = result;
            }
        }

        // History format
        record = {
            x: x,
            y: y,
            col: x,
            row: y,
            value: value,
            oldValue: obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y] ? (obj.options.data as CellValue[][])[y][x] : undefined,
        };

        let editor =
            obj.options.columns &&
                obj.options.columns[x] &&
                typeof obj.options.columns[x].type === "object"
                ? obj.options.columns[x].type
                : null;
        if (editor) {
            // Update data and cell
            if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y]) {
                (obj.options.data as CellValue[][])[y][x] = value;
            }
            if (typeof (editor as { setValue?: Function }).setValue === "function" && obj.records[y] && obj.records[y][x]) {
                (editor as { setValue: Function }).setValue(obj.records[y][x].element, value);
            }
        } else {
            // Native functions
            if (
                obj.options.columns &&
                obj.options.columns[x] &&
                (obj.options.columns[x].type == "checkbox" ||
                    obj.options.columns[x].type == "radio")
            ) {
                // Unchecked all options
                if (obj.options.columns[x].type == "radio" && obj.options.data && Array.isArray(obj.options.data)) {
                    for (let j = 0; j < obj.options.data.length; j++) {
                        if (obj.options.data[j]) {
                            (obj.options.data as CellValue[][])[j][x] = false;
                        }
                    }
                }

                // Update data and cell
                if (obj.records[y] && obj.records[y][x]) {
                    const checkboxElement = obj.records[y][x].element.children[0] as HTMLInputElement;
                    checkboxElement.checked =
                        value == 1 || value == true || value == "true" || value == "TRUE"
                            ? true
                            : false;
                    if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y]) {
                        (obj.options.data as CellValue[][])[y][x] = checkboxElement.checked;
                    }
                }
            } else if (
                obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "dropdown"
            ) {
                // Update data and cell
                if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y]) {
                    (obj.options.data as CellValue[][])[y][x] = value;
                }
                if (obj.records[y] && obj.records[y][x]) {
                    const dropdownValue = value !== null && typeof value !== 'boolean' ? getDropDownValue.call(obj, x, value) : null;
                    obj.records[y][x].element.textContent = dropdownValue !== null ? String(dropdownValue) : null;
                }
            } else if (
                obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "calendar"
            ) {
                // Try formatted date
                let formatted = null;
                if (!validDate(value)) {
                    const tmp = jSuites.calendar.extractDateFromString(
                        String(value),
                        (obj.options.columns[x].options &&
                            obj.options.columns[x].options.format) ||
                        "YYYY-MM-DD"
                    );
                    if (tmp) {
                        formatted = tmp;
                    }
                }
                // Update data and cell
                if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y]) {
                    (obj.options.data as CellValue[][])[y][x] = value;
                }
                if (obj.records[y] && obj.records[y][x]) {
                    const dateValue = formatted || new Date(String(value));
                    obj.records[y][x].element.textContent = jSuites.calendar.getDateString(
                        dateValue,
                        (obj.options.columns[x].options &&
                            obj.options.columns[x].options.format) ||
                        "YYYY-MM-DD"
                    );
                }
            } else if (
                obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "color"
            ) {
                // Update color
                if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y]) {
                    (obj.options.data as CellValue[][])[y][x] = value;
                }
                // Render
                if (obj.options.columns[x].render == "square" && obj.records[y] && obj.records[y][x]) {
                    const color = document.createElement("div");
                    color.className = "color";
                    color.style.backgroundColor = String(value);
                    obj.records[y][x].element.textContent = "";
                    obj.records[y][x].element.appendChild(color);
                } else if (obj.records[y] && obj.records[y][x]) {
                    obj.records[y][x].element.style.color = String(value);
                    obj.records[y][x].element.textContent = String(value);
                }
            } else if (
                obj.options.columns &&
                obj.options.columns[x] &&
                obj.options.columns[x].type == "image"
            ) {
                value = "" + value;
                if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y]) {
                    (obj.options.data as CellValue[][])[y][x] = value;
                }
                if (obj.records[y] && obj.records[y][x]) {
                    obj.records[y][x].element.innerHTML = "";
                    if (value && String(value).substr(0, 10) == "data:image") {
                        const img = document.createElement("img");
                        img.src = String(value);
                        obj.records[y][x].element.appendChild(img);
                    }
                }
            } else {
                // Update data and cell
                if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[y]) {
                    (obj.options.data as CellValue[][])[y][x] = value;
                }
                // Label
                if (
                    obj.options.columns &&
                    obj.options.columns[x] &&
                    obj.options.columns[x].type == "html" &&
                    obj.records[y] &&
                    obj.records[y][x]
                ) {
                    const parsedValue = parseValue.call(obj, x, y, value, obj.records[y][x].element);
                    obj.records[y][x].element.innerHTML = stripScript(String(parsedValue));
                } else {
                    if (obj.parent.config.parseHTML === true && obj.records[y] && obj.records[y][x]) {
                        const parsedValue = parseValue.call(obj, x, y, value, obj.records[y][x].element);
                        obj.records[y][x].element.innerHTML = stripScript(String(parsedValue));
                    } else if (obj.records[y] && obj.records[y][x]) {
                        const parsedValue = parseValue.call(obj, x, y, value, obj.records[y][x].element);
                        obj.records[y][x].element.textContent = String(parsedValue);
                    }
                }
                // Handle big text inside a cell
                if (
                    (!obj.options.columns ||
                        !obj.options.columns[x] ||
                        obj.options.columns[x].wordWrap != false) &&
                    (obj.options.wordWrap == true ||
                        (obj.options.columns &&
                            obj.options.columns[x] &&
                            obj.options.columns[x].wordWrap == true) ||
                        obj.records[y][x].element.innerHTML.length > 200)
                ) {
                    obj.records[y][x].element.style.whiteSpace = "pre-wrap";
                } else {
                    obj.records[y][x].element.style.whiteSpace = "";
                }
            }
        }

        // Overflow
        if (x > 0) {
            if (value) {
                obj.records[y][x - 1].element.style.overflow = "hidden";
            } else {
                obj.records[y][x - 1].element.style.overflow = "";
            }
        }

        if (
            obj.options.columns &&
            obj.options.columns[x] &&
            typeof obj.options.columns[x].render === "function"
        ) {
            obj.options.columns[x].render(
                obj.records[y] && obj.records[y][x] ? obj.records[y][x].element : null,
                value,
                "" + x,
                "" + y,
                obj,
                obj.options.columns[x]
            );
        }

        // On change
        dispatch.call(
            obj,
            "onchange",
            obj,
            obj.records[y] && obj.records[y][x] ? obj.records[y][x].element : null,
            x,
            y,
            value,
            record.oldValue
        );
    }

    return record;
};

/**
 * The value is a formula
 */
export const isFormula = function(value: unknown): boolean {
    const v = ("" + value)[0];
    return v == "=" || v == "#" ? true : false;
};

/**
 * Get the mask in the jSuites.mask format
 */
export const getMask = function(
    o: ColumnDefinition
): Record<string, unknown> | null {
    if (o.format || o.mask || o.locale) {
        const opt: Record<string, unknown> = {};
        if (o.mask) {
            opt.mask = o.mask;
        } else if (o.format) {
            opt.mask = o.format;
        } else {
            opt.locale = o.locale;
            opt.options = o.options;
        }

        if (o.decimal) {
            if (!opt.options) {
                opt.options = {};
            }
            opt.options = { decimal: o.decimal };
        }
        return opt;
    }

    return null;
};

/**
 * Secure formula
 */
const secureFormula = function(oldValue: string): string {
    let newValue = "";
    let inside = 0;

    for (let i = 0; i < oldValue.length; i++) {
        if (oldValue[i] == '"') {
            if (inside == 0) {
                inside = 1;
            } else {
                inside = 0;
            }
        }

        if (inside == 1) {
            newValue += oldValue[i];
        } else {
            newValue += oldValue[i].toUpperCase();
        }
    }

    return newValue;
};

/**
 * Update all related cells in the chain
 */
let chainLoopProtection: Record<string, boolean> = {};

export const updateFormulaChain = function(
    this: WorksheetInstance,
    x: number,
    y: number,
    records: Array<{ x: number; y: number; col: number; row: number }>
) {
    const obj = this;

    const cellId = getColumnNameFromId([x, y]);
    if (obj.formula && obj.formula[cellId] && obj.formula[cellId].length > 0) {
        if (chainLoopProtection.hasOwnProperty(cellId)) {
            if (obj.records[y] && obj.records[y][x]) {
                obj.records[y][x].element.innerHTML = "#ERROR";
            }
            if (obj.formula) {
                obj.formula[cellId] = [];
            }
        } else {
            // Protection
            chainLoopProtection[cellId] = true;

            for (let i = 0; i < obj.formula[cellId].length; i++) {
                const cell = getIdFromColumnName(
                    obj.formula[cellId][i],
                    true
                ) as number[];
                // Update cell
                let cellValue = "";
                if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data[cell[1]] && Array.isArray(obj.options.data[cell[1]]) && typeof cell[0] === 'number' && cell[0] < (obj.options.data[cell[1]] as CellValue[]).length && (obj.options.data[cell[1]] as CellValue[])[cell[0]] !== undefined) {
                    cellValue = "" + (obj.options.data[cell[1]] as CellValue[])[cell[0]];
                }
                if (cellValue.substr(0, 1) == "=") {
                    records.push(updateCell.call(obj, cell[0], cell[1], cellValue, true));
                } else {
                    // No longer a formula, remove from the chain
                    if (obj.formula) {
                        delete obj.formula[Object.keys(obj.formula)[i]];
                    }
                }
                updateFormulaChain.call(obj, cell[0], cell[1], records);
            }
        }
    }

    chainLoopProtection = {};
};

/**
 * Update formula
 */
export const updateFormula = function(
    formula: string,
    referencesToUpdate: Record<string, string>
): string {
    const testLetter = /[A-Z]/;
    const testNumber = /[0-9]/;

    let newFormula = "";
    let letter = null;
    let number = null;
    let token = "";

    for (let index = 0; index < formula.length; index++) {
        if (testLetter.exec(formula[index])) {
            letter = 1;
            number = 0;
            token += formula[index];
        } else if (testNumber.exec(formula[index])) {
            number = letter ? 1 : 0;
            token += formula[index];
        } else {
            if (letter && number) {
                token = referencesToUpdate[token] ? referencesToUpdate[token] : token;
            }
            newFormula += token;
            newFormula += formula[index];
            letter = 0;
            number = 0;
            token = "";
        }
    }

    if (token) {
        if (letter && number) {
            token = referencesToUpdate[token] ? referencesToUpdate[token] : token;
        }
        newFormula += token;
    }

    return newFormula;
};

/**
 * Update formulas
 */
const updateFormulas = function(
    this: WorksheetInstance,
    referencesToUpdate: Record<string, string>
): void {
    const obj = this;

    // Update formulas
    if (obj.options.data && Array.isArray(obj.options.data) && obj.options.data.length > 0 && Array.isArray(obj.options.data[0])) {
        for (let j = 0; j < obj.options.data.length; j++) {
            for (let i = 0; i < obj.options.data[0].length; i++) {
                const value = "" + (obj.options.data as CellValue[][])[j][i];
                // Is formula
                if (value.substr(0, 1) == "=") {
                    // Replace tokens
                    const newFormula = updateFormula(value, referencesToUpdate);
                    if (newFormula != value) {
                        (obj.options.data as CellValue[][])[j][i] = newFormula;
                    }
                }
            }
        }
    }

    // Update formula chain
    const formula: Record<string, string[]> = {};
    const keys = obj.formula ? Object.keys(obj.formula) : [];
    for (let j = 0; j < keys.length; j++) {
        // Current key and values
        let key = keys[j];
        const value = obj.formula![key];
        // Update key
        if (referencesToUpdate[key]) {
            key = referencesToUpdate[key];
        }
        // Update values
        formula[key] = [];
        for (let i = 0; i < value.length; i++) {
            let letter = value[i];
            if (referencesToUpdate[letter]) {
                letter = referencesToUpdate[letter];
            }
            formula[key].push(letter);
        }
    }
    obj.formula = formula;
};

/**
 * Update cell references
 *
 * @return void
 */
export const updateTableReferences = function(this: WorksheetInstance): void {
    const obj = this;
    if (obj.skipUpdateTableReferences) {
        return;
    }

    // Update headers
    for (let i = 0; i < obj.headers.length; i++) {
        const x = obj.headers[i].getAttribute("data-x");

        if (x !== null && parseInt(x) !== i) {
            // Update coords
            obj.headers[i].setAttribute("data-x", i.toString());
            // Title
            if (!obj.headers[i].getAttribute("title")) {
                obj.headers[i].innerHTML = getColumnName(i);
            }
        }
    }

    // Update all rows
    for (let j = 0; j < obj.rows.length; j++) {
        if (obj.rows[j]) {
            const y = obj.rows[j].element.getAttribute("data-y");

            if (y !== null && parseInt(y) !== j) {
                // Update coords
                obj.rows[j].element.setAttribute("data-y", j.toString());
                obj.rows[j].element.children[0].setAttribute("data-y", j.toString());
                // Row number
                obj.rows[j].element.children[0].innerHTML = (j + 1).toString();
            }
        }
    }

    // Regular cells affected by this change
    const affectedTokens: Record<string, string> = {};
    const mergeCellUpdates: Record<string, false | [string, number, number]> = {};

    // Update cell
    const updatePosition = function(x: number, y: number, i: number, j: number) {
        if (x != i) {
            obj.records[j][i].element.setAttribute("data-x", i.toString());
        }
        if (y != j) {
            obj.records[j][i].element.setAttribute("data-y", j.toString());
        }

        // Other updates
        if (x != i || y != j) {
            const columnIdFrom = getColumnNameFromId([x, y]);
            const columnIdTo = getColumnNameFromId([i, j]);
            affectedTokens[columnIdFrom] = columnIdTo;
        }
    };

    for (let j = 0; j < obj.records.length; j++) {
        for (let i = 0; i < obj.records[0].length; i++) {
            if (obj.records[j][i]) {
                // Current values
                const xAttr = obj.records[j][i].element.getAttribute("data-x");
                const yAttr = obj.records[j][i].element.getAttribute("data-y");
                const x = xAttr !== null ? parseInt(xAttr) : null;
                const y = yAttr !== null ? parseInt(yAttr) : null;

                // Update column
                if (obj.records[j][i].element.getAttribute("data-merged")) {
                    if (x !== null && y !== null) {
                        const columnIdFrom = getColumnNameFromId([x, y]);
                        const columnIdTo = getColumnNameFromId([i, j]);
                        if (mergeCellUpdates[columnIdFrom] == null) {
                            if (columnIdFrom == columnIdTo) {
                                mergeCellUpdates[columnIdFrom] = false;
                            } else {
                                const totalX = i - x;
                                const totalY = j - y;
                                mergeCellUpdates[columnIdFrom] = [columnIdTo, totalX, totalY];
                            }
                        }
                    }
                } else if (x !== null && y !== null) {
                    updatePosition(x, y, i, j);
                }
            }
        }
    }

    // Update merged if applicable
    const keys = Object.keys(mergeCellUpdates);
    if (keys.length) {
        for (let i = 0; i < keys.length; i++) {
            const mergeUpdate = mergeCellUpdates[keys[i]];
            if (mergeUpdate !== false && mergeUpdate !== null && mergeUpdate !== undefined) {
                const info = getIdFromColumnName(keys[i], true);
                if (Array.isArray(info) && info.length >= 2) {
                    let x = typeof info[0] === 'number' ? info[0] : parseInt(info[0]);
                    let y = typeof info[1] === 'number' ? info[1] : parseInt(info[1]);
                    updatePosition(
                        x,
                        y,
                        x + mergeUpdate[1],
                        y + mergeUpdate[2]
                    );
                }

                const columnIdFrom = keys[i];
                const columnIdTo = mergeUpdate[0];

                // Guard against missing mergeCells or false values
                if (obj.options.mergeCells && obj.options.mergeCells[columnIdFrom] !== false && obj.options.mergeCells[columnIdFrom] !== null && obj.options.mergeCells[columnIdFrom] !== undefined) {
                    const mergeCellEntry = obj.options.mergeCells[columnIdFrom];
                    let x: number, y: number;
                    for (
                        let j = 0;
                        j < mergeCellEntry[2].length;
                        j++
                    ) {
                        x = parseInt(
                            mergeCellEntry[2][j].getAttribute("data-x") || "0"
                        );
                        y = parseInt(
                            mergeCellEntry[2][j].getAttribute("data-y") || "0"
                        );
                        mergeCellEntry[2][j].setAttribute(
                            "data-x",
                            (x + mergeUpdate[1]).toString()
                        );
                        mergeCellEntry[2][j].setAttribute(
                            "data-y",
                            (y + mergeUpdate[2]).toString()
                        );
                    }

                    obj.options.mergeCells[columnIdTo] = mergeCellEntry;
                    delete obj.options.mergeCells[columnIdFrom];
                }
            }
        }
    }

    // Update formulas
    updateFormulas.call(obj, affectedTokens);

    // Update meta data
    updateMeta.call(obj, affectedTokens);

    // Refresh selection
    refreshSelection.call(obj);

    // Update table with custom configuration if applicable
    updateTable.call(obj);
};

/**
 * Update scroll position based on the selection
 */
export const updateScroll = function(
    this: WorksheetInstance,
    direction: number
): void {
    const obj = this;

    // Guard against missing content
    if (!obj.content) {
        return;
    }

    // Jspreadsheet Container information
    const contentRect = obj.content.getBoundingClientRect();
    const x1 = contentRect.left;
    const y1 = contentRect.top;
    const w1 = contentRect.width;
    const h1 = contentRect.height;

    // Direction Left or Up
    const reference = obj.selectedCell &&
        obj.records[obj.selectedCell[3]] &&
        obj.records[obj.selectedCell[3]][obj.selectedCell[2]]
        ? obj.records[obj.selectedCell[3]][obj.selectedCell[2]].element
        : null;

    // Guard against missing reference
    if (!reference) {
        return;
    }

    // Reference
    const referenceRect = reference.getBoundingClientRect();
    const x2 = referenceRect.left;
    const y2 = referenceRect.top;
    const w2 = referenceRect.width;
    const h2 = referenceRect.height;

    let x, y;

    // Direction
    if (direction == 0 || direction == 1) {
        x = x2 - x1 + obj.content.scrollLeft;
        y = y2 - y1 + obj.content.scrollTop - 2;
    } else {
        x = x2 - x1 + obj.content.scrollLeft + w2;
        y = y2 - y1 + obj.content.scrollTop + h2;
    }

    // Top position check
    if (y > obj.content.scrollTop + 30 && y < obj.content.scrollTop + h1) {
        // In the viewport
    } else {
        // Out of viewport
        if (y < obj.content.scrollTop + 30) {
            obj.content.scrollTop = y - h2;
        } else {
            obj.content.scrollTop = y - (h1 - 2);
        }
    }

    // Freeze columns?
    const freezed = getFreezeWidth.call(obj);

    // Left position check - TODO: change that to the bottom border of the element
    if (x > obj.content.scrollLeft + freezed && x < obj.content.scrollLeft + w1) {
        // In the viewport
    } else {
        // Out of viewport
        if (x < obj.content.scrollLeft + 30) {
            obj.content.scrollLeft = x;
            if (obj.content.scrollLeft < 50) {
                obj.content.scrollLeft = 0;
            }
        } else if (x < obj.content.scrollLeft + freezed) {
            obj.content.scrollLeft = x - freezed - 1;
        } else {
            obj.content.scrollLeft = x - (w1 - 20);
        }
    }
};

export const updateResult = function(this: SpreadsheetContext) {
    const obj = this;

    let total = 0;
    let index = 0;

    // Page 1
    if (obj.options.lazyLoading == true) {
        total = 100;
    } else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
        total = obj.options.pagination;
    } else {
        if (obj.results) {
            total = obj.results.length;
        } else {
            total = obj.rows.length;
        }
    }

    // Reset current nodes
    while (obj.tbody.firstChild) {
        obj.tbody.removeChild(obj.tbody.firstChild);
    }

    // Hide all records from the table
    for (let j = 0; j < obj.rows.length; j++) {
        if (!obj.results || obj.results.indexOf(j) > -1) {
            if (index < total) {
                obj.tbody.appendChild(obj.rows[j].element);
                index++;
            }
            obj.rows[j].element.style.display = "";
        } else {
            obj.rows[j].element.style.display = "none";
        }
    }

    // Update pagination
    if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
        updatePagination.call(obj);
    }

    updateCornerPosition.call(obj);

    return total;
};

/**
 * Get the cell object
 *
 * @param object cell
 * @return string value
 */
export const getCell = function(
    this: WorksheetInstance,
    x: string | number,
    y: number
): HTMLElement {
    const obj = this;

    if (typeof x === "string") {
        // Convert in case name is excel liked ex. A10, BB92
        const cell = getIdFromColumnName(x, true);

        if (Array.isArray(cell) && cell.length >= 2) {
            x = typeof cell[0] === 'number' ? cell[0] : parseInt(String(cell[0])) || 0;
            y = typeof cell[1] === 'number' ? cell[1] : parseInt(String(cell[1])) || 0;
        }
    }

    // Ensure x and y are numbers for indexing
    const colIndex = typeof x === 'number' ? x : parseInt(String(x)) || 0;
    const rowIndex = typeof y === 'number' ? y : parseInt(String(y)) || 0;

    return obj.records[rowIndex][colIndex].element;
};

/**
 * Get the cell object from coords
 *
 * @param object cell
 * @return string value
 */
export const getCellFromCoords = function(
    this: WorksheetInstance,
    x: number,
    y: number
): HTMLElement {
    const obj = this;

    return obj.records[y][x].element;
};

/**
 * Get label
 *
 * @param object cell
 * @return string value
 */
export const getLabel = function(
    this: WorksheetInstance,
    x: string | number,
    y: number
): string {
    const obj = this;

    if (typeof x === "string") {
        // Convert in case name is excel liked ex. A10, BB92
        const cell = getIdFromColumnName(x, true);

        if (Array.isArray(cell) && cell.length >= 2) {
            x = typeof cell[0] === 'number' ? cell[0] : parseInt(String(cell[0])) || 0;
            y = typeof cell[1] === 'number' ? cell[1] : parseInt(String(cell[1])) || 0;
        }
    }

    // Ensure x and y are numbers for indexing
    const colIndex = typeof x === 'number' ? x : parseInt(String(x)) || 0;
    const rowIndex = typeof y === 'number' ? y : parseInt(String(y)) || 0;

    return obj.records[rowIndex][colIndex].element.innerHTML;
};

/**
 * Activate/Disable fullscreen
 * use programmatically : table.fullscreen(); or table.fullscreen(true); or table.fullscreen(false);
 * @Param {boolean} activate
 */
export const fullscreen = function(
    this: SpreadsheetContext,
    activate?: boolean
): void {
    const spreadsheet = this;

    // If activate not defined, get reverse options.fullscreen
    if (activate == null) {
        activate = !spreadsheet.config.fullscreen;
    }

    // If change
    if (spreadsheet.config.fullscreen != activate) {
        spreadsheet.config.fullscreen = activate;

        // Test LazyLoading conflict
        if (activate == true) {
            spreadsheet.element.classList.add("fullscreen");
        } else {
            spreadsheet.element.classList.remove("fullscreen");
        }
    }
};

/**
 * Show index column
 */
export const showIndex = function(this: SpreadsheetContext) {
    const obj = this;

    obj.table.classList.remove("jss_hidden_index");
};

/**
 * Hide index column
 */
export const hideIndex = function(this: SpreadsheetContext) {
    const obj = this;

    obj.table.classList.add("jss_hidden_index");
};

/**
 * Create a nested header object
 */
export const createNestedHeader = function(
    this: SpreadsheetContext,
    nestedInformation: NestedHeader[]
): HTMLElement {
    const obj = this;

    const tr = document.createElement("tr");
    tr.classList.add("jss_nested");
    const td = document.createElement("td");
    td.classList.add("jss_selectall");

    tr.appendChild(td);
    // Element
    (nestedInformation as NestedHeader[] & { element: HTMLElement }).element = tr;

    let headerIndex = 0;
    for (let i = 0; i < nestedInformation.length; i++) {
        // Default values
        if (!nestedInformation[i].colspan) {
            nestedInformation[i].colspan = 1;
        }
        if (!nestedInformation[i].title) {
            nestedInformation[i].title = "";
        }
        if (!nestedInformation[i].id) {
            nestedInformation[i].id = "";
        }

        // Number of columns
        const colspanValue = nestedInformation[i].colspan;
        let numberOfColumns: number = typeof colspanValue === 'number'
            ? colspanValue
            : parseInt(String(colspanValue || 1)) || 1;

        // Classes container
        const column = [];
        // Header classes for this cell
        for (let x = 0; x < numberOfColumns; x++) {
            if (
                obj.options.columns &&
                obj.options.columns[headerIndex] &&
                obj.options.columns[headerIndex].type == "hidden"
            ) {
                numberOfColumns++;
            }
            column.push(headerIndex);
            headerIndex++;
        }

        // Created the nested cell
        const td = document.createElement("td");
        td.setAttribute("data-column", column.join(","));
        td.setAttribute("colspan", String(nestedInformation[i].colspan || 1));
        td.setAttribute("align", nestedInformation[i].align || "center");
        if (nestedInformation[i].id) {
            td.setAttribute("id", String(nestedInformation[i].id));
        }
        td.textContent = nestedInformation[i].title || "";
        tr.appendChild(td);
    }

    return tr;
};

export const getWorksheetActive = function(
    this: WorksheetInstance | SpreadsheetContext
): number {
    const spreadsheet = this.parent ? this.parent : this;

    return spreadsheet.element.tabs ? spreadsheet.element.tabs.getActive() : 0;
};

export const getWorksheetInstance = function(
    this: SpreadsheetContext,
    index?: number
): WorksheetInstance {
    const spreadsheet = this;

    const worksheetIndex =
        typeof index !== "undefined" ? index : getWorksheetActive.call(spreadsheet);

    return spreadsheet.worksheets[worksheetIndex];
};
