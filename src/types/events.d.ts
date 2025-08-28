// Event types for jspreadsheet

export interface MouseEvent {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  offsetX: number;
  offsetY: number;
  target: EventTarget | null;
  currentTarget: EventTarget | null;
  button: number;
  buttons: number;
  which: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface KeyboardEvent {
  key: string;
  code: string;
  keyCode: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface TouchEvent {
  touches: TouchList;
  targetTouches: TouchList;
  changedTouches: TouchList;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface WheelEvent extends MouseEvent {
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  deltaMode: number;
}

export interface ContextMenuEvent extends MouseEvent {
  // Additional context menu specific properties
}

export interface ClipboardEvent extends Event {
  clipboardData: DataTransfer | null;
}

export interface Resizing {
  element?: HTMLElement;
  mousePosition?: number;
  column?: number;
  row?: number;
  width?: number;
  height?: number;
}

export interface Dragging {
  element?: HTMLElement;
  column?: number;
  row?: number;
  destination?: number;
}

export interface SelectionEvent {
  x: number;
  y: number;
  x2: number;
  y2: number;
  origin: "mouse" | "keyboard" | "touch";
}

export interface CellEvent {
  cell: string;
  x: number;
  y: number;
  value: unknown;
  oldValue: unknown;
}

export interface ColumnEvent {
  column: number;
  width?: number;
  oldWidth?: number;
}

export interface RowEvent {
  row: number;
  height?: number;
  oldHeight?: number;
}
