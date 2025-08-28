"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const versionInfo = {
    version: "5.0.0",
    host: "https://bossanova.uk/jspreadsheet",
    license: "MIT",
    print: function () {
        return [["Jspreadsheet CE", this.version, this.host, this.license]];
    },
};
exports.default = versionInfo;
