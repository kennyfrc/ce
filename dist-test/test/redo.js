"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the redo method', () => {
    it('.undo', () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [['Hello', 'World'], ['Testing', 'CE']],
                    worksheetName: 'Countries'
                },
            ]
        });
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        const firstRow = rows[0];
        const secondRow = rows[1];
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.include('Testing');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.include('CE');
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.setValueFromCoords) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 0, 'New Value');
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.setValueFromCoords) === null || _d === void 0 ? void 0 : _d.call(_c, 1, 0, 'TESTING');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('TESTING');
        (_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.undo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (_h = (_g = instance[0]) === null || _g === void 0 ? void 0 : _g.undo) === null || _h === void 0 ? void 0 : _h.call(_g);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
    });
    it('.redo after undo something', () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [['Hello', 'World'], ['Testing', 'CE']],
                    worksheetName: 'Countries'
                },
            ]
        });
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        const firstRow = rows[0];
        const secondRow = rows[1];
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.include('Testing');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.include('CE');
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.setValueFromCoords) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 0, 'New Value');
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.setValueFromCoords) === null || _d === void 0 ? void 0 : _d.call(_c, 1, 0, 'TESTING');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('TESTING');
        (_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.undo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (_h = (_g = instance[0]) === null || _g === void 0 ? void 0 : _g.undo) === null || _h === void 0 ? void 0 : _h.call(_g);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (_k = (_j = instance[0]) === null || _j === void 0 ? void 0 : _j.redo) === null || _k === void 0 ? void 0 : _k.call(_j);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (_m = (_l = instance[0]) === null || _l === void 0 ? void 0 : _l.redo) === null || _m === void 0 ? void 0 : _m.call(_l);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('TESTING');
    });
});
