/**
 * Value utility functions for Kasane 4D space-time database
 * 
 * This module contains utility functions for handling values
 * in the Kasane system.
 */

import type { ValueEntry } from "../types/values.js";

/**
 * Wraps a value entry into the appropriate WASM-compatible format.
 * @param value The value to wrap
 * @returns Wrapped value object for WASM consumption
 */
export function wrapValueEntry(value: ValueEntry): object {
  if (typeof value === "number") {
    return { INT: value };
  } else if (typeof value === "string") {
    return { TEXT: value };
  } else if (typeof value === "boolean") {
    return { BOOLEAN: value };
  } else {
    throw new Error("Unsupported ValueEntry type");
  }
}