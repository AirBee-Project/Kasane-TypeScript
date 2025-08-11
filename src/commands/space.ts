import type { Output, KeyType } from "../types/index.js";
import { KeysInfo } from "../types/response.js";
import { KeyCommandsImpl } from "./key.js";

/**
 * Space operations for managing database spaces.
 */
export interface SpaceCommands {
  /**
   * Creates a new space.
   * @param params.space Name of the space
   */
  addSpace(params: { space: string }): void;

  /**
   * Deletes a space and all its data.
   * @param params.space Name of the space
   */
  deleteSpace(params: { space: string }): void;

  /**
   * Returns all space names.
   */
  showSpaces(): string[];

  /**
   * Returns an object for key operations within a specific space.
   *
   * @param space Name of the space to operate on
   *
   * @example
   * ```typescript
   * const space = kasane.space("neko");
   * space.showKeys();
   * space.addKey({ key: "age", type: "INT" });
   * ```
   */
  space(space: string): {
    showKeys(): string[];
    addKey(params: { key: string; type: KeyType }): void;
    deleteKey(params: { key: string }): void;
  };
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

  keysInfo(params: { space: string }): KeysInfo {
    let result = this.executeCommand({ KeysInfo: { spacename: params.space } });
    if (typeof result === "object" && "KeysInfo" in result) {
      return result.KeysInfo;
    }
    throw new Error("Unexpected response format for showSpaces");
  }

  space(space: string) {
    const keyCommands = new KeyCommandsImpl(this.executeCommand);
    return {
      showKeys: () => keyCommands.showKeys({ space }),
      addKey: ({ key, type }: { key: string; type: KeyType }) =>
        keyCommands.addKey({ space, key, type }),
      deleteKey: ({ key }: { key: string }) =>
        keyCommands.deleteKey({ space, key }),
      key: (name: string) => keyCommands.key(space, name),
    };
  }
}
