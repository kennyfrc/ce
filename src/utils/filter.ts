import jSuites from "jsuites";
import { updateResult } from "./internal";
import { refreshSelection } from "./selection";
import type { SpreadsheetContext } from "../types/core";

/**
 * Open the column filter
 */
export const openFilter = function (this: SpreadsheetContext, columnId: string | number) {
  const obj = this;

  if (!obj.options.filters) {
    console.log("Jspreadsheet: filters not enabled.");
  } else {
    // Make sure is integer
    const columnIdNum = parseInt(columnId as string);
    // Reset selection
    obj.resetSelection?.();
    // Load options
    let optionsFiltered = [];
    const columns = obj.options.columns ?? [];
    if (columns[columnIdNum]?.type == "checkbox") {
      optionsFiltered.push({ id: "true", name: "True" });
      optionsFiltered.push({ id: "false", name: "False" });
    } else {
      const options: Record<string, string> = {};
      let hasBlanks = false;
      const dataRows = obj.options.data ?? [];
      for (let j = 0; j < dataRows.length; j++) {
        const row = Array.isArray(dataRows[j]) ? dataRows[j] : [];
        const k = row[columnIdNum];
        const v = obj.records[j]?.[columnIdNum]?.element.innerHTML;
        if (k && v) {
          options[k] = v;
        } else {
          hasBlanks = true;
        }
      }
      const keys = Object.keys(options);
      optionsFiltered = [];
      for (let j = 0; j < keys.length; j++) {
        optionsFiltered.push({ id: keys[j], name: options[keys[j]] });
      }
      // Has blank options
      if (hasBlanks) {
        optionsFiltered.push({ value: "", id: "", name: "(Blanks)" });
      }
    }

    // Create dropdown
    const div = document.createElement("div");
    const filterElement = obj.filter?.children[columnIdNum + 1] as HTMLElement;
    if (filterElement) {
      filterElement.innerHTML = "";
      filterElement.appendChild(div);
      filterElement.style.paddingLeft = "0px";
      filterElement.style.paddingRight = "0px";
      filterElement.style.overflow = "initial";
    }

    const filters = obj.filters ?? {};
    const opt = {
      data: optionsFiltered,
      multiple: true,
      autocomplete: true,
      opened: true,
      value: filters[columnId] !== undefined ? filters[columnId] : null,
      width: 100,
      position:
        obj.options.tableOverflow == true ||
        obj.parent?.config?.fullscreen == true
          ? true
          : false,
      onclose: function (o: { dropdown: { getValue: (arg: boolean) => unknown; getText: () => string } }) {
        resetFilters.call(obj);
        filters[columnIdNum] = o.dropdown.getValue(true) as string[];
        const filterChild = obj.filter?.children[columnIdNum + 1] as HTMLElement;
        if (filterChild) {
          filterChild.innerHTML = o.dropdown.getText();
          filterChild.style.paddingLeft = "";
          filterChild.style.paddingRight = "";
          filterChild.style.overflow = "";
        }
        closeFilter.call(obj, columnIdNum);
        refreshSelection.call(obj);
      },
    };

    // Dynamic dropdown
    jSuites.dropdown(div, opt);
  }
};

export const closeFilter = function (this: SpreadsheetContext, columnId?: number) {
  const obj = this;
  const filters = obj.filters ?? {};

  if (!columnId) {
    const filterChildren = obj.filter?.children ?? [];
    for (let i = 0; i < filterChildren.length; i++) {
      if (filters[i]) {
        columnId = i;
      }
    }
  }

  // Search filter
  const search = function (query: unknown[], x: number, y: number) {
    const dataRows = obj.options.data ?? [];
    const row = Array.isArray(dataRows[y]) ? dataRows[y] : [];
    const value = "" + row[x];
    const label = "" + obj.records[y]?.[x]?.element.innerHTML;
    for (let i = 0; i < query.length; i++) {
      if (query[i] == value || query[i] == label) {
        return true;
      }
    }
    return false;
  };

  const filters = obj.filters ?? {};
  const query = filters[columnId!] as unknown[];
  obj.results = [];
  const dataRows = obj.options.data ?? [];
  for (let j = 0; j < dataRows.length; j++) {
    if (search(query, columnId!, j)) {
      obj.results.push(j);
    }
  }
  if (!obj.results.length) {
    obj.results = null;
  }

  updateResult.call(obj);
};

export const resetFilters = function (this: SpreadsheetContext) {
  const obj = this;

  if (obj.options.filters) {
    const filterChildren = obj.filter?.children ?? [];
    const filters = obj.filters ?? {};
    for (let i = 0; i < filterChildren.length; i++) {
      const child = filterChildren[i] as HTMLElement;
      if (child) {
        child.innerHTML = "&nbsp;";
      }
      filters[i] = null;
    }
  }

  obj.results = null;
  updateResult.call(obj);
};
