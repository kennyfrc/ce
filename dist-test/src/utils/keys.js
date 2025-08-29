"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.left = exports.down = exports.downGet = exports.right = exports.rightGet = exports.up = void 0;
const internal_1 = require("./internal");
const lazyLoading_1 = require("./lazyLoading");
const upGet = function (x, y) {
    var _a, _b, _c;
    const obj = this;
    // Convert string parameters to numbers
    x = typeof x === "string" ? parseInt(x) : x;
    y = typeof y === "string" ? parseInt(y) : y;
    for (let j = y - 1; j >= 0; j--) {
        if (obj.records[j] &&
            obj.records[j][x] &&
            obj.records[j][x].element &&
            obj.records[j][x].element.style.display !== "none" &&
            ((_a = obj.rows[j]) === null || _a === void 0 ? void 0 : _a.element) &&
            obj.rows[j].element.style.display !== "none") {
            if (obj.records[j][x].element.getAttribute("data-merged")) {
                if (obj.records[j][x].element === ((_c = (_b = obj.records[y]) === null || _b === void 0 ? void 0 : _b[x]) === null || _c === void 0 ? void 0 : _c.element)) {
                    continue;
                }
            }
            y = j;
            break;
        }
    }
    return y;
};
const upVisible = function (group, direction) {
    var _a, _b;
    const obj = this;
    let x, y;
    if (!obj.selectedCell) {
        return; // No selected cell, nothing to do
    }
    if (group === 0) {
        x = obj.selectedCell[0];
        y = obj.selectedCell[1];
    }
    else {
        x = obj.selectedCell[2];
        y = obj.selectedCell[3];
    }
    if (direction === 0) {
        for (let j = 0; j < y; j++) {
            if (((_a = obj.records[j]) === null || _a === void 0 ? void 0 : _a[x]) &&
                obj.records[j][x].element &&
                obj.records[j][x].element.style.display !== "none" &&
                ((_b = obj.rows[j]) === null || _b === void 0 ? void 0 : _b.element) &&
                obj.rows[j].element.style.display !== "none") {
                y = j;
                break;
            }
        }
    }
    else {
        y = upGet.call(obj, x, y);
    }
    if (group === 0) {
        obj.selectedCell[0] = x;
        obj.selectedCell[1] = y;
    }
    else {
        obj.selectedCell[2] = x;
        obj.selectedCell[3] = y;
    }
};
const up = function (shiftKey, ctrlKey) {
    var _a, _b, _c, _d, _e, _f;
    const obj = this;
    if (!obj.selectedCell) {
        return;
    }
    if (shiftKey) {
        if (obj.selectedCell[3] > 0) {
            upVisible.call(obj, 1, ctrlKey ? 0 : 1);
        }
    }
    else {
        if (obj.selectedCell[1] > 0) {
            upVisible.call(obj, 0, ctrlKey ? 0 : 1);
        }
        obj.selectedCell[2] = obj.selectedCell[0];
        obj.selectedCell[3] = obj.selectedCell[1];
    }
    // Update selection
    (_a = obj.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
    // Change page
    if (obj.options.lazyLoading === true) {
        if (obj.selectedCell[1] === 0 || obj.selectedCell[3] === 0) {
            lazyLoading_1.loadPage.call(obj, 0);
            (_b = obj.updateSelectionFromCoords) === null || _b === void 0 ? void 0 : _b.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
        }
        else {
            if (lazyLoading_1.loadValidation.call(obj)) {
                (_c = obj.updateSelectionFromCoords) === null || _c === void 0 ? void 0 : _c.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
            }
            else {
                if (obj.tbody.firstChild &&
                    obj.tbody.firstChild instanceof HTMLElement &&
                    obj.tbody.firstChild.nodeType !== undefined) {
                    const dataY = parseInt(obj.tbody.firstChild.getAttribute("data-y") || "0");
                    if (obj.selectedCell[1] - dataY < 30) {
                        lazyLoading_1.loadUp.call(obj);
                        (_d = obj.updateSelectionFromCoords) === null || _d === void 0 ? void 0 : _d.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
                    }
                }
            }
        }
    }
    else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
        const pageNumber = (_e = obj.whichPage) === null || _e === void 0 ? void 0 : _e.call(obj, obj.selectedCell[3]);
        if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
            (_f = obj.page) === null || _f === void 0 ? void 0 : _f.call(obj, pageNumber);
        }
    }
    internal_1.updateScroll.call(obj, 1);
};
exports.up = up;
const rightGet = function (x, y) {
    var _a, _b, _c, _d, _e;
    const obj = this;
    // Convert string parameters to numbers
    x = typeof x === "string" ? parseInt(x) : x;
    y = typeof y === "string" ? parseInt(y) : y;
    for (let i = x + 1; i < obj.headers.length; i++) {
        if (((_c = (_b = (_a = obj.records[y]) === null || _a === void 0 ? void 0 : _a[i]) === null || _b === void 0 ? void 0 : _b.element) === null || _c === void 0 ? void 0 : _c.style.display) !== "none") {
            if (obj.records[y][i].element.getAttribute("data-merged")) {
                if (obj.records[y][i].element === ((_e = (_d = obj.records[y]) === null || _d === void 0 ? void 0 : _d[x]) === null || _e === void 0 ? void 0 : _e.element)) {
                    continue;
                }
            }
            x = i;
            break;
        }
    }
    return x;
};
exports.rightGet = rightGet;
const rightVisible = function (group, direction) {
    var _a, _b, _c;
    const obj = this;
    let x, y;
    if (!obj.selectedCell) {
        return;
    }
    if (group === 0) {
        x = obj.selectedCell[0];
        y = obj.selectedCell[1];
    }
    else {
        x = obj.selectedCell[2];
        y = obj.selectedCell[3];
    }
    if (direction === 0) {
        for (let i = obj.headers.length - 1; i > x; i--) {
            if (((_c = (_b = (_a = obj.records[y]) === null || _a === void 0 ? void 0 : _a[i]) === null || _b === void 0 ? void 0 : _b.element) === null || _c === void 0 ? void 0 : _c.style.display) !== "none") {
                x = i;
                break;
            }
        }
    }
    else {
        x = exports.rightGet.call(obj, x, y);
    }
    if (group === 0) {
        obj.selectedCell[0] = x;
        obj.selectedCell[1] = y;
    }
    else {
        obj.selectedCell[2] = x;
        obj.selectedCell[3] = y;
    }
};
const right = function (shiftKey, ctrlKey) {
    var _a;
    const obj = this;
    if (!obj.selectedCell) {
        return;
    }
    if (shiftKey) {
        if (obj.selectedCell[2] < obj.headers.length - 1) {
            rightVisible.call(obj, 1, ctrlKey ? 0 : 1);
        }
    }
    else {
        if (obj.selectedCell[0] < obj.headers.length - 1) {
            rightVisible.call(obj, 0, ctrlKey ? 0 : 1);
        }
        obj.selectedCell[2] = obj.selectedCell[0];
        obj.selectedCell[3] = obj.selectedCell[1];
    }
    (_a = obj.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
    internal_1.updateScroll.call(obj, 1);
};
exports.right = right;
const downGet = function (x, y) {
    var _a, _b, _c;
    const obj = this;
    // Convert string parameters to numbers
    x = typeof x === "string" ? parseInt(x) : x;
    y = typeof y === "string" ? parseInt(y) : y;
    for (let j = y + 1; j < obj.rows.length; j++) {
        if (obj.records[j] &&
            obj.records[j][x] &&
            obj.records[j][x].element &&
            obj.records[j][x].element.style.display !== "none" &&
            ((_a = obj.rows[j]) === null || _a === void 0 ? void 0 : _a.element) &&
            obj.rows[j].element.style.display !== "none") {
            if (obj.records[j][x].element.getAttribute("data-merged")) {
                if (obj.records[j][x].element === ((_c = (_b = obj.records[y]) === null || _b === void 0 ? void 0 : _b[x]) === null || _c === void 0 ? void 0 : _c.element)) {
                    continue;
                }
            }
            y = j;
            break;
        }
    }
    return y;
};
exports.downGet = downGet;
const downVisible = function (group, direction) {
    var _a, _b;
    const obj = this;
    let x, y;
    if (!obj.selectedCell) {
        return;
    }
    if (group === 0) {
        x = obj.selectedCell[0];
        y = obj.selectedCell[1];
    }
    else {
        x = obj.selectedCell[2];
        y = obj.selectedCell[3];
    }
    if (direction === 0) {
        for (let j = obj.rows.length - 1; j > y; j--) {
            if (((_a = obj.records[j]) === null || _a === void 0 ? void 0 : _a[x]) &&
                obj.records[j][x].element &&
                obj.records[j][x].element.style.display !== "none" &&
                ((_b = obj.rows[j]) === null || _b === void 0 ? void 0 : _b.element) &&
                obj.rows[j].element.style.display !== "none") {
                y = j;
                break;
            }
        }
    }
    else {
        y = exports.downGet.call(obj, x, y);
    }
    if (group === 0) {
        obj.selectedCell[0] = x;
        obj.selectedCell[1] = y;
    }
    else {
        obj.selectedCell[2] = x;
        obj.selectedCell[3] = y;
    }
};
const down = function (shiftKey, ctrlKey) {
    var _a, _b, _c, _d, _e, _f;
    const obj = this;
    if (!obj.selectedCell) {
        return;
    }
    if (shiftKey) {
        if (obj.selectedCell[3] < obj.records.length - 1) {
            downVisible.call(obj, 1, ctrlKey ? 0 : 1);
        }
    }
    else {
        if (obj.selectedCell[1] < obj.records.length - 1) {
            downVisible.call(obj, 0, ctrlKey ? 0 : 1);
        }
        obj.selectedCell[2] = obj.selectedCell[0];
        obj.selectedCell[3] = obj.selectedCell[1];
    }
    (_a = obj.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
    // Change page
    if (obj.options.lazyLoading === true) {
        if (obj.selectedCell[1] === obj.records.length - 1 ||
            obj.selectedCell[3] === obj.records.length - 1) {
            lazyLoading_1.loadPage.call(obj, -1);
            (_b = obj.updateSelectionFromCoords) === null || _b === void 0 ? void 0 : _b.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
        }
        else {
            if (lazyLoading_1.loadValidation.call(obj)) {
                (_c = obj.updateSelectionFromCoords) === null || _c === void 0 ? void 0 : _c.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
            }
            else {
                if (obj.tbody.lastChild && obj.tbody.lastChild instanceof HTMLElement) {
                    const dataY = parseInt(obj.tbody.lastChild.getAttribute("data-y") || "0");
                    if (dataY - obj.selectedCell[3] < 30) {
                        lazyLoading_1.loadDown.call(obj);
                        (_d = obj.updateSelectionFromCoords) === null || _d === void 0 ? void 0 : _d.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
                    }
                }
            }
        }
    }
    else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
        const pageNumber = (_e = obj.whichPage) === null || _e === void 0 ? void 0 : _e.call(obj, obj.selectedCell[3]);
        if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
            (_f = obj.page) === null || _f === void 0 ? void 0 : _f.call(obj, pageNumber);
        }
    }
    internal_1.updateScroll.call(obj, 1);
};
exports.down = down;
const leftGet = function (x, y) {
    var _a, _b, _c, _d, _e;
    const obj = this;
    // Convert string parameters to numbers
    x = typeof x === "string" ? parseInt(x) : x;
    y = typeof y === "string" ? parseInt(y) : y;
    for (let i = x - 1; i >= 0; i--) {
        if (((_c = (_b = (_a = obj.records[y]) === null || _a === void 0 ? void 0 : _a[i]) === null || _b === void 0 ? void 0 : _b.element) === null || _c === void 0 ? void 0 : _c.style.display) !== "none") {
            if (obj.records[y][i].element.getAttribute("data-merged")) {
                if (obj.records[y][i].element === ((_e = (_d = obj.records[y]) === null || _d === void 0 ? void 0 : _d[x]) === null || _e === void 0 ? void 0 : _e.element)) {
                    continue;
                }
            }
            x = i;
            break;
        }
    }
    return x;
};
const leftVisible = function (group, direction) {
    var _a, _b, _c;
    const obj = this;
    let x, y;
    if (!obj.selectedCell) {
        return;
    }
    if (group === 0) {
        x = obj.selectedCell[0];
        y = obj.selectedCell[1];
    }
    else {
        x = obj.selectedCell[2];
        y = obj.selectedCell[3];
    }
    if (direction === 0) {
        for (let i = 0; i < x; i++) {
            if (((_c = (_b = (_a = obj.records[y]) === null || _a === void 0 ? void 0 : _a[i]) === null || _b === void 0 ? void 0 : _b.element) === null || _c === void 0 ? void 0 : _c.style.display) !== "none") {
                x = i;
                break;
            }
        }
    }
    else {
        x = leftGet.call(obj, x, y);
    }
    if (group === 0) {
        obj.selectedCell[0] = x;
        obj.selectedCell[1] = y;
    }
    else {
        obj.selectedCell[2] = x;
        obj.selectedCell[3] = y;
    }
};
const left = function (shiftKey, ctrlKey) {
    var _a;
    const obj = this;
    if (!obj.selectedCell) {
        return;
    }
    if (shiftKey) {
        if (obj.selectedCell[2] > 0) {
            leftVisible.call(obj, 1, ctrlKey ? 0 : 1);
        }
    }
    else {
        if (obj.selectedCell[0] > 0) {
            leftVisible.call(obj, 0, ctrlKey ? 0 : 1);
        }
        obj.selectedCell[2] = obj.selectedCell[0];
        obj.selectedCell[3] = obj.selectedCell[1];
    }
    (_a = obj.updateSelectionFromCoords) === null || _a === void 0 ? void 0 : _a.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
    internal_1.updateScroll.call(obj, -1);
};
exports.left = left;
const first = function (shiftKey, ctrlKey) {
    var _a, _b, _c;
    const obj = this;
    if (!obj.selectedCell) {
        return;
    }
    if (shiftKey) {
        if (ctrlKey) {
            obj.selectedCell[3] = 0;
        }
        else {
            leftVisible.call(obj, 1, 0);
        }
    }
    else {
        if (ctrlKey) {
            obj.selectedCell[1] = 0;
        }
        else {
            leftVisible.call(obj, 0, 0);
        }
        obj.selectedCell[2] = obj.selectedCell[0];
        obj.selectedCell[3] = obj.selectedCell[1];
    }
    // Change page
    if (obj.options.lazyLoading === true &&
        (obj.selectedCell[1] === 0 || obj.selectedCell[3] === 0)) {
        lazyLoading_1.loadPage.call(obj, 0);
    }
    else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
        const pageNumber = (_a = obj.whichPage) === null || _a === void 0 ? void 0 : _a.call(obj, obj.selectedCell[3]);
        if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
            (_b = obj.page) === null || _b === void 0 ? void 0 : _b.call(obj, pageNumber);
        }
    }
    (_c = obj.updateSelectionFromCoords) === null || _c === void 0 ? void 0 : _c.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
    internal_1.updateScroll.call(obj, 1);
};
exports.first = first;
const last = function (shiftKey, ctrlKey) {
    var _a, _b, _c;
    const obj = this;
    if (!obj.selectedCell) {
        return;
    }
    if (shiftKey) {
        if (ctrlKey) {
            obj.selectedCell[3] = obj.records.length - 1;
        }
        else {
            rightVisible.call(obj, 1, 0);
        }
    }
    else {
        if (ctrlKey) {
            obj.selectedCell[1] = obj.records.length - 1;
        }
        else {
            rightVisible.call(obj, 0, 0);
        }
        obj.selectedCell[2] = obj.selectedCell[0];
        obj.selectedCell[3] = obj.selectedCell[1];
    }
    // Change page
    if (obj.options.lazyLoading === true &&
        (obj.selectedCell[1] === obj.records.length - 1 ||
            obj.selectedCell[3] === obj.records.length - 1)) {
        lazyLoading_1.loadPage.call(obj, -1);
    }
    else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
        const pageNumber = (_a = obj.whichPage) === null || _a === void 0 ? void 0 : _a.call(obj, obj.selectedCell[3]);
        if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
            (_b = obj.page) === null || _b === void 0 ? void 0 : _b.call(obj, pageNumber);
        }
    }
    (_c = obj.updateSelectionFromCoords) === null || _c === void 0 ? void 0 : _c.call(obj, obj.selectedCell[0], obj.selectedCell[1], obj.selectedCell[2], obj.selectedCell[3]);
    internal_1.updateScroll.call(obj, 1);
};
exports.last = last;
