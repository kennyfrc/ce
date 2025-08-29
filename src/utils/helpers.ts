import { getColumnNameFromId } from "./internalHelpers";
import type { SpreadsheetOptions, CellValue } from "../types/core";

/**
 * Type guard to check if a string is a valid column type
 */
export function isColumnType(value: string): value is
  | "text"
  | "numeric"
  | "calendar"
  | "dropdown"
  | "checkbox"
  | "color"
  | "hidden"
  | "radio"
  | "image"
  | "html" {
  return [
    "text",
    "numeric",
    "calendar",
    "dropdown",
    "checkbox",
    "color",
    "hidden",
    "radio",
    "image",
    "html"
  ].includes(value);
}

/**
 * Get carret position for one element
 */
export const getCaretIndex = function (
  this: { config?: { root?: { getSelection: () => Selection | null } } },
  e: HTMLElement
) {
  let d: { getSelection: () => Selection | null } | Window | Document;

  if (this.config && this.config.root) {
    d = this.config.root as { getSelection: () => Selection | null };
  } else {
    d = window;
  }
  let pos = 0;
  const owner = d as { getSelection?: () => Selection | null };
  const s = owner.getSelection ? owner.getSelection() : null;
  if (s) {
    if (s.rangeCount !== 0) {
      const r = s.getRangeAt(0);
      const p = r.cloneRange();
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
export const invert = function (
  o: Record<string, string | number | boolean | null | undefined>
) {
  const d: Record<string, string> = {};
  const k = Object.keys(o);
  for (let i = 0; i < k.length; i++) {
    d[String(o[k[i]])] = k[i];
  }
  return d;
};

/**
 * Get letter based on a number
 *
 * @param {number} columnNumber
 * @return string letter
 */
export const getColumnName = function (columnNumber: number): string {
  let dividend = columnNumber + 1;
  let columnName = "";
  let modulo;

  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo).toString() + columnName;
    dividend = parseInt(String((dividend - modulo) / 26));
  }

  return columnName;
};

/**
 * Get column name from coords
 */
export const getCellNameFromCoords = function (
  x: number | string,
  y: number | string
): string {
  return getColumnName(parseInt(String(x))) + (parseInt(String(y)) + 1);
};

export const getCoordsFromCellName = function (columnName: string) {
  // Get the letters
  const t = /^[a-zA-Z]+/.exec(columnName);

  if (t) {
    // Base 26 calculation
    let code = 0;
    for (let i = 0; i < t[0].length; i++) {
      code +=
        parseInt(String(t[0].charCodeAt(i) - 64)) *
        Math.pow(26, t[0].length - 1 - i);
    }
    code--;
    // Make sure jspreadsheet starts on zero
    if (code < 0) {
      code = 0;
    }

    // Number
    const numberMatch = /[0-9]+$/.exec(columnName);
    let number = numberMatch ? parseInt(numberMatch[0]) : null;
    if (number && number > 0) {
      number--;
    }

    return [code, number];
  }
  return [null, null];
};

export const getCoordsFromRange = function (range: string) {
  const [start, end] = range.split(":");
  const startCoords = getCoordsFromCellName(start);
  const endCoords = getCoordsFromCellName(end);

  return [
    ...(startCoords.filter((coord) => coord !== null) as number[]),
    ...(endCoords.filter((coord) => coord !== null) as number[]),
  ];
};

/**
 * From stack overflow contributions
 */
export const parseCSV = function (str: string, delimiter?: string) {
  // user-supplied delimeter or default comma
  delimiter = delimiter || ",";
  // Remove last line break
  str = str.replace(/\r?\n$|\r$|\n$/g, "");

  const arr: string[][] = [];
  let quote = false; // true means we're inside a quoted field
  // iterate over each character, keep track of current row and column (of the returned array)
  let maxCol = 0;
  let row = 0,
    col = 0;
  for (let c = 0; c < str.length; c++) {
    const cc = str[c],
      nc = str[c + 1];
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
  arr.forEach((row, i) => {
    for (let i = row.length; i <= maxCol; i++) {
      row.push("");
    }
  });
  return arr;
};

export const createFromTable = function (el: HTMLElement, options?: Partial<SpreadsheetOptions>) {
  if (el.tagName != "TABLE") {
    console.log("Element is not a table");
    return {};
  } else {
    // Configuration
    if (!options) {
      options = {};
    }

    options.columns = options.columns || [];
    options.data = options.data || [];

    // Colgroup
    const colgroup = el.querySelectorAll("colgroup > col");
    if (colgroup.length) {
      // Get column width
      for (let i = 0; i < colgroup.length; i++) {
        let width = (colgroup[i] as HTMLElement).style.width;
        if (!width) {
          const attrWidth = colgroup[i].getAttribute("width");
          if (attrWidth) {
            width = attrWidth;
          }
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
    const parseHeader = function (header: Element, i: number) {
      // Get width information
      let info = header.getBoundingClientRect();
      const width = info.width > 50 ? info.width : 50;

      // Create column option
      if (!options!.columns) {
        options!.columns = [];
      }
      if (!options!.columns[i]) {
        options!.columns[i] = {};
      }
      const cellTypeAttr = header.getAttribute("data-celltype");
      if (cellTypeAttr && isColumnType(cellTypeAttr)) {
        options!.columns[i].type = cellTypeAttr;
      } else {
        options!.columns[i].type = "text";
      }
      options!.columns[i].width = width + "px";
      options!.columns[i].title = header.innerHTML;
      if ((header as HTMLElement).style.textAlign) {
        options!.columns[i].align = (header as HTMLElement).style.textAlign as "left" | "center" | "right";
      }

      let attrValue;
      if ((attrValue = header.getAttribute("name"))) {
        options!.columns[i].name = attrValue;
      }
      if ((attrValue = header.getAttribute("id"))) {
        options!.columns[i].id = attrValue;
      }
      if ((attrValue = header.getAttribute("data-mask"))) {
        options!.columns[i].mask = attrValue;
      }
    };

    // Headers
    const nested = [];
    let headers = el.querySelectorAll(":scope > thead > tr");
    if (headers.length) {
      for (let j = 0; j < headers.length - 1; j++) {
        const cells = [];
        for (let i = 0; i < headers[j].children.length; i++) {
          const row = {
            title: headers[j].children[i].textContent,
            colspan: headers[j].children[i].getAttribute("colspan") || 1,
          };
          cells.push(row);
        }
        nested.push(cells);
      }
      // Get the last row in the thead
      const headerCells = headers[headers.length - 1].children;
      // Go though the headers
      for (let i = 0; i < headerCells.length; i++) {
        parseHeader(headerCells[i], i);
      }
    }

    // Content
    let rowNumber = 0;
    const mergeCells: Record<string, [number, number]> = {};
    const rows: Record<number, { height: string }> = {};
    const style: Record<string, string> = {};
    const classes: Record<string, string> = {};

    let content = el.querySelectorAll(":scope > tr, :scope > tbody > tr");
    for (let j = 0; j < content.length; j++) {
      options.data[rowNumber] = [];
      if (
        options.parseTableFirstRowAsHeader == true &&
        !headers.length &&
        j == 0
      ) {
        for (let i = 0; i < content[j].children.length; i++) {
          parseHeader(content[j].children[i], i);
        }
      } else {
        for (let i = 0; i < content[j].children.length; i++) {
          // WickedGrid formula compatibility
          let value = content[j].children[i].getAttribute("data-formula");
          if (value) {
            if (value.substr(0, 1) != "=") {
              value = "=" + value;
            }
          } else {
            value = content[j].children[i].innerHTML;
          }
          if (options.data && Array.isArray(options.data[rowNumber])) {
            (options.data[rowNumber] as string[]).push(value);
          }

          // Key
          const cellName = getColumnNameFromId([i, j]);

          // Classes
          const tmp = content[j].children[i].getAttribute("class");
          if (tmp) {
            classes[cellName] = tmp;
          }

          // Merged cells
          const colspanAttr = content[j].children[i].getAttribute("colspan");
          const rowspanAttr = content[j].children[i].getAttribute("rowspan");
          const mergedColspan = colspanAttr ? parseInt(colspanAttr) : 0;
          const mergedRowspan = rowspanAttr ? parseInt(rowspanAttr) : 0;
          if (mergedColspan || mergedRowspan) {
            mergeCells[cellName] = [mergedColspan || 1, mergedRowspan || 1];
          }

          // Avoid problems with hidden cells
          if (
            (content[j].children[i] as HTMLElement).style &&
            (content[j].children[i] as HTMLElement).style.display == "none"
          ) {
            (content[j].children[i] as HTMLElement).style.display = "";
          }
          // Get style
          const s = content[j].children[i].getAttribute("style");
          if (s) {
            style[cellName] = s;
          }
          // Bold
          if (content[j].children[i].classList.contains("styleBold")) {
            if (style[cellName]) {
              style[cellName] += "; font-weight:bold;";
            } else {
              style[cellName] = "font-weight:bold;";
            }
          }
        }

        // Row Height
        if (
          (content[j] as HTMLElement).style &&
          (content[j] as HTMLElement).style.height
        ) {
          rows[j] = { height: (content[j] as HTMLElement).style.height };
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
      options.style = style as Record<string, CSSStyleDeclaration | number>;
    }
    // Merged
    if (Object.keys(mergeCells).length > 0) {
      options.mergeCells = mergeCells as Record<string, [number, number]>;
    }
    // Row height
    if (Object.keys(rows).length > 0) {
      options.rows = rows as RowDefinition[];
    }
    // Classes
    if (Object.keys(classes).length > 0) {
      options.classes = classes;
    }

    content = el.querySelectorAll("tfoot tr");
    if (content.length) {
      const footers = [];
      for (let j = 0; j < content.length; j++) {
        let footer = [];
        for (let i = 0; i < content[j].children.length; i++) {
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
      const pattern: Record<string, number>[] = [];
      for (let i = 0; i < options.columns.length; i++) {
        let test = true;
        let testCalendar = true;
        pattern[i] = {};
        for (let j = 0; j < options!.data!.length; j++) {
          const dataRow: CellValue[] = Array.isArray(options!.data![j]) ? options!.data![j] as CellValue[] : [];
          const value = String(dataRow[i] || '');
          if (!pattern[i][value]) {
            pattern[i][value] = 0;
          }
          pattern[i][value]++;
          if (value.length > 25) {
            test = false;
          }
          if (value.length == 10) {
            if (!(value.substr(4, 1) == "-" && value.substr(7, 1) == "-")) {
              testCalendar = false;
            }
          } else {
            testCalendar = false;
          }
        }

        const keys = Object.keys(pattern[i]).length;
        if (testCalendar) {
          options.columns[i].type = "calendar";
        } else if (
          test == true &&
          keys > 1 &&
          keys <= options.data.length * 0.1
        ) {
          options.columns[i].type = "dropdown";
          options.columns[i].source = Object.keys(pattern[i]);
        }
      }
    }

    return options;
  }
};
