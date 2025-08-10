# Kasane WASM

**Kasane WASM** is a TypeScript wrapper for the Kasane 4-dimensional space-time database engine. It provides a high-level API for managing spatial and temporal data in web browsers and Node.js environments through WebAssembly.

[🇯🇵 日本語版](./README_JA.md) | [📚 Tutorial (Japanese)](./TUTORIAL_JA.md)

## 🌱 Features

- **4-dimensional data management**: Handle space-time data with X, Y, F (altitude), and T (time) dimensions
- **Dual ID system**: Support for both spatial IDs (static locations) and space-time IDs (temporal data)
- **Logical operations**: Union (OR), intersection (AND), complement (NOT), and exclusive OR (XOR) operations
- **Flexible range notation**: Express ranges, infinite bounds, and complex queries
- **Type-safe API**: Full TypeScript support with comprehensive type definitions
- **Value filtering**: Query data by value conditions with type-safe filters
- **WebAssembly powered**: Cross-platform compatibility using Rust-based WASM core

## 📦 Installation

```bash
npm install kasane-client
```

## 🚀 Quick Start

```typescript
import { Kasane } from "kasane-client";

// Initialize from WASM URL
const kasane = await Kasane.init("https://cdn.example.com/kasane.wasm");

// Create space and keys
kasane.addSpace({ space: "sensor_data" });
kasane.addKey({ space: "sensor_data", key: "temperature", type: "INT" });
kasane.addKey({ space: "sensor_data", key: "location_name", type: "TEXT" });

// Store spatial data (static location - mountain peak)
kasane.setValue({
  space: "sensor_data",
  key: "location_name",
  range: { z: 10, x: 100, y: 200, i: 0, f: [1500], t: ["-"] }, // i=0 for spatial ID
  value: "Mount Fuji"
});

// Store temporal data (sensor reading)
kasane.setValue({
  space: "sensor_data",
  key: "temperature",
  range: { z: 10, x: 100, y: 200, i: 60, f: [10], t: [1000] }, // i≠0 for space-time ID
  value: 25
});

// Query data
const values = kasane.getValue({
  space: "sensor_data",
  key: "temperature",
  range: { z: 10, x: 100, y: 200, i: 60, f: [10], t: [1000] }
});

console.log("Temperature:", values[0].value);
```

## 🔍 Spatial ID vs Space-Time ID

Kasane distinguishes between two types of identifiers using the `i` parameter:

- **Spatial ID** (`i = 0`, `t = ["-"]`): Represents static spatial information like mountains, rivers, buildings, or any fixed geographic features that don't change over time
- **Space-Time ID** (`i ≠ 0`): Represents temporal data that changes over time, such as sensor readings, vehicle positions, or any time-varying information

Both types can perform logical operations (AND, OR, XOR, NOT) with each other, enabling complex spatial-temporal queries.

```typescript
// Spatial ID - Static landmark (permanent mountain)
const mountain = {
  z: 10,
  x: [100], 
  y: [200], 
  f: [1500, 2000], // Altitude range 1500-2000m
  i: 0,            // i=0 indicates spatial ID
  t: ["-"]         // t="Any" for all time periods
};

// Space-Time ID - Sensor reading (changes over time)
const sensorReading = {
  z: 10,
  x: [100], 
  y: [200], 
  f: [10],         // 10m altitude
  i: 300,          // i≠0 with 300-second intervals
  t: [1000, 1010]  // Time index range
};
```

## 📐 Value Notation and Range Specifications

### DimensionRange Format

Kasane uses a standardized array-based notation for specifying dimension ranges:

```typescript
// Single value
f: [100]              // Exactly altitude 100

// Range (inclusive)
x: [100, 200]         // X coordinates from 100 to 200

// Unlimited ranges
f: ["-", 100]         // All altitudes up to 100
x: [200, "-"]         // All X coordinates from 200 onwards
y: ["-"]              // All Y coordinates (any value)
```

### Complex Range Examples

