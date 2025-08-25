// Get width of all freezed cells together
export var getFreezeWidth = function () {
    var obj = this;
    var width = 0;
    if (obj.options.freezeColumns > 0) {
        for (var i = 0; i < obj.options.freezeColumns; i++) {
            var columnWidth = void 0;
            if (obj.options.columns && obj.options.columns[i] && obj.options.columns[i].width !== undefined) {
                columnWidth = parseInt(obj.options.columns[i].width);
            }
            else {
                columnWidth = obj.options.defaultColWidth !== undefined ? parseInt(obj.options.defaultColWidth) : 100;
            }
            width += columnWidth;
        }
    }
    return width;
};
//# sourceMappingURL=freeze.js.map