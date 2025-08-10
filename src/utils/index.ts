/**
 * Utility functions module for Kasane 4D space-time database
 * 
 * This module re-exports all utility functions used throughout
 * the Kasane system.
 */

// Value utilities
export { wrapValueEntry } from "./values.js";

// Conversion utilities
export {
  convertDimensionRange,
  convertSpaceTimeId,
  convertRange,
  convertBooleanFilter,
  convertIntFilter,
  convertTextFilter,
  convertFromWasmDimensionRange,
  convertFromWasmSpaceTimeId,
} from "./conversions.js";