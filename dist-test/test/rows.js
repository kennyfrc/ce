"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the rows method', () => {
    it('deleteRow and a row is removed', () => {
        var _a, _b;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[1, 2, 3], [4, 5, 6]],
                    worksheetName: 'Countries'
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        let firstRow = rows[0];
        // Check that first row has the value of [1, 2, 3]
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(firstRow.children[3].innerHTML).to.include(3);
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.deleteRow) === null || _b === void 0 ? void 0 : _b.call(_a, 0);
        table = globalThis.root.querySelector('tbody');
        if (!table)
            throw new Error('Table not found');
        rows = table.children;
        firstRow = rows[0];
        // Check that the value of the first row now is [4, 5, 6] since the first one got removed
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include(5);
        (0, chai_1.expect)(firstRow.children[3].innerHTML).to.include(6);
    });
    it('insertRow and a row is added', () => {
        var _a, _b;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[1, 2, 3], [4, 5, 6]],
                    worksheetName: 'Countries'
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        let firstRow = rows[0];
        // Check that first row has the value of [1, 2, 3]
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(firstRow.children[3].innerHTML).to.include(3);
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.insertRow) === null || _b === void 0 ? void 0 : _b.call(_a, [9, 9, 9], 0, true);
        table = globalThis.root.querySelector('tbody');
        if (!table)
            throw new Error('Table not found');
        rows = table.children;
        firstRow = rows[0];
        // Check that the value of the first row now is [9, 9, 9]
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(firstRow.children[3].innerHTML).to.include(9);
    });
    it('moveRow and the row is moved', () => {
        var _a, _b;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[1, 2, 3], [4, 5, 6]]
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        let firstRow = rows[0];
        let secondRow = rows[1];
        let A1 = firstRow.children[1];
        let A2 = secondRow.children[1];
        (0, chai_1.expect)(A1.innerHTML).to.include(1);
        (0, chai_1.expect)(A2.innerHTML).to.include(4);
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.moveRow) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 1);
        table = globalThis.root.querySelector('tbody');
        if (!table)
            throw new Error('Table not found');
        rows = table.children;
        firstRow = rows[0];
        secondRow = rows[1];
        A1 = firstRow.children[1];
        A2 = secondRow.children[1];
        (0, chai_1.expect)(A1.innerHTML).to.include(4);
        (0, chai_1.expect)(A2.innerHTML).to.include(1);
    });
    it('deleteRow history', () => {
        var _a, _b, _c, _d, _e, _f;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[1, 2, 3], [4, 5, 6]],
                    worksheetName: 'Countries'
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(3);
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.deleteRow) === null || _b === void 0 ? void 0 : _b.call(_a, 0);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(5);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(6);
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(3);
        (_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(5);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(6);
    });
    it('insertRow history', () => {
        var _a, _b, _c, _d, _e, _f;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[1, 2, 3], [4, 5, 6]],
                    worksheetName: 'Countries'
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(3);
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.insertRow) === null || _b === void 0 ? void 0 : _b.call(_a, [9, 9, 9], 0, true);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(3);
        (_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
    });
    it('moveRow history', () => {
        var _a, _b, _c, _d, _e, _f;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[1, 2, 3], [4, 5, 6]]
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        (0, chai_1.expect)(table.children[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(table.children[1].children[1].innerHTML).to.include(4);
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.moveRow) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 1);
        (0, chai_1.expect)(table.children[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(table.children[1].children[1].innerHTML).to.include(1);
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(table.children[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(table.children[1].children[1].innerHTML).to.include(4);
        (_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(table.children[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(table.children[1].children[1].innerHTML).to.include(1);
    });
});
