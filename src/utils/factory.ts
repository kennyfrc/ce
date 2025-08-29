import jSuites from "jsuites";

import libraryBase from "./libraryBase";
import { setEvents } from "./events";
import { fullscreen, getWorksheetActive } from "./internal";
import { hideToolbar, showToolbar, updateToolbar } from "./toolbar";
import {
  buildWorksheet,
  createWorksheetObj,
  getNextDefaultWorksheetName,
} from "./worksheets";
import dispatch from "./dispatch";
import { createFromTable } from "./helpers";
import { getSpreadsheetConfig, setConfig } from "./config";
import type {
  SpreadsheetContext,
  SpreadsheetInstance,
  SpreadsheetOptions,
  WorksheetInstance,
} from "../types/core";
// Local lightweight aliases for jSuites types (keeps file self-contained)
type JSuitesTabs = { render: () => void; content: HTMLElement; [key: string]: unknown };
type TabsOptions = { data?: Array<{ title: string; content: HTMLElement | string }>; [key: string]: unknown };
type JSuitesContextMenu = { render: () => void; close: (immediate?: boolean) => void; [key: string]: unknown };

interface Factory {
  (): void;
  spreadsheet(
    el: HTMLElement,
    options: SpreadsheetOptions,
    worksheets: WorksheetInstance[]
  ): Promise<SpreadsheetInstance>;
  worksheet(
    spreadsheet: SpreadsheetInstance,
    options: SpreadsheetOptions,
    position: number
  ): { parent: SpreadsheetInstance; options: SpreadsheetOptions };
}

const factory: Factory = function () {};

const createWorksheets = async function (
  this: SpreadsheetContext,
  spreadsheet: SpreadsheetInstance,
  options: SpreadsheetOptions,
  el: HTMLElement
) {
  // Create worksheets
  let o = options.worksheets;
  if (o) {
    let tabsOptions: TabsOptions = {
      animation: true,
      onbeforecreate: function (
        this: JSuitesTabs,
        element: HTMLElement,
        title: string | null
      ) {
        if (title) {
          return title;
        } else {
          return getNextDefaultWorksheetName(spreadsheet);
        }
      },
      oncreate: function (
        this: JSuitesTabs,
        element: HTMLElement,
        newTabContent: HTMLElement
      ) {
        if (!spreadsheet.creationThroughJss) {
          const worksheetName =
            element.tabs.headers.children[
              element.tabs.headers.children.length - 2
            ].innerHTML;

          createWorksheetObj.call(spreadsheet.worksheets[0], {
            minDimensions: [10, 15],
            worksheetName: worksheetName,
          });
        } else {
          spreadsheet.creationThroughJss = false;
        }

        const newWorksheet =
          spreadsheet.worksheets[spreadsheet.worksheets.length - 1];

        newWorksheet.element = newTabContent;

        buildWorksheet.call(newWorksheet).then(function () {
          updateToolbar.call(spreadsheet, newWorksheet);

          dispatch.call(
            newWorksheet,
            "oncreateworksheet",
            newWorksheet,
            options,
            spreadsheet.worksheets.length - 1
          );
        });
      },
      onchange: function (
        this: JSuitesTabs,
        element: HTMLElement,
        instance: JSuitesTabs,
        tabIndex: number
      ) {
        if (
          spreadsheet.worksheets.length != 0 &&
          spreadsheet.worksheets[tabIndex]
        ) {
          updateToolbar.call(spreadsheet, spreadsheet.worksheets[tabIndex]);
        }
      },
    };

    if (options.tabs == true) {
      tabsOptions.allowCreate = true;
    } else {
      tabsOptions.hideHeaders = true;
    }

    tabsOptions.data = [];

    let sheetNumber = 1;

    for (let i = 0; i < o.length; i++) {
      if (!o[i].worksheetName) {
        o[i].worksheetName = "Sheet" + sheetNumber++;
      }

      tabsOptions.data.push({
        title: o[i].worksheetName || "Sheet" + sheetNumber++,
        content: "",
      });
    }

    el.classList.add("jss_spreadsheet");
    el.tabIndex = 0;

    const tabs = jSuites.tabs(el, tabsOptions) as JSuitesTabs;

    const spreadsheetStyles = options.style ?? ({} as Record<string, CSSStyleDeclaration | number>);
    delete options.style;

    for (let i = 0; i < o.length; i++) {
      if (o[i].style && typeof o[i].style === "object" && !Array.isArray(o[i].style)) {
        const styleObj = o[i].style as Record<string, CSSStyleDeclaration | number>;
        Object.entries(styleObj).forEach(function ([cellName, value]) {
          if (typeof value === "number" && spreadsheetStyles[value]) {
            styleObj[cellName] = spreadsheetStyles[value];
          }
        });
      }

      spreadsheet.worksheets.push({
        parent: spreadsheet,
        element: tabs.content.children[i],
        options: o[i],
        filters: [],
        formula: {} as Record<string, string[]>,
        history: [],
        selection: [],
        historyIndex: -1,
             } as unknown as WorksheetInstance);

      await buildWorksheet.call(spreadsheet.worksheets[i]);
    }
  } else {
    throw new Error("JSS: worksheets are not defined");
  }
};

