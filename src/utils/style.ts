import dispatch from "./dispatch";
import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers";
import { setHistory } from "./history";
import type { WorksheetInstance, CellValue, ColumnDefinition } from "../types/core";

type CSSStyleDeclarationWithIndex = CSSStyleDeclaration & Record<string, string>;

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
    const x = (Array.isArray(dataArray[0]) ? dataArray[0].length : 0) || 0;
    const y = dataArray.length;

    // Go through the columns to get the data
    for (let j = 0; j < y; j++) {
      for (let i = 0; i < x; i++) {
        // Value
        const record = obj.records[j]?.[i];
        if (!record) continue;
        const v = key
          ? (record.element.style as CSSStyleDeclarationWithIndex)[key]
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
    const coords = getIdFromColumnName(cell as string, true) as number[];

    return key
      ? (obj.records[coords[1]][coords[0]].element.style as CSSStyleDeclarationWithIndex)[key]
      : obj.records[coords[1]][coords[0]].element.getAttribute("style");
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
  k?: string | null | undefined,
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
    const cell = getIdFromColumnName(cellId, true) as number[];

    if (
      obj.records[cell[1]] &&
      obj.records[cell[1]][cell[0]] &&
      (obj.records[cell[1]][cell[0]].element.classList.contains("readonly") ==
        false ||
        force)
    ) {
      // Current value
      const currentValue = (obj.records[cell[1]][cell[0]].element.style as CSSStyleDeclarationWithIndex)[key];

      // Change layout
      if (currentValue == value && !force) {
        value = "";
        (obj.records[cell[1]][cell[0]].element.style as CSSStyleDeclarationWithIndex)[key] = "";
      } else {
        (obj.records[cell[1]][cell[0]].element.style as CSSStyleDeclarationWithIndex)[key] = value;
      }

      // History
      if (!oldValue[cellId]) {
        oldValue[cellId] = [];
      }
      if (!newValue[cellId]) {
        newValue[cellId] = [];
      }

      (oldValue[cellId] as string[]).push(key + ":" + currentValue);
      (newValue[cellId] as string[]).push(key + ":" + value);
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
    oldValue[keys[i]] = (oldValue[keys[i]] as string[]).join(";");
  }
  keys = Object.keys(newValue);
  for (let i = 0; i < keys.length; i++) {
    newValue[keys[i]] = (newValue[keys[i]] as string[]).join(";");
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
    const cell = getIdFromColumnName(keys[i], true) as number[];
    if (obj.records[cell[1]] && obj.records[cell[1]][cell[0]]) {
      obj.records[cell[1]][cell[0]].element.setAttribute("style", "");
    }
  }
  obj.setStyle?.(o, null, null, undefined, ignoreHistoryAndEvents);
};
