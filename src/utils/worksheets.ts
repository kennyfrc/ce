import jSuites from "jsuites";

import libraryBase from "./libraryBase";
import { WorksheetInstance, SpreadsheetInstance, SpreadsheetOptions, CellValue } from "../types/core";

import { parseCSV } from "./helpers";
import {
  createCellHeader,
  deleteColumn,
  getColumnData,
  getNumberOfColumns,
  getWidth,
  hideColumn,
  insertColumn,
  moveColumn,
  setColumnData,
  setWidth,
  showColumn,
} from "./columns";
import {
  getData,
  getDataFromRange,
  getValue,
  getValueFromCoords,
  setData,
  setValue,
  setValueFromCoords,
} from "./data";
import { cutControls, scrollControls, wheelControls } from "./events";
import {
  getHighlighted,
  getRange,
  getSelected,
  getSelectedColumns,
  getSelectedRows,
  getSelection,
  isSelected,
  resetSelection,
  selectAll,
  updateSelectionFromCoords,
} from "./selection";
import {
  deleteRow,
  getHeight,
  getRowData,
  hideRow,
  insertRow,
  moveRow,
  setHeight,
  setRowData,
  showRow,
} from "./rows";
import { destroyMerge, getMerge, removeMerge, setMerge } from "./merges";
import { resetSearch, search } from "./search";
import { getHeader, getHeaders, setHeader } from "./headers";
import { getStyle, resetStyle, setStyle } from "./style";
import { page, quantiyOfPages, whichPage } from "./pagination";
import { download } from "./download";
import { down, first, last, left, right, up } from "./keys";
import {
  createNestedHeader,
  executeFormula,
  getCell,
  getCellFromCoords,
  getLabel,
  getWorksheetActive,
  hideIndex,
  showIndex,
} from "./internal";
import { getComments, setComments } from "./comments";
import { orderBy } from "./orderBy";
import { getWorksheetConfig, setConfig } from "./config";
import { getMeta, setMeta } from "./meta";
import { closeEditor, openEditor } from "./editor";
import dispatch from "./dispatch";
import { getIdFromColumnName } from "./internalHelpers";
import { copy, paste } from "./copyPaste";
import { isReadOnly, setReadOnly } from "./cells";
import { openFilter, resetFilters } from "./filter";
import { redo, undo } from "./history";

// Narrow plugin shapes used by this module (avoid blanket `any` casts)
type PluginWithHooks = {
  beforeinit?: (worksheet: WorksheetInstance) => void;
  init?: (worksheet: WorksheetInstance) => void;
  [key: string]: unknown;
};

const setWorksheetFunctions = function (worksheet: WorksheetInstance) {
  for (let i = 0; i < worksheetPublicMethodsLength; i++) {
    const [methodName, method] = worksheetPublicMethods[i] as [string, Function];

    (worksheet as Record<string, unknown>)[methodName] = method.bind(worksheet);
  }
};

