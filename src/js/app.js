// Drawing logic
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true }); // 性能优化：频繁读取画布
ctx.lineWidth = 6; // Make lines thicker for better visibility
let drawing = false;
let canvasRect = null; // Cache canvas rect to prevent layout thrashing

// ===== 画布提示文字控制 =====
const canvasHint = document.getElementById('canvas-hint');

// 检查画布是否为空
function isCanvasEmpty() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // 检查是否所有像素都是透明的
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] !== 0) {
            return false; // 发现非透明像素
        }
    }
    return true;
}

// 更新提示文字显示状态
function updateCanvasHint() {
    if (!canvasHint) return;
    
    if (isCanvasEmpty()) {
        canvasHint.classList.remove('hidden');
    } else {
        canvasHint.classList.add('hidden');
    }
}

// 初始化时显示提示
if (canvasHint) {
    updateCanvasHint();
}

// ===== 绘画粒子效果 =====
let particles = [];

function createDrawingParticle(x, y) {
    const particlesContainer = document.getElementById('drawing-particles');
    if (!particlesContainer) return;
    
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.position = 'absolute';
    
    // 紫色系粒子
    const colors = ['#6366F1', '#A5B4FC', '#C7D2FE'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const size = Math.random() * 6 + 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = color;
    particle.style.borderRadius = '50%';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
    particle.style.setProperty('--ty', -(Math.random() * 100 + 50) + 'px');
    particle.style.animation = 'explode 0.8s ease-out forwards';
    
    particlesContainer.appendChild(particle);
    
    // 移除粒子
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 800);
}

// ===== 庆祝纸屑效果（紫色系）=====
function createConfetti(x, y, count = 30) {
    const particlesContainer = document.getElementById('drawing-particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'particle';
        confetti.style.position = 'absolute';
        
        // 紫色系纸屑
        const colors = ['#6366F1', '#A5B4FC', '#C7D2FE', '#EEF2FF'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const size = Math.random() * 8 + 4;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.background = color;
        confetti.style.borderRadius = '50%';
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        
        // 随机方向
        const angle = (Math.PI * 2 * i) / count;
        const velocity = Math.random() * 150 + 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity - 100; // 向上偏移
        
        confetti.style.setProperty('--tx', tx + 'px');
        confetti.style.setProperty('--ty', ty + 'px');
        confetti.style.animation = 'confetti 1.2s ease-out forwards';
        
        particlesContainer.appendChild(confetti);
        
        // 移除纸屑
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 1200);
    }
}

// ===== 背景气泡效果 =====
function createBackgroundBubbles() {
    const container = document.querySelector('.background-bubbles');
    if (!container) return;
    
    const bubbleCount = 15;
    
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // 随机大小
        const size = Math.random() * 40 + 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // 随机水平位置
        bubble.style.left = Math.random() * 100 + '%';
        
        // 随机动画延迟
        bubble.style.animationDelay = Math.random() * 5 + 's';
        
        // 随机动画持续时间
        bubble.style.animationDuration = (Math.random() * 3 + 4) + 's';
        
        container.appendChild(bubble);
    }
}

// Function removed - footer should always be visible

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    canvasRect = canvas.getBoundingClientRect(); // Cache rect once at start
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    // 开始绘画时隐藏提示
    updateCanvasHint();
});
canvas.addEventListener('mousemove', (e) => {
    if (drawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        
        // 添加绘画粒子效果（降低频率以提升性能）
        // offsetX/Y 已经是相对于canvas元素的坐标，可以直接用于粒子
        if (Math.random() > 0.7) {
            createDrawingParticle(e.offsetX, e.offsetY);
        }
    }
});
canvas.addEventListener('mouseup', () => {
    drawing = false;
    canvasRect = null; // Clear cache
    checkFishAfterStroke();
    // 绘画结束后更新提示状态
    updateCanvasHint();
});
canvas.addEventListener('mouseleave', () => {
    drawing = false;
    canvasRect = null; // Clear cache
});

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    canvasRect = canvas.getBoundingClientRect(); // Cache rect once at start
    const touch = e.touches[0];
    
    // 计算缩放比例（Canvas内部尺寸 vs 显示尺寸）
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    
    // 转换触摸坐标到Canvas坐标系
    const canvasX = (touch.clientX - canvasRect.left) * scaleX;
    const canvasY = (touch.clientY - canvasRect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(canvasX, canvasY);
    // 开始绘画时隐藏提示
    updateCanvasHint();
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (drawing && canvasRect) {
        const touch = e.touches[0];
        
        // 计算触摸点相对于Canvas元素的位置（显示坐标）
        const displayX = touch.clientX - canvasRect.left;
        const displayY = touch.clientY - canvasRect.top;
        
        // 计算缩放比例
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        
        // 转换到Canvas内部坐标系用于绘图
        const canvasX = displayX * scaleX;
        const canvasY = displayY * scaleY;
        
        ctx.lineTo(canvasX, canvasY);
        ctx.stroke();
        
        // 添加绘画粒子效果（降低频率以提升性能）
        // 粒子使用显示坐标（相对于canvas元素）
        if (Math.random() > 0.7) {
            createDrawingParticle(displayX, displayY);
        }
    }
});
canvas.addEventListener('touchend', () => {
    drawing = false;
    canvasRect = null; // Clear cache
    checkFishAfterStroke();
    // 绘画结束后更新提示状态
    updateCanvasHint();
});
canvas.addEventListener('touchcancel', () => {
    drawing = false;
    canvasRect = null; // Clear cache
});

// Ctrl + Z to undo
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
    }
});

// Swim logic (submission only)
const swimBtn = document.getElementById('swim-btn');

