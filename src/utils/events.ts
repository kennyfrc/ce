import jSuites from "jsuites";

import { closeEditor, openEditor, setCheckRadioValue } from "./editor";
import libraryBase from "./libraryBase";
import { down, first, last, left, right, up } from "./keys";
import { isColMerged, isRowMerged } from "./merges";
import {
  copyData,
  removeCopySelection,
  resetSelection,
  selectAll,
  updateCornerPosition,
  updateSelectionFromCoords,
} from "./selection";
import { copy, paste } from "./copyPaste";
import { openFilter } from "./filter";
import { loadDown, loadUp } from "./lazyLoading";
import { setWidth } from "./columns";
import { moveRow, setHeight } from "./rows";
import version from "./version";
import { getCellNameFromCoords } from "./helpers";
import type { WorksheetInstance, CellValue } from "../types/core";

const getAttrSafe = (
  el: EventTarget | null | undefined,
  name: string
): string => {
  const elh = getHTMLElement(el as EventTarget | null);
  return elh?.getAttribute(name) ?? "";
};

const getAttrInt = (
  el: EventTarget | null | undefined,
  name: string
): number => parseInt(getAttrSafe(el, name), 10);

const getHTMLElement = (element: EventTarget | null): HTMLElement | null =>
  element instanceof HTMLElement ? element : null;

// Narrow mouse button from various event shapes (MouseEvent, legacy event)
const getMouseButton = (ev: unknown): number | undefined => {
  if (!ev || typeof ev !== "object") return undefined;
  const e = ev as Record<string, unknown>;
  if (typeof e.buttons === "number") return e.buttons as number;
  if (typeof e.button === "number") return e.button as number;
  if (typeof e.which === "number") return e.which as number;
  return undefined;
};

const getElement = function (
  element: Element | null | undefined
): [HTMLElement | null, number] {
  let jssSection = 0;
  let jssElement: HTMLElement | null = null;

  function path(el: Element | null | undefined) {
    if (!el) return;

    if ((el as Element).classList) {
      const cls = (el as Element).classList;
      if (cls.contains("jss_container")) {
        jssElement = el as HTMLElement;
      }
      if (cls.contains("jss_spreadsheet")) {
        const found = (el as Element).querySelector(
          ":scope > .jtabs-content > .jtabs-selected"
        );
        if (found instanceof HTMLElement) jssElement = found;
      }
    }

    const tagName = (el as Element).tagName;
    if (tagName == "THEAD") {
      jssSection = 1;
    } else if (tagName == "TBODY") {
      jssSection = 2;
    }

    const parent = (el as Element).parentElement;
    if (parent && !jssElement) {
      path(parent);
    }
  }

  path(element);

  return [jssElement, jssSection];
};

const mouseUpControls = function (e: MouseEvent) {
  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (current) {
    // Update cell size
    if (current.resizing) {
      const r = current.resizing;
      // Columns to be updated when a numeric column index is present
      if (typeof r.column === "number") {
        const colIndex = r.column;
        // New width
        const newWidth = getAttrInt(current.cols[colIndex].colElement, "width");

        // Columns
        const columns = current.getSelectedColumns?.() ?? [];
        if (columns.length > 1) {
          const currentWidth: number[] = [];
          for (let i = 0; i < columns.length; i++) {
            currentWidth.push(
              getAttrInt(current.cols[columns[i]].colElement, "width")
            );
          }
          const index = columns.indexOf(colIndex);
          currentWidth[index] = r.width ?? currentWidth[index] ?? 0;
          setWidth.call(current, columns, newWidth, currentWidth);
        } else {
          setWidth.call(current, colIndex, newWidth, r.width);
        }

        // Remove border
        current.headers[colIndex].classList.remove("resizing");
        for (let j = 0; j < current.records.length; j++) {
          if (current.records[j][colIndex]) {
            current.records[j][colIndex].element.classList.remove("resizing");
          }
        }
      } else {
        // Row resize
        const rowIndex = r.row as number;
        current.rows[rowIndex].element.children[0].classList.remove("resizing");
        const newHeight = getAttrInt(current.rows[rowIndex].element, "height");
        setHeight.call(current, rowIndex, newHeight, r.height);
        // Remove border
        r.element?.classList.remove("resizing");
      }
      // Reset resizing helper
      current.resizing = null;
    } else if (current.dragging) {
      // Reset dragging helper
      const d = current.dragging;
      if (d) {
        if (typeof d.column === "number") {
          // Target
          const columnIdAttr = getAttrSafe(e.target as Element | null, "data-x");
          const columnId = columnIdAttr ? parseInt(columnIdAttr, 10) : undefined;
          const dragCol = d.column;
          // Remove move style
          current.headers[dragCol].classList.remove("dragging");
          for (let j = 0; j < current.rows.length; j++) {
            if (current.records[j][dragCol]) {
              current.records[j][dragCol].element.classList.remove("dragging");
            }
          }
          for (let i = 0; i < current.headers.length; i++) {
            current.headers[i].classList.remove("dragging-left");
            current.headers[i].classList.remove("dragging-right");
          }
          // Update position
            if (columnId !== undefined) {
              if (typeof d.destination === "number" && dragCol != d.destination) {
                current.moveColumn?.(dragCol, d.destination);
              }
            }
        } else {
          let position: number;
          const elem = d.element as HTMLElement | null;
          if (elem && elem.nextSibling) {
            position = parseInt((elem.nextSibling as Element).getAttribute("data-y") as string, 10);
            if ((d.row as number) < position) {
              position -= 1;
            }
          } else if (elem && elem.previousSibling) {
            position = parseInt((elem.previousSibling as Element).getAttribute("data-y") as string, 10);
          } else {
            position = d.destination as number;
          }
          if ((d.row as number) != d.destination) {
            moveRow.call(current, d.row as number, position, true);
          }
          elem?.classList.remove("dragging");
        }
        current.dragging = null;
      }
    } else {
        // Close any corner selection
        if (current.selectedCorner) {
          current.selectedCorner = false;

          // Data to be copied (guard selection before use)
          const selection = current.selection ?? [];
          if (selection.length > 0) {
            // Copy data
            copyData.call(current, selection[0], selection[selection.length - 1]);

            // Remove selection
            removeCopySelection.call(current);
          }
        }
    }
  }

  // Clear any time control
  if (libraryBase.jspreadsheet.timeControl) {
    clearTimeout(libraryBase.jspreadsheet.timeControl);
    libraryBase.jspreadsheet.timeControl = null;
  }

  // Mouse up
  libraryBase.jspreadsheet.isMouseAction = false;
};