const createTable = function (this: WorksheetInstance) {
  let obj = this;

  setWorksheetFunctions(obj);

  // Elements
  obj.table = document.createElement("table");
  obj.thead = document.createElement("thead");
  obj.tbody = document.createElement("tbody");

  // Create headers controllers
  obj.headers = [];
  obj.cols = [];

  // Create table container
  obj.content = document.createElement("div");
  obj.content.classList.add("jss_content");
  obj.content.onscroll = function (e: Event) {
    scrollControls.call(obj, e);
  };
  obj.content.onwheel = function (e: WheelEvent) {
    wheelControls.call(obj, e);
  };

  // Search
  const searchContainer = document.createElement("div");

  const searchLabel = document.createElement("label");
  searchLabel.innerHTML = jSuites.translate("Search") + ": ";
  searchContainer.appendChild(searchLabel);

  obj.searchInput = document.createElement("input");
  obj.searchInput.classList.add("jss_search");
  searchLabel.appendChild(obj.searchInput);
  obj.searchInput.onfocus = function () {
    if (typeof obj.resetSelection === "function") {
      obj.resetSelection();
    }
  };

  // Pagination select option
  const paginationUpdateContainer = document.createElement("div");

  if (
    obj.options.pagination &&
    typeof obj.options.pagination === "number" &&
    obj.options.pagination > 0 &&
    obj.options.paginationOptions &&
    Array.isArray(obj.options.paginationOptions) &&
    obj.options.paginationOptions.length > 0
  ) {
    obj.paginationDropdown = document.createElement("select");
    obj.paginationDropdown.classList.add("jss_pagination_dropdown");
    obj.paginationDropdown.onchange = function () {
      const selectElement = this as HTMLSelectElement;
      obj.options.pagination = parseInt(selectElement.value || "0");
      if (typeof obj.page === "function") {
        obj.page(0);
      }
    };

    for (let i = 0; i < obj.options.paginationOptions.length; i++) {
      const temp = document.createElement("option");
      temp.value = String(obj.options.paginationOptions[i]);
      temp.innerHTML = String(obj.options.paginationOptions[i]);
      obj.paginationDropdown.appendChild(temp);
    }

    // Set initial pagination value
    obj.paginationDropdown.value = String(obj.options.pagination);

    paginationUpdateContainer.appendChild(
      document.createTextNode(jSuites.translate("Show "))
    );
    paginationUpdateContainer.appendChild(obj.paginationDropdown);
    paginationUpdateContainer.appendChild(
      document.createTextNode(jSuites.translate("entries"))
    );
  }

  // Filter and pagination container
  const filter = document.createElement("div");
  filter.classList.add("jss_filter");
  filter.appendChild(paginationUpdateContainer);
  filter.appendChild(searchContainer);

  // Colsgroup
  obj.colgroupContainer = document.createElement("colgroup");
  let tempColElement = document.createElement("col");
  tempColElement.setAttribute("width", "50");
  obj.colgroupContainer.appendChild(tempColElement);

  // Nested
  if (
    obj.options.nestedHeaders &&
    obj.options.nestedHeaders.length > 0 &&
    obj.options.nestedHeaders[0] &&
    obj.options.nestedHeaders[0][0]
  ) {
    for (let j = 0; j < obj.options.nestedHeaders.length; j++) {
      obj.thead.appendChild(
        createNestedHeader.call(obj, obj.options.nestedHeaders[j])
      );
    }
  }

  // Row
  obj.headerContainer = document.createElement("tr");
  let tempTdElement = document.createElement("td");
  tempTdElement.classList.add("jss_selectall");
  obj.headerContainer.appendChild(tempTdElement);

  const numberOfColumns = getNumberOfColumns.call(obj);

  for (let i = 0; i < numberOfColumns; i++) {
    // Create header
    createCellHeader.call(obj, i);
    // Append cell to the container
    obj.headerContainer.appendChild(obj.headers[i]);
    obj.colgroupContainer.appendChild(obj.cols[i].colElement);
  }

  obj.thead.appendChild(obj.headerContainer);

  // Filters
  if (obj.options.filters == true) {
    obj.filter = document.createElement("tr");
    const td = document.createElement("td");
    obj.filter.appendChild(td);

    if (obj.options.columns) {
      for (let i = 0; i < obj.options.columns.length; i++) {
        const td = document.createElement("td");
        td.innerHTML = "&nbsp;";
        td.setAttribute("data-x", i.toString());
        td.className = "jss_column_filter";
        if (obj.options.columns[i] && obj.options.columns[i].type == "hidden") {
          td.style.display = "none";
        }
        obj.filter.appendChild(td);
      }
    }

    obj.thead.appendChild(obj.filter);
  }

  // Content table
  obj.table = document.createElement("table");
  obj.table.classList.add("jss_worksheet");
  obj.table.setAttribute("cellpadding", "0");
  obj.table.setAttribute("cellspacing", "0");
  obj.table.setAttribute("unselectable", "yes");
  //obj.table.setAttribute('onselectstart', 'return false');
  obj.table.appendChild(obj.colgroupContainer);
  obj.table.appendChild(obj.thead);
  obj.table.appendChild(obj.tbody);

  if (!obj.options.textOverflow) {
    obj.table.classList.add("jss_overflow");
  }

  // Spreadsheet corner
  obj.corner = document.createElement("div");
  obj.corner.className = "jss_corner";
  obj.corner.setAttribute("unselectable", "on");
  obj.corner.setAttribute("onselectstart", "return false");

  if (obj.options.selectionCopy == false) {
    obj.corner.style.display = "none";
  }

  // Textarea helper
  obj.textarea = document.createElement("textarea");
  obj.textarea.className = "jss_textarea";
  obj.textarea.id = "jss_textarea";
  obj.textarea.tabIndex = -1;
  obj.textarea.ariaHidden = "true";

  // Powered by Jspreadsheet
  const ads = document.createElement("a");
  ads.setAttribute("href", "https://bossanova.uk/jspreadsheet/");
  obj.ads = document.createElement("div");
  obj.ads.className = "jss_about";

  const span = document.createElement("span");
  span.innerHTML = "Jspreadsheet CE";
  ads.appendChild(span);
  obj.ads.appendChild(ads);

  // Create table container TODO: frozen columns
  const container = document.createElement("div");
  container.classList.add("jss_table");

  // Pagination
  obj.pagination = document.createElement("div");
  obj.pagination.classList.add("jss_pagination");
  const paginationInfo = document.createElement("div");
  const paginationPages = document.createElement("div");
  obj.pagination.appendChild(paginationInfo);
  obj.pagination.appendChild(paginationPages);

  // Hide pagination if not in use
  if (!obj.options.pagination) {
    obj.pagination.style.display = "none";
  }

  // Append containers to the table
  if (obj.options.search == true) {
    obj.element.appendChild(filter);
  }

  // Elements
  obj.content.appendChild(obj.table);
  obj.content.appendChild(obj.corner);
  obj.content.appendChild(obj.textarea);

  obj.element.appendChild(obj.content);
  obj.element.appendChild(obj.pagination);
  obj.element.appendChild(obj.ads);
  obj.element.classList.add("jss_container");

  obj.element.jssWorksheet = obj;
  obj.element.jspreadsheet = obj;

  // Overflow
  if (obj.options.tableOverflow == true) {
    if (obj.options.tableHeight) {
      (obj.content.style as CSSStyleDeclaration & Record<string, string>)["overflow-y"] = "auto";
      (obj.content.style as CSSStyleDeclaration & Record<string, string>)["box-shadow"] = "rgb(221 221 221) 2px 2px 5px 0.1px";
      obj.content.style.maxHeight =
        typeof obj.options.tableHeight === "string"
          ? obj.options.tableHeight
          : obj.options.tableHeight + "px";
    }
    if (obj.options.tableWidth) {
      (obj.content.style as CSSStyleDeclaration & Record<string, string>)["overflow-x"] = "auto";
      obj.content.style.width =
        typeof obj.options.tableWidth === "string"
          ? obj.options.tableWidth
          : obj.options.tableWidth + "px";
    }
  }

  // With toolbars
  if (obj.options.tableOverflow != true && obj.parent.config.toolbar) {
    obj.element.classList.add("with-toolbar");
  }

  // Actions
  if (obj.options.columnDrag != false) {
    obj.thead.classList.add("draggable");
  }
  if (obj.options.columnResize != false) {
    obj.thead.classList.add("resizable");
  }
  if (obj.options.rowDrag != false) {
    obj.tbody.classList.add("draggable");
  }
  if (obj.options.rowResize != false) {
    obj.tbody.classList.add("resizable");
  }

  // Load data
  obj.setData?.(undefined);

  // Style
  if (obj.options.style) {
    // Convert CSSStyleDeclaration to string format for setStyle
    const styleObj: Record<string, string> = {};
    if (Array.isArray(obj.options.style)) {
      // Handle array format - not sure how to convert this, skip for now
    } else if (typeof obj.options.style === 'object') {
      for (const [key, value] of Object.entries(obj.options.style)) {
        if (typeof value === 'string') {
          styleObj[key] = value;
        } else if (typeof value === 'number') {
          styleObj[key] = value.toString();
        }
        // Skip CSSStyleDeclaration for now as conversion is complex
      }
    }
    if (Object.keys(styleObj).length > 0) {
      obj.setStyle?.(styleObj, null, null, true, true);
    }

    delete obj.options.style;
  }

  Object.defineProperty(obj.options, "style", {
    enumerable: true,
    configurable: true,
    get() {
      return obj.getStyle?.();
    },
  });

  if (obj.options.comments) {
    obj.setComments?.(obj.options.comments);
  }

  // Classes
  if (obj.options.classes) {
    for (const [key, className] of Object.entries(obj.options.classes)) {
      const cell = getIdFromColumnName(key, true) as number[];
      const record = obj.records[cell[1]]?.[cell[0]];
      if (record && className) {
        record.element.classList.add(className);
      }
    }
  }
};