// Modal helpers
function showModal(html, onClose) {
    let modal = document.createElement('div');
    modal.className = 'modal'; // Add class for easy selection
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0, 0, 0, 0.7)';
    modal.style.backdropFilter = 'blur(8px)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '9999';
    modal.style.animation = 'fadeIn 0.3s ease';
    
    // 检查HTML中是否包含标题横幅
    const hasTitleBanner = html.includes('modal-title-banner') || html.includes("class='modal-title-banner'") || html.includes('class="modal-title-banner"');
    
    // 3D游戏风格的弹窗容器 - 使用新的浅黄色背景
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    if (hasTitleBanner) {
        modalContent.classList.add('has-title-banner');
    }
    // 对于有标题横幅的弹窗，使用更大的最小宽度以确保标题完整显示
    // 在移动端使用响应式宽度，避免超出屏幕
    const isMobile = window.innerWidth <= 768;
    const minWidth = hasTitleBanner 
        ? (isMobile ? '0' : '500px') 
        : (isMobile ? '0' : '400px');
    const maxWidth = isMobile ? 'calc(100vw - 40px)' : '90vw';
    modalContent.style.cssText = `
        min-width: ${minWidth};
        max-width: ${maxWidth};
        width: ${isMobile ? 'calc(100vw - 40px)' : 'auto'};
        max-height: 90vh;
        overflow-y: auto;
        font-family: 'Arial', 'Microsoft YaHei', '微软雅黑', sans-serif;
        font-size: 14px;
        box-sizing: border-box;
    `;
    
    // 如果HTML中已经包含完整的弹窗结构（包括标题横幅和内容区域），直接使用
    if (hasTitleBanner) {
        modalContent.innerHTML = html;
    } else {
        // 内容区域
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'padding: 32px; position: relative; z-index: 1;';
        contentDiv.innerHTML = html;
        modalContent.appendChild(contentDiv);
        
        // 顶部光泽效果
        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 50%;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
            border-radius: 32px 32px 0 0;
            pointer-events: none;
            z-index: 1;
        `;
        modalContent.appendChild(shine);
    }
    
    modal.appendChild(modalContent);
    
    // 绑定关闭按钮事件
    setTimeout(() => {
        const closeBtn = modalContent.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                close();
            });
        }
    }, 0);
    
    function close() {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
            if (onClose) onClose();
        }, 300);
    }
    modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
    });
    document.body.appendChild(modal);
    return { close, modal };
}

// 通用用户提示弹窗（符合项目风格）
function showUserAlert(options) {
    const {
        type = 'info', // 'error', 'warning', 'info', 'success'
        title = '',
        message = '',
        details = null, // 额外的详细信息对象
        buttons = [{ text: '确定', action: 'close' }],
        onClose = null
    } = options;
    
    // 根据类型设置颜色和图标
    const typeConfig = {
        error: {
            icon: '❌',
            color: '#FF3B30',
            bgGradient: 'linear-gradient(180deg, #FFE5E5 0%, #FFCCCC 100%)',
            borderColor: '#FF3B30',
            titleColor: '#FF3B30'
        },
        warning: {
            icon: '⚠️',
            color: '#FF9500',
            bgGradient: 'linear-gradient(180deg, #FFF4E5 0%, #FFE5CC 100%)',
            borderColor: '#FF9500',
            titleColor: '#FF9500'
        },
        info: {
            icon: 'ℹ️',
            color: '#4A90E2',
            bgGradient: 'linear-gradient(180deg, #E5F0FF 0%, #CCE0FF 100%)',
            borderColor: '#4A90E2',
            titleColor: '#4A90E2'
        },
        success: {
            icon: '✅',
            color: '#4CD964',
            bgGradient: 'linear-gradient(180deg, #E5FFE5 0%, #CCFFCC 100%)',
            borderColor: '#4CD964',
            titleColor: '#4CD964'
        }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    // 检查是否是会员限制弹窗（采用 Fish Group Chat 风格）
    const isMembershipLimit = details && details.tier && details.currentCount !== undefined;
    
    const overlay = document.createElement('div');
    overlay.className = 'user-alert-modal';
    overlay.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background: ${isMembershipLimit ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.6)'};
        backdrop-filter: ${isMembershipLimit ? 'blur(8px)' : 'blur(5px)'};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    if (title || isMembershipLimit) {
        modalContent.classList.add('has-title-banner');
    }
    // 在移动端使用响应式宽度，避免超出屏幕
    const isMobile = window.innerWidth <= 768;
    
    // 如果是会员限制弹窗，使用 Fish Group Chat 风格
    if (isMembershipLimit) {
        modalContent.style.cssText = `
            background: linear-gradient(180deg, #FFF9E6 0%, #FFF4D6 100%);
            border-radius: 32px;
            padding: 0;
            width: ${isMobile ? 'calc(100vw - 40px)' : '480px'};
            max-width: ${isMobile ? 'calc(100vw - 40px)' : '90vw'};
            max-height: 90vh;
            overflow-y: auto;
            font-family: 'Arial', 'Microsoft YaHei', '微软雅黑', sans-serif;
            position: relative;
            animation: modalBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-sizing: border-box;
            box-shadow: 
                0 8px 0 rgba(0, 0, 0, 0.2),
                0 16px 40px rgba(0, 0, 0, 0.4);
            border: 3px solid #A5B4FC;
            text-align: center;
            overflow: hidden;
        `;
    } else {
        modalContent.style.cssText = `
            min-width: ${isMobile ? '0' : '400px'};
            max-width: ${isMobile ? 'calc(100vw - 40px)' : '500px'};
            width: ${isMobile ? 'calc(100vw - 40px)' : '90vw'};
            max-height: 90vh;
            overflow-y: auto;
            font-family: 'Arial', 'Microsoft YaHei', '微软雅黑', sans-serif;
            position: relative;
            animation: modalBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            box-sizing: border-box;
        `;
    }
    
    // 如果是会员限制弹窗，添加导航栏
    if (isMembershipLimit) {
        const navBar = document.createElement('nav');
        navBar.className = 'game-nav';
        navBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(180deg, #1A1A1D 0%, #0F0F0F 50%, #050505 100%);
            padding: 12px 20px;
            border-bottom: 2px solid #000000;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 2px 0 rgba(255, 255, 255, 0.1);
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;
        navBar.innerHTML = `
            <a href="index.html" style="
                color: #FFFFFF;
                text-decoration: none;
                font-size: 18px;
                font-weight: 700;
                cursor: pointer;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.2);
                letter-spacing: 1px;
                transition: opacity 0.2s;
            " onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                FishTalk.app <span style="color: #FFD700;">hotguy</span>
            </a>
        `;
        modalContent.appendChild(navBar);
    }
    
    // 如果有标题，添加标题横幅
    if (title || isMembershipLimit) {
        const titleBanner = document.createElement('div');
        titleBanner.className = 'modal-title-banner';
        if (isMembershipLimit) {
            titleBanner.style.cssText = `
                margin-top: 52px;
                background: linear-gradient(180deg, #1A1A1D 0%, #0F0F0F 50%, #050505 100%);
                padding: 16px 24px;
                border-bottom: 2px solid #000000;
                position: relative;
                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 2px 0 rgba(255, 255, 255, 0.1);
            `;
            titleBanner.innerHTML = `<h2 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 900; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.2); letter-spacing: 1px;">🐟 Fish Limit Reached</h2>`;
        } else {
            titleBanner.innerHTML = `<h2>${config.icon} ${title}</h2>`;
        }
        modalContent.appendChild(titleBanner);
    }
    
    // 创建内容区域
    const contentArea = document.createElement('div');
    if (title || isMembershipLimit) {
        contentArea.className = 'modal-content-area';
        if (isMembershipLimit) {
            contentArea.style.cssText = 'padding: 40px; padding-top: 32px; position: relative; z-index: 1;';
        }
    } else {
        contentArea.style.cssText = 'padding: 32px; position: relative; z-index: 1;';
    }
    
    // 构建内容HTML（先构建HTML，再添加关闭按钮）
    let contentHTML = '';
    
    if (isMembershipLimit) {
        // Fish Group Chat 风格的内容
        contentHTML = `
            <div style="position: relative; z-index: 1;">
                <!-- 图标 -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 24px;
                    padding: 20px 0;
                ">
                    <div style="
                        font-size: 72px;
                        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        animation: float 2s ease-in-out infinite;
                    ">🐟</div>
                    <div style="
                        background: linear-gradient(180deg, #D4A574 0%, #C8965A 50%, #B8854A 100%);
                        border: 3px solid #8B6F3D;
                        border-radius: 12px;
                        padding: 16px 20px;
                        box-shadow: 
                            0 4px 0 rgba(0, 0, 0, 0.2),
                            inset 0 2px 4px rgba(255, 255, 255, 0.3);
                        position: relative;
                    ">
                        <div style="
                            color: #5D4037;
                            font-size: 14px;
                            font-weight: 700;
                            margin-bottom: 4px;
                            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                        ">Upgrade Required</div>
                        <div style="
                            color: #3E2723;
                            font-size: 18px;
                            font-weight: 900;
                            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                        ">Create More Fish</div>
                    </div>
                </div>
                
                <!-- 描述 -->
                <p style="
                    color: #666;
                    margin: 0 0 32px 0;
                    font-size: 16px;
                    line-height: 1.6;
                    padding: 0 10px;
                ">${message}</p>
                
                <!-- 当前状态卡片 -->
                <div style="
                    background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    border: 2px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 
                        inset 0 2px 4px rgba(0, 0, 0, 0.1),
                        0 2px 8px rgba(0, 0, 0, 0.1);
                    position: relative;
                ">
                    <div style="font-size: 14px; color: #666; margin-bottom: 16px; text-align: left;">
                        <strong>当前状态：</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="color: #666; font-size: 16px; font-weight: 600;">会员等级</span>
                        <span style="color: #4A90E2; font-size: 18px; font-weight: 900; text-shadow: 0 1px 2px rgba(74, 144, 226, 0.3); text-transform: capitalize;">${details.tier}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="color: #666; font-size: 16px; font-weight: 600;">当前鱼数量</span>
                        <span style="color: #4A90E2; font-size: 18px; font-weight: 900; text-shadow: 0 1px 2px rgba(74, 144, 226, 0.3);">${details.currentCount} 条</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #666; font-size: 16px; font-weight: 600;">上限</span>
                        <span style="color: #4A90E2; font-size: 18px; font-weight: 900; text-shadow: 0 1px 2px rgba(74, 144, 226, 0.3);">${details.limit || 1} 条</span>
                    </div>
                </div>
                
                <!-- 按钮区域 -->
                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        `;
        
        buttons.forEach((btn, index) => {
            const isPrimary = index === 0;
            const btnClass = isPrimary ? 'game-btn game-btn-blue' : 'game-btn game-btn-orange';
            const btnStyle = isPrimary ? `
                background: linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%);
                border-bottom: 3px solid #2A5F8F;
                color: white;
            ` : `
                background: linear-gradient(180deg, #FF9500 0%, #FF8800 50%, #E67700 100%);
                border-bottom: 3px solid #CC6600;
                color: white;
            `;
            
            contentHTML += `
                <button id="alert-btn-${index}" 
                        class="${btnClass}"
                        style="
                            width: 100%;
                            padding: 16px 28px;
                            border: none;
                            border-radius: 24px;
                            font-size: 18px;
                            font-weight: 700;
                            cursor: pointer;
                            position: relative;
                            overflow: hidden;
                            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                            box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                            transition: all 0.15s ease;
                            transform: translateY(0);
                            ${btnStyle}
                        ">
                    <span style="position: relative; z-index: 1;">${btn.text}</span>
                </button>
            `;
        });
        
        contentHTML += `
                </div>
            </div>
        `;
    } else {
        // 原有风格的内容
        contentHTML = `
            <div style="position: relative; z-index: 1;">
                <p style="font-size: 16px; margin: 0 0 20px 0; text-align: center; color: #333; line-height: 1.6;">
                    ${message}
                </p>
        `;
        
        // 如果有详细信息，显示详细信息
        if (details) {
            if (details.tier && details.currentCount !== undefined) {
                // 会员限制信息
                contentHTML += `
                    <div style="background: rgba(255, 255, 255, 0.6); padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 2px solid ${config.borderColor}40;">
                        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                            <strong>当前状态：</strong>
                        </div>
                        <div style="font-size: 14px; color: #333;">
                            • 会员等级: <strong>${details.tier}</strong><br>
                            • 当前鱼数量: <strong>${details.currentCount}</strong> 条<br>
                            • 上限: <strong>${details.limit || 1}</strong> 条
                        </div>
                    </div>
                `;
            }
        }
        
        // 按钮区域
        contentHTML += `
                <div style="display: flex; gap: 12px; justify-content: center; margin-top: 24px; flex-wrap: wrap; flex-direction: column;">
        `;
        
        buttons.forEach((btn, index) => {
            const isPrimary = index === 0;
            const btnStyle = isPrimary ? `
                background: linear-gradient(180deg, ${config.color} 0%, ${config.color}dd 50%, ${config.color}bb 100%);
                color: white;
                font-weight: 900;
                box-shadow: 0 4px 0 ${config.color}80, 0 6px 20px ${config.color}40;
            ` : `
                background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                color: ${config.color};
                font-weight: 700;
                box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
            `;
            
            contentHTML += `
                <button id="alert-btn-${index}" 
                        style="padding: 12px 32px; font-size: 16px; border: none; border-radius: 16px; cursor: pointer;
                               ${btnStyle}
                               transition: all 0.15s; position: relative; overflow: hidden; min-width: 100px;">
                    ${btn.text}
                </button>
            `;
        });
        
        contentHTML += `
                </div>
            </div>
        `;
    }
    
    // 设置内容HTML
    contentArea.innerHTML = contentHTML;
    
    modalContent.appendChild(contentArea);
    
    // 添加关闭按钮（添加到modalContent，确保在右上角）
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    if (isMembershipLimit) {
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(180deg, #4CD964 0%, #3CB54A 50%, #2E8B3A 100%);
            border: none;
            border-bottom: 3px solid #1F6B2A;
            color: white;
            font-size: 20px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.3);
            transition: all 0.15s ease;
            z-index: 10;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `;
    } else {
        // 非会员限制弹窗的关闭按钮也放在右上角
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(180deg, #4CD964 0%, #3CB54A 50%, #2E8B3A 100%);
            border: none;
            border-bottom: 3px solid #1F6B2A;
            color: white;
            font-size: 20px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.3);
            transition: all 0.15s ease;
            z-index: 10;
            line-height: 1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        `;
    }
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close';
    modalContent.appendChild(closeBtn);
    
    // 添加顶部光泽效果
    const gloss = document.createElement('div');
    gloss.style.cssText = `
        position: absolute;
        top: ${isMembershipLimit ? '52px' : '0'};
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
        border-radius: ${isMembershipLimit ? '0' : '32px 32px 0 0'};
        pointer-events: none;
        z-index: 1;
    `;
    modalContent.appendChild(gloss);
    
    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);
    
    // 添加按钮光泽效果和事件
    buttons.forEach((btn, index) => {
        const button = overlay.querySelector(`#alert-btn-${index}`);
        if (!button) return;
        
        const isPrimary = index === 0;
        
        if (isMembershipLimit) {
            // Fish Group Chat 风格的按钮交互效果
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                if (isPrimary) {
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                } else {
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                }
            });
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
            });
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(2px)';
                this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
            });
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
            });
        } else {
            // 原有风格的按钮交互效果
            if (isPrimary) {
                const shine = document.createElement('div');
                shine.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 50%;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
                    border-radius: 16px 16px 0 0;
                    pointer-events: none;
                `;
                button.appendChild(shine);
            }
            
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                if (isPrimary) {
                    this.style.boxShadow = `0 6px 0 ${config.color}80, 0 8px 25px ${config.color}50`;
                } else {
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.15)';
                }
            });
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                if (isPrimary) {
                    this.style.boxShadow = `0 4px 0 ${config.color}80, 0 6px 20px ${config.color}40`;
                } else {
                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.15)';
                }
            });
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(2px)';
                if (isPrimary) {
                    this.style.boxShadow = `0 2px 0 ${config.color}80, 0 4px 15px ${config.color}40`;
                } else {
                    this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.15)';
                }
            });
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px)';
                if (isPrimary) {
                    this.style.boxShadow = `0 6px 0 ${config.color}80, 0 8px 25px ${config.color}50`;
                } else {
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.15)';
                }
            });
        }
        
        // 按钮点击事件
        button.addEventListener('click', () => {
            if (btn.action === 'close') {
                close();
            } else if (typeof btn.action === 'function') {
                btn.action();
                if (btn.closeAfterAction !== false) {
                    close();
                }
            } else if (btn.action === 'link' && btn.link) {
                window.location.href = btn.link;
            }
        });
    });
    
    function close() {
        overlay.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
            if (onClose) onClose();
        }, 300);
    }
    
    // 添加关闭按钮事件
    const closeButton = overlay.querySelector('.modal-close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', close);
    }
    
    // 点击外部关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            close();
        }
    });
    
    return { close, overlay };
}

// Enhanced success modal with social sharing (Fish Group Chat style)
function showSuccessModal(fishImageUrl, needsModeration) {
    const config = window.SOCIAL_CONFIG;
    
    const modalHTML = `
        <div class="modal-title-banner">
            <h2>🎉 ${needsModeration ? 'Fish Submitted!' : 'Your Fish is Swimming!'}</h2>
        </div>
        <button class="modal-close-btn" aria-label="Close">&times;</button>
        <div class="modal-content-area" style="text-align: center; padding: 40px; padding-top: 32px;">
            <!-- Icon and Card -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                margin-bottom: 24px;
                padding: 20px 0;
            ">
                <div style="
                    font-size: 72px;
                    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    animation: float 2s ease-in-out infinite;
                ">🐟</div>
                <div style="
                    background: linear-gradient(180deg, #D4A574 0%, #C8965A 50%, #B8854A 100%);
                    border: 3px solid #8B6F3D;
                    border-radius: 12px;
                    padding: 16px 20px;
                    box-shadow: 
                        0 4px 0 rgba(0, 0, 0, 0.2),
                        inset 0 2px 4px rgba(255, 255, 255, 0.3);
                    position: relative;
                ">
                    <div style="
                        color: #5D4037;
                        font-size: 14px;
                        font-weight: 700;
                        margin-bottom: 4px;
                        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                    ">Success!</div>
                    <div style="
                        color: #3E2723;
                        font-size: 18px;
                        font-weight: 900;
                        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                    ">Fish Created</div>
                </div>
            </div>
            
            <!-- Fish Image -->
            <div style="text-align: center; margin-bottom: 24px;">
                <img src="${fishImageUrl}" alt="Your fish" style="
                    max-width: 200px;
                    border-radius: 16px;
                    border: 3px solid #4A90E2;
                    box-shadow: 
                        0 4px 0 rgba(0, 0, 0, 0.2),
                        0 8px 20px rgba(74, 144, 226, 0.3);
                ">
            </div>
            
            <!-- Description -->
            <p style="
                color: #666;
                margin: 0 0 32px 0;
                font-size: 16px;
                line-height: 1.6;
                padding: 0 10px;
            ">
                ${needsModeration 
                    ? '🐠 Your fish will appear in the tank after review.' 
                    : '💙 Love creating with AI? Join our community!'}
            </p>
            
            <!-- Social Links -->
            <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap;">
                <a href="${config.twitter.url}" target="_blank" rel="noopener noreferrer" 
                   class="game-btn" style="
                       display: flex;
                       align-items: center;
                       gap: 8px;
                       padding: 12px 20px;
                       background: linear-gradient(180deg, #000000 0%, #1a1a1a 50%, #000000 100%);
                       border-bottom: 3px solid #000000;
                       color: white;
                       text-decoration: none;
                       border-radius: 16px;
                       font-weight: 700;
                       font-size: 14px;
                       box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                       transition: all 0.15s ease;
                       transform: translateY(0);
                   "
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 0 rgba(0, 0, 0, 0.25)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 0 rgba(0, 0, 0, 0.25)';"
                   onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='0 2px 0 rgba(0, 0, 0, 0.25)';"
                   onmouseup="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 0 rgba(0, 0, 0, 0.25)';">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Follow on X
                </a>
                <a href="${config.discord.inviteUrl}" target="_blank" rel="noopener noreferrer"
                   class="game-btn" style="
                       display: flex;
                       align-items: center;
                       gap: 8px;
                       padding: 12px 20px;
                       background: linear-gradient(180deg, #5865F2 0%, #4752C4 50%, #3C45A5 100%);
                       border-bottom: 3px solid #2F3136;
                       color: white;
                       text-decoration: none;
                       border-radius: 16px;
                       font-weight: 700;
                       font-size: 14px;
                       box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                       transition: all 0.15s ease;
                       transform: translateY(0);
                   "
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 0 rgba(0, 0, 0, 0.25)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 0 rgba(0, 0, 0, 0.25)';"
                   onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='0 2px 0 rgba(0, 0, 0, 0.25)';"
                   onmouseup="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 0 rgba(0, 0, 0, 0.25)';">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Join Discord
                </a>
            </div>
            
            <!-- Share Section -->
            <div style="text-align: center; margin: 24px 0 16px 0; font-weight: 600; font-size: 16px; color: #333;">
                📢 Share your creation:
            </div>
            
            <div id="share-buttons-container" style="margin-bottom: 24px;"></div>
            
            <!-- Let's Swim Button -->
            <div style="text-align: center; margin-top: 24px;">
                <button id="lets-swim-btn" onclick="window.location.href='tank.html'" 
                        class="game-btn game-btn-blue" style="
                            width: 100%;
                            padding: 16px 28px;
                            border: none;
                            border-radius: 24px;
                            background: linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%);
                            border-bottom: 3px solid #2A5F8F;
                            color: white;
                            font-size: 18px;
                            font-weight: 700;
                            cursor: pointer;
                            position: relative;
                            overflow: hidden;
                            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                            box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                            transition: all 0.15s ease;
                            transform: translateY(0);
                        ">
                    <span style="position: relative; z-index: 1;">🌊 Let's Swim! 🐟</span>
                </button>
            </div>
        </div>
    `;
    
    const modal = showModal(modalHTML, () => { });
    
    // Add button interactions
    setTimeout(() => {
        const letsSwimBtn = document.getElementById('lets-swim-btn');
        if (letsSwimBtn) {
            letsSwimBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
            });
            letsSwimBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
            });
            letsSwimBtn.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(2px)';
                this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
            });
            letsSwimBtn.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
            });
        }
        
        // Add share buttons using the social share module
        const shareContainer = modal.modal.querySelector('#share-buttons-container');
        if (shareContainer && window.socialShare) {
            const shareMenu = window.socialShare.createShareMenu('success-modal-share');
            shareContainer.appendChild(shareMenu);
        }
    }, 100);
}

// --- Fish submission modal handler ---
async function submitFish(artist, needsModeration = false, fishName = null, personality = null, userInfo = null) {
    function dataURLtoBlob(dataurl) {
        const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
        return new Blob([u8arr], { type: mime });
    }
    const fishImgData = canvas.toDataURL('image/png');
    const imageBlob = dataURLtoBlob(fishImgData);
    
    // 创建FormData用于图片上传（只包含image字段）
    const formData = new FormData();
    formData.append('image', imageBlob, 'fish.png');
    // Retro loading indicator
    let submitBtn = document.getElementById('submit-fish');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class='spinner' style='display:inline-block;width:18px;height:18px;border:3px solid #3498db;border-top:3px solid #fff;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;'></span>`;
    }
    // Add spinner CSS
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
        document.head.appendChild(style);
    }
    try {
        console.log('📤 submitFish开始执行');
        console.log('  艺术家:', artist);
        console.log('  需要审核:', needsModeration);
        console.log('  BACKEND_URL:', window.BACKEND_URL);
        
        // 获取Supabase认证token
        let authToken = null;
        if (window.supabaseAuth) {
            authToken = await window.supabaseAuth.getAccessToken();
            console.log('  认证Token:', authToken ? '已获取' : '未获取');
        }
        
        // 开发阶段：获取当前用户（可选）
        const currentUser = await getCurrentUser();
        console.log('  当前用户:', currentUser);
        // if (!currentUser) {
        //     alert('Please log in to submit your fish.');
        //     if (submitBtn) {
        //         submitBtn.disabled = false;
        //         submitBtn.textContent = 'Submit';
        //     }
        //     return;
        // }
        
        // 第一步：上传图片
        console.log('📷 开始上传图片到:', `${window.BACKEND_URL}/api/fish-api?action=upload`);
        
        // 添加60秒超时控制（Render免费计划可能较慢）
        const uploadController = new AbortController();
        const uploadTimeoutId = setTimeout(() => uploadController.abort(), 60000);
        
        let uploadResult; // 声明在外部，确保后续代码可以访问
        try {
            const uploadResp = await fetch(`${window.BACKEND_URL}/api/fish-api?action=upload`, {
                method: 'POST',
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
                body: formData,
                signal: uploadController.signal
            });
            clearTimeout(uploadTimeoutId);
            
            console.log('  上传响应状态:', uploadResp.status);
            if (!uploadResp.ok) {
                const errorText = await uploadResp.text();
                console.error('  上传失败:', errorText);
                throw new Error('图片上传失败: ' + uploadResp.status);
            }
            
            uploadResult = await uploadResp.json(); // 赋值而不是声明
            console.log('  上传结果:', uploadResult);
            
            if (!uploadResult.success || !uploadResult.imageUrl) {
                throw new Error('获取图片URL失败');
            }
        } catch (uploadError) {
            clearTimeout(uploadTimeoutId);
            if (uploadError.name === 'AbortError') {
                throw new Error('图片上传超时，请检查网络连接后重试');
            }
            throw uploadError;
        }
        
        // 第二步：提交鱼数据
        // Assign random personality if none selected
        const finalPersonality = personality || ['cheerful', 'shy', 'brave', 'lazy'][Math.floor(Math.random() * 4)];
        
        const submitData = {
            userId: currentUser?.id || 'anonymous-dev',
            imageUrl: uploadResult.imageUrl,
            artist: artist || 'Anonymous',
            fishName: fishName || 'Unnamed Fish',
            personality: finalPersonality,
            userInfo: userInfo || ''  // 用户信息，供AI聊天使用
        };
        console.log('🐟 开始提交鱼数据:', submitData);
        
        // 添加60秒超时控制（Render免费计划可能较慢）
        const submitController = new AbortController();
        const submitTimeoutId = setTimeout(() => submitController.abort(), 60000);
        
        let submitResp;
        try {
            submitResp = await fetch(`${window.BACKEND_URL}/api/fish-api?action=submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                },
                body: JSON.stringify(submitData),
                signal: submitController.signal
            });
            clearTimeout(submitTimeoutId);
        } catch (submitError) {
            clearTimeout(submitTimeoutId);
            if (submitError.name === 'AbortError') {
                throw new Error('提交超时，请检查网络连接后重试');
            }
            throw submitError;
        }
        
        console.log('  提交响应状态:', submitResp.status);
        
        // 检查响应状态，非200时先尝试解析错误信息
        let submitResult;
        if (!submitResp.ok) {
            try {
                const errorText = await submitResp.text();
                console.log('  错误响应内容:', errorText);
                // 尝试解析JSON错误信息
                try {
                    submitResult = JSON.parse(errorText);
                } catch (parseError) {
                    // 如果解析失败，构造错误对象并抛出，让catch块处理
                    console.error('  无法解析错误响应:', parseError);
                    throw new Error(`图片上传失败: ${submitResp.status}`);
                }
            } catch (error) {
                // 如果读取响应失败，抛出错误
                console.error('  读取错误响应失败:', error);
                throw new Error(`图片上传失败: ${submitResp.status}`);
            }
        } else {
            submitResult = await submitResp.json();
        }
        console.log('  提交结果:', submitResult);
        
        // Remove spinner and re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
        
        if (submitResult.success && submitResult.fish) {
            console.log('✅ 鱼提交成功！');
            // Save today's date to track fish submission
            const today = new Date().toDateString();
            localStorage.setItem('lastFishDate', today);
            
            // 显示社交分享成功弹窗
            showSuccessModal(uploadResult.imageUrl, needsModeration);
        } else {
            console.error('❌ 提交失败:', submitResult);
            
            // 恢复按钮状态
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit';
            }
            
            // 根据错误类型显示不同的提示
            if (submitResult.error === 'Daily drawing limit reached') {
                // 每日限量错误 - 显示详细信息
                showUserAlert({
                    type: 'warning',
                    title: 'Daily Limit Reached',
                    message: submitResult.message || 'You have reached your daily drawing limit.',
                    buttons: [
                        {
                            text: 'Upgrade',
                            action: () => {
                                window.location.href = 'membership.html';
                            },
                            closeAfterAction: true
                        },
                        {
                            text: 'OK',
                            closeAfterAction: true
                        }
                    ]
                });
            } else if (submitResult.error === 'Membership limit reached') {
                // 会员限制错误 - 显示详细信息
                showUserAlert({
                    type: 'warning',
                    title: '会员限制',
                    message: submitResult.message || '您已达到当前会员等级的鱼数量上限。',
                    details: {
                        tier: submitResult.tier,
                        currentCount: submitResult.currentCount,
                        limit: submitResult.limit
                    },
                    buttons: [
                        {
                            text: '查看设置',
                            action: 'link',
                            link: 'fish-settings.html'
                        },
                        {
                            text: '确定',
                            action: 'close'
                        }
                    ]
                });
            } else {
                // 其他错误
                showUserAlert({
                    type: 'error',
                    title: 'Submission Failed',
                    message: submitResult.message || submitResult.error || 'Submission failed, please try again later.',
                    buttons: [{ text: 'OK', action: 'close' }]
                });
            }
            return; // 不抛出错误，因为已经显示了友好的提示
        }
    } catch (err) {
        console.error('❌ Submit error:', err);
        
        // 恢复按钮状态
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit';
        }
        
        // 显示错误提示
        let errorMessage = err.message || 'Upload failed, please try again later.';
        let errorTitle = 'Upload Failed';
        
        // 处理网络错误
        if (err.message && err.message.includes('Failed to fetch')) {
            errorMessage = 'Network connection failed, please check your network connection and try again.';
        } else if (err.message && err.message.includes('403')) {
            // 403可能是限制错误，尝试显示更友好的提示
            errorTitle = 'Daily Limit Reached';
            errorMessage = 'You have reached today\'s fish drawing limit. Please try again tomorrow or upgrade your membership to increase the limit.';
        } else if (err.message && err.message.includes('401')) {
            errorMessage = 'Unauthorized, please log in again.';
        } else if (err.message && err.message.includes('404')) {
            // 404可能是API路径错误，但更可能是限制错误导致的
            errorTitle = 'Submission Failed';
            errorMessage = 'Submission failed, possibly due to reaching limits or network issues, please try again later.';
        }
        
        showUserAlert({
            type: 'error',
            title: errorTitle,
            message: errorMessage,
            buttons: [{ text: 'OK', action: 'close' }]
        });
    }
}

swimBtn.addEventListener('click', async () => {
    // 检查登录状态
    const isLoggedIn = window.supabaseAuth ? await window.supabaseAuth.isLoggedIn() : false;
    
    if (!isLoggedIn) {
        // 未登录：保存画布数据到sessionStorage
        const canvasData = canvas.toDataURL('image/png');
        sessionStorage.setItem('pendingFishCanvas', canvasData);
        sessionStorage.setItem('pendingFishSubmit', 'true');
        
        // 🔧 修复：设置登录后重定向回当前页面，以便处理画布数据
        // 不设置loginRedirect，让用户登录后回到画鱼页面完成提交流程
        localStorage.removeItem('loginRedirect'); // 确保清除任何现有的重定向
        
        // 显示登录弹窗
        if (window.authUI && window.authUI.showLoginModal) {
            window.authUI.showLoginModal();
        } else {
            showUserAlert({
                type: 'warning',
                title: 'Login Required',
                message: 'Please refresh the page and try again, or check if the login function is loading properly.',
                buttons: [{ text: 'OK', action: 'close' }]
            });
        }
        return; // 中断流程
    }
    
    // 已登录：继续现有的鱼检测和提交流程
    // Check fish validity for warning purposes
    const isFish = await verifyFishDoodle(canvas);
    lastFishCheck = isFish;
    showFishWarning(!isFish);
    
    // Get saved artist name or user profile name or use Anonymous
    const savedArtist = localStorage.getItem('artistName');
    let defaultName = (savedArtist && savedArtist !== 'Anonymous') ? savedArtist : 'Anonymous';
    let defaultUserInfo = localStorage.getItem('userInfo') || '';
    
    // Try to get user profile name and about_me if logged in
    if (window.supabaseAuth) {
        try {
            const user = await window.supabaseAuth.getUser();
            if (user) {
                const backendUrl = window.BACKEND_URL || '';
                const userId = user.id;
                const profileResponse = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userId)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                });
                
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    if (profileData.user) {
                        if (profileData.user.nick_name) {
                            defaultName = profileData.user.nick_name;
                        }
                        // Load about_me as default value for user-info
                        if (profileData.user.about_me) {
                            defaultUserInfo = profileData.user.about_me;
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Could not fetch user profile, using saved/default values:', error);
        }
    }
    
    // Show different modal based on fish validity
    if (!isFish) {
        // Show encouragement modal for low-scoring fish - no submission (Fish Group Chat style)
        const notFishModal = `
            <div class="modal-title-banner">
                <h2>⚠️ Not a Fish Detected</h2>
            </div>
            <button class="modal-close-btn" aria-label="Close">&times;</button>
            <div class="modal-content-area" style="text-align: center; padding: 40px; padding-top: 32px;">
                <!-- Icon and Card -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 24px;
                    padding: 20px 0;
                ">
                    <div style="
                        font-size: 72px;
                        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        animation: float 2s ease-in-out infinite;
                    ">🐟</div>
                    <div style="
                        background: linear-gradient(180deg, #D4A574 0%, #C8965A 50%, #B8854A 100%);
                        border: 3px solid #8B6F3D;
                        border-radius: 12px;
                        padding: 16px 20px;
                        box-shadow: 
                            0 4px 0 rgba(0, 0, 0, 0.2),
                            inset 0 2px 4px rgba(255, 255, 255, 0.3);
                        position: relative;
                    ">
                        <div style="
                            color: #5D4037;
                            font-size: 14px;
                            font-weight: 700;
                            margin-bottom: 4px;
                            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                        ">AI Recognition</div>
                        <div style="
                            color: #3E2723;
                            font-size: 18px;
                            font-weight: 900;
                            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                        ">Try Again</div>
                    </div>
                </div>
                
                <!-- Description -->
                <p style="
                    color: #666;
                    margin: 0 0 32px 0;
                    font-size: 16px;
                    line-height: 1.6;
                    padding: 0 10px;
                ">
                    The AI couldn't recognize fish features. Please try:
                </p>
                
                <!-- Tips Card -->
                <div style="
                    background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%);
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    border: 2px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 
                        inset 0 2px 4px rgba(0, 0, 0, 0.1),
                        0 2px 8px rgba(0, 0, 0, 0.1);
                    position: relative;
                    text-align: left;
                ">
                    <div style="color: #666; font-size: 15px; line-height: 1.8;">
                        • Draw a fish facing <strong>right</strong><br>
                        • Include basic features: <strong>body, tail, fins</strong><br>
                        • Make the lines <strong>clearer</strong>
                    </div>
                </div>
                
                <!-- Buttons -->
                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                    <button id='try-again-fish' class='game-btn game-btn-blue' style="
                        width: 100%;
                        padding: 16px 28px;
                        border: none;
                        border-radius: 24px;
                        background: linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%);
                        border-bottom: 3px solid #2A5F8F;
                        color: white;
                        font-size: 18px;
                        font-weight: 700;
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                        transition: all 0.15s ease;
                        transform: translateY(0);
                    ">
                        <span style="position: relative; z-index: 1;">Draw Again</span>
                    </button>
                    <button id='cancel-fish' class='game-btn game-btn-orange' style="
                        width: 100%;
                        padding: 16px 28px;
                        border: none;
                        border-radius: 24px;
                        background: linear-gradient(180deg, #FFB340 0%, #FF9500 50%, #E67E00 100%);
                        border-bottom: 3px solid #CC6F00;
                        color: white;
                        font-size: 18px;
                        font-weight: 700;
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                        transition: all 0.15s ease;
                        transform: translateY(0);
                    ">
                        <span style="position: relative; z-index: 1;">Cancel</span>
                    </button>
                </div>
            </div>
        `;
        
        showModal(notFishModal, () => { });
        
        // Add button interactions
        setTimeout(() => {
            const tryAgainBtn = document.getElementById('try-again-fish');
            const cancelBtn = document.getElementById('cancel-fish');
            
            if (tryAgainBtn) {
                tryAgainBtn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                });
                tryAgainBtn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                });
                tryAgainBtn.addEventListener('mousedown', function() {
                    this.style.transform = 'translateY(2px)';
                    this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
                });
                tryAgainBtn.addEventListener('mouseup', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                });
                tryAgainBtn.onclick = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    document.querySelector('div[style*="z-index: 9999"]')?.remove();
                };
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                });
                cancelBtn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                });
                cancelBtn.addEventListener('mousedown', function() {
                    this.style.transform = 'translateY(2px)';
                    this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
                });
                cancelBtn.addEventListener('mouseup', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                });
                cancelBtn.onclick = () => {
                    document.querySelector('div[style*="z-index: 9999"]')?.remove();
                };
            }
        }, 100);
        
        return; // 不继续执行提交流程
    } else {
        // Show normal submission modal for good fish with fish name and personality
        showModal(`<div class="modal-title-banner">
            <h2>🐟 Name Your Fish!</h2>
        </div>
        <button class="modal-close-btn" aria-label="Close">&times;</button>
        <div class="modal-content-area">
            <div style='text-align: left; margin: 20px 0;'>
                <label style='display: block; margin-bottom: 8px; font-weight: 700; color: #333; font-size: 15px;'>
                    Fish Name <span style='color: #FF3B30;'>*</span>
                </label>
                <input type='text' id='fish-name' placeholder='e.g., Bubbles, Nemo, Goldie' 
                    style='width: 100%; padding: 14px 16px; border: 3px solid #4A90E2; border-radius: 12px; font-size: 15px; box-sizing: border-box; 
                    background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5);
                    transition: all 0.2s; color: #000000;' 
                    maxlength='30' required />
                <small style='color: #64748b; font-size: 12px; margin-top: 6px; display: block;'>Give your fish a unique name!</small>
            </div>
            
            <div style='text-align: left; margin: 20px 0;'>
                <label style='display: block; margin-bottom: 10px; font-weight: 700; color: #333; font-size: 15px;'>Personality</label>
                <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;'>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #4A90E2; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700; 
                    background: linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%);
                    color: white; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='random'>
                        <input type='radio' name='personality' value='random' checked style='display: none;'>
                        🎲 Random
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='funny'>
                        <input type='radio' name='personality' value='funny' style='display: none;'>
                        😂 Funny
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='cheerful'>
                        <input type='radio' name='personality' value='cheerful' style='display: none;'>
                        😊 Cheerful
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='brave'>
                        <input type='radio' name='personality' value='brave' style='display: none;'>
                        💪 Brave
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='playful'>
                        <input type='radio' name='personality' value='playful' style='display: none;'>
                        🎮 Playful
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='curious'>
                        <input type='radio' name='personality' value='curious' style='display: none;'>
                        🔍 Curious
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='energetic'>
                        <input type='radio' name='personality' value='energetic' style='display: none;'>
                        ⚡ Energetic
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='calm'>
                        <input type='radio' name='personality' value='calm' style='display: none;'>
                        😌 Calm
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='gentle'>
                        <input type='radio' name='personality' value='gentle' style='display: none;'>
                        🌸 Gentle
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='sarcastic'>
                        <input type='radio' name='personality' value='sarcastic' style='display: none;'>
                        😏 Sarcastic
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='dramatic'>
                        <input type='radio' name='personality' value='dramatic' style='display: none;'>
                        🎭 Dramatic
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='naive'>
                        <input type='radio' name='personality' value='naive' style='display: none;'>
                        🦋 Naive
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='shy'>
                        <input type='radio' name='personality' value='shy' style='display: none;'>
                        😳 Shy
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='anxious'>
                        <input type='radio' name='personality' value='anxious' style='display: none;'>
                        😰 Anxious
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='stubborn'>
                        <input type='radio' name='personality' value='stubborn' style='display: none;'>
                        🤨 Stubborn
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='serious'>
                        <input type='radio' name='personality' value='serious' style='display: none;'>
                        😐 Serious
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='lazy'>
                        <input type='radio' name='personality' value='lazy' style='display: none;'>
                        😴 Lazy
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='grumpy'>
                        <input type='radio' name='personality' value='grumpy' style='display: none;'>
                        😠 Grumpy
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='aggressive'>
                        <input type='radio' name='personality' value='aggressive' style='display: none;'>
                        👊 Aggressive
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='cynical'>
                        <input type='radio' name='personality' value='cynical' style='display: none;'>
                        🙄 Cynical
                    </label>
                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                    position: relative; overflow: hidden;' 
                    class='personality-option' data-personality='crude'>
                        <input type='radio' name='personality' value='crude' style='display: none;'>
                        🐻 Crude
                    </label>
                </div>
            </div>
            
            <div style='text-align: left; margin: 20px 0;'>
                <label style='display: block; margin-bottom: 8px; font-weight: 700; color: #333; font-size: 15px;'>Your Name</label>
                <input type='text' id='artist-name' value='${escapeHtml(defaultName)}' 
                    placeholder='Your artist name' 
                    style='width: 100%; padding: 14px 16px; border: 3px solid #e2e8f0; border-radius: 12px; font-size: 15px; box-sizing: border-box;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5);
                    transition: all 0.2s; color: #000000;' />
            </div>
            
            <div style='text-align: left; margin: 20px 0;'>
                <label style='display: block; margin-bottom: 8px; font-weight: 700; color: #333; font-size: 15px;'>
                    About You
                    <span style='color: #4A90E2; font-size: 12px; font-weight: 600; margin-left: 8px;'>💬 Your fish will mention you in chat!</span>
                </label>
                <input type='text' id='user-info' 
                    value='${escapeHtml(defaultUserInfo)}'
                    placeholder='e.g., My owner loves pizza' 
                    style='width: 100%; padding: 14px 16px; border: 3px solid #e2e8f0; border-radius: 12px; font-size: 15px; box-sizing: border-box;
                    background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5);
                    transition: all 0.2s; color: #000000;' 
                    maxlength='50' />
                <small style='color: #64748b; font-size: 12px; margin-top: 6px; display: block;'>Your fish may mention this information in chat to get to know you better!</small>
            </div>
            
            <div style='margin-top: 28px; display: flex; gap: 12px; justify-content: center;'>
                <button id='submit-fish' style='padding: 14px 32px; background: linear-gradient(180deg, #4CD964 0%, #4CD964 50%, #3CB54A 100%);
                border: none; border-bottom: 3px solid #2E8B3A; border-radius: 16px; font-weight: 900; font-size: 16px; color: white;
                cursor: pointer; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                transition: all 0.15s; position: relative; overflow: hidden;'>
                    Submit Fish
                </button>
                <button id='cancel-fish' style='padding: 14px 32px; background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                border: none; border-bottom: 3px solid #A0A0A0; border-radius: 16px; font-weight: 700; font-size: 16px; color: #4A90E2;
                cursor: pointer; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); transition: all 0.15s; position: relative; overflow: hidden;'>
                    Cancel
                </button>
            </div>
        </div>`, () => { });
    }
    
    // Add personality selection highlight effect with 3D style
    setTimeout(() => {
        document.querySelectorAll('.personality-option').forEach(option => {
            // 添加光泽效果
            const shine = document.createElement('div');
            shine.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
                border-radius: 12px 12px 0 0;
                pointer-events: none;
            `;
            option.appendChild(shine);
            
            option.addEventListener('click', function() {
                document.querySelectorAll('.personality-option').forEach(o => {
                    o.style.borderColor = '#e2e8f0';
                    o.style.background = 'linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%)';
                    o.style.color = '#4A90E2';
                    o.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.15)';
                    o.querySelector('input').checked = false;
                });
                this.style.borderColor = '#4A90E2';
                this.style.background = 'linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%)';
                this.style.color = 'white';
                this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                this.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                this.querySelector('input').checked = true;
            });
            
            // 悬停效果
            option.addEventListener('mouseenter', function() {
                if (!this.querySelector('input').checked) {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.15)';
                }
            });
            option.addEventListener('mouseleave', function() {
                if (!this.querySelector('input').checked) {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.15)';
                }
            });
        });
        
        // 输入框聚焦效果
        const inputs = document.querySelectorAll('#fish-name, #artist-name, #user-info');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.style.borderColor = '#4A90E2';
                this.style.boxShadow = '0 4px 0 rgba(74, 144, 226, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.5)';
            });
            input.addEventListener('blur', function() {
                if (this.id === 'fish-name') {
                    this.style.borderColor = '#4A90E2';
                } else {
                    this.style.borderColor = '#e2e8f0';
                }
                this.style.boxShadow = '0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5)';
            });
        });
        
        // 按钮悬停效果
        const submitBtn = document.getElementById('submit-fish');
        const cancelBtn = document.getElementById('cancel-fish');
        
        if (submitBtn) {
            const submitShine = document.createElement('div');
            submitShine.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
                border-radius: 16px 16px 0 0;
                pointer-events: none;
            `;
            submitBtn.appendChild(submitShine);
            
            submitBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
            });
            submitBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
            });
            submitBtn.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(2px)';
                this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
            });
            submitBtn.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
            });
        }
        
        if (cancelBtn) {
            const cancelShine = document.createElement('div');
            cancelShine.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50%;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
                border-radius: 16px 16px 0 0;
                pointer-events: none;
            `;
            cancelBtn.appendChild(cancelShine);
            
            cancelBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
            });
            cancelBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
            });
            cancelBtn.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(2px)';
                this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
            });
            cancelBtn.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
            });
        }
    }, 100);
    
    document.getElementById('submit-fish').onclick = async () => {
        try {
            const fishName = document.getElementById('fish-name').value.trim();
            const artist = document.getElementById('artist-name').value.trim() || 'Anonymous';
            const userInfo = document.getElementById('user-info')?.value.trim() || '';
            const personalityRadio = document.querySelector('input[name="personality"]:checked');
            let personality = personalityRadio ? personalityRadio.value : 'random';
            
            // 如果选择random或未选择，随机分配一个个性
            if (!personality || personality === 'random') {
                const personalities = ['funny', 'cheerful', 'brave', 'playful', 'curious', 'energetic', 'calm', 'gentle'];
                personality = personalities[Math.floor(Math.random() * personalities.length)];
            }
            
            // Validate fish name
            if (!fishName) {
                showUserAlert({
                    type: 'warning',
                    title: '请输入鱼名',
                    message: '请为您的鱼起一个名字！',
                    buttons: [{
                        text: '确定',
                        action: () => {
                            document.getElementById('fish-name')?.focus();
                        },
                        closeAfterAction: true
                    }]
                });
                return;
            }
            
            // Save artist name and user info to localStorage for future use
            localStorage.setItem('artistName', artist);
            if (userInfo) {
                localStorage.setItem('userInfo', userInfo);
            }
            
            // Save user-info to user profile about_me if logged in
            if (userInfo && window.supabaseAuth) {
                try {
                    const user = await window.supabaseAuth.getUser();
                    if (user) {
                        const backendUrl = window.BACKEND_URL || '';
                        const userId = user.id;
                        const token = localStorage.getItem('userToken');
                        if (token) {
                            // 添加超时和错误处理
                            const controller = new AbortController();
                            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
                            
                        try {
                            const response = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userId)}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    about_me: userInfo  // 修复：使用下划线命名，匹配后端API
                                }),
                                signal: controller.signal
                            });
                            clearTimeout(timeoutId);
                            
                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({}));
                                console.log('Profile update failed:', response.status, errorData);
                            } else {
                                console.log('✅ Profile updated successfully');
                            }
                        } catch (fetchError) {
                            clearTimeout(timeoutId);
                            console.log('Could not save user-info to about_me (fetch error):', fetchError);
                        }
                        }
                    }
                } catch (error) {
                    console.log('Could not save user-info to about_me:', error);
                }
            }
            
            console.log('🚀 开始提交鱼');
            console.log('  鱼名:', fishName);
            console.log('  个性:', personality);
            console.log('  艺术家:', artist);
            
            await submitFish(artist, !isFish, fishName, personality, userInfo); // Pass name, personality, and userInfo
            console.log('✅ submitFish 完成');
            
            // 关闭modal
            document.querySelector('.modal')?.remove();
        } catch (error) {
            // 顶层错误处理 - 确保按钮状态恢复
            console.error('❌ Submit fish onclick handler error:', error);
            
            const submitBtn = document.getElementById('submit-fish');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Fish';
            }
            
            // 显示错误提示
            showUserAlert({
                type: 'error',
                title: 'Submission Error',
                message: error.message || 'An unexpected error occurred. Please try again.',
                buttons: [{ text: 'OK', action: 'close' }]
            });
        }
    };
    document.getElementById('cancel-fish').onclick = () => {
        document.querySelector('.modal')?.remove();
    };
});

