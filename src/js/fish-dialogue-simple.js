// Simple Fish Dialogue System for Phase 0
// Displays preset dialogues for fish in the tank

class SimpleFishDialogueManager {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.activeDialogues = new Map(); // fish_id -> {text, x, y, alpha, timestamp}
        this.dialogueCooldowns = new Map(); // fish_id -> timestamp
        this.MIN_COOLDOWN = 30000; // 30 seconds
        this.MAX_COOLDOWN = 120000; // 120 seconds
        this.DIALOGUE_DURATION = 5000; // 5 seconds
    }

    // Check if fish should speak
    shouldFishSpeak(fish) {
        const lastSpoke = this.dialogueCooldowns.get(fish.id);
        if (!lastSpoke) return true;
        
        const timeSinceLastSpoke = Date.now() - lastSpoke;
        const cooldown = this.MIN_COOLDOWN + Math.random() * (this.MAX_COOLDOWN - this.MIN_COOLDOWN);
        
        return timeSinceLastSpoke >= cooldown;
    }

    // Trigger dialogue for a fish
    triggerDialogue(fish) {
        if (!fish.fish_name) return; // Only fish with names can speak
        
        // Get dialogue based on personality
        const personality = fish.personality || getRandomPersonality();
        const dialogue = getRandomDialogue(personality);
        
        this.activeDialogues.set(fish.id, {
            text: dialogue,
            x: fish.x,
            y: fish.y,
            alpha: 1.0,
            timestamp: Date.now(),
            fishId: fish.id
        });
        
        this.dialogueCooldowns.set(fish.id, Date.now());
        
        // Auto-remove after duration
        setTimeout(() => {
            this.activeDialogues.delete(fish.id);
        }, this.DIALOGUE_DURATION);
    }

    // Update dialogues (call this in animation loop)
    updateDialogues(fishes) {
        // Randomly trigger dialogues for fish
        for (const fish of fishes) {
            if (this.shouldFishSpeak(fish) && Math.random() < 0.01) { // 1% chance per frame
                this.triggerDialogue(fish);
            }
        }

        // Update positions and fade out
        const now = Date.now();
        for (const [fishId, dialogue] of this.activeDialogues.entries()) {
            const fish = fishes.find(f => f.id === fishId);
            if (fish) {
                dialogue.x = fish.x;
                dialogue.y = fish.y - 50; // Above the fish
                
                // Fade out in last second
                const timeRemaining = this.DIALOGUE_DURATION - (now - dialogue.timestamp);
                if (timeRemaining < 1000) {
                    dialogue.alpha = timeRemaining / 1000;
                }
            }
        }
    }

    // Draw all active dialogues
    drawDialogues() {
        this.ctx.save();
        
        for (const [fishId, dialogue] of this.activeDialogues.entries()) {
            this.drawDialogueBubble(dialogue);
        }
        
        this.ctx.restore();
    }

    // Draw a single dialogue bubble
    drawDialogueBubble(dialogue) {
        const ctx = this.ctx;
        const text = dialogue.text;
        const x = dialogue.x;
        const y = dialogue.y;
        const alpha = dialogue.alpha;

        // Set font for measuring - 必须与绘制时使用的字体一致
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        
        // Calculate bubble dimensions
        const padding = 14;
        const bubbleWidth = Math.min(textWidth + padding * 2, 300);
        const bubbleHeight = 30;
        const bubbleX = x - bubbleWidth / 2;
        const bubbleY = y - bubbleHeight - 10;

        // Wrap text if needed
        const maxWidth = bubbleWidth - padding * 2;
        const lines = this.wrapText(text, maxWidth);
        const lineHeight = 20;
        const totalHeight = lines.length * lineHeight + padding * 2;

        ctx.globalAlpha = alpha;

        // Draw bubble shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.roundRect(
            bubbleX + 2,
            bubbleY + 2 - (totalHeight - bubbleHeight),
            bubbleWidth,
            totalHeight,
            15
        );
        ctx.fill();

        // Draw bubble background
        const gradient = ctx.createLinearGradient(
            bubbleX,
            bubbleY - (totalHeight - bubbleHeight),
            bubbleX,
            bubbleY - (totalHeight - bubbleHeight) + totalHeight
        );
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        this.roundRect(
            bubbleX,
            bubbleY - (totalHeight - bubbleHeight),
            bubbleWidth,
            totalHeight,
            15
        );
        ctx.fill();

        // Draw bubble border with cartoon style
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 内部高光（卡通光泽效果）
        const highlightGradient = ctx.createLinearGradient(
            bubbleX,
            bubbleY - (totalHeight - bubbleHeight),
            bubbleX,
            bubbleY - (totalHeight - bubbleHeight) + totalHeight * 0.4
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        this.roundRect(
            bubbleX + 4,
            bubbleY - (totalHeight - bubbleHeight) + 4,
            bubbleWidth - 8,
            totalHeight * 0.3,
            12
        );
        ctx.fill();

        // Draw pointer
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 8, y - 15);
        ctx.lineTo(x + 8, y - 15);
        ctx.closePath();
        ctx.fill();

        // Draw text with cartoon style - 卡通描边效果
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        lines.forEach((line, i) => {
            const x = bubbleX + padding;
            const y = bubbleY - (totalHeight - bubbleHeight) + padding + (i * lineHeight);
            
            // 白色描边（让文字更清晰）
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3.5;
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;
            ctx.strokeText(line, x, y);
            
            // 文字填充
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(line, x, y);
        });

        ctx.globalAlpha = 1.0;
    }

    // Helper: Wrap text to fit width - 支持中英文混合
    wrapText(text, maxWidth) {
        this.ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        
        const lines = [];
        let currentLine = '';
        
        // 先尝试按空格分词（英文）
        const hasManySpaces = (text.match(/ /g) || []).length > text.length * 0.1;
        
        if (hasManySpaces) {
            // 主要是英文文本，按单词换行
            const words = text.split(' ');
            for (const word of words) {
                const testLine = currentLine + (currentLine ? ' ' : '') + word;
                const metrics = this.ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
        } else {
            // 主要是中文或混合文本，按字符换行
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const testLine = currentLine + char;
                const metrics = this.ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = char;
                } else {
                    currentLine = testLine;
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }

    // Helper: Draw rounded rectangle
    roundRect(x, y, width, height, radius) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Clear all dialogues
    clearAll() {
        this.activeDialogues.clear();
        this.dialogueCooldowns.clear();
    }
}

// Export for use in tank.js
if (typeof window !== 'undefined') {
    window.SimpleFishDialogueManager = SimpleFishDialogueManager;
}

