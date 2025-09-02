// --- 渲染 ---
function renderMap(ctx, map) {
    ctx.fillStyle = MAP_COLORS.background;
    ctx.fillRect(0, 0, canvas1.width, canvas1.height);

    // 1. 首先绘制实心的紫色边界方块，作为不可通行区域
    ctx.fillStyle = MAP_COLORS.wall; // 使用墙的颜色
    const blockSize = GRID_SIZE;
    const totalSize = MAP_SIZE * GRID_SIZE;
    
    // 绘制顶部和底部的实心条
    ctx.fillRect(0, -blockSize, totalSize, blockSize); // 顶部条 (在地图上方)
    ctx.fillRect(0, totalSize, totalSize, blockSize);  // 底部条 (在地图下方)
    
    // 绘制左侧和右侧的实心条
    ctx.fillRect(-blockSize, 0, blockSize, totalSize);  // 左侧条 (在地图左方)
    ctx.fillRect(totalSize, 0, blockSize, totalSize);   // 右侧条 (在地图右方)

    // 2. 然后绘制内部的墙线
    ctx.strokeStyle = MAP_COLORS.wall;
    ctx.lineWidth = 3; // 线条宽度
    ctx.lineCap = 'butt'; // 确保线条端点是平的

    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = map[y][x];
            const posX = x * GRID_SIZE;
            const posY = y * GRID_SIZE;

            // 绘制右侧墙线 (标志位1)
            if ((cell & 1) && x < MAP_SIZE - 1) {
                ctx.beginPath();
                ctx.moveTo(posX + GRID_SIZE, posY);
                ctx.lineTo(posX + GRID_SIZE, posY + GRID_SIZE);
                ctx.stroke();
            }
            // 绘制下侧墙线 (标志位2)
            if ((cell & 2) && y < MAP_SIZE - 1) {
                ctx.beginPath();
                ctx.moveTo(posX, posY + GRID_SIZE);
                ctx.lineTo(posX + GRID_SIZE, posY + GRID_SIZE);
                ctx.stroke();
            }
        }
    }
    
    // 3. 最后，在实心边界上绘制“传送门” (即可通行的缺口)
    // 为了简单起见，我们可以在每个边界上随机选择一个位置作为传送门
    // 这里我们只绘制视觉效果，实际的传送逻辑在 movePlayer 中处理
    ctx.fillStyle = MAP_COLORS.background; // 用背景色绘制缺口，表示可通行
    
    // 顶部传送门缺口 (在顶部实心条上)
    const topGateIndex = Math.floor(Math.random() * MAP_SIZE);
    ctx.fillRect(topGateIndex * GRID_SIZE, -blockSize, GRID_SIZE, blockSize);
    
    // 底部传送门缺口 (在底部实心条上)
    const bottomGateIndex = Math.floor(Math.random() * MAP_SIZE);
    ctx.fillRect(bottomGateIndex * GRID_SIZE, totalSize, GRID_SIZE, blockSize);
    
    // 左侧传送门缺口 (在左侧实心条上)
    const leftGateIndex = Math.floor(Math.random() * MAP_SIZE);
    ctx.fillRect(-blockSize, leftGateIndex * GRID_SIZE, blockSize, GRID_SIZE);
    
    // 右侧传送门缺口 (在右侧实心条上)
    const rightGateIndex = Math.floor(Math.random() * MAP_SIZE);
    ctx.fillRect(totalSize, rightGateIndex * GRID_SIZE, blockSize, GRID_SIZE);
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