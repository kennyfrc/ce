"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFreezeWidth = void 0;
// Get width of all freezed cells together
const getFreezeWidth = function () {
    const obj = this;
    let width = 0;
    if (obj.options.freezeColumns && obj.options.freezeColumns > 0) {
        for (let i = 0; i < obj.options.freezeColumns; i++) {
            let columnWidth;
            if (obj.options.columns &&
                obj.options.columns[i] &&
                obj.options.columns[i].width !== undefined) {
                columnWidth = parseInt(obj.options.columns[i].width.toString());
            }
            else {
                columnWidth =
                    obj.options.defaultColWidth !== undefined
                        ? parseInt(obj.options.defaultColWidth.toString())
                        : 100;
            }
            width += columnWidth;
        }
    }
    return width;
};
exports.getFreezeWidth = getFreezeWidth;
