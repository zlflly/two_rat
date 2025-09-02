// --- 渲染 ---
function renderMap(ctx, map) {
    ctx.fillStyle = MAP_COLORS.background;
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);

    ctx.strokeStyle = MAP_COLORS.wall;
    ctx.lineWidth = 3; // 线条宽度
    ctx.lineCap = 'butt'; // 确保线条端点是平的

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = map[y][x];
            const posX = x * GRID_SIZE;
            const posY = y * GRID_SIZE;

            // 如果右侧有墙 (标志位1)
            // 不绘制最右边一列格子的右墙（它们是右边界）
            if ((cell & 1) && x < MAP_SIZE - 1) {
                ctx.beginPath();
                // 从当前格子的右上角画到右下角
                ctx.moveTo(posX + GRID_SIZE, posY);
                ctx.lineTo(posX + GRID_SIZE, posY + GRID_SIZE);
                ctx.stroke();
            }
            // 如果下侧有墙 (标志位2)
            // 不绘制最下面一行格子的下墙（它们是下边界）
            if ((cell & 2) && y < MAP_SIZE - 1) {
                ctx.beginPath();
                // 从当前格子的左下角画到右下角
                ctx.moveTo(posX, posY + GRID_SIZE);
                ctx.lineTo(posX + GRID_SIZE, posY + GRID_SIZE);
                ctx.stroke();
            }
        }
    }
    
    // 绘制地图的外边界 (固定边界)，现在是带缺口的
    // 我们需要绘制四条边，但每条边要根据传送门位置留出缺口
    // 为了视觉效果，我们使用虚线来表示边界
    ctx.setLineDash([10, 5]); // 设置虚线样式：10px实线，5px虚线
    ctx.strokeStyle = MAP_COLORS.wall;
    ctx.lineWidth = 5; // 外边界稍宽一点
    
    // 获取传送门位置（通过检查边界线是否存在来反推）
    // 这是一个简化的推断方法，实际生成时已知
    // 但在渲染时，我们可以通过检查边界线来确定缺口
    // 不过，更简单的方法是在 generateMap 时就存储传送门信息
    // 为了避免增加状态复杂度，我们在这里通过检查第一行/列和最后一行/列来推断
    
    // Top boundary (y=0)
    let gapStartX = -1;
    let gapEndX = -1;
    for(let i = 0; i < MAP_SIZE; i++) {
        if (!(map[0][i] & 2)) { // 如果没有下边线，则是缺口
            if (gapStartX === -1) gapStartX = i * GRID_SIZE;
            gapEndX = (i + 1) * GRID_SIZE;
        }
    }
    if (gapStartX !== -1) {
        // 绘制缺口左边的线段
        if (gapStartX > 0) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(gapStartX, 0);
            ctx.stroke();
        }
        // 绘制缺口右边的线段
        if (gapEndX < MAP_SIZE * GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(gapEndX, 0);
            ctx.lineTo(MAP_SIZE * GRID_SIZE, 0);
            ctx.stroke();
        }
    } else {
        // 如果没找到缺口（理论上不应该），绘制完整边框
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(MAP_SIZE * GRID_SIZE, 0);
        ctx.stroke();
    }

    // Bottom boundary (y=MAP_SIZE-1)
    gapStartX = -1;
    gapEndX = -1;
    for(let i = 0; i < MAP_SIZE; i++) {
        if (!(map[MAP_SIZE - 1][i] & 2)) {
            if (gapStartX === -1) gapStartX = i * GRID_SIZE;
            gapEndX = (i + 1) * GRID_SIZE;
        }
    }
    if (gapStartX !== -1) {
        if (gapStartX > 0) {
            ctx.beginPath();
            ctx.moveTo(0, MAP_SIZE * GRID_SIZE);
            ctx.lineTo(gapStartX, MAP_SIZE * GRID_SIZE);
            ctx.stroke();
        }
        if (gapEndX < MAP_SIZE * GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(gapEndX, MAP_SIZE * GRID_SIZE);
            ctx.lineTo(MAP_SIZE * GRID_SIZE, MAP_SIZE * GRID_SIZE);
            ctx.stroke();
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(0, MAP_SIZE * GRID_SIZE);
        ctx.lineTo(MAP_SIZE * GRID_SIZE, MAP_SIZE * GRID_SIZE);
        ctx.stroke();
    }

    // Left boundary (x=0)
    let gapStartY = -1;
    let gapEndY = -1;
    for(let i = 0; i < MAP_SIZE; i++) {
        if (!(map[i][0] & 1)) { // 如果没有右边线，则是缺口
            if (gapStartY === -1) gapStartY = i * GRID_SIZE;
            gapEndY = (i + 1) * GRID_SIZE;
        }
    }
    if (gapStartY !== -1) {
        if (gapStartY > 0) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, gapStartY);
            ctx.stroke();
        }
        if (gapEndY < MAP_SIZE * GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, gapEndY);
            ctx.lineTo(0, MAP_SIZE * GRID_SIZE);
            ctx.stroke();
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, MAP_SIZE * GRID_SIZE);
        ctx.stroke();
    }

    // Right boundary (x=MAP_SIZE-1)
    gapStartY = -1;
    gapEndY = -1;
    for(let i = 0; i < MAP_SIZE; i++) {
        if (!(map[i][MAP_SIZE - 1] & 1)) {
            if (gapStartY === -1) gapStartY = i * GRID_SIZE;
            gapEndY = (i + 1) * GRID_SIZE;
        }
    }
    if (gapStartY !== -1) {
        if (gapStartY > 0) {
            ctx.beginPath();
            ctx.moveTo(MAP_SIZE * GRID_SIZE, 0);
            ctx.lineTo(MAP_SIZE * GRID_SIZE, gapStartY);
            ctx.stroke();
        }
        if (gapEndY < MAP_SIZE * GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(MAP_SIZE * GRID_SIZE, gapEndY);
            ctx.lineTo(MAP_SIZE * GRID_SIZE, MAP_SIZE * GRID_SIZE);
            ctx.stroke();
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(MAP_SIZE * GRID_SIZE, 0);
        ctx.lineTo(MAP_SIZE * GRID_SIZE, MAP_SIZE * GRID_SIZE);
        ctx.stroke();
    }
    
    // 重置虚线样式
    ctx.setLineDash([]);
}

