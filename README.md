# Kasane-TypeScript

**Kasane-TypeScript** is a TypeScript wrapper that provides API for Kasane 4-dimensional space-time database engine. It provides high-level API for managing spatial and temporal data in web browsers and Node.js through WebAssembly.

## 🌱 Features

- **4D Data Management**: Process space-time data with X, Y, F (altitude), T (time) dimensions
- **Dual ID System**: Support both Space ID (static position) and Space-Time ID (temporal data)
- **Logical Operations**: Union (OR), intersection (AND), complement (NOT), exclusive or (XOR) operations
- **Flexible Range Notation**: Express ranges, infinite boundaries, complex queries
- **Type-safe API**: Complete TypeScript support with comprehensive type definitions
- **Value Filtering**: Query data with value conditions using type-safe filters
- **WebAssembly Powered**: Cross-platform support with Rust-based WASM core

## 📦 Installation

```bash
npm install kasane-client
```

## 🚀 Quick Start

```typescript
import { Kasane } from "kasane-client";

// Initialize from WASM URL
let kasane = await Kasane.init("https://cdn.example.com/kasane.wasm");

// Create space and keys
kasane.addSpace({ space: "smart_city" });
let test = kasane.space("smart_city");
test.addKey({ key: "temperature", type: "INT" });
test.addKey({ key: "location_name", type: "TEXT" });

// Store spatial data (static position - mountain peak)
let location = test.key("location_name");
location.setValue({
  range: { z: 10, x: [100], y: [200], i: 0, f: [1500], t: ["-"] },
  value: "Mount Fuji",
});

// Store temporal data (sensor reading)
let temp = test.key("temperature");
temp.setValue({
  range: { z: 10, x: [100], y: [200], i: 60, f: [10], t: [1000] },
  value: 25,
});

// Query data
let values = temp.getValue({
  range: { z: 10, x: [100], y: [200], i: 60, f: [10], t: [1000] },
});

console.log("Temperature:", values[0].value);
```

## 🔍 Space ID and Space-Time ID

Kasane distinguishes Space ID and Space-Time ID using `i` parameter:

- **Space ID** (`i = 0`, `t = ["-"]`): Express static spatial information like mountains, rivers, buildings that do not change over time
- **Space-Time ID** (`i ≠ 0`): Express information that changes over time like sensor values, moving objects

Both types can operate with each other using logical operations (AND, OR, XOR, NOT) to create complex space-time queries.

```typescript
// Space ID - static landmark (permanent mountain)
let mountain = {
  z: 10,
  x: [100],
  y: [200],
  f: [1500, 2000], // altitude range 1500-2000m
  i: 0, // i=0 indicates Space ID
  t: ["-"], // t="Any" for all time periods
};

// Space-Time ID - sensor reading (changes over time)
let sensorReading = {
  z: 10,
  x: [100],
  y: [200],
  f: [10], // altitude 10m
  i: 300, // i≠0 for 300 second interval
  t: [1000, 1010], // time index range
};
```

## 📐 Value Notation and Range Specification

### DimensionRange Format

Kasane uses standardized array-based notation to specify dimension ranges:

```typescript
// Single value
f: [100]; // altitude exactly 100

// Range (inclusive)
x: [100, 200]; // X coordinate from 100 to 200

// Unlimited range
f: ["-", 100]; // all altitudes up to 100
x: [200, "-"]; // X coordinate from 200 to infinity
y: ["-"]; // all Y coordinates (any value)
```

### Complex Range Examples

```typescript
// Point position
let point = { z: 10, x: [100], y: [200], f: [50], i: 60, t: [1000] };

// Area range
let area = {
  z: 10,
  x: [100, 200],
  y: [150, 250],
  f: [0, 100],
  i: 60,
  t: [1000, 2000],
};

// Infinite range
let infiniteHeight = {
  z: 10,
  x: [100],
  y: [200],
  f: [1000, "-"],
  i: 0,
  t: ["-"],
};

// Using utility methods
let range = {
  z: 10,
  x: Kasane.range.between(100, 200), // [100, 200]
  y: Kasane.range.single(150), // [150]
  f: Kasane.range.after(50), // [50, "-"]
  i: 60,
  t: Kasane.range.any(), // ["-"]
};
```

