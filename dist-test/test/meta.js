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
            instance[0].setMeta({ B1: { id: '1', y: '2019' }, C2: { test: '2' } });
            (0, chai_1.expect)(instance[0].options.meta).to.eql({ B1: { id: '1', y: '2019' }, C2: { test: '2' } });
            instance[0].setMeta({ C2: { something: '35' } });
            (0, chai_1.expect)(instance[0].options.meta).to.eql({ B1: { id: '1', y: '2019' }, C2: { test: '2', something: '35' } });
        });
        it('Set meta information using strings', () => {
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
            instance[0].setMeta('A1', 'myMeta', 'this is just a test');
            instance[0].setMeta('A1', 'otherMetaInformation', 'other test');
            instance[0].setMeta('D2', 'info', 'test');
            (0, chai_1.expect)(instance[0].options.meta).to.eql({
                A1: { myMeta: 'this is just a test', otherMetaInformation: 'other test' },
                D2: { info: 'test' }
            });
            instance[0].setMeta('D2', 'myMetaData', 'something');
            (0, chai_1.expect)(instance[0].options.meta).to.eql({
                A1: { myMeta: 'this is just a test', otherMetaInformation: 'other test' },
                D2: { info: 'test', myMetaData: 'something' }
            });
        });
    });
    it('Get meta information', () => {
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
        (0, chai_1.expect)(instance[0].getMeta()).to.eql({
            A1: { myMeta: 'this is just a test', otherMetaInformation: 'other test' },
            D2: { info: 'test' }
        });
        (0, chai_1.expect)(instance[0].getMeta('A1')).to.eql({
            myMeta: 'this is just a test',
            otherMetaInformation: 'other test'
        });
        (0, chai_1.expect)(instance[0].getMeta('D2')).to.eql({ info: 'test' });
        (0, chai_1.expect)(instance[0].getMeta('A2')).to.equal(null);
    });
});
