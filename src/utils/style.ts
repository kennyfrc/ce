import dispatch from "./dispatch";
import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers";
import { setHistory } from "./history";
import type { WorksheetInstance } from "../types/core";

/**
 * Get style information from cell(s)
 *
 * @return integer
 */
export const getStyle = function (
  this: WorksheetInstance,
  cell?: string | number[],
  key?: string
) {
  const obj = this;

  // Cell
  if (!cell) {
    // Control vars
    const data: Record<string, string | null | undefined> = {};

    // Column and row length
    const dataArray = obj.options.data;
    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
      return {};
    }
    const x = dataArray[0]?.length || 0;
    const y = dataArray.length;

    // Go through the columns to get the data
    for (let j = 0; j < y; j++) {
      for (let i = 0; i < x; i++) {
        // Value
        const record = obj.records[j]?.[i];
        if (!record) continue;
        const v = key
          ? record.element.style[key]
          : record.element.getAttribute("style");

        // Any meta data for this column?
        if (v) {
          // Column name
          const k = getColumnNameFromId([i, j]);
          // Value
          data[k] = v;
        }
      }
    }

    return data;
  } else {
    cell = getIdFromColumnName(cell as unknown as string, true);

    return key
      ? obj.records[cell[1]][cell[0]].element.style[key]
      : obj.records[cell[1]][cell[0]].element.getAttribute("style");
  }
};

/**
 * Set meta information to cell(s)
 *
 * @return integer
 */
export const setStyle = function (
  this: WorksheetInstance,
  o: string | Record<string, string | string[]>,
  k: string | null | undefined,
  v?: string | null,
  force?: boolean,
  ignoreHistoryAndEvents?: boolean
) {
  const obj = this;

  const newValue: Record<string, string[] | string> = {};
  const oldValue: Record<string, string[] | string> = {};

  // Apply style
  const applyStyle = function (cellId: string, key: string, value: string) {
    // Position
    const cell = getIdFromColumnName(cellId, true);

    if (
      obj.records[cell[1]] &&
      obj.records[cell[1]][cell[0]] &&
      (obj.records[cell[1]][cell[0]].element.classList.contains("readonly") ==
        false ||
        force)
    ) {
      // Current value
      const currentValue = obj.records[cell[1]][cell[0]].element.style[key];

      // Change layout
      if (currentValue == value && !force) {
        value = "";
        obj.records[cell[1]][cell[0]].element.style[key] = "";
      } else {
        obj.records[cell[1]][cell[0]].element.style[key] = value;
      }

      // History
      if (!oldValue[cellId]) {
        oldValue[cellId] = [];
      }
      if (!newValue[cellId]) {
        newValue[cellId] = [];
      }

      oldValue[cellId].push([key + ":" + currentValue]);
      newValue[cellId].push([key + ":" + value]);
    }
  };

  if (k && v) {
    // Get object from string
    if (typeof o == "string") {
      applyStyle(o, k, v as string);
    }
  } else {
    const keys = Object.keys(o as Record<string, string | string[]>);
    for (let i = 0; i < keys.length; i++) {
      let style = (o as Record<string, string | string[]>)[keys[i]];
      if (typeof style == "string") {
        style = style.split(";");
      }
      for (let j = 0; j < style.length; j++) {
        if (typeof style[j] == "string") {
          // style[j] is like "key:value"
          const parts = style[j].split(":");
          // Apply value
          if (parts[0] && parts[0].trim()) {
            applyStyle(keys[i], parts[0].trim(), parts[1]);
          }
        }
      }
    }
  }

  let keys = Object.keys(oldValue);
  for (let i = 0; i < keys.length; i++) {
    oldValue[keys[i]] = oldValue[keys[i]].join(";");
  }
  keys = Object.keys(newValue);
  for (let i = 0; i < keys.length; i++) {
    newValue[keys[i]] = newValue[keys[i]].join(";");
  }

  if (!ignoreHistoryAndEvents) {
    // Keeping history of changes
    setHistory.call(obj, {
      action: "setStyle",
      oldValue: oldValue,
      newValue: newValue,
    });
  }

  dispatch.call(obj, "onchangestyle", obj, newValue);
};

export const resetStyle = function (
  this: WorksheetInstance,
  o: Record<string, string | string[]>,
  ignoreHistoryAndEvents?: boolean
) {
  const obj = this;

  const keys = Object.keys(o);
  for (let i = 0; i < keys.length; i++) {
    // Position
    const cell = getIdFromColumnName(keys[i], true);
    if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
      obj.records[cell[1]][cell[0]].element.setAttribute("style", "");
    }
  }
  obj.setStyle(o, null, null, null, ignoreHistoryAndEvents);
};
