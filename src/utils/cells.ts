import { getCoordsFromCellName } from "./helpers";
import { SpreadsheetContext } from "../types/core";

export const setReadOnly = function (
  this: SpreadsheetContext,
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

    const x = coords[0] as number;
    const y = coords[1] as number;
    const row = obj.records[y];
    if (row && row[x]) {
      record = row[x];
    } else {
      return;
    }
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

  if (record) {
    if (state) {
      record.element.classList.add("readonly");
    } else {
      record.element.classList.remove("readonly");
    }
  }
};

export const isReadOnly = function (
  this: SpreadsheetContext,
  x: string | number,
  y?: number
) {
  const obj = this;

  if (typeof x === "string" && typeof y === "undefined") {
    const coords = getCoordsFromCellName(x);

    if (coords[0] === null || coords[1] === null) {
      return false;
    }

    [x, y] = coords as [number, number];
  }

  if (y !== undefined) {
    const row = obj.records[y];
    if (row && row[x as number]) {
      const record = row[x as number];
      return record.element.classList.contains("readonly");
    }
  }
  return false;
};
