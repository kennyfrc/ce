import jSuites from "jsuites";
import type {
  WorksheetInstance,
  SpreadsheetInstance,
  SpreadsheetContext,
} from "../types/core";

/**
 * Prepare JSON in the correct format
 */
const prepareJson = function (this: WorksheetInstance, data: unknown) {
  const obj = this;

  // Narrow unknown to an array for internal processing
  const arr = (data as any[]) || [];
  const rows = [];
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i].x;
    const y = arr[i].y;
    const col = obj.options.columns && obj.options.columns[x];
    const k = col && (col as any).name ? (col as any).name : x;

    // Create row
    if (!rows[y]) {
      rows[y] = {
        row: y,
        data: {},
      };
    }
    if (rows[y] && rows[y].data) {
      (rows[y].data as any)[k] = arr[i].value;
    }
  }

  // Filter rows
  return rows.filter(function (el) {
    return el != null;
  });
};

/**
 * Post json to a remote server
 */
const save = function (this: WorksheetInstance, url: string, data: any[]) {
  const obj = this;

  // Parse anything in the data before sending to the server
  const ret = dispatch.call(obj.parent, "onbeforesave", obj.parent, obj, data);
  if (ret) {
    data = ret;
  } else {
    if (ret === false) {
      return false;
    }
    return undefined;
  }

  // Remove update
  (jSuites as any).ajax({
    url: url,
    method: "POST",
    dataType: "json",
    data: { data: JSON.stringify(data) },
    success: function (result: any) {
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
  this: WorksheetInstance | SpreadsheetInstance | SpreadsheetContext,
  event: string,
  ...args: any[]
) {
  const obj = this as WorksheetInstance;
  let ret = null as any;

  const spreadsheet: any = (obj as any).parent ? (obj as any).parent : (obj as any);

  // Dispatch events
  if (!spreadsheet.ignoreEvents) {
    // Call global event
    if (typeof (spreadsheet.config as any).onevent == "function") {
      ret = (spreadsheet.config as any).onevent.apply(this, [event, ...args]);
    }
    // Call specific events
    if (typeof (spreadsheet.config as any)[event] == "function") {
      ret = (spreadsheet.config as any)[event].apply(this, args);
    }

    if (typeof spreadsheet.plugins === "object") {
      const pluginKeys = Object.keys(spreadsheet.plugins || {});

      for (
        let pluginKeyIndex = 0;
        pluginKeyIndex < pluginKeys.length;
        pluginKeyIndex++
      ) {
        const key = pluginKeys[pluginKeyIndex];
        const plugin = (spreadsheet.plugins as any)[key];

        if (typeof (plugin as any).onevent === "function") {
          ret = (plugin as any).onevent.apply(this, arguments as any);
        }
      }
    }
  }

  if (event == "onafterchanges") {
    const scope = arguments;

    if (typeof spreadsheet.plugins === "object") {
      Object.entries(spreadsheet.plugins as any).forEach(function ([, plugin]: [
        string,
        any
      ]) {
        if (typeof (plugin as any).persistence === "function") {
          plugin.persistence(obj, "setValue", { data: scope[2] });
        }
      });
    }

    if (obj.options.persistence) {
      const rawUrl =
        obj.options.persistence == true
          ? obj.options.url
          : obj.options.persistence;
      if (typeof rawUrl === "string") {
        const data = prepareJson.call(obj, arguments[2]);
        save.call(obj, rawUrl, data);
      }
    }
  }

  return ret;
};

export default dispatch;
