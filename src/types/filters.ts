/**
 * Filter Types for Kasane 4D space-time database
 *
 * This module contains all type definitions for filter conditions
 * used in value-based queries.
 */

/**
 * Filter conditions for boolean values.
 */
export type FilterBoolean =
  | { isTrue: true }
  | { isFalse: true }
  | { equals: boolean }
  | { notEquals: boolean };

/**
 * Filter conditions for integer/numeric values.
 */
export type FilterInt =
  | { equal: number }
  | { notEqual: number }
  | { greaterThan: number }
  | { greaterEqual: number }
  | { lessThan: number }
  | { lessEqual: number }
  | { between: [number, number] }
  | { in: number[] }
  | { notIn: number[] };

/**
 * Filter conditions for text/string values.
 */
export type FilterText =
  | { equal: string }
  | { notEqual: string }
  | { contains: string }
  | { notContains: string }
  | { startsWith: string }
  | { endsWith: string }
  | { caseInsensitiveEqual: string };

/**
 * Union type for all filter conditions.
 */
export type Filter =
  | { boolean: FilterBoolean }
  | { int: FilterInt }
  | { text: FilterText };
