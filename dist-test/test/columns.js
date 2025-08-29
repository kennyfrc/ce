"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use the columns method', () => {
    it('insertColumn and column is inserted in the position 0', () => {
        var _a, _b, _c, _d;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[9, 9, 9, 9, 9, 9], [9, 9, 9, 9, 9, 9]],
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        // Insert [3, 3] column in the first column
        (_b = (_a = instance[0]).insertColumn) === null || _b === void 0 ? void 0 : _b.call(_a, [3, 3], 0, true);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(3);
        // Insert [2, 2] column in the first column
        (_d = (_c = instance[0]).insertColumn) === null || _d === void 0 ? void 0 : _d.call(_c, [2, 2], 0, true);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(2);
    });
    it('insertColumn and column is inserted in the position 1', () => {
        var _a, _b, _c, _d;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[9, 9, 9, 9, 9, 9], [9, 9, 9, 9, 9, 9]],
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(9);
        // Insert [3, 3] column in the second column
        (_b = (_a = instance[0]).insertColumn) === null || _b === void 0 ? void 0 : _b.call(_a, [3, 3], 0);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(3);
        // Insert [2, 2] column in the second column
        (_d = (_c = instance[0]).insertColumn) === null || _d === void 0 ? void 0 : _d.call(_c, [2, 2], 0);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
    });
    it('deleteColumn and column is removed in the given index', () => {
        var _a, _b, _c, _d;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[3, 6, 9, 9, 9, 9], [3, 6, 9, 9, 9, 9]],
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(3);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(6);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
        // Delete first column
        (_b = (_a = instance[0]).deleteColumn) === null || _b === void 0 ? void 0 : _b.call(_a, 0);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(6);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
        // Delete first column
        (_d = (_c = instance[0]).deleteColumn) === null || _d === void 0 ? void 0 : _d.call(_c, 0);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
    });
    it('deleteColumn and multiple column are removed starting from the given index', () => {
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
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(3);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(6);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(9);
        // Delete first two columns
        (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.deleteColumn) === null || _b === void 0 ? void 0 : _b.call(_a, 0, 2);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(12);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(15);
        // Delete first two columns
        (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.deleteColumn) === null || _d === void 0 ? void 0 : _d.call(_c, 0, 2);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(15);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(18);
    });
    it('hideColumn and showColumn', () => {
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
        (0, chai_1.expect)(window.getComputedStyle(headers[1]).display).not.to.include('none');
        // Hides the first column 'A'
        (_b = (_a = instance[0]).hideColumn) === null || _b === void 0 ? void 0 : _b.call(_a, 0);
        (0, chai_1.expect)(headers[1].innerHTML).to.include('A');
        (0, chai_1.expect)(window.getComputedStyle(headers[1]).display).to.include('none');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('B');
        (0, chai_1.expect)(window.getComputedStyle(headers[2]).display).not.to.include('none');
        // Shows the column that was hidden
        (_d = (_c = instance[0]).showColumn) === null || _d === void 0 ? void 0 : _d.call(_c, 0);
        (0, chai_1.expect)(headers[1].innerHTML).to.include('A');
        (0, chai_1.expect)(window.getComputedStyle(headers[1]).display).not.to.include('none');
        (0, chai_1.expect)(headers[2].innerHTML).to.include('B');
        (0, chai_1.expect)(window.getComputedStyle(headers[2]).display).not.to.include('none');
    });
    it('insertColumn history', () => {
        var _a, _b, _c, _d, _e, _f;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[9, 9, 9, 9, 9, 9], [9, 9, 9, 9, 9, 9]],
                },
            ]
        });
        let table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        let rows = table.children;
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        // Insert [3, 3] column in the first column
        (_b = (_a = instance[0]).insertColumn) === null || _b === void 0 ? void 0 : _b.call(_a, [3, 3], 0, true);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(3);
        (_d = (_c = instance[0]).undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(9);
        (_f = (_e = instance[0]).redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(3);
    });
    it('deleteColumn history', () => {
        var _a, _b, _c, _d, _e, _f;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [[1, 2, 3, 4], [5, 6, 7, 8]],
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
        // Delete first column
        (_b = (_a = instance[0]).deleteColumn) === null || _b === void 0 ? void 0 : _b.call(_a, 0);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(3);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(4);
        (_d = (_c = instance[0]).undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(1);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(3);
        (_f = (_e = instance[0]).redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(rows[0].children[1].innerHTML).to.include(2);
        (0, chai_1.expect)(rows[0].children[2].innerHTML).to.include(3);
        (0, chai_1.expect)(rows[0].children[3].innerHTML).to.include(4);
    });
});