const mouseDownControls = function (e: MouseEvent) {
  e = e || (window.event as unknown as MouseEvent);

  let mouseButton;

  if (e.buttons) {
    mouseButton = e.buttons;
  } else if (e.button) {
    mouseButton = e.button;
  } else {
    mouseButton = e.which;
  }

  // Get elements
  const target = getHTMLElement(e.target);
  const jssTable = getElement(target);

  if (!target) {
    libraryBase.jspreadsheet.isMouseAction = false;
    return;
  }

  let current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (jssTable[0]) {
    if (current != jssTable[0].jssWorksheet) {
      if (current) {
        if (current.edition) {
          closeEditor.call(current, current.edition[0], true);
        }
        current.resetSelection?.();
      }
      libraryBase.jspreadsheet.current = jssTable[0].jssWorksheet;
      current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
    }
  } else {
    if (current) {
      if (current.edition) {
        closeEditor.call(current, current.edition[0], true);
      }

      if (!target.classList.contains("jss_object")) {
        resetSelection.call(current, true);
        libraryBase.jspreadsheet.current = null;
        current = null;
      }
    }
  }
  if (current && mouseButton == 1) {
    // Narrow common optional properties for safer access
    const data = current.options.data ?? [];
    const dataRows = data.length;
    const dataCols = (data[0] ? data[0].length : 0) as number;
    const columns = current.options.columns ?? [];
    if (target.classList.contains("jss_selectall")) {
            if (current) {
              selectAll.call(current);
            }
    } else if (target.classList.contains("jss_corner")) {
      if (current.options.editable != false) {
        current.selectedCorner = true;
      }
    } else {
      // Header found
      if (jssTable[1] == 1) {
        const columnIdAttr = target.getAttribute("data-x");
        const columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
        if (columnId !== undefined) {
          // Update cursor
          const info = target.getBoundingClientRect();
          if (
            current.options.columnResize != false &&
            info.width - e.offsetX < 6
          ) {
            // Resize helper
            current.resizing = {
              mousePosition: e.pageX,
              column: columnId,
              width: info.width,
            };

            // Border indication
            current.headers[columnId].classList.add("resizing");
            for (let j = 0; j < current.records.length; j++) {
              if (current.records[j][columnId]) {
                current.records[j][columnId].element.classList.add("resizing");
              }
            }
          } else if (
            current.options.columnDrag != false &&
            info.height - e.offsetY < 6
          ) {
            if (isColMerged.call(current, columnId).length) {
              console.error("Jspreadsheet: This column is part of a merged cell.");
            } else {
               // Reset selection
               current.resetSelection?.();
              // Drag helper
              current.dragging = {
                element: target,
                column: columnId,
                destination: columnId,
              };
              // Border indication
              current.headers[columnId].classList.add("dragging");
              for (let j = 0; j < current.records.length; j++) {
                if (current.records[j][columnId]) {
                  current.records[j][columnId].element.classList.add("dragging");
                }
              }
            }
          } else {
            let o, d;

            if (current.selectedHeader && (e.shiftKey || e.ctrlKey)) {
              o = current.selectedHeader;
              d = columnId;
            } else {
              // Press to rename
              if (
                current.selectedHeader == columnId &&
                current.options.allowRenameColumn != false
              ) {
                libraryBase.jspreadsheet.timeControl = setTimeout(function () {
                  current.setHeader?.(columnId);
                }, 800);
              }

              // Keep track of which header was selected first
              current.selectedHeader = columnId;

              // Update selection single column
              o = columnId;
              d = columnId;
            }

            const oNum = typeof o === "number" ? o : 0;
            const dNum = typeof d === "number" ? d : 0;
            updateSelectionFromCoords.call(
              current,
              oNum,
              0,
              dNum,
              dataRows - 1,
              e
            );
          }
        } else {
          if (target.parentElement?.classList.contains("jss_nested")) {
            let c1, c2;

              if (target.getAttribute("data-column")) {
                const column = (target.getAttribute("data-column") || "").split(",");
                c1 = parseInt(column[0]);
                c2 = parseInt(column[column.length - 1]);
              } else {
                c1 = 0;
                c2 = columns.length - 1;
              }
            updateSelectionFromCoords.call(
              current,
              c1,
              0,
              c2,
              dataRows - 1,
              e
            );
          }
        }
      } else {
        current.selectedHeader = false;
      }

      // Body found
      if (jssTable[1] == 2) {
        const rowIdAttr = target.getAttribute("data-y");
        const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;

        if (target.classList.contains("jss_row")) {
          const info = target.getBoundingClientRect();
          if (
            current.options.rowResize != false &&
            info.height - e.offsetY < 6
          ) {
            // Resize helper
            current.resizing = {
              element: target.parentElement as HTMLElement,
              mousePosition: e.pageY,
              row: rowId,
              height: info.height,
            };
            // Border indication
            target.parentElement?.classList.add("resizing");
          } else if (
            current.options.rowDrag != false &&
            info.width - e.offsetX < 6
          ) {
            if (typeof rowId === "number" && isRowMerged.call(current, rowId, false).length) {
              console.error("Jspreadsheet: This row is part of a merged cell");
            } else if (current.options.search == true && current.results) {
              console.error(
                "Jspreadsheet: Please clear your search before perform this action"
              );
            } else {
              // Reset selection
              current.resetSelection?.();
              // Drag helper
              current.dragging = {
                element: target.parentElement as HTMLElement,
                row: rowId,
                destination: rowId,
              };
              // Border indication
              target.parentElement?.classList.add("dragging");
            }
          } else {
            let o, d;
            if (current.selectedRow != null && (e.shiftKey || e.ctrlKey)) {
              o = current.selectedRow;
              d = rowId;
            } else {
              // Keep track of which header was selected first
              current.selectedRow = rowId;

              // Update selection single column
              o = rowId;
              d = rowId;
            }

            // Update selection
            if (typeof o === "number" && typeof d === "number") {
              updateSelectionFromCoords.call(
                current,
                0,
                o,
                dataCols - 1,
                d,
                e
              );
            }
          }
        } else {
          // Jclose
          if (
            target.classList.contains("jclose") &&
            target.clientWidth - e.offsetX < 50 &&
            e.offsetY < 50
          ) {
            closeEditor.call(current, current.edition![0], true);
          } else {
            const getCellCoords = function (element: HTMLElement): [string, string] | undefined {
              const x = element.getAttribute("data-x");
              const y = element.getAttribute("data-y");
              if (x && y) {
                return [x, y];
              } else {
                if (element.parentNode) {
                  return getCellCoords(element.parentNode as HTMLElement);
                }
                return undefined;
              }
            };

            const position = getCellCoords(target);
            if (position) {
              const columnId = parseInt(position[0]);
              const rowId = parseInt(position[1]);
              // Close edition
              if (current.edition) {
                if (current.edition[2] != columnId || current.edition[3] != rowId) {
                  closeEditor.call(current, current.edition[0], true);
                }
              }

              if (!current.edition) {
                // Update cell selection
                if (e.shiftKey && current.selectedCell) {
                  updateSelectionFromCoords.call(
                    current,
                    current.selectedCell[0],
                    current.selectedCell[1],
                    columnId,
                    rowId,
                    e
                  );
                } else {
                  updateSelectionFromCoords.call(
                    current,
                    columnId,
                    rowId,
                    columnId,
                    rowId,
                    e
                  );
                }
              }

              // No full row selected
              current.selectedHeader = null;
              current.selectedRow = null;
            }
          }
        }
      } else {
        current.selectedRow = false;
      }

      // Pagination
      if (target.classList.contains("jss_page")) {
        if (target.textContent == "<") {
          current.page?.(0);
        } else if (target.textContent == ">") {
          const titleAttr = target.getAttribute("title");
          current.page?.(titleAttr !== null ? parseInt(titleAttr, 10) - 1 : 0);
        } else {
          current.page?.(target.textContent ? parseInt(target.textContent, 10) - 1 : 0);
        }
      }
    }

    if (current.edition) {
      libraryBase.jspreadsheet.isMouseAction = false;
    } else {
      libraryBase.jspreadsheet.isMouseAction = true;
    }
  } else {
    libraryBase.jspreadsheet.isMouseAction = false;
  }
};

