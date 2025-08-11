import initWasm, { Kasane as WasmKasane } from "../src/pkg/kasane";
import type {
  // Response types
  Output,
  GetValueOutput,
  SelectOutput,
  OutputOptions,
  CommandResult,
  // Input types
  DimensionRange,
  SpaceTimeId,
  Range,
  Filter,
  // Value types
  ValueEntry,
  KeyType,
  // Filter types
  FilterBoolean,
  FilterInt,
  FilterText,
} from "./types/index.js";
import {
  SpaceCommandsImpl,
  KeyCommandsImpl,
  ValueCommandsImpl,
  QueryCommandsImpl,
  UtilityCommandsImpl,
  StaticMethods,
} from "./commands/index.js";

/**
 * Main Kasane class providing TypeScript interface to WASM-based 4D space-time database.
 *
 * Kasane manages 4-dimensional space-time data (X, Y, F, T dimensions) with support for:
 * - Space and key management
 * - Value operations (put, set, get, delete)
 * - Complex range queries with logical operations
 * - Value filtering and existence checks
 *
 * ## Spatial ID vs Space-Time ID
 *
 * Kasane distinguishes between two types of identifiers:
 * - **Spatial ID** (i=0): Static spatial information like mountains, rivers, buildings
 * - **Space-Time ID** (i≠0): Temporal data that changes over time like sensor readings, vehicle locations
 *
 * Both types can be combined using logical operations for complex queries.
 *
 * @example
 * ```typescript
 * // Initialize Kasane from WASM URL
 * const kasane = await Kasane.init("/path/to/kasane.wasm");
 *
 * // Create space and key
 * kasane.addSpace({ space: "sensor_data" });
 * kasane.addKey({ space: "sensor_data", key: "temperature", type: "INT" });
 *
 * // Store spatial data (static)
 * kasane.setValue({
 *   space: "sensor_data",
 *   key: "mountain_height",
 *   range: { z: 10, x: 100, y: 200, i: 0 },  // i=0 for spatial ID
 *   value: 1500
 * });
 *
 * // Store temporal data (changing over time)
 * kasane.setValue({
 *   space: "sensor_data",
 *   key: "temperature",
 *   range: { z: 10, x: 100, y: 200, i: 1 },  // i≠0 for space-time ID
 *   value: 25
 * });
 * ```
 */
/**
 * Main Kasane class for 4D space-time database operations.
 */
export class Kasane {
  /**
   * Supported WASM version range for this npm package.
   * This defines the range of Kasane WASM versions that this TypeScript wrapper is designed to work with.
   */
  static readonly SUPPORTED_WASM_VERSION_RANGE = {
    min: "0.0.1",
    max: "0.0.1",
  };
  private inner: WasmKasane;
  private debug: boolean;
  private spaceCommands: SpaceCommandsImpl;
  private keyCommands: KeyCommandsImpl;
  private valueCommands: ValueCommandsImpl;
  private queryCommands: QueryCommandsImpl;
  private utilityCommands: UtilityCommandsImpl;

  private constructor(inner: WasmKasane, debug: boolean) {
    this.inner = inner;
    this.debug = debug;

    // Initialize command implementations
    this.spaceCommands = new SpaceCommandsImpl(this.executeCommand.bind(this));
    this.keyCommands = new KeyCommandsImpl(this.executeCommand.bind(this));
    this.valueCommands = new ValueCommandsImpl(this.executeCommand.bind(this));
    this.queryCommands = new QueryCommandsImpl(this.executeCommand.bind(this));
    this.utilityCommands = new UtilityCommandsImpl(
      this.executeCommand.bind(this)
    );
  }

