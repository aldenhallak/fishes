/**
 * 战斗动画模块
 * 负责战斗碰撞检测和动画播放
 */

const BattleAnimation = {
  // 战斗状态
  isBattling: false,
  currentBattle: null,
  
  // 碰撞检测参数
  COLLISION_DISTANCE: 80, // 碰撞距离（像素）
  BATTLE_COOLDOWN: 5000,  // 战斗冷却时间（5秒）
  lastBattleTime: {},     // 记录每条鱼的最后战斗时间
  
  /**
   * 检测两条鱼是否碰撞
   */
  checkCollision(fish1, fish2) {
    const dx = fish1.x - fish2.x;
    const dy = fish1.y - fish2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < this.COLLISION_DISTANCE;
  },
  
  /**
   * 检查是否在冷却中
   */
  isInCooldown(fishId) {
    const lastTime = this.lastBattleTime[fishId];
    if (!lastTime) return false;
    
    return Date.now() - lastTime < this.BATTLE_COOLDOWN;
  },
  
  /**
   * 在鱼缸中检测所有可能的碰撞
   */
  detectCollisions(fishes, myFishId) {
    if (this.isBattling) return null;
    
    const myFish = fishes.find(f => f.id === myFishId);
    if (!myFish || this.isInCooldown(myFishId)) return null;
    
    for (const otherFish of fishes) {
      if (otherFish.id === myFishId) continue;
      if (this.isInCooldown(otherFish.id)) continue;
      
      if (this.checkCollision(myFish, otherFish)) {
        return {
          attacker: myFish,
          defender: otherFish
        };
      }
    }
    
    return null;
  },
  
  /**
   * 播放战斗动画
   */
  async playBattleAnimation(ctx, attacker, defender, result) {
    this.isBattling = true;
    this.currentBattle = { attacker, defender, result };
    
    const startTime = Date.now();
    const duration = 1000; // 1秒动画
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          this.drawBattleFrame(ctx, attacker, defender, result, progress);
          requestAnimationFrame(animate);
        } else {
          // 动画结束
          this.isBattling = false;
          this.currentBattle = null;
          
          // 记录冷却时间
          this.lastBattleTime[attacker.id] = Date.now();
          this.lastBattleTime[defender.id] = Date.now();
          
          resolve(result);
        }
      };
      
      animate();
    });
  },
  
  /**
   * 绘制单帧战斗动画
   */
  drawBattleFrame(ctx, attacker, defender, result, progress) {
    const winner = result.winnerId === attacker.id ? attacker : defender;
    const loser = result.winnerId === attacker.id ? defender : attacker;
    
    // 阶段1：冲撞（0-0.3）
    if (progress < 0.3) {
      const rushProgress = progress / 0.3;
      this.drawRush(ctx, attacker, defender, rushProgress);
    }
    // 阶段2：碰撞效果（0.3-0.5）
    else if (progress < 0.5) {
      this.drawImpact(ctx, attacker, defender);
    }
    // 阶段3：结果显示（0.5-1.0）
    else {
      const resultProgress = (progress - 0.5) / 0.5;
      this.drawResult(ctx, winner, loser, result, resultProgress);
    }
  },
  
  /**
   * 绘制冲撞阶段
   */
  drawRush(ctx, fish1, fish2, progress) {
    // 让两条鱼向对方移动
    const dx = (fish2.x - fish1.x) * progress * 0.3;
    const dy = (fish2.y - fish1.y) * progress * 0.3;
    
    // 这里可以添加速度线或其他视觉效果
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    
    // 画攻击线
    ctx.beginPath();
    ctx.moveTo(fish1.x, fish1.y);
    ctx.lineTo(fish1.x + dx, fish1.y + dy);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(fish2.x, fish2.y);
    ctx.lineTo(fish2.x - dx, fish2.y - dy);
    ctx.stroke();
    
    ctx.restore();
  },
  
  /**
   * 绘制碰撞效果
   */
  drawImpact(ctx, fish1, fish2) {
    const centerX = (fish1.x + fish2.x) / 2;
    const centerY = (fish1.y + fish2.y) / 2;
    
    // 绘制爆炸效果
    ctx.save();
    
    // 闪光
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 50
    );
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // 粒子效果
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const x = centerX + Math.cos(angle) * 30;
      const y = centerY + Math.sin(angle) * 30;
      
      ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 屏幕震动效果（可选）
    ctx.translate(
      Math.random() * 4 - 2,
      Math.random() * 4 - 2
    );
    
    ctx.restore();
  },
  
  /**
   * 绘制结果显示
   */
  drawResult(ctx, winner, loser, result, progress) {
    // 在胜者头顶显示经验增加
    this.showFloatingText(
      ctx,
      winner.x,
      winner.y - 40,
      `+${result.changes.winner.expGained} EXP`,
      '#00ff00',
      progress
    );
    
    // 在败者头顶显示血量减少
    this.showFloatingText(
      ctx,
      loser.x,
      loser.y - 40,
      `-${result.changes.loser.healthLost} HP`,
      '#ff0000',
      progress
    );
    
    // 如果升级，显示升级特效
    if (result.changes.winner.levelUp) {
      this.showLevelUpEffect(ctx, winner.x, winner.y, progress);
    }
    
    // 如果死亡，显示死亡效果
    if (result.changes.loser.isDead) {
      this.showDeathEffect(ctx, loser.x, loser.y, progress);
    }
  },
  
  /**
   * 显示浮动文字
   */
  showFloatingText(ctx, x, y, text, color, progress) {
    ctx.save();
    
    const offsetY = -30 * progress;
    const alpha = 1 - progress;
    
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 描边
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(text, x, y + offsetY);
    
    // 填充
    ctx.fillText(text, x, y + offsetY);
    
    ctx.restore();
  },
  
  /**
   * 显示升级特效
   */
  showLevelUpEffect(ctx, x, y, progress) {
    ctx.save();
    
    const radius = 50 + progress * 30;
    const alpha = 1 - progress;
    
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  },
  
  /**
   * 显示死亡效果
   */
  showDeathEffect(ctx, x, y, progress) {
    ctx.save();
    
    const alpha = 1 - progress;
    ctx.globalAlpha = alpha;
    
    // 灰色圆圈扩散
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(x, y, 40 + progress * 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // 十字
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x, y + 15);
    ctx.stroke();
    
    ctx.restore();
  },
  
  /**
   * 绘制血条
   */
  drawHealthBar(ctx, x, y, health, maxHealth, width = 50) {
    const height = 6;
    const barY = y - 30;
    
    ctx.save();
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - width / 2, barY, width, height);
    
    // 血量
    const healthWidth = (health / maxHealth) * width;
    const healthColor = health > maxHealth * 0.5 ? '#00ff00' : 
                       health > maxHealth * 0.2 ? '#ffff00' : '#ff0000';
    
    ctx.fillStyle = healthColor;
    ctx.fillRect(x - width / 2, barY, healthWidth, height);
    
    // 边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, barY, width, height);
    
    ctx.restore();
  },
  
  /**
   * 绘制等级标签
   */
  drawLevelBadge(ctx, x, y, level) {
    const badgeY = y - 45;
    
    ctx.save();
    
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(x, badgeY, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // 等级文字
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${level}`, x, badgeY);
    
    ctx.restore();
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BattleAnimation;
}



