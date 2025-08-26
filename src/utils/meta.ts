import dispatch from "./dispatch";

/**
 * Get meta information from cell(s)
 *
 * @return integer
 */
export const getMeta = function (this: any, cell: any, key: any) {
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
 * @return integer
 */
export const updateMeta = function (this: any, affectedCells: any) {
  const obj = this;

  if (obj.options.meta) {
    const newMeta: Record<string, any> = {};
    const keys = Object.keys(obj.options.meta);
    for (let i = 0; i < keys.length; i++) {
      if (affectedCells[keys[i]]) {
        newMeta[affectedCells[keys[i]]] = obj.options.meta[keys[i]];
      } else {
        newMeta[keys[i]] = obj.options.meta[keys[i]];
      }
    }
    // Update meta information
    obj.options.meta = newMeta;
  }
};

/**
 * Set meta information to cell(s)
 *
 * @return integer
 */
export const setMeta = function (this: any, o: any, k: any, v: any) {
  const obj = this;

  if (!obj.options.meta) {
    obj.options.meta = {} as Record<string, any>;
  }

  if (k && v) {
    // Set data value
    if (!obj.options.meta[o]) {
      obj.options.meta[o] = {} as Record<string, any>;
    }
    obj.options.meta[o][k] = v;

    dispatch.call(obj, "onchangemeta", obj, { [o]: { [k]: v } });
  } else {
    // Apply that for all cells
    const keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
      if (!obj.options.meta[keys[i]]) {
        obj.options.meta[keys[i]] = {} as Record<string, any>;
      }

      const prop = Object.keys(o[keys[i]]);
      for (let j = 0; j < prop.length; j++) {
        obj.options.meta[keys[i]][prop[j]] = o[keys[i]][prop[j]];
      }
    }

    dispatch.call(obj, "onchangemeta", obj, o);
  }
};
