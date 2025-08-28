"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the rows method', () => {
    it('deleteRow and a row is removed', () => {
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
        instance[0].deleteRow(0);
        table = root.querySelector('tbody');
        rows = table.children;
        firstRow = rows[0];
        // Check that the value of the first row now is [4, 5, 6] since the first one got removed
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include(5);
        (0, chai_1.expect)(firstRow.children[3].innerHTML).to.include(6);
    });
    it('insertRow and a row is added', () => {
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
        instance[0].insertRow([9, 9, 9], 0, 1);
        table = root.querySelector('tbody');
        rows = table.children;
        firstRow = rows[0];
        // Check that the value of the first row now is [9, 9, 9]
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(firstRow.children[3].innerHTML).to.include(9);
    });
    it('moveRow and the row is moved', () => {
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
        instance[0].moveRow(0, 1);
        table = root.querySelector('tbody');
        rows = table.children;
        firstRow = rows[0];
        secondRow = rows[1];
        A1 = firstRow.children[1];
        A2 = secondRow.children[1];
        (0, chai_1.expect)(A1.innerHTML).to.include(4);
        (0, chai_1.expect)(A2.innerHTML).to.include(1);
    });
    it('deleteRow history', () => {
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
        instance[0].deleteRow(0);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(5);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(6);
        instance[0].undo();
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(3);
        instance[0].redo();
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(5);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(6);
    });
    it('insertRow history', () => {
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
        instance[0].insertRow([9, 9, 9], 0, 1);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
        instance[0].undo();
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(3);
        instance[0].redo();
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
    });
    it('moveRow history', () => {
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
        instance[0].moveRow(0, 1);
        (0, chai_1.expect)(table.children[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(table.children[1].children[1].innerHTML).to.include(1);
        instance[0].undo();
        (0, chai_1.expect)(table.children[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(table.children[1].children[1].innerHTML).to.include(4);
        instance[0].redo();
        (0, chai_1.expect)(table.children[0].children[1].innerHTML).to.include(4);
        (0, chai_1.expect)(table.children[1].children[1].innerHTML).to.include(1);
    });
});
