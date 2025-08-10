/**
 * Response Types for Kasane 4D space-time database
 * 
 * This module contains all type definitions for response objects
 * returned by Kasane operations.
 */

import type { SpaceTimeId } from "./input.js";

/**
 * Represents a point in 3-dimensional space as [x, y, z] coordinates.
 */
export type Point = [number, number, number]; // [x, y, z]

/**
 * Output structure for getValue operations containing spatial-temporal data with value.
 */
export interface GetValueOutput {
  /** Space-time identifier with coordinate information */
  spacetimeid: SpaceTimeId;
  /** Optional string representation of the space-time ID */
  id_string?: string;
  /** Optional eight vertices defining the 3D spatial region */
  vertex?: [Point, Point, Point, Point, Point, Point, Point, Point]; // 8 vertices
  /** Optional center point of the region */
  center?: Point;
  /** The stored value (number, string, or boolean) */
  value: ValueEntry;
}

/**
 * Output structure for select operations containing spatial-temporal region information.
 */
export interface SelectOutput {
  /** Space-time identifier with coordinate information */
  spacetimeid: SpaceTimeId;
  /** Optional string representation of the space-time ID */
  id_string?: string;
  /** Optional eight vertices defining the 3D spatial region */
  vertex?: [Point, Point, Point, Point, Point, Point, Point, Point]; // 8 vertices
  /** Optional center point of the region */
  center?: Point;
}

/**
 * Set of space-time identifiers.
 */
export interface SpaceTimeIdSet {
  /** Array of space-time identifiers */
  ids: SpaceTimeId[];
}

/**
 * Possible outputs from Kasane operations.
 */
export type Output =
  | { SpaceNames: string[] }
  | { KeyNames: string[] }
  | { GetValue: GetValueOutput[] }
  | { SelectValue: SelectOutput[] }
  | { SpaceTimeIdSet: SpaceTimeIdSet }
  | { Version: string }
  | "Success";

/**
 * WASM response wrapper that can contain either success result or error.
 */
export type CommandResult = { Success: Output } | { Error: string };

/**
 * Options for configuring output format of getValue and select operations.
 */
export interface OutputOptions {
  /** Include vertex information in output (default: false) */
  vertex?: boolean;
  /** Include center point in output (default: false) */
  center?: boolean;
  /** Include string representation of space-time ID (default: false) */
  id_string?: boolean;
  /** Include pure ID information (default: false) */
  id_pure?: boolean;
}

import type { ValueEntry } from "./values.js";