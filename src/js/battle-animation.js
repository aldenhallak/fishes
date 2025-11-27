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
   * 要求：1. 距离足够近  2. 在同一行（position_row相同或Y坐标相近）
   */
  checkCollision(fish1, fish2) {
    // 1. 检查行位置 - 如果有position_row字段，必须相同
    if (fish1.position_row !== undefined && fish2.position_row !== undefined) {
      if (fish1.position_row !== fish2.position_row) {
        return false; // 不在同一行，不能碰撞
      }
    } else {
      // 如果没有position_row字段，使用Y坐标判断是否在同一行
      // 允许的垂直误差范围（相当于一行的高度）
      const ROW_HEIGHT = 60;
      const dy = Math.abs(fish1.y - fish2.y);
      if (dy > ROW_HEIGHT) {
        return false; // 垂直距离太大，不在同一行
      }
    }
    
    // 2. 检查水平距离
    const dx = Math.abs(fish1.x - fish2.x);
    
    // 只有水平距离足够近才算碰撞（确保是正面接触）
    return dx < this.COLLISION_DISTANCE;
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
    
    // 计算碰撞中心点（两条鱼之间）
    const collisionCenterX = (attacker.x + defender.x) / 2;
    const collisionCenterY = (attacker.y + defender.y) / 2;
    
    // 存储碰撞中心点以便动画使用
    this.currentBattle.collisionCenter = {
      x: collisionCenterX,
      y: collisionCenterY
    };
    
    const startTime = Date.now();
    const duration = 1200; // 1.2秒动画（稍微加长以显示更清晰）
    
    // 立即显示碰撞效果
    this.drawImpact(ctx, attacker, defender, collisionCenterX, collisionCenterY);
    
    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
          this.drawBattleFrame(ctx, attacker, defender, result, progress, collisionCenterX, collisionCenterY);
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
  drawBattleFrame(ctx, attacker, defender, result, progress, collisionCenterX, collisionCenterY) {
    const winner = result.winnerId === attacker.id ? attacker : defender;
    const loser = result.winnerId === attacker.id ? defender : attacker;
    
    // 阶段1：碰撞效果（0-0.4） - 立即显示在两鱼中间
    if (progress < 0.4) {
      const impactProgress = progress / 0.4;
      this.drawImpact(ctx, attacker, defender, collisionCenterX, collisionCenterY, impactProgress);
    }
    // 阶段2：震动效果（0.2-0.5）
    else if (progress < 0.5) {
      const shakeProgress = (progress - 0.2) / 0.3;
      this.drawShake(ctx, attacker, defender, shakeProgress);
    }
    // 阶段3：结果显示（0.5-1.0）
    if (progress >= 0.4) {
      const resultProgress = (progress - 0.4) / 0.6;
      this.drawResult(ctx, winner, loser, result, resultProgress, collisionCenterX, collisionCenterY);
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
   * 绘制碰撞效果 - 显示在两条鱼之间的中心点
   */
  drawImpact(ctx, fish1, fish2, centerX, centerY, progress = 1) {
    // 如果没有提供中心点，自动计算
    if (centerX === undefined) {
      centerX = (fish1.x + fish2.x) / 2;
    }
    if (centerY === undefined) {
      centerY = (fish1.y + fish2.y) / 2;
    }
    
    // 绘制爆炸效果
    ctx.save();
    
    // 扩散半径随进度增加
    const maxRadius = 60;
    const currentRadius = maxRadius * progress;
    const alpha = 1 - progress * 0.5; // 渐渐淡出
    
    // 闪光效果 - 明确位于两鱼中间
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, currentRadius
    );
    gradient.addColorStop(0, `rgba(255, 255, 100, ${alpha * 0.9})`);
    gradient.addColorStop(0.4, `rgba(255, 150, 50, ${alpha * 0.6})`);
    gradient.addColorStop(0.7, `rgba(255, 80, 0, ${alpha * 0.3})`);
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 粒子爆炸效果
    const particleCount = 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 35 * progress; // 粒子向外扩散
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      ctx.fillStyle = `rgba(255, 200, 50, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, 5 * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 冲击波环
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    // 在碰撞点绘制"轰"字或星星特效
    if (progress < 0.5) {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', centerX, centerY);
    }
    
    ctx.restore();
  },
  
  /**
   * 绘制震动效果
   */
  drawShake(ctx, fish1, fish2, progress) {
    // 轻微的屏幕震动效果，不需要额外绘制
    // 这个效果会在主渲染循环中应用
  },
  
  /**
   * 绘制结果显示
   */
  drawResult(ctx, winner, loser, result, progress, collisionCenterX, collisionCenterY) {
    // 计算两条鱼的相对位置，让提示信息分开显示
    const winnerIsLeft = winner.x < loser.x;
    
    // 在胜者一侧显示"WIN!"和经验增加
    const winnerTextX = winnerIsLeft ? winner.x - 50 : winner.x + 50;
    const winnerTextY = winner.y - 60;
    
    // 显示"WIN!"
    if (progress < 0.6) {
      ctx.save();
      const winAlpha = 1 - (progress / 0.6);
      ctx.globalAlpha = winAlpha;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      
      ctx.strokeText('WIN!', winnerTextX, winnerTextY);
      ctx.fillText('WIN!', winnerTextX, winnerTextY);
      ctx.restore();
    }
    
    // 在胜者位置显示经验增加（位置调整避免重叠）
    this.showFloatingText(
      ctx,
      winnerTextX,
      winnerTextY + 30,
      `+${result.changes.winner.expGained} EXP`,
      '#00ff00',
      progress
    );
    
    // 在败者一侧显示"LOSE!"和血量减少
    const loserTextX = winnerIsLeft ? loser.x + 50 : loser.x - 50;
    const loserTextY = loser.y - 60;
    
    // 显示"LOSE!"
    if (progress < 0.6) {
      ctx.save();
      const loseAlpha = 1 - (progress / 0.6);
      ctx.globalAlpha = loseAlpha;
      ctx.fillStyle = '#FF4444';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      
      ctx.strokeText('LOSE!', loserTextX, loserTextY);
      ctx.fillText('LOSE!', loserTextX, loserTextY);
      ctx.restore();
    }
    
    // 在败者位置显示血量减少（位置调整避免重叠）
    this.showFloatingText(
      ctx,
      loserTextX,
      loserTextY + 30,
      `-${result.changes.loser.healthLost} HP`,
      '#ff0000',
      progress
    );
    
    // 如果升级，显示升级特效（位置调整）
    if (result.changes && result.changes.winner && result.changes.winner.levelUp) {
      this.showLevelUpEffect(ctx, winnerTextX, winnerTextY + 60, progress);
      
      // 显示升级文字
      this.showFloatingText(
        ctx,
        winnerTextX,
        winnerTextY + 60,
        `LEVEL UP!`,
        '#FFD700',
        progress
      );
    }
    
    // 如果死亡，显示死亡效果（位置调整）
    if (result.changes && result.changes.loser && result.changes.loser.isDead) {
      this.showDeathEffect(ctx, loserTextX, loserTextY + 60, progress);
      
      // 显示死亡文字
      this.showFloatingText(
        ctx,
        loserTextX,
        loserTextY + 60,
        `DEAD!`,
        '#666666',
        progress
      );
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

// 导出到浏览器环境
if (typeof window !== 'undefined') {
  window.BattleAnimation = BattleAnimation;
}

// 导出到 Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BattleAnimation;
}



