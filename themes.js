// themes.js

const themes = [
    {
        name: "はじまりのそら",
        enemyConfig: {
            type: "slow",
            baseSpeed: 40,
            speedIncrement: 5,
            movement: "floating",
            size: { width: 60, height: 60 },
            color: 0xFFE4E1 // ミスティローズ
        }
    },
    {
        name: "きらめくもり",
        enemyConfig: {
            type: "medium",
            baseSpeed: 60,
            speedIncrement: 10,
            movement: "glide",
            size: { width: 50, height: 50 },
            color: 0x98FB98 // ペールグリーン
        }
    },
    {
        name: "ひかりのうみ",
        enemyConfig: {
            type: "fast",
            baseSpeed: 80,
            speedIncrement: 15,
            movement: "wave",
            size: { width: 40, height: 40 },
            color: 0xADD8E6 // ライトブルー
        }
    }
];
