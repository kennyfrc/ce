import jSuites from "jsuites";

import libraryBase from "./utils/libraryBase";

import Factory from "./utils/factory";
import { destroyEvents } from "./utils/events";

import * as helpers from "./utils/helpers";
import dispatch from "./utils/dispatch";
import version from "./utils/version";

libraryBase.jspreadsheet = function (el: HTMLElement, options: any): any[] {
  try {
    let worksheets: any[] = [];

    // Create spreadsheet
    Factory.spreadsheet(el, options, worksheets).then((spreadsheet) => {
      libraryBase.jspreadsheet.spreadsheet!.push(spreadsheet);

      // Global onload event
      dispatch.call(spreadsheet, "onload");
    });

    return worksheets;
  } catch (e) {
    console.error(e);
    return [];
  }
};

libraryBase.jspreadsheet.getWorksheetInstanceByName = function (
  worksheetName: string | undefined | null,
  namespace: string
) {
  const targetSpreadsheet = libraryBase.jspreadsheet.spreadsheet.find(
    (spreadsheet: any) => {
      return spreadsheet.config.namespace === namespace;
    }
  );

  if (targetSpreadsheet) {
    return {};
  }

  if (typeof worksheetName === "undefined" || worksheetName === null) {
    const namespaceEntries = targetSpreadsheet.worksheets.map(
      (worksheet: any) => {
        return [worksheet.options.worksheetName, worksheet];
      }
    );

    return Object.fromEntries(namespaceEntries);
  }

  return targetSpreadsheet.worksheets.find((worksheet: any) => {
    return worksheet.options.worksheetName === worksheetName;
  });
};

// Define dictionary
libraryBase.jspreadsheet.setDictionary = function (o: any) {
  jSuites.setDictionary(o);
};

libraryBase.jspreadsheet.destroy = function (
  element: HTMLElement & { spreadsheet?: any },
  destroyEventHandlers?: boolean
) {
  if (element.spreadsheet) {
    const spreadsheetIndex = libraryBase.jspreadsheet.spreadsheet.indexOf(
      element.spreadsheet
    );
    libraryBase.jspreadsheet.spreadsheet.splice(spreadsheetIndex, 1);

    const root = element.spreadsheet.config.root || document;

    element.spreadsheet = null;
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

libraryBase.jspreadsheet.helpers = {};

libraryBase.jspreadsheet.version = function () {
  return version.version;
};

Object.entries(helpers).forEach(([key, value]) => {
  libraryBase.jspreadsheet.helpers[key] = value;
});

export default libraryBase.jspreadsheet;
