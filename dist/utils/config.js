/**
 * Get table config information
 */
export var getWorksheetConfig = function () {
    var obj = this;
    return obj.options;
};
export var getSpreadsheetConfig = function () {
    var spreadsheet = this;
    return spreadsheet.config;
};
export var setConfig = function (config, spreadsheetLevel) {
    var obj = this;
    var keys = Object.keys(config);
    var spreadsheet;
    if (!obj.parent) {
        spreadsheetLevel = true;
        spreadsheet = obj;
    }
    else {
        spreadsheet = obj.parent;
    }
    keys.forEach(function (key) {
        if (spreadsheetLevel) {
            spreadsheet.config[key] = config[key];
            if (key === 'toolbar') {
                if (config[key] === true) {
                    spreadsheet.showToolbar();
                }
                else if (config[key] === false) {
                    spreadsheet.hideToolbar();
                }
            }
        }
        else {
            obj.options[key] = config[key];
        }
    });
};
//# sourceMappingURL=config.js.map