/**
 * Prepare the jspreadsheet table
 *
 * @Param config
 */
const prepareTable = function (this: WorksheetInstance) {
  const obj = this;

  // Lazy loading
  if (
    obj.options.lazyLoading == true &&
    obj.options.tableOverflow != true &&
    obj.parent.config.fullscreen != true
  ) {
    console.error(
      "Jspreadsheet: The lazyloading only works when tableOverflow = yes or fullscreen = yes"
    );
    obj.options.lazyLoading = false;
  }

  if (!obj.options.columns) {
    obj.options.columns = [];
  }

  // Number of columns
  let size = obj.options.columns.length;
  let keys;

  if (obj.options.data && typeof obj.options.data[0] !== "undefined") {
    if (!Array.isArray(obj.options.data[0])) {
      // Data keys
      keys = Object.keys(obj.options.data[0]);

      if (keys.length > size) {
        size = keys.length;
      }
    } else {
      const numOfColumns = obj.options.data[0].length;

      if (numOfColumns > size) {
        size = numOfColumns;
      }
    }
  }

  // Minimal dimensions
  if (!obj.options.minDimensions) {
    obj.options.minDimensions = [0, 0];
  }

  if (obj.options.minDimensions[0] > size) {
    size = obj.options.minDimensions[0];
  }

  // Requests
  const multiple = [];

  // Preparations
  for (let i = 0; i < size; i++) {
    // Default column description
    if (!obj.options.columns[i]) {
      obj.options.columns[i] = {};
    }
    if (!obj.options.columns[i].name && keys && keys[i]) {
      obj.options.columns[i].name = keys[i];
    }

    // Pre-load initial source for json dropdown
    if (obj.options.columns[i].type == "dropdown") {
      // if remote content
      if (obj.options.columns[i].url) {
        multiple.push({
          url: obj.options.columns[i].url,
          index: i,
          method: "GET",
          dataType: "json",
                     success: function (data: unknown) {
            if (!obj.options.columns || !obj.options.columns[i]) {
              return;
            }
            if (!obj.options.columns[i].source) {
              obj.options.columns[i].source = [];
            }

            const source = obj.options.columns[i].source;
            if (Array.isArray(source) && Array.isArray(data)) {
              for (let j = 0; j < data.length; j++) {
                source.push(data[j]);
              }
            }
          },
        });
      }
    }
  }

  // Create the table when is ready
  if (!multiple.length) {
    createTable.call(obj);
  } else {
    // Make ajax calls for each remote source
    let completed = 0;
    const total = multiple.length;

    multiple.forEach((config) => {
      jSuites.ajax({
        url: config.url as string,
        method: (config.method || "GET") as "GET" | "POST" | "PUT" | "DELETE",
        dataType: (config.dataType || "json") as "text" | "json" | "xml" | "html",
        success: function (data: unknown) {
          // Call the original success callback with the data
          if (config.success) {
            config.success.call(obj, data);
          }
          completed++;
          if (completed >= total) {
            createTable.call(obj);
          }
        },
        error: function () {
          completed++;
          if (completed >= total) {
            createTable.call(obj);
          }
        }
      });
    });
  }
};

