import { parseValue } from "./internal.js";
export var setFooter = function (data) {
    var obj = this;
    if (data) {
        obj.options.footers = data;
    }
    if (obj.options.footers) {
        if (!obj.tfoot) {
            obj.tfoot = document.createElement('tfoot');
            obj.table.appendChild(obj.tfoot);
        }
        for (var j = 0; j < obj.options.footers.length; j++) {
            var tr = void 0;
            if (obj.tfoot.children[j]) {
                tr = obj.tfoot.children[j];
            }
            else {
                tr = document.createElement('tr');
                var td = document.createElement('td');
                tr.appendChild(td);
                obj.tfoot.appendChild(tr);
            }
            for (var i = 0; i < obj.headers.length; i++) {
                if (!obj.options.footers[j][i]) {
                    obj.options.footers[j][i] = '';
                }
                var td = void 0;
                if (obj.tfoot.children[j].children[i + 1]) {
                    td = obj.tfoot.children[j].children[i + 1];
                }
                else {
                    td = document.createElement('td');
                    tr.appendChild(td);
                    // Text align
                    var colAlign = obj.options.columns[i].align || obj.options.defaultColAlign || 'center';
                    td.style.textAlign = colAlign;
                }
                td.textContent = parseValue.call(obj, +obj.records.length + i, j, obj.options.footers[j][i]);
                // Hide/Show with hideColumn()/showColumn()
                td.style.display = obj.cols[i].colElement.style.display;
            }
        }
    }
};
//# sourceMappingURL=footer.js.map