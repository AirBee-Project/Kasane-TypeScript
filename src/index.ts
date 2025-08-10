/**
 * kasane-wasm - TypeScript wrapper for Kasane 4D space-time database engine
 * 
 * This module provides a TypeScript interface for the Kasane WASM library,
 * enabling 4-dimensional space-time data management in web browsers and Node.js.
 * 
 * @example
 * ```typescript
 * import { Kasane } from "kasane-wasm";
 * 
 * // Initialize from WASM URL
 * const kasane = await Kasane.init("https://cdn.example.com/kasane.wasm");
 * 
 * // Create space and keys
 * kasane.addSpace({ space: "sensor_data" });
 * kasane.addKey({ space: "sensor_data", key: "temperature", type: "INT" });
 * 
 * // Store and retrieve data
 * kasane.setValue({
 *   space: "sensor_data",
 *   key: "temperature", 
 *   range: { z: 10, x: 100, y: 200, i: 1 },
 *   value: 25
 * });
 * ```
 */
export * from "./kasane";
