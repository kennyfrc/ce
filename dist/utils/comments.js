import dispatch from "./dispatch.js";
import { getCoordsFromCellName } from "./helpers.js";
import { setHistory } from "./history.js";
import { getColumnNameFromId, getIdFromColumnName } from "./internalHelpers.js";
/**
 * Get cell comments, null cell for all
 */
export var getComments = function (cell) {
    var obj = this;
    if (cell) {
        if (typeof (cell) !== 'string') {
            return getComments.call(obj);
        }
        cell = getIdFromColumnName(cell, true);
        return obj.records[cell[1]][cell[0]].element.getAttribute('title') || '';
    }
    else {
        var data = {};
        for (var j = 0; j < obj.options.data.length; j++) {
            for (var i = 0; i < obj.options.columns.length; i++) {
                var comments = obj.records[j][i].element.getAttribute('title');
                if (comments) {
                    var cell_1 = getColumnNameFromId([i, j]);
                    data[cell_1] = comments;
                }
            }
        }
        return data;
    }
};
/**
 * Set cell comments
 */
export var setComments = function (cellId, comments) {
    var _a;
    var obj = this;
    var commentsObj;
    if (typeof cellId == 'string') {
        commentsObj = (_a = {}, _a[cellId] = comments, _a);
    }
    else {
        commentsObj = cellId;
    }
    var oldValue = {};
    Object.entries(commentsObj).forEach(function (_a) {
        var cellName = _a[0], comment = _a[1];
        var cellCoords = getCoordsFromCellName(cellName);
        // Keep old value
        oldValue[cellName] = obj.records[cellCoords[1]][cellCoords[0]].element.getAttribute('title');
        // Set new values
        obj.records[cellCoords[1]][cellCoords[0]].element.setAttribute('title', comment ? comment : '');
        // Remove class if there is no comment
        if (comment) {
            obj.records[cellCoords[1]][cellCoords[0]].element.classList.add('jss_comments');
            if (!obj.options.comments) {
                obj.options.comments = {};
            }
            obj.options.comments[cellName] = comment;
        }
        else {
            obj.records[cellCoords[1]][cellCoords[0]].element.classList.remove('jss_comments');
            if (obj.options.comments && obj.options.comments[cellName]) {
                delete obj.options.comments[cellName];
            }
        }
    });
    // Save history
    setHistory.call(obj, {
        action: 'setComments',
        newValue: commentsObj,
        oldValue: oldValue,
    });
    // Set comments
    dispatch.call(obj, 'oncomments', obj, commentsObj, oldValue);
};
//# sourceMappingURL=comments.js.map