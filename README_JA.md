# Kasane-TypeScript

**Kasane-TypeScript** は、 4 次元時空間データベースエンジンの Kasane の API を提供する TypeScript ラッパーです。WebAssembly を通じて、Web ブラウザーおよび Node.js 環境で空間と時間データを管理するための高レベル API を提供します。

[🇬🇧 English Version](./README.md) | [📚 チュートリアル](./TUTORIAL_JA.md)

## 🌱 特長

- **4 次元データ管理**: X、Y、F（高度）、T（時間）次元による時空間データの処理
- **デュアル ID システム**: 空間 ID（静的位置）と時空間 ID（時間的データ）の両方をサポート
- **論理演算**: 和集合（OR）、積集合（AND）、補集合（NOT）、排他的論理和（XOR）演算
- **柔軟な範囲記法**: 範囲、無限境界、複雑なクエリの表現
- **型安全 API**: 包括的な型定義による完全な TypeScript サポート
- **値フィルタリング**: 型安全フィルターによる値条件でのデータクエリ
- **WebAssembly 駆動**: Rust ベースの WASM コアによるクロスプラットフォーム対応

## 📦 インストール

```bash
npm install kasane-client
```

## 🚀 クイックスタート

```typescript
import { Kasane } from "kasane-client";

// WASM URLから初期化
const kasane = await Kasane.init("https://cdn.example.com/kasane.wasm");

// スペースとキーを作成
kasane.addSpace({ space: "sensor_data" });
kasane.addKey({ space: "sensor_data", key: "temperature", type: "INT" });
kasane.addKey({ space: "sensor_data", key: "location_name", type: "TEXT" });

// 空間データの保存（静的位置 - 山頂）
kasane.setValue({
  space: "sensor_data",
  key: "location_name",
  range: { z: 10, x: [100], y: [200], i: 0, f: [1500], t: ["-"] }, // i=0 で空間ID
  value: "富士山",
});

// 時間データの保存（センサー読取値）
kasane.setValue({
  space: "sensor_data",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], i: 60, f: [10], t: [1000] }, // i≠0 で時空間ID
  value: 25,
});

// データクエリ
const values = kasane.getValue({
  space: "sensor_data",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], i: 60, f: [10], t: [1000] },
});

console.log("温度:", values[0].value);
```

## 🔍 空間 ID と時空間 ID

Kasane は`i`パラメータによって空間 ID と時空間 ID を区別します：

- **空間 ID** (`i = 0`, `t = ["-"]`): 山や川、建物など、時間の経過によって変化しない静的な空間情報を表現
- **時空間 ID** (`i ≠ 0`): センサー値や移動物体など、時間によって変化する情報を表現

両タイプは論理演算（AND、OR、XOR、NOT）を使って相互に演算でき、複雑な時空間クエリを作成できます。

```typescript
// 空間ID - 静的ランドマーク（永続的な山）
const mountain = {
  z: 10,
  x: [100],
  y: [200],
  f: [1500, 2000], // 高度範囲 1500-2000m
  i: 0, // i=0 は空間IDを示す
  t: ["-"], // t="Any" で全時間期間
};

// 時空間ID - センサー読取値（時間とともに変化）
const sensorReading = {
  z: 10,
  x: [100],
  y: [200],
  f: [10], // 高度10m
  i: 300, // i≠0 で300秒間隔
  t: [1000, 1010], // 時間インデックス範囲
};
```

## 📐 値の記法と範囲指定

### DimensionRange 形式

Kasane は次元範囲を指定するために標準化された配列ベースの記法を使用します：

```typescript
// 単一値
f: [100]; // 高度ちょうど100

// 範囲（包含的）
x: [100, 200]; // X座標100から200まで

// 無制限範囲
f: ["-", 100]; // 高度100まで全て
x: [200, "-"]; // X座標200から無限大まで
y: ["-"]; // 全てのY座標（任意の値）
```

### 複雑な範囲の例