  /**
   * Initializes Kasane by loading WASM module from the specified URL.
   *
   * @param wasmUrl URL or path to the kasane.wasm file
   * @param debug Enable debug logging (default: false)
   * @returns Promise resolving to initialized Kasane instance
   *
   * @example
   * ```typescript
   * // From CDN
   * const kasane = await Kasane.init("https://cdn.example.com/kasane.wasm");
   *
   * // From local path
   * const kasane = await Kasane.init("/assets/kasane.wasm");
   *
   * // With debug logging
   * const kasane = await Kasane.init("/assets/kasane.wasm", true);
   * ```
   */
  /**
   * Initializes Kasane from WASM URL.
   * @param wasmUrl URL to kasane.wasm file
   * @param debug Enable debug logging
   */
  static async init(wasmUrl: string, debug = false): Promise<Kasane> {
    await initWasm(wasmUrl);
    const instance = new WasmKasane();
    const kasane = new Kasane(instance, debug);

    // Verify WASM version compatibility
    Kasane.checkVersionCompatibility(kasane);

    return kasane;
  }

  /**
   * Checks if the loaded WASM version is compatible with this npm package.
   * Logs a warning if the version is outside the supported range but allows operation to continue.
   *
   * @param kasane The Kasane instance to check version for
   * @private
   */
  private static checkVersionCompatibility(kasane: Kasane): void {
    try {
      const wasmVersion = kasane.getVersion();
      const { min, max } = Kasane.SUPPORTED_WASM_VERSION_RANGE;

      if (!Kasane.isVersionInRange(wasmVersion, min, max)) {
        console.warn(
          `[Kasane] Version compatibility warning: ` +
            `WASM version "${wasmVersion}" is outside the supported range "${min}" - "${max}". ` +
            `This npm package (kasane-client) is designed to work with WASM versions in this range. ` +
            `Functionality may be limited or unexpected behavior may occur.`
        );
      }
    } catch (error) {
      // If version check fails, log warning but don't prevent initialization
      console.warn(
        `[Kasane] Could not verify WASM version compatibility: ${error}. ` +
          `Continuing with initialization.`
      );
    }
  }

  /**
   * Checks if a version string is within the specified range.
   * Uses simple semantic version comparison (major.minor.patch).
   *
   * @param version Version to check
   * @param minVersion Minimum supported version
   * @param maxVersion Maximum supported version
   * @returns true if version is within range, false otherwise
   * @private
   */
  private static isVersionInRange(
    version: string,
    minVersion: string,
    maxVersion: string
  ): boolean {
    const parseVersion = (v: string): number[] => {
      return v.split(".").map((part) => parseInt(part, 10) || 0);
    };

    const compareVersions = (v1: number[], v2: number[]): number => {
      for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const part1 = v1[i] || 0;
        const part2 = v2[i] || 0;

        if (part1 !== part2) {
          return part1 - part2;
        }
      }
      return 0;
    };

    const versionParts = parseVersion(version);
    const minParts = parseVersion(minVersion);
    const maxParts = parseVersion(maxVersion);

    const isAboveMin = compareVersions(versionParts, minParts) >= 0;
    const isBelowMax = compareVersions(versionParts, maxParts) <= 0;

