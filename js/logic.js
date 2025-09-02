// --- 游戏逻辑 ---
function startGame() {
    gameState.map1 = generateMap();
    gameState.map2 = generateMap();
    // 生成对象时传入地图，确保不生成在墙上
    gameState.cheeses1 = generateCheeses(gameState.map1);
    gameState.cheeses2 = generateCheeses(gameState.map2);
    gameState.enemies1 = generateEnemies(gameState.map1);
    gameState.enemies2 = generateEnemies(gameState.map2);
    renderUI();
    gameLoop();
}

function resetGame() {
    gameState.score = 0;
    gameState.health = INITIAL_HEALTH;
    gameState.player1 = { x: 7, y: 7 };
    gameState.player2 = { x: 7, y: 7 };
    gameState.moving = false;
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.pendingMove = null;
    gameState.gateCooldown = 0;
    gameState.hasReceivedTip = false;
    messageBox.style.display = 'none'; // 隐藏消息框
    startGame();
}

function refreshMaps() {
    gameState.map1 = generateMap();
    gameState.map2 = generateMap();
    // 刷新地图时也刷新对象，并传入新地图
    gameState.cheeses1 = generateCheeses(gameState.map1);
    gameState.cheeses2 = generateCheeses(gameState.map2);
    gameState.enemies1 = generateEnemies(gameState.map1);
    gameState.enemies2 = generateEnemies(gameState.map2);
    renderUI();
}

function movePlayer(dx, dy) {
    if (gameState.moving || gameState.gameOver || gameState.gameWon) return;

    gameState.moving = true;
    gameState.pendingMove = { dx, dy };

    // --- 重置交互状态 ---
    gameState.interactions1 = { playerMovedTo: null, enemiesMovedTo: [] };
    gameState.interactions2 = { playerMovedTo: null, enemiesMovedTo: [] };
    
    let moved1 = false, moved2 = false;
    let shouldRefreshMap1 = false;
    let shouldRefreshMap2 = false;

    // Player 1 移动逻辑
    const newX1 = gameState.player1.x + dx;
    const newY1 = gameState.player1.y + dy;
    // 首先检查是否可以直接移动（在地图内且路径畅通）
    if (newX1 >= 0 && newX1 < MAP_SIZE && newY1 >= 0 && newY1 < MAP_SIZE && 
        !isPathBlocked(gameState.map1, gameState.player1.x, gameState.player1.y, newX1, newY1)) {
        gameState.player1.x = newX1;
        gameState.player1.y = newY1;
        gameState.interactions1.playerMovedTo = { x: newX1, y: newY1 }; // 记录玩家1移动后的位置
        moved1 = true;
    } else if (gameState.gateCooldown <= 0) {
        // 处理传送门：只有在边界时才触发传送
        // 注意：只在实际穿过边界时才设置刷新标志
        if (newX1 < 0) { gameState.player1.x = MAP_SIZE - 1; shouldRefreshMap1 = true; moved1 = true; gameState.interactions1.playerMovedTo = { x: gameState.player1.x, y: gameState.player1.y }; }
        else if (newX1 >= MAP_SIZE) { gameState.player1.x = 0; shouldRefreshMap1 = true; moved1 = true; gameState.interactions1.playerMovedTo = { x: gameState.player1.x, y: gameState.player1.y }; }
        else if (newY1 < 0) { gameState.player1.y = MAP_SIZE - 1; shouldRefreshMap1 = true; moved1 = true; gameState.interactions1.playerMovedTo = { x: gameState.player1.x, y: gameState.player1.y }; }
        else if (newY1 >= MAP_SIZE) { gameState.player1.y = 0; shouldRefreshMap1 = true; moved1 = true; gameState.interactions1.playerMovedTo = { x: gameState.player1.x, y: gameState.player1.y }; }
    }

    // Player 2 移动逻辑
    const newX2 = gameState.player2.x + dx;
    const newY2 = gameState.player2.y + dy;
    // 首先检查是否可以直接移动（在地图内且路径畅通）
    if (newX2 >= 0 && newX2 < MAP_SIZE && newY2 >= 0 && newY2 < MAP_SIZE && 
        !isPathBlocked(gameState.map2, gameState.player2.x, gameState.player2.y, newX2, newY2)) {
        gameState.player2.x = newX2;
        gameState.player2.y = newY2;
        gameState.interactions2.playerMovedTo = { x: newX2, y: newY2 }; // 记录玩家2移动后的位置
        moved2 = true;
    } else if (gameState.gateCooldown <= 0) {
         if (newX2 < 0) { gameState.player2.x = MAP_SIZE - 1; shouldRefreshMap2 = true; moved2 = true; gameState.interactions2.playerMovedTo = { x: gameState.player2.x, y: gameState.player2.y }; }
        else if (newX2 >= MAP_SIZE) { gameState.player2.x = 0; shouldRefreshMap2 = true; moved2 = true; gameState.interactions2.playerMovedTo = { x: gameState.player2.x, y: gameState.player2.y }; }
        else if (newY2 < 0) { gameState.player2.y = MAP_SIZE - 1; shouldRefreshMap2 = true; moved2 = true; gameState.interactions2.playerMovedTo = { x: gameState.player2.x, y: gameState.player2.y }; }
        else if (newY2 >= MAP_SIZE) { gameState.player2.y = 0; shouldRefreshMap2 = true; moved2 = true; gameState.interactions2.playerMovedTo = { x: gameState.player2.x, y: gameState.player2.y }; }
    }

    // 如果任一地图需要刷新，则执行刷新
    if (shouldRefreshMap1 || shouldRefreshMap2) {
        if (shouldRefreshMap1) {
            gameState.map1 = generateMap();
            gameState.cheeses1 = generateCheeses(gameState.map1);
            gameState.enemies1 = generateEnemies(gameState.map1);
        }
        if (shouldRefreshMap2) {
            gameState.map2 = generateMap();
            gameState.cheeses2 = generateCheeses(gameState.map2);
            gameState.enemies2 = generateEnemies(gameState.map2);
        }
        // 刷新地图后需要重绘
        render(ctx1, gameState.map1, gameState.player1, gameState.cheeses1, gameState.enemies1);
        render(ctx2, gameState.map2, gameState.player2, gameState.cheeses2, gameState.enemies2);
        renderUI(); // 更新UI
    }


    if (moved1 || moved2) {
        gameState.gateCooldown = GATE_COOLDOWN_DURATION;
        handleGameLogic();
        // 使用 setTimeout 来控制移动冷却，模拟帧率
        setTimeout(() => { gameState.moving = false; }, 150);
    } else {
        gameState.moving = false;
    }
}

