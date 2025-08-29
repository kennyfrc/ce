import { updateScroll } from "./internal";
import { loadDown, loadPage, loadUp, loadValidation } from "./lazyLoading";
import { WorksheetInstance } from "../types/core";

const upGet = function (
  this: WorksheetInstance,
  x: number | string,
  y: number | string
): number {
  const obj = this;

  // Convert string parameters to numbers
  x = typeof x === "string" ? parseInt(x) : x;
  y = typeof y === "string" ? parseInt(y) : y;
  for (let j = y - 1; j >= 0; j--) {
    if (
      obj.records[j] &&
      obj.records[j][x] &&
      obj.records[j][x].element &&
      obj.records[j][x].element.style.display !== "none" &&
      obj.rows[j]?.element &&
      obj.rows[j].element.style.display !== "none"
    ) {
      if (obj.records[j][x].element.getAttribute("data-merged")) {
        if (obj.records[j][x].element === obj.records[y]?.[x]?.element) {
          continue;
        }
      }
      y = j;
      break;
    }
  }

  return y;
};

const upVisible = function (
  this: WorksheetInstance,
  group: number,
  direction: number
): void {
  const obj = this;

  let x, y;

  if (!obj.selectedCell) {
    return; // No selected cell, nothing to do
  }

  if (group === 0) {
    x = obj.selectedCell[0];
    y = obj.selectedCell[1];
  } else {
    x = obj.selectedCell[2];
    y = obj.selectedCell[3];
  }

  if (direction === 0) {
    for (let j = 0; j < y; j++) {
      if (
        obj.records[j]?.[x] &&
        obj.records[j][x].element &&
        obj.records[j][x].element.style.display !== "none" &&
        obj.rows[j]?.element &&
        obj.rows[j].element.style.display !== "none"
      ) {
        y = j;
        break;
      }
    }
  } else {
    y = upGet.call(obj, x, y);
  }

  if (group === 0) {
    obj.selectedCell[0] = x;
    obj.selectedCell[1] = y;
  } else {
    obj.selectedCell[2] = x;
    obj.selectedCell[3] = y;
  }
};

export const up = function (
  this: WorksheetInstance,
  shiftKey: boolean,
  ctrlKey: boolean
): void {
  const obj = this;

  if (!obj.selectedCell) {
    return;
  }

  if (shiftKey) {
    if (obj.selectedCell[3] > 0) {
      upVisible.call(obj, 1, ctrlKey ? 0 : 1);
    }
  } else {
    if (obj.selectedCell[1] > 0) {
      upVisible.call(obj, 0, ctrlKey ? 0 : 1);
    }
    obj.selectedCell[2] = obj.selectedCell[0];
    obj.selectedCell[3] = obj.selectedCell[1];
  }

  // Update selection
  obj.updateSelectionFromCoords?.(
    obj.selectedCell[0],
    obj.selectedCell[1],
    obj.selectedCell[2],
    obj.selectedCell[3]
  );

  // Change page
  if (obj.options.lazyLoading === true) {
    if (obj.selectedCell[1] === 0 || obj.selectedCell[3] === 0) {
      loadPage.call(obj, 0);
      obj.updateSelectionFromCoords?.(
        obj.selectedCell[0],
        obj.selectedCell[1],
        obj.selectedCell[2],
        obj.selectedCell[3]
      );
    } else {
      if (loadValidation.call(obj)) {
        obj.updateSelectionFromCoords?.(
          obj.selectedCell[0],
          obj.selectedCell[1],
          obj.selectedCell[2],
          obj.selectedCell[3]
        );
      } else {
        if (
          obj.tbody.firstChild &&
          obj.tbody.firstChild instanceof HTMLElement &&
          obj.tbody.firstChild.nodeType !== undefined
        ) {
          const dataY = parseInt(
            obj.tbody.firstChild.getAttribute("data-y") || "0"
          );
          if (obj.selectedCell[1] - dataY < 30) {
            loadUp.call(obj);
            obj.updateSelectionFromCoords?.(
              obj.selectedCell[0],
              obj.selectedCell[1],
              obj.selectedCell[2],
              obj.selectedCell[3]
            );
          }
        }
      }
    }
  } else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
    const pageNumber = obj.whichPage?.(obj.selectedCell[3]);
    if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
      obj.page?.(pageNumber);
    }
  }

  updateScroll.call(obj, 1);
};

