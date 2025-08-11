# Kasane WASM チュートリアル

このチュートリアルでは、Kasane WASM TypeScript ライブラリの使い方を段階的に丁寧に説明します。初心者から上級者まで、実践的な例を通して Kasane の力を学ぶことができます。

## 📋 目次

1. [環境準備とインストール](#環境準備とインストール)
2. [WASM ファイルの読み込み](#wasmファイルの読み込み)
3. [基本的なスペースとキーの操作](#基本的なスペースとキーの操作)
4. [値の保存と取得](#値の保存と取得)
5. [空間 ID と時空間 ID の理解](#空間idと時空間idの理解)
6. [範囲指定と記法](#範囲指定と記法)
7. [論理演算の活用](#論理演算の活用)
8. [値フィルタリング](#値フィルタリング)
9. [実践的な応用例](#実践的な応用例)
10. [トラブルシューティング](#トラブルシューティング)

## 1. 環境準備とインストール

### 1.1 前提条件

Kasane WASM を使用するには以下が必要です：

- **Node.js** 16.x 以降
- **TypeScript** 対応の開発環境（推奨）

### 1.2 npm インストール

プロジェクトディレクトリで以下のコマンドを実行します：

```bash
# npm の場合
npm install kasane-client

# yarn の場合
yarn add kasane-client
```

### 1.3 TypeScript プロジェクトの設定

新しいプロジェクトを始める場合：

```bash
# プロジェクトディレクトリを作成
mkdir my-kasane-project
cd my-kasane-project

# package.json を初期化
npm init -y

# TypeScript とその他の依存関係をインストール
npm install kasane-client
npm install -D typescript tsx @types/node

# tsconfig.json を作成
npx tsc --init
```

`tsconfig.json` の設定例：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 1.4 最初のテストファイル作成

`src/index.ts` ファイルを作成：

```typescript
import { Kasane } from "kasane-client";

async function main() {
  console.log("Kasane WASM チュートリアルへようこそ！");

  // 後でここにコードを追加していきます
}

main().catch(console.error);
```

## 2. WASM ファイルの読み込み

### 2.1 WASM ファイルの取得

Kasane WASM ファイルは以下の方法で取得できます：

1. **CDN から直接読み込み**（推奨）
2. **ローカルファイルとして配置**
3. **開発サーバーからの提供**

### 2.2 CDN からの読み込み

最も簡単な方法は、公開されている CDN から読み込むことです：

```typescript
import { Kasane } from "kasane-client";

async function initializeKasane() {
  try {
    // CDNからWASMを読み込み
    const kasane = await Kasane.init("https://cdn.example.com/kasane.wasm");
    console.log("Kasane初期化成功！");
    return kasane;
  } catch (error) {
    console.error("Kasane初期化エラー:", error);
    throw error;
  }
}
```

### 2.3 ローカルファイルからの読み込み

プロジェクトに WASM ファイルを含める場合：

```typescript
// publicディレクトリにkasane.wasmを配置
const kasane = await Kasane.init("/assets/kasane.wasm");

// 相対パスでの指定
const kasane = await Kasane.init("./kasane.wasm");
```

### 2.4 開発環境での設定

開発用のローカルサーバーを使用する場合：

```typescript
const kasane = await Kasane.init("http://localhost:3000/kasane.wasm");
```

### 2.5 初期化オプション

デバッグモードでの初期化：

```typescript
// デバッグログを有効にして初期化
const kasane = await Kasane.init("/path/to/kasane.wasm", true);

// バージョン確認
const version = kasane.getVersion();
console.log(`Kasaneバージョン: ${version}`);
```

## 3. 基本的なスペースとキーの操作

### 3.1 スペースの概念

**スペース**は Kasane における論理空間のようなものです。異なる用途やドメインのデータを分離するために使用します。

### 3.2 スペースの作成

```typescript
async function setupSpaces(kasane: Kasane) {
  // 複数のスペースを作成
  kasane.addSpace({ space: "smart_city" });
  kasane.addSpace({ space: "weather_data" });
  kasane.addSpace({ space: "traffic_monitoring" });

  // 作成されたスペースを確認
  const spaces = kasane.showSpaces();
  console.log("作成されたスペース:", spaces);
  // 出力: ["smart_city", "weather_data", "traffic_monitoring"]
}
```

### 3.3 キーの概念と作成

**キー**はスペース内のデータフィールドを定義します。各キーには型（INT、BOOLEAN、TEXT）を指定する必要があります。

```typescript
async function setupKeys(kasane: Kasane) {
  // smart_city スペースにキーを追加
  kasane.addKey({ space: "smart_city", key: "temperature", type: "INT" });
  kasane.addKey({ space: "smart_city", key: "humidity", type: "INT" });
  kasane.addKey({ space: "smart_city", key: "air_quality", type: "TEXT" });
  kasane.addKey({
    space: "smart_city",
    key: "is_operational",
    type: "BOOLEAN",
  });
  kasane.addKey({ space: "smart_city", key: "device_name", type: "TEXT" });

  // weather_data スペースにキーを追加
  kasane.addKey({ space: "weather_data", key: "rainfall", type: "INT" });
  kasane.addKey({ space: "weather_data", key: "wind_speed", type: "INT" });
  kasane.addKey({
    space: "weather_data",
    key: "weather_condition",
    type: "TEXT",
  });

  // キーを確認
  const smartCityKeys = kasane.showKeys({ space: "smart_city" });
  console.log("smart_cityのキー:", smartCityKeys);
}
```

### 3.4 スペースとキーの削除

```typescript
function cleanupExample(kasane: Kasane) {
  // 特定のキーを削除
  kasane.deleteKey({ space: "smart_city", key: "old_temperature" });

  // スペース全体を削除（注意：全データが失われます）
  kasane.deleteSpace({ space: "test_space" });
}
```

## 4. 値の保存と取得

### 4.1 基本的な値の保存

```typescript
async function basicValueOperations(kasane: Kasane) {
  // 温度データの保存
  kasane.setValue({
    space: "smart_city",
    key: "temperature",
    range: {
      z: 10, // ズームレベル
      x: [100], // X座標（単一値）
      y: [200], // Y座標（単一値）
      f: [10], // 高度（10m）
      i: 300, // 時間間隔（300秒 = 5分）
      t: [1000], // 時間インデックス
    },
    value: 25,
  });

  // ブール値の保存
  kasane.setValue({
    space: "smart_city",
    key: "is_operational",
    range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
    value: true,
  });

  // テキストデータの保存
  kasane.setValue({
    space: "smart_city",
    key: "device_name",
    range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
    value: "温度センサー_001",
  });
}
```

### 4.2 値の取得

```typescript
async function retrieveValues(kasane: Kasane) {
  // 基本的な値取得
  const temperatureData = kasane.getValue({
    space: "smart_city",
    key: "temperature",
    range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  });

  console.log("温度:", temperatureData[0].value);

  // 詳細情報付きで取得
  const detailedData = kasane.getValue({
    space: "smart_city",
    key: "temperature",
    range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
    options: {
      vertex: true, // 8つの角頂点情報
      center: true, // 中心点情報
      id_string: true, // ID文字列表現
      id_pure: true, // 純粋ID展開
    },
  });

  console.log("詳細データ:", detailedData[0]);
}
```

### 4.3 setValue vs putValue の違い

```typescript
function demonstrateSetVsPut(kasane: Kasane) {
  const range = { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] };

  // setValue: 既存データを上書き
  kasane.setValue({
    space: "smart_city",
    key: "temperature",
    range: range,
    value: 25,
  });

  // 同じ場所に再度setValue（成功：上書きされる）
  kasane.setValue({
    space: "smart_city",
    key: "temperature",
    range: range,
    value: 26,
  });

  try {
    // putValue: データが存在しない場合のみ追加
    kasane.putValue({
      space: "smart_city",
      key: "temperature",
      range: range,
      value: 27,
    });
  } catch (error) {
    console.log("putValueエラー: データが既に存在します");
  }
}
```

## 5. 空間 ID と時空間 ID の理解

### 5.1 空間 ID の特徴と用途

空間 ID（`i = 0`）は時間が経過しても変化しない静的な情報を表現します：

```typescript
function spatialIdExamples(kasane: Kasane) {
  // 山の位置（永続的な地理的特徴）
  kasane.setValue({
    space: "geography",
    key: "landmark_name",
    range: {
      z: 8,
      x: [1000, 1100], // 範囲指定
      y: [2000, 2100],
      f: [1500, 3000], // 標高1500-3000m
      i: 0, // 空間ID
      t: ["-"], // 全時間で有効
    },
    value: "富士山",
  });

  // 建物の情報
  kasane.setValue({
    space: "geography",
    key: "building_type",
    range: { z: 12, x: [1500], y: [2500], f: [0, 50], i: 0, t: ["-"] },
    value: "商業ビル",
  });

  // 道路の情報
  kasane.setValue({
    space: "infrastructure",
    key: "road_type",
    range: { z: 10, x: [1000, 2000], y: [1500], f: [0], i: 0, t: ["-"] },
    value: "国道",
  });
}
```

### 5.2 時空間 ID の特徴と用途

時空間 ID（`i ≠ 0`）は時間とともに変化するデータを表現します：

```typescript
function spatioTemporalIdExamples(kasane: Kasane) {
  // センサーデータ（5分間隔）
  kasane.setValue({
    space: "sensors",
    key: "temperature",
    range: { z: 10, x: [100], y: [200], f: [2], i: 300, t: [1000] },
    value: 22,
  });

  // 交通量データ（15分間隔）
  kasane.setValue({
    space: "traffic",
    key: "vehicle_count",
    range: { z: 10, x: [500], y: [600], f: [0], i: 900, t: [480] },
    value: 45,
  });

  // 移動オブジェクト（1分間隔）
  kasane.setValue({
    space: "tracking",
    key: "vehicle_id",
    range: { z: 15, x: [1234], y: [5678], f: [0], i: 60, t: [10000] },
    value: "BUS_001",
  });
}
```

### 5.3 空間 ID と時空間 ID の組み合わせ

```typescript
function combinedIdQueries(kasane: Kasane) {
  // 山岳地帯の気象データを検索
  const mountainWeather = kasane.getValue({
    space: "weather",
    key: "temperature",
    range: {
      AND: [
        // 気象データ（時空間ID）
        {
          z: 8,
          x: [1000, 1200],
          y: [2000, 2200],
          f: [10],
          i: 3600,
          t: [100, 200],
        },
        // 山岳地帯フィルター（空間ID）
        {
          Filter: {
            space: "geography",
            key: "landmark_name",
            filter: { text: { contains: "山" } },
          },
        },
      ],
    },
  });

  console.log("山岳地帯の気象データ:", mountainWeather);
}
```

## 6. 範囲指定と記法

### 6.1 DimensionRange の基本記法

```typescript
function rangeNotationExamples(kasane: Kasane) {
  // 単一値指定
  const singlePoint = { z: 10, x: [100], y: [200], f: [50], i: 300, t: [1000] };

  // 範囲指定（包含的）
  const areaRange = {
    z: 10,
    x: [100, 200],
    y: [150, 250],
    f: [0, 100],
    i: 300,
    t: [1000, 2000],
  };

  // 無制限範囲
  const unlimitedRanges = {
    z: 10,
    x: [100, "-"], // 100以上の全てのX座標
    y: ["-", 200], // 200以下の全てのY座標
    f: ["-"], // 全ての高度
    i: 300,
    t: [1000],
  };

  // これらの範囲を使ってデータを保存
  kasane.setValue({
    space: "test",
    key: "demo_value",
    range: areaRange,
    value: "範囲データ",
  });
}
```

### 6.2 ヘルパーメソッドの活用

```typescript
function usingHelperMethods(kasane: Kasane) {
  // Kasane.range ヘルパーを使用
  const range = {
    z: 10,
    x: Kasane.range.between(100, 200), // [100, 200]
    y: Kasane.range.single(150), // [150]
    f: Kasane.range.after(50), // [50, "-"]
    i: 300,
    t: Kasane.range.any(), // ["-"]
  };

  kasane.setValue({
    space: "test",
    key: "helper_demo",
    range: range,
    value: "ヘルパーメソッドで作成",
  });

  // より複雑な例
  const complexRange = {
    z: 12,
    x: Kasane.range.before(500), // ["-", 500]
    y: Kasane.range.between(1000, 2000), // [1000, 2000]
    f: Kasane.range.single(25), // [25]
    i: 600,
    t: Kasane.range.after(5000), // [5000, "-"]
  };
}
```

### 6.3 範囲クエリの実践例

```typescript
function practicalRangeQueries(kasane: Kasane) {
  // エリア内の全センサーデータを取得
  const areaData = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: {
      z: 10,
      x: [1000, 2000], // 1km x 1km のエリア
      y: [1000, 2000],
      f: [0, 100], // 地上100m以下
      i: 300, // 5分間隔データ
      t: [100, 200], // 時間範囲
    },
  });

  // 特定高度以上のデータを取得
  const highAltitudeData = kasane.getValue({
    space: "weather",
    key: "wind_speed",
    range: {
      z: 8,
      x: ["-"], // 全X座標
      y: ["-"], // 全Y座標
      f: [1000, "-"], // 1000m以上の高度
      i: 3600, // 1時間間隔
      t: [50, 100],
    },
  });

  console.log(`エリアデータ: ${areaData.length}件`);
  console.log(`高高度データ: ${highAltitudeData.length}件`);
}
```

## 7. 論理演算の活用

### 7.1 OR 演算（和集合）

```typescript
function orOperationExamples(kasane: Kasane) {
  // 複数地点のデータを一括取得
  const multipleLocations = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: {
      OR: [
        { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
        { z: 10, x: [150], y: [250], f: [10], i: 300, t: [1000] },
        { z: 10, x: [200], y: [300], f: [10], i: 300, t: [1000] },
      ],
    },
  });

  // ヘルパーメソッドを使用
  const location1 = { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] };
  const location2 = { z: 10, x: [150], y: [250], f: [10], i: 300, t: [1000] };
  const location3 = { z: 10, x: [200], y: [300], f: [10], i: 300, t: [1000] };

  const helperOrRange = Kasane.range.or(location1, location2, location3);

  const result = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: helperOrRange,
  });

  console.log(`OR演算結果: ${result.length}件のデータ`);
}
```

### 7.2 AND 演算（積集合）

```typescript
function andOperationExamples(kasane: Kasane) {
  // 特定エリア内の稼働中センサーのデータを取得
  const operationalSensorsInArea = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: {
      AND: [
        // エリア指定
        {
          z: 10,
          x: [100, 300],
          y: [200, 400],
          f: [0, 50],
          i: 300,
          t: [1000, 2000],
        },
        // 稼働状態フィルター
        {
          Filter: {
            space: "sensors",
            key: "is_operational",
            filter: { boolean: { isTrue: true } },
          },
        },
        // 温度範囲フィルター
        {
          Filter: {
            space: "sensors",
            key: "temperature",
            filter: { int: { between: [15, 35] } },
          },
        },
      ],
    },
  });

  console.log(`稼働中センサーデータ: ${operationalSensorsInArea.length}件`);
}
```

### 7.3 XOR 演算（排他的論理和）

```typescript
function xorOperationExamples(kasane: Kasane) {
  // エリアAまたはエリアBのいずれか一方にのみ存在するデータ
  const exclusiveAreas = kasane.select({
    range: {
      XOR: [
        { z: 10, x: [100, 200], y: [100, 200], f: [10], i: 300, t: [1000] },
        { z: 10, x: [150, 250], y: [150, 250], f: [10], i: 300, t: [1000] },
      ],
    },
  });

  console.log(`XOR演算結果: ${exclusiveAreas.length}件の領域`);
}
```

### 7.4 NOT 演算（補集合）

```typescript
function notOperationExamples(kasane: Kasane) {
  // 特定エリア以外の全データを取得
  const outsideArea = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: {
      NOT: [
        {
          z: 10,
          x: [100, 200],
          y: [100, 200],
          f: [0, 50],
          i: 300,
          t: [1000, 2000],
        },
      ],
    },
  });

  console.log(`エリア外データ: ${outsideArea.length}件`);
}
```

### 7.5 複合論理演算

```typescript
function complexLogicalOperations(kasane: Kasane) {
  // 複雑な条件の組み合わせ
  const complexQuery = kasane.getValue({
    space: "smart_city",
    key: "air_quality",
    range: {
      AND: [
        {
          OR: [
            // 商業地区または住宅地区
            {
              z: 10,
              x: [1000, 2000],
              y: [1000, 2000],
              f: [0, 30],
              i: 1800,
              t: [100, 200],
            },
            {
              z: 10,
              x: [3000, 4000],
              y: [3000, 4000],
              f: [0, 30],
              i: 1800,
              t: [100, 200],
            },
          ],
        },
        {
          NOT: [
            // 工業地区を除外
            {
              z: 10,
              x: [2000, 3000],
              y: [2000, 3000],
              f: [0, 30],
              i: 1800,
              t: [100, 200],
            },
          ],
        },
        {
          Filter: {
            space: "smart_city",
            key: "air_quality",
            filter: { text: { notEquals: "poor" } },
          },
        },
      ],
    },
  });

  console.log(`複合クエリ結果: ${complexQuery.length}件`);
}
```

## 8. 値フィルタリング

### 8.1 整数フィルター

```typescript
function integerFilterExamples(kasane: Kasane) {
  // 等価フィルター
  const exactTemperature = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: {
      Filter: {
        space: "sensors",
        key: "temperature",
        filter: { int: { equal: 25 } },
      },
    },
  });

  // 範囲フィルター
  const temperatureRange = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: {
      Filter: {
        space: "sensors",
        key: "temperature",
        filter: { int: { between: [20, 30] } },
      },
    },
  });

  // 比較フィルター
  const highTemperature = kasane.getValue({
    space: "sensors",
    key: "temperature",
    range: {
      Filter: {
        space: "sensors",
        key: "temperature",
        filter: { int: { greaterThan: 30 } },
      },
    },
  });

  // IN/NOT INフィルター
  const specificValues = kasane.getValue({
    space: "sensors",
    key: "humidity",
    range: {
      Filter: {
        space: "sensors",
        key: "humidity",
        filter: { int: { in: [60, 65, 70, 75] } },
      },
    },
  });

  console.log(
    `等価: ${exactTemperature.length}, 範囲: ${temperatureRange.length}, 高温: ${highTemperature.length}`
  );
}
```

### 8.2 ブールフィルター

```typescript
function booleanFilterExamples(kasane: Kasane) {
  // 稼働中のデバイスを検索
  const operationalDevices = kasane.getValue({
    space: "devices",
    key: "device_info",
    range: {
      Filter: {
        space: "devices",
        key: "is_operational",
        filter: { boolean: { isTrue: true } },
      },
    },
  });

  // 停止中のデバイスを検索
  const stoppedDevices = kasane.getValue({
    space: "devices",
    key: "device_info",
    range: {
      Filter: {
        space: "devices",
        key: "is_operational",
        filter: { boolean: { isFalse: true } },
      },
    },
  });

  // 特定の値でフィルター
  const specificBoolean = kasane.getValue({
    space: "sensors",
    key: "calibrated",
    range: {
      Filter: {
        space: "sensors",
        key: "calibrated",
        filter: { boolean: { equals: true } },
      },
    },
  });

  console.log(
    `稼働中: ${operationalDevices.length}, 停止中: ${stoppedDevices.length}`
  );
}
```

### 8.3 テキストフィルター

```typescript
function textFilterExamples(kasane: Kasane) {
  // 完全一致
  const exactMatch = kasane.getValue({
    space: "devices",
    key: "device_name",
    range: {
      Filter: {
        space: "devices",
        key: "device_type",
        filter: { text: { equal: "temperature_sensor" } },
      },
    },
  });

  // 部分一致（含む）
  const containsSensor = kasane.getValue({
    space: "devices",
    key: "device_name",
    range: {
      Filter: {
        space: "devices",
        key: "device_name",
        filter: { text: { contains: "sensor" } },
      },
    },
  });

  // プレフィックス検索
  const prefixMatch = kasane.getValue({
    space: "devices",
    key: "device_name",
    range: {
      Filter: {
        space: "devices",
        key: "device_id",
        filter: { text: { startsWith: "TEMP_" } },
      },
    },
  });

  // サフィックス検索
  const suffixMatch = kasane.getValue({
    space: "devices",
    key: "device_name",
    range: {
      Filter: {
        space: "devices",
        key: "device_name",
        filter: { text: { endsWith: "_001" } },
      },
    },
  });

  // 大文字小文字を無視した検索
  const caseInsensitive = kasane.getValue({
    space: "locations",
    key: "area_name",
    range: {
      Filter: {
        space: "locations",
        key: "area_name",
        filter: { text: { caseInsensitiveEqual: "tokyo" } },
      },
    },
  });

  // 正規表現フィルター
  const regexMatch = kasane.getValue({
    space: "devices",
    key: "device_name",
    range: {
      Filter: {
        space: "devices",
        key: "device_id",
        filter: { text: { regex: "^[A-Z]{4}_[0-9]{3}$" } },
      },
    },
  });

  console.log(
    `センサー含む: ${containsSensor.length}, プレフィックス: ${prefixMatch.length}`
  );
}
```

### 8.4 フィルターヘルパーメソッドの活用

```typescript
function filterHelperExamples(kasane: Kasane) {
  // ヘルパーメソッドでフィルターを作成
  const tempFilter = Kasane.filter.int.between(20, 30);
  const operationalFilter = Kasane.filter.boolean.isTrue();
  const deviceFilter = Kasane.filter.text.startsWith("SENSOR_");

  // フィルター範囲の作成
  const tempRange = Kasane.range.filter("sensors", "temperature", tempFilter);
  const deviceRange = Kasane.range.filter("devices", "device_id", deviceFilter);

  // 複合フィルター
  const combinedQuery = kasane.getValue({
    space: "monitoring",
    key: "data_value",
    range: {
      AND: [
        {
          z: 10,
          x: [100, 500],
          y: [100, 500],
          f: [0, 100],
          i: 300,
          t: [1000, 2000],
        },
        tempRange,
        {
          Filter: {
            space: "devices",
            key: "is_operational",
            filter: operationalFilter,
          },
        },
      ],
    },
  });

  console.log(`複合フィルター結果: ${combinedQuery.length}件`);
}
```

## 9. 実践的な応用例

### 9.1 スマートシティ監視システム

```typescript
async function smartCityMonitoringSystem(kasane: Kasane) {
  console.log("=== スマートシティ監視システム ===");

  // 1. システムセットアップ
  kasane.addSpace({ space: "smart_city" });
  kasane.addKey({ space: "smart_city", key: "temperature", type: "INT" });
  kasane.addKey({ space: "smart_city", key: "humidity", type: "INT" });
  kasane.addKey({ space: "smart_city", key: "air_quality_index", type: "INT" });
  kasane.addKey({ space: "smart_city", key: "device_status", type: "BOOLEAN" });
  kasane.addKey({ space: "smart_city", key: "location_type", type: "TEXT" });

  // 2. 市内各地にセンサーデータを配置
  const cityAreas = [
    { name: "commercial", x: 1000, y: 1000, temp: 26, humidity: 60, aqi: 45 },
    { name: "residential", x: 2000, y: 1000, temp: 24, humidity: 65, aqi: 35 },
    { name: "industrial", x: 3000, y: 1000, temp: 28, humidity: 55, aqi: 75 },
    { name: "park", x: 1500, y: 2000, temp: 22, humidity: 70, aqi: 25 },
    { name: "downtown", x: 2500, y: 2000, temp: 27, humidity: 58, aqi: 55 },
  ];

  // 現在時刻のデータを保存
  const currentTime = 1000;
  cityAreas.forEach((area, index) => {
    const baseRange = {
      z: 10,
      x: [area.x],
      y: [area.y],
      f: [5], // 地上5m
      i: 1800, // 30分間隔
      t: [currentTime + index],
    };

    kasane.setValue({
      space: "smart_city",
      key: "temperature",
      range: baseRange,
      value: area.temp,
    });
    kasane.setValue({
      space: "smart_city",
      key: "humidity",
      range: baseRange,
      value: area.humidity,
    });
    kasane.setValue({
      space: "smart_city",
      key: "air_quality_index",
      range: baseRange,
      value: area.aqi,
    });
    kasane.setValue({
      space: "smart_city",
      key: "device_status",
      range: baseRange,
      value: true,
    });
    kasane.setValue({
      space: "smart_city",
      key: "location_type",
      range: baseRange,
      value: area.name,
    });
  });

  // 3. 高温エリアの検出
  const hotAreas = kasane.getValue({
    space: "smart_city",
    key: "temperature",
    range: {
      AND: [
        {
          z: 10,
          x: [1000, 3000],
          y: [1000, 2000],
          f: [5],
          i: 1800,
          t: [1000, 1010],
        },
        {
          Filter: {
            space: "smart_city",
            key: "temperature",
            filter: { int: { greaterThan: 25 } },
          },
        },
      ],
    },
  });

  console.log(`高温エリア検出: ${hotAreas.length}箇所`);
  hotAreas.forEach((area) => {
    console.log(
      `  温度${area.value}度 at (${area.spacetimeid.x}, ${area.spacetimeid.y})`
    );
  });

  // 4. 大気質の悪いエリアの検出
  const poorAirQuality = kasane.getValue({
    space: "smart_city",
    key: "air_quality_index",
    range: {
      Filter: {
        space: "smart_city",
        key: "air_quality_index",
        filter: { int: { greaterThan: 50 } },
      },
    },
  });

  console.log(`大気質要注意エリア: ${poorAirQuality.length}箇所`);

  // 5. 商業地区または住宅地区の快適度チェック
  const comfortableAreas = kasane.getValue({
    space: "smart_city",
    key: "temperature",
    range: {
      AND: [
        {
          OR: [
            {
              Filter: {
                space: "smart_city",
                key: "location_type",
                filter: { text: { equal: "commercial" } },
              },
            },
            {
              Filter: {
                space: "smart_city",
                key: "location_type",
                filter: { text: { equal: "residential" } },
              },
            },
          ],
        },
        {
          Filter: {
            space: "smart_city",
            key: "temperature",
            filter: { int: { between: [20, 26] } },
          },
        },
        {
          Filter: {
            space: "smart_city",
            key: "air_quality_index",
            filter: { int: { lessThan: 50 } },
          },
        },
      ],
    },
  });

  console.log(`快適な商業・住宅エリア: ${comfortableAreas.length}箇所`);
}
```

### 9.2 気象データ解析システム

```typescript
async function weatherAnalysisSystem(kasane: Kasane) {
  console.log("=== 気象データ解析システム ===");

  // 1. データベースセットアップ
  kasane.addSpace({ space: "weather" });
  kasane.addSpace({ space: "geography" });

  kasane.addKey({ space: "weather", key: "rainfall", type: "INT" });
  kasane.addKey({ space: "weather", key: "wind_speed", type: "INT" });
  kasane.addKey({ space: "weather", key: "pressure", type: "INT" });
  kasane.addKey({ space: "geography", key: "elevation", type: "INT" });
  kasane.addKey({ space: "geography", key: "terrain_type", type: "TEXT" });

  // 2. 地理的特徴データ（空間ID）
  const terrainData = [
    { x: [1000, 1500], y: [1000, 1500], elevation: 100, type: "平野" },
    { x: [2000, 2500], y: [1000, 1500], elevation: 500, type: "丘陵" },
    { x: [3000, 3500], y: [1000, 1500], elevation: 1200, type: "山地" },
    { x: [1500, 2000], y: [2000, 2500], elevation: 50, type: "河川" },
  ];

  terrainData.forEach((terrain) => {
    const spatialRange = {
      z: 8,
      x: terrain.x,
      y: terrain.y,
      f: [0, terrain.elevation],
      i: 0, // 空間ID
      t: ["-"], // 全時間で有効
    };

    kasane.setValue({
      space: "geography",
      key: "elevation",
      range: spatialRange,
      value: terrain.elevation,
    });
    kasane.setValue({
      space: "geography",
      key: "terrain_type",
      range: spatialRange,
      value: terrain.type,
    });
  });

  // 3. 気象データ（時空間ID）
  const weatherObservations = [
    { x: 1250, y: 1250, time: 100, rainfall: 5, wind: 15, pressure: 1013 },
    { x: 2250, y: 1250, time: 100, rainfall: 8, wind: 20, pressure: 1010 },
    { x: 3250, y: 1250, time: 100, rainfall: 12, wind: 25, pressure: 1005 },
    { x: 1750, y: 2250, time: 100, rainfall: 3, wind: 10, pressure: 1015 },
  ];

  weatherObservations.forEach((obs) => {
    const temporalRange = {
      z: 8,
      x: [obs.x],
      y: [obs.y],
      f: [10], // 観測高度10m
      i: 3600, // 1時間間隔
      t: [obs.time],
    };

    kasane.setValue({
      space: "weather",
      key: "rainfall",
      range: temporalRange,
      value: obs.rainfall,
    });
    kasane.setValue({
      space: "weather",
      key: "wind_speed",
      range: temporalRange,
      value: obs.wind,
    });
    kasane.setValue({
      space: "weather",
      key: "pressure",
      range: temporalRange,
      value: obs.pressure,
    });
  });

  // 4. 山地での降雨量分析
  const mountainRainfall = kasane.getValue({
    space: "weather",
    key: "rainfall",
    range: {
      AND: [
        { z: 8, x: [3000, 3500], y: [1000, 1500], f: [10], i: 3600, t: [100] },
        {
          Filter: {
            space: "geography",
            key: "terrain_type",
            filter: { text: { equal: "山地" } },
          },
        },
      ],
    },
  });

  console.log(`山地の降雨量: ${mountainRainfall.length}箇所`);
  mountainRainfall.forEach((data) => {
    console.log(`  降雨量${data.value}mm/h`);
  });

  // 5. 高標高エリアの強風警報
  const highWindWarning = kasane.getValue({
    space: "weather",
    key: "wind_speed",
    range: {
      AND: [
        {
          Filter: {
            space: "geography",
            key: "elevation",
            filter: { int: { greaterThan: 300 } },
          },
        },
        {
          Filter: {
            space: "weather",
            key: "wind_speed",
            filter: { int: { greaterThan: 20 } },
          },
        },
      ],
    },
  });

  console.log(`高標高強風警報: ${highWindWarning.length}箇所`);

  // 6. 低気圧エリアの検出
  const lowPressureAreas = kasane.getValue({
    space: "weather",
    key: "pressure",
    range: {
      Filter: {
        space: "weather",
        key: "pressure",
        filter: { int: { lessThan: 1010 } },
      },
    },
  });

  console.log(`低気圧エリア: ${lowPressureAreas.length}箇所`);
}
```

### 9.3 交通監視システム

```typescript
async function trafficMonitoringSystem(kasane: Kasane) {
  console.log("=== 交通監視システム ===");

  // 1. システムセットアップ
  kasane.addSpace({ space: "traffic" });
  kasane.addSpace({ space: "infrastructure" });

  kasane.addKey({ space: "traffic", key: "vehicle_count", type: "INT" });
  kasane.addKey({ space: "traffic", key: "average_speed", type: "INT" });
  kasane.addKey({ space: "traffic", key: "congestion_level", type: "TEXT" });
  kasane.addKey({ space: "infrastructure", key: "road_type", type: "TEXT" });
  kasane.addKey({ space: "infrastructure", key: "speed_limit", type: "INT" });

  // 2. 道路インフラ情報（空間ID）
  const roadSegments = [
    { x: [1000, 2000], y: [1500], type: "高速道路", limit: 100 },
    { x: [2000, 3000], y: [1500], type: "国道", limit: 60 },
    { x: [1500], y: [1000, 2000], type: "県道", limit: 50 },
    { x: [2500], y: [1000, 2000], type: "市道", limit: 40 },
  ];

  roadSegments.forEach((road) => {
    const roadRange = {
      z: 12,
      x: road.x,
      y: road.y,
      f: [0], // 地面レベル
      i: 0, // 空間ID
      t: ["-"],
    };

    kasane.setValue({
      space: "infrastructure",
      key: "road_type",
      range: roadRange,
      value: road.type,
    });
    kasane.setValue({
      space: "infrastructure",
      key: "speed_limit",
      range: roadRange,
      value: road.limit,
    });
  });

  // 3. 交通データ（時空間ID）
  const trafficData = [
    {
      x: 1500,
      y: 1500,
      time: 480,
      vehicles: 120,
      speed: 85,
      congestion: "smooth",
    }, // 朝8時
    {
      x: 2500,
      y: 1500,
      time: 480,
      vehicles: 80,
      speed: 55,
      congestion: "moderate",
    },
    {
      x: 1500,
      y: 1500,
      time: 540,
      vehicles: 200,
      speed: 45,
      congestion: "heavy",
    }, // 朝9時
    {
      x: 2500,
      y: 1500,
      time: 540,
      vehicles: 150,
      speed: 35,
      congestion: "heavy",
    },
  ];

  trafficData.forEach((traffic) => {
    const trafficRange = {
      z: 12,
      x: [traffic.x],
      y: [traffic.y],
      f: [0],
      i: 900, // 15分間隔
      t: [traffic.time],
    };

    kasane.setValue({
      space: "traffic",
      key: "vehicle_count",
      range: trafficRange,
      value: traffic.vehicles,
    });
    kasane.setValue({
      space: "traffic",
      key: "average_speed",
      range: trafficRange,
      value: traffic.speed,
    });
    kasane.setValue({
      space: "traffic",
      key: "congestion_level",
      range: trafficRange,
      value: traffic.congestion,
    });
  });

  // 4. 渋滞エリアの検出
  const congestedAreas = kasane.getValue({
    space: "traffic",
    key: "vehicle_count",
    range: {
      Filter: {
        space: "traffic",
        key: "congestion_level",
        filter: { text: { equal: "heavy" } },
      },
    },
  });

  console.log(`渋滞エリア: ${congestedAreas.length}箇所`);

  // 5. 高速道路での速度違反検出
  const speedViolations = kasane.getValue({
    space: "traffic",
    key: "average_speed",
    range: {
      AND: [
        {
          Filter: {
            space: "infrastructure",
            key: "road_type",
            filter: { text: { equal: "高速道路" } },
          },
        },
        {
          Filter: {
            space: "traffic",
            key: "average_speed",
            filter: { int: { greaterThan: 100 } },
          },
        },
      ],
    },
  });

  console.log(`速度超過検出: ${speedViolations.length}箇所`);

  // 6. 朝ラッシュ時の交通状況
  const morningRush = kasane.getValue({
    space: "traffic",
    key: "vehicle_count",
    range: {
      AND: [
        {
          z: 12,
          x: [1000, 3000],
          y: [1000, 2000],
          f: [0],
          i: 900,
          t: [480, 600],
        }, // 朝8-10時
        {
          Filter: {
            space: "traffic",
            key: "vehicle_count",
            filter: { int: { greaterThan: 100 } },
          },
        },
      ],
    },
  });

  console.log(`朝ラッシュ高交通量: ${morningRush.length}箇所`);
}
```

## 10. トラブルシューティング

### 10.1 よくあるエラーと対処法

#### WASM 読み込みエラー

```typescript
async function handleWasmErrors() {
  try {
    const kasane = await Kasane.init("/path/to/kasane.wasm");
    return kasane;
  } catch (error) {
    if (error.message.includes("fetch failed")) {
      console.error(
        "WASMファイルの読み込みに失敗しました。URLを確認してください。"
      );
      console.error("考えられる原因:");
      console.error("- WASMファイルのパスが間違っている");
      console.error("- CORSポリシーによりアクセスが拒否されている");
      console.error("- ネットワーク接続の問題");
    } else if (error.message.includes("WebAssembly")) {
      console.error("WebAssemblyの初期化に失敗しました。");
      console.error(
        "ブラウザがWebAssemblyをサポートしているか確認してください。"
      );
    }
    throw error;
  }
}
```

#### データ操作エラー

```typescript
function handleDataErrors(kasane: Kasane) {
  try {
    // 存在しないスペースへのアクセス
    kasane.addKey({ space: "nonexistent", key: "test", type: "INT" });
  } catch (error) {
    console.error("スペースが存在しません:", error.message);
    // 適切な処理: スペースを先に作成
    kasane.addSpace({ space: "nonexistent" });
    kasane.addKey({ space: "nonexistent", key: "test", type: "INT" });
  }

  try {
    // 既存データへのputValue
    kasane.putValue({
      space: "test",
      key: "temperature",
      range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
      value: 25,
    });
  } catch (error) {
    console.error("putValueエラー:", error.message);
    // 代替案: setValueを使用して上書き
    kasane.setValue({
      space: "test",
      key: "temperature",
      range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
      value: 25,
    });
  }
}
```

### 10.2 デバッグのヒント

```typescript
function debuggingTips(kasane: Kasane) {
  // 1. デバッグモードの活用
  const debugKasane = await Kasane.init("/path/to/kasane.wasm", true);

  // 2. データ存在確認
  function checkDataExists(
    kasane: Kasane,
    space: string,
    key: string,
    range: any
  ) {
    try {
      const result = kasane.getValue({ space, key, range });
      console.log(`データ確認: ${result.length}件見つかりました`);
      return result.length > 0;
    } catch (error) {
      console.error("データ確認エラー:", error.message);
      return false;
    }
  }

  // 3. スペースとキーの一覧表示
  function debugSpaceInfo(kasane: Kasane) {
    const spaces = kasane.showSpaces();
    console.log("=== スペース一覧 ===");
    spaces.forEach((space) => {
      console.log(`スペース: ${space}`);
      const keys = kasane.showKeys({ space });
      keys.forEach((key) => {
        console.log(`  キー: ${key}`);
      });
    });
  }

  // 4. 範囲指定の検証
  function validateRange(range: any) {
    const required = ["z", "i"];
    const optional = ["x", "y", "f", "t"];

    for (const field of required) {
      if (!(field in range)) {
        console.warn(`必須フィールド '${field}' が範囲指定にありません`);
      }
    }

    for (const field of optional) {
      if (!(field in range)) {
        console.info(
          `オプションフィールド '${field}' はデフォルト値 ["-"] が使用されます`
        );
      }
    }
  }

  debugSpaceInfo(kasane);
}
```

### 10.3 型エラーの対処

```typescript
// TypeScript型エラーの対処例
function typeErrorSolutions() {
  // 1. DimensionRange の正しい型指定
  const correctRange: DimensionRange<number> = [100]; // 正しい
  // const incorrectRange: DimensionRange<number> = 100; // エラー

  // 2. ValueEntry の型安全な使用
  const intValue: ValueEntry = 25; // number
  const boolValue: ValueEntry = true; // boolean
  const textValue: ValueEntry = "text"; // string

  // 3. Range型の正しい構築
  const simpleRange: Range = {
    z: 10,
    x: [100],
    y: [200],
    f: [10],
    i: 300,
    t: [1000],
  };

  const logicalRange: Range = {
    AND: [
      { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
      {
        Filter: {
          space: "test",
          key: "temp",
          filter: { int: { greaterThan: 20 } },
        },
      },
    ],
  };

  // 4. フィルター型の正しい使用
  const intFilter: FilterInt = { between: [10, 20] };
  const boolFilter: FilterBoolean = { isTrue: true };
  const textFilter: FilterText = { contains: "sensor" };
}
```

## まとめ

このチュートリアルでは、Kasane WASM TypeScript ライブラリの基本的な使い方から高度な応用まで、段階的に学習しました。

### 重要なポイント

1. **空間 ID と時空間 ID**: `i`パラメータで静的データと動的データを区別
2. **範囲記法**: 配列ベースの柔軟な範囲指定
3. **論理演算**: AND、OR、XOR、NOT を使った複雑なクエリ
4. **値フィルタリング**: 型安全なフィルター条件
5. **実践的応用**: スマートシティ、気象、交通などの実例

### 次のステップ

- 実際のプロジェクトで Kasane を活用してみてください
- コミュニティやドキュメントで最新情報を確認してください

Kasane WASM を使って、効率的で強力な時空間データ管理システムを構築してください！