```typescript
// 点位置
const point = { z: 10, x: [100], y: [200], f: [50], i: 60, t: [1000] };

// エリア範囲
const area = {
  z: 10,
  x: [100, 200],
  y: [150, 250],
  f: [0, 100],
  i: 60,
  t: [1000, 2000],
};

// 無限範囲
const infiniteHeight = {
  z: 10,
  x: [100],
  y: [200],
  f: [1000, "-"],
  i: 0,
  t: ["-"],
};

// ユーティリティメソッドの使用
const range = {
  z: 10,
  x: Kasane.range.between(100, 200), // [100, 200]
  y: Kasane.range.single(150), // [150]
  f: Kasane.range.after(50), // [50, "-"]
  i: 60,
  t: Kasane.range.any(), // ["-"]
};
```

## 🔧 API リファレンス

### 初期化

#### `Kasane.init(wasmUrl: string, debug?: boolean): Promise<Kasane>`

指定された URL から WASM モジュールを読み込んで Kasane を初期化します。

```typescript
// 基本初期化
const kasane = await Kasane.init("/path/to/kasane.wasm");

// デバッグログ付き
const kasane = await Kasane.init("/path/to/kasane.wasm", true);
```

### スペース管理

#### `addSpace(params: { space: string }): void`

新しいスペース（データベース）を作成します。

#### `deleteSpace(params: { space: string }): void`

既存のスペースとその全データを削除します。

#### `showSpaces(): string[]`

全スペース名のリストを返します。

```typescript
kasane.addSpace({ space: "smart_city" });
kasane.addSpace({ space: "weather_data" });

const spaces = kasane.showSpaces();
console.log(spaces); // ["smart_city", "weather_data"]

kasane.deleteSpace({ space: "weather_data" });
```

### キー管理

#### `addKey(params: { space: string, key: string, type: KeyType }): void`

指定されたデータ型（`"INT"`、`"BOOLEAN"`、または `"TEXT"`）で新しいキーを作成します。

#### `deleteKey(params: { space: string, key: string }): void`

既存のキーと関連する全データを削除します。

#### `showKeys(params: { space: string }): string[]`

指定されたスペース内の全キーのリストを返します。

```typescript
kasane.addKey({ space: "smart_city", key: "temperature", type: "INT" });
kasane.addKey({ space: "smart_city", key: "is_operational", type: "BOOLEAN" });
kasane.addKey({ space: "smart_city", key: "device_name", type: "TEXT" });

const keys = kasane.showKeys({ space: "smart_city" });
console.log(keys); // ["temperature", "is_operational", "device_name"]
```

### 値操作

#### `setValue(params: { space: string, key: string, range: Range, value: ValueEntry }): void`

値を設定し、**既存データを上書き**します。これがデータ保存の主要メソッドです。

#### `putValue(params: { space: string, key: string, range: Range, value: ValueEntry }): void`

指定範囲に**データが存在しない場合のみ**値を追加します。データが既に存在する場合はエラーをスローします。

#### `getValue(params: { space: string, key: string, range: Range, options?: OutputOptions }): GetValueOutput[]`

詳細な空間情報付きで値を取得します。

#### `deleteValue(params: { space: string, key: string, range: Range }): void`

指定範囲の値を削除します。

```typescript
// 値設定（既存を上書き）
kasane.setValue({
  space: "smart_city",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  value: 25,
});

// オプション付きで値取得
const values = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  options: { vertex: true, center: true },
});

// 値削除
kasane.deleteValue({
  space: "smart_city",
  key: "temperature",
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
});
```

### クエリ操作

#### `select(params: { range: Range, options?: OutputOptions }): SelectOutput[]`

値を取得せずに時空間領域を選択します。空間解析に有用です。

```typescript
const regions = kasane.select({
  range: {
    OR: [
      { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
      { z: 10, x: [101], y: [201], f: [10], i: 300, t: [1000] },
    ],
  },
  options: { vertex: true, center: true },
});
```

## 🔀 論理演算

Kasane は範囲を組み合わせるための複雑な論理演算をサポートします：

### 基本論理演算

