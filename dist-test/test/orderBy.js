"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const index_1 = __importDefault(require("../src/index"));
describe("Sorting tests", () => {
    it("Default sorting", () => {
        var _a, _b, _c, _d;
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: [
                        ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E1*F1"],
                        ["Peugeot", 2010, 5000, "2005-01-01", "23.00", "5", "=E2*F2"],
                        ["Honda Fit", 2009, 3000, "2004-01-01", "214.00", "3", "=E3*F3"],
                        ["Honda CRV", 2010, 6000, "2003-01-01", "56.11", "2", "=E4*F4"],
                    ],
                },
            ],
        });
        (_b = (_a = instance[0]).orderBy) === null || _b === void 0 ? void 0 : _b.call(_a, 5);
        (0, chai_1.expect)(instance[0].options.data).to.eql([
            ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E1*F1"],
            ["Honda CRV", 2010, 6000, "2003-01-01", "56.11", "2", "=E2*F2"],
            ["Honda Fit", 2009, 3000, "2004-01-01", "214.00", "3", "=E3*F3"],
            ["Peugeot", 2010, 5000, "2005-01-01", "23.00", "5", "=E4*F4"],
        ]);
        (_d = (_c = instance[0]).orderBy) === null || _d === void 0 ? void 0 : _d.call(_c, 5);
        (0, chai_1.expect)(instance[0].options.data).to.eql([
            ["Peugeot", 2010, 5000, "2005-01-01", "23.00", "5", "=E1*F1"],
            ["Honda Fit", 2009, 3000, "2004-01-01", "214.00", "3", "=E2*F2"],
            ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E3*F3"],
            ["Honda CRV", 2010, 6000, "2003-01-01", "56.11", "2", "=E4*F4"],
        ]);
    });
    it("Custom sorting", () => {
        var _a, _b;
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: [
                        ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E1*F1"],
                        ["Peugeot", 1800, 5000, "2005-01-01", "23.00", "5", "=E2*F2"],
                        ["test", 2009, 3000, "2004-01-01", "214.00", "3", "=E3*F3"],
                        ["Honda CRV", 1900, 6000, "2003-01-01", "56.11", "2", "=E4*F4"],
                    ],
                    sorting: function (direction) {
                        return function (a, b) {
                            let valueA = a[1];
                            let valueB = b[1];
                            if (valueA === "test") {
                                return direction ? 1 : -1;
                            }
                            if (valueB === "test") {
                                return direction ? -1 : 1;
                            }
                            // Handle null values
                            if (valueA === null)
                                valueA = "";
                            if (valueB === null)
                                valueB = "";
                            // Consider blank rows in the sorting
                            if (!direction) {
                                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
                            }
                            else {
                                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
                            }
                        };
                    },
                },
            ],
        });
        (_b = (_a = instance[0]).orderBy) === null || _b === void 0 ? void 0 : _b.call(_a, 0, "desc");
        (0, chai_1.expect)(instance[0].options.data).to.eql([
            ["test", 2009, 3000, "2004-01-01", "214.00", "3", "=E1*F1"],
            ["Peugeot", 1800, 5000, "2005-01-01", "23.00", "5", "=E2*F2"],
            ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E3*F3"],
            ["Honda CRV", 1900, 6000, "2003-01-01", "56.11", "2", "=E4*F4"],
        ]);
    });
    it("orderBy history", () => {
        var _a, _b, _c, _d, _e, _f;
        const instance = (0, index_1.default)(root, {
            worksheets: [
                {
                    data: [
                        ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E1*F1"],
                        ["Peugeot", 2010, 5000, "2005-01-01", "23.00", "5", "=E2*F2"],
                        ["Honda Fit", 2009, 3000, "2004-01-01", "214.00", "3", "=E3*F3"],
                        ["Honda CRV", 2010, 6000, "2003-01-01", "56.11", "2", "=E4*F4"],
                    ],
                },
            ],
        });
        (_b = (_a = instance[0]).orderBy) === null || _b === void 0 ? void 0 : _b.call(_a, 5);
        (0, chai_1.expect)(instance[0].options.data).to.eql([
            ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E1*F1"],
            ["Honda CRV", 2010, 6000, "2003-01-01", "56.11", "2", "=E2*F2"],
            ["Honda Fit", 2009, 3000, "2004-01-01", "214.00", "3", "=E3*F3"],
            ["Peugeot", 2010, 5000, "2005-01-01", "23.00", "5", "=E4*F4"],
        ]);
        (_d = (_c = instance[0]).undo) === null || _d === void 0 ? void 0 : _d.call(_c);
        (0, chai_1.expect)(instance[0].options.data).to.eql([
            ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E1*F1"],
            ["Peugeot", 2010, 5000, "2005-01-01", "23.00", "5", "=E2*F2"],
            ["Honda Fit", 2009, 3000, "2004-01-01", "214.00", "3", "=E3*F3"],
            ["Honda CRV", 2010, 6000, "2003-01-01", "56.11", "2", "=E4*F4"],
        ]);
        (_f = (_e = instance[0]).redo) === null || _f === void 0 ? void 0 : _f.call(_e);
        (0, chai_1.expect)(instance[0].options.data).to.eql([
            ["Mazda", 2001, 2000, "2006-01-01", "453.00", "2", "=E1*F1"],
            ["Honda CRV", 2010, 6000, "2003-01-01", "56.11", "2", "=E2*F2"],
            ["Honda Fit", 2009, 3000, "2004-01-01", "214.00", "3", "=E3*F3"],
            ["Peugeot", 2010, 5000, "2005-01-01", "23.00", "5", "=E4*F4"],
        ]);
    });
});