    return isAboveMin && isBelowMax;
  }

  /**
   * Executes a command against the WASM Kasane instance.
   * @param command The command to execute
   * @returns The result of the command execution
   * @throws Error if the command fails
   * @private
   */
  private executeCommand(command: any): Output {
    if (this.debug) {
      console.log(
        "INPUT :" +
          JSON.stringify({
            command: [command],
          })
      );
    }

    const res = this.inner.execute(
      JSON.stringify({
        command: [command],
      })
    );

    const res_json: CommandResult = JSON.parse(res)[0];

    if (this.debug) {
      console.log("OUTPUT:" + JSON.stringify(res_json));
    }

    if ("Error" in res_json) {
      throw new Error(res_json.Error);
    }

    return res_json.Success;
  }

  // ========== Space Operations ==========

  /**
   * Creates a new space.
   * @param params.space Name of the space
   */
  addSpace(params: { space: string }): void {
    return this.spaceCommands.addSpace(params);
  }

  /**
   * Deletes a space and all its data.
   * @param params.space Name of the space
   */
  deleteSpace(params: { space: string }): void {
    return this.spaceCommands.deleteSpace(params);
  }

  /**
   * Returns all space names.
   */
  showSpaces(): string[] {
    return this.spaceCommands.showSpaces();
  }

  // ========== Key Operations ==========

  /**
   * Creates a new key (data field) in the specified space with the given data type.
   *
   * @param params Object containing key creation parameters
   * @param params.space Name of the space to add the key to
   * @param params.key Name of the key to create
   * @param params.type Data type of the key ("INT", "BOOLEAN", or "TEXT")
   *
   * @example
   * ```typescript
   * kasane.addKey({ space: "sensor_data", key: "temperature", type: "INT" });
   * kasane.addKey({ space: "sensor_data", key: "is_active", type: "BOOLEAN" });
   * kasane.addKey({ space: "sensor_data", key: "location_name", type: "TEXT" });
   * ```
   */
  addKey(params: { space: string; key: string; type: KeyType }): void {
    return this.keyCommands.addKey(params);
  }

  /**
   * Deletes an existing key and all its associated data from the specified space.
   *
   * @param params Object containing key deletion parameters
   * @param params.space Name of the space containing the key
   * @param params.key Name of the key to delete
   *
   * @example
   * ```typescript
   * kasane.deleteKey({ space: "sensor_data", key: "old_temperature" });
   * ```
   */
  deleteKey(params: { space: string; key: string }): void {
    return this.keyCommands.deleteKey(params);
  }

  /**
   * Retrieves a list of all key names in the specified space.
   *
   * @param params Object containing space name
   * @param params.space Name of the space to list keys from
   * @returns Array of key names in the space
   *
   * @example
   * ```typescript
   * const keys = kasane.showKeys({ space: "sensor_data" });
   * console.log("Keys in sensor_data:", keys);
   * // Output: ["temperature", "humidity", "is_active"]
   * ```
   */
  showKeys(params: { space: string }): string[] {
    return this.keyCommands.showKeys(params);
  }

  // ========== Value Operations ==========

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
  }): void {
    return this.valueCommands.putValue(params);
  }

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
  }): void {
    return this.valueCommands.setValue(params);
  }

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
  }): GetValueOutput[] {
    return this.valueCommands.getValue(params);
  }

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
  deleteValue(params: { space: string; key: string; range: Range }): void {
    return this.valueCommands.deleteValue(params);
  }

  /**
   * Selects space-time regions matching the specified range without retrieving values.
   * Useful for spatial queries and region analysis.
   *
   * @param params Object containing selection parameters
   * @param params.range Space-time range specification for selection
   * @param params.options Optional output formatting options
   * @returns Array of SelectOutput objects containing spatial region information
   *
   * @example
   * ```typescript
   * const regions = kasane.select({
   *   range: {
   *     OR: [
   *       { z: 10, x: 100, y: 200, i: 1 },
   *       { z: 10, x: 101, y: 200, i: 1 },
   *       { z: 10, x: 102, y: 200, i: 1 }
   *     ]
   *   }
   * });
   *
   * // With detailed spatial information
   * const detailedRegions = kasane.select({
   *   range: { z: 10, x: [100, 200], y: [100, 200], i: 1 },
   *   options: { vertex: true, center: true, id_string: true }
   * });
   * ```
   */
  select(params: { range: Range; options?: OutputOptions }): SelectOutput[] {
    return this.queryCommands.select(params);
  }

  /**
   * Gets the version information of the Kasane database.
   *
   * @returns Version string
   *
   * @example
   * ```typescript
   * const version = kasane.getVersion();
   * console.log("Kasane version:", version);
   * ```
   */
  getVersion(): string {
    return this.utilityCommands.getVersion();
  }

  // ========== Utility Methods ==========

  /**
   * Static utility methods for creating range specifications and filters.
   * Provides convenient functions for common operations.
   */
  static range = StaticMethods.range;

  /**
   * Static filter methods for creating filter conditions.
   * Provides type-safe filter creation for different data types.
   */
  static filter = StaticMethods.filter;

  /**
   * Static output option helpers for configuring getValue and select operations.
   */
  static options = StaticMethods.options;

  /**
   * Returns space operations object for chaining.
   * @param name Name of the space
   */
  space(name: string) {
    return this.spaceCommands.space(name);
  }
}