export const getNextDefaultWorksheetName = function (
  spreadsheet: SpreadsheetInstance
) {
  const defaultWorksheetNameRegex = /^Sheet(\d+)$/;

  let largestWorksheetNumber = 0;

  spreadsheet.worksheets.forEach(function (worksheet: WorksheetInstance) {
    const regexResult = defaultWorksheetNameRegex.exec(
      worksheet.options.worksheetName || ""
    );
    if (regexResult) {
      largestWorksheetNumber = Math.max(
        largestWorksheetNumber,
        parseInt(regexResult[1])
      );
    }
  });

  return "Sheet" + (largestWorksheetNumber + 1);
};

export const buildWorksheet = async function (this: WorksheetInstance) {
  const obj = this;
  const el = obj.element;

  const spreadsheet = obj.parent;

  if (typeof spreadsheet.plugins === "object") {
    Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
      const typedPlugin = plugin as unknown as PluginWithHooks;
      if (typeof typedPlugin.beforeinit === "function") {
        typedPlugin.beforeinit(obj);
      }
    });
  }

  libraryBase.jspreadsheet.current = obj;

  const promises = [];

  // Load the table data based on an CSV file
  if (obj.options.csv) {
    const promise = new Promise<void>((resolve) => {
      // Load CSV file
      jSuites.ajax({
        url: obj.options.csv as string,
        method: "GET",
        dataType: "text",
        success: function (result: unknown) {
          // Convert data
          const newData = parseCSV(result as string, obj.options.csvDelimiter);

          // Headers
          if (obj.options.csvHeaders == true && newData.length > 0) {
            const headers = newData.shift();

            if (headers && headers.length > 0) {
              if (!obj.options.columns) {
                obj.options.columns = [];
              }

              for (let i = 0; i < headers!.length; i++) {
                if (!obj.options.columns[i]) {
                  obj.options.columns[i] = {};
                }
                // Precedence over pre-configurated titles
                if (typeof obj.options.columns[i].title === "undefined") {
                  obj.options.columns[i].title = headers![i];
                }
              }
            }
          }
          // Data
          obj.options.data = newData;
          // Prepare table
          prepareTable.call(obj);

          resolve();
        },
      });
    });

    promises.push(promise);
  } else if (obj.options.url) {
    const promise = new Promise<void>((resolve) => {
      jSuites.ajax({
        url: obj.options.url as string,
        method: "GET",
        dataType: "json",
        success: function (result: unknown) {
          // Data
          const data = result as { data?: unknown } | unknown;
          obj.options.data = (data && typeof data === 'object' && 'data' in data && data.data) ? data.data as CellValue[][] | Array<Record<string, CellValue>> : data as CellValue[][] | Array<Record<string, CellValue>>;
          // Prepare table
          prepareTable.call(obj);

          resolve();
        },
      });
    });

    promises.push(promise);
  } else {
    // Prepare table
    prepareTable.call(obj);
  }

  await Promise.all(promises);

  if (typeof spreadsheet.plugins === "object") {
    Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
      const typedPlugin = plugin as unknown as PluginWithHooks;
      if (typeof typedPlugin.init === "function") {
        typedPlugin.init(obj);
      }
    });
  }
};