function renderEntities(ctx, cheeses, enemies, player) {
    // 绘制奶酪
    cheeses.forEach(cheese => {
        ctx.fillStyle = MAP_COLORS.cheese;
        ctx.beginPath();
        ctx.arc(
            cheese.x * GRID_SIZE + GRID_SIZE / 2,
            cheese.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 3, // 稍微调整大小
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    // 绘制敌人
    enemies.forEach(enemy => {
        ctx.fillStyle = MAP_COLORS.enemy;
        // 绘制一个稍微圆润的矩形代表敌人
        ctx.beginPath();
        const radius = GRID_SIZE / 4;
        ctx.roundRect(
            enemy.x * GRID_SIZE + radius,
            enemy.y * GRID_SIZE + radius,
            GRID_SIZE - 2 * radius,
            GRID_SIZE - 2 * radius,
            radius
        );
        ctx.fill();
    });

    // 绘制玩家 (小鼠)
    ctx.fillStyle = MAP_COLORS.player;
    // 绘制一个圆形代表小鼠
    ctx.beginPath();
    ctx.arc(
        player.x * GRID_SIZE + GRID_SIZE / 2,
        player.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function render(ctx, map, player, cheeses, enemies) {
    renderMap(ctx, map);
    renderEntities(ctx, cheeses, enemies, player);
}

function renderUI() {
    scoreElement.textContent = gameState.score;
    let healthHearts = '';
    for (let i = 0; i < gameState.health; i++) {
        healthHearts += '❤️';
    }
    // 如果血量为0，显示0个心
    if (gameState.health <= 0) {
         healthHearts = '';
    }
    healthElement.textContent = healthHearts || '💀';
}