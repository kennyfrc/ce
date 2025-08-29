"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Meta tests', () => {
    describe('Set meta information', () => {
        it('Set meta information using an object', () => {
            var _a, _b, _c, _d;
            const instance = (0, index_1.default)(root, {
                worksheets: [{
                        data: [
                            ['US', 'Apples', 'Yes', '2019-02-12'],
                            ['UK', 'Carrots', 'Yes', '2019-03-01'],
                            ['CA', 'Oranges', 'No', '2018-11-10'],
                            ['BR', 'Coconuts', 'Yes', '2019-01-12'],
                        ],
                    }]
            });
            (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.setMeta) === null || _b === void 0 ? void 0 : _b.call(_a, { B1: { id: '1', y: '2019' }, C2: { test: '2' } });
            (0, chai_1.expect)(instance[0].options.meta).to.eql({ B1: { id: '1', y: '2019' }, C2: { test: '2' } });
            (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.setMeta) === null || _d === void 0 ? void 0 : _d.call(_c, { C2: { something: '35' } });
            (0, chai_1.expect)(instance[0].options.meta).to.eql({ B1: { id: '1', y: '2019' }, C2: { test: '2', something: '35' } });
        });
        it('Set meta information using strings', () => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const instance = (0, index_1.default)(root, {
                worksheets: [{
                        data: [
                            ['US', 'Apples', 'Yes', '2019-02-12'],
                            ['UK', 'Carrots', 'Yes', '2019-03-01'],
                            ['CA', 'Oranges', 'No', '2018-11-10'],
                            ['BR', 'Coconuts', 'Yes', '2019-01-12'],
                        ],
                    }],
            });
            (_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.setMeta) === null || _b === void 0 ? void 0 : _b.call(_a, 'A1', 'myMeta', 'this is just a test');
            (_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.setMeta) === null || _d === void 0 ? void 0 : _d.call(_c, 'A1', 'otherMetaInformation', 'other test');
            (_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.setMeta) === null || _f === void 0 ? void 0 : _f.call(_e, 'D2', 'info', 'test');
            (0, chai_1.expect)(instance[0].options.meta).to.eql({
                A1: { myMeta: 'this is just a test', otherMetaInformation: 'other test' },
                D2: { info: 'test' }
            });
            (_h = (_g = instance[0]) === null || _g === void 0 ? void 0 : _g.setMeta) === null || _h === void 0 ? void 0 : _h.call(_g, 'D2', 'myMetaData', 'something');
            (0, chai_1.expect)(instance[0].options.meta).to.eql({
                A1: { myMeta: 'this is just a test', otherMetaInformation: 'other test' },
                D2: { info: 'test', myMetaData: 'something' }
            });
        });
    });
    it('Get meta information', () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const instance = (0, index_1.default)(root, {
            worksheets: [{
                    data: [
                        ['US', 'Apples', 'Yes', '2019-02-12'],
                        ['UK', 'Carrots', 'Yes', '2019-03-01'],
                        ['CA', 'Oranges', 'No', '2018-11-10'],
                        ['BR', 'Coconuts', 'Yes', '2019-01-12'],
                    ],
                    meta: {
                        A1: { myMeta: 'this is just a test', otherMetaInformation: 'other test' },
                        D2: { info: 'test' }
                    },
                }]
        });
        (0, chai_1.expect)((_b = (_a = instance[0]) === null || _a === void 0 ? void 0 : _a.getMeta) === null || _b === void 0 ? void 0 : _b.call(_a)).to.eql({
            A1: { myMeta: 'this is just a test', otherMetaInformation: 'other test' },
            D2: { info: 'test' }
        });
        (0, chai_1.expect)((_d = (_c = instance[0]) === null || _c === void 0 ? void 0 : _c.getMeta) === null || _d === void 0 ? void 0 : _d.call(_c, 'A1')).to.eql({
            myMeta: 'this is just a test',
            otherMetaInformation: 'other test'
        });
        (0, chai_1.expect)((_f = (_e = instance[0]) === null || _e === void 0 ? void 0 : _e.getMeta) === null || _f === void 0 ? void 0 : _f.call(_e, 'D2')).to.eql({ info: 'test' });
        (0, chai_1.expect)((_h = (_g = instance[0]) === null || _g === void 0 ? void 0 : _g.getMeta) === null || _h === void 0 ? void 0 : _h.call(_g, 'A2')).to.equal(null);
    });
});
