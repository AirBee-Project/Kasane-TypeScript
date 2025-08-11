/**
 * Conversion utility functions for Kasane 4D space-time database
 *
 * This module contains functions for converting TypeScript types
 * to WASM-compatible formats and vice versa.
 */

import type {
  DimensionRange,
  SpaceTimeId,
  Range,
  FilterBoolean,
  FilterInt,
  FilterText,
} from "../types/index.js";

import type {
  WasmDimensionRange,
  WasmSpaceTimeId,
  WasmGetValueOutput,
  WasmSelectOutput,
} from "../types/wasm-internal.js";

/**
 * Converts a standardized DimensionRange to WASM-compatible format.
 * @param range The dimension range to convert
 * @returns WASM-compatible range object
 */
export function convertDimensionRange(range: DimensionRange): any {
  if (Array.isArray(range)) {
    if (range.length === 1) {
      if (range[0] === "-") {
        return "Any";
      }
      return { Single: range[0] };
    }
    if (range.length === 2) {
      const [first, second] = range;
      if (first === "-") return { BeforeUnLimitRange: second };
      if (second === "-") return { AfterUnLimitRange: first };
      return { LimitRange: [first, second] };
    }
  }

  // Fallback for backwards compatibility
  return { Single: range };
}

/**
 * Converts a WASM DimensionRange to standardized format.
 * @param wasmRange The WASM dimension range to convert
 * @returns Standardized dimension range
 */
export function convertFromWasmDimensionRange(
  wasmRange: WasmDimensionRange
): DimensionRange {
  if (wasmRange === "Any") {
    return ["-"];
  }

  if (typeof wasmRange === "object" && wasmRange !== null) {
    if ("Single" in wasmRange) {
      return [wasmRange.Single];
    }
    if ("LimitRange" in wasmRange) {
      return wasmRange.LimitRange as [number, number];
    }
    if ("BeforeUnLimitRange" in wasmRange) {
      return ["-", wasmRange.BeforeUnLimitRange];
    }
    if ("AfterUnLimitRange" in wasmRange) {
      return [wasmRange.AfterUnLimitRange, "-"];
    }
  }

  // Fallback
  return ["-"];
}

/**
 * Converts a SpaceTimeId to WASM-compatible format.
 * @param id The space-time ID to convert
 * @returns WASM-compatible space-time ID object
 */
export function convertSpaceTimeId(id: SpaceTimeId): any {
  return {
    z: id.z,
    f: id.f ? convertDimensionRange(id.f) : "Any",
    x: id.x ? convertDimensionRange(id.x) : "Any",
    y: id.y ? convertDimensionRange(id.y) : "Any",
    i: id.i ? id.i : 0,
    t: id.t ? convertDimensionRange(id.t) : "Any",
  };
}

/**
 * Converts a WASM SpaceTimeId to standardized format.
 * @param wasmId The WASM space-time ID to convert
 * @returns Standardized space-time ID
 */
export function convertFromWasmSpaceTimeId(
  wasmId: WasmSpaceTimeId
): SpaceTimeId {
  return {
    z: wasmId.z,
    f: convertFromWasmDimensionRange(wasmId.f),
    x: convertFromWasmDimensionRange(wasmId.x),
    y: convertFromWasmDimensionRange(wasmId.y),
    i: wasmId.i,
    t: convertFromWasmDimensionRange(wasmId.t),
  };
}

/**
 * Checks if a dimension range represents "Any"
 * @param range The dimension range to check
 * @returns True if the range represents "Any"
 */
function isAnyRange(range: DimensionRange): boolean {
  return Array.isArray(range) && range.length === 1 && range[0] === "-";
}

/**
 * Converts a Range specification to WASM-compatible format.
 * @param range The range to convert
 * @returns WASM-compatible range object
 */