```typescript
// OR演算 - 範囲の和集合
const orRange = {
  OR: [
    { z: 10, x: [100], y: [200], f: [10], i: 60, t: [1000] },
    { z: 10, x: [101], y: [201], f: [10], i: 60, t: [1000] },
  ],
};

// AND演算 - 範囲の積集合
const andRange = {
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

// XOR演算 - 排他的論理和
const xorRange = {
  XOR: [
    { z: 10, x: [100, 200], y: [100, 200], f: [10], i: 60, t: [1000] },
    { z: 10, x: [150, 250], y: [150, 250], f: [10], i: 60, t: [1000] },
  ],
};

// NOT演算 - 補集合
const notRange = {
  NOT: [{ z: 10, x: [100, 200], y: [100, 200], f: [10], i: 60, t: [1000] }],
};
```

### 静的ヘルパーメソッドの使用

```typescript
// Kasane.rangeヘルパーメソッドの使用
const complexRange = Kasane.range.and(
  { z: 10, x: [100, 200], y: [100, 200], f: [0, 100], i: 60, t: [1000, 2000] },
  Kasane.range.or(
    { z: 10, x: [150], y: [150], f: [50], i: 60, t: [1500] },
    { z: 10, x: [175], y: [175], f: [75], i: 60, t: [1750] }
  )
);
```

## 🎯 値フィルタリング

Kasane は値に基づいたデータクエリのための型安全フィルタリングを提供します：

### フィルター操作

```typescript
// 整数フィルター
const temperatureRange = {
  Filter: {
    space: "smart_city",
    key: "temperature",
    filter: { int: { greaterThan: 20, lessThan: 30 } },
  },
};

// ブールフィルター
const operationalDevices = {
  Filter: {
    space: "smart_city",
    key: "is_operational",
    filter: { boolean: { isTrue: true } },
  },
};

// テキストフィルター
const deviceNames = {
  Filter: {
    space: "smart_city",
    key: "device_name",
    filter: { text: { contains: "sensor" } },
  },
};

// 存在チェック（特定の値フィルターなし）
const hasData = {
  HasValue: {
    space: "smart_city",
    key: "temperature",
  },
};
```

### 静的フィルターメソッドの使用

```typescript
// 整数フィルターヘルパー
const intFilter = Kasane.filter.int.between(20, 30);
const boolFilter = Kasane.filter.boolean.isTrue();
const textFilter = Kasane.filter.text.contains("sensor");

// フィルター範囲の作成
const filterRange = Kasane.range.filter("smart_city", "temperature", intFilter);
```

## 📊 出力オプション

`getValue`と`select`操作で返される情報を設定します：

```typescript
// 全情報
const allInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: someRange,
  options: Kasane.options.all(),
});

// 空間情報のみ
const spatialInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: someRange,
  options: Kasane.options.spatial(),
});

// カスタムオプション
const customInfo = kasane.getValue({
  space: "smart_city",
  key: "temperature",
  range: someRange,
  options: {
    vertex: true, // 8つの角頂点を含む
    center: true, // 中心点を含む
    id_string: true, // 文字列表現を含む
    id_pure: false, // IPAの定義通りの（拡張していない）IDで出力
  },
});
```

## 🧪 使用例

### スマートシティセンサーネットワーク

```typescript
// システム初期化
const kasane = await Kasane.init("/path/to/kasane.wasm");

// データベースセットアップ
kasane.addSpace({ space: "smart_city" });
kasane.addKey({ space: "smart_city", key: "temperature", type: "INT" });
kasane.addKey({ space: "smart_city", key: "humidity", type: "INT" });
kasane.addKey({ space: "smart_city", key: "air_quality", type: "TEXT" });
kasane.addKey({ space: "smart_city", key: "is_operational", type: "BOOLEAN" });

// 市内全域のセンサーデータを保存
const sensors = [
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

sensors.forEach((sensor, index) => {
  const baseRange = {
    z: 10,
    x: [sensor.x],
    y: [sensor.y],
    f: [10],
    i: 300,
    t: [1000 + index],
  };

  kasane.setValue({
    space: "smart_city",
    key: "temperature",
    range: baseRange,
    value: sensor.temp,
  });
  kasane.setValue({
    space: "smart_city",
    key: "humidity",
    range: baseRange,
    value: sensor.humidity,
  });
  kasane.setValue({
    space: "smart_city",
    key: "air_quality",
    range: baseRange,
    value: sensor.quality,
  });
  kasane.setValue({
    space: "smart_city",
    key: "is_operational",
    range: baseRange,
    value: sensor.operational,
  });
});

// 高温エリアのクエリ
const hotAreas = kasane.getValue({
  space: "smart_city",
  key: "temperature",
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

console.log(`${hotAreas.length}個の高温エリアが見つかりました`);
```

