import type {
  Range,
  DimensionRange,
  SpaceTimeId,
  Filter,
  FilterBoolean,
  FilterInt,
  FilterText,
  OutputOptions,
} from "../types/index.js";

/**
 * Static utility methods for creating range specifications and filters.
 * Provides convenient functions for common operations.
 */
export class StaticMethods {
  /**
   * Static utility methods for creating range specifications and filters.
   * Provides convenient functions for common operations.
   */
  static range = {
    /**
     * Creates a basic space-time ID range.
     * @param id Space-time ID input
     * @returns Range object
     */
    id: (id: SpaceTimeId): Range => id,

    /**
     * Creates an AND logical operation with multiple ranges.
     * @param ranges Array of ranges to combine with AND
     * @returns Range object with AND logic
     */
    and: (...ranges: Range[]): Range => ({ AND: ranges }),

    /**
     * Creates an OR logical operation with multiple ranges.
     * @param ranges Array of ranges to combine with OR
     * @returns Range object with OR logic
     */
    or: (...ranges: Range[]): Range => ({ OR: ranges }),

    /**
     * Creates an XOR logical operation with multiple ranges.
     * @param ranges Array of ranges to combine with XOR
     * @returns Range object with XOR logic
     */
    xor: (...ranges: Range[]): Range => ({ XOR: ranges }),

    /**
     * Creates a NOT logical operation with multiple ranges.
     * @param ranges Array of ranges to negate
     * @returns Range object with NOT logic
     */
    not: (...ranges: Range[]): Range => ({ NOT: ranges }),

    /**
     * Creates a filter range for value-based queries.
     * @param space Space name to filter within
     * @param key Key name to filter on
     * @param filter Optional filter condition
     * @returns Range object with Filter logic
     */
    filter: (space: string, key: string, filter?: Filter): Range => ({
      Filter: { space, key, filter },
    }),

    /**
     * Creates a hasValue range for existence checks.
     * @param space Space name to check
     * @param key Key name to check
     * @returns Range object with HasValue logic
     */
    hasValue: (space: string, key: string): Range => ({
      HasValue: { space, key },
    }),

    // Dimension range methods
    /**
     * Creates a single value dimension range.
     * @param value The single value
     * @returns Dimension range for single value
     */
    single: (value: number): DimensionRange => [value],

    /**
     * Creates a range between two values (inclusive).
     * @param start Start value
     * @param end End value
     * @returns Dimension range for value range
     */
    between: (start: number, end: number): DimensionRange => [start, end],

    /**
     * Creates a range from minimum value to specified value.
     * @param end End value
     * @returns Dimension range for before unlimited range
     */
    before: (end: number): DimensionRange => ["-", end],

    /**
     * Creates a range from specified value to maximum value.
     * @param start Start value
     * @returns Dimension range for after unlimited range
     */
    after: (start: number): DimensionRange => [start, "-"],

    /**
     * Creates a range that matches all values in the dimension.
     * @returns Dimension range for any/all values
     */
    any: (): DimensionRange => ["-"],
  };

