// themes.js

const themes = [
    {
        name: "はじまりのそら",
        enemyConfig: {
            type: "slow",
            baseSpeed: 100,
            speedIncrement: 5,
            movement: "straight", // 直線移動
            size: { width: 50, height: 50 },
            color: 0xFFE4E1 // ミスティローズ
        }
    },
    {
        name: "きらめくもり",
        enemyConfig: {
            type: "medium",
            baseSpeed: 120,
            speedIncrement: 10,
            movement: "floating", // ゆっくり上下に動く
            size: { width: 50, height: 50 },
            color: 0x98FB98 // ペールグリーン
        }
    },
    {
        name: "ひかりのうみ",
        enemyConfig: {
            type: "fast",
            baseSpeed: 140,
            speedIncrement: 15,
            movement: "wave", // 波状に動く
            size: { width: 50, height: 50 },
            color: 0xADD8E6 // ライトブルー
        }
    }
];
