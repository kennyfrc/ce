"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe('Use pagination', () => {
    it('Start the worksheet with pagination', () => {
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [
                        [1, 2, 3, 4, 5],
                        [6, 7, 8, 9, 10],
                        [11, 12, 13, 14, 15],
                        [16, 17, 18, 19, 20],
                        [21, 22, 23, 24, 25],
                        [26, 27, 28, 29, 30],
                        [31, 32, 33, 34, 35],
                        [36, 37, 38, 39, 40],
                        [41, 42, 43, 44, 45],
                        [46, 47, 48, 49, 50],
                    ],
                    pagination: 3
                },
            ]
        });
        (0, chai_1.expect)(instance[0].quantiyOfPages()).to.equal(4);
        const bodyTag = root.querySelector('tbody');
        if (!bodyTag)
            throw new Error('Element not found');
        (0, chai_1.expect)(bodyTag.children.length).to.equal(3);
        (0, chai_1.expect)(bodyTag.children[0].getAttribute('data-y')).to.equal('0');
        (0, chai_1.expect)(bodyTag.children[1].getAttribute('data-y')).to.equal('1');
        (0, chai_1.expect)(bodyTag.children[2].getAttribute('data-y')).to.equal('2');
    });
    it('page method', () => {
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    minDimensions: [7, 7],
                    data: [
                        [1, 2, 3, 4, 5],
                        [6, 7, 8, 9, 10],
                        [11, 12, 13, 14, 15],
                        [16, 17, 18, 19, 20],
                        [21, 22, 23, 24, 25],
                        [26, 27, 28, 29, 30],
                        [31, 32, 33, 34, 35],
                        [36, 37, 38, 39, 40],
                        [41, 42, 43, 44, 45],
                        [46, 47, 48, 49, 50],
                    ],
                    pagination: 3
                },
            ]
        });
        instance[0].page(2);
        (0, chai_1.expect)(instance[0].quantiyOfPages()).to.equal(4);
        const bodyTag = root.querySelector('tbody');
        if (!bodyTag)
            throw new Error('Element not found');
        (0, chai_1.expect)(bodyTag.children.length).to.equal(3);
        (0, chai_1.expect)(bodyTag.children[0].getAttribute('data-y')).to.equal('6');
        (0, chai_1.expect)(bodyTag.children[1].getAttribute('data-y')).to.equal('7');
        (0, chai_1.expect)(bodyTag.children[2].getAttribute('data-y')).to.equal('8');
    });
});
