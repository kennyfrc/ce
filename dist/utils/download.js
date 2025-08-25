import { copy } from "./copyPaste.js";
/**
 * Download CSV table
 *
 * @return null
 */
export var download = function (includeHeaders, processed) {
    var obj = this;
    if (obj.parent.config.allowExport == false) {
        console.error('Export not allowed');
    }
    else {
        // Data
        var data = '';
        // Get data
        data += copy.call(obj, false, obj.options.csvDelimiter, true, includeHeaders, true, undefined, processed);
        // Download element
        var blob = new Blob(["\uFEFF" + data], { type: 'text/csv;charset=utf-8;' });
        // IE Compatibility
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, (obj.options.csvFileName || obj.options.worksheetName) + '.csv');
        }
        else {
            // Download element
            var pom = document.createElement('a');
            pom.setAttribute('target', '_top');
            var url = URL.createObjectURL(blob);
            pom.href = url;
            pom.setAttribute('download', (obj.options.csvFileName || obj.options.worksheetName) + '.csv');
            document.body.appendChild(pom);
            pom.click();
            pom.parentNode.removeChild(pom);
        }
    }
};
//# sourceMappingURL=download.js.map