## 🔧 API Reference

### Initialization

#### `Kasane.init(wasmUrl: string, debug?: boolean): Promise<Kasane>`

Initialize Kasane by loading WASM module from specified URL.

```typescript
// Basic initialization
let kasane = await Kasane.init("/path/to/kasane.wasm");

// With debug logging
let kasane = await Kasane.init("/path/to/kasane.wasm", true);
```

### Space Management

#### `addSpace(params: { space: string }): void`

Create new space (database).

#### `deleteSpace(params: { space: string }): void`

Delete existing space and all its data.

#### `showSpaces(): string[]`

Return list of all space names.

#### `space(name: string)`

Return space operation object.

```typescript
kasane.addSpace({ space: "smart_city" });
kasane.addSpace({ space: "weather_data" });

let spaces = kasane.showSpaces();
console.log(spaces); // ["smart_city", "weather_data"]

let test = kasane.space("smart_city");

kasane.deleteSpace({ space: "weather_data" });
```

### Key Management

#### `test.addKey(params: { key: string, type: KeyType }): void`

Create new key with specified data type ("INT", "BOOLEAN", or "TEXT").

#### `test.deleteKey(params: { key: string }): void`

Delete existing key and all related data.

#### `test.showKeys(): string[]`

Return list of all keys in specified space.

#### `test.key(name: string)`

Return key operation object.

```typescript
let test = kasane.space("smart_city");
test.addKey({ key: "temperature", type: "INT" });
test.addKey({ key: "is_operational", type: "BOOLEAN" });
test.addKey({ key: "device_name", type: "TEXT" });

let keys = test.showKeys();
console.log(keys); // ["temperature", "is_operational", "device_name"]

let temp = test.key("temperature");
```

### Value Operations

#### `temp.setValue(params: { range: Range, value: ValueEntry }): void`

Set value and **overwrite existing data**. This is the main method for data storage.

#### `temp.putValue(params: { range: Range, value: ValueEntry }): void`

Add value **only if data does not exist** in specified range. Throws error if data already exists.

#### `temp.getValue(params: { range: Range, options?: OutputOptions }): GetValueOutput[]`

Get values with detailed spatial information.

#### `temp.deleteValue(params: { range: Range }): void`

Delete values in specified range.

```typescript
// Set value (overwrite existing)
let test = kasane.space("smart_city");
let temp = test.key("temperature");
temp.setValue({
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  value: 25,
});

// Get value with options
let values = temp.getValue({
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  options: { vertex: true, center: true },
});

// Delete value
temp.deleteValue({
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
});
```

### Query Operations

#### `select(params: { range: Range, options?: OutputOptions }): SelectOutput[]`

Select space-time regions without getting values. Useful for spatial analysis.

```typescript
let regions = kasane.select({
  range: {
    OR: [
      { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
      { z: 10, x: [101], y: [201], f: [10], i: 300, t: [1000] },
    ],
  },
  options: { vertex: true, center: true },
});
```

## 🔀 Logical Operations

Kasane supports complex logical operations to combine ranges:

### Basic Logical Operations

```typescript
// OR operation - union of ranges
let orRange = {
  OR: [
    { z: 10, x: [100], y: [200], f: [10], i: 60, t: [1000] },
    { z: 10, x: [101], y: [201], f: [10], i: 60, t: [1000] },
  ],
};

// AND operation - intersection of ranges
let andRange = {
  AND: [
    {
      z: 10,
      x: [100, 200],
      y: [100, 200],
      f: [0, 100],
      i: 60,
      t: [1000, 2000],
    },
    {
      z: 10,
      x: [150, 250],
      y: [150, 250],
      f: [50, 150],
      i: 60,
      t: [1500, 2500],
    },
  ],
};

// XOR operation - exclusive or
let xorRange = {
  XOR: [
    { z: 10, x: [100, 200], y: [100, 200], f: [10], i: 60, t: [1000] },
    { z: 10, x: [150, 250], y: [150, 250], f: [10], i: 60, t: [1000] },
  ],
};

// NOT operation - complement
let notRange = {
  NOT: [{ z: 10, x: [100, 200], y: [100, 200], f: [10], i: 60, t: [1000] }],
};
```

