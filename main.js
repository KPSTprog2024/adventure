// main.js

// グローバル変数
let player;
let enemies;
let currentLevel = 1;
const maxLevel = 15;
let isGameOver = false;
let levelText;
let bgMusic;
let jumpSound;
let hitSound;
let clearSound;

// タイトルシーン
class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // アセットのロード
        this.load.image('background', 'assets/background.png');
        this.load.image('title', 'assets/title.png'); // タイトル画像（必要に応じて）
        this.load.audio('bgm', ['assets/sounds/bgm.mp3', 'assets/sounds/bgm.ogg']);
    }

    create() {
        // 背景の追加
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'background').setDisplaySize(this.scale.width, this.scale.height);

        // タイトルテキスト
        const titleText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'ゆめのぼうけん', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Kiwi Maru'
        }).setOrigin(0.5);

        // 「はじめる」ボタン
        const startButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, 'はじめる', {
            fontSize: '48px',
            fill: '#ffffff',
            backgroundColor: '#a78bfa',
            padding: { x: 40, y: 20 },
            borderRadius: 30,
            fontFamily: 'Kiwi Maru'
        }).setOrigin(0.5).setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // 背景音楽の再生
        if (!bgMusic) {
            bgMusic = this.sound.add('bgm', { loop: true, volume: 0.5 });
            bgMusic.play();
        }
    }
}

// ゲームシーン
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // アセットのロード
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('background', 'assets/background.png');
        this.load.image('star', 'assets/star.png'); // パーティクル用
        this.load.audio('jump', ['assets/sounds/jump.wav', 'assets/sounds/jump.ogg']);
        this.load.audio('hit', ['assets/sounds/hit.wav', 'assets/sounds/hit.ogg']);
        this.load.audio('clear', ['assets/sounds/clear.wav', 'assets/sounds/clear.ogg']);
    }

    create() {
        // 背景の追加
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'background').setDisplaySize(this.scale.width, this.scale.height);

        // 効果音の準備
        jumpSound = this.sound.add('jump');
        hitSound = this.sound.add('hit');
        clearSound = this.sound.add('clear');

        // レベル表示テキスト
        levelText = this.add.text(20, 20, '', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Kiwi Maru'
        });

        // プレイヤーの作成
        player = this.physics.add.sprite(100, this.scale.height / 2, 'player');
        player.setCollideWorldBounds(true);

        // プレイヤーの表示サイズを設定
        player.setDisplaySize(50, 50); // 幅50px、高さ50pxに設定

        // 物理ボディのサイズを表示サイズに合わせる
        player.body.setSize(player.displayWidth, player.displayHeight);

        // 敵グループの作成
        enemies = this.physics.add.group();

        // 初期レベルの設定
        setupLevel(this, currentLevel);

        // タッチ操作の設定
        this.input.on('pointerdown', function (pointer) {
            if (!isGameOver) {
                shootPlayer();
            }
        }, this);

        // 衝突判定
        this.physics.add.overlap(player, enemies, gameOverHandler, null, this);
    }

    update() {
        if (!isGameOver && player.active) {
            // ゴール判定
            if (player.x > this.scale.width - 50) {
                levelClear(this);
            }
        }

        // 敵の動きの更新
        enemies.getChildren().forEach(function (enemy) {
            handleEnemyMovement(enemy, this);
        }, this);
    }
}

// Phaserゲームの設定
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#f0e6f6', // 柔らかな紫色
    scene: [TitleScene, GameScene], // シーンを配列で指定
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

// ウィンドウリサイズ時の処理
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

// プレイヤーを移動させる関数
function shootPlayer() {
    jumpSound.play();
    player.setVelocityX(300);
}

// レベル設定関数
function setupLevel(scene, levelNumber) {
    const levelData = levels.find(lv => lv.level === levelNumber);
    if (!levelData) {
        console.error(`レベル${levelNumber}のデータが見つかりません。`);
        return;
    }

    // レベル表示の更新
    levelText.setText(`レベル: ${levelNumber} - ${levelData.theme}`);

    // レベル開始メッセージの表示
    const startMessage = scene.add.text(scene.scale.width / 2, scene.scale.height / 2, levelData.message, {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Kiwi Maru'
    }).setOrigin(0.5);

    scene.time.delayedCall(2000, () => {
        startMessage.destroy();
    });

    // プレイヤーのリセット
    player.setPosition(100, scene.scale.height / 2);
    player.setVelocity(0, 0);
    player.active = true;

    // 既存の敵をクリア
    enemies.clear(true, true);

    // 新しい敵を生成
    levelData.enemies.forEach((enemyConfig, index) => {
        const enemy = createEnemy(scene, enemyConfig, index);
        enemies.add(enemy);
    });

    isGameOver = false;
}

