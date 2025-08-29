import type { SpreadsheetContext, Row } from "../types/core";

/**
 * Go to a page in a lazyLoading
 */
export const loadPage = function (this: SpreadsheetContext, pageNumber: number) {
  const obj = this;

  // Search
  let results;

  if (
    (obj.options.search == true || obj.options.filters == true) &&
    obj.results
  ) {
    results = obj.results;
  } else {
    results = obj.rows;
  }

  // Per page
  const quantityPerPage = 100;

  // pageNumber
  if (pageNumber == null || pageNumber == -1) {
    // Last page
    pageNumber = Math.ceil(results.length / quantityPerPage) - 1;
  }

  let startRow = pageNumber * quantityPerPage;
  let finalRow = pageNumber * quantityPerPage + quantityPerPage;
  if (finalRow > results.length) {
    finalRow = results.length;
  }
  startRow = finalRow - 100;
  if (startRow < 0) {
    startRow = 0;
  }

  // Appending items
  for (let j = startRow; j < finalRow; j++) {
    if (
      (obj.options.search == true || obj.options.filters == true) &&
      obj.results
    ) {
      // results is number[] when obj.results exists
      const rowIndex = (results as number[])[j];
      obj.tbody.appendChild(obj.rows[rowIndex].element);
    } else {
      // results is obj.rows (Row[]) when no search/filters
      obj.tbody.appendChild((results as Row[])[j].element);
    }

    if (obj.tbody.children.length > quantityPerPage && obj.tbody.firstChild) {
      obj.tbody.removeChild(obj.tbody.firstChild);
    }
  }
};

export const loadValidation = function (this: SpreadsheetContext) {
  const obj = this;

  if (obj.selectedCell && obj.tbody.firstChild) {
    const firstChild = obj.tbody.firstChild as Element;
    const dataY = firstChild.getAttribute("data-y");
    const currentPage = dataY ? parseInt(dataY, 10) / 100 : 0;
    const selectedCellIndex = obj.selectedCell[3];
    const selectedPage = Math.floor(parseInt(String(selectedCellIndex), 10) / 100);
    const totalPages = Math.floor(obj.rows.length / 100);

    if (currentPage !== selectedPage && selectedPage <= totalPages) {
      const selectedRowIndex = typeof selectedCellIndex === 'number' ? selectedCellIndex : parseInt(String(selectedCellIndex), 10);
      if (
        !Array.prototype.indexOf.call(
          obj.tbody.children,
          obj.rows[selectedRowIndex].element
        )
      ) {
        obj.loadPage?.(selectedPage);
        return true;
      }
    }
  }

  return false;
};

export const loadUp = function (this: SpreadsheetContext) {
  const obj = this;

  // Search
  let results;

  if (
    (obj.options.search == true || obj.options.filters == true) &&
    obj.results
  ) {
    results = obj.results;
  } else {
    results = obj.rows;
  }
  let test = 0;
  if (results.length > 100 && obj.tbody.firstChild) {
    // Get the first element in the page
    const firstChild = obj.tbody.firstChild as Element;
    const dataY = firstChild.getAttribute("data-y");
    let item = dataY ? parseInt(dataY, 10) : 0;
    if (
      (obj.options.search == true || obj.options.filters == true) &&
      obj.results
    ) {
      item = (results as number[]).indexOf(item);
    }
    if (item > 0) {
      for (let j = 0; j < 30; j++) {
        item = item - 1;
        if (item > -1 && obj.tbody.firstChild) {
          if (
            (obj.options.search == true || obj.options.filters == true) &&
            obj.results
          ) {
            obj.tbody.insertBefore(
              obj.rows[(results as number[])[item]].element,
              obj.tbody.firstChild
            );
          } else {
            obj.tbody.insertBefore(
              (results as Row[])[item].element,
              obj.tbody.firstChild
            );
          }
          if (obj.tbody.children.length > 100 && obj.tbody.lastChild) {
            obj.tbody.removeChild(obj.tbody.lastChild);
            test = 1;
          }
        }
      }
    }
  }
  return test;
};

export const loadDown = function (this: SpreadsheetContext) {
  const obj = this;

  // Search
  let results;

  if (
    (obj.options.search == true || obj.options.filters == true) &&
    obj.results
  ) {
    results = obj.results;
  } else {
    results = obj.rows;
  }
  let test = 0;
  if (results.length > 100 && obj.tbody.lastChild) {
    // Get the last element in the page
    const lastChild = obj.tbody.lastChild as Element;
    const dataY = lastChild.getAttribute("data-y");
    let item = dataY ? parseInt(dataY, 10) : 0;
    if (
      (obj.options.search == true || obj.options.filters == true) &&
      obj.results
    ) {
      item = (results as number[]).indexOf(item);
    }
    if (item < obj.rows.length - 1) {
      for (let j = 0; j <= 30; j++) {
        if (item < results.length && obj.tbody.firstChild) {
          if (
            (obj.options.search == true || obj.options.filters == true) &&
            obj.results
          ) {
            obj.tbody.appendChild(obj.rows[(results as number[])[item]].element);
          } else {
            obj.tbody.appendChild((results as Row[])[item].element);
          }
          if (obj.tbody.children.length > 100) {
            obj.tbody.removeChild(obj.tbody.firstChild);
            test = 1;
          }
        }
        item = item + 1;
      }
    }
  }

  return test;
};
