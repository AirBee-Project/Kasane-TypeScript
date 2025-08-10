import type { Output, KeyType } from "../types/index.js";

/**
 * Key operation commands for managing data fields within spaces.
 */
export interface KeyCommands {
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
  addKey(params: { space: string; key: string; type: KeyType }): void;

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
  deleteKey(params: { space: string; key: string }): void;

  /**
   * Retrieves a list of all key names in the specified space.
   *
   * @param params Object containing space name
   * @param params.space Name of the space to list keys from
   * @returns Array of key names in the space
   *
   * @example
   * ```typescript
   * const keys = kasane.getKeys({ space: "sensor_data" });
   * console.log("Keys in sensor_data:", keys);
   * // Output: ["temperature", "humidity", "is_active"]
   * ```
   */
  getKeys(params: { space: string }): string[];
}

/**
 * Implementation of key operations.
 */
export class KeyCommandsImpl implements KeyCommands {
  constructor(private executeCommand: (command: any) => Output) {}

  addKey(params: { space: string; key: string; type: KeyType }): void {
    this.executeCommand({
      AddKey: {
        spacename: params.space,
        keyname: params.key,
        type: params.type,
      },
    });
  }

  deleteKey(params: { space: string; key: string }): void {
    this.executeCommand({
      DeleteKey: { spacename: params.space, name: params.key },
    });
  }

  getKeys(params: { space: string }): string[] {
    const result = this.executeCommand({ Keys: { spacename: params.space } });
    if (typeof result === "object" && "KeyNames" in result) {
      return result.KeyNames;
    }
    throw new Error("Unexpected response format for getKeys");
  }
}