/**
 * Input Types for Kasane 4D space-time database
 *
 * This module contains all type definitions for input parameters
 * and range specifications used in Kasane operations.
 */

import type { Filter } from "./filters.js";

/**
 * Standardized dimension range specification using array format.
 *
 * When omitted dimensions are used, they become "Any" (all values in that dimension).
 *
 * @template T The value type (typically number for spatial/temporal dimensions)
 *
 * Supported formats:
 * - `[T]`: Single value
 * - `[T, T]`: LimitRange from start to end (inclusive)
 * - `["-", T]`: BeforeUnLimitRange from minimum value to T
 * - `[T, "-"]`: AfterUnlimitRange from T to maximum value
 * - `["-"]`: Any (all values in dimension)
 */
export type DimensionRange =
  | [number] // Single value
  | [number, number] // LimitRange: [start, end]
  | ["-", number] // BeforeUnLimitRange: [-, end]
  | [number, "-"] // AfterUnlimitRange: [start, -]
  | ["-"]; // Any

/**
 * Unified space-time identifier that works for both input and output.
 *
 * The `i` parameter determines whether this represents a spatial ID or space-time ID:
 * - **Spatial ID** (i=0, t=Any): Represents static spatial information like mountains, rivers, or fixed landmarks
 * - **Space-Time ID** (i≠0): Represents temporal data that changes over time, such as sensor readings or moving objects
 *
 * Both types can perform logical operations with each other (AND, OR, XOR, NOT).
 *
 * Required dimensions: z (zoom level) and i (time interval)
 * Optional dimensions: f, x, y, t (default to ["-"] when omitted)
 */
export interface SpaceTimeId {
  /** Zoom level (spatial resolution) - Required */
  z: number;
  /** F dimension (altitude/height)  */
  f: DimensionRange;
  /** X dimension (longitude-like coordinate)  */
  x: DimensionRange;
  /** Y dimension (latitude-like coordinate)  */
  y: DimensionRange;
  /** Time interval in seconds (0 for spatial ID) - Required */
  i: number;
  /** T dimension (time index)  */
  t: DimensionRange;
}

/**
 * Filter input for value-based queries within a specific space and key.
 */
export interface FilterInput {
  /** Space name to filter within */
  space: string;
  /** Key name to filter on */
  key: string;
  /** Optional filter condition (if omitted, checks for existence) */
  filter?: Filter;
}

/**
 * Input for checking value existence within a specific space and key.
 */
export interface HasValueInput {
  /** Space name to check */
  space: string;
  /** Key name to check */
  key: string;
}

/**
 * Range specification supporting space-time regions and logical operations.
 *
 * Supports:
 * - Basic space-time regions (SpaceTimeId)
 * - Logical operations: OR, AND, XOR, NOT
 * - Filter operations for value-based queries
 * - HasValue operations for existence checks
 */
export type Range =
  | SpaceTimeId
  | { OR: Range[] }
  | { AND: Range[] }
  | { XOR: Range[] }
  | { NOT: Range[] }
  | { Filter: FilterInput }
  | { HasValue: HasValueInput };
