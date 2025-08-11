import type {
  Output,
  GetValueOutput,
  Range,
  ValueEntry,
  OutputOptions,
} from "../types/index.js";
import type { WasmGetValueOutput } from "../types/wasm-internal.js";
import { convertVertex } from "../utils/conversions.js";
import {
  wrapValueEntry,
  convertRange,
  convertFromWasmSpaceTimeId,
} from "../utils/index.js";

/**
 * Value operation commands for storing, retrieving, and managing data values.
 */
export interface ValueCommands {
  /**
   * Adds a value to the specified range without overwriting existing values.
   * **Important**: Returns an error if values already exist in overlapping regions.
   * Use `setValue` instead if you want to overwrite existing data.
   *
   * @param params Object containing value addition parameters
   * @param params.space Name of the space
   * @param params.key Name of the key
   * @param params.range Space-time range specification
   * @param params.value Value to store (number, string, or boolean)
   * @throws Error if values already exist in the specified range
   *
   * @example
   * ```typescript
   * // This will succeed if no data exists at this location
   * kasane.putValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: 100, y: 200, i: 1 },
   *   value: 25.5
   * });
   *
   * // This will throw an error if data already exists
   * kasane.putValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: 100, y: 200, i: 1 },
   *   value: 26.0 // Error: data already exists
   * });
   * ```
   */
  putValue(params: {
    space: string;
    key: string;
    range: Range;
    value: ValueEntry;
  }): void;

  /**
   * Sets a value in the specified range, **forcefully overwriting any existing values**.
   * This is the primary method for storing data in Kasane when you want to ensure
   * the data is saved regardless of existing content. Use `putValue` if you want to
   * avoid overwriting existing data.
   *
   * @param params Object containing value setting parameters
   * @param params.space Name of the space
   * @param params.key Name of the key
   * @param params.range Space-time range specification
   * @param params.value Value to store (number, string, or boolean)
   *
   * @example
   * ```typescript
   * // Simple coordinate-based storage - will overwrite existing data
   * kasane.setValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: 100, y: 200, i: 1 },
   *   value: 25.5
   * });
   *
   * // This will successfully overwrite the previous value
   * kasane.setValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: 100, y: 200, i: 1 },
   *   value: 26.0 // Overwrites 25.5
   * });
   *
   * // Range-based storage
   * kasane.setValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: [100, 200], y: [100, 200], i: 1 },
   *   value: 25.5
   * });
   *
   * // Using dimension range syntax
   * kasane.setValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: {
   *     z: 10,
   *     x: Kasane.range.between(100, 200),
   *     y: Kasane.range.any(),
   *     i: 1
   *   },
   *   value: 25.5
   * });
   * ```
   */
  setValue(params: {
    space: string;
    key: string;
    range: Range;
    value: ValueEntry;
  }): void;

  /**
   * Retrieves values from the specified range with detailed spatial information.
   *
   * @param params Object containing value retrieval parameters
   * @param params.space Name of the space
   * @param params.key Name of the key
   * @param params.range Space-time range specification for querying
   * @param params.options Optional output formatting options
   * @returns Array of GetValueOutput objects containing values and spatial data
   *
   * @example
   * ```typescript
   * // Simple retrieval
   * const values = kasane.getValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: 100, y: 200, i: 1 }
   * });
   *
   * // Retrieval with vertex and center information
   * const detailedValues = kasane.getValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: 100, y: 200, i: 1 },
   *   options: { vertex: true, center: true, id_string: true }
   * });
   *
   * // Range-based retrieval
   * const rangeValues = kasane.getValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: [100, 200], y: [100, 200], i: 1 }
   * });
   *
   * // Complex logical query
   * const complexValues = kasane.getValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: {
   *     AND: [
   *       { z: 10, x: [100, 200], y: [100, 200], i: 1 },
   *       { Filter: { space: "sensor_data", key: "temperature", filter: { int: { greaterThan: 20 } } } }
   *     ]
   *   }
   * });
   * ```
   */
  getValue(params: {
    space: string;
    key: string;
    range: Range;
    options?: OutputOptions;
  }): GetValueOutput[];

  /**
   * Deletes values in the specified range.
   *
   * @param params Object containing value deletion parameters
   * @param params.space Name of the space
   * @param params.key Name of the key
   * @param params.range Space-time range specification for deletion
   *
   * @example
   * ```typescript
   * // Delete specific location
   * kasane.deleteValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: 100, y: 200, i: 1 }
   * });
   *
   * // Delete range
   * kasane.deleteValue({
   *   space: "sensor_data",
   *   key: "temperature",
   *   range: { z: 10, x: [100, 200], y: [100, 200], i: 1 }
   * });
   * ```
   */
  deleteValue(params: { space: string; key: string; range: Range }): void;
}

/**
 * Implementation of value operations.
 */
export class ValueCommandsImpl implements ValueCommands {
  constructor(private executeCommand: (command: any) => Output) {}

  putValue(params: {
    space: string;
    key: string;
    range: Range;
    value: ValueEntry;
  }): void {
    this.executeCommand({
      PutValue: {
        spacename: params.space,
        keyname: params.key,
        range: convertRange(params.range),
        value: wrapValueEntry(params.value),
      },
    });
  }

  setValue(params: {
    space: string;
    key: string;
    range: Range;
    value: ValueEntry;
  }): void {
    this.executeCommand({
      SetValue: {
        spacename: params.space,
        keyname: params.key,
        range: convertRange(params.range),
        value: wrapValueEntry(params.value),
      },
    });
  }

  getValue(params: {
    space: string;
    key: string;
    range: Range;
    options?: OutputOptions;
  }): GetValueOutput[] {
    const options = params.options || {};
    const result = this.executeCommand({
      GetValue: {
        spacename: params.space,
        keyname: params.key,
        range: convertRange(params.range),
        vertex: options.vertex || false,
        center: options.center || false,
        id_string: options.id_string || false,
        id_pure: options.id_pure || false,
      },
    });

    if (typeof result === "object" && "GetValue" in result) {
      // Convert WASM output to standardized format
      return result.GetValue.map(
        (wasmOutput: WasmGetValueOutput): GetValueOutput => ({
          spacetimeid: convertFromWasmSpaceTimeId(wasmOutput.spacetimeid),
          id_string: wasmOutput.id_string || undefined,
          vertex: convertVertex(wasmOutput.vertex),
          center: wasmOutput.center || undefined,
          value: wasmOutput.value,
        })
      );
    }
    throw new Error("Unexpected response format for getValue");
  }

  deleteValue(params: { space: string; key: string; range: Range }): void {
    this.executeCommand({
      DeleteValue: {
        spacename: params.space,
        keyname: params.key,
        range: convertRange(params.range),
      },
    });
  }
}
