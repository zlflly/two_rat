// --- 游戏状态管理 ---
let gameState = {
    score: 0,
    health: INITIAL_HEALTH,
    player1: { x: 7, y: 7 },
    player2: { x: 7, y: 7 },
    map1: [],
    map2: [],
    enemies1: [],
    enemies2: [],
    cheeses1: [],
    cheeses2: [],
    moving: false,
    gameOver: false,
    gameWon: false,
    pendingMove: null,
    gateCooldown: 0,
    hasReceivedTip: false, // Gemini tip state
    // --- 新增：用于处理玩家与敌人交互的状态 ---
    // 记录玩家和敌人本次移动后的位置，用于判断攻击交互
    interactions1: { playerMovedTo: null, enemiesMovedTo: [] },
    interactions2: { playerMovedTo: null, enemiesMovedTo: [] }
};