/**
 * Value and Key Types for Kasane 4D space-time database
 * 
 * This module contains type definitions for values and keys
 * used throughout the Kasane system.
 */

/**
 * Supported value types that can be stored in Kasane.
 */
export type ValueEntry = number | string | boolean;

/**
 * Supported key data types in Kasane.
 */
export type KeyType = "INT" | "BOOLEAN" | "TEXT";