"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Merge tests', () => {
    describe('Get merge', () => {
        it('Worksheet started with a merge', () => {
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
                            C1: [1, 2]
                        }
                    }]
            });
            (0, chai_1.expect)(instance[0].getMerge('C1')).to.eql([1, 2]);
            (0, chai_1.expect)(instance[0].getMerge('C2')).to.equal(null);
            (0, chai_1.expect)(instance[0].getMerge()).to.eql({ C1: [1, 2] });
        });
        it('Worksheet started without merges', () => {
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
                    }]
            });
            (0, chai_1.expect)(instance[0].getMerge('C1')).to.equal(null);
            (0, chai_1.expect)(instance[0].getMerge()).to.eql({});
        });
    });
    it('Set merge', () => {
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
                }]
        });
        instance[0].setMerge('A3', 2, 3);
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        (0, chai_1.expect)(rows[2].children[1].getAttribute('colspan')).to.equal('2');
        (0, chai_1.expect)(rows[2].children[1].getAttribute('rowspan')).to.equal('3');
    });
    it('Remove merge', () => {
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
                        A1: [2, 2],
                        E5: [3, 2],
                    }
                }]
        });
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        instance[0].removeMerge('A1');
        (0, chai_1.expect)(rows[0].children[1].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('rowspan')).to.equal(null);
        (0, chai_1.expect)(rows[4].children[5].getAttribute('colspan')).to.equal('3');
        (0, chai_1.expect)(rows[4].children[5].getAttribute('rowspan')).to.equal('2');
    });
    it('Remove all merge', () => {
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
                        A1: [2, 2],
                        E5: [3, 2],
                    }
                }]
        });
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        instance[0].destroyMerge();
        (0, chai_1.expect)(rows[0].children[1].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('rowspan')).to.equal(null);
        (0, chai_1.expect)(rows[4].children[5].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[4].children[5].getAttribute('rowspan')).to.equal(null);
    });
    it('setMerge history', () => {
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
                }]
        });
        instance[0].setMerge('A3', 2, 3);
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        (0, chai_1.expect)(rows[2].children[1].getAttribute('colspan')).to.equal('2');
        (0, chai_1.expect)(rows[2].children[1].getAttribute('rowspan')).to.equal('3');
        instance[0].undo();
        (0, chai_1.expect)(rows[0].children[1].getAttribute('colspan')).to.equal(null);
        (0, chai_1.expect)(rows[0].children[1].getAttribute('rowspan')).to.equal(null);
        instance[0].redo();
        (0, chai_1.expect)(rows[2].children[1].getAttribute('colspan')).to.equal('2');
        (0, chai_1.expect)(rows[2].children[1].getAttribute('rowspan')).to.equal('3');
    });
});
