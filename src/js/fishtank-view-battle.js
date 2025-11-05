/**
 * Battle Mode functionality for fishtank-view
 * Extracted to separate file to avoid conflicts
 */

async function enterBattleMode() {
    try {
        // Get current user
        const user = await window.supabaseAuth.getUser();
        if (!user) {
            alert('请先登录才能进入战斗模式！');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('🔍 当前用户:', user);
        console.log('🔍 鱼缸中的鱼数量:', tankFish ? tankFish.length : 0);
        
        // Check if there are fish in the tank
        if (!tankFish || tankFish.length === 0) {
            alert('鱼缸中没有鱼！请先添加鱼。');
            return;
        }
        
        // Debug: 打印所有鱼的用户ID字段
        console.log('🔍 鱼缸中的鱼数据:', tankFish.map(fish => ({
            id: fish.id || fish.docId,
            artist: fish.artist || fish.Artist,
            user_id: fish.user_id,
            UserId: fish.UserId,
            userId: fish.userId,
            owner_id: fish.owner_id,
            ownerId: fish.ownerId
        })));
        
        // Get user's fish from the tank - 尝试所有可能的用户ID字段名
        const userFish = tankFish.filter(fish => {
            const fishUserId = fish.user_id || fish.UserId || fish.userId || fish.owner_id || fish.ownerId;
            console.log(`🔍 比较: 鱼 ${fish.id || fish.docId} 的userId=${fishUserId}, 当前用户=${user.id}`);
            return fishUserId === user.id;
        });
        
        console.log('🔍 用户的鱼数量:', userFish.length);
        
        if (userFish.length === 0) {
            // 更详细的错误信息
            alert(`鱼缸中没有你的鱼！\n\n当前用户ID: ${user.id}\n鱼缸中共有 ${tankFish.length} 条鱼\n请先添加你的鱼到鱼缸。\n\n请检查浏览器控制台查看详细信息。`);
            return;
        }
        
        // Use the first fish for battle
        const selectedFish = userFish[0];
        const fishId = selectedFish.id || selectedFish.docId;
        
        // Show loading state
        const battleBtn = document.getElementById('battle-mode-btn');
        const originalText = battleBtn.innerHTML;
        battleBtn.innerHTML = '⏳ 进入中...';
        battleBtn.disabled = true;
        
        // Load BattleClient if not already loaded
        if (typeof BattleClient === 'undefined') {
            alert('战斗系统正在加载中...');
            battleBtn.innerHTML = originalText;
            battleBtn.disabled = false;
            return;
        }
        
        // Call enter battle mode API
        const result = await BattleClient.enterBattleMode(user.id, fishId);
        
        if (result.success) {
            alert(`✅ 成功进入战斗模式！\n\n当前在线: ${result.currentUsers}/${result.maxUsers}\n鱼: ${selectedFish.Artist || selectedFish.artist || 'Anonymous'}`);
            battleBtn.innerHTML = '✓ 战斗中';
            battleBtn.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
            
            // Redirect to battle demo page for full battle experience
            setTimeout(() => {
                if (confirm('是否前往战斗页面查看实时战斗？')) {
                    window.location.href = `battle-demo.html?userId=${user.id}&fishId=${fishId}`;
                }
            }, 1000);
        } else if (result.inQueue) {
            alert(`⏳ 战斗模式已满！\n\n已加入排队：第 ${result.position} 位\n预计等待：${result.estimatedWait}秒`);
            battleBtn.innerHTML = originalText;
            battleBtn.disabled = false;
        } else {
            alert(`❌ 进入失败：${result.error || result.message}`);
            battleBtn.innerHTML = originalText;
            battleBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('进入战斗模式错误:', error);
        alert(`❌ 错误：${error.message}`);
        
        const battleBtn = document.getElementById('battle-mode-btn');
        if (battleBtn) {
            battleBtn.innerHTML = '⚔️ Battle Mode';
            battleBtn.disabled = false;
        }
    }
}

// Export to global scope
window.enterBattleMode = enterBattleMode;