function moveEnemies() {
    // Enemies on Map 1 追踪 Player 1
    gameState.enemies1.forEach(enemy => {
        // 简单的追踪AI：每次移动一步，朝向玩家
        const dx = Math.sign(gameState.player1.x - enemy.x);
        const dy = Math.sign(gameState.player1.y - enemy.y);
        
        let hasMoved = false;
        // 优先尝试移动x方向
        if (dx !== 0 && !hasMoved) {
            const newX = enemy.x + dx;
            // 检查是否在地图内部且路径畅通
            if (newX >= 0 && newX < MAP_SIZE && !isPathBlocked(gameState.map1, enemy.x, enemy.y, newX, enemy.y)) {
                enemy.x = newX;
                gameState.interactions1.enemiesMovedTo.push({ x: newX, y: enemy.y }); // 记录敌人1移动后的位置
                hasMoved = true;
            }
        }
        // 如果x方向无法移动或不需要移动，尝试y方向
        if (dy !== 0 && !hasMoved) {
             const newY = enemy.y + dy;
            // 检查是否在地图内部且路径畅通
            if (newY >= 0 && newY < MAP_SIZE && !isPathBlocked(gameState.map1, enemy.x, enemy.y, enemy.x, newY)) {
                enemy.y = newY;
                gameState.interactions1.enemiesMovedTo.push({ x: enemy.x, y: newY }); // 记录敌人1移动后的位置
                hasMoved = true;
            }
        }
        // 如果都堵住了，敌人就不动
    });

    // Enemies on Map 2 追踪 Player 2
    gameState.enemies2.forEach(enemy => {
        const dx = Math.sign(gameState.player2.x - enemy.x);
        const dy = Math.sign(gameState.player2.y - enemy.y);
        
        let hasMoved = false;
        if (dx !== 0 && !hasMoved) {
            const newX = enemy.x + dx;
            if (newX >= 0 && newX < MAP_SIZE && !isPathBlocked(gameState.map2, enemy.x, enemy.y, newX, enemy.y)) {
                enemy.x = newX;
                gameState.interactions2.enemiesMovedTo.push({ x: newX, y: enemy.y }); // 记录敌人2移动后的位置
                hasMoved = true;
            }
        }
        if (dy !== 0 && !hasMoved) {
             const newY = enemy.y + dy;
            if (newY >= 0 && newY < MAP_SIZE && !isPathBlocked(gameState.map2, enemy.x, enemy.y, enemy.x, newY)) {
                enemy.y = newY;
                gameState.interactions2.enemiesMovedTo.push({ x: enemy.x, y: newY }); // 记录敌人2移动后的位置
                hasMoved = true;
            }
        }
    });
}

