import type {
  Output,
  SelectOutput,
  Range,
  OutputOptions,
  Point,
} from "../types/index.js";
import type { WasmSelectOutput } from "../types/wasm-internal.js";
import { convertRange, convertFromWasmSpaceTimeId } from "../utils/index.js";

/**
 * Query operation commands for spatial region analysis and selection.
 */
export interface QueryCommands {
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
  select(params: { range: Range; options?: OutputOptions }): SelectOutput[];
}

/**
 * Implementation of query operations.
 */
export class QueryCommandsImpl implements QueryCommands {
  constructor(private executeCommand: (command: any) => Output) {}

  select(params: { range: Range; options?: OutputOptions }): SelectOutput[] {
    const options = params.options || {};
    const result = this.executeCommand({
      Select: {
        range: convertRange(params.range),
        vertex: options.vertex || false,
        center: options.center || false,
        id_string: options.id_string || false,
        id_pure: options.id_pure || false,
      },
    });

    if (typeof result === "object" && "SelectValue" in result) {
      // Convert WASM output to standardized format
      return result.SelectValue.map(
        (wasmOutput: WasmSelectOutput): SelectOutput => ({
          spacetimeid: convertFromWasmSpaceTimeId(wasmOutput.spacetimeid),
          id_string: wasmOutput.id_string || undefined,
          vertex: convertVertex(wasmOutput.vertex),
          center: wasmOutput.center || undefined,
        })
      );
    }

    throw new Error("Unexpected response format for select");
  }
}

function convertVertex(
  wasmVertex:
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
    | null
    | undefined
): [Point, Point, Point, Point, Point, Point, Point, Point] | undefined {
  if (!wasmVertex) return undefined;
  if (wasmVertex.length !== 8) {
    throw new Error(
      `Invalid vertex length: expected 8, got ${wasmVertex.length}`
    );
  }
  return wasmVertex.map((v) => {
    if (v.length !== 3) {
      throw new Error(
        `Invalid vertex point length: expected 3, got ${v.length}`
      );
    }
    // 型アサーションでPointとして扱う
    return v as Point;
  }) as [Point, Point, Point, Point, Point, Point, Point, Point];
}
