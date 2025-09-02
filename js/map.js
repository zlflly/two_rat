// --- 地图和对象生成 ---
// 地图现在存储线的信息，而不是填充的格子。
// 0: 无墙, 1: 右侧有墙, 2: 下侧有墙, 3: 右侧和下侧都有墙
// 地图生成时随机确定一个传送门位置
function generateMap() {
    const map = [];
    // 随机选择一个边界作为传送门
    const gateSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const gateIndex = Math.floor(Math.random() * MAP_SIZE); // 传送门在边界上的索引

    for (let y = 0; y < MAP_SIZE; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_SIZE; x++) {
            let cell = 0;
            
            // 生成内部随机墙线
            if (x < MAP_SIZE - 1) { // 右侧边界线单独处理
                if (Math.random() < 0.15) {
                    cell |= 1; // 设置右侧墙的标志位
                }
            }
            if (y < MAP_SIZE - 1) { // 下侧边界线单独处理
                if (Math.random() < 0.15) {
                    cell |= 2; // 设置下侧墙的标志位
                }
            }
            
            map[y][x] = cell;
        }
    }

    // 绘制地图外边界，但为传送门留出一个缺口
    for (let i = 0; i < MAP_SIZE; i++) {
        // Top boundary (y=0)
        // 对于顶部边界，墙线存储在第0行的格子的下侧 (flag 2)
        if (gateSide !== 0 || i !== gateIndex) {
            map[0][i] |= 2; // 设置上边框线 (当前格子的下边线)
        }
        // Bottom boundary (y=MAP_SIZE-1)
        // 对于底部边界，墙线存储在倒数第二行的格子的下侧 (flag 2)
        if (gateSide !== 2 || i !== gateIndex) {
             map[MAP_SIZE - 1][i] |= 2; // 设置下边框线 (当前格子的下边线)
        }
        // Left boundary (x=0)
        // 对于左侧边界，墙线存储在第0列的格子的右侧 (flag 1)
        if (gateSide !== 3 || i !== gateIndex) {
             map[i][0] |= 1; // 设置左边框线 (当前格子的右边线)
        }
        // Right boundary (x=MAP_SIZE-1)
        // 对于右侧边界，墙线存储在倒数第二列的格子的右侧 (flag 1)
        if (gateSide !== 1 || i !== gateIndex) {
             map[i][MAP_SIZE - 1] |= 1; // 设置右边框线 (当前格子的右边线)
        }
    }

    return map;
}

// 检查从格子(x1,y1)到格子(x2,y2)的移动是否被墙阻挡
// 用于判断玩家或敌人是否可以移动
function isPathBlocked(map, x1, y1, x2, y2) {
    // 严格要求所有点都在地图内部，此函数只处理内部路径检查
    if (x1 < 0 || x1 >= MAP_SIZE || y1 < 0 || y1 >= MAP_SIZE ||
        x2 < 0 || x2 >= MAP_SIZE || y2 < 0 || y2 >= MAP_SIZE) {
        // 如果任一点在地图外，说明调用方式有问题或者需要特殊处理（如传送）
        // 对于纯粹的内部路径检查，这种情况视为路径被阻挡（不允许）
        // 这可以防止任何意外的越界移动
        return true; 
    }

    // 水平移动 (dx != 0, dy == 0)
    if (y1 === y2) {
        const minX = Math.min(x1, x2);
        // 检查起始格子右侧的墙（从左向右移动）或目标格子左侧的墙（从右向左移动）
        // 例如，从(0,0)到(1,0)，检查格子(0,0)右侧的墙
        // 例如，从(1,0)到(0,0)，检查格子(0,0)右侧的墙
        if ((map[y1][minX] & 1)) { // 检查两个格子之间（偏移较小者）的右侧是否有墙
            return true; // 路径被阻挡
        }
    }
    // 垂直移动 (dx == 0, dy != 0)
    else if (x1 === x2) {
        const minY = Math.min(y1, y2);
        // 检查起始格子下侧的墙（从上向下移动）或目标格子上侧的墙（从下向上移动）
        if ((map[minY][x1] & 2)) { // 检查两个格子之间（偏移较小者）的下侧是否有墙
            return true; // 路径被阻挡
        }
    } else {
        // 不允许对角线移动
        return true;
    }
    return false; // 路径畅通
}

// 检查一个格子本身是否可以放置物品（奶酪/敌人）
// 即，这个格子不是墙的交叉点（尽管我们的生成逻辑不会在格子内生成墙）
// 这个函数主要用于生成逻辑，确保物品不生成在墙“线上”。
// 但根据新的线逻辑，格子本身总是可以放置的，阻挡的是格子之间的边。
// 因此，这个函数可以简化，或者直接在生成时检查 isPathBlocked。
// 为了清晰起见，我们保留一个检查格子是否有效的函数。
function isPositionValid(map, x, y) {
    return x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE;
}

function generateCheeses(map) {
    const cheeses = [];
    const cheeseCount = 5;
    for (let i = 0; i < cheeseCount; i++) {
        let pos;
        let attempts = 0;
        const maxAttempts = 100; // 防止无限循环
        do {
            // 可以在任何有效格子生成，包括边界内侧
            pos = {
                x: Math.floor(Math.random() * MAP_SIZE),
                y: Math.floor(Math.random() * MAP_SIZE)
            };
            attempts++;
            // 确保新生成的奶酪不与已有的奶酪重叠，并且位置有效
        } while (
            (!isPositionValid(map, pos.x, pos.y) || cheeses.some(c => c.x === pos.x && c.y === pos.y)) &&
            attempts < maxAttempts
        );
        // 如果尝试次数过多，就在地图上找一个空位
        if (attempts >= maxAttempts) {
            let found = false;
            for (let ty = 0; ty < MAP_SIZE && !found; ty++) {
                for (let tx = 0; tx < MAP_SIZE && !found; tx++) {
                    if (isPositionValid(map, tx, ty) && !cheeses.some(c => c.x === tx && c.y === ty)) {
                        pos = { x: tx, y: ty };
                        found = true;
                    }
                }
            }
            // 如果还是找不到空位，则跳过这个奶酪
            if (!found) continue; 
        }
        cheeses.push(pos);
    }
    return cheeses;
}

function generateEnemies(map) {
    const enemies = [];
    const enemyCount = 3;
    for (let i = 0; i < enemyCount; i++) {
        let pos;
        let attempts = 0;
        const maxAttempts = 100;
        do {
            pos = {
                x: Math.floor(Math.random() * MAP_SIZE),
                y: Math.floor(Math.random() * MAP_SIZE),
                health: 1
            };
            attempts++;
        } while (
            (!isPositionValid(map, pos.x, pos.y) || enemies.some(e => e.x === pos.x && e.y === pos.y)) &&
            attempts < maxAttempts
        );
        
        if (attempts >= maxAttempts) {
            let found = false;
            for (let ty = 0; ty < MAP_SIZE && !found; ty++) {
                for (let tx = 0; tx < MAP_SIZE && !found; tx++) {
                    if (isPositionValid(map, tx, ty) && !enemies.some(e => e.x === tx && e.y === ty)) {
                        pos = { x: tx, y: ty };
                        found = true;
                    }
                }
            }
            if (!found) continue;
        }
        enemies.push(pos);
    }
    return enemies;
}