```typescript
// Point location
const point = { z: 10, x: [100], y: [200], f: [50], i: 60, t: [1000] };

// Area range
const area = { z: 10, x: [100, 200], y: [150, 250], f: [0, 100], i: 60, t: [1000, 2000] };

// Infinite ranges
const infiniteHeight = { z: 10, x: [100], y: [200], f: [1000, "-"], i: 0, t: ["-"] };

// Using utility methods
const range = {
  z: 10,
  x: Kasane.range.between(100, 200),    // [100, 200]
  y: Kasane.range.single(150),          // [150]
  f: Kasane.range.after(50),            // [50, "-"]
  i: 60,
  t: Kasane.range.any()                 // ["-"]
};
```

## 🔧 API Reference

### Initialization

#### `Kasane.init(wasmUrl: string, debug?: boolean): Promise<Kasane>`

Initializes Kasane by loading the WASM module from the specified URL.

```typescript
// Basic initialization
const kasane = await Kasane.init("/path/to/kasane.wasm");

// With debug logging
const kasane = await Kasane.init("/path/to/kasane.wasm", true);
```

### Space Management

#### `addSpace(params: { space: string }): void`

Creates a new space (database).

#### `deleteSpace(params: { space: string }): void`

Deletes an existing space and all its data.

#### `getSpaces(): string[]`

Returns a list of all space names.

```typescript
kasane.addSpace({ space: "smart_city" });
kasane.addSpace({ space: "weather_data" });

const spaces = kasane.getSpaces();
console.log(spaces); // ["smart_city", "weather_data"]

kasane.deleteSpace({ space: "weather_data" });
```

### Key Management

#### `addKey(params: { space: string, key: string, type: KeyType }): void`

Creates a new key with specified data type (`"INT"`, `"BOOLEAN"`, or `"TEXT"`).

#### `deleteKey(params: { space: string, key: string }): void`

Deletes an existing key and all associated data.

#### `getKeys(params: { space: string }): string[]`

Returns a list of all keys in the specified space.

```typescript
kasane.addKey({ space: "smart_city", key: "temperature", type: "INT" });
kasane.addKey({ space: "smart_city", key: "is_operational", type: "BOOLEAN" });
kasane.addKey({ space: "smart_city", key: "device_name", type: "TEXT" });

const keys = kasane.getKeys({ space: "smart_city" });
console.log(keys); // ["temperature", "is_operational", "device_name"]
```

### Value Operations

#### `setValue(params: { space: string, key: string, range: Range, value: ValueEntry }): void`

Sets a value, **overwriting existing data**. This is the primary method for storing data.

#### `putValue(params: { space: string, key: string, range: Range, value: ValueEntry }): void`

Adds a value **only if no data exists** at the specified range. Throws an error if data already exists.

#### `getValue(params: { space: string, key: string, range: Range, options?: OutputOptions }): GetValueOutput[]`

Retrieves values with detailed spatial information.

#### `deleteValue(params: { space: string, key: string, range: Range }): void`

Deletes values in the specified range.

```typescript
// Set value (overwrites existing)
kasane.setValue({
  space: "smart_city",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  value: 25
});

// Get value with options
const values = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  options: { vertex: true, center: true }
});

// Delete value
kasane.deleteValue({
  space: "smart_city",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] }
});
```

### Query Operations

#### `select(params: { range: Range, options?: OutputOptions }): SelectOutput[]`

Selects space-time regions without retrieving values. Useful for spatial analysis.

```typescript
const regions = kasane.select({
  range: {
    OR: [
      { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
      { z: 10, x: [101], y: [201], f: [10], i: 300, t: [1000] }
    ]
  },
  options: { vertex: true, center: true }
});
```

## 🔀 Logical Operations

Kasane supports complex logical operations for combining ranges:

### Basic Logical Operations

