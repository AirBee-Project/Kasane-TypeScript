# Kasane-TypeScript チュートリアル

このチュートリアルでは、Kasane-TypeScript の基本的な使い方から応用まで、ステップバイステップで学習できます。

## 前提条件

- Node.js 環境または Web ブラウザ
- TypeScript の基本知識
- Kasane WASM ファイルへのアクセス

## 1. セットアップ

### インストール

```bash
npm install kasane-client
```

### 初期化

```typescript
import { Kasane } from "kasane-client";

let kasane = await Kasane.init("https://your-server.com/kasane.wasm");
```

## 2. 基本操作

### スペースの作成

```typescript
// スペース（データベース）を作成
kasane.addSpace({ space: "tutorial" });
let tutorial = kasane.space("tutorial");
```

### キーの追加

```typescript
// 異なるデータ型のキーを追加
tutorial.addKey({ key: "temperature", type: "INT" });
tutorial.addKey({ key: "device_name", type: "TEXT" });
tutorial.addKey({ key: "is_active", type: "BOOLEAN" });
```

### データの保存

```typescript
// 各キーのオブジェクトを取得
let temp = tutorial.key("temperature");
let name = tutorial.key("device_name");
let active = tutorial.key("is_active");

// データを保存
temp.setValue({
  range: { z: 10, x: [100], y: [200], f: [5], i: 300, t: [1000] },
  value: 25
});

name.setValue({
  range: { z: 10, x: [100], y: [200], f: [5], i: 0, t: ["-"] },
  value: "センサー001"
});

active.setValue({
  range: { z: 10, x: [100], y: [200], f: [5], i: 300, t: [1000] },
  value: true
});
```

### データの取得

```typescript
// データを取得
let tempValue = temp.getValue({
  range: { z: 10, x: [100], y: [200], f: [5], i: 300, t: [1000] }
});

console.log("温度:", tempValue[0].value);
```

## 3. 範囲指定の理解

### 単一座標

```typescript
// 特定の座標を指定
let point = { z: 10, x: [100], y: [200], f: [50], i: 60, t: [1000] };
```

### 範囲指定

```typescript
// 範囲を指定
let area = {
  z: 10,
  x: [100, 200],  // X座標 100〜200
  y: [150, 250],  // Y座標 150〜250
  f: [0, 100],    // 高度 0〜100
  i: 60,
  t: [1000, 2000] // 時間 1000〜2000
};
```

### 無限範囲

```typescript
// 無限範囲を指定
let infinite = {
  z: 10,
  x: [100, "-"],  // X座標 100以上
  y: ["-", 200],  // Y座標 200以下
  f: ["-"],       // 全ての高度
  i: 60,
  t: [1000, "-"]  // 時間 1000以降
};
```

## 4. 空間ID と時空間ID

### 空間ID (i=0)

静的な情報に使用。建物、山、道路など時間で変化しないもの。

```typescript
let building = tutorial.key("building_name");
building.setValue({
  range: { z: 10, x: [100], y: [200], f: [0, 50], i: 0, t: ["-"] },
  value: "東京駅"
});
```

### 時空間ID (i≠0)

動的な情報に使用。センサー値、車両位置など時間で変化するもの。

```typescript
let position = tutorial.key("vehicle_position");
position.setValue({
  range: { z: 10, x: [100], y: [200], f: [10], i: 300, t: [1000] },
  value: "車両A"
});
```

## 5. 論理演算

### OR演算

```typescript
// 複数地点のデータを一度に取得
let multiplePoints = temp.getValue({
  range: {
    OR: [
      { z: 10, x: [100], y: [200], f: [5], i: 300, t: [1000] },
      { z: 10, x: [150], y: [250], f: [5], i: 300, t: [1000] },
      { z: 10, x: [200], y: [300], f: [5], i: 300, t: [1000] }
    ]
  }
});
```

### AND演算

```typescript
// 条件の積集合
let intersection = temp.getValue({
  range: {
    AND: [
      { z: 10, x: [50, 150], y: [50, 150], f: [0, 20], i: 300, t: [1000, 2000] },
      { z: 10, x: [100, 200], y: [100, 200], f: [10, 30], i: 300, t: [1500, 2500] }
    ]
  }
});
```

## 6. フィルタリング

### 数値フィルター

```typescript
// 温度が20度以上のデータを取得
let hotAreas = temp.getValue({
  range: {
    Filter: {
      space: "tutorial",
      key: "temperature",
      filter: { int: { greaterThan: 20 } }
    }
  }
});
```

### テキストフィルター

```typescript
// 名前に「センサー」を含むデバイス
let sensorDevices = name.getValue({
  range: {
    Filter: {
      space: "tutorial", 
      key: "device_name",
      filter: { text: { contains: "センサー" } }
    }
  }
});
```

### ブールフィルター

```typescript
// アクティブなデバイスのみ
let activeDevices = active.getValue({
  range: {
    Filter: {
      space: "tutorial",
      key: "is_active", 
      filter: { boolean: { isTrue: true } }
    }
  }
});
```

## 7. ユーティリティメソッド

### 範囲作成ヘルパー

```typescript
// 便利な範囲作成メソッド
let singlePoint = Kasane.range.single(100);         // [100]
let rangeValues = Kasane.range.between(100, 200);   // [100, 200]
let openRange = Kasane.range.after(100);            // [100, "-"]
let anyValue = Kasane.range.any();                  // ["-"]
```

