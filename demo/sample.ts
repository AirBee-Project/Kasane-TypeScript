import { Kasane } from "../src/index";
import { Range } from "../src/types";

// WASMファイルを読み込んでKasaneを初期化
const kasane = await Kasane.init("http://10.0.0.12/kasane_bg.wasm", true);

let v = kasane.getVersion();

console.log(v);

// データベース設定
kasane.addSpace({ space: "smart_city" });
kasane.addKey({ space: "smart_city", key: "temperature", type: "INT" });
kasane.addKey({ space: "smart_city", key: "humidity", type: "INT" });
kasane.addKey({ space: "smart_city", key: "air_quality", type: "TEXT" });
kasane.addKey({
  space: "smart_city",
  key: "is_operational",
  type: "BOOLEAN",
});

let demorange: Range = {
  OR: [{ z: 3, f: [3, 4], x: [5, 2], y: ["-"], i: 0, t: ["-"] }],
};

kasane.setValue({
  space: "smart_city",
  key: "is_operational",
  value: false,
  range: demorange,
});

let value = kasane.getValue({
  space: "smart_city",
  key: "is_operational",
  range: {
    z: 3,
    f: [3, 4],
    x: [5, 2],
    y: ["-"],
    i: 0,
    t: ["-"],
  },
});

console.log(JSON.stringify(value));

let test = kasane.space("smart_city");
test.showKeys();