// ... (movePlayer and moveEnemies functions remain the same) ...

function handleCollisionsAndUpdates() {
    // 处理玩家-奶酪碰撞 (收集奶酪)
    gameState.cheeses1 = gameState.cheeses1.filter(cheese => {
        if (cheese.x === gameState.player1.x && cheese.y === gameState.player1.y) {
            gameState.score += 10;
            return false; // 移除被收集的奶酪
        }
        return true;
    });
    gameState.cheeses2 = gameState.cheeses2.filter(cheese => {
        if (cheese.x === gameState.player2.x && cheese.y === gameState.player2.y) {
            gameState.score += 10;
            return false;
        }
        return true;
    });

    // --- 新的玩家-敌人交互逻辑 ---
    // 基于移动后的位置状态 (interactions1, interactions2) 来判断攻击
    // 1. 玩家攻击敌人：玩家移动到敌人所在位置
    // 2. 敌人攻击玩家：敌人移动到玩家所在位置（且玩家未先移动到敌人位置）
    
    // --- 地图1交互 ---
    const interactions1 = gameState.interactions1;
    let enemies1KilledCount = 0;
    if (interactions1.playerMovedTo) {
        // 1a. 检查玩家1是否攻击了敌人1 (移动到敌人位置)
        const initialEnemyCount1 = gameState.enemies1.length;
        gameState.enemies1 = gameState.enemies1.filter(enemy => {
            if (enemy.x === interactions1.playerMovedTo.x && enemy.y === interactions1.playerMovedTo.y) {
                // 玩家攻击敌人，敌人消失
                enemies1KilledCount++;
                return false;
            }
            return true;
        });
        // 可以在这里添加玩家攻击音效等反馈
    }
    
    if (interactions1.enemiesMovedTo.length > 0) {
        // 1b. 检查敌人1是否攻击了玩家1 (敌人移动到玩家位置)
        const playerPos = { x: gameState.player1.x, y: gameState.player1.y };
        let playerHit = false;
        for (const enemyMove of interactions1.enemiesMovedTo) {
            if (enemyMove.x === playerPos.x && enemyMove.y === playerPos.y) {
                playerHit = true;
                break; // 一次移动只扣一次血
            }
        }
        if (playerHit) {
            gameState.health--;
            // 可以在这里添加玩家受伤音效等反馈
        }
    }

    // --- 地图2交互 ---
    const interactions2 = gameState.interactions2;
    let enemies2KilledCount = 0;
    if (interactions2.playerMovedTo) {
        // 2a. 检查玩家2是否攻击了敌人2 (移动到敌人位置)
        const initialEnemyCount2 = gameState.enemies2.length;
        gameState.enemies2 = gameState.enemies2.filter(enemy => {
            if (enemy.x === interactions2.playerMovedTo.x && enemy.y === interactions2.playerMovedTo.y) {
                enemies2KilledCount++;
                return false;
            }
            return true;
        });
        // 可以在这里添加玩家攻击音效等反馈
    }

    if (interactions2.enemiesMovedTo.length > 0) {
        // 2b. 检查敌人2是否攻击了玩家2 (敌人移动到玩家位置)
        const playerPos = { x: gameState.player2.x, y: gameState.player2.y };
        let playerHit = false;
        for (const enemyMove of interactions2.enemiesMovedTo) {
            if (enemyMove.x === playerPos.x && enemyMove.y === playerPos.y) {
                 playerHit = true;
                 break;
            }
        }
        if (playerHit) {
            gameState.health--;
            // 可以在这里添加玩家受伤音效等反馈
        }
    }
    
    // --- 敌人数量维持逻辑 ---
    // 地图1
    if (enemies1KilledCount > 0) {
         // 如果有敌人被消灭，则生成新的敌人，直到达到最大数量
        while (gameState.enemies1.length < 3) {
            let newEnemy;
            let attempts = 0;
            const maxAttempts = 50;
            do {
                newEnemy = {
                    x: Math.floor(Math.random() * MAP_SIZE),
                    y: Math.floor(Math.random() * MAP_SIZE),
                    health: 1
                };
                attempts++;
                // 确保新生成的敌人不与玩家、现有敌人、奶酪重叠，并且位置有效
            } while (
                (!isPositionValid(gameState.map1, newEnemy.x, newEnemy.y) ||
                 (newEnemy.x === gameState.player1.x && newEnemy.y === gameState.player1.y) ||
                 gameState.enemies1.some(e => e.x === newEnemy.x && e.y === newEnemy.y) ||
                 gameState.cheeses1.some(c => c.x === newEnemy.x && c.y === newEnemy.y)) &&
                attempts < maxAttempts
            );
            
            if (attempts < maxAttempts) {
                gameState.enemies1.push(newEnemy);
            } else {
                // 如果多次尝试都失败，可能地图太满，放弃生成
                break;
            }
        }
        // 更新UI以反映新生成的敌人
        // render调用会在gameLoop中进行，这里不需要显式调用
    }
    
    // 地图2
    if (enemies2KilledCount > 0) {
        while (gameState.enemies2.length < 3) {
            let newEnemy;
            let attempts = 0;
            const maxAttempts = 50;
            do {
                newEnemy = {
                    x: Math.floor(Math.random() * MAP_SIZE),
                    y: Math.floor(Math.random() * MAP_SIZE),
                    health: 1
                };
                attempts++;
            } while (
                (!isPositionValid(gameState.map2, newEnemy.x, newEnemy.y) ||
                 (newEnemy.x === gameState.player2.x && newEnemy.y === gameState.player2.y) ||
                 gameState.enemies2.some(e => e.x === newEnemy.x && e.y === newEnemy.y) ||
                 gameState.cheeses2.some(c => c.x === newEnemy.x && c.y === newEnemy.y)) &&
                attempts < maxAttempts
            );
            
            if (attempts < maxAttempts) {
                gameState.enemies2.push(newEnemy);
            } else {
                break;
            }
        }
        // render调用会在gameLoop中进行
    }
}

function checkWinLoseConditions() {
    if (gameState.health <= 0 && !gameState.gameOver) {
        gameState.gameOver = true;
        if (!gameState.hasReceivedTip) {
            showMessage('游戏失败', '血量耗尽了！', '重新开始', resetGame, true);
            gameState.hasReceivedTip = true;
        } else {
            showMessage('游戏失败', '血量耗尽了！', '重新开始', resetGame);
        }
    } else if (gameState.score >= WIN_SCORE && !gameState.gameWon) {
        gameState.gameWon = true;
        showMessage('通关！', '继续游戏以获得隐藏成就', '继续', () => { messageBox.style.display = 'none'; });
    }
}

function handleGameLogic() {
    if (gameState.gameOver || gameState.gameWon) return;

    moveEnemies();
    handleCollisionsAndUpdates();
    checkWinLoseConditions(); // 检查输赢
    renderUI(); // 更新UI
}