import jSuites from "jsuites";
import libraryBase from "./utils/libraryBase";
import Factory from "./utils/factory";
import { destroyEvents } from "./utils/events";
import * as helpers from "./utils/helpers";
import dispatch from "./utils/dispatch";
import version from "./utils/version";
libraryBase.jspreadsheet = function (el, options) {
    try {
        var worksheets = [];
        // Create spreadsheet
        Factory.spreadsheet(el, options, worksheets).then(function (spreadsheet) {
            libraryBase.jspreadsheet.spreadsheet.push(spreadsheet);
            // Global onload event
            dispatch.call(spreadsheet, "onload");
        });
        return worksheets;
    }
    catch (e) {
        console.error(e);
        return [];
    }
};
libraryBase.jspreadsheet.getWorksheetInstanceByName = function (worksheetName, namespace) {
    var targetSpreadsheet = libraryBase.jspreadsheet.spreadsheet.find(function (spreadsheet) {
        return spreadsheet.config.namespace === namespace;
    });
    if (targetSpreadsheet) {
        return {};
    }
    if (typeof worksheetName === "undefined" || worksheetName === null) {
        var namespaceEntries = targetSpreadsheet.worksheets.map(function (worksheet) {
            return [worksheet.options.worksheetName, worksheet];
        });
        return Object.fromEntries(namespaceEntries);
    }
    return targetSpreadsheet.worksheets.find(function (worksheet) {
        return worksheet.options.worksheetName === worksheetName;
    });
};
// Define dictionary
libraryBase.jspreadsheet.setDictionary = function (o) {
    jSuites.setDictionary(o);
};
libraryBase.jspreadsheet.destroy = function (element, destroyEventHandlers) {
    if (element.spreadsheet) {
        var spreadsheetIndex = libraryBase.jspreadsheet.spreadsheet.indexOf(element.spreadsheet);
        libraryBase.jspreadsheet.spreadsheet.splice(spreadsheetIndex, 1);
        var root = element.spreadsheet.config.root || document;
        element.spreadsheet = null;
        element.innerHTML = "";
        if (destroyEventHandlers) {
            destroyEvents(root);
        }
    }
};
libraryBase.jspreadsheet.destroyAll = function () {
    for (var spreadsheetIndex = 0; spreadsheetIndex < libraryBase.jspreadsheet.spreadsheet.length; spreadsheetIndex++) {
        var spreadsheet = libraryBase.jspreadsheet.spreadsheet[spreadsheetIndex];
        libraryBase.jspreadsheet.destroy(spreadsheet.element);
    }
};
libraryBase.jspreadsheet.current = null;
libraryBase.jspreadsheet.spreadsheet = [];
libraryBase.jspreadsheet.helpers = {};
libraryBase.jspreadsheet.version = function () {
    return version.version;
};
Object.entries(helpers).forEach(function (_a) {
    var key = _a[0], value = _a[1];
    libraryBase.jspreadsheet.helpers[key] = value;
});
export default libraryBase.jspreadsheet;
//# sourceMappingURL=index.js.map