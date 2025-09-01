"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
// Global test environment variables are declared in test/global.d.ts
describe('Merge tests', () => {
    describe('Get merge', () => {
        it('Worksheet started with a merge', () => {
            var _a, _b, _c, _d, _e, _f;
            const instance = (0, index_1.default)(globalThis.root, {
                toolbar: true,
                worksheets: [{
                        data: [
                            ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                            ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                            ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                            ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                        ],
                        minDimensions: [10, 15],
                        columns: [
                            {
                                width: '300px',
                            },
                            {
                                width: '80px',
                            },
                            {
                                width: '100px',
                            },
                            {
                                width: '150px',
                            },
                        ],
                        mergeCells: {
                            C1: [1, 2, []]
                        }
                    }]
            });
            (0, chai_1.expect)((_b = (_a = instance[0]).getMerge) === null || _b === void 0 ? void 0 : _b.call(_a, 'C1')).to.have.length(2); // [colspan, rowspan]
            (0, chai_1.expect)((_d = (_c = instance[0]).getMerge) === null || _d === void 0 ? void 0 : _d.call(_c, 'C2')).to.equal(null);
            (0, chai_1.expect)((_f = (_e = instance[0]).getMerge) === null || _f === void 0 ? void 0 : _f.call(_e)).to.have.property('C1');
        });
        it('Worksheet started without merges', () => {
            var _a, _b, _c, _d;
            const instance = (0, index_1.default)(globalThis.root, {
                toolbar: true,
                worksheets: [{
                        data: [
                            ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                            ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                            ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                            ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                        ],
                        minDimensions: [10, 15],
                        columns: [
                            {
                                width: '300px',
                            },
                            {
                                width: '80px',
                            },
                            {
                                width: '100px',
                            },
                            {
                                width: '150px',
                            },
                        ],
                    }]
            });
            (0, chai_1.expect)((_b = (_a = instance[0]).getMerge) === null || _b === void 0 ? void 0 : _b.call(_a, 'C1')).to.equal(null);
            (0, chai_1.expect)((_d = (_c = instance[0]).getMerge) === null || _d === void 0 ? void 0 : _d.call(_c)).to.eql({});
        });
    });
    it('Set merge', () => {
        const instance = (0, index_1.default)(global.root, {
            toolbar: true,
            worksheets: [{
                    data: [
                        ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                        ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                        ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                        ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                    ],
                    minDimensions: [10, 15],
                    columns: [
                        {
                            width: '300px',
                        },
                        {
                            width: '80px',
                        },
                        {
                            width: '100px',
                        },
                        {
                            width: '150px',
                        },
                    ],
                }]
        });
        instance[0].setMerge('A3', 2, 3);
        const table = global.root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        (0, chai_1.expect)(rows[2].children[1].getAttribute('colspan')).to.equal('2');
        (0, chai_1.expect)(rows[2].children[1].getAttribute('rowspan')).to.equal('3');
    });
    it('Remove merge', () => {
        var _a, _b;
        const instance = (0, index_1.default)(globalThis.root, {
            toolbar: true,
            worksheets: [{
                    data: [
                        ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                        ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                        ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                        ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                    ],
                    minDimensions: [10, 15],
                    columns: [
                        {
                            width: '300px',
                        },
                        {
                            width: '80px',
                        },
                        {
                            width: '100px',
                        },
                        {
                            width: '150px',
                        },
                    ],
                    mergeCells: {
                        A1: [2, 2, []],
                        E5: [3, 2, []],
                    }
                }]
        });
        const table = globalThis.root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        (_b = (_a = instance[0]).removeMerge) === null || _b === void 0 ? void 0 : _b.call(_a, 'A1');
        (0, chai_1.expect)(rows[0].children[1].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('rowspan')).to.equal(null);
        (0, chai_1.expect)(rows[4].children[5].getAttribute('colspan')).to.equal('3');
        (0, chai_1.expect)(rows[4].children[5].getAttribute('rowspan')).to.equal('2');
    });
    it('Remove all merge', () => {
        var _a, _b;
        const instance = (0, index_1.default)(globalThis.root, {
            toolbar: true,
            worksheets: [{
                    data: [
                        ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                        ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                        ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                        ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                    ],
                    minDimensions: [10, 15],
                    columns: [
                        {
                            width: '300px',
                        },
                        {
                            width: '80px',
                        },
                        {
                            width: '100px',
                        },
                        {
                            width: '150px',
                        },
                    ],
                    mergeCells: {
                        A1: [2, 2, []],
                        E5: [3, 2, []],
                    }
                }]
        });
        const table = globalThis.root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        (_b = (_a = instance[0]).destroyMerge) === null || _b === void 0 ? void 0 : _b.call(_a);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('rowspan')).to.equal(null);
        (0, chai_1.expect)(rows[4].children[5].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[4].children[5].getAttribute('rowspan')).to.equal(null);
    });
    it('setMerge history', () => {
        var _a, _b, _c, _d;
        const instance = (0, index_1.default)(globalThis.root, {
            toolbar: true,
            worksheets: [{
                    data: [
                        ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                        ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                        ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                        ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                    ],
                    minDimensions: [10, 15],
                    columns: [
                        {
                            width: '300px',
                        },
                        {
                            width: '80px',
                        },
                        {
                            width: '100px',
                        },
                        {
                            width: '150px',
                        },
                    ],
                }]
        });
        instance[0].setMerge('A3', 2, 3);
        const table = globalThis.root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        (0, chai_1.expect)(rows[2].children[1].getAttribute('colspan')).to.equal('2');
        (0, chai_1.expect)(rows[2].children[1].getAttribute('rowspan')).to.equal('3');
        (_b = (_a = instance[0]).undo) === null || _b === void 0 ? void 0 : _b.call(_a);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('rowspan')).to.equal(null);
        (_d = (_c = instance[0]).redo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(rows[2].children[1].getAttribute('colspan')).to.equal('2');
        (0, chai_1.expect)(rows[2].children[1].getAttribute('rowspan')).to.equal('3');
    });
    it('removeMerge event', () => {
        var _a, _b, _c, _d;
        let eventCalled = false;
        let eventCellName = null;
        let eventInstance = null;
        let eventBeforeMerges = null;
        const instance = (0, index_1.default)(root, {
            toolbar: true,
            worksheets: [{
                    data: [
                        ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                        ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                        ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                        ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                    ],
                    minDimensions: [10, 15],
                    columns: [
                        {
                            width: '300px',
                        },
                        {
                            width: '80px',
                        },
                        {
                            width: '100px',
                        },
                        {
                            width: '150px',
                        },
                    ],
                    mergeCells: {
                        A1: [2, 2, []],
                        E5: [3, 2, []],
                    }
                }],
            onunmerge: (worksheetInstance, cellName, beforeMerges) => {
                eventCalled = true;
                eventCellName = cellName;
                eventInstance = worksheetInstance;
                eventBeforeMerges = beforeMerges;
            }
        });
        (_b = (_a = instance[0]).removeMerge) === null || _b === void 0 ? void 0 : _b.call(_a, 'A1');
        (0, chai_1.expect)(eventCalled).to.equal(true);
        (0, chai_1.expect)(eventCellName).to.equal('A1');
        (0, chai_1.expect)(eventInstance).to.equal(instance[0]);
        (0, chai_1.expect)(eventBeforeMerges).to.not.equal(null);
        (0, chai_1.expect)(eventBeforeMerges['A1'][0]).to.eql(2);
        (0, chai_1.expect)(eventBeforeMerges['A1'][1]).to.eql(2);
        (0, chai_1.expect)(Object.keys(eventBeforeMerges).length).to.eql(1);
        (0, chai_1.expect)((_d = (_c = instance[0]).getMerge) === null || _d === void 0 ? void 0 : _d.call(_c, 'A1')).to.equal(null);
    });
});