// 敵生成関数
function createEnemy(scene, config, index) {
    // 敵の位置をプレイヤーと重ならないように配置
    const minY = 100;
    const maxY = scene.scale.height - 100;
    let yPosition;

    do {
        yPosition = Phaser.Math.Between(minY, maxY);
    } while (Math.abs(yPosition - player.y) < 100);

    const enemy = scene.physics.add.sprite(scene.scale.width - 100, yPosition, 'enemy');
    enemy.setData('movement', config.movement);
    enemy.setData('speed', config.speed);
    enemy.setData('startX', enemy.x);
    enemy.setData('startY', enemy.y);

    // 敵の表示サイズを設定
    enemy.setDisplaySize(50, 50); // 幅50px、高さ50pxに設定

    // 物理ボディのサイズを表示サイズに合わせる
    enemy.body.setSize(enemy.displayWidth, enemy.displayHeight);

    // 敵の速度と動きの設定
    enemy.setVelocityX(-config.speed);

    return enemy;
}

// 敵の動きを制御する関数
function handleEnemyMovement(enemy, scene) {
    const movement = enemy.getData('movement');
    const speed = enemy.getData('speed');
    const startX = enemy.getData('startX');
    const startY = enemy.getData('startY');

    if (movement === "wave") {
        enemy.y = startY + Math.sin((startX - enemy.x) / 50) * 100;
    } else if (movement === "floating") {
        enemy.y = startY + Math.sin((startX - enemy.x) / 100) * 50;
    } else if (movement === "glide") {
        enemy.y += Math.sin(scene.time.now / 200) * 1.5;
    } else {
        // 直線移動（特に処理なし）
    }
}

// ゲームオーバー時の処理
function gameOverHandler(playerSprite, enemySprite) {
    isGameOver = true;
    hitSound.play();
    player.active = false;
    player.setVelocity(0, 0);
    showGameOverUI(player.scene);
}

// ゲームオーバーUIの表示
function showGameOverUI(scene) {
    // 半透明の背景
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(0, 0, scene.scale.width, scene.scale.height);

    // メッセージの表示
    const message = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 50, 'あせらないで、ゆっくり すすもう', {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Kiwi Maru'
    }).setOrigin(0.5);

    // 「ふたたび ちょうせん」ボタン
    const retryButton = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 50, 'ふたたび ちょうせん', {
        fontSize: '36px',
        fill: '#ffffff',
        backgroundColor: '#a78bfa',
        padding: { x: 30, y: 15 },
        borderRadius: 30,
        fontFamily: 'Kiwi Maru'
    }).setOrigin(0.5).setInteractive();

    retryButton.on('pointerdown', () => {
        // レベルの再スタート
        setupLevel(scene, currentLevel);
        graphics.destroy();
        message.destroy();
        retryButton.destroy();
    });
}

// レベルクリア時の処理
function levelClear(scene) {
    isGameOver = true;
    clearSound.play();

    // メッセージの表示
    const message = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 50, 'すてきだね！ きみのゆうきが かがやいてるよ', {
        fontSize: '32px',
        fill: '#ffffff',
        fontFamily: 'Kiwi Maru'
    }).setOrigin(0.5);

    // 次のレベルへの移行
    scene.time.delayedCall(3000, () => {
        message.destroy();
        currentLevel += 1;
        if (currentLevel > maxLevel) {
            showGameClearUI(scene);
        } else {
            setupLevel(scene, currentLevel);
        }
    }, [], scene);
}

// ゲームクリア時の処理
function showGameClearUI(scene) {
    // メッセージの表示
    const message = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 50, 'ゆめのぼうけんは つづく...', {
        fontSize: '48px',
        fill: '#ffffff',
        fontFamily: 'Kiwi Maru'
    }).setOrigin(0.5);

    // 「さいしょの せかいへ もどる」ボタン
    const restartButton = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 + 50, 'さいしょの せかいへ もどる', {
        fontSize: '36px',
        fill: '#ffffff',
        backgroundColor: '#a78bfa',
        padding: { x: 30, y: 15 },
        borderRadius: 30,
        fontFamily: 'Kiwi Maru'
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerdown', () => {
        currentLevel = 1;
        setupLevel(scene, currentLevel);
        message.destroy();
        restartButton.destroy();
    });
}
