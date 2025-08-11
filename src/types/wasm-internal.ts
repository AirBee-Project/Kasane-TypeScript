/**
 * Internal Types for WASM Interface
 *
 * This module contains type definitions that match the exact format
 * returned by the WASM interface, based on Rust enum structures.
 */

/**
 * Internal WASM dimension range format that matches Rust enum structure
 */
export type WasmDimensionRange =
  | "Any"
  | { Single: T }
  | { LimitRange: [T, T] }
  | { BeforeUnLimitRange: T }
  | { AfterUnLimitRange: T };

/**
 * Internal WASM SpaceTimeId format that matches the actual WASM output
 */
export interface WasmSpaceTimeId {
  /** Zoom level (spatial resolution) */
  z: number;
  /** F dimension (altitude/height) */
  f: WasmDimensionRange<number>;
  /** X dimension (longitude-like coordinate) */
  x: WasmDimensionRange<number>;
  /** Y dimension (latitude-like coordinate) */
  y: WasmDimensionRange<number>;
  /** Time interval in seconds (0 for spatial ID) */
  i: number;
  /** T dimension (time index) */
  t: WasmDimensionRange<number>;
}

/**
 * Internal WASM GetValueOutput that matches actual WASM response
 */
export interface WasmGetValueOutput {
  /** Space-time identifier in WASM format */
  spacetimeid: WasmSpaceTimeId;
  /** Optional string representation of the space-time ID */
  id_string?: string | null;
  /** Optional eight vertices defining the 3D spatial region */
  vertex?:
    | [
        number[],
        number[],
        number[],
        number[],
        number[],
        number[],
        number[],
        number[]
      ]
    | null;
  /** Optional center point of the region */
  center?: [number, number, number] | null;
  /** The stored value in WASM format */
  value: any; // Will be { INT: number } | { TEXT: string } | { BOOLEAN: boolean }
}

/**
 * Internal WASM SelectOutput that matches actual WASM response
 */
export interface WasmSelectOutput {
  /** Space-time identifier in WASM format */
  spacetimeid: WasmSpaceTimeId;
  /** Optional string representation of the space-time ID */
  id_string?: string | null;
  /** Optional eight vertices defining the 3D spatial region */
  vertex?:
    | [
        number[],
        number[],
        number[],
        number[],
        number[],
        number[],
        number[],
        number[]
      ]
    | null;
  /** Optional center point of the region */
  center?: [number, number, number] | null;
}