factory.spreadsheet = async function (
  el: HTMLElement,
  options: SpreadsheetOptions,
  worksheets: WorksheetInstance[]
) {
  if (el.tagName == "TABLE") {
    if (!options) {
      options = {};
    }

    if (!options.worksheets) {
      options.worksheets = [];
    }

    const tableOptions = createFromTable(el, options.worksheets[0]);

    options.worksheets[0] = tableOptions;

    const div = document.createElement("div");
    if (el.parentNode) {
      el.parentNode.insertBefore(div, el);
      el.remove();
      el = div;
    }
  }

  let spreadsheet: SpreadsheetInstance = {
    worksheets: worksheets,
    config: options,
    element: el,
    el,
    options: options,
    headers: [],
    rows: [],
    tbody: document.createElement("tbody"),
    table: document.createElement("table"),
    parent: {} as SpreadsheetInstance,
    records: [],
  };

  // Contextmenu container
  spreadsheet.contextMenu = document.createElement("div");
  spreadsheet.contextMenu.className = "jss_contextmenu";

  spreadsheet.getWorksheetActive = getWorksheetActive.bind(spreadsheet);
  spreadsheet.fullscreen = fullscreen.bind(spreadsheet);
  spreadsheet.showToolbar = showToolbar.bind(spreadsheet);
  spreadsheet.hideToolbar = hideToolbar.bind(spreadsheet);
  spreadsheet.getConfig = getSpreadsheetConfig.bind(spreadsheet);
  spreadsheet.setConfig = setConfig.bind(spreadsheet);

  spreadsheet.setPlugins = function (newPlugins?: Record<string, Function>) {
    if (!spreadsheet.plugins) {
      spreadsheet.plugins = {};
    }

    if (typeof newPlugins == "object" && newPlugins) {
      Object.entries(newPlugins).forEach(function ([pluginName, plugin]: [
        string,
        Function
      ]) {
        spreadsheet.plugins![pluginName] = plugin.call(
          spreadsheet,
          libraryBase.jspreadsheet,
          {},
          spreadsheet.config
        );
      });
    }
  };

  spreadsheet.setPlugins(options.plugins);

  // Create as worksheets
  await createWorksheets(spreadsheet, options, el);

  spreadsheet.element.appendChild(spreadsheet.contextMenu!);

  // Create element
  jSuites.contextmenu(spreadsheet.contextMenu!, {
    onclick: function (this: JSuitesContextMenu) {
      spreadsheet.contextMenu!.contextmenu!.close(false);
    },
  });

  // Fullscreen
  if (spreadsheet.config.fullscreen == true) {
    spreadsheet.element.classList.add("fullscreen");
  }

  showToolbar.call(spreadsheet.worksheets[0] || spreadsheet);

  // Build handlers
  if (options.root) {
    setEvents(options.root);
  } else {
    setEvents(document.body);
  }

  el.spreadsheet = spreadsheet;

  return spreadsheet;
};

factory.worksheet = function (
  spreadsheet: SpreadsheetInstance,
  options: SpreadsheetOptions,
  position: number
) {
  // Worksheet object
  let w = {
    // Parent of a worksheet is always the spreadsheet
    parent: spreadsheet,
    // Options for this worksheet
    options: {},
    headers: [],
    rows: [],
    element: document.createElement("div"),
    config: spreadsheet.config,
    worksheets: [],
    tbody: document.createElement("tbody"),
    table: document.createElement("table"),
    records: [],
  } as SpreadsheetContext;

  // Create the worksheets object
  if (typeof position === "undefined") {
    spreadsheet.worksheets.push(w);
  } else {
    spreadsheet.worksheets.splice(position, 0, w);
  }
  // Keep configuration used
  Object.assign(w.options, options);

  return w;
};

export default factory;
