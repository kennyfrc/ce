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
import type { WorksheetInstance } from "../types/core";

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
    if (libraryBase.jspreadsheet.current.resizing) {
      const r = libraryBase.jspreadsheet.current.resizing;
      // Columns to be updated when a numeric column index is present
      if (typeof r.column === "number") {
        const colIndex = r.column;
        // New width
        const newWidth = getAttrInt(
          libraryBase.jspreadsheet.current.cols[colIndex].colElement,
          "width"
        );

        // Columns
        const columns = libraryBase.jspreadsheet.current.getSelectedColumns();
        if (columns.length > 1) {
          const currentWidth: number[] = [];
          for (let i = 0; i < columns.length; i++) {
            currentWidth.push(
              getAttrInt(
                libraryBase.jspreadsheet.current.cols[columns[i]].colElement,
                "width"
              )
            );
          }
          const index = columns.indexOf(colIndex);
          currentWidth[index] = r.width ?? currentWidth[index] ?? 0;
          setWidth.call(
            libraryBase.jspreadsheet.current,
            columns,
            newWidth,
            currentWidth
          );
        } else {
          setWidth.call(
            libraryBase.jspreadsheet.current,
            colIndex,
            newWidth,
            r.width
          );
        }

        // Remove border
        libraryBase.jspreadsheet.current.headers[colIndex].classList.remove(
          "resizing"
        );
        for (
          let j = 0;
          j < libraryBase.jspreadsheet.current.records.length;
          j++
        ) {
          if (libraryBase.jspreadsheet.current.records[j][colIndex]) {
            libraryBase.jspreadsheet.current.records[j][colIndex].element.classList.remove(
              "resizing"
            );
          }
        }
      } else {
        // Row resize
        const rowIndex = r.row as number;
        libraryBase.jspreadsheet.current.rows[rowIndex].element.children[0].classList.remove(
          "resizing"
        );
        const newHeight = getAttrInt(
          libraryBase.jspreadsheet.current.rows[rowIndex].element,
          "height"
        );
        setHeight.call(
          libraryBase.jspreadsheet.current,
          rowIndex,
          newHeight,
          r.height
        );
        // Remove border
        r.element?.classList.remove("resizing");
      }
      // Reset resizing helper
      libraryBase.jspreadsheet.current.resizing = null;
    } else if (libraryBase.jspreadsheet.current.dragging) {
      // Reset dragging helper
      const d = libraryBase.jspreadsheet.current.dragging;
      if (d) {
        if (typeof d.column === "number") {
          // Target
          const columnIdAttr = getAttrSafe(e.target as Element | null, "data-x");
          const columnId = columnIdAttr ? parseInt(columnIdAttr, 10) : undefined;
          const dragCol = d.column;
          // Remove move style
          libraryBase.jspreadsheet.current.headers[dragCol].classList.remove("dragging");
          for (
            let j = 0;
            j < libraryBase.jspreadsheet.current.rows.length;
            j++
          ) {
            if (libraryBase.jspreadsheet.current.records[j][dragCol]) {
              libraryBase.jspreadsheet.current.records[j][dragCol].element.classList.remove(
                "dragging"
              );
            }
          }
          for (
            let i = 0;
            i < libraryBase.jspreadsheet.current.headers.length;
            i++
          ) {
            libraryBase.jspreadsheet.current.headers[i].classList.remove(
              "dragging-left"
            );
            libraryBase.jspreadsheet.current.headers[i].classList.remove(
              "dragging-right"
            );
          }
          // Update position
          if (columnId !== undefined) {
            if (dragCol != d.destination) {
              libraryBase.jspreadsheet.current.moveColumn(dragCol, d.destination);
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
            moveRow.call(libraryBase.jspreadsheet.current, d.row as number, position, true);
          }
          elem?.classList.remove("dragging");
        }
        libraryBase.jspreadsheet.current.dragging = null;
      }
    } else {
      // Close any corner selection
      if (libraryBase.jspreadsheet.current.selectedCorner) {
        libraryBase.jspreadsheet.current.selectedCorner = false;

        // Data to be copied
        if (libraryBase.jspreadsheet.current.selection.length > 0) {
          // Copy data
          copyData.call(
            libraryBase.jspreadsheet.current,
            libraryBase.jspreadsheet.current.selection[0],
            libraryBase.jspreadsheet.current.selection[
              libraryBase.jspreadsheet.current.selection.length - 1
            ]
          );

          // Remove selection
          removeCopySelection.call(libraryBase.jspreadsheet.current);
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

  if (jssTable[0]) {
    if (libraryBase.jspreadsheet.current != jssTable[0].jssWorksheet) {
      if (libraryBase.jspreadsheet.current) {
        if (libraryBase.jspreadsheet.current.edition) {
          closeEditor.call(
            libraryBase.jspreadsheet.current,
            libraryBase.jspreadsheet.current.edition[0],
            true
          );
        }
        libraryBase.jspreadsheet.current.resetSelection();
      }
      libraryBase.jspreadsheet.current = jssTable[0].jssWorksheet;
    }
  } else {
    if (libraryBase.jspreadsheet.current) {
      if (libraryBase.jspreadsheet.current.edition) {
        closeEditor.call(
          libraryBase.jspreadsheet.current,
          libraryBase.jspreadsheet.current.edition[0],
          true
        );
      }

      if (!target.classList.contains("jss_object")) {
        resetSelection.call(libraryBase.jspreadsheet.current, true);
        libraryBase.jspreadsheet.current = null;
      }
    }
  }

    if (libraryBase.jspreadsheet.current && mouseButton == 1) {
    if (target.classList.contains("jss_selectall")) {
      if (libraryBase.jspreadsheet.current) {
        selectAll.call(libraryBase.jspreadsheet.current);
      }
    } else if (target.classList.contains("jss_corner")) {
      if (libraryBase.jspreadsheet.current.options.editable != false) {
        libraryBase.jspreadsheet.current.selectedCorner = true;
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
            libraryBase.jspreadsheet.current.options.columnResize != false &&
            info.width - e.offsetX < 6
          ) {
            // Resize helper
            libraryBase.jspreadsheet.current.resizing = {
              mousePosition: e.pageX,
              column: columnId,
              width: info.width,
            };

            // Border indication
            libraryBase.jspreadsheet.current.headers[columnId].classList.add(
              "resizing"
            );
            for (
              let j = 0;
              j < libraryBase.jspreadsheet.current.records.length;
              j++
            ) {
              if (libraryBase.jspreadsheet.current.records[j][columnId]) {
                libraryBase.jspreadsheet.current.records[j][
                  columnId
                ].element.classList.add("resizing");
              }
            }
          } else if (
            libraryBase.jspreadsheet.current.options.columnDrag != false &&
            info.height - e.offsetY < 6
          ) {
            if (
              isColMerged.call(libraryBase.jspreadsheet.current, columnId)
                .length
            ) {
              console.error(
                "Jspreadsheet: This column is part of a merged cell."
              );
            } else {
              // Reset selection
              libraryBase.jspreadsheet.current.resetSelection();
              // Drag helper
              libraryBase.jspreadsheet.current.dragging = {
                element: target,
                column: columnId,
                destination: columnId,
              };
              // Border indication
              libraryBase.jspreadsheet.current.headers[columnId].classList.add(
                "dragging"
              );
              for (
                let j = 0;
                j < libraryBase.jspreadsheet.current.records.length;
                j++
              ) {
                if (libraryBase.jspreadsheet.current.records[j][columnId]) {
                  libraryBase.jspreadsheet.current.records[j][
                    columnId
                  ].element.classList.add("dragging");
                }
              }
            }
          } else {
            let o, d;

            if (
              libraryBase.jspreadsheet.current.selectedHeader &&
              (e.shiftKey || e.ctrlKey)
            ) {
              o = libraryBase.jspreadsheet.current.selectedHeader;
              d = columnId;
            } else {
              // Press to rename
              if (
                libraryBase.jspreadsheet.current.selectedHeader == columnId &&
                libraryBase.jspreadsheet.current.options.allowRenameColumn !=
                  false
              ) {
                libraryBase.jspreadsheet.timeControl = setTimeout(function () {
                  libraryBase.jspreadsheet.current.setHeader(columnId);
                }, 800);
              }

              // Keep track of which header was selected first
              libraryBase.jspreadsheet.current.selectedHeader = columnId;

              // Update selection single column
              o = columnId;
              d = columnId;
            }

            // Update selection
            updateSelectionFromCoords.call(
              libraryBase.jspreadsheet.current,
              o,
              0,
              d,
              libraryBase.jspreadsheet.current.options.data.length - 1,
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
              c2 = libraryBase.jspreadsheet.current.options.columns.length - 1;
            }
            updateSelectionFromCoords.call(
              libraryBase.jspreadsheet.current,
              c1,
              0,
              c2,
              libraryBase.jspreadsheet.current.options.data.length - 1,
              e
            );
          }
        }
      } else {
        libraryBase.jspreadsheet.current.selectedHeader = false;
      }

      // Body found
      if (jssTable[1] == 2) {
        const rowIdAttr = target.getAttribute("data-y");
        const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;

        if (target.classList.contains("jss_row")) {
          const info = target.getBoundingClientRect();
          if (
            libraryBase.jspreadsheet.current.options.rowResize != false &&
            info.height - e.offsetY < 6
          ) {
            // Resize helper
            libraryBase.jspreadsheet.current.resizing = {
              element: target.parentElement as HTMLElement,
              mousePosition: e.pageY,
              row: rowId,
              height: info.height,
            };
            // Border indication
            target.parentElement?.classList.add("resizing");
          } else if (
            libraryBase.jspreadsheet.current.options.rowDrag != false &&
            info.width - e.offsetX < 6
          ) {
            if (
              isRowMerged.call(libraryBase.jspreadsheet.current, rowId, false)
                .length
            ) {
              console.error("Jspreadsheet: This row is part of a merged cell");
            } else if (
              libraryBase.jspreadsheet.current.options.search == true &&
              libraryBase.jspreadsheet.current.results
            ) {
              console.error(
                "Jspreadsheet: Please clear your search before perform this action"
              );
            } else {
              // Reset selection
              libraryBase.jspreadsheet.current.resetSelection();
                // Drag helper
                libraryBase.jspreadsheet.current.dragging = {
                  element: target.parentElement as HTMLElement,
                  row: rowId,
                  destination: rowId,
                };
                // Border indication
                target.parentElement?.classList.add("dragging");
            }
          } else {
            let o, d;
            if (
              libraryBase.jspreadsheet.current.selectedRow != null &&
              (e.shiftKey || e.ctrlKey)
            ) {
              o = libraryBase.jspreadsheet.current.selectedRow;
              d = rowId;
            } else {
              // Keep track of which header was selected first
              libraryBase.jspreadsheet.current.selectedRow = rowId;

              // Update selection single column
              o = rowId;
              d = rowId;
            }

            // Update selection
            updateSelectionFromCoords.call(
              libraryBase.jspreadsheet.current,
              0,
              o,
              libraryBase.jspreadsheet.current.options.data[0].length - 1,
              d,
              e
            );
          }
        } else {
          // Jclose
            if (
              target.classList.contains("jclose") &&
              target.clientWidth - e.offsetX < 50 &&
              e.offsetY < 50
            ) {
            closeEditor.call(
              libraryBase.jspreadsheet.current,
              libraryBase.jspreadsheet.current.edition[0],
              true
            );
          } else {
            const getCellCoords = function (
              element: HTMLElement
            ): [string, string] | undefined {
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
              if (libraryBase.jspreadsheet.current.edition) {
                if (
                  libraryBase.jspreadsheet.current.edition[2] != columnId ||
                  libraryBase.jspreadsheet.current.edition[3] != rowId
                ) {
                  closeEditor.call(
                    libraryBase.jspreadsheet.current,
                    libraryBase.jspreadsheet.current.edition[0],
                    true
                  );
                }
              }

              if (!libraryBase.jspreadsheet.current.edition) {
                // Update cell selection
                if (
                  e.shiftKey &&
                  libraryBase.jspreadsheet.current.selectedCell
                ) {
                  updateSelectionFromCoords.call(
                    libraryBase.jspreadsheet.current,
                    libraryBase.jspreadsheet.current.selectedCell[0],
                    libraryBase.jspreadsheet.current.selectedCell[1],
                    columnId,
                    rowId,
                    e
                  );
                } else {
                  updateSelectionFromCoords.call(
                    libraryBase.jspreadsheet.current,
                    columnId,
                    rowId,
                    columnId,
                    rowId,
                    e
                  );
                }
              }

              // No full row selected
              libraryBase.jspreadsheet.current.selectedHeader = null;
              libraryBase.jspreadsheet.current.selectedRow = null;
            }
          }
        }
      } else {
        libraryBase.jspreadsheet.current.selectedRow = false;
      }

      // Pagination
      if (target.classList.contains("jss_page")) {
        if (target.textContent == "<") {
          libraryBase.jspreadsheet.current.page(0);
        } else if (target.textContent == ">") {
          const titleAttr = target.getAttribute("title");
          libraryBase.jspreadsheet.current.page(
            titleAttr !== null ? parseInt(titleAttr, 10) - 1 : 0
          );
        } else {
          libraryBase.jspreadsheet.current.page(
            target.textContent ? parseInt(target.textContent, 10) - 1 : 0
          );
        }
      }
    }

    if (libraryBase.jspreadsheet.current.edition) {
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

  if (libraryBase.jspreadsheet.current) {
    if (libraryBase.jspreadsheet.isMouseAction == true) {
      // Resizing is ongoing
      if (libraryBase.jspreadsheet.current.resizing) {
        if (libraryBase.jspreadsheet.current.resizing.column) {
          const width =
            e.pageX - libraryBase.jspreadsheet.current.resizing.mousePosition;

          if (libraryBase.jspreadsheet.current.resizing.width + width > 0) {
            const tempWidth =
              libraryBase.jspreadsheet.current.resizing.width + width;
            libraryBase.jspreadsheet.current.cols[
              libraryBase.jspreadsheet.current.resizing.column
            ].colElement.setAttribute("width", tempWidth);

            updateCornerPosition.call(libraryBase.jspreadsheet.current);
          }
        } else {
          const height =
            e.pageY - libraryBase.jspreadsheet.current.resizing.mousePosition;

          if (libraryBase.jspreadsheet.current.resizing.height + height > 0) {
            const tempHeight =
              libraryBase.jspreadsheet.current.resizing.height + height;
            libraryBase.jspreadsheet.current.rows[
              libraryBase.jspreadsheet.current.resizing.row
            ].element.setAttribute("height", tempHeight);

            updateCornerPosition.call(libraryBase.jspreadsheet.current);
          }
        }
      } else if (libraryBase.jspreadsheet.current.dragging) {
        if (libraryBase.jspreadsheet.current.dragging.column) {
          const columnIdAttr = target.getAttribute("data-x");
          const columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
          if (columnId !== undefined) {
            if (
              isColMerged.call(libraryBase.jspreadsheet.current, columnId)
                .length
            ) {
              console.error(
                "Jspreadsheet: This column is part of a merged cell."
              );
            } else {
              for (
                let i = 0;
                i < libraryBase.jspreadsheet.current.headers.length;
                i++
              ) {
                libraryBase.jspreadsheet.current.headers[i].classList.remove(
                  "dragging-left"
                );
                libraryBase.jspreadsheet.current.headers[i].classList.remove(
                  "dragging-right"
                );
              }

                if (
                  libraryBase.jspreadsheet.current.dragging.column == columnId
                ) {
                  libraryBase.jspreadsheet.current.dragging.destination =
                    columnId;
                } else {
                   if (target.clientWidth / 2 > e.offsetX) {
                    if (
                      libraryBase.jspreadsheet.current.dragging.column < columnId
                    ) {
                      libraryBase.jspreadsheet.current.dragging.destination =
                        columnId - 1;
                    } else {
                      libraryBase.jspreadsheet.current.dragging.destination =
                        columnId;
                    }
                     libraryBase.jspreadsheet.current.headers[
                       columnId
                     ].classList.add("dragging-left");
                  } else {
                     if (
                       libraryBase.jspreadsheet.current.dragging.column < columnId
                     ) {
                      libraryBase.jspreadsheet.current.dragging.destination =
                        columnId;
                    } else {
                      libraryBase.jspreadsheet.current.dragging.destination =
                        columnId + 1;
                    }
                     libraryBase.jspreadsheet.current.headers[
                       columnId
                     ].classList.add("dragging-right");
                  }
                }
            }
          }
        } else {
          const rowIdAttr = target.getAttribute("data-y");
          const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
          if (rowId !== undefined) {
            if (
              isRowMerged.call(libraryBase.jspreadsheet.current, rowId, false)
                .length
            ) {
              console.error("Jspreadsheet: This row is part of a merged cell.");
            } else {
               const siblingTarget =
                 target.clientHeight / 2 > e.offsetY
                   ? (target.parentElement?.nextSibling as Node | null)
                   : (target.parentElement as Node | null);
               const container = target.parentElement?.parentElement as Node | null;
                const dragEl = libraryBase.jspreadsheet.current.dragging.element as Node | null;
                if (dragEl && dragEl != siblingTarget && container) {
                  container.insertBefore(dragEl, siblingTarget);
                  if (dragEl.parentNode) {
                    libraryBase.jspreadsheet.current.dragging.destination =
                      Array.prototype.indexOf.call(dragEl.parentNode.children, dragEl);
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

      if (libraryBase.jspreadsheet.current.cursor) {
        libraryBase.jspreadsheet.current.cursor.style.cursor = "";
        libraryBase.jspreadsheet.current.cursor = null;
      }

      const grandParent = target.parentElement?.parentElement;
      if (grandParent && typeof grandParent.className === "string") {
        if (grandParent.classList.contains("resizable")) {
          if (target && x && !y && rect.width - (e.clientX - rect.left) < 6) {
            libraryBase.jspreadsheet.current.cursor = target;
            libraryBase.jspreadsheet.current.cursor.style.cursor = "col-resize";
          } else if (!x && y && rect.height - (e.clientY - rect.top) < 6) {
            libraryBase.jspreadsheet.current.cursor = target;
            libraryBase.jspreadsheet.current.cursor.style.cursor = "row-resize";
          }
        }

        if (grandParent.classList.contains("draggable")) {
          if (!x && y && rect.width - (e.clientX - rect.left) < 6) {
            libraryBase.jspreadsheet.current.cursor = target;
            libraryBase.jspreadsheet.current.cursor.style.cursor = "move";
          } else if (x && !y && rect.height - (e.clientY - rect.top) < 6) {
            libraryBase.jspreadsheet.current.cursor = target;
            libraryBase.jspreadsheet.current.cursor.style.cursor = "move";
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
  const x1 = obj.selectedContainer[0];
  const y1 = obj.selectedContainer[1];
  const x2 = obj.selectedContainer[2];
  const y2 = obj.selectedContainer[3];

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
      px = parseInt(x1);
      ux = parseInt(x2);
    } else {
      py = parseInt(y1);
      uy = parseInt(y2);
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
          obj.selection.push(obj.records[j][i].element);
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

  if (
    libraryBase.jspreadsheet.current &&
    libraryBase.jspreadsheet.isMouseAction == true
  ) {
    // Narrow event target early
    const target = getHTMLElement(e.target);
    if (!target) return false;

    // Get elements
    const jssTable = getElement(target);

    if (jssTable[0]) {
      // Avoid cross reference
      if (libraryBase.jspreadsheet.current != jssTable[0].jssWorksheet) {
        if (libraryBase.jspreadsheet.current) {
          return false;
        }
      }

      const columnIdAttr = target.getAttribute("data-x");
      let columnId = columnIdAttr !== null ? parseInt(columnIdAttr, 10) : undefined;
      const rowIdAttr = target.getAttribute("data-y");
      const rowId = rowIdAttr !== null ? parseInt(rowIdAttr, 10) : undefined;
      if (
        libraryBase.jspreadsheet.current.resizing ||
        libraryBase.jspreadsheet.current.dragging
      ) {
      } else {
        // Header found
        if (jssTable[1] == 1) {
        if (libraryBase.jspreadsheet.current.selectedHeader) {
            const columnIdAttr2 = target.getAttribute("data-x");
            columnId = columnIdAttr2 !== null ? parseInt(columnIdAttr2, 10) : undefined;
            const o = libraryBase.jspreadsheet.current.selectedHeader as number;
            const d = columnId;
            if (typeof d === "number") {
              // Update selection
              updateSelectionFromCoords.call(
                libraryBase.jspreadsheet.current,
                o,
                0,
                d,
                libraryBase.jspreadsheet.current.options.data.length - 1,
                e
              );
            }
          }
        }

        // Body found
        if (jssTable[1] == 2) {
          if (target.classList.contains("jss_row")) {
            if (libraryBase.jspreadsheet.current.selectedRow != null) {
              const o = libraryBase.jspreadsheet.current.selectedRow;
              const d = rowId;
              // Update selection
              if (typeof d === "number") {
                updateSelectionFromCoords.call(
                  libraryBase.jspreadsheet.current,
                  0,
                  o,
                  libraryBase.jspreadsheet.current.options.data[0].length - 1,
                  d,
                  e
                );
              }
            }
          } else {
            // Do not select edtion is in progress
            if (!libraryBase.jspreadsheet.current.edition) {
                if (columnId !== undefined && rowId !== undefined) {
                if (libraryBase.jspreadsheet.current.selectedCorner) {
                  updateCopySelection.call(
                    libraryBase.jspreadsheet.current,
                    columnId,
                    rowId
                  );
                } else {
                  if (libraryBase.jspreadsheet.current.selectedCell) {
                    updateSelectionFromCoords.call(
                      libraryBase.jspreadsheet.current,
                      libraryBase.jspreadsheet.current.selectedCell[0],
                      libraryBase.jspreadsheet.current.selectedCell[1],
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

  // Jss is selected
  if (libraryBase.jspreadsheet.current) {
    // Corner action
    if (target.classList.contains("jss_corner")) {
      // Any selected cells
      if (libraryBase.jspreadsheet.current.highlighted.length > 0) {
        // Copy from this
        const x1 =
          libraryBase.jspreadsheet.current.highlighted[0].element.getAttribute(
            "data-x"
          );
        const y1 =
          parseInt(
            libraryBase.jspreadsheet.current.highlighted[
              libraryBase.jspreadsheet.current.highlighted.length - 1
            ].element.getAttribute("data-y")
          ) + 1;
        // Until this
        const x2 =
          libraryBase.jspreadsheet.current.highlighted[
            libraryBase.jspreadsheet.current.highlighted.length - 1
          ].element.getAttribute("data-x");
        const y2 = libraryBase.jspreadsheet.current.records.length - 1;
        // Execute copy
        copyData.call(
          libraryBase.jspreadsheet.current,
          libraryBase.jspreadsheet.current.records[y1][x1].element,
          libraryBase.jspreadsheet.current.records[y2][x2].element
        );
      }
    } else if (target.classList.contains("jss_column_filter")) {
      // Column
      const columnId = target.getAttribute("data-x");
      // Open filter
      openFilter.call(libraryBase.jspreadsheet.current, columnId);
    } else {
      // Get table
      const jssTable = getElement(target);

      // Double click over header
      if (
        jssTable[1] == 1 &&
        libraryBase.jspreadsheet.current.options.columnSorting != false
      ) {
        // Check valid column header coords
        const columnId = target.getAttribute("data-x");
        if (columnId) {
          libraryBase.jspreadsheet.current.orderBy(parseInt(columnId));
        }
      }

      // Double click over body
      if (
        jssTable[1] == 2 &&
        libraryBase.jspreadsheet.current.options.editable != false
      ) {
        if (!libraryBase.jspreadsheet.current.edition) {
          const getCellCoords = function (
            element: HTMLElement
          ): HTMLElement | undefined {
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
             openEditor.call(libraryBase.jspreadsheet.current, cell, false, e);
           }
        }
      }
    }
  }
};

const pasteControls = function (e: ClipboardEvent): void {
  if (
    libraryBase.jspreadsheet.current &&
    libraryBase.jspreadsheet.current.selectedCell
  ) {
    if (!libraryBase.jspreadsheet.current.edition) {
      if (libraryBase.jspreadsheet.current.options.editable != false) {
        if (e && 'clipboardData' in e && e.clipboardData) {
          paste.call(
            libraryBase.jspreadsheet.current,
            libraryBase.jspreadsheet.current.selectedCell[0],
            libraryBase.jspreadsheet.current.selectedCell[1],
            e.clipboardData.getData("text")
          );
          e.preventDefault();
        } else if ((window as any).clipboardData) {
          paste.call(
            libraryBase.jspreadsheet.current,
            libraryBase.jspreadsheet.current.selectedCell[0],
            libraryBase.jspreadsheet.current.selectedCell[1],
            (window as any).clipboardData.getData("text")
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
          worksheet.insertColumn(1, x, 1);
        },
      });
    }

    if (worksheet.options.allowInsertColumn != false) {
      items.push({
        title: jSuites.translate("Insert a new column after"),
        onclick: function () {
          worksheet.insertColumn(1, x, 0);
        },
      });
    }

    // Delete a column
    if (worksheet.options.allowDeleteColumn != false) {
      items.push({
        title: jSuites.translate("Delete selected columns"),
        onclick: function () {
          worksheet.deleteColumn(
            worksheet.getSelectedColumns().length ? undefined : x
          );
        },
      });
    }

    // Rename column
    if (worksheet.options.allowRenameColumn != false) {
      items.push({
        title: jSuites.translate("Rename this column"),
        onclick: function () {
          const oldValue = worksheet.getHeader(x);

          const newValue = prompt(jSuites.translate("Column name"), oldValue);

          worksheet.setHeader(x, newValue);
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
          worksheet.orderBy(x, 0);
        },
      });
      items.push({
        title: jSuites.translate("Order descending"),
        onclick: function () {
          worksheet.orderBy(x, 1);
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
          worksheet.insertRow(1, y, 1);
        },
      });

      items.push({
        title: jSuites.translate("Insert a new row after"),
        onclick: function () {
          worksheet.insertRow(1, y);
        },
      });
    }

    if (worksheet.options.allowDeleteRow != false) {
      items.push({
        title: jSuites.translate("Delete selected rows"),
        onclick: function () {
          worksheet.deleteRow(
            worksheet.getSelectedRows().length ? undefined : y
          );
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
            worksheet.setComments(getCellNameFromCoords(x, y), comment);
          }
        },
      });

      if (title) {
        items.push({
          title: jSuites.translate("Clear comments"),
          onclick: function () {
            worksheet.setComments(getCellNameFromCoords(x, y), "");
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
          if (worksheet.selectedCell) {
            navigator.clipboard.readText().then(function (text) {
              if (text) {
                paste.call(
                  worksheet,
                  worksheet.selectedCell[0],
                  worksheet.selectedCell[1],
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
        worksheet.download();
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

      if (libraryBase.jspreadsheet.current) {
        const spreadsheet = libraryBase.jspreadsheet.current.parent;

        if (libraryBase.jspreadsheet.current.edition) {
          e.preventDefault();
        } else {
          spreadsheet.contextMenu!.contextmenu!.close();

          if (libraryBase.jspreadsheet.current) {
            const targetEl = getHTMLElement(e.target);
            if (!targetEl) return;
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
                !libraryBase.jspreadsheet.current.selectedCell ||
                xNum < parseInt(libraryBase.jspreadsheet.current.selectedCell[0]) ||
                xNum > parseInt(libraryBase.jspreadsheet.current.selectedCell[2]) ||
                yNum < parseInt(libraryBase.jspreadsheet.current.selectedCell[1]) ||
                yNum > parseInt(libraryBase.jspreadsheet.current.selectedCell[3])
              ) {
                if (xNum !== null && yNum !== null) {
                  updateSelectionFromCoords.call(
                    libraryBase.jspreadsheet.current,
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
                  libraryBase.jspreadsheet.current,
                  0,
                  yNum,
                  libraryBase.jspreadsheet.current.options.data[0].length - 1,
                  yNum,
                  e
                );
              }
            } else if (role === "header") {
              xStr = targetEl.getAttribute("data-x");
              xNum = xStr !== null ? parseInt(xStr, 10) : null;
              if (xNum !== null) {
                updateSelectionFromCoords.call(
                  libraryBase.jspreadsheet.current,
                  xNum,
                  0,
                  xNum,
                  libraryBase.jspreadsheet.current.options.data.length - 1,
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

              if (
                columns[0] != parseInt(libraryBase.jspreadsheet.current.selectedCell[0]) ||
                columns[columns.length - 1] != parseInt(libraryBase.jspreadsheet.current.selectedCell[2]) ||
                libraryBase.jspreadsheet.current.selectedCell[1] != null ||
                libraryBase.jspreadsheet.current.selectedCell[3] != null
              ) {
                updateSelectionFromCoords.call(
                  libraryBase.jspreadsheet.current,
                  columns[0],
                  0,
                  columns[columns.length - 1],
                  libraryBase.jspreadsheet.current.options.data.length - 1,
                  e
                );
              }
            } else if (role === "select-all") {
              selectAll.call(libraryBase.jspreadsheet.current);
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
          libraryBase.jspreadsheet.current,
          xArg,
          yArg,
          role
        );

        if (typeof spreadsheet.config.contextMenu === "function") {
          const result = spreadsheet.config.contextMenu(
            libraryBase.jspreadsheet.current,
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
                  libraryBase.jspreadsheet.current,
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
  }
};

const touchStartControls = function (e: TouchEvent): void {
  const jssTable = getElement(getHTMLElement(e.target));

  if (jssTable[0]) {
    if (libraryBase.jspreadsheet.current != jssTable[0].jssWorksheet) {
      if (libraryBase.jspreadsheet.current) {
        libraryBase.jspreadsheet.current.resetSelection();
      }
      libraryBase.jspreadsheet.current = jssTable[0].jssWorksheet;
    }
  } else {
    if (libraryBase.jspreadsheet.current) {
      libraryBase.jspreadsheet.current.resetSelection();
      libraryBase.jspreadsheet.current = null;
    }
  }

  if (libraryBase.jspreadsheet.current) {
    if (!libraryBase.jspreadsheet.current.edition) {
      const target = getHTMLElement(e.target);
      if (!target) return;
      const columnAttr = target.getAttribute("data-x");
      const rowAttr = target.getAttribute("data-y");
      const columnId = columnAttr != null ? parseInt(columnAttr, 10) : null;
      const rowId = rowAttr != null ? parseInt(rowAttr, 10) : null;

      if (columnId !== null && rowId !== null) {
        updateSelectionFromCoords.call(
          libraryBase.jspreadsheet.current,
          columnId,
          rowId,
          columnId,
          rowId
        );

        libraryBase.jspreadsheet.timeControl = setTimeout(function () {
          if (
            libraryBase.jspreadsheet.current.options.columns[columnId].type ==
            "color"
          ) {
            libraryBase.jspreadsheet.tmpElement = null;
          } else {
            libraryBase.jspreadsheet.tmpElement = target as HTMLElement;
          }
          openEditor.call(libraryBase.jspreadsheet.current, target as HTMLElement, false, e);
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
  if (libraryBase.jspreadsheet.current) {
    if (!libraryBase.jspreadsheet.current.edition) {
      copy.call(
        libraryBase.jspreadsheet.current,
        true,
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
  if (libraryBase.jspreadsheet.current.options.editable != false) {
        libraryBase.jspreadsheet.current.setValue(
          libraryBase.jspreadsheet.current.highlighted.map(function (
            record: { element: HTMLElement }
          ) {
            return record.element;
          }),
          ""
        );
      }
    }
  }
};

const copyControls = function (this: WorksheetInstance, e: Event): void {
  if (libraryBase.jspreadsheet.current) {
    if (!libraryBase.jspreadsheet.current.edition) {
      copy.call(libraryBase.jspreadsheet.current, true);
    }
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
  if (libraryBase.jspreadsheet.current) {
    if (libraryBase.jspreadsheet.current.edition) {
      if (e.which == 27) {
        // Escape
        if (libraryBase.jspreadsheet.current.edition) {
          // Exit without saving
          closeEditor.call(
            libraryBase.jspreadsheet.current,
            libraryBase.jspreadsheet.current.edition[0],
            false
          );
        }
        e.preventDefault();
      } else if (e.which == 13) {
        // Enter
        if (
          libraryBase.jspreadsheet.current.options.columns &&
          libraryBase.jspreadsheet.current.options.columns[
            libraryBase.jspreadsheet.current.edition[2]
          ] &&
          libraryBase.jspreadsheet.current.options.columns[
            libraryBase.jspreadsheet.current.edition[2]
          ].type == "calendar"
        ) {
          closeEditor.call(
            libraryBase.jspreadsheet.current,
            libraryBase.jspreadsheet.current.edition[0],
            true
          );
        } else if (
          libraryBase.jspreadsheet.current.options.columns &&
          libraryBase.jspreadsheet.current.options.columns[
            libraryBase.jspreadsheet.current.edition[2]
          ] &&
          libraryBase.jspreadsheet.current.options.columns[
            libraryBase.jspreadsheet.current.edition[2]
          ].type == "dropdown"
        ) {
          // Do nothing
        } else {
          // Alt enter -> do not close editor
          if (
            (libraryBase.jspreadsheet.current.options.wordWrap == true ||
              (libraryBase.jspreadsheet.current.options.columns &&
                libraryBase.jspreadsheet.current.options.columns[
                  libraryBase.jspreadsheet.current.edition[2]
                ] &&
                libraryBase.jspreadsheet.current.options.columns[
                  libraryBase.jspreadsheet.current.edition[2]
                ].wordWrap == true) ||
              (libraryBase.jspreadsheet.current.options.data[
                libraryBase.jspreadsheet.current.edition[3]
              ][libraryBase.jspreadsheet.current.edition[2]] &&
                libraryBase.jspreadsheet.current.options.data[
                  libraryBase.jspreadsheet.current.edition[3]
                ][libraryBase.jspreadsheet.current.edition[2]].length > 200)) &&
            e.altKey
          ) {
            // Add new line to the editor
            const editorTextarea =
              libraryBase.jspreadsheet.current.edition[0].children[0] as HTMLTextAreaElement;
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
            {
              const el0 = libraryBase.jspreadsheet.current.edition[0].children[0];
              if (el0 instanceof HTMLElement) {
                (el0 as HTMLInputElement | HTMLTextAreaElement).blur();
              }
            }
          }
        }
      } else if (e.which == 9) {
        // Tab
        if (
          libraryBase.jspreadsheet.current.options.columns &&
          libraryBase.jspreadsheet.current.options.columns[
            libraryBase.jspreadsheet.current.edition[2]
          ] &&
          ["calendar", "html"].includes(
            libraryBase.jspreadsheet.current.options.columns[
              libraryBase.jspreadsheet.current.edition[2]
            ].type
          )
        ) {
          closeEditor.call(
            libraryBase.jspreadsheet.current,
            libraryBase.jspreadsheet.current.edition[0],
            true
          );
        } else {
          {
            const el0 = libraryBase.jspreadsheet.current.edition[0].children[0];
            if (el0 instanceof HTMLElement) {
              (el0 as HTMLInputElement | HTMLTextAreaElement).blur();
            }
          }
        }
      }
    }

    if (
      !libraryBase.jspreadsheet.current.edition &&
      libraryBase.jspreadsheet.current.selectedCell
    ) {
      // Which key
      if (e.which == 37) {
        left.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 39) {
        right.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 38) {
        up.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 40) {
        down.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 36) {
        first.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 35) {
        last.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        e.preventDefault();
      } else if (e.which == 46 || e.which == 8) {
        // Delete
        if (libraryBase.jspreadsheet.current.options.editable != false) {
          if (libraryBase.jspreadsheet.current.selectedRow != null) {
            if (
              libraryBase.jspreadsheet.current.options.allowDeleteRow != false
            ) {
              if (
                confirm(
                  jSuites.translate("Are you sure to delete the selected rows?")
                )
              ) {
                libraryBase.jspreadsheet.current.deleteRow();
              }
            }
          } else if (libraryBase.jspreadsheet.current.selectedHeader) {
            if (
              libraryBase.jspreadsheet.current.options.allowDeleteColumn !=
              false
            ) {
              if (
                confirm(
                  jSuites.translate(
                    "Are you sure to delete the selected columns?"
                  )
                )
              ) {
                libraryBase.jspreadsheet.current.deleteColumn();
              }
            }
          } else {
            // Change value
            libraryBase.jspreadsheet.current.setValue(
              libraryBase.jspreadsheet.current.highlighted.map(function (
                record: { element: HTMLElement }
              ) {
                return record.element;
              }),
              ""
            );
          }
        }
      } else if (e.which == 13) {
        // Move cursor
        if (e.shiftKey) {
          up.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        } else {
          if (
            libraryBase.jspreadsheet.current.options.allowInsertRow != false
          ) {
            if (
              libraryBase.jspreadsheet.current.options.allowManualInsertRow !=
              false
            ) {
              if (
                libraryBase.jspreadsheet.current.selectedCell[1] ==
                libraryBase.jspreadsheet.current.options.data.length - 1
              ) {
                // New record in case selectedCell in the last row
                libraryBase.jspreadsheet.current.insertRow();
              }
            }
          }

          down.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        }
        e.preventDefault();
      } else if (e.which == 9) {
        // Tab
        if (e.shiftKey) {
          left.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        } else {
          if (
            libraryBase.jspreadsheet.current.options.allowInsertColumn != false
          ) {
            if (
              libraryBase.jspreadsheet.current.options
                .allowManualInsertColumn != false
            ) {
              if (
                libraryBase.jspreadsheet.current.selectedCell[0] ==
                libraryBase.jspreadsheet.current.options.data[0].length - 1
              ) {
                // New record in case selectedCell in the last column
                libraryBase.jspreadsheet.current.insertColumn();
              }
            }
          }

          right.call(libraryBase.jspreadsheet.current, e.shiftKey, e.ctrlKey);
        }
        e.preventDefault();
      } else {
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
          if (e.which == 65) {
            // Ctrl + A
            selectAll.call(libraryBase.jspreadsheet.current);
            e.preventDefault();
          } else if (e.which == 83) {
            // Ctrl + S
            libraryBase.jspreadsheet.current.download();
            e.preventDefault();
          } else if (e.which == 89) {
            // Ctrl + Y
            libraryBase.jspreadsheet.current.redo();
            e.preventDefault();
          } else if (e.which == 90) {
            // Ctrl + Z
            libraryBase.jspreadsheet.current.undo();
            e.preventDefault();
          } else if (e.which == 67) {
            // Ctrl + C
            copy.call(libraryBase.jspreadsheet.current, true);
            e.preventDefault();
          } else if (e.which == 88) {
            // Ctrl + X
            if (libraryBase.jspreadsheet.current.options.editable != false) {
              cutControls.call(libraryBase.jspreadsheet.current, e);
            } else {
              copyControls.call(libraryBase.jspreadsheet.current, e);
            }
            e.preventDefault();
          } else if (e.which == 86) {
            // Ctrl + V
            pasteControls.call(libraryBase.jspreadsheet.current, e);
          }
        } else {
          if (libraryBase.jspreadsheet.current.selectedCell) {
            if (libraryBase.jspreadsheet.current.options.editable != false) {
              const rowId = libraryBase.jspreadsheet.current.selectedCell[1];
              const columnId = libraryBase.jspreadsheet.current.selectedCell[0];

              // Characters able to start a edition
              if (e.keyCode == 32) {
                // Space
                e.preventDefault();
                if (
                  libraryBase.jspreadsheet.current.options.columns[columnId]
                    .type == "checkbox" ||
                  libraryBase.jspreadsheet.current.options.columns[columnId]
                    .type == "radio"
                ) {
                  setCheckRadioValue.call(libraryBase.jspreadsheet.current);
                } else {
                  // Start edition
                  openEditor.call(
                    libraryBase.jspreadsheet.current,
                    libraryBase.jspreadsheet.current.records[rowId][columnId]
                      .element,
                    true,
                    e
                  );
                }
              } else if (e.keyCode == 113) {
                // Start edition with current content F2
                openEditor.call(
                  libraryBase.jspreadsheet.current,
                  libraryBase.jspreadsheet.current.records[rowId][columnId]
                    .element,
                  false,
                  e
                );
              } else if (
                (e.key.length === 1 || e.key === "Process") &&
                !(e.altKey || isCtrl(e))
              ) {
                // Start edition
                openEditor.call(
                  libraryBase.jspreadsheet.current,
                  libraryBase.jspreadsheet.current.records[rowId][columnId]
                    .element,
                  true,
                  e
                );
                // Prevent entries in the calendar
                if (
                  libraryBase.jspreadsheet.current.options.columns &&
                  libraryBase.jspreadsheet.current.options.columns[columnId] &&
                  libraryBase.jspreadsheet.current.options.columns[columnId]
                    .type == "calendar"
                ) {
                  e.preventDefault();
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
          libraryBase.jspreadsheet.current.search(searchEl.value);
        }, 200);
      }
    }
  }
};

export const wheelControls = function (this: WorksheetInstance, e: WheelEvent): void {
  const obj = this;

  if (obj.options.lazyLoading == true) {
    if (libraryBase.jspreadsheet.timeControlLoading == null) {
      libraryBase.jspreadsheet.timeControlLoading = setTimeout(function () {
        if (
          obj.content.scrollTop + obj.content.clientHeight >=
          obj.content.scrollHeight - 10
        ) {
          if (loadDown.call(obj)) {
            if (
              obj.content.scrollTop + obj.content.clientHeight >
              obj.content.scrollHeight - 10
            ) {
              obj.content.scrollTop =
                obj.content.scrollTop - obj.content.clientHeight;
            }
            updateCornerPosition.call(obj);
          }
        } else if (obj.content.scrollTop <= obj.content.clientHeight) {
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

  scrollLeft = obj.content.scrollLeft;
  let width = 0;
  if (scrollLeft > 50) {
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
            columnWidth = parseInt(obj.options.columns[i - 1].width);
          } else {
            columnWidth =
              obj.options.defaultColWidth !== undefined
                ? parseInt(obj.options.defaultColWidth)
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
            (i > 0 ? obj.records[j][i - 1].element.style.width : 0) -
            51 +
            "px";
          obj.records[j][i].element.classList.add("jss_freezed");
          obj.records[j][i].element.style.left = shifted;
        }
      }
    }
  } else {
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

  if (obj.options.freezeColumns > 0 && obj.content.scrollLeft != scrollLeft) {
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
