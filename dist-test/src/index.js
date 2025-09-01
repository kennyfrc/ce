"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsuites_1 = __importDefault(require("jsuites"));
const libraryBase_1 = __importDefault(require("./utils/libraryBase"));
const factory_1 = __importDefault(require("./utils/factory"));
const events_1 = require("./utils/events");
const helpers = __importStar(require("./utils/helpers"));
const dispatch_1 = __importDefault(require("./utils/dispatch"));
const version_1 = __importDefault(require("./utils/version"));
// Assign the main function to libraryBase.jspreadsheet with proper typing
libraryBase_1.default.jspreadsheet = (function (el, options) {
    try {
        const worksheets = [];
        // Create spreadsheet
        const spreadsheet = factory_1.default.spreadsheet(el, options, worksheets);
        libraryBase_1.default.jspreadsheet.spreadsheet.push(spreadsheet);
        // Global onload event
        dispatch_1.default.call(spreadsheet, "onload");
        return worksheets;
    }
    catch (e) {
        console.error(e);
        return [];
    }
});
libraryBase_1.default.jspreadsheet.getWorksheetInstanceByName = function (worksheetName, namespace) {
    const targetSpreadsheet = libraryBase_1.default.jspreadsheet.spreadsheet.find((spreadsheet) => {
        return spreadsheet.config.namespace === namespace;
    });
    if (!targetSpreadsheet) {
        return null;
    }
    if (typeof worksheetName === "undefined" || worksheetName === null) {
        const namespaceEntries = targetSpreadsheet.worksheets.map((worksheet) => {
            return [worksheet.options.worksheetName, worksheet];
        });
        return Object.fromEntries(namespaceEntries);
    }
    return (targetSpreadsheet.worksheets.find((worksheet) => {
        return worksheet.options.worksheetName === worksheetName;
    }) || null);
};
// Define dictionary
libraryBase_1.default.jspreadsheet.setDictionary = function (o) {
    jsuites_1.default.setDictionary(o);
};
libraryBase_1.default.jspreadsheet.destroy = function (element, destroyEventHandlers) {
    if (element.spreadsheet) {
        const spreadsheetIndex = libraryBase_1.default.jspreadsheet.spreadsheet.indexOf(element.spreadsheet);
        if (spreadsheetIndex >= 0) {
            libraryBase_1.default.jspreadsheet.spreadsheet.splice(spreadsheetIndex, 1);
        }
        const root = element.spreadsheet.config.root || document.body;
        element.spreadsheet = undefined;
        element.innerHTML = "";
        if (destroyEventHandlers) {
            (0, events_1.destroyEvents)(root);
        }
    }
};
libraryBase_1.default.jspreadsheet.destroyAll = function () {
    for (let spreadsheetIndex = 0; spreadsheetIndex < libraryBase_1.default.jspreadsheet.spreadsheet.length; spreadsheetIndex++) {
        const spreadsheet = libraryBase_1.default.jspreadsheet.spreadsheet[spreadsheetIndex];
        libraryBase_1.default.jspreadsheet.destroy(spreadsheet.element);
    }
};
libraryBase_1.default.jspreadsheet.current = null;
libraryBase_1.default.jspreadsheet.spreadsheet = [];
libraryBase_1.default.jspreadsheet.helpers = {};
libraryBase_1.default.jspreadsheet.version = function () {
    return version_1.default.version;
};
Object.entries(helpers).forEach(([key, value]) => {
    libraryBase_1.default.jspreadsheet.helpers[key] = value;
});
exports.default = libraryBase_1.default.jspreadsheet;