// Paint options UI - 涂鸦风格配色方案
const colors = [
    '#000000', // 黑色
    '#FFFFFF', // 白色
    '#FF0000', // 大红
    '#FF6600', // 大橙
    '#FFFF00', // 大黄
    '#00FF00', // 大绿
    '#0066FF', // 大蓝
    '#FF1493', // 玫红
    '#8B4513'  // 棕色
];
let currentColor = colors[0];
let currentLineWidth = 6;
let undoStack = [];

function createPaintOptions() {
    let paintBar = document.getElementById('paint-bar');
    if (!paintBar) {
        paintBar = document.createElement('div');
        paintBar.id = 'paint-bar';
        paintBar.style.display = 'flex';
        paintBar.style.flexWrap = 'wrap';
        paintBar.style.gap = '8px';
        paintBar.style.margin = '8px auto';
        paintBar.style.alignItems = 'center';
        paintBar.style.justifyContent = 'center';
        paintBar.style.padding = '6px 10px';
        paintBar.style.maxWidth = '100%';
        paintBar.style.width = '100%';
        paintBar.style.boxSizing = 'border-box';
        paintBar.style.overflowX = 'auto';
        // Insert at the top of draw-ui
        const drawUI = document.getElementById('draw-ui');
        if (drawUI) drawUI.insertBefore(paintBar, drawUI.firstChild);
    } else {
        paintBar.innerHTML = '';
    }
    
    // Create a container for colors to make them wrap better on mobile
    const colorContainer = document.createElement('div');
    colorContainer.style.display = 'flex';
    colorContainer.style.flexWrap = 'nowrap';
    colorContainer.style.gap = '4px';
    colorContainer.style.alignItems = 'center';
    colorContainer.style.overflow = 'hidden';
    colorContainer.style.width = '100%';
    colorContainer.style.flexBasis = '100%';
    colorContainer.style.minWidth = '0';
    colorContainer.style.maxWidth = '100%';
    colorContainer.style.boxSizing = 'border-box';
    
    // Color buttons
    colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'cute-color-button';
        btn.style.background = color;
        btn.title = color;
        btn.onclick = () => {
            // 移除其他按钮的active类
            document.querySelectorAll('.cute-color-button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            ctx.globalCompositeOperation = 'source-over';
            currentColor = color;
            ctx.strokeStyle = color;
        };
        colorContainer.appendChild(btn); 
    });
    
    // 默认选中第一个颜色
    if (colorContainer.firstChild) {
        colorContainer.firstChild.classList.add('active');
    }
    paintBar.appendChild(colorContainer);

    // Create a controls container for better mobile layout
    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexWrap = 'wrap';
    controlsContainer.style.gap = '8px';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.justifyContent = 'center';
    controlsContainer.style.marginTop = '8px';

    // Line width container - moved to the front
    const widthContainer = document.createElement('div');
    widthContainer.style.display = 'flex';
    widthContainer.style.alignItems = 'center';
    widthContainer.style.gap = '4px';
    // On mobile (narrow screens), make it take full width to be on its own line
    // On desktop, it will naturally fit in the same line with other buttons
    if (window.innerWidth <= 768) {
        widthContainer.style.flexBasis = '100%';
        widthContainer.style.justifyContent = 'center';
    }
    
    const widthLabel = document.createElement('span');
    widthLabel.textContent = 'Size:';
    widthLabel.style.fontSize = '16px';
    widthContainer.appendChild(widthLabel);
    
    const widthSlider = document.createElement('input');
    widthSlider.type = 'range';
    widthSlider.min = 1;
    widthSlider.max = 20;
    widthSlider.value = currentLineWidth;
    widthSlider.style.width = '80px';
    widthSlider.oninput = () => {
        currentLineWidth = widthSlider.value;
    };
    widthContainer.appendChild(widthSlider);
    controlsContainer.appendChild(widthContainer);

    // Eraser
    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = 'Eraser';
    eraserBtn.style.padding = '6px 12px';
    eraserBtn.style.height = '32px';
    eraserBtn.style.fontSize = '16px';
    eraserBtn.style.borderRadius = '4px';
    eraserBtn.style.cursor = 'pointer';
    eraserBtn.onclick = () => {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = currentLineWidth;
    };
    controlsContainer.appendChild(eraserBtn);
    
    paintBar.appendChild(controlsContainer);
}
createPaintOptions();