export const rightGet = function (
  this: WorksheetInstance,
  x: number | string,
  y: number | string
): number {
  const obj = this;

  // Convert string parameters to numbers
  x = typeof x === "string" ? parseInt(x) : x;
  y = typeof y === "string" ? parseInt(y) : y;

  for (let i = x + 1; i < obj.headers.length; i++) {
    if (obj.records[y]?.[i]?.element?.style.display !== "none") {
      if (obj.records[y][i].element.getAttribute("data-merged")) {
        if (obj.records[y][i].element === obj.records[y]?.[x]?.element) {
          continue;
        }
      }
      x = i;
      break;
    }
  }

  return x;
};

const rightVisible = function (
  this: WorksheetInstance,
  group: number,
  direction: number
): void {
  const obj = this;

  let x, y;

  if (!obj.selectedCell) {
    return;
  }

  if (group === 0) {
    x = obj.selectedCell[0];
    y = obj.selectedCell[1];
  } else {
    x = obj.selectedCell[2];
    y = obj.selectedCell[3];
  }

  if (direction === 0) {
    for (let i = obj.headers.length - 1; i > x; i--) {
      if (obj.records[y]?.[i]?.element?.style.display !== "none") {
        x = i;
        break;
      }
    }
  } else {
    x = rightGet.call(obj, x, y);
  }

  if (group === 0) {
    obj.selectedCell[0] = x;
    obj.selectedCell[1] = y;
  } else {
    obj.selectedCell[2] = x;
    obj.selectedCell[3] = y;
  }
};

export const right = function (
  this: WorksheetInstance,
  shiftKey: boolean,
  ctrlKey: boolean
): void {
  const obj = this;

  if (!obj.selectedCell) {
    return;
  }

  if (shiftKey) {
    if (obj.selectedCell[2] < obj.headers.length - 1) {
      rightVisible.call(obj, 1, ctrlKey ? 0 : 1);
    }
  } else {
    if (obj.selectedCell[0] < obj.headers.length - 1) {
      rightVisible.call(obj, 0, ctrlKey ? 0 : 1);
    }
    obj.selectedCell[2] = obj.selectedCell[0];
    obj.selectedCell[3] = obj.selectedCell[1];
  }

  obj.updateSelectionFromCoords?.(
    obj.selectedCell[0],
    obj.selectedCell[1],
    obj.selectedCell[2],
    obj.selectedCell[3]
  );
  updateScroll.call(obj, 1);
};

export const downGet = function (
  this: WorksheetInstance,
  x: number | string,
  y: number | string
): number {
  const obj = this;

  // Convert string parameters to numbers
  x = typeof x === "string" ? parseInt(x) : x;
  y = typeof y === "string" ? parseInt(y) : y;
  for (let j = y + 1; j < obj.rows.length; j++) {
    if (
      obj.records[j] &&
      obj.records[j][x] &&
      obj.records[j][x].element &&
      obj.records[j][x].element.style.display !== "none" &&
      obj.rows[j]?.element &&
      obj.rows[j].element.style.display !== "none"
    ) {
      if (obj.records[j][x].element.getAttribute("data-merged")) {
        if (obj.records[j][x].element === obj.records[y]?.[x]?.element) {
          continue;
        }
      }
      y = j;
      break;
    }
  }

  return y;
};