### Using Static Helper Methods

```typescript
// Using Kasane.range helper methods
let complexRange = Kasane.range.and(
  { z: 10, x: [100, 200], y: [100, 200], f: [0, 100], i: 60, t: [1000, 2000] },
  Kasane.range.or(
    { z: 10, x: [150], y: [150], f: [50], i: 60, t: [1500] },
    { z: 10, x: [175], y: [175], f: [75], i: 60, t: [1750] }
  )
);
```

## 🎯 Value Filtering

Kasane provides type-safe filtering for data queries based on values:

### Filter Operations

```typescript
// Integer filter
let temperatureRange = {
  Filter: {
    space: "smart_city",
    key: "temperature",
    filter: { int: { greaterThan: 20, lessThan: 30 } },
  },
};

// Boolean filter
let operationalDevices = {
  Filter: {
    space: "smart_city",
    key: "is_operational",
    filter: { boolean: { isTrue: true } },
  },
};

// Text filter
let deviceNames = {
  Filter: {
    space: "smart_city",
    key: "device_name",
    filter: { text: { contains: "sensor" } },
  },
};

// Existence check (no specific value filter)
let hasData = {
  HasValue: {
    space: "smart_city",
    key: "temperature",
  },
};
```

### Using Static Filter Methods

```typescript
// Integer filter helpers
let intFilter = Kasane.filter.int.between(20, 30);
let boolFilter = Kasane.filter.boolean.isTrue();
let textFilter = Kasane.filter.text.contains("sensor");

// Creating filter ranges
let filterRange = Kasane.range.filter("smart_city", "temperature", intFilter);
```

## 📊 Output Options

Configure information returned by `getValue` and `select` operations:

```typescript
// All information
let allInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: someRange,
  options: Kasane.options.all(),
});

// Spatial information only
let spatialInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature", 
  range: someRange,
  options: Kasane.options.spatial(),
});

// Custom options
let customInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: someRange,
  options: {
    vertex: true, // include 8 corner vertices
    center: true, // include center point
    id_string: true, // include string representation
    id_pure: false, // output with IPA standard (non-extended) ID
  },
});
```

## 🧪 Usage Examples

### Smart City Sensor Network

```typescript
// System initialization
let kasane = await Kasane.init("/path/to/kasane.wasm");

// Database setup
kasane.addSpace({ space: "smart_city" });
let city = kasane.space("smart_city");
city.addKey({ key: "temperature", type: "INT" });
city.addKey({ key: "humidity", type: "INT" });
city.addKey({ key: "air_quality", type: "TEXT" });
city.addKey({ key: "is_operational", type: "BOOLEAN" });

// Store sensor data across the city
let sensors = [
  {
    x: 100,
    y: 100,
    temp: 22,
    humidity: 65,
    quality: "good",
    operational: true,
  },
  {
    x: 200,
    y: 200,
    temp: 25,
    humidity: 70,
    quality: "moderate",
    operational: true,
  },
  {
    x: 300,
    y: 300,
    temp: 28,
    humidity: 75,
    quality: "poor",
    operational: false,
  },
];

let tempKey = city.key("temperature");
let humidityKey = city.key("humidity");
let qualityKey = city.key("air_quality");
let operationalKey = city.key("is_operational");

sensors.forEach((sensor, index) => {
  let baseRange = {
    z: 10,
    x: [sensor.x],
    y: [sensor.y],
    f: [10],
    i: 300,
    t: [1000 + index],
  };

  tempKey.setValue({ range: baseRange, value: sensor.temp });
  humidityKey.setValue({ range: baseRange, value: sensor.humidity });
  qualityKey.setValue({ range: baseRange, value: sensor.quality });
  operationalKey.setValue({ range: baseRange, value: sensor.operational });
});

// Query hot areas
let hotAreas = tempKey.getValue({
  range: {
    AND: [
      { z: 10, x: [0, 400], y: [0, 400], f: [10], i: 300, t: [1000, 1010] },
      {
        Filter: {
          space: "smart_city",
          key: "temperature",
          filter: { int: { greaterThan: 24 } },
        },
      },
    ],
  },
});

console.log(`Found ${hotAreas.length} hot areas`);
```

