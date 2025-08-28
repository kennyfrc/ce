"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Comment tests', () => {
    it('Set comment', () => {
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: [
                        ['US', 'Cheese', '2019-02-12'],
                        ['CA', 'Apples', '2019-03-01'],
                        ['CA', 'Carrots', '2018-11-10'],
                        ['BR', 'Oranges', '2019-01-12'],
                    ],
                    columns: [
                        { width: '300px' },
                        { width: '200px' },
                        { width: '200px' },
                    ],
                    allowComments: true,
                }
            ],
        });
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        instance[0].setComments('C2', 'Test');
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('Test');
        instance[0].setComments('C2', '');
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('');
    });
    it('Get comment', () => {
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: [
                        ['US', 'Cheese', '2019-02-12'],
                        ['CA', 'Apples', '2019-03-01'],
                        ['CA', 'Carrots', '2018-11-10'],
                        ['BR', 'Oranges', '2019-01-12'],
                    ],
                    columns: [
                        { width: '300px' },
                        { width: '200px' },
                        { width: '200px' },
                    ],
                    allowComments: true,
                }
            ],
        });
        instance[0].setComments('B3', 'something');
        (0, chai_1.expect)(instance[0].getComments('B3')).to.equal('something');
    });
    it('setComments history', () => {
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: [
                        ['US', 'Cheese', '2019-02-12'],
                        ['CA', 'Apples', '2019-03-01'],
                        ['CA', 'Carrots', '2018-11-10'],
                        ['BR', 'Oranges', '2019-01-12'],
                    ],
                    columns: [
                        { width: '300px' },
                        { width: '200px' },
                        { width: '200px' },
                    ],
                    allowComments: true,
                }
            ],
        });
        const table = root.querySelector('tbody');
        if (!table)
            throw new Error('Element not found');
        const rows = table.children;
        instance[0].setComments('C2', 'Test');
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('Test');
        instance[0].undo();
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('');
        instance[0].redo();
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('Test');
    });
});