const downVisible = function (
  this: WorksheetInstance,
  group: number,
  direction: number
): void {
  const obj = this;

  let x, y;

  if (!obj.selectedCell) {
    return;
  }

  if (group === 0) {
    x = obj.selectedCell[0];
    y = obj.selectedCell[1];
  } else {
    x = obj.selectedCell[2];
    y = obj.selectedCell[3];
  }

  if (direction === 0) {
    for (let j = obj.rows.length - 1; j > y; j--) {
      if (
        obj.records[j]?.[x] &&
        obj.records[j][x].element &&
        obj.records[j][x].element.style.display !== "none" &&
        obj.rows[j]?.element &&
        obj.rows[j].element.style.display !== "none"
      ) {
        y = j;
        break;
      }
    }
  } else {
    y = downGet.call(obj, x, y);
  }

  if (group === 0) {
    obj.selectedCell[0] = x;
    obj.selectedCell[1] = y;
  } else {
    obj.selectedCell[2] = x;
    obj.selectedCell[3] = y;
  }
};

export const down = function (
  this: WorksheetInstance,
  shiftKey: boolean,
  ctrlKey: boolean
): void {
  const obj = this;

  if (!obj.selectedCell) {
    return;
  }

  if (shiftKey) {
    if (obj.selectedCell[3] < obj.records.length - 1) {
      downVisible.call(obj, 1, ctrlKey ? 0 : 1);
    }
  } else {
    if (obj.selectedCell[1] < obj.records.length - 1) {
      downVisible.call(obj, 0, ctrlKey ? 0 : 1);
    }
    obj.selectedCell[2] = obj.selectedCell[0];
    obj.selectedCell[3] = obj.selectedCell[1];
  }

  obj.updateSelectionFromCoords?.(
    obj.selectedCell[0],
    obj.selectedCell[1],
    obj.selectedCell[2],
    obj.selectedCell[3]
  );

  // Change page
  if (obj.options.lazyLoading === true) {
    if (
      obj.selectedCell[1] === obj.records.length - 1 ||
      obj.selectedCell[3] === obj.records.length - 1
    ) {
      loadPage.call(obj, -1);
      obj.updateSelectionFromCoords?.(
        obj.selectedCell[0],
        obj.selectedCell[1],
        obj.selectedCell[2],
        obj.selectedCell[3]
      );
    } else {
      if (loadValidation.call(obj)) {
        obj.updateSelectionFromCoords?.(
          obj.selectedCell[0],
          obj.selectedCell[1],
          obj.selectedCell[2],
          obj.selectedCell[3]
        );
      } else {
        if (obj.tbody.lastChild && obj.tbody.lastChild instanceof HTMLElement) {
          const dataY = parseInt(
            obj.tbody.lastChild.getAttribute("data-y") || "0"
          );
          if (dataY - obj.selectedCell[3] < 30) {
            loadDown.call(obj);
            obj.updateSelectionFromCoords?.(
              obj.selectedCell[0],
              obj.selectedCell[1],
              obj.selectedCell[2],
              obj.selectedCell[3]
            );
          }
        }
      }
    }
  } else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
    const pageNumber = obj.whichPage?.(obj.selectedCell[3]);
    if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
      obj.page?.(pageNumber);
    }
  }

  updateScroll.call(obj, 1);
};

const leftGet = function (
  this: WorksheetInstance,
  x: number | string,
  y: number | string
): number {
  const obj = this;

  // Convert string parameters to numbers
  x = typeof x === "string" ? parseInt(x) : x;
  y = typeof y === "string" ? parseInt(y) : y;
  for (let i = x - 1; i >= 0; i--) {
    if (obj.records[y]?.[i]?.element?.style.display !== "none") {
      if (obj.records[y][i].element.getAttribute("data-merged")) {
        if (obj.records[y][i].element === obj.records[y]?.[x]?.element) {
          continue;
        }
      }
      x = i;
      break;
    }
  }

  return x;
};

const leftVisible = function (
  this: WorksheetInstance,
  group: number,
  direction: number
): void {
  const obj = this;

  let x, y;

  if (!obj.selectedCell) {
    return;
  }

  if (group === 0) {
    x = obj.selectedCell[0];
    y = obj.selectedCell[1];
  } else {
    x = obj.selectedCell[2];
    y = obj.selectedCell[3];
  }

  if (direction === 0) {
    for (let i = 0; i < x; i++) {
      if (obj.records[y]?.[i]?.element?.style.display !== "none") {
        x = i;
        break;
      }
    }
  } else {
    x = leftGet.call(obj, x, y);
  }

  if (group === 0) {
    obj.selectedCell[0] = x;
    obj.selectedCell[1] = y;
  } else {
    obj.selectedCell[2] = x;
    obj.selectedCell[3] = y;
  }
};