### Spatial and Temporal Data Integration

```typescript
// Store static geographical features (Space ID)
kasane.addSpace({ space: "geography" });
let geography = kasane.space("geography");
geography.addKey({ key: "elevation", type: "INT" });
let elevation = geography.key("elevation");
elevation.setValue({
  range: {
    z: 8,
    x: [1000, 1100],
    y: [2000, 2100],
    f: [500, 800],
    i: 0,
    t: ["-"],
  },
  value: 650, // average elevation
});

// Store dynamic weather data (Space-Time ID)
kasane.addSpace({ space: "weather" });
let weather = kasane.space("weather");
weather.addKey({ key: "rainfall", type: "INT" });
let rainfall = weather.key("rainfall");
rainfall.setValue({
  range: { z: 8, x: [1050], y: [2050], f: [10], i: 3600, t: [24] }, // hourly data
  value: 5.2, // mm/hour
});

// Search weather data in mountainous areas
let mountainWeather = rainfall.getValue({
  range: {
    AND: [
      // weather observation points
      { z: 8, x: [1000, 1100], y: [2000, 2100], f: [10], i: 3600, t: [20, 30] },
      // high elevation areas (spatial filter)
      {
        Filter: {
          space: "geography",
          key: "elevation",
          filter: { int: { greaterThan: 600 } },
        },
      },
    ],
  },
});
```

## 🛠️ Utility Methods

### Version Information

```typescript
let version = kasane.getVersion();
console.log(`Kasane WASM version: ${version}`);
```

### Static Utilities

```typescript
// Range creation helpers
let singlePoint = Kasane.range.single(100); // [100]
let rangeValues = Kasane.range.between(100, 200); // [100, 200]
let openRange = Kasane.range.after(100); // [100, "-"]
let anyValue = Kasane.range.any(); // ["-"]

// Logical operation helpers
let orOperation = Kasane.range.or(range1, range2, range3);
let andOperation = Kasane.range.and(range1, range2);
let notOperation = Kasane.range.not(range1);

// Filter helpers
let numericFilter = Kasane.filter.int.between(10, 20);
let textFilter = Kasane.filter.text.startsWith("sensor_");
let boolFilter = Kasane.filter.boolean.isTrue();
```

## 📋 Complete API Reference

### Core Types

- `Range`: Space-time range specification with logical operation support
- `SpaceTimeId`: 4D identifier with z, f, x, y, i, t dimensions
- `DimensionRange`: Array-based range notation for dimensions
- `ValueEntry`: Data values (numeric, string, boolean)
- `KeyType`: Data type specification ("INT", "BOOLEAN", "TEXT")

### Method Categories

- **Initialization**: `Kasane.init()`
- **Space Management**: `addSpace()`, `deleteSpace()`, `showSpaces()`
- **Key Management**: `addKey()`, `deleteKey()`, `showKeys()`
- **Value Operations**: `setValue()`, `putValue()`, `getValue()`, `deleteValue()`
- **Query Operations**: `select()`
- **Utilities**: `getVersion()`

### Static Helpers

- **Range Creation**: `Kasane.range.*`
- **Filter Creation**: `Kasane.filter.*`
- **Output Options**: `Kasane.options.*`

## 🤝 Contributing

We welcome all contributions including bug reports, feature requests, documentation improvements, and code enhancements.

## 📄 License

This project follows the license terms of the underlying Kasane WASM library.

## 🔗 Related Projects

- [Kasane Logic](https://github.com/AirBee-Project/Kasane) - Core Rust library providing space-time algorithms
- [Kasane WASM](https://github.com/AirBee-Project/Kasane) - WebAssembly bindings for Kasane logic library

---

For detailed usage examples and step-by-step tutorials, see [Tutorial](./TUTORIAL_JA.md).