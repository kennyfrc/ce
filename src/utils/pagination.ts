import jSuites from "jsuites";

import dispatch from "./dispatch";
import { updateCornerPosition } from "./selection";

/**
 * Which page the row is
 */
export const whichPage = function (this: any, row: any): number {
  const obj = this;

  // Search
  if (
    (obj.options.search == true || obj.options.filters == true) &&
    obj.results
  ) {
    row = obj.results.indexOf(row);
  }

  return Math.ceil((parseInt(row) + 1) / parseInt(obj.options.pagination)) - 1;
};

/**
 * Update the pagination
 */
export const updatePagination = function (this: any): void {
  const obj = this;

  // Reset container
  obj.pagination.children[0].innerHTML = "";
  obj.pagination.children[1].innerHTML = "";

  // Start pagination
  if (obj.options.pagination) {
    // Searchable
    let results;

    if (
      (obj.options.search == true || obj.options.filters == true) &&
      obj.results
    ) {
      results = obj.results.length;
    } else {
      results = obj.rows.length;
    }

    if (!results) {
      // No records found
      obj.pagination.children[0].innerHTML = (jSuites as any).translate(
        "No records found"
      );
    } else {
      // Pagination container
      const quantyOfPages = Math.ceil(results / obj.options.pagination);

      let startNumber, finalNumber;

      if (obj.pageNumber < 6) {
        startNumber = 1;
        finalNumber = quantyOfPages < 10 ? quantyOfPages : 10;
      } else if (quantyOfPages - obj.pageNumber < 5) {
        startNumber = quantyOfPages - 9;
        finalNumber = quantyOfPages;
        if (startNumber < 1) {
          startNumber = 1;
        }
      } else {
        startNumber = obj.pageNumber - 4;
        finalNumber = obj.pageNumber + 5;
      }

      // First
      if (startNumber > 1) {
        const paginationItem = document.createElement("div");
        paginationItem.className = "jss_page";
        paginationItem.innerHTML = "<";
        paginationItem.title = "1";
        obj.pagination.children[1].appendChild(paginationItem);
      }

      // Get page links
      for (let i = startNumber; i <= finalNumber; i++) {
        const paginationItem = document.createElement("div");
        paginationItem.className = "jss_page";
        paginationItem.innerHTML = i.toString();
        obj.pagination.children[1].appendChild(paginationItem);

        if (obj.pageNumber == i - 1) {
          paginationItem.classList.add("jss_page_selected");
        }
      }

      // Last
      if (finalNumber < quantyOfPages) {
        const paginationItem = document.createElement("div");
        paginationItem.className = "jss_page";
        paginationItem.innerHTML = ">";
        paginationItem.title = quantyOfPages.toString();
        obj.pagination.children[1].appendChild(paginationItem);
      }

      // Text
      const format = function (format: string, ...args: any[]) {
        return format.replace(/{(\d+)}/g, function (match: any, number: any) {
          return typeof args[number] != "undefined" ? args[number] : match;
        });
      };

      obj.pagination.children[0].innerHTML = format(
        (jSuites as any).translate("Showing page {0} of {1} entries"),
        (obj.pageNumber + 1).toString(),
        quantyOfPages.toString()
      );
    }
  }
};

/**
 * Go to page
 */
export const page = function (this: any, pageNumber: any): void {
  const obj = this;

  const oldPage = obj.pageNumber;

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
  const quantityPerPage = parseInt(obj.options.pagination);

  // pageNumber
  if (pageNumber == null || pageNumber == -1) {
    // Last page
    pageNumber = Math.ceil(results.length / quantityPerPage) - 1;
  }

  // Page number
  obj.pageNumber = pageNumber;

  let startRow = pageNumber * quantityPerPage;
  let finalRow = pageNumber * quantityPerPage + quantityPerPage;
  if (finalRow > results.length) {
    finalRow = results.length;
  }
  if (startRow < 0) {
    startRow = 0;
  }

  // Reset container
  while (obj.tbody.firstChild) {
    obj.tbody.removeChild(obj.tbody.firstChild);
  }

  // Appeding items
  for (let j = startRow; j < finalRow; j++) {
    if (
      (obj.options.search == true || obj.options.filters == true) &&
      obj.results
    ) {
      obj.tbody.appendChild(obj.rows[results[j]].element);
    } else {
      obj.tbody.appendChild(obj.rows[j].element);
    }
  }

  if (obj.options.pagination > 0) {
    updatePagination.call(obj);
  }

  // Update corner position
  updateCornerPosition.call(obj);

  // Events
  dispatch.call(
    obj,
    "onchangepage",
    obj,
    pageNumber,
    oldPage,
    obj.options.pagination
  );
};

export const quantiyOfPages = function (this: any): number {
  const obj = this;

  let results;
  if (
    (obj.options.search == true || obj.options.filters == true) &&
    obj.results
  ) {
    results = obj.results.length;
  } else {
    results = obj.rows.length;
  }

  return Math.ceil(results / obj.options.pagination);
};
