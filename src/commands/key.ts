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
 * Key operations for managing data fields within spaces.
 */
export interface KeyCommands {
  /**
   * Creates a new key with data type.
   * @param params.space Name of the space
   * @param params.key Name of the key
   * @param params.type Data type ("INT", "BOOLEAN", or "TEXT")
   */
  addKey(params: { space: string; key: string; type: KeyType }): void;

  /**
   * Deletes a key and all its data.
   * @param params.space Name of the space
   * @param params.key Name of the key
   */
  deleteKey(params: { space: string; key: string }): void;

  /**
   * Returns all key names in the space.
   * @param params.space Name of the space
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
