import dispatch from "./dispatch";
import type { SpreadsheetContext } from "../types/core";

/**
 * Get meta information from cell(s)
 *
 * @return unknown
 */
export const getMeta = function (this: SpreadsheetContext, cell?: string, key?: string): unknown {
  const obj = this;

  if (!cell) {
    return obj.options.meta;
  } else {
    if (key) {
      return obj.options.meta &&
        obj.options.meta[cell] &&
        obj.options.meta[cell][key]
        ? obj.options.meta[cell][key]
        : null;
    } else {
      return obj.options.meta && obj.options.meta[cell]
        ? obj.options.meta[cell]
        : null;
    }
  }
};

/**
 * Update meta information
 *
 * @return void
 */
export const updateMeta = function (this: SpreadsheetContext, affectedCells: Record<string, string>): void {
  const obj = this;

  if (obj.options.meta) {
    const newMeta: Record<string, Record<string, unknown>> = {};
    const keys = Object.keys(obj.options.meta);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (affectedCells[k]) {
        newMeta[affectedCells[k]] = obj.options.meta[k];
      } else {
        newMeta[k] = obj.options.meta[k];
      }
    }
    // Update meta information
    obj.options.meta = newMeta;
  }
};

/**
 * Set meta information to cell(s)
 *
 * @return void
 */
export const setMeta = function (this: SpreadsheetContext, o: string | Record<string, Record<string, unknown>>, k?: string, v?: unknown): void {
  const obj = this;

  if (!obj.options.meta) {
    obj.options.meta = {} as Record<string, Record<string, unknown>>;
  }

  if (k !== undefined && v !== undefined) {
    // Set data value
    const cellId = o as string;
    if (!obj.options.meta[cellId]) {
      obj.options.meta[cellId] = {} as Record<string, unknown>;
    }
    obj.options.meta[cellId][k] = v;

    dispatch.call(obj, "onchangemeta", obj, { [cellId]: { [k]: v } });
  } else {
    // Apply that for all cells
    const source = o as Record<string, Record<string, unknown>>;
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      const cellId = keys[i];
      if (!obj.options.meta[cellId]) {
        obj.options.meta[cellId] = {} as Record<string, unknown>;
      }

      const prop = Object.keys(source[cellId]);
      for (let j = 0; j < prop.length; j++) {
        const p = prop[j];
        obj.options.meta[cellId][p] = source[cellId][p];
      }
    }

    dispatch.call(obj, "onchangemeta", obj, o);
  }
};
