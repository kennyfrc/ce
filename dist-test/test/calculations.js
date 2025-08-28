"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe("Calculations", () => {
    it("Testing formula chain", () => {
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
        test[0].setValue("B5", "=B3+A1");
        test[0].setValue("B3", "=A1+1");
        test[0].setValue("A1", "2");
        (0, chai_1.expect)(test[0].getValue("B5", true)).to.equal("5");
    });
    describe("Test updating formulas when adding new rows", () => {
        it("1", () => {
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
            test[0].insertRow(1, 1, true);
            (0, chai_1.expect)(test[0].getValue("D1")).to.equal("=SUM(A3:C3)");
            (0, chai_1.expect)(test[0].getValue("D2")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("D3")).to.equal("=SUM(A3:C3)");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(A3:C3)");
        });
        it("2", () => {
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
            test[0].insertRow(1, 1, true);
            (0, chai_1.expect)(test[0].getValue("D1")).to.equal("=SUM(A3:C4)");
            (0, chai_1.expect)(test[0].getValue("D2")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("D3")).to.equal("=SUM(A3:C4)");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(A3:C4)");
            (0, chai_1.expect)(test[0].getValue("D5")).to.equal("=SUM(A3:C4)");
        });
        it("3", () => {
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
            test[0].insertRow(1, 1, false);
            (0, chai_1.expect)(test[0].getValue("D1")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)(test[0].getValue("D2")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)(test[0].getValue("D3")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)(test[0].getValue("D5")).to.equal("=SUM(A2:C4)");
        });
        it("4", () => {
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
            test[0].insertRow(1, 2, true);
            (0, chai_1.expect)(test[0].getValue("D1")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)(test[0].getValue("D2")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)(test[0].getValue("D3")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(A2:C4)");
            (0, chai_1.expect)(test[0].getValue("D5")).to.equal("=SUM(A2:C4)");
        });
        it("5", () => {
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
            test[0].insertRow(1, 2, false);
            (0, chai_1.expect)(test[0].getValue("D1")).to.equal("=SUM(A2:C3)");
            (0, chai_1.expect)(test[0].getValue("D2")).to.equal("=SUM(A2:C3)");
            (0, chai_1.expect)(test[0].getValue("D3")).to.equal("=SUM(A2:C3)");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("D5")).to.equal("=SUM(A2:C3)");
        });
    });
    describe("Test updating formulas when adding new columns", () => {
        it("1", () => {
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
            test[0].insertColumn(1, 1, true);
            (0, chai_1.expect)(test[0].getValue("A4")).to.equal("=SUM(C1:C3)");
            (0, chai_1.expect)(test[0].getValue("B4")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("C4")).to.equal("=SUM(C1:C3)");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(C1:C3)");
        });
        it("2", () => {
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
            test[0].insertColumn(1, 1, true);
            (0, chai_1.expect)(test[0].getValue("A4")).to.equal("=SUM(C1:D3)");
            (0, chai_1.expect)(test[0].getValue("B4")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("C4")).to.equal("=SUM(C1:D3)");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(C1:D3)");
            (0, chai_1.expect)(test[0].getValue("E4")).to.equal("=SUM(C1:D3)");
        });
        it("3", () => {
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
            test[0].insertColumn(1, 1, false);
            (0, chai_1.expect)(test[0].getValue("A4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)(test[0].getValue("B4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)(test[0].getValue("C4")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)(test[0].getValue("E4")).to.equal("=SUM(B1:D3)");
        });
        it("4", () => {
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
            test[0].insertColumn(1, 2, true);
            (0, chai_1.expect)(test[0].getValue("A4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)(test[0].getValue("B4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)(test[0].getValue("C4")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("=SUM(B1:D3)");
            (0, chai_1.expect)(test[0].getValue("E4")).to.equal("=SUM(B1:D3)");
        });
        it("5", () => {
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
            test[0].insertColumn(1, 2, false);
            (0, chai_1.expect)(test[0].getValue("A4")).to.equal("=SUM(B1:C3)");
            (0, chai_1.expect)(test[0].getValue("B4")).to.equal("=SUM(B1:C3)");
            (0, chai_1.expect)(test[0].getValue("C4")).to.equal("=SUM(B1:C3)");
            (0, chai_1.expect)(test[0].getValue("D4")).to.equal("");
            (0, chai_1.expect)(test[0].getValue("E4")).to.equal("=SUM(B1:C3)");
        });
        it("6", () => {
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
            test[0].deleteRow(1);
            (0, chai_1.expect)(test[0].getValue("A5")).to.equal("=SUM(A1:A3)");
        });
    });
});
