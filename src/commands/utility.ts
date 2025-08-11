import type { Output } from "../types/index.js";

/**
 * Utility operation commands for system information and maintenance.
 */
export interface UtilityCommands {
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
  getVersion(): string;
}

/**
 * Implementation of utility operations.
 */
export class UtilityCommandsImpl implements UtilityCommands {
  constructor(private executeCommand: (command: any) => Output) {}

  getVersion(): string {
    const result = this.executeCommand("Version");
    if (typeof result === "object" && "Version" in result) {
      return result.Version;
    }
    throw new Error("Unexpected response format for getVersion");
  }
}
