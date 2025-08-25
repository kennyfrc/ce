import jSuites from "jsuites";

import dispatch from "./dispatch";

interface JSuitesElement extends HTMLElement {
  dropdown?: any;
  calendar?: any;
  color?: any;
  editor?: any;
  mask?: any;
}
import { getMask, isFormula, updateCell } from "./internal";
import { setHistory } from "./history";

/**
 * Open the editor
 *
 * @param object cell
 * @return void
 */
export const openEditor = function (
  this: any,
  cell: HTMLElement,
  empty: boolean,
  e: Event
) {
  const obj = this;

  // Get cell position
  const y = cell.getAttribute("data-y");
  const x = cell.getAttribute("data-x");

  // Convert to numbers with null checks
  const xNum = x ? parseInt(x) : 0;
  const yNum = y ? parseInt(y) : 0;

  // On edition start
  dispatch.call(obj, "oneditionstart", obj, cell, xNum, yNum);

  // Overflow
  if (xNum > 0 && yNum >= 0) {
    obj.records[yNum][xNum - 1].element.style.overflow = "hidden";
  }

  // Create editor
  const createEditor = function (type: string) {
    // Cell information
    const info = cell.getBoundingClientRect();

    // Create dropdown
    const editor = document.createElement(type);
    editor.style.width = info.width + "px";
    editor.style.height = info.height - 2 + "px";
    editor.style.minHeight = info.height - 2 + "px";

    // Edit cell
    cell.classList.add("editor");
    cell.innerHTML = "";
    cell.appendChild(editor);

    return editor;
  };

  // Readonly
  if (cell.classList.contains("readonly") == true) {
    // Do nothing
  } else {
    // Holder
    obj.edition = [
      obj.records[yNum][xNum].element,
      obj.records[yNum][xNum].element.innerHTML,
      x,
      y,
    ];

    // If there is a custom editor for it
    if (
      obj.options.columns &&
      obj.options.columns[parseInt(x || "0")] &&
      typeof obj.options.columns[xNum].type === "object"
    ) {
      // Custom editors
      obj.options.columns[xNum].type.openEditor(
        cell,
        obj.options.data[yNum][xNum],
        xNum,
        yNum,
        obj,
        obj.options.columns[xNum],
        e
      );

      // On edition start
      dispatch.call(
        obj,
        "oncreateeditor",
        obj,
        cell,
        xNum,
        yNum,
        null,
        obj.options.columns[parseInt(x || "0")]
      );
    } else {
      // Native functions
      if (
        obj.options.columns &&
        obj.options.columns[parseInt(x || "0")] &&
        obj.options.columns[parseInt(x || "0")].type == "hidden"
      ) {
        // Do nothing
      } else if (
        obj.options.columns &&
        obj.options.columns[parseInt(x || "0")] &&
        (obj.options.columns[parseInt(x || "0")].type == "checkbox" ||
          obj.options.columns[parseInt(x || "0")].type == "radio")
      ) {
        // Get value
        const value =
          cell.children[0] && (cell.children[0] as HTMLInputElement).checked
            ? false
            : true;
        // Toogle value
        obj.setValue(cell, value);
        // Do not keep edition open
        obj.edition = null;
      } else if (
        obj.options.columns &&
        x &&
        obj.options.columns[xNum] &&
        obj.options.columns[xNum].type == "dropdown" &&
        y
      ) {
        // Get current value
        let value = obj.options.data[yNum][xNum];
        if (obj.options.columns[xNum].multiple && !Array.isArray(value)) {
          value = value.split(";");
        }

        // Create dropdown
        let source;

        if (typeof obj.options.columns[xNum].filter == "function") {
          source = obj.options.columns[xNum].filter(
            obj.element,
            cell,
            x,
            y,
            obj.options.columns[xNum].source
          );
        } else {
          source = obj.options.columns[xNum].source;
        }

        // Do not change the original source
        const data = [];
        if (source) {
          for (let j = 0; j < source.length; j++) {
            data.push(source[j]);
          }
        }

        // Create editor
        const editor = createEditor("div");

        // On edition start
        dispatch.call(
          obj,
          "oncreateeditor",
          obj,
          cell,
          parseInt(x || "0"),
          parseInt(y || "0"),
          null,
          x ? obj.options.columns[xNum] : null
        );

        const options: any = {
          data: data,
          multiple: x && obj.options.columns[xNum].multiple ? true : false,
          autocomplete:
            x && obj.options.columns[xNum].autocomplete ? true : false,
          opened: true,
          value: value,
          width: "100%",
          height: editor.style.minHeight,
          position:
            obj.options.tableOverflow == true ||
            obj.parent.config.fullscreen == true
              ? true
              : false,
          onclose: function () {
            closeEditor.call(obj, cell, true);
          },
        };
        if (
          obj.options.columns[xNum].options &&
          obj.options.columns[xNum].options.type
        ) {
          options.type = obj.options.columns[xNum].options.type;
        }
        jSuites.dropdown(editor, options);
      } else if (
        obj.options.columns &&
        obj.options.columns[xNum] &&
        (obj.options.columns[xNum].type == "calendar" ||
          obj.options.columns[xNum].type == "color")
      ) {
        // Value
        const value = obj.options.data[yNum][xNum];
        // Create editor
        const editor = createEditor("input");

        dispatch.call(
          obj,
          "oncreateeditor",
          obj,
          cell,
          parseInt(x || "0"),
          parseInt(y || "0"),
          null,
          x ? obj.options.columns[xNum] : null
        );

        (editor as HTMLInputElement).value = value;

        const options =
          x && obj.options.columns[xNum].options
            ? { ...obj.options.columns[xNum].options }
            : {};

        if (
          obj.options.tableOverflow == true ||
          obj.parent.config.fullscreen == true
        ) {
          options.position = true;
        }
        options.value = obj.options.data[yNum][xNum];
        options.opened = true;
        options.onclose = function (el: any, value: any) {
          closeEditor.call(obj, cell, true);
        };
        // Current value
        if (obj.options.columns[xNum].type == "color") {
          jSuites.color(editor, options);

          const rect = cell.getBoundingClientRect();

          if (
            options.position &&
            editor.nextSibling &&
            "children" in editor.nextSibling
          ) {
            const nextSibling = editor.nextSibling as HTMLElement;
            if (nextSibling.children && nextSibling.children[1]) {
              const childElement = nextSibling.children[1] as HTMLElement;
              childElement.style.top = rect.top + rect.height + "px";
              childElement.style.left = rect.left + "px";
            }
          }
        } else {
          if (!options.format) {
            options.format = "YYYY-MM-DD";
          }

          jSuites.calendar(editor, options);
        }
        // Focus on editor
        editor.focus();
      } else if (
        obj.options.columns &&
        obj.options.columns[xNum] &&
        obj.options.columns[xNum].type == "html"
      ) {
        const value = x && y ? obj.options.data[yNum][xNum] : "";
        // Create editor
        const editor = createEditor("div");

        dispatch.call(
          obj,
          "oncreateeditor",
          obj,
          cell,
          parseInt(x || "0"),
          parseInt(y || "0"),
          null,
          x ? obj.options.columns[xNum] : null
        );

        editor.style.position = "relative";
        const div = document.createElement("div");
        div.classList.add("jss_richtext");
        editor.appendChild(div);
        jSuites.editor(div, {
          focus: true,
          value: value,
        });
        const rect = cell.getBoundingClientRect();
        const rectContent = div.getBoundingClientRect();
        if (window.innerHeight < rect.bottom + rectContent.height) {
          div.style.top = rect.bottom - (rectContent.height + 2) + "px";
        } else {
          div.style.top = rect.top + "px";
        }

        if (window.innerWidth < rect.left + rectContent.width) {
          div.style.left = rect.right - (rectContent.width + 2) + "px";
        } else {
          div.style.left = rect.left + "px";
        }
      } else if (
        obj.options.columns &&
        obj.options.columns[xNum] &&
        obj.options.columns[xNum].type == "image"
      ) {
        // Value
        const img = cell.children[0] as HTMLImageElement;
        // Create editor
        const editor = createEditor("div");

        dispatch.call(
          obj,
          "oncreateeditor",
          obj,
          cell,
          parseInt(x || "0"),
          parseInt(y || "0"),
          null,
          x ? obj.options.columns[xNum] : null
        );

        editor.style.position = "relative";
        const div = document.createElement("div");
        div.classList.add("jclose");
        if (img && (img as HTMLImageElement).src) {
          div.appendChild(img);
        }
        editor.appendChild(div);
        jSuites.image(div, obj.options.columns[xNum]);
        const rect = cell.getBoundingClientRect();
        const rectContent = div.getBoundingClientRect();
        if (window.innerHeight < rect.bottom + rectContent.height) {
          div.style.top = rect.top - (rectContent.height + 2) + "px";
        } else {
          div.style.top = rect.top + "px";
        }

        div.style.left = rect.left + "px";
      } else {
        // Value
        const value = empty == true ? "" : obj.options.data[yNum][xNum];

        // Basic editor
        let editor;

        if (
          (!obj.options.columns ||
            !obj.options.columns[xNum] ||
            obj.options.columns[xNum].wordWrap != false) &&
          (obj.options.wordWrap == true ||
            (obj.options.columns &&
              obj.options.columns[xNum] &&
              obj.options.columns[xNum].wordWrap == true))
        ) {
          editor = createEditor("textarea");
        } else {
          editor = createEditor("input");
        }

        dispatch.call(
          obj,
          "oncreateeditor",
          obj,
          cell,
          parseInt(x || "0"),
          parseInt(y || "0"),
          null,
          x ? obj.options.columns[xNum] : null
        );

        editor.focus();
        (editor as HTMLInputElement).value = value;

        // Column options
        const options = obj.options.columns && obj.options.columns[xNum];

        // Apply format when is not a formula
        if (!isFormula(value)) {
          if (options) {
            // Format
            const opt = getMask(options);

            if (opt) {
              // Masking
              if (!options.disabledMaskOnEdition) {
                if (options.mask) {
                  const m = options.mask.split(";");
                  editor.setAttribute("data-mask", m[0]);
                } else if (options.locale) {
                  editor.setAttribute("data-locale", options.locale);
                }
              }
              // Input
              (opt as any).input = editor;
              // Configuration
              (editor as any).mask = opt;
              // Do not treat the decimals
              jSuites.mask.render(value, opt, false);
            }
          }
        }

        editor.onblur = function () {
          closeEditor.call(obj, cell, true);
        };
        editor.scrollLeft = editor.scrollWidth;
      }
    }
  }
};

