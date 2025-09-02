// --- 渲染 ---
function renderMap(ctx, map, gatePositions) {

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
    
    // 3. 最后，在实心边界上绘制"传送门" (即可通行的缺口)
    // 使用实际的传送门位置数据
    ctx.fillStyle = MAP_COLORS.background; // 用背景色绘制缺口，表示可通行
    
    // 顶部传送门缺口 (在顶部实心条上)
    ctx.fillRect(gatePositions.top * GRID_SIZE, -blockSize, GRID_SIZE, blockSize);
    
    // 底部传送门缺口 (在底部实心条上)
    ctx.fillRect(gatePositions.bottom * GRID_SIZE, totalSize, GRID_SIZE, blockSize);
    
    // 左侧传送门缺口 (在左侧实心条上)
    ctx.fillRect(-blockSize, gatePositions.left * GRID_SIZE, blockSize, GRID_SIZE);
    
    // 右侧传送门缺口 (在右侧实心条上)
    ctx.fillRect(totalSize, gatePositions.right * GRID_SIZE, blockSize, GRID_SIZE);
    
    // 5. 在地图外添加发光箭头标记传送门位置
    renderGateArrows(ctx, gatePositions);
}

// 渲染发光箭头标记传送门位置
function renderGateArrows(ctx, gatePositions) {
    const currentTime = Date.now();
    const pulseIntensity = 0.5 + 0.5 * Math.sin(currentTime * 0.005); // 脉动效果
    
    const arrowSize = 15;
    const offset = 35; // 箭头距离地图边界的距离
    
    // 保存当前绘图状态
    ctx.save();
    
    // 设置发光效果
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(0, 255, 0, ${pulseIntensity})`;
    ctx.fillStyle = `rgba(0, 255, 0, ${0.8 + 0.2 * pulseIntensity})`;
    
    // 顶部箭头 (指向下方)
    const topX = gatePositions.top * GRID_SIZE + GRID_SIZE / 2;
    const topY = -offset;
    drawArrow(ctx, topX, topY, arrowSize, 'down');
    
    // 底部箭头 (指向上方)
    const bottomX = gatePositions.bottom * GRID_SIZE + GRID_SIZE / 2;
    const bottomY = MAP_SIZE * GRID_SIZE + offset;
    drawArrow(ctx, bottomX, bottomY, arrowSize, 'up');
    
    // 左侧箭头 (指向右方)
    const leftX = -offset;
    const leftY = gatePositions.left * GRID_SIZE + GRID_SIZE / 2;
    drawArrow(ctx, leftX, leftY, arrowSize, 'right');
    
    // 右侧箭头 (指向左方)
    const rightX = MAP_SIZE * GRID_SIZE + offset;
    const rightY = gatePositions.right * GRID_SIZE + GRID_SIZE / 2;
    drawArrow(ctx, rightX, rightY, arrowSize, 'left');
    
    // 恢复绘图状态
    ctx.restore();
}

// 绘制箭头
function drawArrow(ctx, x, y, size, direction) {
    ctx.beginPath();
    
    const halfSize = size / 2;
    
    switch (direction) {
        case 'down':
            ctx.moveTo(x, y + halfSize);
            ctx.lineTo(x - halfSize, y - halfSize);
            ctx.lineTo(x + halfSize, y - halfSize);
            break;
        case 'up':
            ctx.moveTo(x, y - halfSize);
            ctx.lineTo(x - halfSize, y + halfSize);
            ctx.lineTo(x + halfSize, y + halfSize);
            break;
        case 'right':
            ctx.moveTo(x + halfSize, y);
            ctx.lineTo(x - halfSize, y - halfSize);
            ctx.lineTo(x - halfSize, y + halfSize);
            break;
        case 'left':
            ctx.moveTo(x - halfSize, y);
            ctx.lineTo(x + halfSize, y - halfSize);
            ctx.lineTo(x + halfSize, y + halfSize);
            break;
    }
    
    ctx.closePath();
    ctx.fill();
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
        ctx.font = `${GRID_SIZE * 0.8}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐍', enemy.x * GRID_SIZE + GRID_SIZE / 2, enemy.y * GRID_SIZE + GRID_SIZE / 2);
    });

    // 绘制玩家 (小鼠)
    ctx.font = `${GRID_SIZE * 0.8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐁', player.x * GRID_SIZE + GRID_SIZE / 2, player.y * GRID_SIZE + GRID_SIZE / 2);
}

function render(ctx, map, player, cheeses, enemies, gatePositions) {
    // 清除整个画布
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 填充背景色
    ctx.fillStyle = MAP_COLORS.background;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // 保存当前状态并移动画布原点到中心
    ctx.save();
    const offset = (ctx.canvas.width - MAP_SIZE * GRID_SIZE) / 2;
    ctx.translate(offset, offset);

    renderMap(ctx, map, gatePositions);
    renderEntities(ctx, cheeses, enemies, player);

    // 恢复画布状态
    ctx.restore();
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