"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the headers method', () => {
    it('setHeader and header title is changed', () => {
        var _a, _b, _c, _d;
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
        (_b = (_a = instance[0]).setHeader) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 'Produtos');
        (0, chai_1.expect)(headers[1].innerHTML).to.include('Produtos');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('B');
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.setHeader) === null || _d === void 0 ? void 0 : _d.call(_c, 1, 'Quantidade');
        (0, chai_1.expect)(headers[1].innerHTML).to.include('Produtos');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('Quantidade');
    });
    it('getHeader and header title is retrieved', () => {
        var _a, _b, _c, _d, _e, _f;
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
        (0, chai_1.expect)((_b = (_a = instance[0]).getHeader) === null || _b === void 0 ? void 0 : _b.call(_a, 0)).to.include('A');
        (0, chai_1.expect)((_d = (_c = instance[0]).getHeader) === null || _d === void 0 ? void 0 : _d.call(_c, 1)).to.include('B');
        (0, chai_1.expect)((_f = (_e = instance[0]).getHeader) === null || _f === void 0 ? void 0 : _f.call(_e, 2)).to.include('C');
    });
    it('getHeaders and header titles are retrieved', () => {
        var _a, _b;
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
        let h = (_b = (_a = instance[0]).getHeaders) === null || _b === void 0 ? void 0 : _b.call(_a);
        (0, chai_1.expect)(h).to.include('A');
        (0, chai_1.expect)(h).to.include('B');
        (0, chai_1.expect)(h).to.include('C');
        (0, chai_1.expect)(h).to.include('D');
        (0, chai_1.expect)(h).to.include('E');
        (0, chai_1.expect)(h).to.include('F');
    });
    it('setHeader history', () => {
        var _a, _b, _c, _d, _e, _f;
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
        (_b = (_a = instance[0]).setHeader) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 'Products');
        (0, chai_1.expect)(headers[1].innerHTML).to.equal('Products');
        (0, chai_1.expect)(headers[2].innerHTML).to.equal('B');
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(headers[1].innerHTML).to.equal('A');
        (0, chai_1.expect)(headers[2].innerHTML).to.equal('B');
        (_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(headers[1].innerHTML).to.equal('Products');
        (0, chai_1.expect)(headers[2].innerHTML).to.equal('B');
    });
});