/**
 * Close the editor and save the information
 *
 * @param object cell
 * @param boolean save
 * @return void
 */
export const closeEditor = function (
  this: any,
  cell: HTMLElement,
  save: boolean
) {
  const obj = this;

  const xAttr = cell.getAttribute("data-x");
  const yAttr = cell.getAttribute("data-y");
  const x = xAttr ? parseInt(xAttr) : 0;
  const y = yAttr ? parseInt(yAttr) : 0;

  let value;

  // Get cell properties
  if (save == true) {
    // If custom editor
    if (
      obj.options.columns &&
      obj.options.columns[x] &&
      typeof obj.options.columns[x].type === "object"
    ) {
      // Custom editor
      value = obj.options.columns[x].type.closeEditor(
        cell,
        save,
        x,
        y,
        obj,
        obj.options.columns[x]
      );
    } else {
      // Native functions
      if (
        obj.options.columns &&
        obj.options.columns[x] &&
        (obj.options.columns[x].type == "checkbox" ||
          obj.options.columns[x].type == "radio" ||
          obj.options.columns[x].type == "hidden")
      ) {
        // Do nothing
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "dropdown"
      ) {
        value = (cell.children[0] as JSuitesElement).dropdown?.close(true);
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "calendar"
      ) {
        value = (cell.children[0] as JSuitesElement).calendar?.close(true);
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "color"
      ) {
        value = (cell.children[0] as JSuitesElement).color?.close(true);
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "html"
      ) {
        value = (
          cell.children[0].children[0] as JSuitesElement
        ).editor?.getData();
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "image"
      ) {
        const img = cell.children[0].children[0]
          .children[0] as HTMLImageElement;
        value = img && img.tagName == "IMG" ? img.src : "";
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "numeric"
      ) {
        value = (cell.children[0] as HTMLInputElement).value;
        if (("" + value).substr(0, 1) != "=") {
          if (value == "") {
            value = obj.options.columns[x].allowEmpty ? "" : 0;
          }
        }
        (cell.children[0] as HTMLElement).onblur = null;
      } else {
        value = (cell.children[0] as HTMLInputElement).value;
        (cell.children[0] as HTMLElement).onblur = null;

        // Column options
        const options = obj.options.columns && obj.options.columns[x];

        if (options) {
          // Format
          const opt = getMask(options);
          if (opt) {
            // Keep numeric in the raw data
            if (
              value !== "" &&
              !isFormula(value) &&
              typeof value !== "number"
            ) {
              const t = jSuites.mask.extract(value, opt, true);
              if (t && t.value !== "") {
                value = t.value;
              }
            }
          }
        }
      }
    }

    // Ignore changes if the value is the same
    if (obj.options.data[y][x] == value) {
      cell.innerHTML = obj.edition[1];
    } else {
      obj.setValue(cell, value);
    }
  } else {
    if (
      obj.options.columns &&
      obj.options.columns[x] &&
      typeof obj.options.columns[x].type === "object"
    ) {
      // Custom editor
      obj.options.columns[x].type.closeEditor(
        cell,
        save,
        x,
        y,
        obj,
        obj.options.columns[x]
      );
    } else {
      if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "dropdown"
      ) {
        (cell.children[0] as JSuitesElement).dropdown?.close(true);
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "calendar"
      ) {
        (cell.children[0] as JSuitesElement).calendar?.close(true);
      } else if (
        obj.options.columns &&
        obj.options.columns[x] &&
        obj.options.columns[x].type == "color"
      ) {
        (cell.children[0] as JSuitesElement).color?.close(true);
      } else {
        (cell.children[0] as HTMLElement).onblur = null;
      }
    }

    // Restore value
    cell.innerHTML = obj.edition && obj.edition[1] ? obj.edition[1] : "";
  }

  // On edition end
  dispatch.call(obj, "oneditionend", obj, cell, x, y, value, save);

  // Remove editor class
  cell.classList.remove("editor");

  // Finish edition
  obj.edition = null;
};

/**
 * Toogle
 */
export const setCheckRadioValue = function (this: any) {
  const obj = this;

  const records = [];
  const keys = Object.keys(obj.highlighted);
  for (let i = 0; i < keys.length; i++) {
    const x = obj.highlighted[i].element.getAttribute("data-x");
    const y = obj.highlighted[i].element.getAttribute("data-y");

    if (
      obj.options.columns[parseInt(x || "0")].type == "checkbox" ||
      obj.options.columns[parseInt(x || "0")].type == "radio"
    ) {
      // Update cell
      records.push(updateCell.call(obj, x, y, !obj.options.data[y][x]));
    }
  }

  if (records.length) {
    // Update history
    setHistory.call(obj, {
      action: "setValue",
      records: records,
      selection: obj.selectedCell,
    });

    // On after changes
    const onafterchangesRecords = records.map(function (record) {
      return {
        x: record.x,
        y: record.y,
        value: record.value,
        oldValue: record.oldValue,
      };
    });

    dispatch.call(obj, "onafterchanges", obj, onafterchangesRecords);
  }
};
