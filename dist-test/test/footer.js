"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use footers', () => {
    it('Start the worksheet with a footer', () => {
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    freezeColumns: 2,
                    data: [
                        ['Hello', 'World'],
                        ['Testing', 'CE']
                    ],
                    footers: [
                        ['a', 'b', 'c'],
                        ['1', '2', '3'],
                    ]
                },
            ]
        });
        const footerTag = root.querySelector('tfoot');
        if (!footerTag)
            throw new Error('Element not found');
        const firstRow = footerTag.children[0];
        (0, chai_1.expect)(firstRow.children[1].innerHTML).to.equal('a');
        (0, chai_1.expect)(firstRow.children[2].innerHTML).to.equal('b');
        (0, chai_1.expect)(firstRow.children[3].innerHTML).to.equal('c');
        const secondRow = footerTag.children[1];
        (0, chai_1.expect)(secondRow.children[1].innerHTML).to.equal('1');
        (0, chai_1.expect)(secondRow.children[2].innerHTML).to.equal('2');
        (0, chai_1.expect)(secondRow.children[3].innerHTML).to.equal('3');
    });
});
