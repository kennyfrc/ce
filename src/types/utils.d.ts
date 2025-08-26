// Utility types for jspreadsheet

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type Coordinates = {
  x: number;
  y: number;
};

export type Range = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Dimension = {
  width: number;
  height: number;
};

export type Position = {
  top: number;
  left: number;
};

export type Size = {
  rows: number;
  columns: number;
};

export type Callback<T = void> = (result: T) => void;
export type ErrorCallback = (error: Error) => void;

export type Dictionary<T = string> = Record<string, T>;

export type StringMap = Dictionary<string>;
export type NumberMap = Dictionary<number>;
export type BooleanMap = Dictionary<boolean>;

export type StringOrNumber = string | number;
export type Primitive = string | number | boolean | null | undefined;

export type ArrayOrValue<T> = T | T[];
export type PromiseOrValue<T> = Promise<T> | T;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export type RequireExactlyOne<T, Keys extends keyof T = keyof T> = {
  [K in Keys]: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
}[Keys];
