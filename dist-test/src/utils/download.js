"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = void 0;
const copyPaste_1 = require("./copyPaste");
/**
 * Download CSV table
 *
 * @return null
 */
const download = function (includeHeaders, processed) {
    const obj = this;
    if (obj.parent.config.allowExport == false) {
        console.error("Export not allowed");
    }
    else {
        // Data
        let data = "";
        // Get data
        data += copyPaste_1.copy.call(obj, false, obj.options.csvDelimiter, true, includeHeaders, true, undefined, processed);
        // Download element
        const blob = new Blob(["\uFEFF" + data], {
            type: "text/csv;charset=utf-8;",
        });
        // IE Compatibility
        const navigator = window.navigator;
        if (navigator && navigator.msSaveOrOpenBlob) {
            navigator.msSaveOrOpenBlob(blob, (obj.options.csvFileName || obj.options.worksheetName) + ".csv");
        }
        else {
            // Download element
            const pom = document.createElement("a");
            pom.setAttribute("target", "_top");
            const url = URL.createObjectURL(blob);
            pom.href = url;
            pom.setAttribute("download", (obj.options.csvFileName || obj.options.worksheetName) + ".csv");
            document.body.appendChild(pom);
            pom.click();
            if (pom.parentNode) {
                pom.parentNode.removeChild(pom);
            }
        }
    }
};
exports.download = download;
