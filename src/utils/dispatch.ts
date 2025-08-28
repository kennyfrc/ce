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
    const col = (obj.options.columns && obj.options.columns[x]) as ColumnDefinition | undefined;
    const nameProp = col && (col as Record<string, unknown>).name;
    const k = col && typeof nameProp === "string" ? (nameProp as string) : String(x);

    if (!rows[y]) {
      rows[y] = {
        row: y,
        data: {},
      };
    }
    if (rows[y] && rows[y].data) {
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
      data = ret as unknown[];
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
  this: WorksheetInstance | SpreadsheetInstance | SpreadsheetContext,
  event: string,
  ...args: unknown[]
) {
  const obj = this as WorksheetInstance;
  let ret: unknown = null;

  const spreadsheet: SpreadsheetInstance = (obj as SpreadsheetContext).parent
    ? (obj as SpreadsheetContext).parent
    : (obj as unknown as SpreadsheetInstance);

  // Dispatch events
  if (!spreadsheet.ignoreEvents) {
    const cfg = spreadsheet.config as Record<string, unknown>;

    type OneventFn = (...a: unknown[]) => unknown;
    const maybeOnevent = cfg.onevent;
    if (typeof maybeOnevent === "function") {
      ret = (maybeOnevent as OneventFn).call(this, event, ...(args as unknown[]));
    }

    const maybeSpecific = cfg[event];
    if (typeof maybeSpecific === "function") {
      const specificFn = maybeSpecific as (...a: unknown[]) => unknown;
      ret = specificFn.apply(this, args as unknown[]);
    }

    if (typeof spreadsheet.plugins === "object" && spreadsheet.plugins != null) {
      const pluginKeys = Object.keys(spreadsheet.plugins || {});

      for (
        let pluginKeyIndex = 0;
        pluginKeyIndex < pluginKeys.length;
        pluginKeyIndex++
      ) {
        const key = pluginKeys[pluginKeyIndex];
        const plugin = (spreadsheet.plugins as Record<string, unknown>)[key];

        if (plugin && typeof (plugin as Record<string, unknown>).onevent === "function") {
          const fn = (plugin as Record<string, unknown>).onevent as OneventFn;
          const evtArgs = [event, ...(args as unknown[])] as unknown[];
          ret = fn.apply(this, evtArgs);
        }
      }
    }
  }

  if (event === "onafterchanges") {
    const scope = args;

    if (typeof spreadsheet.plugins === "object" && spreadsheet.plugins != null) {
      Object.entries(spreadsheet.plugins as Record<string, unknown>).forEach(function ([, plugin]) {
        const p = plugin as Record<string, unknown>;
        const maybePersistence = p.persistence;
        if (typeof maybePersistence === "function") {
          (maybePersistence as (w: WorksheetInstance, action: string, payload: unknown) => void)(
            obj,
            "setValue",
            { data: scope[2] }
          );
        }
      });
    }

    if (obj.options.persistence) {
      const rawUrl = obj.options.persistence === true ? obj.options.url : obj.options.persistence;
      if (typeof rawUrl === "string") {
        const data = prepareJson.call(obj, scope[2]);
        save.call(obj, rawUrl, data as unknown[]);
      }
    }
  }

  return ret;
};

export default dispatch;
