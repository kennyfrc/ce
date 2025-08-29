import type { SpreadsheetContext } from "../types/core";

/**
 * Get table config information
 */
export const getWorksheetConfig = function (this: SpreadsheetContext) {
  const obj = this;

  return obj.options;
};

export const getSpreadsheetConfig = function (this: SpreadsheetContext) {
  const spreadsheet = this;

  return spreadsheet.config;
};

export const setConfig = function (
  this: SpreadsheetContext,
  config: unknown,
  spreadsheetLevel?: boolean
) {
  const obj = this;

  if (typeof config !== 'object' || config === null) {
    return;
  }

  const configRecord = config as Record<string, unknown>;
  const keys = Object.keys(configRecord);

  let spreadsheet;

  if (!obj.parent) {
    spreadsheetLevel = true;

    spreadsheet = obj;
  } else {
    spreadsheet = obj.parent;
  }

  keys.forEach(function (key) {
    if (spreadsheetLevel) {
      spreadsheet.config[key] = configRecord[key];

      if (key === "toolbar") {
        if (configRecord[key] === true) {
          spreadsheet.showToolbar?.();
        } else if (configRecord[key] === false) {
          spreadsheet.hideToolbar?.();
        }
      }
    } else {
      obj.options[key] = configRecord[key];
    }
  });
};