export const createWorksheetObj = function (
  this: WorksheetInstance,
  options: SpreadsheetOptions
) {
  const obj = this;

  const spreadsheet = obj.parent;

  if (!options.worksheetName) {
    options.worksheetName = getNextDefaultWorksheetName(obj.parent);
  }

  const newWorksheet = {
    parent: spreadsheet,
    options: options,
    filters: [],
    formula: [],
    history: [],
    selection: [],
    historyIndex: -1,
  };

  if (!spreadsheet.config.worksheets) {
    spreadsheet.config.worksheets = [];
  }
  spreadsheet.config.worksheets.push(newWorksheet.options);
  spreadsheet.worksheets.push(newWorksheet as unknown as WorksheetInstance);

  return newWorksheet;
};

export const createWorksheet = function (
  this: WorksheetInstance,
  options: SpreadsheetOptions
) {
  const obj = this;
  const spreadsheet = obj.parent;

  spreadsheet.creationThroughJss = true;

  createWorksheetObj.call(obj, options);

  spreadsheet.element.tabs.create(options.worksheetName);
};

export const openWorksheet = function (
  this: WorksheetInstance,
  position: number
) {
  const obj = this;
  const spreadsheet = obj.parent;

  spreadsheet.element.tabs.open(position);
};

export const deleteWorksheet = function (
  this: WorksheetInstance,
  position: number
) {
  const obj = this;

  obj.parent.element.tabs.remove(position);

  const removedWorksheet = obj.parent.worksheets.splice(position, 1)[0];

  dispatch.call(obj.parent, "ondeleteworksheet", removedWorksheet, position);
};