```typescript
// OR operation - Union of ranges
const orRange = {
  OR: [
    { z: 10, x: [100], y: [200], f: [10], i: 60, t: [1000] },
    { z: 10, x: [101], y: [201], f: [10], i: 60, t: [1000] }
  ]
};

// AND operation - Intersection of ranges
const andRange = {
  AND: [
    { z: 10, x: [100, 200], y: [100, 200], f: [0, 100], i: 60, t: [1000, 2000] },
    { z: 10, x: [150, 250], y: [150, 250], f: [50, 150], i: 60, t: [1500, 2500] }
  ]
};

// XOR operation - Exclusive OR
const xorRange = {
  XOR: [
    { z: 10, x: [100, 200], y: [100, 200], f: [10], i: 60, t: [1000] },
    { z: 10, x: [150, 250], y: [150, 250], f: [10], i: 60, t: [1000] }
  ]
};

// NOT operation - Complement
const notRange = {
  NOT: [
    { z: 10, x: [100, 200], y: [100, 200], f: [10], i: 60, t: [1000] }
  ]
};
```

### Using Static Helper Methods

```typescript
// Using Kasane.range helper methods
const complexRange = Kasane.range.and(
  { z: 10, x: [100, 200], y: [100, 200], f: [0, 100], i: 60, t: [1000, 2000] },
  Kasane.range.or(
    { z: 10, x: [150], y: [150], f: [50], i: 60, t: [1500] },
    { z: 10, x: [175], y: [175], f: [75], i: 60, t: [1750] }
  )
);
```

## 🎯 Value Filtering

Kasane provides type-safe filtering for querying data based on values:

### Filter Operations

```typescript
// Integer filters
const temperatureRange = {
  Filter: {
    space: "smart_city",
    key: "temperature",
    filter: { int: { greaterThan: 20, lessThan: 30 } }
  }
};

// Boolean filters
const operationalDevices = {
  Filter: {
    space: "smart_city",
    key: "is_operational",
    filter: { boolean: { isTrue: true } }
  }
};

// Text filters
const deviceNames = {
  Filter: {
    space: "smart_city",
    key: "device_name",
    filter: { text: { contains: "sensor" } }
  }
};

// Existence checks (no specific value filter)
const hasData = {
  HasValue: {
    space: "smart_city",
    key: "temperature"
  }
};
```

### Using Static Filter Methods

```typescript
// Integer filter helpers
const intFilter = Kasane.filter.int.between(20, 30);
const boolFilter = Kasane.filter.boolean.isTrue();
const textFilter = Kasane.filter.text.contains("sensor");

// Create filter range
const filterRange = Kasane.range.filter("smart_city", "temperature", intFilter);
```

## 📊 Output Options

Configure what information is returned by `getValue` and `select` operations:

```typescript
// All information
const allInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: someRange,
  options: Kasane.options.all()
});

// Only spatial information
const spatialInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature", 
  range: someRange,
  options: Kasane.options.spatial()
});

// Custom options
const customInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: someRange,
  options: {
    vertex: true,    // Include 8 corner vertices
    center: true,    // Include center point
    id_string: true, // Include string representation
    id_pure: false   // Exclude pure ID expansion
  }
});
```

## 🧪 Usage Examples

### Smart City Sensor Network

```typescript
// Initialize system
const kasane = await Kasane.init("/path/to/kasane.wasm");

// Setup database
kasane.addSpace({ space: "smart_city" });
kasane.addKey({ space: "smart_city", key: "temperature", type: "INT" });
kasane.addKey({ space: "smart_city", key: "humidity", type: "INT" });
kasane.addKey({ space: "smart_city", key: "air_quality", type: "TEXT" });
kasane.addKey({ space: "smart_city", key: "is_operational", type: "BOOLEAN" });

// Store sensor data across the city
const sensors = [
  { x: 100, y: 100, temp: 22, humidity: 65, quality: "good", operational: true },
  { x: 200, y: 200, temp: 25, humidity: 70, quality: "moderate", operational: true },
  { x: 300, y: 300, temp: 28, humidity: 75, quality: "poor", operational: false }
];

sensors.forEach((sensor, index) => {
  const baseRange = { z: 10, x: [sensor.x], y: [sensor.y], f: [10], i: 300, t: [1000 + index] };
  
  kasane.setValue({ space: "smart_city", key: "temperature", range: baseRange, value: sensor.temp });
  kasane.setValue({ space: "smart_city", key: "humidity", range: baseRange, value: sensor.humidity });
  kasane.setValue({ space: "smart_city", key: "air_quality", range: baseRange, value: sensor.quality });
  kasane.setValue({ space: "smart_city", key: "is_operational", range: baseRange, value: sensor.operational });
});

// Query high temperature areas
const hotAreas = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: {
    AND: [
      { z: 10, x: [0, 400], y: [0, 400], f: [10], i: 300, t: [1000, 1010] },
      { Filter: { space: "smart_city", key: "temperature", filter: { int: { greaterThan: 24 } } } }
    ]
  }
});

console.log(`Found ${hotAreas.length} hot areas`);
```

