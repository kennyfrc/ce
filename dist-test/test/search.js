"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use search', () => {
    it('search and resetSearch methods', () => {
        var _a, _b, _c, _d, _e, _f;
        const instance = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    search: true,
                    minDimensions: [7, 7],
                    data: [
                        ['Mazda', 2001, 2000, '2006-01-01 12:00:00'],
                        ['Peugeot', 2010, 5000, '2005-01-01 13:00:00'],
                        ['Honda Fit', 2009, 3000, '2004-01-01 14:01:00'],
                        ['Honda CRV', 2010, 6000, '2003-01-01 23:30:00'],
                    ],
                },
            ]
        });
        (_b = (_a = instance[0]).search) === null || _b === void 0 ? void 0 : _b.call(_a, 'Honda');
        (0, chai_1.expect)((_c = instance[0].searchInput) === null || _c === void 0 ? void 0 : _c.value).to.equal('Honda');
        const bodyTag = root.querySelector('tbody');
        if (!bodyTag)
            throw new Error('Element not found');
        (0, chai_1.expect)(bodyTag.children.length).to.equal(2);
        (0, chai_1.expect)(bodyTag.children[0].getAttribute('data-y')).to.equal('2');
        (0, chai_1.expect)(bodyTag.children[1].getAttribute('data-y')).to.equal('3');
        (_e = (_d = instance[0]).resetSearch) === null || _e === void 0 ? void 0 : _e.call(_d);
        (0, chai_1.expect)((_f = instance[0].searchInput) === null || _f === void 0 ? void 0 : _f.value).to.equal('');
        (0, chai_1.expect)(bodyTag.children[0].getAttribute('data-y')).to.equal('0');
        (0, chai_1.expect)(bodyTag.children[1].getAttribute('data-y')).to.equal('1');
    });
});