const worksheetPublicMethods = [
  ["selectAll", selectAll],
  [
    "updateSelectionFromCoords",
    function (
      this: WorksheetInstance,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) {
      return updateSelectionFromCoords.call(this, x1, y1, x2, y2);
    },
  ],
  [
    "resetSelection",
    function (this: WorksheetInstance) {
      return resetSelection.call(this, false);
    },
  ],
  ["getSelection", getSelection],
  ["getSelected", getSelected],
  ["getSelectedColumns", getSelectedColumns],
  ["getSelectedRows", getSelectedRows],
  ["getData", getData],
  ["setData", setData],
  ["getValue", getValue],
  ["getValueFromCoords", getValueFromCoords],
  ["setValue", setValue],
  ["setValueFromCoords", setValueFromCoords],
  ["getWidth", getWidth],
  [
    "setWidth",
    function (this: WorksheetInstance, column: number, width: number) {
      return setWidth.call(this, column, width, undefined);
    },
  ],
  ["insertRow", insertRow],
  [
    "moveRow",
    function (this: WorksheetInstance, rowNumber: number, newPositionNumber: number) {
      return moveRow.call(this, rowNumber, newPositionNumber, false);
    },
  ],
  ["deleteRow", deleteRow],
  ["hideRow", hideRow],
  ["showRow", showRow],
  ["getRowData", getRowData],
  ["setRowData", setRowData],
  ["getHeight", getHeight],
  [
    "setHeight",
    function (this: WorksheetInstance, row: number, height: number) {
      return setHeight.call(this, row, height, undefined);
    },
  ],
  ["getMerge", getMerge],
  [
    "setMerge",
    function (this: WorksheetInstance, cellName: string, colspan: number, rowspan: number) {
      return setMerge.call(this, cellName, colspan, rowspan, undefined);
    },
  ],
  [
    "destroyMerge",
    function (this: WorksheetInstance) {
      return destroyMerge.call(this, undefined);
    },
  ],
  [
    "removeMerge",
    function (this: WorksheetInstance, cellName: string, data?: CellValue[]) {
      return removeMerge.call(this, cellName, data, undefined);
    },
  ],
  ["search", search],
  ["resetSearch", resetSearch],
  ["getHeader", getHeader],
  ["getHeaders", getHeaders],
  ["setHeader", setHeader],
  ["getStyle", getStyle],
  [
    "setStyle",
    function (
      this: WorksheetInstance,
      o: string | Record<string, string | string[]>,
      k?: string | null | undefined,
      v?: string | null,
      force?: boolean,
      ignoreHistoryAndEvents?: boolean
    ) {
      return setStyle.call(this, o, k, v, force, ignoreHistoryAndEvents);
    },
  ],
  ["resetStyle", resetStyle],
  ["insertColumn", insertColumn],
  ["moveColumn", moveColumn],
  ["deleteColumn", deleteColumn],
  ["getColumnData", getColumnData],
  ["setColumnData", setColumnData],
  ["whichPage", whichPage],
  ["page", page],
  ["download", download],
  ["getComments", getComments],
  ["setComments", setComments],
  ["orderBy", orderBy],
  ["undo", undo],
  ["redo", redo],
  ["getCell", getCell],
  ["getCellFromCoords", getCellFromCoords],
  ["getLabel", getLabel],
  ["getConfig", getWorksheetConfig],
  ["setConfig", setConfig],
  [
    "getMeta",
    function (this: WorksheetInstance, cell?: string) {
      return getMeta.call(this, cell, undefined);
    },
  ],
  ["setMeta", setMeta],
  ["showColumn", showColumn],
  ["hideColumn", hideColumn],
  ["showIndex", showIndex],
  ["hideIndex", hideIndex],
  ["getWorksheetActive", getWorksheetActive],
  ["openEditor", openEditor],
  ["closeEditor", closeEditor],
  ["createWorksheet", createWorksheet],
  ["openWorksheet", openWorksheet],
  ["deleteWorksheet", deleteWorksheet],
  [
    "copy",
    function (this: WorksheetInstance, cut: boolean) {
      if (cut) {
        cutControls.call(this, undefined);
      } else {
        copy.call(this, true);
      }
    },
  ],
  ["paste", paste],
  ["executeFormula", executeFormula],
  ["getDataFromRange", getDataFromRange],
  ["quantiyOfPages", quantiyOfPages],
  ["getRange", getRange],
  ["isSelected", isSelected],
  ["setReadOnly", setReadOnly],
  ["isReadOnly", isReadOnly],
  ["getHighlighted", getHighlighted],
  ["dispatch", dispatch],
  ["down", down],
  ["first", first],
  ["last", last],
  ["left", left],
  ["right", right],
  ["up", up],
  ["openFilter", openFilter],
  ["resetFilters", resetFilters],
];

const worksheetPublicMethodsLength = worksheetPublicMethods.length;
