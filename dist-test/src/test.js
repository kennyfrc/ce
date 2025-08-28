"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
require("./jspreadsheet.css");
require("jsuites/dist/jsuites.css");
window.jss = index_1.default;
const root = document.getElementById("root");
if (!root)
    throw new Error("Root element not found");
window.instance = (0, index_1.default)(root, {
    tabs: true,
    toolbar: true,
    worksheets: [
        {
            minDimensions: [6, 6],
        },
    ],
});
