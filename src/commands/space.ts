import type { Output } from "../types/index.js";

/**
 * Space operation commands for managing database spaces (schemas).
 */
export interface SpaceCommands {
  /**
   * Creates a new space (database) with the specified name.
   *
   * @param params Object containing space name
   * @param params.space Name of the space to create
   *
   * @example
   * ```typescript
   * kasane.addSpace({ space: "sensor_data" });
   * kasane.addSpace({ space: "user_locations" });
   * ```
   */
  addSpace(params: { space: string }): void;

  /**
   * Deletes an existing space and all its data.
   *
   * @param params Object containing space name
   * @param params.space Name of the space to delete
   *
   * @example
   * ```typescript
   * kasane.deleteSpace({ space: "old_sensor_data" });
   * ```
   */
  deleteSpace(params: { space: string }): void;

  /**
   * Retrieves a list of all existing space names.
   *
   * @returns Array of space names
   *
   * @example
   * ```typescript
   * const spaces = kasane.showSpaces();
   * console.log("Available spaces:", spaces);
   * // Output: ["sensor_data", "user_locations"]
   * ```
   */
  showSpaces(): string[];
}

/**
 * Implementation of space operations.
 */
export class SpaceCommandsImpl implements SpaceCommands {
  constructor(private executeCommand: (command: any) => Output) {}

  addSpace(params: { space: string }): void {
    this.executeCommand({ AddSpace: { spacename: params.space } });
  }

  deleteSpace(params: { space: string }): void {
    this.executeCommand({ DeleteSpace: { spacename: params.space } });
  }

  showSpaces(): string[] {
    const result = this.executeCommand({ Spaces: {} });
    if (typeof result === "object" && "SpaceNames" in result) {
      return result.SpaceNames;
    }
    throw new Error("Unexpected response format for showSpaces");
  }
}
