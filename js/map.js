// --- 地图和对象生成 ---
// 地图现在存储线的信息，而不是填充的格子。
// 0: 无墙, 1: 右侧有墙, 2: 下侧有墙, 3: 右侧和下侧都有墙
// 为了实现"实心紫色方块作为最外圈"的视觉效果和传送门，
// 我们不将边界作为墙线存储在地图数据中。
// 地图数据仅表示内部的墙线。
// 传送门的逻辑和渲染将单独处理。

// 计算两个传送门位置之间的曼哈顿距离
function getManhattanDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

// 生成随机传送门位置，确保传送门之间距离不小于5
function generateGatePositions() {
    const MIN_DISTANCE = 5;
    const MAX_ATTEMPTS = 100;
    let attempts = 0;
    
    while (attempts < MAX_ATTEMPTS) {
        const positions = {
            top: Math.floor(Math.random() * MAP_SIZE),      // 顶部边界的传送门x坐标
            bottom: Math.floor(Math.random() * MAP_SIZE),   // 底部边界的传送门x坐标
            left: Math.floor(Math.random() * MAP_SIZE),     // 左侧边界的传送门y坐标
            right: Math.floor(Math.random() * MAP_SIZE)     // 右侧边界的传送门y坐标
        };
        
        // 将传送门位置转换为坐标进行距离计算
        const gateCoords = [
            { x: positions.top, y: 0 },         // 顶部传送门
            { x: positions.bottom, y: MAP_SIZE - 1 }, // 底部传送门
            { x: 0, y: positions.left },        // 左侧传送门
            { x: MAP_SIZE - 1, y: positions.right }  // 右侧传送门
        ];
        
        // 检查所有传送门之间的距离
        let validDistance = true;
        for (let i = 0; i < gateCoords.length && validDistance; i++) {
            for (let j = i + 1; j < gateCoords.length && validDistance; j++) {
                if (getManhattanDistance(gateCoords[i], gateCoords[j]) < MIN_DISTANCE) {
                    validDistance = false;
                }
            }
        }
        
        if (validDistance) {
            return positions;
        }
        
        attempts++;
    }
    
    // 如果多次尝试都失败，返回默认的距离足够远的位置
    return {
        top: 2,
        bottom: MAP_SIZE - 3,
        left: 2,
        right: MAP_SIZE - 3
    };
}

function generateMap(gatePositions = null) {
    const map = [];
    
    for (let y = 0; y < MAP_SIZE; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_SIZE; x++) {
            let cell = 0;
            
            // 生成内部随机墙线 (不包括最外圈)
            if (x < MAP_SIZE - 1 && y < MAP_SIZE - 1) { // 只在内部格子生成墙线
                // 检查是否在最外圈，如果是且可能阻挡传送门则降低墙线概率
                let wallProbability = 0.15;
                
                if (gatePositions && isNearGate(x, y, gatePositions)) {
                    wallProbability = 0.05; // 在传送门附近降低墙线生成概率
                }
                
                if (Math.random() < wallProbability) {
                    cell |= 1; // 设置右侧墙的标志位
                }
                if (Math.random() < wallProbability) {
                    cell |= 2; // 设置下侧墙的标志位
                }
            } else if (x < MAP_SIZE - 1 && y === MAP_SIZE - 1) { // 最下面一行，只生成右侧墙线
                // 检查是否会阻挡底部传送门
                let shouldGenerate = Math.random() < 0.15;
                if (gatePositions && wouldBlockBottomGate(x, gatePositions.bottom)) {
                    shouldGenerate = false; // 不生成会阻挡传送门的墙线
                }
                if (shouldGenerate) {
                    cell |= 1;
                }
            } else if (y < MAP_SIZE - 1 && x === MAP_SIZE - 1) { // 最右边一列，只生成下侧墙线
                // 检查是否会阻挡右侧传送门
                let shouldGenerate = Math.random() < 0.15;
                if (gatePositions && wouldBlockRightGate(y, gatePositions.right)) {
                    shouldGenerate = false; // 不生成会阻挡传送门的墙线
                }
                if (shouldGenerate) {
                    cell |= 2;
                }
            }
            // (MAP_SIZE-1, MAP_SIZE-1) 格子不生成任何内部墙线
            
            map[y][x] = cell;
        }
    }

    // 不再在地图数据中存储边界墙线
    // 传送门逻辑将在 movePlayer 中通过坐标检查处理
    // 边界渲染将在 renderMap 中通过绘制实心方块实现

    return map;
}

// 检查位置是否靠近传送门
function isNearGate(x, y, gatePositions) {
    const GATE_BUFFER = 2; // 传送门周围2格范围内
    
    // 检查是否靠近顶部传送门 (第一行)
    if (y === 0 && Math.abs(x - gatePositions.top) <= GATE_BUFFER) {
        return true;
    }
    
    // 检查是否靠近底部传送门 (最后一行)
    if (y === MAP_SIZE - 1 && Math.abs(x - gatePositions.bottom) <= GATE_BUFFER) {
        return true;
    }
    
    // 检查是否靠近左侧传送门 (第一列)
    if (x === 0 && Math.abs(y - gatePositions.left) <= GATE_BUFFER) {
        return true;
    }
    
    // 检查是否靠近右侧传送门 (最后一列)
    if (x === MAP_SIZE - 1 && Math.abs(y - gatePositions.right) <= GATE_BUFFER) {
        return true;
    }
    
    return false;
}

// 检查墙线是否会阻挡底部传送门
function wouldBlockBottomGate(wallX, gateX) {
    return Math.abs(wallX - gateX) <= 1; // 传送门左右1格范围内不生成墙线
}

// 检查墙线是否会阻挡右侧传送门
function wouldBlockRightGate(wallY, gateY) {
    return Math.abs(wallY - gateY) <= 1; // 传送门上下1格范围内不生成墙线
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

// 检查玩家是否位于传送门位置，并返回传送目标位置
function canTeleportAndGetTarget(playerX, playerY, dx, dy, gatePositions) {
    const newX = playerX + dx;
    const newY = playerY + dy;
    
    // 检查是否移动到边界外，并且当前位置是否在对应的传送门位置
    if (newX < 0 && playerY === gatePositions.left) {
        // 从左边界传送到右边界对应的传送门位置
        return { x: MAP_SIZE - 1, y: gatePositions.right };
    }
    if (newX >= MAP_SIZE && playerY === gatePositions.right) {
        // 从右边界传送到左边界对应的传送门位置
        return { x: 0, y: gatePositions.left };
    }
    if (newY < 0 && playerX === gatePositions.top) {
        // 从顶部边界传送到底部边界对应的传送门位置
        return { x: gatePositions.bottom, y: MAP_SIZE - 1 };
    }
    if (newY >= MAP_SIZE && playerX === gatePositions.bottom) {
        // 从底部边界传送到顶部边界对应的传送门位置
        return { x: gatePositions.top, y: 0 };
    }
    
    return null; // 不能传送
}