export function convertRange(range: Range): any {
  // Handle basic SpaceTimeId
  if ("z" in range && typeof range.z === "number") {
    return { SpaceTimeIdSet: [convertSpaceTimeId(range as SpaceTimeId)] };
  }

  // Handle logical operators
  if ("OR" in range) {
    return { Prefix: { OR: range.OR.map(convertRange) } };
  }

  if ("AND" in range) {
    return { Prefix: { AND: range.AND.map(convertRange) } };
  }

  if ("XOR" in range) {
    return { Prefix: { XOR: range.XOR.map(convertRange) } };
  }

  if ("NOT" in range) {
    return { Prefix: { NOT: range.NOT.map(convertRange) } };
  }

  // Handle Filter
  if ("Filter" in range) {
    const filterValue: any = {
      spacename: range.Filter.space,
      keyname: range.Filter.key,
    };

    if (range.Filter.filter) {
      if ("boolean" in range.Filter.filter) {
        filterValue.filter = {
          FilterBOOLEAN: convertBooleanFilter(range.Filter.filter.boolean),
        };
      } else if ("int" in range.Filter.filter) {
        filterValue.filter = {
          FilterINT: convertIntFilter(range.Filter.filter.int),
        };
      } else if ("text" in range.Filter.filter) {
        filterValue.filter = {
          FilterTEXT: convertTextFilter(range.Filter.filter.text),
        };
      }
    }

    return { Function: { FilterValue: filterValue } };
  }

  // Handle HasValue
  if ("HasValue" in range) {
    return {
      Function: {
        HasValue: {
          spacename: range.HasValue.space,
          keyname: range.HasValue.key,
        },
      },
    };
  }

  throw new Error(`Unknown range type: ${JSON.stringify(range)}`);
}

/**
 * Converts boolean filter to WASM-compatible format.
 * @param filter The boolean filter to convert
 * @returns WASM-compatible boolean filter object
 */
export function convertBooleanFilter(filter: FilterBoolean): any {
  if ("isTrue" in filter) return "IsTrue";
  if ("isFalse" in filter) return "IsFalse";
  if ("equals" in filter) return { Equals: filter.equals };
  if ("notEquals" in filter) return { NotEquals: filter.notEquals };
  throw new Error(`Unknown boolean filter: ${JSON.stringify(filter)}`);
}

/**
 * Converts integer filter to WASM-compatible format.
 * @param filter The integer filter to convert
 * @returns WASM-compatible integer filter object
 */
export function convertIntFilter(filter: FilterInt): any {
  if ("equal" in filter) return { Equal: filter.equal };
  if ("notEqual" in filter) return { NotEqual: filter.notEqual };
  if ("greaterThan" in filter) return { GreaterThan: filter.greaterThan };
  if ("greaterEqual" in filter) return { GreaterEqual: filter.greaterEqual };
  if ("lessThan" in filter) return { LessThan: filter.lessThan };
  if ("lessEqual" in filter) return { LessEqual: filter.lessEqual };
  if ("between" in filter) return { Between: filter.between };
  if ("in" in filter) return { In: filter.in };
  if ("notIn" in filter) return { NotIn: filter.notIn };
  throw new Error(`Unknown int filter: ${JSON.stringify(filter)}`);
}

/**
 * Converts text filter to WASM-compatible format.
 * @param filter The text filter to convert
 * @returns WASM-compatible text filter object
 */
export function convertTextFilter(filter: FilterText): any {
  if ("equal" in filter) return { Equal: filter.equal };
  if ("notEqual" in filter) return { NotEqual: filter.notEqual };
  if ("contains" in filter) return { Contains: filter.contains };
  if ("notContains" in filter) return { NotContains: filter.notContains };
  if ("startsWith" in filter) return { StartsWith: filter.startsWith };
  if ("endsWith" in filter) return { EndsWith: filter.endsWith };
  if ("caseInsensitiveEqual" in filter)
    return { CaseInsensitiveEqual: filter.caseInsensitiveEqual };
  throw new Error(`Unknown text filter: ${JSON.stringify(filter)}`);
}
