export function updateCornerPosition(): void;
export function resetSelection(blur: any): number;
export class resetSelection {
    constructor(blur: any);
    highlighted: any[];
    selectedCell: any;
}
export function updateSelection(el1: any, el2: any, origin: any): void;
export function removeCopyingSelection(): void;
export function updateSelectionFromCoords(x1: any, y1: any, x2: any, y2: any, origin: any): false | undefined;
export class updateSelectionFromCoords {
    constructor(x1: any, y1: any, x2: any, y2: any, origin: any);
    selectedCell: any[];
    selectedContainer: (number | null)[];
}
export function getSelectedColumns(visibleOnly: any): number[];
export function refreshSelection(): void;
export function removeCopySelection(): void;
export class removeCopySelection {
    selection: any[];
}
export function copyData(o: any, d: any): void;
export function hash(str: any): number;
export function conditionalSelectionUpdate(type: any, o: any, d: any): void;
export function getSelectedRows(visibleOnly: any): number[];
export function selectAll(): void;
export function getSelection(): number[] | null;
export function getSelected(columnNameOnly: any): any[];
export function getRange(): string;
export function isSelected(x: any, y: any): boolean;
export function getHighlighted(): number[][];
//# sourceMappingURL=selection.d.ts.map