### 空間データと時間データの統合

```typescript
// 静的地理的特徴の保存（空間ID）
kasane.setValue({
  space: "geography",
  key: "elevation",
  range: {
    z: 8,
    x: [1000, 1100],
    y: [2000, 2100],
    f: [500, 800],
    i: 0,
    t: ["-"],
  },
  value: 650, // 平均標高
});

// 動的気象データの保存（時空間ID）
kasane.setValue({
  space: "weather",
  key: "rainfall",
  range: { z: 8, x: [1050], y: [2050], f: [10], i: 3600, t: [24] }, // 時間単位データ
  value: 5.2, // mm/時
});

// 山岳地帯の気象データを検索
const mountainWeather = kasane.getValue({
  space: "weather",
  key: "rainfall",
  range: {
    AND: [
      // 気象観測地点
      { z: 8, x: [1000, 1100], y: [2000, 2100], f: [10], i: 3600, t: [20, 30] },
      // 高標高エリア（空間フィルター）
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

## 🛠️ ユーティリティメソッド

### バージョン情報

```typescript
const version = kasane.getVersion();
console.log(`Kasane WASMバージョン: ${version}`);
```

### 静的ユーティリティ

```typescript
// 範囲作成ヘルパー
const singlePoint = Kasane.range.single(100); // [100]
const rangeValues = Kasane.range.between(100, 200); // [100, 200]
const openRange = Kasane.range.after(100); // [100, "-"]
const anyValue = Kasane.range.any(); // ["-"]

// 論理演算ヘルパー
const orOperation = Kasane.range.or(range1, range2, range3);
const andOperation = Kasane.range.and(range1, range2);
const notOperation = Kasane.range.not(range1);

// フィルターヘルパー
const numericFilter = Kasane.filter.int.between(10, 20);
const textFilter = Kasane.filter.text.startsWith("sensor_");
const boolFilter = Kasane.filter.boolean.isTrue();
```

## 📋 完全 API リファレンス

### コア型

- `Range`: 論理演算をサポートする時空間範囲指定
- `SpaceTimeId`: z、f、x、y、i、t 次元を持つ 4D 識別子
- `DimensionRange`: 次元用の配列ベース範囲記法
- `ValueEntry`: データ値（数値、文字列、ブール値）
- `KeyType`: データ型指定（"INT"、"BOOLEAN"、"TEXT"）

### メソッドカテゴリ

- **初期化**: `Kasane.init()`
- **スペース管理**: `addSpace()`、`deleteSpace()`、`showSpaces()`
- **キー管理**: `addKey()`、`deleteKey()`、`showKeys()`
- **値操作**: `setValue()`、`putValue()`、`getValue()`、`deleteValue()`
- **クエリ操作**: `select()`
- **ユーティリティ**: `getVersion()`

### 静的ヘルパー

- **範囲作成**: `Kasane.range.*`
- **フィルター作成**: `Kasane.filter.*`
- **出力オプション**: `Kasane.options.*`

## 🤝 コントリビューション

バグレポート、機能リクエスト、ドキュメント改善、コード拡張など、あらゆる貢献を歓迎します。

## 📄 ライセンス

このプロジェクトは基盤となる Kasane WASM ライブラリのライセンス条項に従います。

## 🔗 関連プロジェクト

- [Kasane Logic](https://github.com/AirBee-Project/Kasane) - 時空間アルゴリズムを提供するコア Rust ライブラリ
- [Kasane WASM](https://github.com/AirBee-Project/Kasane) - Kasane logic ライブラリの WebAssembly バインディング

---

詳細な使用例とステップバイステップのチュートリアルについては、[チュートリアル](./TUTORIAL_JA.md)をご覧ください。