function pushUndo() {
    // Save current canvas state as image data
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    // Limit stack size
    if (undoStack.length > 30) undoStack.shift();
}

function undo() {
    if (undoStack.length > 0) {
        const imgData = undoStack.pop();
        ctx.putImageData(imgData, 0, 0);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Recalculate fish probability after undo
    checkFishAfterStroke();
    // 更新提示状态
    updateCanvasHint();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    checkFishAfterStroke();
    // 更新提示状态
    updateCanvasHint();
}

function flipCanvas() {
    // Save current state to undo stack before flipping
    pushUndo();
    
    // Get current canvas content
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Create a temporary canvas to perform the flip
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Put the current image data on the temp canvas
    tempCtx.putImageData(imageData, 0, 0);
    
    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the context state
    ctx.save();
    
    // Flip horizontally by scaling x by -1 and translating
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    // Draw the flipped image
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Restore the context state
    ctx.restore();
    
    // Recompute fish score after flipping
    checkFishAfterStroke();
}

function createUndoButton() {
    let paintBar = document.getElementById('paint-bar');
    if (paintBar) {
        // Find the controls container
        let controlsContainer = paintBar.querySelector('div:last-child');
        if (controlsContainer) {
            const undoBtn = document.createElement('button');
            undoBtn.textContent = 'Undo';
            undoBtn.style.padding = '6px 12px';
            undoBtn.style.height = '32px';
            undoBtn.style.fontSize = '16px';
            undoBtn.style.borderRadius = '4px';
            undoBtn.style.cursor = 'pointer';
            undoBtn.onclick = undo;
            controlsContainer.appendChild(undoBtn);
        }
    }
}

function createClearButton() {
    let paintBar = document.getElementById('paint-bar');
    if (paintBar) {
        // Find the controls container
        let controlsContainer = paintBar.querySelector('div:last-child');
        if (controlsContainer) {
            const clearBtn = document.createElement('button');
            clearBtn.textContent = 'Clear';
            clearBtn.style.padding = '6px 12px';
            clearBtn.style.height = '32px';
            clearBtn.style.fontSize = '16px';
            clearBtn.style.borderRadius = '4px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.onclick = clearCanvas;
            controlsContainer.appendChild(clearBtn);
        }
    }
}

function createFlipButton() {
    let paintBar = document.getElementById('paint-bar');
    if (paintBar) {
        // Find the controls container
        let controlsContainer = paintBar.querySelector('div:last-child');
        if (controlsContainer) {
            const flipBtn = document.createElement('button');
            flipBtn.textContent = 'Flip';
            flipBtn.style.padding = '6px 12px';
            flipBtn.style.height = '32px';
            flipBtn.style.fontSize = '16px';
            flipBtn.style.borderRadius = '4px';
            flipBtn.style.cursor = 'pointer';
            flipBtn.onclick = flipCanvas;
            controlsContainer.appendChild(flipBtn);
        }
    }
}

// Push to undo stack before every new stroke
canvas.addEventListener('mousedown', pushUndo);
canvas.addEventListener('touchstart', pushUndo);

// Add undo button to paint bar
createUndoButton();

// Add clear button to paint bar
createClearButton();

// Add flip button to paint bar
createFlipButton();

// Update drawing color and line width
canvas.addEventListener('mousedown', () => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
});
canvas.addEventListener('touchstart', () => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
});

