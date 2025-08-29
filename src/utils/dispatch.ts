import jSuites from "jsuites";
import type {
  WorksheetInstance,
  SpreadsheetInstance,
  SpreadsheetContext,
  ColumnDefinition,
} from "../types/core";

/**
 * Prepare JSON in the correct format
 */
const prepareJson = function (this: WorksheetInstance, data: unknown) {
  const obj = this;

  if (!Array.isArray(data)) {
    return [];
  }

  type DispatchItem = { x: number; y: number; value: unknown };
  const arr = data as DispatchItem[];
  const rows: Array<{ row: number; data: Record<string, unknown> }> = [];

  for (let i = 0; i < arr.length; i++) {
    const x = arr[i].x;
    const y = arr[i].y;
    const col = obj.options.columns && obj.options.columns[x] as ColumnDefinition | undefined;
    const k = col && typeof col.name === "string" ? col.name : String(x);

    if (!rows[y]) {
      rows[y] = {
        row: y,
        data: {},
      };
    }
    if (rows[y]) {
      rows[y].data[k] = arr[i].value;
    }
  }

  return rows.filter(function (el) {
    return el != null;
  });
};

/**
 * Post json to a remote server
 */
const save = function (this: WorksheetInstance, url: string, data: unknown[]) {
  const obj = this;

  // Parse anything in the data before sending to the server
  const ret = dispatch.call(obj.parent, "onbeforesave", obj.parent, obj, data);
  if (ret) {
    if (Array.isArray(ret)) {
      data = ret;
    } else if (ret === false) {
      return false;
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }

  const jsuitesLib = jSuites as unknown as {
    ajax?: (opts: {
      url: string;
      method?: string;
      dataType?: string;
      data?: Record<string, string>;
      success?: (result: unknown) => void;
    }) => void;
  };

  jsuitesLib.ajax?.({
    url,
    method: "POST",
    dataType: "json",
    data: { data: JSON.stringify(data) },
    success: function (result: unknown) {
      // Event
      dispatch.call(obj, "onsave", obj.parent, obj, data);
    },
  });

  return true;
};

/**
 * Trigger events
 */
const dispatch = function (
  this: WorksheetInstance | SpreadsheetInstance,
  event: string,
  ...args: unknown[]
) {
  const obj = this;
  let ret: unknown = null;
  
  // Get the spreadsheet instance
  let spreadsheet: SpreadsheetInstance;
  if ('parent' in obj && obj.parent) {
    spreadsheet = obj.parent;
  } else {
    spreadsheet = obj as SpreadsheetInstance;
  }

  // Dispatch events
  if (!spreadsheet.ignoreEvents) {
    // Handle global onevent handler
    if (spreadsheet.config && typeof spreadsheet.config.onevent === "function") {
      ret = spreadsheet.config.onevent.call(this, event, ...args);
    }

    // Handle specific event handlers
    if (spreadsheet.config && typeof (spreadsheet.config as Record<string, unknown>)[event] === "function") {
      const specificHandler = (spreadsheet.config as Record<string, Function>)[event];
      ret = specificHandler.apply(this, args);
    }

    // Handle plugin event handlers
    if (spreadsheet.plugins) {
      Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
        if (plugin && typeof plugin.onevent === "function") {
          ret = plugin.onevent.apply(this, [event, ...args]);
        }
      });
    }
  }

  if (event === "onafterchanges" && args.length >= 3) {
    if (spreadsheet.plugins) {
      Object.entries(spreadsheet.plugins).forEach(function ([, plugin]) {
        if (plugin && typeof plugin.persistence === "function") {
          plugin.persistence(obj, "setValue", { data: args[2] });
        }
      });
    }

    if (obj.options.persistence) {
      const rawUrl = obj.options.persistence === true ? obj.options.url : obj.options.persistence;
      if (typeof rawUrl === "string") {
        const data = prepareJson.call(obj, args[2]);
        save.call(obj, rawUrl, data);
      }
    }
  }

  return ret;
};

export default dispatch;
