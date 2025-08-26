import { getCoordsFromCellName } from "./helpers.js";
export var setReadOnly = function (cell, state) {
    var obj = this;
    var record;
    if (typeof cell === 'string') {
        var coords = getCoordsFromCellName(cell);
        record = obj.records[coords[1]][coords[0]];
    }
    else {
        var x = parseInt(cell.getAttribute('data-x'));
        var y = parseInt(cell.getAttribute('data-y'));
        record = obj.records[y][x];
    }
    if (state) {
        record.element.classList.add('readonly');
    }
    else {
        record.element.classList.remove('readonly');
    }
};
export var isReadOnly = function (x, y) {
    var obj = this;
    if (typeof x === 'string' && typeof y === 'undefined') {
        var coords = getCoordsFromCellName(x);
        x = coords[0], y = coords[1];
    }
    return obj.records[y][x].element.classList.contains('readonly');
};
//# sourceMappingURL=cells.js.map