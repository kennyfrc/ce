import jSuites from "jsuites";
/**
 * Prepare JSON in the correct format
 */
var prepareJson = function (data) {
    var obj = this;
    var rows = [];
    for (var i = 0; i < data.length; i++) {
        var x = data[i].x;
        var y = data[i].y;
        var k = obj.options.columns[x].name ? obj.options.columns[x].name : x;
        // Create row
        if (!rows[y]) {
            rows[y] = {
                row: y,
                data: {},
            };
        }
        rows[y].data[k] = data[i].value;
    }
    // Filter rows
    return rows.filter(function (el) {
        return el != null;
    });
};
/**
 * Post json to a remote server
 */
var save = function (url, data) {
    var obj = this;
    // Parse anything in the data before sending to the server
    var ret = dispatch.call(obj.parent, "onbeforesave", obj.parent, obj, data);
    if (ret) {
        data = ret;
    }
    else {
        if (ret === false) {
            return false;
        }
    }
    // Remove update
    jSuites.ajax({
        url: url,
        method: "POST",
        dataType: "json",
        data: { data: JSON.stringify(data) },
        success: function (result) {
            // Event
            dispatch.call(obj, "onsave", obj.parent, obj, data);
        },
    });
};
/**
 * Trigger events
 */
var dispatch = function (event) {
    var obj = this;
    var ret = null;
    var spreadsheet = obj.parent ? obj.parent : obj;
    // Dispatch events
    if (!spreadsheet.ignoreEvents) {
        // Call global event
        if (typeof spreadsheet.config.onevent == "function") {
            ret = spreadsheet.config.onevent.apply(this, arguments);
        }
        // Call specific events
        if (typeof spreadsheet.config[event] == "function") {
            ret = spreadsheet.config[event].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        if (typeof spreadsheet.plugins === "object") {
            var pluginKeys = Object.keys(spreadsheet.plugins);
            for (var pluginKeyIndex = 0; pluginKeyIndex < pluginKeys.length; pluginKeyIndex++) {
                var key = pluginKeys[pluginKeyIndex];
                var plugin = spreadsheet.plugins[key];
                if (typeof plugin.onevent === "function") {
                    ret = plugin.onevent.apply(this, arguments);
                }
            }
        }
    }
    if (event == "onafterchanges") {
        var scope_1 = arguments;
        if (typeof spreadsheet.plugins === "object") {
            Object.entries(spreadsheet.plugins).forEach(function (_a) {
                var plugin = _a[1];
                if (typeof plugin.persistence === "function") {
                    plugin.persistence(obj, "setValue", { data: scope_1[2] });
                }
            });
        }
        if (obj.options.persistence) {
            var url = obj.options.persistence == true
                ? obj.options.url
                : obj.options.persistence;
            var data = prepareJson.call(obj, arguments[2]);
            save.call(obj, url, data);
        }
    }
    return ret;
};
export default dispatch;
//# sourceMappingURL=dispatch.js.map