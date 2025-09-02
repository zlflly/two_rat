// --- DOM 元素 (在所有脚本之前获取) ---
// 为了确保 DOM 元素在所有脚本加载后都能访问到，这部分放在主文件开头
const canvas1 = document.getElementById('canvas1');
const ctx1 = canvas1.getContext('2d');
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageContent = document.getElementById('message-content');
const messageButton = document.getElementById('message-button');
const geminiTipButton = document.getElementById('gemini-tip-button');
const spinner = document.getElementById('spinner');

// --- 颜色配置 ---
const MAP_COLORS = {
    background: '#1a0820',
    wall: '#5d356b',
    player: '#d8bfd8',
    cheese: '#f5b542',
    enemy: '#ff6666'
};

// 在 main.js 顶部添加对 CanvasRenderingContext2D 的扩展，以支持 roundRect (如果浏览器不原生支持)
// 这段代码来自 MDN，用于向旧版浏览器添加 roundRect 支持
if (CanvasRenderingContext2D.prototype.roundRect === undefined) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    this.arcTo(x + width, y, x + width, y + height, radius);
    this.arcTo(x + width, y + height, x, y + height, radius);
    this.arcTo(x, y + height, x, y, radius);
    this.arcTo(x, y, x + width, y, radius);
    this.closePath();
    return this;
  };
}

// --- 游戏主循环 ---
function gameLoop() {
    if (gameState.gateCooldown > 0) {
        gameState.gateCooldown -= 1000 / 60; // 假设60FPS
        if (gameState.gateCooldown < 0) gameState.gateCooldown = 0;
    }

    render(ctx1, gameState.map1, gameState.player1, gameState.cheeses1, gameState.enemies1);
    render(ctx2, gameState.map2, gameState.player2, gameState.cheeses2, gameState.enemies2);
    
    // 不再在循环中调用 renderUI，因为它在 handleGameLogic 中被调用

    if (!gameState.gameOver && !gameState.gameWon) {
        requestAnimationFrame(gameLoop);
    }
}

// --- 初始化 ---
function init() {
    geminiTipButton.onclick = getGeminiTip; // 绑定事件监听器
    resetGame(); // 启动游戏
}

// --- 启动游戏 ---
window.onload = init;