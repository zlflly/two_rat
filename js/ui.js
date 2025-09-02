// --- UI 交互 ---
function showMessage(text, content, buttonText, callback, showTipButton = false) {
    messageText.textContent = text;
    messageContent.textContent = content;
    messageButton.textContent = buttonText;
    messageBox.style.display = 'block';
    messageButton.onclick = callback;
    geminiTipButton.style.display = showTipButton ? 'inline-block' : 'none';
}

// --- Gemini Tip (保持原样，但通常需要API Key) ---
async function getGeminiTip() {
     // 注意：此功能需要有效的API Key
     /*
    spinner.style.display = 'block';
    geminiTipButton.disabled = true;
    messageContent.textContent = '';
    const userQuery = `我在一个双鼠探险家游戏里失败了。我的分数是 ${gameState.score}，初始血量是 ${INITIAL_HEALTH}，现在血量是 ${gameState.health}。你能根据我的表现给我一个简短的游戏建议吗？这个游戏需要我同时控制两只小鼠，收集奶酪，同时躲避追踪我的小怪。我主动碰到小怪可以消灭它们，但被它们碰到就会掉血。`;
    const apiKey = ""; // <-- 需要填入你的Gemini API Key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        // tools: [{ "google_search": {} }], // 如果需要搜索工具
        systemInstruction: {
            parts: [{ text: "你是一位富有经验的游戏教练，专为玩家提供简洁、富有鼓励性的游戏建议。你的回答应该简短、友好，并专注于提升玩家的游戏表现。" }]
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            messageContent.textContent = candidate.content.parts[0].text;
        } else {
            messageContent.textContent = "抱歉，暂时无法获取游戏小贴士。";
        }
    } catch (error) {
        console.error('Error fetching Gemini tip:', error);
        messageContent.textContent = "获取小贴士时出错。";
    } finally {
        spinner.style.display = 'none';
        geminiTipButton.disabled = false;
    }
    */
   messageContent.textContent = "此功能需要配置API Key。作为一个AI助手，我的建议是：同时观察两个地图，预判敌人的移动路径，利用同步移动的优势，比如一个鼠标引开敌人，另一个去捡奶酪。";
}