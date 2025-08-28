import { getCoordsFromRange } from './internal';
export var getDataFromRange = function (range, processed) {
    var obj = this;
    var coords = getCoordsFromRange(range);
    var dataset = [];
    for (var y = coords[1]; y <= coords[3]; y++) {
        dataset.push([]);
        for (var x = coords[0]; x <= coords[2]; x++) {
            if (processed) {
                dataset[dataset.length - 1].push(obj.records[y][x].element.innerHTML);
            }
            else {
                dataset[dataset.length - 1].push(obj.options.data && obj.options.data[y] && obj.options.data[y][x] !== undefined
                    ? obj.options.data[y][x]
                    : "");
            }
        }
    }
    return dataset;
};
//# sourceMappingURL=data_test.js.map