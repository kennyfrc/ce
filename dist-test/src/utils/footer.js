"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFooter = void 0;
const internal_1 = require("./internal");
const setFooter = function (data) {
    var _a, _b, _c, _d, _e;
    const obj = this;
    if (data) {
        obj.options.footers = data;
    }
    if (obj.options.footers) {
        if (!obj.tfoot) {
            obj.tfoot = document.createElement("tfoot");
            obj.table.appendChild(obj.tfoot);
        }
        const columns = (_a = obj.options.columns) !== null && _a !== void 0 ? _a : [];
        for (let j = 0; j < obj.options.footers.length; j++) {
            let tr;
            if (obj.tfoot.children[j]) {
                tr = obj.tfoot.children[j];
            }
            else {
                tr = document.createElement("tr");
                const td = document.createElement("td");
                tr.appendChild(td);
                obj.tfoot.appendChild(tr);
            }
            for (let i = 0; i < obj.headers.length; i++) {
                if (!obj.options.footers[j][i]) {
                    obj.options.footers[j][i] = "";
                }
                let td;
                if ((_b = obj.tfoot.children[j]) === null || _b === void 0 ? void 0 : _b.children[i + 1]) {
                    td = obj.tfoot.children[j].children[i + 1];
                }
                else {
                    td = document.createElement("td");
                    tr.appendChild(td);
                    // Text align
                    const colAlign = ((_c = columns[i]) === null || _c === void 0 ? void 0 : _c.align) ||
                        obj.options.defaultColAlign ||
                        "center";
                    td.style.textAlign = colAlign;
                }
                td.textContent = internal_1.parseValue.call(obj, +obj.records.length + i, j, obj.options.footers[j][i], td);
                // Hide/Show with hideColumn()/showColumn()
                td.style.display = (_e = (_d = obj.cols[i]) === null || _d === void 0 ? void 0 : _d.colElement.style.display) !== null && _e !== void 0 ? _e : "";
            }
        }
    }
};
exports.setFooter = setFooter;
