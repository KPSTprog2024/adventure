// levels.js

const levels = [];

// 各テーマを5レベルずつ割り当てて15レベルまで定義
themes.forEach((theme, index) => {
    for (let i = 0; i < 5; i++) {
        const levelNumber = index * 5 + i + 1;
        if (levelNumber > 15) break; // レベル15まで

        // 基本設定をコピー
        const enemyConfig = { ...theme.enemyConfig };

        // 各レベルごとに速度を増加
        enemyConfig.speed = enemyConfig.baseSpeed + theme.enemyConfig.speedIncrement * i;

        // レベルデータを追加
        levels.push({
            level: levelNumber,
            theme: theme.name,
            message: "ふしぎなちからが きみを みちびくよ",
            enemies: generateEnemies(enemyConfig, levelNumber)
        });
    }
});

// 敵の生成関数
function generateEnemies(config, levelNumber) {
    const enemies = [];
    const enemyCount = getEnemyCount(config.type, levelNumber);
    for (let i = 0; i < enemyCount; i++) {
        enemies.push({ ...config });
    }
    return enemies;
}

// 敵の数を決定する関数
function getEnemyCount(type, levelNumber) {
    // タイプとレベルに応じて敵の数を設定
    switch (type) {
        case "slow":
            return 2 + Math.floor(levelNumber / 5);
        case "medium":
            return 3 + Math.floor(levelNumber / 5);
        case "fast":
            return 4 + Math.floor(levelNumber / 5);
        default:
            return 3;
    }
}