  /**
   * Static filter methods for creating filter conditions.
   * Provides type-safe filter creation for different data types.
   */
  static filter = {
    /**
     * Boolean filter methods for creating boolean-type filter conditions.
     */
    boolean: {
      /**
       * Creates a filter that matches true values.
       * @returns FilterBoolean for true values
       */
      isTrue: (): FilterBoolean => ({ isTrue: true }),

      /**
       * Creates a filter that matches false values.
       * @returns FilterBoolean for false values
       */
      isFalse: (): FilterBoolean => ({ isFalse: true }),

      /**
       * Creates a filter that matches a specific boolean value.
       * @param value The boolean value to match
       * @returns FilterBoolean for specific value
       */
      equals: (value: boolean): FilterBoolean => ({ equals: value }),

      /**
       * Creates a filter that matches values not equal to the specified boolean.
       * @param value The boolean value to exclude
       * @returns FilterBoolean for not equal condition
       */
      notEquals: (value: boolean): FilterBoolean => ({ notEquals: value }),
    },

    /**
     * Integer filter methods for creating numeric filter conditions.
     */
    int: {
      /**
       * Creates a filter that matches an exact numeric value.
       * @param value The value to match exactly
       * @returns FilterInt for exact value
       */
      equal: (value: number): FilterInt => ({ equal: value }),

      /**
       * Creates a filter that matches values not equal to the specified number.
       * @param value The value to exclude
       * @returns FilterInt for not equal condition
       */
      notEqual: (value: number): FilterInt => ({ notEqual: value }),

      /**
       * Creates a filter that matches values greater than the specified number.
       * @param value The threshold value (exclusive)
       * @returns FilterInt for greater than condition
       */
      greaterThan: (value: number): FilterInt => ({ greaterThan: value }),

      /**
       * Creates a filter that matches values greater than or equal to the specified number.
       * @param value The threshold value (inclusive)
       * @returns FilterInt for greater than or equal condition
       */
      greaterEqual: (value: number): FilterInt => ({ greaterEqual: value }),

      /**
       * Creates a filter that matches values less than the specified number.
       * @param value The threshold value (exclusive)
       * @returns FilterInt for less than condition
       */
      lessThan: (value: number): FilterInt => ({ lessThan: value }),

      /**
       * Creates a filter that matches values less than or equal to the specified number.
       * @param value The threshold value (inclusive)
       * @returns FilterInt for less than or equal condition
       */
      lessEqual: (value: number): FilterInt => ({ lessEqual: value }),

      /**
       * Creates a filter that matches values within a range (inclusive).
       * @param start The start value (inclusive)
       * @param end The end value (inclusive)
       * @returns FilterInt for range condition
       */
      between: (start: number, end: number): FilterInt => ({
        between: [start, end],
      }),

      /**
       * Creates a filter that matches values in the specified array.
       * @param values Array of values to match
       * @returns FilterInt for "in" condition
       */
      in: (values: number[]): FilterInt => ({ in: values }),

      /**
       * Creates a filter that matches values not in the specified array.
       * @param values Array of values to exclude
       * @returns FilterInt for "not in" condition
       */
      notIn: (values: number[]): FilterInt => ({ notIn: values }),
    },

    /**
     * Text filter methods for creating string-type filter conditions.
     */
    text: {
      /**
       * Creates a filter that matches an exact string value.
       * @param value The string to match exactly
       * @returns FilterText for exact match
       */
      equal: (value: string): FilterText => ({ equal: value }),

      /**
       * Creates a filter that matches strings not equal to the specified value.
       * @param value The string to exclude
       * @returns FilterText for not equal condition
       */
      notEqual: (value: string): FilterText => ({ notEqual: value }),

      /**
       * Creates a filter that matches strings containing the specified substring.
       * @param value The substring to search for
       * @returns FilterText for contains condition
       */
      contains: (value: string): FilterText => ({ contains: value }),

      /**
       * Creates a filter that matches strings not containing the specified substring.
       * @param value The substring to exclude
       * @returns FilterText for not contains condition
       */
      notContains: (value: string): FilterText => ({ notContains: value }),

      /**
       * Creates a filter that matches strings starting with the specified prefix.
       * @param value The prefix to match
       * @returns FilterText for starts with condition
       */
      startsWith: (value: string): FilterText => ({ startsWith: value }),

      /**
       * Creates a filter that matches strings ending with the specified suffix.
       * @param value The suffix to match
       * @returns FilterText for ends with condition
       */
      endsWith: (value: string): FilterText => ({ endsWith: value }),

      /**
       * Creates a filter that matches strings equal to the specified value (case-insensitive).
       * @param value The string to match (ignoring case)
       * @returns FilterText for case-insensitive equal condition
       */
      caseInsensitiveEqual: (value: string): FilterText => ({
        caseInsensitiveEqual: value,
      }),
    },
  };

  /**
   * Static output option helpers for configuring getValue and select operations.
   */
  static options = {
    /**
     * Creates options to include all available output information.
     * @returns OutputOptions with all fields enabled
     */
    all: (): OutputOptions => ({
      vertex: true,
      center: true,
      id_string: true,
      id_pure: true,
    }),

    /**
     * Creates options to include only spatial information (vertex and center).
     * @returns OutputOptions with spatial fields enabled
     */
    spatial: (): OutputOptions => ({
      vertex: true,
      center: true,
      id_string: false,
      id_pure: false,
    }),

    /**
     * Creates options to include only ID information.
     * @returns OutputOptions with ID fields enabled
     */
    ids: (): OutputOptions => ({
      vertex: false,
      center: false,
      id_string: true,
      id_pure: true,
    }),

    /**
     * Creates minimal options (no additional information).
     * @returns OutputOptions with all fields disabled
     */
    minimal: (): OutputOptions => ({
      vertex: false,
      center: false,
      id_string: false,
      id_pure: false,
    }),
  };
}
