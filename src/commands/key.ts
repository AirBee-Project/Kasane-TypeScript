import type {
  Output,
  KeyType,
  OutputOptions,
  ValueEntry,
  Range,
} from "../types/index.js";
import { SpaceCommandsImpl } from "./space.js";
import { ValueCommandsImpl } from "./value.js";

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
   * const keys = kasane.showKeys({ space: "sensor_data" });
   * console.log("Keys in sensor_data:", keys);
   * // Output: ["temperature", "humidity", "is_active"]
   * ```
   */
  showKeys(params: { space: string }): string[];
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

  showKeys(params: { space: string }): string[] {
    const result = this.executeCommand({ Keys: { spacename: params.space } });
    if (typeof result === "object" && "KeyNames" in result) {
      return result.KeyNames;
    }
    throw new Error("Unexpected response format for showKeys");
  }

  /**
   * Returns an object that exposes operations bound to a specific key in the space.
   */
  key(space: string, key: string) {
    const valueCommands = new ValueCommandsImpl(this.executeCommand);
    return {
      getValue: (params: { range: Range; options?: OutputOptions }) =>
        valueCommands.getValue({
          space,
          key,
          range: params.range,
          options: params.options,
        }),

      setValue: (params: { range: Range; value: ValueEntry }) =>
        valueCommands.setValue({
          space,
          key,
          range: params.range,
          value: params.value,
        }),

      putValue: (params: { range: Range; value: ValueEntry }) =>
        valueCommands.putValue({
          space,
          key,
          range: params.range,
          value: params.value,
        }),

      deleteValue: (params: { range: Range }) =>
        valueCommands.deleteValue({ space, key, range: params.range }),
    };
  }
}
