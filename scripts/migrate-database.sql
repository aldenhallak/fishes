-- ====================================
-- Fish Art Battle System - Complete Database Schema
-- 从零创建所有数据库表
-- ====================================

-- ====================================
-- 1. fish 表（核心数据表）
-- 包含战斗系统和原功能所有字段
-- ====================================
CREATE TABLE IF NOT EXISTS fish (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  artist VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- 战斗系统字段
  talent INT NOT NULL DEFAULT 50,           -- 天赋值 (25-75)
  level INT NOT NULL DEFAULT 1,             -- 等级
  experience INT NOT NULL DEFAULT 0,        -- 经验值
  health INT NOT NULL DEFAULT 10,           -- 当前血量
  max_health INT NOT NULL DEFAULT 10,       -- 最大血量
  battle_power DECIMAL(10,2) DEFAULT 0,     -- 计算后的战斗力
  last_exp_update TIMESTAMP DEFAULT NOW(),  -- 最后经验增长时间
  is_alive BOOLEAN DEFAULT TRUE,            -- 是否存活
  is_in_battle_mode BOOLEAN DEFAULT FALSE,  -- 是否在战斗模式
  position_row INT DEFAULT 0,               -- Y轴位置（用于防重复遭遇）
  total_wins INT DEFAULT 0,                 -- 总胜场
  total_losses INT DEFAULT 0,               -- 总败场
  
  -- 原功能字段（点赞、举报等）
  upvotes INT NOT NULL DEFAULT 0,           -- 点赞数
  downvotes INT NOT NULL DEFAULT 0,         -- 点踩数
  reported BOOLEAN DEFAULT FALSE,           -- 是否被举报
  report_count INT DEFAULT 0,               -- 举报次数
  is_approved BOOLEAN DEFAULT TRUE,         -- 是否通过审核
  moderator_notes TEXT                      -- 管理员备注
);