// Helper to crop whitespace (transparent or white) from a canvas
function cropCanvasToContent(srcCanvas) {
    const ctx = srcCanvas.getContext('2d');
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let found = false;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];
            const a = imgData.data[i + 3];
            // Consider non-transparent and not white as content
            if (a > 16 && !(r > 240 && g > 240 && b > 240)) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                found = true;
            }
        }
    }
    if (!found) return srcCanvas; // No content found
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropped = document.createElement('canvas');
    cropped.width = cropW;
    cropped.height = cropH;
    cropped.getContext('2d').drawImage(srcCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropped;
}

// Helper to crop, scale, and center a fish image into a display canvas
function makeDisplayFishCanvas(img, width = 80, height = 48) {
    // 使用高分辨率渲染（2倍）以提高清晰度
    const devicePixelRatio = window.devicePixelRatio || 2;
    const scaleFactor = Math.max(2, devicePixelRatio); // 至少2倍，确保清晰度
    
    const displayCanvas = document.createElement('canvas');
    // 设置实际显示尺寸
    displayCanvas.width = width;
    displayCanvas.height = height;
    
    // 创建高分辨率canvas用于渲染
    const highResCanvas = document.createElement('canvas');
    highResCanvas.width = width * scaleFactor;
    highResCanvas.height = height * scaleFactor;
    const highResCtx = highResCanvas.getContext('2d');
    
    // Enable high-quality image smoothing
    highResCtx.imageSmoothingEnabled = true;
    highResCtx.imageSmoothingQuality = 'high';
    
    // 在临时canvas上绘制原图
    const temp = document.createElement('canvas');
    temp.width = img.width;
    temp.height = img.height;
    const tempCtx = temp.getContext('2d');
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(img, 0, 0);
    
    // 裁剪到内容区域
    const cropped = cropCanvasToContent(temp);
    
    // 在高分辨率canvas上绘制
    highResCtx.clearRect(0, 0, highResCanvas.width, highResCanvas.height);
    const scale = Math.min(
        (width * scaleFactor) / cropped.width, 
        (height * scaleFactor) / cropped.height
    );
    const drawW = cropped.width * scale;
    const drawH = cropped.height * scale;
    const dx = (highResCanvas.width - drawW) / 2;
    const dy = (highResCanvas.height - drawH) / 2;
    
    // 在高分辨率canvas上绘制
    highResCtx.drawImage(
        cropped, 
        0, 0, cropped.width, cropped.height, 
        dx, dy, drawW, drawH
    );
    
    // 将高分辨率canvas缩放回显示尺寸（使用高质量缩放）
    const displayCtx = displayCanvas.getContext('2d');
    displayCtx.imageSmoothingEnabled = true;
    displayCtx.imageSmoothingQuality = 'high';
    displayCtx.clearRect(0, 0, width, height);
    displayCtx.drawImage(highResCanvas, 0, 0, width, height);
    
    return displayCanvas;
}

