"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { expect } = require("chai");
const index_1 = __importDefault(require("../src/index"));
global.document.execCommand = function execCommandMock() {
    return true;
};
const fixtureData = () => [
    ["Mazda", 2001, 2000, 1],
    ["Peugeot", 2010, 5000, "=B2+C2"],
    ["Honda Fit", 2009, 3000, "=B3+C3"],
    ["Honda CRV", 2010, 6000, "=B4+C4"],
];
describe("Paste", () => {
    it("no expand", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t0-1\t0-2\t0-3\n1-0\t1-1\t1-2\t1-3\n2-0\t2-1\t2-2\t2-3\n3-0\t3-1\t3-2\t3-3";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 0, 0, 0, 0);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["0-0", "0-1", "0-2", "0-3"],
            ["1-0", "1-1", "1-2", "1-3"],
            ["2-0", "2-1", "2-2", "2-3"],
            ["3-0", "3-1", "3-2", "3-3"],
        ]);
    });
    it("expand", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t0-1\t0-2\t0-3\n1-0\t1-1\t1-2\t1-3\n2-0\t2-1\t2-2\t2-3\n3-0\t3-1\t3-2\t3-3";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 3, 3, 3, 3);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["Mazda", 2001, 2000, 1, "", "", ""],
            ["Peugeot", 2010, 5000, "=B2+C2", "", "", ""],
            ["Honda Fit", 2009, 3000, "=B3+C3", "", "", ""],
            ["Honda CRV", 2010, 6000, "0-0", "0-1", "0-2", "0-3"],
            ["", "", "", "1-0", "1-1", "1-2", "1-3"],
            ["", "", "", "2-0", "2-1", "2-2", "2-3"],
            ["", "", "", "3-0", "3-1", "3-2", "3-3"],
        ]);
    });
    it("repeat horizontal", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t0-1";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 0, 0, 4, 0);
        (_b = sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["0-0", "0-1", "0-0", "0-1"],
            ["Peugeot", 2010, 5000, "=B2+C2"],
            ["Honda Fit", 2009, 3000, "=B3+C3"],
            ["Honda CRV", 2010, 6000, "=B4+C4"],
        ]);
    });
    it("repeat vertical", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\n1-0";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 0, 0, 0, 4);
        (_b = sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["0-0", 2001, 2000, 1],
            ["1-0", 2010, 5000, "=B2+C2"],
            ["0-0", 2009, 3000, "=B3+C3"],
            ["1-0", 2010, 6000, "=B4+C4"],
        ]);
    });
    it("repeat rectangle", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t0-1\n1-0\t1-1";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 0, 1, 3);
        (_b = sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["Mazda", "0-0", "0-1", 1],
            ["Peugeot", "1-0", "1-1", "=B2+C2"],
            ["Honda Fit", "0-0", "0-1", "=B3+C3"],
            ["Honda CRV", "1-0", "1-1", "=B4+C4"],
        ]);
    });
    it("skip hidden column", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    columns: [
                        { type: "text" },
                        { type: "text" },
                        { type: "hidden" }, // paste is skipped.
                        { type: "text" },
                    ],
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t0-1\n1-0\t1-1";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 1, 0, 1, 0);
        (_b = sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["Mazda", "0-0", 2000, "0-1"],
            ["Peugeot", "1-0", 5000, "1-1"],
            ["Honda Fit", 2009, 3000, "=B3+C3"],
            ["Honda CRV", 2010, 6000, "=B4+C4"],
        ]);
    });
    it("skip hidden row", () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t0-1\n1-0\t1-1";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.hideRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 1);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _b === void 0 ? void 0 : _b.call(sheet, 1, 0, 1, 0);
        (_c = sheet.paste) === null || _c === void 0 ? void 0 : _c.call(sheet, (_e = (_d = sheet.selectedCell) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : 0, (_g = (_f = sheet.selectedCell) === null || _f === void 0 ? void 0 : _f[1]) !== null && _g !== void 0 ? _g : 0, pasteText);
        expect((_h = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _h === void 0 ? void 0 : _h.call(sheet)).to.eql([
            ["Mazda", "0-0", "0-1", 1],
            ["Peugeot", 2010, 5000, "=B2+C2"],
            ["Honda Fit", "1-0", "1-1", "=B3+C3"],
            ["Honda CRV", 2010, 6000, "=B4+C4"],
        ]);
    });
    it("see https://github.com/jspreadsheet/ce/pull/1717#issuecomment-2576060698", () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    minDimensions: [4, 4],
                    data: [
                        [1, 2],
                        [3, 4],
                    ],
                },
            ],
        })[0];
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 0, 0, 1, 1);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.copy) === null || _b === void 0 ? void 0 : _b.call(sheet);
        (_c = sheet === null || sheet === void 0 ? void 0 : sheet.hideRow) === null || _c === void 0 ? void 0 : _c.call(sheet, 0);
        (_d = sheet === null || sheet === void 0 ? void 0 : sheet.hideColumn) === null || _d === void 0 ? void 0 : _d.call(sheet, 0);
        (_e = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _e === void 0 ? void 0 : _e.call(sheet, 2, 2, 2, 2);
        (_f = sheet === null || sheet === void 0 ? void 0 : sheet.paste) === null || _f === void 0 ? void 0 : _f.call(sheet, (_h = (_g = sheet.selectedCell) === null || _g === void 0 ? void 0 : _g[0]) !== null && _h !== void 0 ? _h : 0, (_k = (_j = sheet.selectedCell) === null || _j === void 0 ? void 0 : _j[1]) !== null && _k !== void 0 ? _k : 0, sheet === null || sheet === void 0 ? void 0 : sheet.data);
        expect((_l = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _l === void 0 ? void 0 : _l.call(sheet)).to.eql([
            [1, 2, "", ""],
            [3, 4, "", ""],
            ["", "", "1", "2"],
            ["", "", "3", "4"],
        ]);
    });
    it("see https://github.com/jspreadsheet/ce/pull/1717#issuecomment-2580087207", () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    minDimensions: [10, 4],
                    data: [
                        [1, 2, 3],
                        [4, 5, 6],
                    ],
                },
            ],
        })[0];
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 0, 0, 2, 1);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.copy) === null || _b === void 0 ? void 0 : _b.call(sheet);
        (_c = sheet === null || sheet === void 0 ? void 0 : sheet.hideColumn) === null || _c === void 0 ? void 0 : _c.call(sheet, 8);
        (_d = sheet === null || sheet === void 0 ? void 0 : sheet.hideColumn) === null || _d === void 0 ? void 0 : _d.call(sheet, 9);
        (_e = sheet === null || sheet === void 0 ? void 0 : sheet.hideRow) === null || _e === void 0 ? void 0 : _e.call(sheet, 3);
        (_f = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _f === void 0 ? void 0 : _f.call(sheet, 7, 2, 7, 2);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            [1, 2, 3, "", "", "", "", "", "", ""],
            [4, 5, 6, "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", ""],
        ]);
        (_h = sheet.paste) === null || _h === void 0 ? void 0 : _h.call(sheet, 7, 2, sheet.data);
        expect((_j = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _j === void 0 ? void 0 : _j.call(sheet)).to.eql([
            [1, 2, 3, "", "", "", "", "", "", "", "", ""],
            [4, 5, 6, "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "1", "", "", "2", "3"],
            ["", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "4", "", "", "5", "6"],
        ]);
    });
    it("large data paste", () => {
        var _a, _b, _c, _d, _e, _f;
        let count = {};
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
            onevent: (event) => {
                var _a;
                count[event] = ((_a = count[event]) !== null && _a !== void 0 ? _a : 0) + 1;
            },
        })[0];
        const pasteText = new Array(1000)
            .fill(0)
            .map((v, i) => new Array(20)
            .fill(0)
            .map((v2, i2) => `${i}-${i2}`)
            .join("\t"))
            .join("\n");
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 3, 3, 3, 3);
        (_b = sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect(count.onbeforechange).to.eql(20000);
        expect(count.onbeforeinsertcolumn).to.eql(1);
        expect(count.onbeforeinsertrow).to.eql(1);
        expect(count.onchange).to.eql(20000);
        expect(count.oninsertcolumn).to.eql(1);
        expect(count.oninsertrow).to.eql(1);
        expect(count.onselection).to.eql(3);
    }).timeout(10 * 1000);
    it("expand with hidden cells", () => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        let count = {};
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    columns: [
                        { type: "text" },
                        { type: "text" },
                        { type: "hidden" }, // paste is skipped.
                        { type: "text" },
                    ],
                    data: fixtureData(),
                },
            ],
            onevent: (event) => {
                var _a;
                count[event] = ((_a = count[event]) !== null && _a !== void 0 ? _a : 0) + 1;
            },
        })[0];
        const pasteText = "0-0\t0-1\t0-2\t0-3\n1-0\t1-1\t1-2\t1-3\n2-0\t2-1\t2-2\t2-3\n3-0\t3-1\t3-2\t3-3";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.hideRow) === null || _a === void 0 ? void 0 : _a.call(sheet, 2);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _b === void 0 ? void 0 : _b.call(sheet, 1, 1, 1, 1);
        (_c = sheet.paste) === null || _c === void 0 ? void 0 : _c.call(sheet, (_e = (_d = sheet.selectedCell) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : 0, (_g = (_f = sheet.selectedCell) === null || _f === void 0 ? void 0 : _f[1]) !== null && _g !== void 0 ? _g : 0, pasteText);
        expect((_h = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _h === void 0 ? void 0 : _h.call(sheet)).to.eql([
            ["Mazda", 2001, 2000, 1, "", ""],
            ["Peugeot", "0-0", 5000, "0-1", "0-2", "0-3"],
            ["Honda Fit", 2009, 3000, "=B3+C3", "", ""],
            ["Honda CRV", "1-0", 6000, "1-1", "1-2", "1-3"],
            ["", "2-0", "", "2-1", "2-2", "2-3"],
            ["", "3-0", "", "3-1", "3-2", "3-3"],
        ]);
        expect(count.onbeforeinsertcolumn).to.eql(1);
        expect(count.onbeforeinsertrow).to.eql(1);
    }).timeout(10 * 1000);
    it("copy and paste with style", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let count = {};
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.setStyle) === null || _a === void 0 ? void 0 : _a.call(sheet, "A1", "color", "red");
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _b === void 0 ? void 0 : _b.call(sheet, 0, 0, 1, 1);
        (_c = sheet === null || sheet === void 0 ? void 0 : sheet.copy) === null || _c === void 0 ? void 0 : _c.call(sheet);
        (_d = sheet === null || sheet === void 0 ? void 0 : sheet.paste) === null || _d === void 0 ? void 0 : _d.call(sheet, 2, 2, sheet === null || sheet === void 0 ? void 0 : sheet.data);
        expect((_e = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _e === void 0 ? void 0 : _e.call(sheet)).to.eql([
            ["Mazda", 2001, 2000, 1],
            ["Peugeot", 2010, 5000, "=B2+C2"],
            ["Honda Fit", 2009, "Mazda", "2001"],
            ["Honda CRV", 2010, "Peugeot", "2010"],
        ]);
        expect((_f = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _f === void 0 ? void 0 : _f.call(sheet, "A1", "color")).to.eql("red");
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _g === void 0 ? void 0 : _g.call(sheet, "C3", "color")).to.eql("red");
    });
    it("copy and repeat paste with style", () => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        global.document.execCommand = function execCommandMock(commandId, showUI, value) { return true; };
        let count = {};
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.setStyle) === null || _a === void 0 ? void 0 : _a.call(sheet, "A1", "color", "red");
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _b === void 0 ? void 0 : _b.call(sheet, 0, 0, 1, 0);
        (_c = sheet === null || sheet === void 0 ? void 0 : sheet.copy) === null || _c === void 0 ? void 0 : _c.call(sheet);
        (_d = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _d === void 0 ? void 0 : _d.call(sheet, 0, 2, 4, 4);
        (_e = sheet === null || sheet === void 0 ? void 0 : sheet.paste) === null || _e === void 0 ? void 0 : _e.call(sheet, 0, 2, sheet === null || sheet === void 0 ? void 0 : sheet.data);
        expect((_f = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _f === void 0 ? void 0 : _f.call(sheet)).to.eql([
            ["Mazda", 2001, 2000, 1],
            ["Peugeot", 2010, 5000, "=B2+C2"],
            ["Mazda", "2001", "Mazda", "2001"],
            ["Mazda", "2001", "Mazda", "2001"],
        ]);
        //
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _g === void 0 ? void 0 : _g.call(sheet, "A1", "color")).to.eql("red");
        //
        expect((_h = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _h === void 0 ? void 0 : _h.call(sheet, "A3", "color")).to.eql("red");
        expect((_j = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _j === void 0 ? void 0 : _j.call(sheet, "B3", "color")).to.eql("");
        expect((_k = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _k === void 0 ? void 0 : _k.call(sheet, "C3", "color")).to.eql("red");
        expect((_l = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _l === void 0 ? void 0 : _l.call(sheet, "D3", "color")).to.eql("");
        //
        expect((_m = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _m === void 0 ? void 0 : _m.call(sheet, "A4", "color")).to.eql("red");
        expect((_o = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _o === void 0 ? void 0 : _o.call(sheet, "B4", "color")).to.eql("");
        expect((_p = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _p === void 0 ? void 0 : _p.call(sheet, "C4", "color")).to.eql("red");
        expect((_q = sheet === null || sheet === void 0 ? void 0 : sheet.getStyle) === null || _q === void 0 ? void 0 : _q.call(sheet, "D4", "color")).to.eql("");
    });
    it("copy and paste to another sheet", async () => {
        var _a, _b, _c, _d, _e, _f;
        global.document.execCommand = function execCommandMock(commandId, showUI, value) { return true; };
        let isLoaded = false;
        let sheets = (0, index_1.default)(root, {
            tabs: true,
            worksheets: [
                {
                    data: fixtureData(),
                    worksheetName: "Sheet1",
                },
                {
                    data: fixtureData(),
                    worksheetName: "Sheet2",
                },
            ],
            onload: () => {
                isLoaded = true;
            },
        });
        const awaitLoop = (resolve, reject) => {
            setTimeout(() => {
                if (isLoaded) {
                    resolve();
                }
                else {
                    awaitLoop(resolve, reject);
                }
            }, 100);
        };
        // NOTE: jpreadsheet constructor is acutally async. So it waits for load events in await.
        await new Promise(awaitLoop);
        const from = sheets[0];
        (_a = from === null || from === void 0 ? void 0 : from.setStyle) === null || _a === void 0 ? void 0 : _a.call(from, "A1", "color", "red");
        (_b = from === null || from === void 0 ? void 0 : from.updateSelectionFromCoords) === null || _b === void 0 ? void 0 : _b.call(from, 0, 0, 1, 0);
        (_c = from === null || from === void 0 ? void 0 : from.copy) === null || _c === void 0 ? void 0 : _c.call(from);
        const to = sheets[1];
        (_d = to === null || to === void 0 ? void 0 : to.updateSelectionFromCoords) === null || _d === void 0 ? void 0 : _d.call(to, 0, 2, 4, 4);
        (_e = to === null || to === void 0 ? void 0 : to.paste) === null || _e === void 0 ? void 0 : _e.call(to, 0, 2, from === null || from === void 0 ? void 0 : from.data);
        expect((_f = to === null || to === void 0 ? void 0 : to.getData) === null || _f === void 0 ? void 0 : _f.call(to)).to.eql([
            ["Mazda", 2001, 2000, 1],
            ["Peugeot", 2010, 5000, "=B2+C2"],
            ["Mazda", "2001", "Mazda", "2001"],
            ["Mazda", "2001", "Mazda", "2001"],
        ]);
    });
    it("fix - u0000 is pasted, when the last cell ends in a tab", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t0-1\t0-2\t0-3\n1-0\t1-1\t1-2\t1-3\n2-0\t2-1\t2-2\t2-3\n3-0\t3-1\t3-2\t";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 0, 0, 0, 0);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["0-0", "0-1", "0-2", "0-3"],
            ["1-0", "1-1", "1-2", "1-3"],
            ["2-0", "2-1", "2-2", "2-3"],
            ["3-0", "3-1", "3-2", ""],
        ]);
    });
    it("paste lacked columns data", () => {
        var _a, _b, _c, _d, _e, _f, _g;
        let sheet = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: fixtureData(),
                },
            ],
        })[0];
        const pasteText = "0-0\t\n" + "1-0\t1-1\t1-2\t1-3\n" + "2-0\n" + "3-0\t3-1\t3-2\t";
        (_a = sheet === null || sheet === void 0 ? void 0 : sheet.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(sheet, 0, 0, 0, 0);
        (_b = sheet === null || sheet === void 0 ? void 0 : sheet.paste) === null || _b === void 0 ? void 0 : _b.call(sheet, (_d = (_c = sheet.selectedCell) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : 0, (_f = (_e = sheet.selectedCell) === null || _e === void 0 ? void 0 : _e[1]) !== null && _f !== void 0 ? _f : 0, pasteText);
        expect((_g = sheet === null || sheet === void 0 ? void 0 : sheet.getData) === null || _g === void 0 ? void 0 : _g.call(sheet)).to.eql([
            ["0-0", "", "", ""],
            ["1-0", "1-1", "1-2", "1-3"],
            ["2-0", "", "", ""],
            ["3-0", "3-1", "3-2", ""],
        ]);
    });
});
