"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the data method', () => {
    it('getData and it returns the data properly', () => {
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
        const data = instance[0].getData();
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
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    worksheetName: 'Countries'
                },
            ]
        });
        const data = instance[0].setData([['Hello', 'World'], ['Testing', 'CE']]);
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
        instance[0].setValue('A1', 'New Value');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        instance[0].setValue('A1', 'olleH');
        instance[0].setValue('B1', 'dlroW');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('olleH');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('dlroW');
        instance[0].setValue('B2', 'TESTING');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.include('Testing');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.include('TESTING');
    });
    it('getValue and it gets the value from the cell', () => {
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
        (0, chai_1.expect)(instance[0].getValue('A1')).to.include('Hello');
        (0, chai_1.expect)(instance[0].getValue('B1')).to.include('World');
        (0, chai_1.expect)(instance[0].getValue('A2')).to.include('Testing');
        (0, chai_1.expect)(instance[0].getValue('B2')).to.include('CE');
    });
    it('getValueFromCoords and it gets the not processed cell value', () => {
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
        (0, chai_1.expect)(instance[0].getValueFromCoords(0, 0)).to.include('=1+1');
        (0, chai_1.expect)(instance[0].getValueFromCoords(1, 0)).to.include('=2+2');
        (0, chai_1.expect)(instance[0].getValueFromCoords(0, 1)).to.include('Testing');
        (0, chai_1.expect)(instance[0].getValueFromCoords(1, 1)).to.include('CE');
    });
    it('getValueFromCoords and it gets the processed cell value', () => {
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
        (0, chai_1.expect)(instance[0].getValueFromCoords(0, 0, true)).to.include('2');
        (0, chai_1.expect)(instance[0].getValueFromCoords(1, 0, true)).to.include('4');
        (0, chai_1.expect)(instance[0].getValueFromCoords(0, 1, true)).to.include('Testing');
        (0, chai_1.expect)(instance[0].getValueFromCoords(1, 1, true)).to.include('CE');
    });
    it('setValueFromCoords and it sets the value of a cell', () => {
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
        instance[0].setValueFromCoords(0, 0, 'New Value');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        instance[0].setValueFromCoords(0, 0, 'olleH');
        instance[0].setValueFromCoords(1, 0, 'dlroW');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('olleH');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('dlroW');
        instance[0].setValueFromCoords(1, 1, 'TESTING');
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.include('Testing');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.include('TESTING');
    });
    it('setValueFromCoords history', () => {
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
        instance[0].setValueFromCoords(0, 0, 'New Value');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        instance[0].undo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        instance[0].redo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
    });
});