// Mouse move controls
const mouseMoveControls = function (e: MouseEvent) {
  e = e || (window.event as unknown as MouseEvent);

  let mouseButton;

  if (e.buttons) {
    mouseButton = e.buttons;
  } else if (e.button) {
    mouseButton = e.button;
  } else {
    mouseButton = e.which;
  }

  if (!mouseButton) {
    libraryBase.jspreadsheet.isMouseAction = false;
  }

  // Narrow event target to HTMLElement for safe DOM access
  const target = getHTMLElement(e.target);
  if (!target) {
    libraryBase.jspreadsheet.isMouseAction = false;
    return;
  }

  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (current) {
    if (libraryBase.jspreadsheet.isMouseAction == true) {
      // Resizing is ongoing
      if (current.resizing) {
        if (current.resizing.column) {
          const width = e.pageX - (current.resizing.mousePosition ?? 0);

          if ((current.resizing.width ?? 0) + width > 0) {
            const tempWidth = (current.resizing.width ?? 0) + width;
            const columnIndex = current.resizing.column;
            if (typeof columnIndex === "number" && current.cols[columnIndex]) {
              current.cols[columnIndex].colElement.setAttribute("width", tempWidth.toString());
            }

            updateCornerPosition.call(current);
          }
        } else {
          const height = e.pageY - (current.resizing.mousePosition ?? 0);

          if ((current.resizing.height ?? 0) + height > 0) {
            const tempHeight = (current.resizing.height ?? 0) + height;
            const rowIndex = current.resizing.row;
            if (typeof rowIndex === "number" && current.rows[rowIndex]) {
              current.rows[rowIndex].element.setAttribute("height", tempHeight.toString());
            }

            updateCornerPosition.call(current);
          }
        }
      } else if (current.dragging) {
        if (current.dragging.column) {
          const columnIdAttr = target.getAttribute("data-x");
          const columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
          if (columnId !== undefined) {
            if (isColMerged.call(current, columnId).length) {
              console.error("Jspreadsheet: This column is part of a merged cell.");
            } else {
              for (let i = 0; i < current.headers.length; i++) {
                current.headers[i].classList.remove("dragging-left");
                current.headers[i].classList.remove("dragging-right");
              }

              if (current.dragging.column == columnId) {
                current.dragging.destination = columnId;
              } else {
                if (target.clientWidth / 2 > e.offsetX) {
                  if (current.dragging.column < columnId) {
                    current.dragging.destination = columnId - 1;
                  } else {
                    current.dragging.destination = columnId;
                  }
                  current.headers[columnId].classList.add("dragging-left");
                } else {
                  if (current.dragging.column < columnId) {
                    current.dragging.destination = columnId;
                  } else {
                    current.dragging.destination = columnId + 1;
                  }
                  current.headers[columnId].classList.add("dragging-right");
                }
              }
            }
          }
        } else {
          const rowIdAttr = target.getAttribute("data-y");
          const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
          if (rowId !== undefined) {
            if (isRowMerged.call(current, rowId, false).length) {
              console.error("Jspreadsheet: This row is part of a merged cell.");
            } else {
              const siblingTarget =
                target.clientHeight / 2 > e.offsetY
                  ? (target.parentElement?.nextSibling as Node | null)
                  : (target.parentElement as Node | null);
              const container = target.parentElement?.parentElement as Node | null;
              const dragEl = current.dragging.element as Node | null;
              if (dragEl && dragEl != siblingTarget && container) {
                container.insertBefore(dragEl, siblingTarget);
                if (dragEl.parentNode) {
                  current.dragging.destination = Array.prototype.indexOf.call(dragEl.parentNode.children, dragEl);
                }
              }
            }
          }
        }
      }
    } else {
      const x = target.getAttribute("data-x");
      const y = target.getAttribute("data-y");
      const rect = target.getBoundingClientRect();

      if (current.cursor) {
        current.cursor.style.cursor = "";
        current.cursor = null;
      }

      const grandParent = target.parentElement?.parentElement;
      if (grandParent && typeof grandParent.className === "string") {
        if (grandParent.classList.contains("resizable")) {
          if (target && x && !y && rect.width - (e.clientX - rect.left) < 6) {
            current.cursor = target;
            current.cursor.style.cursor = "col-resize";
          } else if (!x && y && rect.height - (e.clientY - rect.top) < 6) {
            current.cursor = target;
            current.cursor.style.cursor = "row-resize";
          }
        }

        if (grandParent.classList.contains("draggable")) {
          if (!x && y && rect.width - (e.clientX - rect.left) < 6) {
            current.cursor = target;
            current.cursor.style.cursor = "move";
          } else if (x && !y && rect.height - (e.clientY - rect.top) < 6) {
            current.cursor = target;
            current.cursor.style.cursor = "move";
          }
        }
      }
    }
  }
};

/**
 * Update copy selection
 *
 * @param int x, y
 * @return void
 */
const updateCopySelection = function (this: WorksheetInstance, x3: number, y3: number) {
  const obj = this;

  // Remove selection
  removeCopySelection.call(obj);

  // Get elements first and last
  const selectedContainer = obj.selectedContainer;
  if (!selectedContainer || selectedContainer.length < 4) return;

  const x1 = selectedContainer[0];
  const y1 = selectedContainer[1];
  const x2 = selectedContainer[2];
  const y2 = selectedContainer[3];

  if (x3 != null && y3 != null) {
    let px, ux;

    if (x3 - x2 > 0) {
      px = x2 + 1;
      ux = x3;
    } else {
      px = x3;
      ux = x1 - 1;
    }

    let py, uy;

    if (y3 - y2 > 0) {
      py = y2 + 1;
      uy = y3;
    } else {
      py = y3;
      uy = y1 - 1;
    }

    if (ux - px <= uy - py) {
      px = parseInt(x1.toString());
      ux = parseInt(x2.toString());
    } else {
      py = parseInt(y1.toString());
      uy = parseInt(y2.toString());
    }

    for (let j = py; j <= uy; j++) {
      for (let i = px; i <= ux; i++) {
        if (
          obj.records[j][i] &&
          obj.rows[j].element.style.display != "none" &&
          obj.records[j][i].element.style.display != "none"
        ) {
          obj.records[j][i].element.classList.add("selection");
          obj.records[py][i].element.classList.add("selection-top");
          obj.records[uy][i].element.classList.add("selection-bottom");
          obj.records[j][px].element.classList.add("selection-left");
          obj.records[j][ux].element.classList.add("selection-right");

          // Persist selected elements
          if (obj.selection) {
            obj.selection.push(obj.records[j][i].element);
          }
        }
      }
    }
  }
};