export const left = function (
  this: WorksheetInstance,
  shiftKey: boolean,
  ctrlKey: boolean
): void {
  const obj = this;

  if (!obj.selectedCell) {
    return;
  }

  if (shiftKey) {
    if (obj.selectedCell[2] > 0) {
      leftVisible.call(obj, 1, ctrlKey ? 0 : 1);
    }
  } else {
    if (obj.selectedCell[0] > 0) {
      leftVisible.call(obj, 0, ctrlKey ? 0 : 1);
    }
    obj.selectedCell[2] = obj.selectedCell[0];
    obj.selectedCell[3] = obj.selectedCell[1];
  }

  obj.updateSelectionFromCoords?.(
    obj.selectedCell[0],
    obj.selectedCell[1],
    obj.selectedCell[2],
    obj.selectedCell[3]
  );
  updateScroll.call(obj, -1);
};

export const first = function (
  this: WorksheetInstance,
  shiftKey: boolean,
  ctrlKey: boolean
): void {
  const obj = this;

  if (!obj.selectedCell) {
    return;
  }

  if (shiftKey) {
    if (ctrlKey) {
      obj.selectedCell[3] = 0;
    } else {
      leftVisible.call(obj, 1, 0);
    }
  } else {
    if (ctrlKey) {
      obj.selectedCell[1] = 0;
    } else {
      leftVisible.call(obj, 0, 0);
    }
    obj.selectedCell[2] = obj.selectedCell[0];
    obj.selectedCell[3] = obj.selectedCell[1];
  }

  // Change page
  if (
    obj.options.lazyLoading === true &&
    (obj.selectedCell[1] === 0 || obj.selectedCell[3] === 0)
  ) {
    loadPage.call(obj, 0);
  } else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
    const pageNumber = obj.whichPage?.(obj.selectedCell[3]);
    if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
      obj.page?.(pageNumber);
    }
  }

  obj.updateSelectionFromCoords?.(
    obj.selectedCell[0],
    obj.selectedCell[1],
    obj.selectedCell[2],
    obj.selectedCell[3]
  );
  updateScroll.call(obj, 1);
};

export const last = function (
  this: WorksheetInstance,
  shiftKey: boolean,
  ctrlKey: boolean
): void {
  const obj = this;

  if (!obj.selectedCell) {
    return;
  }

  if (shiftKey) {
    if (ctrlKey) {
      obj.selectedCell[3] = obj.records.length - 1;
    } else {
      rightVisible.call(obj, 1, 0);
    }
  } else {
    if (ctrlKey) {
      obj.selectedCell[1] = obj.records.length - 1;
    } else {
      rightVisible.call(obj, 0, 0);
    }
    obj.selectedCell[2] = obj.selectedCell[0];
    obj.selectedCell[3] = obj.selectedCell[1];
  }

  // Change page
  if (
    obj.options.lazyLoading === true &&
    (obj.selectedCell[1] === obj.records.length - 1 ||
      obj.selectedCell[3] === obj.records.length - 1)
  ) {
    loadPage.call(obj, -1);
  } else if (obj.options.pagination && typeof obj.options.pagination === 'number' && obj.options.pagination > 0) {
    const pageNumber = obj.whichPage?.(obj.selectedCell[3]);
    if (pageNumber !== undefined && pageNumber !== obj.pageNumber) {
      obj.page?.(pageNumber);
    }
  }

  obj.updateSelectionFromCoords?.(
    obj.selectedCell[0],
    obj.selectedCell[1],
    obj.selectedCell[2],
    obj.selectedCell[3]
  );
  updateScroll.call(obj, 1);
};
