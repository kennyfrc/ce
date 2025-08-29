"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the data method', () => {
    it('getData and it returns the data properly', () => {
        var _a, _b;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [
                        [1, 2, 3],
                        [3, 2, 1],
                        [4, 5, 6],
                        [6, 5, 4],
                        [9, 12, 15],
                    ],
                    worksheetName: 'Countries'
                },
            ]
        });
        const data = (_b = (_a = instance[0]).getData) === null || _b === void 0 ? void 0 : _b.call(_a);
        (0, chai_1.expect)(data.length).to.eq(7);
        (0, chai_1.expect)(data[0].length).to.eq(7);
        (0, chai_1.expect)(data[0][0]).to.eq(1);
        (0, chai_1.expect)(data[0][1]).to.eq(2);
        (0, chai_1.expect)(data[0][2]).to.eq(3);
        (0, chai_1.expect)(data[1][0]).to.eq(3);
        (0, chai_1.expect)(data[1][1]).to.eq(2);
        (0, chai_1.expect)(data[1][2]).to.eq(1);
        (0, chai_1.expect)(data[2][0]).to.eq(4);
        (0, chai_1.expect)(data[2][1]).to.eq(5);
        (0, chai_1.expect)(data[2][2]).to.eq(6);
        (0, chai_1.expect)(data[3][0]).to.eq(6);
        (0, chai_1.expect)(data[3][1]).to.eq(5);
        (0, chai_1.expect)(data[3][2]).to.eq(4);
        (0, chai_1.expect)(data[4][0]).to.eq(9);
        (0, chai_1.expect)(data[4][1]).to.eq(12);
        (0, chai_1.expect)(data[4][2]).to.eq(15);
    });
    it('setData and it sets data properly', () => {
        var _a, _b;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    worksheetName: 'Countries'
                },
            ]
        });
        (_b = (_a = instance[0]).setData) === null || _b === void 0 ? void 0 : _b.call(_a, [['Hello', 'World'], ['Testing', 'CE']]);
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        const firstRow = rows[0];
        const secondRow = rows[1];
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).not.to.include('World');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).not.to.include('Hello');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.include('Testing');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).not.to.include('CE');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.include('CE');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).not.to.include('Testing');
    });
    it('setValue and it sets the value of a cell', () => {
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
        (_b = (_a = instance[0]).setValue) === null || _b === void 0 ? void 0 : _b.call(_a, 'A1', 'New Value');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (_d = (_c = instance[0]).setValue) === null || _d === void 0 ? void 0 : _d.call(_c, 'A1', 'olleH');
        (_f = (_e = instance[0]).setValue) === null || _f === void 0 ? void 0 : _f.call(_e, 'B1', 'dlroW');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('olleH');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('dlroW');
        (_h = (_g = instance[0]).setValue) === null || _h === void 0 ? void 0 : _h.call(_g, 'B2', 'TESTING');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.include('Testing');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.include('TESTING');
    });
    it('getValue and it gets the value from the cell', () => {
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
        (0, chai_1.expect)((_b = (_a = instance[0]).getValue) === null || _b === void 0 ? void 0 : _b.call(_a, 'A1')).to.include('Hello');
        (0, chai_1.expect)((_d = (_c = instance[0]).getValue) === null || _d === void 0 ? void 0 : _d.call(_c, 'B1')).to.include('World');
        (0, chai_1.expect)((_f = (_e = instance[0]).getValue) === null || _f === void 0 ? void 0 : _f.call(_e, 'A2')).to.include('Testing');
        (0, chai_1.expect)((_h = (_g = instance[0]).getValue) === null || _h === void 0 ? void 0 : _h.call(_g, 'B2')).to.include('CE');
    });
    it('getValueFromCoords and it gets the not processed cell value', () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [['=1+1', '=2+2'], ['Testing', 'CE']],
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
        (0, chai_1.expect)((_b = (_a = instance[0]).getValueFromCoords) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 0)).to.include('=1+1');
        (0, chai_1.expect)((_d = (_c = instance[0]).getValueFromCoords) === null || _d === void 0 ? void 0 : _d.call(_c, 1, 0)).to.include('=2+2');
        (0, chai_1.expect)((_f = (_e = instance[0]).getValueFromCoords) === null || _f === void 0 ? void 0 : _f.call(_e, 0, 1)).to.include('Testing');
        (0, chai_1.expect)((_h = (_g = instance[0]).getValueFromCoords) === null || _h === void 0 ? void 0 : _h.call(_g, 1, 1)).to.include('CE');
    });
    it('getValueFromCoords and it gets the processed cell value', () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [['=1+1', '=2+2'], ['Testing', 'CE']],
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
        (0, chai_1.expect)((_b = (_a = instance[0]).getValueFromCoords) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 0, true)).to.include('2');
        (0, chai_1.expect)((_d = (_c = instance[0]).getValueFromCoords) === null || _d === void 0 ? void 0 : _d.call(_c, 1, 0, true)).to.include('4');
        (0, chai_1.expect)((_f = (_e = instance[0]).getValueFromCoords) === null || _f === void 0 ? void 0 : _f.call(_e, 0, 1, true)).to.include('Testing');
        (0, chai_1.expect)((_h = (_g = instance[0]).getValueFromCoords) === null || _h === void 0 ? void 0 : _h.call(_g, 1, 1, true)).to.include('CE');
    });
    it('setValueFromCoords and it sets the value of a cell', () => {
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
        (_b = (_a = instance[0]).setValueFromCoords) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 0, 'New Value');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        (_d = (_c = instance[0]).setValueFromCoords) === null || _d === void 0 ? void 0 : _d.call(_c, 0, 0, 'olleH');
        (_f = (_e = instance[0]).setValueFromCoords) === null || _f === void 0 ? void 0 : _f.call(_e, 1, 0, 'dlroW');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('olleH');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('dlroW');
        (_h = (_g = instance[0]).setValueFromCoords) === null || _h === void 0 ? void 0 : _h.call(_g, 1, 1, 'TESTING');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.include('Testing');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.include('TESTING');
    });
    it('setValueFromCoords history', () => {
        var _a, _b, _c, _d, _e, _f;
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
        (_b = (_a = instance[0]).setValueFromCoords) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 0, 'New Value');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (_d = (_c = instance[0]).undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (_f = (_e = instance[0]).redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
    });
});
