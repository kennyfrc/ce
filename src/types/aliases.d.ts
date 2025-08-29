import type { ColumnDefinition as _ColumnDefinition } from './core';

declare global {
  /**
   * Alias to core ColumnDefinition so legacy files that use the plain
   * name without importing can resolve the type during the gradual port.
   */
  type ColumnDefinition = _ColumnDefinition;
}

export {};
