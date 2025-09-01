import jSuites from "jsuites";

import libraryBase from "./utils/libraryBase";
import {
  SpreadsheetOptions,
  WorksheetInstance,
  SpreadsheetInstance,
  HelperFn,
  JSpreadsheet,
} from "./types/core";

import Factory from "./utils/factory";
import { destroyEvents } from "./utils/events";

import * as helpers from "./utils/helpers";
import dispatch from "./utils/dispatch";
import version from "./utils/version";

// Assign the main function to libraryBase.jspreadsheet with proper typing
libraryBase.jspreadsheet = (function (
  el: HTMLElement,
  options: SpreadsheetOptions
): WorksheetInstance[] {
  try {
    const worksheets: WorksheetInstance[] = [];

    // Create spreadsheet
    const spreadsheet = Factory.spreadsheet(el, options, worksheets);
    libraryBase.jspreadsheet.spreadsheet!.push(spreadsheet);

    // Global onload event
    dispatch.call(spreadsheet, "onload");

    return worksheets;
  } catch (e) {
    console.error(e);
    return [];
  }
}) as JSpreadsheet;

libraryBase.jspreadsheet.getWorksheetInstanceByName = function (
  worksheetName: string | undefined | null,
  namespace: string
): WorksheetInstance | Record<string, WorksheetInstance> | null {
  const targetSpreadsheet = libraryBase.jspreadsheet.spreadsheet.find(
    (spreadsheet: SpreadsheetInstance) => {
      return spreadsheet.config.namespace === namespace;
    }
  );

  if (!targetSpreadsheet) {
    return null;
  }

  if (typeof worksheetName === "undefined" || worksheetName === null) {
    const namespaceEntries = targetSpreadsheet.worksheets.map(
      (worksheet: WorksheetInstance) => {
        return [worksheet.options.worksheetName, worksheet];
      }
    );

    return Object.fromEntries(namespaceEntries) as Record<
      string,
      WorksheetInstance
    >;
  }

  return (
    targetSpreadsheet.worksheets.find((worksheet: WorksheetInstance) => {
      return worksheet.options.worksheetName === worksheetName;
    }) || null
  );
};

// Define dictionary
libraryBase.jspreadsheet.setDictionary = function (o: Record<string, string>) {
  jSuites.setDictionary(o);
};

libraryBase.jspreadsheet.destroy = function (
  element: HTMLElement & { spreadsheet?: SpreadsheetInstance },
  destroyEventHandlers?: boolean
) {
  if (element.spreadsheet) {
    const spreadsheetIndex = libraryBase.jspreadsheet.spreadsheet.indexOf(
      element.spreadsheet
    );
    if (spreadsheetIndex >= 0) {
      libraryBase.jspreadsheet.spreadsheet.splice(spreadsheetIndex, 1);
    }

    const root =
      (element.spreadsheet.config.root as HTMLElement) || document.body;

    element.spreadsheet = undefined;
    element.innerHTML = "";

    if (destroyEventHandlers) {
      destroyEvents(root);
    }
  }
};

libraryBase.jspreadsheet.destroyAll = function () {
  for (
    let spreadsheetIndex = 0;
    spreadsheetIndex < libraryBase.jspreadsheet.spreadsheet.length;
    spreadsheetIndex++
  ) {
    const spreadsheet = libraryBase.jspreadsheet.spreadsheet[spreadsheetIndex];

    libraryBase.jspreadsheet.destroy(spreadsheet.element);
  }
};

libraryBase.jspreadsheet.current = null;

libraryBase.jspreadsheet.spreadsheet = [];

libraryBase.jspreadsheet.helpers = {} as Record<string, HelperFn>;

libraryBase.jspreadsheet.version = function () {
  return version.version;
};

Object.entries(helpers).forEach(([key, value]) => {
  libraryBase.jspreadsheet.helpers[key] = value as HelperFn;
});

export default libraryBase.jspreadsheet;
