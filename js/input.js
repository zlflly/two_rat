// --- 输入处理 ---
document.addEventListener('keydown', (e) => {
    // 防止在消息框显示时移动
    if (gameState.moving || gameState.gameOver || gameState.gameWon || messageBox.style.display !== 'none') return;
    
    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
});