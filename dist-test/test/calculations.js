"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe("Calculations", () => {
    it("Testing formula chain", () => {
        var _a, _b, _c, _d;
        let test = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: [
                        ["1", ""],
                        ["", ""],
                        ["", ""],
                        ["", ""],
                        ["", ""],
                    ],
                },
            ],
        });
        const sheet = test[0];
        (_a = sheet.setValue) === null || _a === void 0 ? void 0 : _a.call(sheet, "B5", "=B3+A1");
        (_b = sheet.setValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "B3", "=A1+1");
        (_c = sheet.setValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "A1", "2");
        (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "B5", true)).to.equal("5");
    });
    describe("Test updating formulas when adding new rows", () => {
        it("1", () => {
            var _a, _b, _c, _d, _e;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "=SUM(A2:C2)"],
                            ["4", "5", "6", "=SUM(A2:C2)"],
                            ["7", "8", "9", "=SUM(A2:C2)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 1, true);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "D1")).to.equal("=SUM(A3:C3)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "D2")).to.equal("");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "D3")).to.equal("=SUM(A3:C3)");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(A3:C3)");
        });
        it("2", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "=SUM(A2:C3)"],
                            ["4", "5", "6", "=SUM(A2:C3)"],
                            ["7", "8", "9", "=SUM(A2:C3)"],
                            ["10", "11", "12", "=SUM(A2:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 1, true);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "D1")).to.equal("=SUM(A3:C4)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "D2")).to.equal("");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "D3")).to.equal("=SUM(A3:C4)");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(A3:C4)");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "D5")).to.equal("=SUM(A3:C4)");
        });
        it("3", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "=SUM(A2:C3)"],
                            ["4", "5", "6", "=SUM(A2:C3)"],
                            ["7", "8", "9", "=SUM(A2:C3)"],
                            ["10", "11", "12", "=SUM(A2:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 1, false);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "D1")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "D2")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "D3")).to.equal("");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "D5")).to.equal("=SUM(A2:C4)");
        });
        it("4", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "=SUM(A2:C3)"],
                            ["4", "5", "6", "=SUM(A2:C3)"],
                            ["7", "8", "9", "=SUM(A2:C3)"],
                            ["10", "11", "12", "=SUM(A2:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 2, true);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "D1")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "D2")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "D3")).to.equal("");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "D5")).to.equal("=SUM(A2:C4)");
        });
        it("5", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "=SUM(A2:C3)"],
                            ["4", "5", "6", "=SUM(A2:C3)"],
                            ["7", "8", "9", "=SUM(A2:C3)"],
                            ["10", "11", "12", "=SUM(A2:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 2, false);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "D1")).to.equal("=SUM(A2:C3)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "D2")).to.equal("=SUM(A2:C3)");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "D3")).to.equal("=SUM(A2:C3)");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "D5")).to.equal("=SUM(A2:C3)");
        });
    });
    describe("Test updating formulas when adding new columns", () => {
        it("1", () => {
            var _a, _b, _c, _d, _e;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3"],
                            ["4", "5", "6"],
                            ["7", "8", "9"],
                            ["=SUM(B1:B3)", "=SUM(B1:B3)", "=SUM(B1:B3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertColumn) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 1, true);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "A4")).to.equal("=SUM(C1:C3)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "B4")).to.equal("");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "C4")).to.equal("=SUM(C1:C3)");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(C1:C3)");
        });
        it("2", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "4"],
                            ["5", "6", "7", "8"],
                            ["9", "10", "11", "12"],
                            ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertColumn) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 1, true);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "A4")).to.equal("=SUM(C1:D3)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "B4")).to.equal("");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "C4")).to.equal("=SUM(C1:D3)");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(C1:D3)");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "E4")).to.equal("=SUM(C1:D3)");
        });
        it("3", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "4"],
                            ["5", "6", "7", "8"],
                            ["9", "10", "11", "12"],
                            ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertColumn) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 1, false);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "A4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "B4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "C4")).to.equal("");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "E4")).to.equal("=SUM(B1:D3)");
        });
        it("4", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "4"],
                            ["5", "6", "7", "8"],
                            ["9", "10", "11", "12"],
                            ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertColumn) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 2, true);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "A4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "B4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "C4")).to.equal("");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "E4")).to.equal("=SUM(B1:D3)");
        });
        it("5", () => {
            var _a, _b, _c, _d, _e, _f;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            ["1", "2", "3", "4"],
                            ["5", "6", "7", "8"],
                            ["9", "10", "11", "12"],
                            ["=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)", "=SUM(B1:C3)"],
                        ],
                        worksheetName: "sheet1",
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.insertColumn) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 2, false);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "A4")).to.equal("=SUM(B1:C3)");
            (0, chai_1.expect)((_c = sheet.getValue) === null || _c === void 0 ? void 0 : _c.call(sheet, "B4")).to.equal("=SUM(B1:C3)");
            (0, chai_1.expect)((_d = sheet.getValue) === null || _d === void 0 ? void 0 : _d.call(sheet, "C4")).to.equal("=SUM(B1:C3)");
            (0, chai_1.expect)((_e = sheet.getValue) === null || _e === void 0 ? void 0 : _e.call(sheet, "D4")).to.equal("");
            (0, chai_1.expect)((_f = sheet.getValue) === null || _f === void 0 ? void 0 : _f.call(sheet, "E4")).to.equal("=SUM(B1:C3)");
        });
        it("6", () => {
            var _a, _b;
            let test = (0, index_1.default)(root, {
                worksheets: [
                    {
                        data: [
                            [1, 2, 3],
                            [1, 2, 3],
                            [1, 2, 3],
                            [1, 2, 3],
                            [1, 2, 3],
                            ["=SUM(A1:A4)"],
                        ],
                        minDimensions: [5, 5],
                    },
                ],
            });
            const sheet = test[0];
            (_a = sheet.deleteRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 1);
            (0, chai_1.expect)((_b = sheet.getValue) === null || _b === void 0 ? void 0 : _b.call(sheet, "A5")).to.equal("=SUM(A1:A3)");
        });
    });
});
