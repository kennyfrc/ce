"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Comment tests', () => {
    it('Set comment', () => {
        var _a, _b, _c, _d;
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
        (_b = (_a = instance[0]).setComments) === null || _b === void 0 ? void 0 : _b.call(_a, 'C2', 'Test');
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('Test');
        (_d = (_c = instance[0]).setComments) === null || _d === void 0 ? void 0 : _d.call(_c, 'C2', '');
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('');
    });
    it('Get comment', () => {
        var _a, _b, _c, _d;
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
        (_b = (_a = instance[0]).setComments) === null || _b === void 0 ? void 0 : _b.call(_a, 'B3', 'something');
        (0, chai_1.expect)((_d = (_c = instance[0]).getComments) === null || _d === void 0 ? void 0 : _d.call(_c, 'B3')).to.equal('something');
    });
    it('setComments history', () => {
        var _a, _b, _c, _d, _e, _f;
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
        (_b = (_a = instance[0]).setComments) === null || _b === void 0 ? void 0 : _b.call(_a, 'C2', 'Test');
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('Test');
        (_d = (_c = instance[0]).undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('');
        (_f = (_e = instance[0]).redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(rows[1].children[3].getAttribute('title')).to.equal('Test');
    });
});