-- fish 表索引
CREATE INDEX IF NOT EXISTS idx_fish_user ON fish(user_id);
CREATE INDEX IF NOT EXISTS idx_fish_battle ON fish(is_in_battle_mode, is_alive);
CREATE INDEX IF NOT EXISTS idx_fish_created ON fish(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fish_upvotes ON fish(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_fish_score ON fish((upvotes - downvotes) DESC);

-- ====================================
-- 2. votes 表（投票记录）
-- 记录所有投票历史，防止重复投票
-- ====================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fish_id UUID NOT NULL REFERENCES fish(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(fish_id, user_id)
);

-- votes 表索引
CREATE INDEX IF NOT EXISTS idx_votes_fish ON votes(fish_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_created ON votes(created_at DESC);

-- ====================================
-- 3. reports 表（举报记录）
-- 记录所有举报信息
-- ====================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fish_id UUID NOT NULL REFERENCES fish(id) ON DELETE CASCADE,
  reporter_ip VARCHAR(50),
  reason TEXT NOT NULL,
  user_agent TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  moderator_id VARCHAR(255),
  moderator_action TEXT,
  resolved_at TIMESTAMP
);

-- reports 表索引
CREATE INDEX IF NOT EXISTS idx_reports_fish ON reports(fish_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);

-- ====================================
-- 4. battle_config 表（战斗配置）
-- 全局战斗系统配置，只有一行数据
-- ====================================
CREATE TABLE IF NOT EXISTS battle_config (
  id INT PRIMARY KEY DEFAULT 1,
  level_weight DECIMAL(5,2) DEFAULT 0.40,   -- 等级权重 40%
  talent_weight DECIMAL(5,2) DEFAULT 0.35,  -- 天赋权重 35%
  upvote_weight DECIMAL(5,2) DEFAULT 0.25,  -- 点赞权重 25%
  random_factor DECIMAL(5,2) DEFAULT 0.20,  -- 随机性 ±20%
  
  exp_per_second INT DEFAULT 1,             -- 每秒自然增长经验
  exp_per_win INT DEFAULT 50,               -- 胜利获得经验
  exp_for_level_up_base INT DEFAULT 100,    -- 升级所需基础经验
  exp_for_level_up_multiplier DECIMAL(5,2) DEFAULT 1.5, -- 升级经验乘数
  
  health_loss_per_defeat INT DEFAULT 1,     -- 失败损失血量
  health_per_feed INT DEFAULT 2,            -- 喂食恢复血量
  max_health_per_level INT DEFAULT 2,       -- 每级增加最大血量
  
  max_battle_users INT DEFAULT 50,          -- 最大并发战斗用户数
  battle_cooldown_seconds INT DEFAULT 30,   -- 战斗冷却时间（秒）
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_id CHECK (id = 1)
);

-- 插入默认配置
INSERT INTO battle_config (id) VALUES (1) 
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- 5. user_economy 表（用户经济数据）
-- 记录每个用户的鱼食余额
-- ====================================
CREATE TABLE IF NOT EXISTS user_economy (
  user_id VARCHAR(255) PRIMARY KEY,
  fish_food INT NOT NULL DEFAULT 10,        -- 鱼食数量（初始10个）
  total_earned INT DEFAULT 0,               -- 累计获得
  total_spent INT DEFAULT 0,                -- 累计消耗
  last_daily_bonus TIMESTAMP,               -- 最后签到时间
  created_at TIMESTAMP DEFAULT NOW()
);

-- user_economy 表索引
CREATE INDEX IF NOT EXISTS idx_economy_created ON user_economy(created_at DESC);

-- ====================================
-- 6. battle_log 表（战斗历史）
-- 记录所有战斗结果
-- ====================================
CREATE TABLE IF NOT EXISTS battle_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES fish(id) ON DELETE SET NULL,
  defender_id UUID REFERENCES fish(id) ON DELETE SET NULL,
  winner_id UUID,
  attacker_power DECIMAL(10,2),
  defender_power DECIMAL(10,2),
  random_factor DECIMAL(5,2),
  exp_gained INT,
  health_lost INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- battle_log 表索引
CREATE INDEX IF NOT EXISTS idx_battle_attacker ON battle_log(attacker_id);
CREATE INDEX IF NOT EXISTS idx_battle_defender ON battle_log(defender_id);
CREATE INDEX IF NOT EXISTS idx_battle_created ON battle_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_winner ON battle_log(winner_id);

-- ====================================
-- 7. economy_log 表（经济操作日志）
-- 记录所有鱼食消费和获得
-- ====================================
CREATE TABLE IF NOT EXISTS economy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  fish_id UUID REFERENCES fish(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,              -- 'create', 'revive', 'feed', 'daily_bonus', 'purchase', 'watch_ad'
  amount INT NOT NULL,                      -- 正数=获得，负数=消耗
  balance_after INT NOT NULL,               -- 操作后余额
  created_at TIMESTAMP DEFAULT NOW()
);

-- economy_log 表索引
CREATE INDEX IF NOT EXISTS idx_economy_user ON economy_log(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_action ON economy_log(action);
CREATE INDEX IF NOT EXISTS idx_economy_created ON economy_log(created_at DESC);

-- ====================================
-- 8. 数据库视图（优化查询）
-- ====================================

-- fish_with_scores 视图：自动计算分数和通过率
CREATE OR REPLACE VIEW fish_with_scores AS
SELECT 
  f.*,
  (f.upvotes - f.downvotes) as score,
  CASE 
    WHEN (f.upvotes + f.downvotes) > 0 
    THEN f.upvotes::float / (f.upvotes + f.downvotes)
    ELSE 0.5 
  END as approval_rate
FROM fish f
WHERE f.is_approved = true AND f.reported = false;

-- battle_fish 视图：只显示战斗模式中的活鱼
CREATE OR REPLACE VIEW battle_fish AS
SELECT 
  f.*,
  (f.upvotes - f.downvotes) as score
FROM fish f
WHERE f.is_in_battle_mode = true 
  AND f.is_alive = true 
  AND f.is_approved = true;

-- user_fish_summary 视图：用户的鱼统计
CREATE OR REPLACE VIEW user_fish_summary AS
SELECT 
  f.user_id,
  COUNT(*) as total_fish,
  SUM(CASE WHEN f.is_alive THEN 1 ELSE 0 END) as alive_fish,
  SUM(f.total_wins) as total_wins,
  SUM(f.total_losses) as total_losses,
  AVG(f.level) as avg_level,
  MAX(f.level) as max_level,
  SUM(f.upvotes) as total_upvotes
FROM fish f
GROUP BY f.user_id;

-- ====================================
-- 9. 触发器和函数
-- ====================================

-- 自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 battle_config 添加触发器
DROP TRIGGER IF EXISTS update_battle_config_updated_at ON battle_config;
CREATE TRIGGER update_battle_config_updated_at
    BEFORE UPDATE ON battle_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 自动增加 fish 的 report_count
CREATE OR REPLACE FUNCTION increment_report_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE fish 
    SET 
        report_count = report_count + 1,
        reported = CASE WHEN report_count + 1 >= 5 THEN true ELSE reported END
    WHERE id = NEW.fish_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 reports 添加触发器
DROP TRIGGER IF EXISTS auto_increment_report_count ON reports;
CREATE TRIGGER auto_increment_report_count
    AFTER INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION increment_report_count();

-- ====================================
-- 10. 初始数据（可选）
-- ====================================

-- 可以在这里插入测试数据
-- 例如：管理员账号、示例鱼等

-- ====================================
-- 数据库迁移完成
-- ====================================

-- 显示表信息
DO $$ 
BEGIN
    RAISE NOTICE '✅ 数据库迁移完成！';
    RAISE NOTICE '已创建以下表：';
    RAISE NOTICE '  1. fish (鱼数据表)';
    RAISE NOTICE '  2. votes (投票记录表)';
    RAISE NOTICE '  3. reports (举报记录表)';
    RAISE NOTICE '  4. battle_config (战斗配置表)';
    RAISE NOTICE '  5. user_economy (用户经济表)';
    RAISE NOTICE '  6. battle_log (战斗日志表)';
    RAISE NOTICE '  7. economy_log (经济日志表)';
    RAISE NOTICE '';
    RAISE NOTICE '已创建以下视图：';
    RAISE NOTICE '  - fish_with_scores';
    RAISE NOTICE '  - battle_fish';
    RAISE NOTICE '  - user_fish_summary';
    RAISE NOTICE '';
    RAISE NOTICE '已创建以下触发器：';
    RAISE NOTICE '  - update_battle_config_updated_at';
    RAISE NOTICE '  - auto_increment_report_count';
END $$;
