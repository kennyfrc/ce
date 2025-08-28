"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the headers method', () => {
    it('setHeader and header title is changed', () => {
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[3, 6, 9, 12, 15, 18], [3, 6, 9, 12, 15, 18]],
                },
            ]
        });
        let table = root.querySelector('thead');
        if (!table)
            throw new Error('Element not found');
        let headers = table.children[0].children;
        (0, chai_1.expect)(headers[1].innerHTML).to.include('A');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('B');
        instance[0].setHeader(0, 'Produtos');
        (0, chai_1.expect)(headers[1].innerHTML).to.include('Produtos');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('B');
        instance[0].setHeader(1, 'Quantidade');
        (0, chai_1.expect)(headers[1].innerHTML).to.include('Produtos');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('Quantidade');
    });
    it('getHeader and header title is retrieved', () => {
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[3, 6, 9, 12, 15, 18], [3, 6, 9, 12, 15, 18]],
                },
            ]
        });
        let table = root.querySelector('thead');
        if (!table)
            throw new Error('Element not found');
        let headers = table.children[0].children;
        (0, chai_1.expect)(headers[1].innerHTML).to.include('A');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('B');
        (0, chai_1.expect)(instance[0].getHeader(0)).to.include('A');
        (0, chai_1.expect)(instance[0].getHeader(1)).to.include('B');
        (0, chai_1.expect)(instance[0].getHeader(2)).to.include('C');
    });
    it('getHeaders and header titles are retrieved', () => {
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[3, 6, 9, 12, 15, 18], [3, 6, 9, 12, 15, 18]],
                },
            ]
        });
        let table = root.querySelector('thead');
        if (!table)
            throw new Error('Element not found');
        let headers = table.children[0].children;
        (0, chai_1.expect)(headers[1].innerHTML).to.include('A');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('B');
        let h = instance[0].getHeaders();
        (0, chai_1.expect)(h).to.include('A');
        (0, chai_1.expect)(h).to.include('B');
        (0, chai_1.expect)(h).to.include('C');
        (0, chai_1.expect)(h).to.include('D');
        (0, chai_1.expect)(h).to.include('E');
        (0, chai_1.expect)(h).to.include('F');
    });
    it('setHeader history', () => {
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[3, 6, 9, 12, 15, 18], [3, 6, 9, 12, 15, 18]],
                },
            ]
        });
        let table = root.querySelector('thead');
        if (!table)
            throw new Error('Element not found');
        let headers = table.children[0].children;
        (0, chai_1.expect)(headers[1].innerHTML).to.equal('A');
        (0, chai_1.expect)(headers[2].innerHTML).to.equal('B');
        instance[0].setHeader(0, 'Products');
        (0, chai_1.expect)(headers[1].innerHTML).to.equal('Products');
        (0, chai_1.expect)(headers[2].innerHTML).to.equal('B');
        instance[0].undo();
        (0, chai_1.expect)(headers[1].innerHTML).to.equal('A');
        (0, chai_1.expect)(headers[2].innerHTML).to.equal('B');
        instance[0].redo();
        (0, chai_1.expect)(headers[1].innerHTML).to.equal('Products');
        (0, chai_1.expect)(headers[2].innerHTML).to.equal('B');
    });
});
