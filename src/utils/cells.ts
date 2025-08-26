import { getCoordsFromCellName } from "./helpers";

export const setReadOnly = function (
  this: any,
  cell: string | HTMLElement,
  state: boolean
) {
  const obj = this;

  let record;

  if (typeof cell === "string") {
    const coords = getCoordsFromCellName(cell);

    if (coords[0] === null || coords[1] === null) {
      return;
    }

    record = obj.records[coords[1]][coords[0]];
  } else {
    const xAttr = cell.getAttribute("data-x");
    const yAttr = cell.getAttribute("data-y");

    if (xAttr === null || yAttr === null) {
      return;
    }

    const x = parseInt(xAttr);
    const y = parseInt(yAttr);

    if (obj.records[y] && obj.records[y][x]) {
      record = obj.records[y][x];
    } else {
      return;
    }
  }

  if (state) {
    record.element.classList.add("readonly");
  } else {
    record.element.classList.remove("readonly");
  }
};

export const isReadOnly = function (this: any, x: string | number, y?: number) {
  const obj = this;

  if (typeof x === "string" && typeof y === "undefined") {
    const coords = getCoordsFromCellName(x);

    if (coords[0] === null || coords[1] === null) {
      return false;
    }

    [x, y] = coords as [number, number];
  }

  if (y !== undefined && obj.records[y] && obj.records[y][x]) {
    return obj.records[y][x].element.classList.contains("readonly");
  }
  return false;
};