const mouseOverControls = function (e: MouseEvent): boolean | void {
  e = e || (window.event as unknown as MouseEvent);

  let mouseButton;

  if (e.buttons) {
    mouseButton = e.buttons;
  } else if (e.button) {
    mouseButton = e.button;
  } else {
    mouseButton = e.which;
  }

  if (!mouseButton) {
    libraryBase.jspreadsheet.isMouseAction = false;
  }

  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (current && libraryBase.jspreadsheet.isMouseAction == true) {
    // Local aliases for optional properties
    const data = current.options.data ?? [];
    const dataRows = data.length;
    const dataCols = (data[0] ? data[0].length : 0) as number;
    const columns = current.options.columns ?? [];
    // Narrow event target early
    const target = getHTMLElement(e.target);
    if (!target) return false;

    // Get elements
    const jssTable = getElement(target);

    if (jssTable[0]) {
      // Avoid cross reference
      if (current != jssTable[0].jssWorksheet) {
        if (current) {
          return false;
        }
      }

      const columnIdAttr = target.getAttribute("data-x");
      let columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
      const rowIdAttr = target.getAttribute("data-y");
      const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
      if (current.resizing || current.dragging) {
      } else {
        // Header found
        if (jssTable[1] == 1) {
          if (current.selectedHeader) {
            const columnIdAttr2 = target.getAttribute("data-x");
            columnId = columnIdAttr2 !== null ? parseInt(columnIdAttr2, 10) : undefined;
            const o = current.selectedHeader as number;
            const d = columnId;
            if (typeof d === "number") {
              // Update selection
              updateSelectionFromCoords.call(
                current,
                o,
                0,
                d,
                dataRows - 1,
                e
              );
            }
          }
        }

        // Body found
        if (jssTable[1] == 2) {
          if (target.classList.contains("jss_row")) {
            if (current.selectedRow != null) {
              const o = current.selectedRow;
              const d = rowId;
              // Update selection
              if (typeof o === "number" && typeof d === "number") {
                updateSelectionFromCoords.call(
                current,
                0,
                o,
                dataCols - 1,
                d,
                e
                );
              }
            }
          } else {
            // Do not select edtion is in progress
            if (!current.edition) {
              if (columnId !== undefined && rowId !== undefined) {
                if (current.selectedCorner) {
                  updateCopySelection.call(current, columnId, rowId);
                } else {
                  if (current.selectedCell) {
                    updateSelectionFromCoords.call(
                      current,
                      current.selectedCell[0],
                      current.selectedCell[1],
                      columnId,
                      rowId,
                      e
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Clear any time control
  if (libraryBase.jspreadsheet.timeControl) {
    clearTimeout(libraryBase.jspreadsheet.timeControl);
    libraryBase.jspreadsheet.timeControl = null;
  }
};

const doubleClickControls = function (e: MouseEvent): void {
  // Narrow target
  const target = getHTMLElement(e.target);
  if (!target) return;

  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (current) {
    const columns = current.options.columns ?? [];
    // Corner action
    if (target.classList.contains("jss_corner")) {
      // Any selected cells
      if (current.highlighted && current.highlighted.length > 0) {
        // Copy from this
        const x1Str = current.highlighted[0].element.getAttribute("data-x");
        const x1 = x1Str ? parseInt(x1Str, 10) : 0;
        const y1 =
          parseInt(
            current.highlighted[current.highlighted.length - 1].element.getAttribute(
              "data-y"
            ) || "0"
          ) + 1;
        // Until this
        const x2Str = current.highlighted[current.highlighted.length - 1].element.getAttribute("data-x");
        const x2 = x2Str ? parseInt(x2Str, 10) : 0;
        const y2 = current.records.length - 1;
        // Execute copy
        if (current.records[y1] && current.records[y1][x1] && current.records[y2] && current.records[y2][x2]) {
          copyData.call(current, current.records[y1][x1].element, current.records[y2][x2].element);
        }
      }
    } else if (target.classList.contains("jss_column_filter")) {
      // Column
      const columnId = target.getAttribute("data-x");
      // Open filter
      if (columnId !== null) {
        openFilter.call(current, columnId);
      }
    } else {
      // Get table
      const jssTable = getElement(target);

      // Double click over header
      if (jssTable[1] == 1 && current.options.columnSorting != false) {
        // Check valid column header coords
        const columnId = target.getAttribute("data-x");
          if (columnId) {
            current.orderBy?.(parseInt(columnId));
          }
      }

      // Double click over body
      if (jssTable[1] == 2 && current.options.editable != false) {
        if (!current.edition) {
          const getCellCoords = function (element: HTMLElement): HTMLElement | undefined {
            if (element.parentNode) {
              const x = element.getAttribute("data-x");
              const y = element.getAttribute("data-y");
              if (x && y) {
                return element;
              } else {
                return getCellCoords(element.parentNode as HTMLElement);
              }
            }
            return undefined;
          };
          const cell = getCellCoords(target);
          if (cell && cell.classList.contains("highlight")) {
            openEditor.call(current, cell, false, e);
          }
        }
      }
    }
  }
};

const pasteControls = function (e: ClipboardEvent): void {
  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (current && current.selectedCell) {
    if (!current.edition) {
      if (current.options.editable != false) {
        if (e && "clipboardData" in e && e.clipboardData) {
          paste.call(
            current,
            current.selectedCell[0],
            current.selectedCell[1],
            e.clipboardData.getData("text")
          );
          e.preventDefault();
        } else if ("clipboardData" in window && (window as Window & { clipboardData: DataTransfer }).clipboardData) {
          paste.call(
            current,
            current.selectedCell[0],
            current.selectedCell[1],
            (window as Window & { clipboardData: DataTransfer }).clipboardData.getData("text")
          );
        }
      }
    }
  }
};

const getRole = function (element: HTMLElement): string {
  if (element.classList.contains("jss_selectall")) {
    return "select-all";
  }

  if (element.classList.contains("jss_corner")) {
    return "fill-handle";
  }

  let tempElement: HTMLElement | null = element;

  while (tempElement && !tempElement.classList.contains("jss_spreadsheet")) {
    if (tempElement.classList.contains("jss_row")) {
      return "row";
    }

    if (tempElement.classList.contains("jss_nested")) {
      return "nested";
    }

    if (tempElement.classList.contains("jtabs-headers")) {
      return "tabs";
    }

    if (tempElement.classList.contains("jtoolbar")) {
      return "toolbar";
    }

    if (tempElement.classList.contains("jss_pagination")) {
      return "pagination";
    }

    if (tempElement.tagName === "TBODY") {
      return "cell";
    }

    if (tempElement.tagName === "TFOOT") {
      return getElementIndex(element) === 0 ? "grid" : "footer";
    }

    if (tempElement.tagName === "THEAD") {
      return "header";
    }

    tempElement = tempElement.parentElement;
  }

  return "applications";
};

const defaultContextMenu = function (
  worksheet: WorksheetInstance,
  x: number,
  y: number,
  role: string
): Array<Record<string, unknown>> {
  const items = [];

  if (role === "header") {
    // Insert a new column
    if (worksheet.options.allowInsertColumn != false) {
      items.push({
        title: jSuites.translate("Insert a new column before"),
        onclick: function () {
          worksheet.insertColumn?.(1, x, true);
        },
      });
    }

    if (worksheet.options.allowInsertColumn != false) {
      items.push({
        title: jSuites.translate("Insert a new column after"),
        onclick: function () {
          worksheet.insertColumn?.(1, x, false);
        },
      });
    }

    // Delete a column
    if (worksheet.options.allowDeleteColumn != false) {
      items.push({
        title: jSuites.translate("Delete selected columns"),
        onclick: function () {
          const selectedColumns = worksheet.getSelectedColumns?.() ?? [];
          const columnToDelete = selectedColumns.length > 0 ? selectedColumns[0] : x;
          if (typeof columnToDelete === "number") {
            worksheet.deleteColumn?.(columnToDelete);
          }
        },
      });
    }

    // Rename column
    if (worksheet.options.allowRenameColumn != false) {
      items.push({
        title: jSuites.translate("Rename this column"),
        onclick: function () {
           const oldValue = worksheet.getHeader?.(x);

           const newValue = prompt(jSuites.translate("Column name"), oldValue as string);
           if (newValue !== null) {
             worksheet.setHeader?.(x, newValue);
           }
        },
      });
    }

    // Sorting
    if (worksheet.options.columnSorting != false) {
      // Line
      items.push({ type: "line" });

      items.push({
        title: jSuites.translate("Order ascending"),
        onclick: function () {
          worksheet.orderBy?.(x, "asc");
        },
      });
      items.push({
        title: jSuites.translate("Order descending"),
        onclick: function () {
          worksheet.orderBy?.(x, "desc");
        },
      });
    }
  }

  if (role === "row" || role === "cell") {
    // Insert new row
    if (worksheet.options.allowInsertRow != false) {
      items.push({
        title: jSuites.translate("Insert a new row before"),
        onclick: function () {
          worksheet.insertRow?.(1, y, true);
        },
      });

      items.push({
        title: jSuites.translate("Insert a new row after"),
        onclick: function () {
          worksheet.insertRow?.(1, y, false);
        },
      });
    }

    if (worksheet.options.allowDeleteRow != false) {
      items.push({
        title: jSuites.translate("Delete selected rows"),
        onclick: function () {
          const selectedRows = worksheet.getSelectedRows?.() ?? [];
          const rowToDelete = selectedRows.length > 0 ? selectedRows[0] : y;
          if (typeof rowToDelete === "number") {
            worksheet.deleteRow?.(rowToDelete);
          }
        },
      });
    }
  }

  if (role === "cell") {
    if (worksheet.options.allowComments != false) {
      items.push({ type: "line" });

      const title = worksheet.records[y][x].element.getAttribute("title") || "";

      items.push({
        title: jSuites.translate(title ? "Edit comments" : "Add comments"),
        onclick: function () {
          const comment = prompt(jSuites.translate("Comments"), title);
            if (comment) {
              worksheet.setComments?.(getCellNameFromCoords(x, y), comment);
            }
        },
      });

      if (title) {
        items.push({
          title: jSuites.translate("Clear comments"),
          onclick: function () {
            worksheet.setComments?.(getCellNameFromCoords(x, y), "");
          },
        });
      }
    }
  }

  // Line
  if (items.length !== 0) {
    items.push({ type: "line" });
  }

  // Copy
  if (role === "header" || role === "row" || role === "cell") {
    items.push({
      title: jSuites.translate("Copy") + "...",
      shortcut: "Ctrl + C",
      onclick: function () {
        copy.call(worksheet, true);
      },
    });

    // Paste
    if (navigator && navigator.clipboard) {
      items.push({
        title: jSuites.translate("Paste") + "...",
        shortcut: "Ctrl + V",
        onclick: function () {
          const selectedCell = worksheet.selectedCell;
          if (selectedCell && selectedCell.length >= 2) {
            navigator.clipboard.readText().then(function (text) {
              if (text) {
                paste.call(
                  worksheet,
                  selectedCell[0],
                  selectedCell[1],
                  text
                );
              }
            });
          }
        },
      });
    }
  }

  // Save
  if (worksheet.parent.config.allowExport != false) {
    items.push({
      title: jSuites.translate("Save as") + "...",
      shortcut: "Ctrl + S",
      onclick: function () {
        worksheet.download?.();
      },
    });
  }

  // About
  if (worksheet.parent.config.about != false) {
    items.push({
      title: jSuites.translate("About"),
      onclick: function () {
        if (
          typeof worksheet.parent.config.about === "undefined" ||
          worksheet.parent.config.about === true
        ) {
          alert(version.print());
        } else {
          alert(worksheet.parent.config.about);
        }
      },
    });
  }

  return items;
};

const getElementIndex = function (element: HTMLElement): number {
  const parentChildren = element.parentElement?.children;

  if (!parentChildren) return -1;

  for (let i = 0; i < parentChildren.length; i++) {
    const currentElement = parentChildren[i];

    if (element === currentElement) {
      return i;
    }
  }

  return -1;
};

const contextMenuControls = function (e: MouseEvent): void {
  e = e || (window.event as unknown as MouseEvent);
  const mouseButton = getMouseButton(e) ?? 0;

      const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
      if (current) {
        const spreadsheet = current.parent;

        if (current.edition) {
          e.preventDefault();
        } else {
          spreadsheet.contextMenu!.contextmenu!.close();

          const targetEl = getHTMLElement(e.target);
          if (!targetEl) return;
          // Local alias for current spreadsheet and its data
          const data = current.options.data ?? [];
          const dataRows = data.length;
          const dataCols = (data[0] ? data[0].length : 0) as number;
          const role = getRole(targetEl);

            let xStr: string | null = null,
              yStr: string | null = null;
            let xNum: number | null = null,
              yNum: number | null = null;

            if (role === "cell") {
              let cellElement: HTMLElement | null = targetEl;
              while (cellElement && cellElement.tagName !== "TD") {
                cellElement = cellElement.parentElement as HTMLElement | null;
              }
              if (!cellElement) return;

              yStr = cellElement.getAttribute("data-y");
              xStr = cellElement.getAttribute("data-x");
              xNum = xStr !== null ? parseInt(xStr, 10) : null;
              yNum = yStr !== null ? parseInt(yStr, 10) : null;

              if (
                xNum === null ||
                yNum === null ||
                !current.selectedCell ||
                !current.selectedCell[0] ||
                !current.selectedCell[1] ||
                !current.selectedCell[2] ||
                !current.selectedCell[3] ||
                xNum < current.selectedCell[0] ||
                xNum > current.selectedCell[2] ||
                yNum < current.selectedCell[1] ||
                yNum > current.selectedCell[3]
              ) {
                if (xNum !== null && yNum !== null) {
                   updateSelectionFromCoords.call(
                     current,
                     xNum,
                     yNum,
                     xNum,
                     yNum,
                     e
                   );
                }
              }
            } else if (role === "row") {
              yStr = targetEl.getAttribute("data-y");
              yNum = yStr !== null ? parseInt(yStr, 10) : null;
              if (yNum !== null) {
                 updateSelectionFromCoords.call(
                   current,
                   0,
                   yNum,
                   dataCols - 1,
                   yNum,
                   e
                 );
              }
            } else if (role === "header") {
              xStr = targetEl.getAttribute("data-x");
              xNum = xStr !== null ? parseInt(xStr, 10) : null;
              if (xNum !== null) {
                 updateSelectionFromCoords.call(
                   current,
                   xNum,
                   0,
                   xNum,
                   dataRows - 1,
                   e
                 );
              }
            } else if (role === "nested") {
              const columns = (targetEl as HTMLElement)
                .getAttribute("data-column")!
                .split(",")
                .map((v) => parseInt(v, 10));

              xNum = getElementIndex(targetEl as HTMLElement) - 1;
              yNum = getElementIndex((targetEl as HTMLElement).parentElement as HTMLElement);

              // Compare against current selection safely
              const sel = current.selectedCell;
              if (
                !sel ||
                columns[0] != sel[0] ||
                columns[columns.length - 1] != sel[2] ||
                sel[1] != null ||
                sel[3] != null
              ) {
                 updateSelectionFromCoords.call(
                   current,
                   columns[0],
                   0,
                   columns[columns.length - 1],
                   dataRows - 1,
                   e
                 );
               }
            } else if (role === "select-all") {
              selectAll.call(current);
            } else if (role === "tabs") {
              xNum = getElementIndex(targetEl as HTMLElement);
            } else if (role === "footer") {
              xNum = getElementIndex(targetEl as HTMLElement) - 1;
              yNum = getElementIndex((targetEl as HTMLElement).parentElement as HTMLElement);
            }

        // Table found
        const xArg = xNum ?? 0;
        const yArg = yNum ?? 0;
        let items = defaultContextMenu(
          current,
          xArg,
          yArg,
          role
        );

        if (typeof spreadsheet.config.contextMenu === "function") {
          const result = spreadsheet.config.contextMenu(
            current,
            xArg,
            yArg,
            e,
            items,
            role,
            xArg,
            yArg
          );

          if (result) {
            items = result;
          } else if (result === false) {
            return;
          }
        }

        // Plugins may provide their own contextMenu hook. Narrow from unknown
        // and validate the return value instead of using `any`.
        const isPluginWithContextMenu = (
          p: unknown
        ): p is { contextMenu: (...args: unknown[]) => unknown } => {
          if (typeof p !== "object" || p === null) return false;
          const c = (p as Record<string, unknown>)["contextMenu"];
          return typeof c === "function";
        };

        if (typeof spreadsheet.plugins === "object" && spreadsheet.plugins !== null) {
          for (const plugin of Object.values(spreadsheet.plugins as Record<string, unknown>)) {
            if (isPluginWithContextMenu(plugin)) {
                const result = plugin.contextMenu(
                  current,
                  xArg,
                  yArg,
                  e,
                  items,
                  role,
                  xArg,
                  yArg
                );

              if (result === false) {
                // Plugin vetoes the menu; abort
                return;
              }

              if (Array.isArray(result)) {
                items = result as Array<Record<string, unknown>>;
              }
            }
          }
        }

        // The id is depending on header and body
        spreadsheet.contextMenu!.contextmenu!.open(e, items);
        // Avoid the real one
        e.preventDefault();
    }
  }
};

const touchStartControls = function (e: TouchEvent): void {
  const jssTable = getElement(getHTMLElement(e.target));

  // Local alias of current to enable narrowing and reduce repeated property access
  let current = libraryBase.jspreadsheet.current as WorksheetInstance | null;

  if (jssTable[0]) {
    if (current != jssTable[0].jssWorksheet) {
      if (current) {
        current.resetSelection?.();
      }
      libraryBase.jspreadsheet.current = jssTable[0].jssWorksheet;
      current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
    }
  } else {
    if (current) {
      current.resetSelection?.();
      libraryBase.jspreadsheet.current = null;
      current = null;
    }
  }

  if (current) {
    if (!current.edition) {
      const target = getHTMLElement(e.target);
      if (!target) return;
      const columnAttr = target.getAttribute("data-x");
      const rowAttr = target.getAttribute("data-y");
      const columnId = columnAttr != null ? parseInt(columnAttr, 10) : null;
      const rowId = rowAttr != null ? parseInt(rowAttr, 10) : null;

      if (columnId !== null && rowId !== null) {
        updateSelectionFromCoords.call(
          current,
          columnId,
          rowId,
          columnId,
          rowId
        );

        libraryBase.jspreadsheet.timeControl = setTimeout(function () {
          const columns = current.options.columns ?? [];
          if (
            columns[columnId] &&
            columns[columnId].type == "color"
          ) {
            libraryBase.jspreadsheet.tmpElement = null;
          } else {
            libraryBase.jspreadsheet.tmpElement = target as HTMLElement;
          }
          openEditor.call(current, target as HTMLElement, false, e);
        }, 500);
      }
    }
  }
};

const touchEndControls = function (e: TouchEvent): void {
  // Clear any time control
  if (libraryBase.jspreadsheet.timeControl) {
    clearTimeout(libraryBase.jspreadsheet.timeControl);
    libraryBase.jspreadsheet.timeControl = null;
    // Element
    if (libraryBase.jspreadsheet.tmpElement) {
      const child0 = libraryBase.jspreadsheet.tmpElement.children[0];
      if (child0 instanceof HTMLElement && child0.tagName === "INPUT") {
        child0.focus();
      }
      libraryBase.jspreadsheet.tmpElement = null;
    }
  }
};

export const cutControls = function (this: WorksheetInstance, e: Event): void {
  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (!current) return;
  if (!current.edition) {
    copy?.call(current, true, undefined, undefined, undefined, undefined, true);
    if (current.options.editable != false && current.highlighted) {
      current.setValue?.(
        current.highlighted.map(function (record: { element: HTMLElement }) {
          return record.element;
        }),
        ""
      );
    }
  }
};

const copyControls = function (this: WorksheetInstance, e: Event): void {
  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (!current) return;
  if (!current.edition) {
    copy.call(current, true);
  }
};

const isMac = function () {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

const isCtrl = function (e: KeyboardEvent): boolean {
  if (isMac()) {
    return e.metaKey;
  } else {
    return e.ctrlKey;
  }
};

const keyDownControls = function (e: KeyboardEvent): void {
  const current = libraryBase.jspreadsheet.current as WorksheetInstance | null;
  if (current) {
    // Local alias for dataset dimensions
    const data = current.options.data ?? [];
    const dataRows = data.length;
    const dataCols = (data[0] ? data[0].length : 0) as number;
    const columns = current.options.columns ?? [];
    if (current.edition) {
      if (e.which == 27) {
        // Escape
        if (current.edition) {
          // Exit without saving
          closeEditor.call(current, current.edition[0], false);
        }
        e.preventDefault();
      } else if (e.which == 13) {
        // Enter
        if (
          columns[current.edition[2]] &&
          columns[current.edition[2]].type == "calendar"
        ) {
          closeEditor.call(current, current.edition[0], true);
        } else if (
          columns[current.edition[2]] &&
          columns[current.edition[2]].type == "dropdown"
        ) {
          // Do nothing
        } else {
          // Alt enter -> do not close editor
          if (
            (current.options.wordWrap == true ||
              (columns[current.edition[2]] &&
                columns[current.edition[2]].wordWrap == true) ||
              (Array.isArray(data) &&
                data[current.edition[3]] &&
                Array.isArray(data[current.edition[3]]) &&
                (data[current.edition[3]] as CellValue[])[current.edition[2]] &&
                ((Array.isArray((data[current.edition[3]] as CellValue[])[current.edition[2]]) || typeof (data[current.edition[3]] as CellValue[])[current.edition[2]] === 'string') && ((data[current.edition[3]] as CellValue[])[current.edition[2]] as ArrayLike<unknown>).length > 200))) &&
            e.altKey
          ) {
            // Add new line to the editor
            const editorTextarea =
              current.edition[0].children[0] as HTMLTextAreaElement;
            let editorValue = editorTextarea.value;
            const editorIndexOf = editorTextarea.selectionStart ?? 0;
            editorValue =
              editorValue.slice(0, editorIndexOf) +
              "\n" +
              editorValue.slice(editorIndexOf);
            editorTextarea.value = editorValue;
            editorTextarea.focus();
            editorTextarea.selectionStart = editorIndexOf + 1;
            editorTextarea.selectionEnd = editorIndexOf + 1;
          } else {
            const el0 = current.edition[0].children[0];
            if (el0 instanceof HTMLElement) {
              (el0 as HTMLInputElement | HTMLTextAreaElement).blur();
            }
          }
        }
      } else if (e.which == 9) {
        // Tab
        if (
          columns[current.edition[2]] &&
          ["calendar", "html"].includes(
            columns[current.edition[2]].type as string
          )
        ) {
          closeEditor.call(current, current.edition[0], true);
        } else {
          const el0 = current.edition[0].children[0];
          if (el0 instanceof HTMLElement) {
            (el0 as HTMLInputElement | HTMLTextAreaElement).blur();
          }
        }
      }
    }

    if (!current.edition && current.selectedCell) {
      // Which key
      if (e.which == 37) {
        left.call(current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 39) {
        right.call(current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 38) {
        up.call(current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 40) {
        down.call(current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 36) {
        first.call(current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 35) {
        last.call(current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 46 || e.which == 8) {
        // Delete
        if (current.options.editable != false) {
          if (current.selectedRow != null) {
            if (current.options.allowDeleteRow != false) {
                if (
                 confirm(
                   jSuites.translate("Are you sure to delete the selected rows?")
                 )
               ) {
                                   if (typeof current.selectedRow === "number") {
                    current.deleteRow?.(current.selectedRow);
                  }
               }
            }
          } else if (current.selectedHeader) {
            if (current.options.allowDeleteColumn != false) {
              if (
                confirm(
                  jSuites.translate(
                    "Are you sure to delete the selected columns?"
                  )
                )
               ) {
                                   if (typeof current.selectedHeader === "number") {
                    current.deleteColumn?.(current.selectedHeader);
                  }
               }
            }
          } else {
            // Change value
            if (current.highlighted) {
              current.setValue?.(
                current.highlighted.map(function (record: { element: HTMLElement }) {
                  return record.element;
                }),
                ""
              );
            }
          }
        }
      } else if (e.which == 13) {
        // Move cursor
        if (e.shiftKey) {
          up.call(current, e.shiftKey, e.ctrlKey);
        } else {
          if (current.options.allowInsertRow != false) {
            if (current.options.allowManualInsertRow != false) {
                 if (current.selectedCell[1] == dataRows - 1) {
                 // New record in case selectedCell in the last row
                                   current.insertRow?.(1);
               }
            }
          }

          down.call(current, e.shiftKey, e.ctrlKey);
        }
        e.preventDefault();
      } else if (e.which == 9) {
        // Tab
        if (e.shiftKey) {
          left.call(current, e.shiftKey, e.ctrlKey);
        } else {
          if (current.options.allowInsertColumn != false) {
            if (current.options.allowManualInsertColumn != false) {
                 if (current.selectedCell[0] == dataCols - 1) {
                 // New record in case selectedCell in the last column
                 current.insertColumn?.();
               }
            }
          }

          right.call(current, e.shiftKey, e.ctrlKey);
        }
        e.preventDefault();
      } else {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
          if (e.which == 65) {
            // Ctrl + A
            selectAll.call(current);
            e.preventDefault();
          } else if (e.which == 83) {
            // Ctrl + S
             current.download?.();
            e.preventDefault();
          } else if (e.which == 89) {
            // Ctrl + Y
             current.redo?.();
            e.preventDefault();
          } else if (e.which == 90) {
            // Ctrl + Z
             current.undo?.();
            e.preventDefault();
          } else if (e.which == 67) {
            // Ctrl + C
            copy.call(current, true);
            e.preventDefault();
          } else if (e.which == 88) {
            // Ctrl + X
            if (current.options.editable != false) {
              cutControls.call(current, e as unknown as Event);
            } else {
              copyControls.call(current, e as unknown as Event);
            }
            e.preventDefault();
          } else if (e.which == 86) {
            // Ctrl + V
            pasteControls.call(current, e as unknown as ClipboardEvent);
          }
        } else {
          if (current.selectedCell) {
            if (current.options.editable != false) {
              const rowId = current.selectedCell[1];
              const columnId = current.selectedCell[0];

              // Characters able to start a edition
              if (e.keyCode == 32) {
                // Space
                e.preventDefault();
                if (
                  columns[columnId] &&
                  (columns[columnId].type == "checkbox" ||
                    columns[columnId].type == "radio")
                ) {
                  setCheckRadioValue.call(current);
                } else {
                  // Start edition
                  openEditor.call(
                    current,
                    current.records[rowId][columnId].element,
                    true,
                    e
                  );
                }
              } else if (e.keyCode == 113) {
                // Start edition with current content F2
                openEditor.call(
                  current,
                  current.records[rowId][columnId].element,
                  false,
                  e
                );
              } else if (
                (e.key.length === 1 || e.key === "Process") &&
                !(e.altKey || isCtrl(e))
              ) {
                // Start edition
                openEditor.call(
                  current,
                  current.records[rowId][columnId].element,
                  true,
                  e
                );
                // Prevent entries in the calendar
                if (
                  columns[columnId] &&
                  columns[columnId].type == "calendar"
                ) {
                  e.preventDefault();
                }
              }
            }
          }
        }
      }
    }
  } else {
    const kdTarget = getHTMLElement(e.target);
    if (kdTarget && kdTarget.classList.contains("jss_search")) {
      if (libraryBase.jspreadsheet.timeControl) {
        clearTimeout(libraryBase.jspreadsheet.timeControl);
      }
      const searchEl = kdTarget as HTMLInputElement;
      libraryBase.jspreadsheet.timeControl = setTimeout(function () {
        const curr = libraryBase.jspreadsheet.current as WorksheetInstance | null;
        if (curr) {
          curr.search?.(searchEl.value);
        }
      }, 200);
    }
  }
};

export const wheelControls = function (this: WorksheetInstance, e: WheelEvent): void {
  const obj = this;

  if (obj.options.lazyLoading == true) {
    if (libraryBase.jspreadsheet.timeControlLoading == null) {
      libraryBase.jspreadsheet.timeControlLoading = setTimeout(function () {
        if (
          obj.content &&
          obj.content.scrollTop + obj.content.clientHeight >=
          obj.content.scrollHeight - 10
        ) {
          if (loadDown.call(obj)) {
            if (
              obj.content &&
              obj.content.scrollTop + obj.content.clientHeight >
              obj.content.scrollHeight - 10
            ) {
              obj.content.scrollTop =
                obj.content.scrollTop - obj.content.clientHeight;
            }
            updateCornerPosition.call(obj);
          }
        } else if (obj.content && obj.content.scrollTop <= obj.content.clientHeight) {
          if (loadUp.call(obj)) {
            if (obj.content.scrollTop < 10) {
              obj.content.scrollTop =
                obj.content.scrollTop + obj.content.clientHeight;
            }
            updateCornerPosition.call(obj);
          }
        }

        libraryBase.jspreadsheet.timeControlLoading = null;
      }, 100);
    }
  }
};

let scrollLeft = 0;

const updateFreezePosition = function (this: WorksheetInstance): void {
  const obj = this;

  if (!obj.content) return;
  scrollLeft = obj.content.scrollLeft;
  let width = 0;
  if (scrollLeft > 50 && obj.options.freezeColumns) {
    for (let i = 0; i < obj.options.freezeColumns; i++) {
      if (i > 0) {
        // Must check if the previous column is hidden or not to determin whether the width shoule be added or not!
        if (
          !obj.options.columns ||
          !obj.options.columns[i - 1] ||
          obj.options.columns[i - 1].type !== "hidden"
        ) {
          let columnWidth;
          if (
            obj.options.columns &&
            obj.options.columns[i - 1] &&
            obj.options.columns[i - 1].width !== undefined
          ) {
            columnWidth = parseInt(String(obj.options.columns[i - 1].width));
          } else {
            columnWidth =
              obj.options.defaultColWidth !== undefined
                ? parseInt(String(obj.options.defaultColWidth))
                : 100;
          }

          width += columnWidth;
        }
      }
      obj.headers[i].classList.add("jss_freezed");
      obj.headers[i].style.left = width + "px";
      for (let j = 0; j < obj.rows.length; j++) {
        if (obj.rows[j] && obj.records[j][i]) {
          const shifted =
            scrollLeft +
            (i > 0 ? parseInt(String(obj.records[j][i - 1].element.style.width)) : 0) -
            51 +
            "px";
          obj.records[j][i].element.classList.add("jss_freezed");
          obj.records[j][i].element.style.left = shifted;
        }
      }
    }
  } else if (obj.options.freezeColumns) {
    for (let i = 0; i < obj.options.freezeColumns; i++) {
      obj.headers[i].classList.remove("jss_freezed");
      obj.headers[i].style.left = "";
      for (let j = 0; j < obj.rows.length; j++) {
        if (obj.records[j][i]) {
          obj.records[j][i].element.classList.remove("jss_freezed");
          obj.records[j][i].element.style.left = "";
        }
      }
    }
  }

  // Place the corner in the correct place
  updateCornerPosition.call(obj);
};

export const scrollControls = function (this: WorksheetInstance, e: Event): void {
  const obj = this;

  wheelControls.call(obj, e as WheelEvent);

  if (obj.options.freezeColumns && obj.options.freezeColumns > 0 && obj.content && obj.content.scrollLeft != scrollLeft) {
    updateFreezePosition.call(obj);
  }

  // Close editor
  if (obj.options.lazyLoading == true || obj.options.tableOverflow == true) {
   if (obj.edition) {
      const t = e.target as HTMLElement | null;
      if (t && typeof t.className === "string" && t.className.substr(0, 9) != "jdropdown") {
        closeEditor.call(obj, obj.edition[0], true);
      }
    }
  }
};

export const setEvents = function (root: HTMLElement): void {
  destroyEvents(root);
  root.addEventListener("mouseup", mouseUpControls);
  root.addEventListener("mousedown", mouseDownControls);
  root.addEventListener("mousemove", mouseMoveControls);
  root.addEventListener("mouseover", mouseOverControls);
  root.addEventListener("dblclick", doubleClickControls);
  root.addEventListener("paste", pasteControls);
  root.addEventListener("contextmenu", contextMenuControls);
  root.addEventListener("touchstart", touchStartControls);
  root.addEventListener("touchend", touchEndControls);
  root.addEventListener("touchcancel", touchEndControls);
  root.addEventListener("touchmove", touchEndControls);
  document.addEventListener("keydown", keyDownControls);
};

export const destroyEvents = function (root: HTMLElement): void {
  root.removeEventListener("mouseup", mouseUpControls);
  root.removeEventListener("mousedown", mouseDownControls);
  root.removeEventListener("mousemove", mouseMoveControls);
  root.removeEventListener("mouseover", mouseOverControls);
  root.removeEventListener("dblclick", doubleClickControls);
  root.removeEventListener("paste", pasteControls);
  root.removeEventListener("contextmenu", contextMenuControls);
  root.removeEventListener("touchstart", touchStartControls);
  root.removeEventListener("touchend", touchEndControls);
  root.removeEventListener("touchcancel", touchEndControls);
  document.removeEventListener("keydown", keyDownControls);
};