// ONNX fish doodle classifier integration
let ortSession = null;
let lastFishCheck = true;
let isModelLoading = false;
let modelLoadPromise = null;

// Cache API 配置
const ONNX_CACHE_NAME = 'onnx-model-cache-v1';
const MODEL_URL = 'fish_doodle_classifier.onnx';

// 初始化 Cache API
async function initModelCache() {
    if ('caches' in window) {
        try {
            return await caches.open(ONNX_CACHE_NAME);
        } catch (error) {
            console.warn('Failed to open cache:', error);
            return null;
        }
    }
    return null;
}

// 从缓存加载模型，如果不存在则下载并缓存
async function loadModelWithCache() {
    const cache = await initModelCache();
    
    if (cache) {
        // 检查缓存中是否有模型
        const cachedResponse = await cache.match(MODEL_URL);
        if (cachedResponse) {
            console.log('📦 Loading ONNX model from cache...');
            try {
                // 从缓存获取 ArrayBuffer
                const arrayBuffer = await cachedResponse.arrayBuffer();
                // ONNX Runtime 支持从 ArrayBuffer 加载
                const session = await window.ort.InferenceSession.create(arrayBuffer);
                console.log('✅ ONNX model loaded from cache');
                return session;
            } catch (error) {
                // 如果从缓存加载失败，尝试重新下载
                console.warn('Failed to load from cache, will re-download:', error);
                // 删除损坏的缓存
                await cache.delete(MODEL_URL);
            }
        }
        
        // 缓存中没有或加载失败，从网络下载
        console.log('⬇️ Downloading ONNX model (will be cached)...');
        try {
            const response = await fetch(MODEL_URL);
            if (response.ok) {
                // 将响应克隆并存入缓存
                await cache.put(MODEL_URL, response.clone());
                // 从响应获取 ArrayBuffer
                const arrayBuffer = await response.arrayBuffer();
                const session = await window.ort.InferenceSession.create(arrayBuffer);
                console.log('✅ ONNX model downloaded and cached');
                return session;
            } else {
                throw new Error(`Failed to fetch model: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to download model:', error);
            throw error;
        }
    } else {
        // 不支持 Cache API，直接加载（浏览器会自动使用 HTTP 缓存）
        console.log('⚠️ Cache API not available, loading model directly...');
        return await window.ort.InferenceSession.create(MODEL_URL);
    }
}

// Load ONNX model (make sure fish_doodle_classifier.onnx is in your public folder)
async function loadFishModel() {
    // If already loaded, return immediately
    if (ortSession) {
        return ortSession;
    }
    
    // If already loading, return the existing promise
    if (isModelLoading && modelLoadPromise) {
        return modelLoadPromise;
    }
    
    // Start loading
    isModelLoading = true;
    console.log('Loading fish model...');
    
    // 显示进度条
    const progressContainer = document.getElementById('onnx-loading-progress');
    const progressBar = document.getElementById('onnx-progress-bar');
    const progressText = document.getElementById('onnx-progress-text');
    
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }
    
    // 模拟进度更新（因为 ONNX 加载没有实际的进度事件）
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 15; // 随机增加进度，让进度条更自然
            if (progress > 90) progress = 90;
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
            if (progressText) {
                progressText.textContent = Math.round(progress) + '%';
            }
        }
    }, 200);
    
    modelLoadPromise = (async () => {
        try {
            ortSession = await loadModelWithCache();
            console.log('✅ ONNX model loaded successfully');
            
            // 完成进度条
            clearInterval(progressInterval);
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            if (progressText) {
                progressText.textContent = '100%';
            }
            
            // 延迟隐藏进度条，让用户看到完成状态
            setTimeout(() => {
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
            }, 500);
            
            return ortSession;
        } catch (error) {
            console.error('Failed to load fish model:', error);
            
            // 清除进度更新
            clearInterval(progressInterval);
            
            // 隐藏进度条
            if (progressContainer) {
                progressContainer.style.display = 'none';
            }
            
            throw error;
        } finally {
            isModelLoading = false;
        }
    })();
    
    return modelLoadPromise;
}

// Updated preprocessing to match new grayscale model (3-channel) with ImageNet normalization
function preprocessCanvasForONNX(canvas) {
    const SIZE = 224; // Standard ImageNet input size
    
    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = SIZE;
    tempCanvas.height = SIZE;
    
    // Fill with white background (matching WhiteBgLoader in Python)
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, SIZE, SIZE);
    
    // Draw the original canvas onto the temp canvas (resized)
    tempCtx.drawImage(canvas, 0, 0, SIZE, SIZE);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, SIZE, SIZE);
    const data = imageData.data;
    
    // Create input tensor array [1, 3, 224, 224] - CHW format
    const input = new Float32Array(1 * 3 * SIZE * SIZE);
    
    // ImageNet normalization values (same as in Python code)
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    
    // Convert RGBA to RGB and normalize
    for (let i = 0; i < SIZE * SIZE; i++) {
        const pixelIndex = i * 4; // RGBA format
        
        // Extract RGB values (0-255)
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        // Convert to [0, 1] range
        const rNorm = r / 255.0;
        const gNorm = g / 255.0;
        const bNorm = b / 255.0;
        
        // Apply ImageNet normalization: (pixel - mean) / std
        const rStandardized = (rNorm - mean[0]) / std[0];
        const gStandardized = (gNorm - mean[1]) / std[1];
        const bStandardized = (bNorm - mean[2]) / std[2];
        
        // Store in CHW format (Channel-Height-Width)
        // R channel: indices 0 to SIZE*SIZE-1
        // G channel: indices SIZE*SIZE to 2*SIZE*SIZE-1  
        // B channel: indices 2*SIZE*SIZE to 3*SIZE*SIZE-1
        input[i] = rStandardized;                    // R channel
        input[i + SIZE * SIZE] = gStandardized;      // G channel
        input[i + 2 * SIZE * SIZE] = bStandardized;  // B channel
    }
    
    return new window.ort.Tensor('float32', input, [1, 3, SIZE, SIZE]);
}

// Updated verifyFishDoodle function to match new model output format
async function verifyFishDoodle(canvas) {
    // Model should already be loaded, but check just in case
    if (!ortSession) {
        throw new Error('Fish model not loaded');
    }
    
    // Use updated preprocessing
    const inputTensor = preprocessCanvasForONNX(canvas);
    
    // Run inference
    let feeds = {};
    if (ortSession && ortSession.inputNames && ortSession.inputNames.length > 0) {
        feeds[ortSession.inputNames[0]] = inputTensor;
    } else {
        feeds['input'] = inputTensor;
    }
    const results = await ortSession.run(feeds);
    const outputKey = Object.keys(results)[0];
    const output = results[outputKey].data;
    
    // The model outputs a single logit value
    // During training: labels = 1 - labels, so fish = 0, not_fish = 1
    // Model output > 0.5 means "not_fish", < 0.5 means "fish"
    const logit = output[0];
    const prob = 1 / (1 + Math.exp(-logit));  // Sigmoid activation
    
    // Since the model was trained with inverted labels (fish=0, not_fish=1)
    // A low probability means it's more likely to be a fish
    const fishProbability = 1 - prob;
    const isFish = fishProbability >= 0.60;  // Threshold for fish classification
        
    // Update UI with fish probability
    // Display the probability (element is pre-created in HTML to prevent layout shifts)
    const probDiv = document.getElementById('fish-probability');
    if (probDiv) {
        // 更新HTML内容，保持结构
        probDiv.innerHTML = `
            <span>🐠</span>
            <span>Fish probability: <strong>${(fishProbability * 100).toFixed(1)}%</strong></span>
        `;
        // 设置样式类和显示
        probDiv.className = `game-probability ${isFish ? 'high' : 'low'}`;
        probDiv.style.display = 'inline-flex';
        probDiv.style.opacity = '1';
    }
    
    return isFish;
}

// Show/hide fish warning and update background color
function showFishWarning(show) {
    // 注释掉背景色变化，因为用户不希望显示这个效果
    // const drawUI = document.getElementById('draw-ui');
    // if (drawUI) {
    //     drawUI.style.background = show ? '#ffeaea' : '#eaffea'; // red for invalid, green for valid
    //     drawUI.style.transition = 'background 0.3s';
    // }
}

// After each stroke, check if it's a fish
async function checkFishAfterStroke() {
    if (!window.ort) {
        console.warn('ONNX Runtime not available, skipping fish detection');
        return; // ONNX runtime not loaded
    }
    
    // Wait for model to be loaded if it's not ready yet
    if (!ortSession) {
        try {
            console.log('Model not loaded yet, attempting to load...');
            await loadFishModel();
        } catch (error) {
            console.error('Model not available for fish checking:', error);
            // Show a one-time warning to the user
            if (!window.modelLoadErrorShown) {
                window.modelLoadErrorShown = true;
                console.error('AI fish detection is currently unavailable. Your drawing can still be submitted.');
            }
            return;
        }
    }
    
    try {
        const isFish = await verifyFishDoodle(canvas);
        lastFishCheck = isFish;
        showFishWarning(!isFish);
    } catch (error) {
        console.error('Error during fish verification:', error);
    }
}

// Initialize ONNX Runtime and load model when page loads
(function ensureONNXRuntime() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForONNXAndInitialize);
    } else {
        waitForONNXAndInitialize();
    }
    
    async function waitForONNXAndInitialize() {
        // 等待ONNX Runtime加载（最多等待10秒）
        let retries = 0;
        const maxRetries = 200; // 10秒 (200 * 50ms)
        
        while (!window.ort && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 50));
            retries++;
        }
        
        if (!window.ort) {
            console.error('⚠️ ONNX Runtime not loaded after 10 seconds!');
            console.error('💡 Possible solutions:');
            console.error('   1. Check your internet connection');
            console.error('   2. Disable browser tracking prevention (Edge/Safari)');
            console.error('   3. Check browser console for CDN errors');
            console.error('   4. Try refreshing the page');
            return;
        }
        
        console.log('✅ ONNX Runtime available, starting model load...');
        loadFishModel().catch(error => {
            console.error('Failed to load fish model on startup:', error);
            console.error('Model path: fish_doodle_classifier.onnx');
            console.error('Please ensure the model file exists in the project root directory.');
        });
    }
})();

// Check if user already drew a fish today when page loads
// Function to show welcome back message for returning users
function showWelcomeBackMessage() {
    const userId = localStorage.getItem('userId');
    const artistName = localStorage.getItem('artistName');
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    const welcomeElement = document.getElementById('welcome-back-message');
    
    // Only show for users who have interacted before but haven't created an account
    if (userId && artistName && artistName !== 'Anonymous' && !userToken) {
        welcomeElement.innerHTML = `
            Welcome back, <strong>${escapeHtml(artistName)}</strong>! 
            <a href="login.html" style="color: #0066cc; text-decoration: underline;">Create an account</a> 
            to build custom tanks and share with friends.
        `;
        welcomeElement.style.display = 'block';
    } else if (userToken && userData) {
        // For authenticated users, show a simple welcome with their display name
        try {
            const user = JSON.parse(userData);
            const displayName = user.displayName || 'Artist';
            welcomeElement.innerHTML = `Welcome back, <strong>${escapeHtml(displayName)}</strong>! 🎨`;
            welcomeElement.style.background = '#e8f5e8';
            welcomeElement.style.borderColor = '#b3d9b3';
            welcomeElement.style.display = 'block';
        } catch (e) {
            // If userData is malformed, don't show anything
            console.warn('Malformed userData in localStorage');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // All startup checks disabled for better UX
    
    // 🔧 修复：检查是否有待恢复的画布数据（备用机制）
    setTimeout(() => {
        checkAndRestorePendingCanvas();
    }, 1000); // 延迟1秒，确保所有初始化完成
});

// 🔧 修复：备用画布恢复机制
async function checkAndRestorePendingCanvas() {
    const pendingSubmit = sessionStorage.getItem('pendingFishSubmit');
    const canvasData = sessionStorage.getItem('pendingFishCanvas');
    
    if (pendingSubmit === 'true' && canvasData) {
        console.log('🔍 Found pending canvas data, checking if user is logged in...');
        
        // 检查用户是否已登录
        const isLoggedIn = window.supabaseAuth ? await window.supabaseAuth.isLoggedIn() : false;
        
        if (isLoggedIn) {
            console.log('✅ User is logged in, restoring canvas...');
            
            // 确保画布已初始化
            if (canvas && ctx && canvas.width > 0 && canvas.height > 0) {
                const img = new Image();
                img.onload = () => {
                    console.log('🎨 Restoring canvas from backup mechanism...');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    updateCanvasHint();
                    saveToUndoStack();
                    console.log('✅ Canvas restored via backup mechanism');
                    
                    // 清除存储的数据
                    sessionStorage.removeItem('pendingFishCanvas');
                    sessionStorage.removeItem('pendingFishSubmit');
                    
                    // 显示提示，让用户知道画布已恢复
                    showUserAlert({
                        type: 'info',
                        title: 'Drawing Restored',
                        message: 'Your drawing has been restored. You can now submit it!',
                        buttons: [{ text: 'OK', action: 'close' }]
                    });
                };
                img.onerror = () => {
                    console.error('❌ Backup canvas restore failed');
                    sessionStorage.removeItem('pendingFishCanvas');
                    sessionStorage.removeItem('pendingFishSubmit');
                };
                img.src = canvasData;
            }
        }
    }
}

// 监听登录状态变化，处理画布恢复
// 等待 Supabase 初始化完成后再监听
async function setupAuthListener() {
    // 等待 supabaseAuth 可用
    while (!window.supabaseAuth) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    window.supabaseAuth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event, 'Session:', !!session);
        
        // 登录成功且有待提交的画布
        if (event === 'SIGNED_IN' && sessionStorage.getItem('pendingFishSubmit') === 'true') {
            const canvasData = sessionStorage.getItem('pendingFishCanvas');
            console.log('🎨 Found pending fish canvas data:', !!canvasData);
            
            if (canvasData) {
                // 🔧 修复：确保画布元素已经初始化
                const waitForCanvas = () => {
                    return new Promise((resolve) => {
                        const checkCanvas = () => {
                            if (canvas && ctx && canvas.width > 0 && canvas.height > 0) {
                                console.log('✅ Canvas ready for restoration');
                                resolve();
                            } else {
                                console.log('⏳ Waiting for canvas to be ready...');
                                setTimeout(checkCanvas, 100);
                            }
                        };
                        checkCanvas();
                    });
                };
                
                await waitForCanvas();
                
                // 恢复画布
                const img = new Image();
                img.onload = async () => {
                    console.log('🎨 Restoring canvas from saved data...');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    console.log('✅ Canvas restored successfully');
                    
                    // 🔧 修复：更新画布提示状态
                    updateCanvasHint();
                    
                    // 🔧 修复：保存到撤销栈，以便用户可以撤销
                    saveToUndoStack();
                    
                    // 清除存储的数据
                    sessionStorage.removeItem('pendingFishCanvas');
                    sessionStorage.removeItem('pendingFishSubmit');
                    
                    // 关闭登录modal
                    if (window.authUI && window.authUI.hideLoginModal) {
                        window.authUI.hideLoginModal();
                    }
                    
                    // 自动继续提交流程
                    const isFish = await verifyFishDoodle(canvas);
                    lastFishCheck = isFish;
                    showFishWarning(!isFish);
                    
                    // 获取保存的艺术家名称或用户资料名称
                    const savedArtist = localStorage.getItem('artistName');
                    let defaultName = (savedArtist && savedArtist !== 'Anonymous') ? savedArtist : 'Anonymous';
                    let defaultUserInfo = localStorage.getItem('userInfo') || '';
                    
                    // Try to get user profile name and about_me if logged in
                    if (window.supabaseAuth) {
                        try {
                            const user = await window.supabaseAuth.getUser();
                            if (user) {
                                const backendUrl = window.BACKEND_URL || '';
                                const userId = user.id;
                                const profileResponse = await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userId)}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                                    }
                                });
                                
                                if (profileResponse.ok) {
                                    const profileData = await profileResponse.json();
                                    if (profileData.user) {
                                        if (profileData.user.nick_name) {
                                            defaultName = profileData.user.nick_name;
                                        }
                                        // Load about_me as default value for user-info
                                        if (profileData.user.about_me) {
                                            defaultUserInfo = profileData.user.about_me;
                                        }
                                    }
                                }
                            }
                        } catch (error) {
                            console.log('Could not fetch user profile, using saved/default values:', error);
                        }
                    }
                    
                    // 显示命名modal
                    if (!isFish) {
                        // 显示警告modal（低分鱼）- Fish Group Chat style
                        const notFishModal = `
                            <div class="modal-title-banner">
                                <h2>⚠️ Not a Fish Detected</h2>
                            </div>
                            <button class="modal-close-btn" aria-label="Close">&times;</button>
                            <div class="modal-content-area" style="text-align: center; padding: 40px; padding-top: 32px;">
                                <!-- Icon and Card -->
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 20px;
                                    margin-bottom: 24px;
                                    padding: 20px 0;
                                ">
                                    <div style="
                                        font-size: 72px;
                                        text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                                        animation: float 2s ease-in-out infinite;
                                    ">🐟</div>
                                    <div style="
                                        background: linear-gradient(180deg, #D4A574 0%, #C8965A 50%, #B8854A 100%);
                                        border: 3px solid #8B6F3D;
                                        border-radius: 12px;
                                        padding: 16px 20px;
                                        box-shadow: 
                                            0 4px 0 rgba(0, 0, 0, 0.2),
                                            inset 0 2px 4px rgba(255, 255, 255, 0.3);
                                        position: relative;
                                    ">
                                        <div style="
                                            color: #5D4037;
                                            font-size: 14px;
                                            font-weight: 700;
                                            margin-bottom: 4px;
                                            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                                        ">AI Recognition</div>
                                        <div style="
                                            color: #3E2723;
                                            font-size: 18px;
                                            font-weight: 900;
                                            text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
                                        ">Try Again</div>
                                    </div>
                                </div>
                                
                                <!-- Description -->
                                <p style="
                                    color: #666;
                                    margin: 0 0 32px 0;
                                    font-size: 16px;
                                    line-height: 1.6;
                                    padding: 0 10px;
                                ">
                                    The AI couldn't recognize fish features. Please try:
                                </p>
                                
                                <!-- Tips Card -->
                                <div style="
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%);
                                    border-radius: 16px;
                                    padding: 24px;
                                    margin-bottom: 24px;
                                    border: 2px solid rgba(255, 255, 255, 0.8);
                                    box-shadow: 
                                        inset 0 2px 4px rgba(0, 0, 0, 0.1),
                                        0 2px 8px rgba(0, 0, 0, 0.1);
                                    position: relative;
                                    text-align: left;
                                ">
                                    <div style="color: #666; font-size: 15px; line-height: 1.8;">
                                        • Draw a fish facing <strong>right</strong><br>
                                        • Include basic features: <strong>body, tail, fins</strong><br>
                                        • Make the lines <strong>clearer</strong>
                                    </div>
                                </div>
                                
                                <!-- Buttons -->
                                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                                    <button id='try-again-fish' class='game-btn game-btn-blue' style="
                                        width: 100%;
                                        padding: 16px 28px;
                                        border: none;
                                        border-radius: 24px;
                                        background: linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%);
                                        border-bottom: 3px solid #2A5F8F;
                                        color: white;
                                        font-size: 18px;
                                        font-weight: 700;
                                        cursor: pointer;
                                        position: relative;
                                        overflow: hidden;
                                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                                        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                                        transition: all 0.15s ease;
                                        transform: translateY(0);
                                    ">
                                        <span style="position: relative; z-index: 1;">Draw Again</span>
                                    </button>
                                    <button id='cancel-fish' class='game-btn game-btn-orange' style="
                                        width: 100%;
                                        padding: 16px 28px;
                                        border: none;
                                        border-radius: 24px;
                                        background: linear-gradient(180deg, #FFB340 0%, #FF9500 50%, #E67E00 100%);
                                        border-bottom: 3px solid #CC6F00;
                                        color: white;
                                        font-size: 18px;
                                        font-weight: 700;
                                        cursor: pointer;
                                        position: relative;
                                        overflow: hidden;
                                        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                                        box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
                                        transition: all 0.15s ease;
                                        transform: translateY(0);
                                    ">
                                        <span style="position: relative; z-index: 1;">Cancel</span>
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        showModal(notFishModal, () => { });
                        
                        // Add button interactions
                        setTimeout(() => {
                            const tryAgainBtn = document.getElementById('try-again-fish');
                            const cancelBtn = document.getElementById('cancel-fish');
                            
                            if (tryAgainBtn) {
                                tryAgainBtn.addEventListener('mouseenter', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                                tryAgainBtn.addEventListener('mouseleave', function() {
                                    this.style.transform = 'translateY(0)';
                                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                                });
                                tryAgainBtn.addEventListener('mousedown', function() {
                                    this.style.transform = 'translateY(2px)';
                                    this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
                                });
                                tryAgainBtn.addEventListener('mouseup', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                                tryAgainBtn.onclick = () => {
                                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                                    document.querySelector('div[style*="z-index: 9999"]')?.remove();
                                };
                            }
                            
                            if (cancelBtn) {
                                cancelBtn.addEventListener('mouseenter', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                                cancelBtn.addEventListener('mouseleave', function() {
                                    this.style.transform = 'translateY(0)';
                                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                                });
                                cancelBtn.addEventListener('mousedown', function() {
                                    this.style.transform = 'translateY(2px)';
                                    this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
                                });
                                cancelBtn.addEventListener('mouseup', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                                cancelBtn.onclick = () => {
                                    document.querySelector('div[style*="z-index: 9999"]')?.remove();
                                };
                            }
                        }, 100);
                    } else {
                        // 显示命名modal（好鱼）
                        showModal(`<div class="modal-title-banner">
                            <h2>🐟 Name Your Fish!</h2>
                        </div>
                        <button class="modal-close-btn" aria-label="Close">&times;</button>
                        <div class="modal-content-area">
                            <div style='text-align: left; margin: 20px 0;'>
                                <label style='display: block; margin-bottom: 8px; font-weight: 700; color: #333; font-size: 15px;'>
                                    Fish Name <span style='color: #FF3B30;'>*</span>
                                </label>
                                <input type='text' id='fish-name' placeholder='e.g., Bubbles, Nemo, Goldie' 
                                    style='width: 100%; padding: 14px 16px; border: 3px solid #4A90E2; border-radius: 12px; font-size: 15px; box-sizing: border-box; 
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
                                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5);
                                    transition: all 0.2s; color: #000000;' 
                                    maxlength='30' required />
                                <small style='color: #64748b; font-size: 12px; margin-top: 6px; display: block;'>Give your fish a unique name!</small>
                            </div>
                            
                            <div style='text-align: left; margin: 20px 0;'>
                                <label style='display: block; margin-bottom: 10px; font-weight: 700; color: #333; font-size: 15px;'>Personality</label>
                                <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;'>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #4A90E2; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700; 
                                    background: linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%);
                                    color: white; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.2);
                                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='random'>
                                        <input type='radio' name='personality' value='random' checked style='display: none;'>
                                        🎲 Random
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='funny'>
                                        <input type='radio' name='personality' value='funny' style='display: none;'>
                                        😂 Funny
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='cheerful'>
                                        <input type='radio' name='personality' value='cheerful' style='display: none;'>
                                        😊 Cheerful
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='brave'>
                                        <input type='radio' name='personality' value='brave' style='display: none;'>
                                        💪 Brave
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='playful'>
                                        <input type='radio' name='personality' value='playful' style='display: none;'>
                                        🎮 Playful
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='curious'>
                                        <input type='radio' name='personality' value='curious' style='display: none;'>
                                        🔍 Curious
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='energetic'>
                                        <input type='radio' name='personality' value='energetic' style='display: none;'>
                                        ⚡ Energetic
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='calm'>
                                        <input type='radio' name='personality' value='calm' style='display: none;'>
                                        😌 Calm
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='gentle'>
                                        <input type='radio' name='personality' value='gentle' style='display: none;'>
                                        🌸 Gentle
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='sarcastic'>
                                        <input type='radio' name='personality' value='sarcastic' style='display: none;'>
                                        😏 Sarcastic
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='dramatic'>
                                        <input type='radio' name='personality' value='dramatic' style='display: none;'>
                                        🎭 Dramatic
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='naive'>
                                        <input type='radio' name='personality' value='naive' style='display: none;'>
                                        🦋 Naive
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='shy'>
                                        <input type='radio' name='personality' value='shy' style='display: none;'>
                                        😳 Shy
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='anxious'>
                                        <input type='radio' name='personality' value='anxious' style='display: none;'>
                                        😰 Anxious
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='stubborn'>
                                        <input type='radio' name='personality' value='stubborn' style='display: none;'>
                                        🤨 Stubborn
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='serious'>
                                        <input type='radio' name='personality' value='serious' style='display: none;'>
                                        😐 Serious
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='lazy'>
                                        <input type='radio' name='personality' value='lazy' style='display: none;'>
                                        😴 Lazy
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='grumpy'>
                                        <input type='radio' name='personality' value='grumpy' style='display: none;'>
                                        😠 Grumpy
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='aggressive'>
                                        <input type='radio' name='personality' value='aggressive' style='display: none;'>
                                        👊 Aggressive
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='cynical'>
                                        <input type='radio' name='personality' value='cynical' style='display: none;'>
                                        🙄 Cynical
                                    </label>
                                    <label style='cursor: pointer; padding: 10px 8px; border: 3px solid #e2e8f0; border-radius: 12px; text-align: center; 
                                    transition: all 0.15s; font-size: 13px; font-weight: 700;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                    color: #4A90E2; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.15);
                                    position: relative; overflow: hidden;' 
                                    class='personality-option' data-personality='crude'>
                                        <input type='radio' name='personality' value='crude' style='display: none;'>
                                        🐻 Crude
                                    </label>
                                </div>
                            </div>
                            
                            <div style='text-align: left; margin: 20px 0;'>
                                <label style='display: block; margin-bottom: 8px; font-weight: 700; color: #333; font-size: 15px;'>Your Name</label>
                                <input type='text' id='artist-name' value='${escapeHtml(defaultName)}' 
                                    placeholder='Your artist name' 
                                    style='width: 100%; padding: 14px 16px; border: 3px solid #e2e8f0; border-radius: 12px; font-size: 15px; box-sizing: border-box;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
                                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5);
                                    transition: all 0.2s; color: #000000;' />
                            </div>
                            
                            <div style='text-align: left; margin: 20px 0;'>
                                <label style='display: block; margin-bottom: 8px; font-weight: 700; color: #333; font-size: 15px;'>
                                    About You
                                    <span style='color: #4A90E2; font-size: 12px; font-weight: 600; margin-left: 8px;'>💬 Your fish will mention you in chat!</span>
                                </label>
                                <input type='text' id='user-info' 
                                    value='${escapeHtml(defaultUserInfo)}'
                                    placeholder='e.g., My owner loves pizza' 
                                    style='width: 100%; padding: 14px 16px; border: 3px solid #e2e8f0; border-radius: 12px; font-size: 15px; box-sizing: border-box;
                                    background: linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%);
                                    box-shadow: 0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5);
                                    transition: all 0.2s; color: #000000;' 
                                    maxlength='50' />
                                <small style='color: #64748b; font-size: 12px; margin-top: 6px; display: block;'>Your fish may mention this information in chat to get to know you better!</small>
                            </div>
                            
                            <div style='margin-top: 28px; display: flex; gap: 12px; justify-content: center;'>
                                <button id='submit-fish' style='padding: 14px 32px; background: linear-gradient(180deg, #4CD964 0%, #4CD964 50%, #3CB54A 100%);
                                border: none; border-bottom: 3px solid #2E8B3A; border-radius: 16px; font-weight: 900; font-size: 16px; color: white;
                                cursor: pointer; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                                transition: all 0.15s; position: relative; overflow: hidden;'>
                                    Submit Fish
                                </button>
                                <button id='cancel-fish' style='padding: 14px 32px; background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%);
                                border: none; border-bottom: 3px solid #A0A0A0; border-radius: 16px; font-weight: 700; font-size: 16px; color: #4A90E2;
                                cursor: pointer; box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25); transition: all 0.15s; position: relative; overflow: hidden;'>
                                    Cancel
                                </button>
                            </div>
                        </div>`, () => { });
                        
                        // Add personality selection highlight effect with 3D style
                        setTimeout(() => {
                            document.querySelectorAll('.personality-option').forEach(option => {
                                // 添加光泽效果
                                const shine = document.createElement('div');
                                shine.style.cssText = `
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    height: 50%;
                                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
                                    border-radius: 12px 12px 0 0;
                                    pointer-events: none;
                                `;
                                option.appendChild(shine);
                                
                                option.addEventListener('click', function() {
                                    document.querySelectorAll('.personality-option').forEach(o => {
                                        o.style.borderColor = '#e2e8f0';
                                        o.style.background = 'linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 50%, #D0D0D0 100%)';
                                        o.style.color = '#4A90E2';
                                        o.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.15)';
                                        o.querySelector('input').checked = false;
                                    });
                                    this.style.borderColor = '#4A90E2';
                                    this.style.background = 'linear-gradient(180deg, #63A4E8 0%, #4A90E2 50%, #357ABD 100%)';
                                    this.style.color = 'white';
                                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                                    this.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
                                    this.querySelector('input').checked = true;
                                });
                                
                                // 悬停效果
                                option.addEventListener('mouseenter', function() {
                                    if (!this.querySelector('input').checked) {
                                        this.style.transform = 'translateY(-2px)';
                                        this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.15)';
                                    }
                                });
                                option.addEventListener('mouseleave', function() {
                                    if (!this.querySelector('input').checked) {
                                        this.style.transform = 'translateY(0)';
                                        this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.15)';
                                    }
                                });
                            });
                            
                            // 输入框聚焦效果
                            const inputs = document.querySelectorAll('#fish-name, #artist-name, #user-info');
                            inputs.forEach(input => {
                                input.addEventListener('focus', function() {
                                    this.style.borderColor = '#4A90E2';
                                    this.style.boxShadow = '0 4px 0 rgba(74, 144, 226, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.5)';
                                });
                                input.addEventListener('blur', function() {
                                    if (this.id === 'fish-name') {
                                        this.style.borderColor = '#4A90E2';
                                    } else {
                                        this.style.borderColor = '#e2e8f0';
                                    }
                                    this.style.boxShadow = '0 3px 0 rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.5)';
                                });
                            });
                            
                            // 按钮悬停效果
                            const submitBtn = document.getElementById('submit-fish');
                            const cancelBtn = document.getElementById('cancel-fish');
                            
                            if (submitBtn) {
                                const submitShine = document.createElement('div');
                                submitShine.style.cssText = `
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    height: 50%;
                                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
                                    border-radius: 16px 16px 0 0;
                                    pointer-events: none;
                                `;
                                submitBtn.appendChild(submitShine);
                                
                                submitBtn.addEventListener('mouseenter', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                                submitBtn.addEventListener('mouseleave', function() {
                                    this.style.transform = 'translateY(0)';
                                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                                });
                                submitBtn.addEventListener('mousedown', function() {
                                    this.style.transform = 'translateY(2px)';
                                    this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
                                });
                                submitBtn.addEventListener('mouseup', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                            }
                            
                            if (cancelBtn) {
                                const cancelShine = document.createElement('div');
                                cancelShine.style.cssText = `
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    right: 0;
                                    height: 50%;
                                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
                                    border-radius: 16px 16px 0 0;
                                    pointer-events: none;
                                `;
                                cancelBtn.appendChild(cancelShine);
                                
                                cancelBtn.addEventListener('mouseenter', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                                cancelBtn.addEventListener('mouseleave', function() {
                                    this.style.transform = 'translateY(0)';
                                    this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.25)';
                                });
                                cancelBtn.addEventListener('mousedown', function() {
                                    this.style.transform = 'translateY(2px)';
                                    this.style.boxShadow = '0 2px 0 rgba(0, 0, 0, 0.25)';
                                });
                                cancelBtn.addEventListener('mouseup', function() {
                                    this.style.transform = 'translateY(-2px)';
                                    this.style.boxShadow = '0 6px 0 rgba(0, 0, 0, 0.25)';
                                });
                            }
                        }, 100);
                        
                        // 绑定提交按钮事件
                        document.getElementById('submit-fish').onclick = async () => {
                            const fishName = document.getElementById('fish-name').value.trim();
                            const artist = document.getElementById('artist-name').value.trim() || 'Anonymous';
                            const userInfo = document.getElementById('user-info')?.value.trim() || '';
                            const personalityRadio = document.querySelector('input[name="personality"]:checked');
                            let personality = personalityRadio ? personalityRadio.value : 'random';
                            
                            // 如果选择random或未选择，随机分配一个个性
                            if (!personality || personality === 'random') {
                                const personalities = ['funny', 'cheerful', 'brave', 'playful', 'curious', 'energetic', 'calm', 'gentle'];
                                personality = personalities[Math.floor(Math.random() * personalities.length)];
                            }
                            
                            // Validate fish name
                            if (!fishName) {
                                showUserAlert({
                                    type: 'warning',
                                    title: '请输入鱼名',
                                    message: '请为您的鱼起一个名字！',
                                    buttons: [{
                                        text: '确定',
                                        action: () => {
                                            document.getElementById('fish-name')?.focus();
                                        },
                                        closeAfterAction: true
                                    }]
                                });
                                return;
                            }
                            
                            // Save artist name and user info to localStorage for future use
                            localStorage.setItem('artistName', artist);
                            if (userInfo) {
                                localStorage.setItem('userInfo', userInfo);
                            }
                            
                            // Save user-info to user profile about_me if logged in
                            if (userInfo && window.supabaseAuth) {
                                try {
                                    const user = await window.supabaseAuth.getUser();
                                    if (user) {
                                        const backendUrl = window.BACKEND_URL || '';
                                        const userId = user.id;
                                        const token = localStorage.getItem('userToken');
                                        if (token) {
                                            await fetch(`${backendUrl}/api/profile/${encodeURIComponent(userId)}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({
                                                    aboutMe: userInfo
                                                })
                                            });
                                        }
                                    }
                                } catch (error) {
                                    console.log('Could not save user-info to about_me:', error);
                                }
                            }
                            
                            console.log('🚀 开始提交鱼');
                            console.log('  鱼名:', fishName);
                            console.log('  个性:', personality);
                            console.log('  艺术家:', artist);
                            
                            await submitFish(artist, !isFish, fishName, personality, userInfo);
                            console.log('✅ submitFish 完成');
                            
                            // 关闭modal
                            document.querySelector('.modal')?.remove();
                        };
                        document.getElementById('cancel-fish').onclick = () => {
                            document.querySelector('.modal')?.remove();
                        };
                    }
                };
                
                // 🔧 修复：添加图片加载错误处理
                img.onerror = () => {
                    console.error('❌ Failed to restore canvas from saved data');
                    // 清除存储的数据，避免重复尝试
                    sessionStorage.removeItem('pendingFishCanvas');
                    sessionStorage.removeItem('pendingFishSubmit');
                    
                    // 显示错误提示
                    showUserAlert({
                        type: 'warning',
                        title: 'Canvas Restore Failed',
                        message: 'Unable to restore your drawing. Please try drawing again.',
                        buttons: [{ text: 'OK', action: 'close' }]
                    });
                };
                
                img.src = canvasData;
            }
        }
    });
}

// 启动认证监听器
setupAuthListener();

// ===== 页面加载时初始化气泡效果 =====
document.addEventListener('DOMContentLoaded', () => {
    createBackgroundBubbles();
});