### Spatial and Temporal Data Integration

```typescript
// Store static geographic features (spatial IDs)
kasane.setValue({
  space: "geography",
  key: "elevation",
  range: { z: 8, x: [1000, 1100], y: [2000, 2100], f: [500, 800], i: 0, t: ["-"] },
  value: 650 // Average elevation
});

// Store dynamic weather data (space-time IDs)
kasane.setValue({
  space: "weather",
  key: "rainfall",
  range: { z: 8, x: [1050], y: [2050], f: [10], i: 3600, t: [24] }, // Hourly data
  value: 5.2 // mm per hour
});

// Find weather data in mountainous areas
const mountainWeather = kasane.getValue({
  space: "weather",
  key: "rainfall",
  range: {
    AND: [
      // Weather measurement locations
      { z: 8, x: [1000, 1100], y: [2000, 2100], f: [10], i: 3600, t: [20, 30] },
      // High elevation areas (spatial filter)
      { Filter: { space: "geography", key: "elevation", filter: { int: { greaterThan: 600 } } } }
    ]
  }
});
```

## 🛠️ Utility Methods

### Version Information

```typescript
const version = kasane.getVersion();
console.log(`Kasane WASM version: ${version}`);
```

### Static Utilities

```typescript
// Range creation helpers
const singlePoint = Kasane.range.single(100);           // [100]
const rangeValues = Kasane.range.between(100, 200);     // [100, 200]
const openRange = Kasane.range.after(100);              // [100, "-"]
const anyValue = Kasane.range.any();                    // ["-"]

// Logical operation helpers
const orOperation = Kasane.range.or(range1, range2, range3);
const andOperation = Kasane.range.and(range1, range2);
const notOperation = Kasane.range.not(range1);

// Filter helpers
const numericFilter = Kasane.filter.int.between(10, 20);
const textFilter = Kasane.filter.text.startsWith("sensor_");
const boolFilter = Kasane.filter.boolean.isTrue();
```

## 📋 Complete API Reference

### Core Types

- `Range`: Space-time range specification supporting logical operations
- `SpaceTimeId`: 4D identifier with z, f, x, y, i, t dimensions
- `DimensionRange<T>`: Array-based range notation for dimensions
- `ValueEntry`: Data values (number, string, boolean)
- `KeyType`: Data type specification ("INT", "BOOLEAN", "TEXT")

### Method Categories

- **Initialization**: `Kasane.init()`
- **Space Management**: `addSpace()`, `deleteSpace()`, `getSpaces()`
- **Key Management**: `addKey()`, `deleteKey()`, `getKeys()`
- **Value Operations**: `setValue()`, `putValue()`, `getValue()`, `deleteValue()`
- **Query Operations**: `select()`
- **Utilities**: `getVersion()`

### Static Helpers

- **Range Creation**: `Kasane.range.*`
- **Filter Creation**: `Kasane.filter.*`
- **Output Options**: `Kasane.options.*`

## 🤝 Contributing

We welcome contributions including bug reports, feature requests, documentation improvements, and code enhancements.

## 📄 License

This project follows the licensing terms of the underlying Kasane WASM library.

## 🔗 Related Projects

- [Kasane Logic](https://github.com/AirBee-Project/Kasane) - The core Rust library providing the spatial-temporal algorithms
- [Kasane WASM](https://github.com/AirBee-Project/Kasane) - WebAssembly bindings for the Kasane logic library

---

For detailed usage examples and step-by-step tutorials, see the [Japanese Tutorial](./TUTORIAL_JA.md).