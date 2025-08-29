import type { SpreadsheetOptions } from "../types/core";
/**
 * Type guard to check if a string is a valid column type
 */
export declare function isColumnType(value: string): value is "text" | "numeric" | "calendar" | "dropdown" | "checkbox" | "color" | "hidden" | "radio" | "image" | "html";
/**
 * Get carret position for one element
 */
export declare const getCaretIndex: (this: {
    config?: {
        root?: {
            getSelection: () => Selection | null;
        };
    };
}, e: HTMLElement) => number;
/**
 * Invert keys and values
 */
export declare const invert: (o: Record<string, string | number | boolean | null | undefined>) => Record<string, string>;
/**
 * Get letter based on a number
 *
 * @param {number} columnNumber
 * @return string letter
 */
export declare const getColumnName: (columnNumber: number) => string;
/**
 * Get column name from coords
 */
export declare const getCellNameFromCoords: (x: number | string, y: number | string) => string;
export declare const getCoordsFromCellName: (columnName: string) => (number | null)[];
export declare const getCoordsFromRange: (range: string) => number[];
/**
 * From stack overflow contributions
 */
export declare const parseCSV: (str: string, delimiter?: string) => string[][];
export declare const createFromTable: (el: HTMLElement, options?: Partial<SpreadsheetOptions>) => Partial<SpreadsheetOptions>;
//# sourceMappingURL=helpers.d.ts.map