### フィルターヘルパー

```typescript
// フィルター作成ヘルパー
let intFilter = Kasane.filter.int.between(20, 30);
let textFilter = Kasane.filter.text.startsWith("センサー");
let boolFilter = Kasane.filter.boolean.isTrue();
```

## 8. 実践例：IoTセンサーネットワーク

### 設定

```typescript
// IoTシステムのセットアップ
kasane.addSpace({ space: "iot_network" });
let iot = kasane.space("iot_network");

// 各種データキーを作成
iot.addKey({ key: "temperature", type: "INT" });
iot.addKey({ key: "humidity", type: "INT" });
iot.addKey({ key: "sensor_id", type: "TEXT" });
iot.addKey({ key: "status", type: "BOOLEAN" });

// キーオブジェクトを取得
let temp = iot.key("temperature");
let humidity = iot.key("humidity");
let sensorId = iot.key("sensor_id");
let status = iot.key("status");
```

### データ投入

```typescript
// 複数センサーからのデータ
let sensorData = [
  { id: "TEMP001", x: 100, y: 100, temp: 22, humidity: 60, active: true },
  { id: "TEMP002", x: 200, y: 200, temp: 25, humidity: 65, active: true },
  { id: "TEMP003", x: 300, y: 300, temp: 28, humidity: 70, active: false }
];

sensorData.forEach((sensor, index) => {
  let baseRange = {
    z: 10,
    x: [sensor.x],
    y: [sensor.y], 
    f: [10],
    i: 300,
    t: [1000 + index]
  };

  // 時空間データ
  temp.setValue({ range: baseRange, value: sensor.temp });
  humidity.setValue({ range: baseRange, value: sensor.humidity });
  status.setValue({ range: baseRange, value: sensor.active });

  // 空間データ（静的）
  sensorId.setValue({
    range: { ...baseRange, i: 0, t: ["-"] },
    value: sensor.id
  });
});
```

### データ分析

```typescript
// 高温エリアの検索
let hotSensors = temp.getValue({
  range: {
    AND: [
      { z: 10, x: [0, 400], y: [0, 400], f: [10], i: 300, t: [1000, 1003] },
      {
        Filter: {
          space: "iot_network",
          key: "temperature",
          filter: { int: { greaterThan: 24 } }
        }
      }
    ]
  }
});

console.log(`高温エリア数: ${hotSensors.length}`);

// アクティブなセンサーの平均湿度計算
let activeHumidity = humidity.getValue({
  range: {
    AND: [
      { z: 10, x: [0, 400], y: [0, 400], f: [10], i: 300, t: [1000, 1003] },
      {
        Filter: {
          space: "iot_network",
          key: "status",
          filter: { boolean: { isTrue: true } }
        }
      }
    ]
  }
});

let avgHumidity = activeHumidity.reduce((sum, data) => sum + data.value, 0) / activeHumidity.length;
console.log(`平均湿度: ${avgHumidity}%`);
```

## 9. エラーハンドリング

### 基本的なエラーハンドリング

```typescript
try {
  let result = temp.getValue({
    range: { z: 10, x: [100], y: [200], f: [5], i: 300, t: [1000] }
  });
  console.log("データ取得成功:", result);
} catch (error) {
  console.error("データ取得失敗:", error);
}
```

### 存在確認

```typescript
// データの存在確認
let hasData = kasane.select({
  range: {
    HasValue: {
      space: "tutorial",
      key: "temperature"
    }
  }
});

if (hasData.length > 0) {
  console.log("データが存在します");
}
```

## 10. パフォーマンス最適化

### バッチ処理

```typescript
// 一度にキーオブジェクトを取得して再利用
let tempKey = tutorial.key("temperature");
let humidityKey = tutorial.key("humidity");

// 大量データの一括処理
for (let i = 0; i < 1000; i++) {
  tempKey.setValue({
    range: { z: 10, x: [i], y: [i], f: [10], i: 300, t: [i] },
    value: Math.random() * 40
  });
}
```

### 効率的なクエリ

```typescript
// 広範囲クエリより具体的な範囲指定を推奨
let specificData = temp.getValue({
  range: { z: 10, x: [100, 110], y: [200, 210], f: [5], i: 300, t: [1000, 1010] }
});

// より効率的：フィルターを使った条件指定
let filteredData = temp.getValue({
  range: {
    AND: [
      { z: 10, x: [100, 200], y: [200, 300], f: [5], i: 300, t: [1000, 2000] },
      {
        Filter: {
          space: "tutorial",
          key: "temperature",
          filter: { int: { between: [20, 30] } }
        }
      }
    ]
  }
});
```

## まとめ

このチュートリアルでは以下を学習しました：

1. **基本操作**: スペース/キー作成、データ保存/取得
2. **範囲指定**: 単一座標、範囲、無限範囲の使い分け
3. **ID種別**: 空間ID（静的）と時空間ID（動的）の理解
4. **論理演算**: OR、AND、XOR、NOT演算の活用
5. **フィルタリング**: 条件に基づくデータ検索
6. **実践応用**: IoTセンサーネットワークでの実装例
7. **最適化**: パフォーマンスを考慮した実装方法

Kasane-TypeScript を使用することで、複雑な4次元時空間データを効率的に管理できます。実際のプロジェクトでは、用途に応じて空間ID と時空間ID を使い分け、適切なフィルタリングと論理演算を組み合わせることで、強力なデータ分析システムを構築できます。