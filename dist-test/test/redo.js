"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the redo method', () => {
    it('.undo', () => {
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
        instance[0].setValueFromCoords(1, 0, 'TESTING');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('TESTING');
        instance[0].undo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        instance[0].undo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
    });
    it('.redo after undo something', () => {
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
        instance[0].setValueFromCoords(1, 0, 'TESTING');
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('TESTING');
        instance[0].undo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        instance[0].undo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('Hello');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        instance[0].redo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('World');
        instance[0].redo();
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.include('New Value');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.include('TESTING');
    });
});
