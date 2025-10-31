-- ====================================
-- 鱼战斗系统 - 数据库迁移脚本
-- ====================================
-- 执行方式：
-- 1. 通过Hasura Console的SQL标签页执行
-- 2. 或通过psql命令: psql -U your_user -d your_database -f scripts/migrate-database.sql
-- ====================================

BEGIN;

-- ====================================
-- 1. 扩展fish表（添加战斗相关字段）
-- ====================================
DO $$ BEGIN
  RAISE NOTICE '正在扩展fish表...';
END $$;

ALTER TABLE fish 
  ADD COLUMN IF NOT EXISTS talent INT DEFAULT 50 CHECK (talent >= 0 AND talent <= 100),
  ADD COLUMN IF NOT EXISTS level INT DEFAULT 1 CHECK (level >= 1),
  ADD COLUMN IF NOT EXISTS experience INT DEFAULT 0 CHECK (experience >= 0),
  ADD COLUMN IF NOT EXISTS health INT DEFAULT 10 CHECK (health >= 0),
  ADD COLUMN IF NOT EXISTS max_health INT DEFAULT 10 CHECK (max_health > 0),
  ADD COLUMN IF NOT EXISTS battle_power DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_in_battle_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_battle_time TIMESTAMP,
  ADD COLUMN IF NOT EXISTS total_wins INT DEFAULT 0 CHECK (total_wins >= 0),
  ADD COLUMN IF NOT EXISTS total_losses INT DEFAULT 0 CHECK (total_losses >= 0);

-- 添加注释
COMMENT ON COLUMN fish.talent IS '天赋值(0-100)，画鱼时随机生成';
COMMENT ON COLUMN fish.level IS '等级，通过经验提升';
COMMENT ON COLUMN fish.experience IS '经验值';
COMMENT ON COLUMN fish.health IS '当前血量';
COMMENT ON COLUMN fish.max_health IS '最大血量，随等级提升';
COMMENT ON COLUMN fish.battle_power IS '战斗力，由等级/天赋/点赞计算得出';
COMMENT ON COLUMN fish.is_in_battle_mode IS '是否在战斗模式中';
COMMENT ON COLUMN fish.last_battle_time IS '最后一次战斗时间';

-- 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_battle_mode 
  ON fish(is_in_battle_mode, is_alive, battle_power);

CREATE INDEX IF NOT EXISTS idx_user_battle 
  ON fish(user_id, is_in_battle_mode);

CREATE INDEX IF NOT EXISTS idx_fish_level 
  ON fish(level DESC);

DO $$ BEGIN
  RAISE NOTICE '✅ fish表扩展完成';
END $$;

-- ====================================
-- 2. 创建battle_config表（战斗配置）
-- ====================================
DO $$ BEGIN
  RAISE NOTICE '正在创建battle_config表...';
END $$;

CREATE TABLE IF NOT EXISTS battle_config (
  id INT PRIMARY KEY DEFAULT 1,
  level_weight DECIMAL(5,2) DEFAULT 0.40 CHECK (level_weight >= 0 AND level_weight <= 1),
  talent_weight DECIMAL(5,2) DEFAULT 0.35 CHECK (talent_weight >= 0 AND talent_weight <= 1),
  upvote_weight DECIMAL(5,2) DEFAULT 0.25 CHECK (upvote_weight >= 0 AND upvote_weight <= 1),
  random_factor DECIMAL(5,2) DEFAULT 0.20 CHECK (random_factor >= 0 AND random_factor <= 1),
  exp_per_win INT DEFAULT 50 CHECK (exp_per_win > 0),
  health_loss_per_defeat INT DEFAULT 1 CHECK (health_loss_per_defeat > 0),
  max_battle_users INT DEFAULT 100 CHECK (max_battle_users > 0),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_weights_sum CHECK (level_weight + talent_weight + upvote_weight <= 1.01)
);

COMMENT ON TABLE battle_config IS '战斗系统配置，只有一条记录';
COMMENT ON COLUMN battle_config.level_weight IS '等级权重（默认40%）';
COMMENT ON COLUMN battle_config.talent_weight IS '天赋权重（默认35%）';
COMMENT ON COLUMN battle_config.upvote_weight IS '点赞权重（默认25%）';
COMMENT ON COLUMN battle_config.random_factor IS '随机因素±20%';

-- 插入默认配置
INSERT INTO battle_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ battle_config表创建完成';
END $$;

-- ====================================
-- 3. 创建battle_log表（战斗日志）
-- ====================================
DO $$ BEGIN
  RAISE NOTICE '正在创建battle_log表...';
END $$;

CREATE TABLE IF NOT EXISTS battle_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID NOT NULL,
  defender_id UUID NOT NULL,
  winner_id UUID NOT NULL,
  attacker_power DECIMAL(10,2),
  defender_power DECIMAL(10,2),
  exp_gained INT,
  health_lost INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_battle_log_date ON battle_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_log_attacker ON battle_log(attacker_id);
CREATE INDEX IF NOT EXISTS idx_battle_log_defender ON battle_log(defender_id);
CREATE INDEX IF NOT EXISTS idx_battle_log_winner ON battle_log(winner_id);

COMMENT ON TABLE battle_log IS '战斗日志记录';

DO $$ BEGIN
  RAISE NOTICE '✅ battle_log表创建完成';
END $$;

-- ====================================
-- 4. 创建user_economy表（用户经济）
-- ====================================
DO $$ BEGIN
  RAISE NOTICE '正在创建user_economy表...';
END $$;

CREATE TABLE IF NOT EXISTS user_economy (
  user_id VARCHAR(255) PRIMARY KEY,
  fish_food INT DEFAULT 10 CHECK (fish_food >= 0),
  last_daily_bonus TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE user_economy IS '用户经济系统，记录鱼食余额';
COMMENT ON COLUMN user_economy.fish_food IS '鱼食数量，用于创建鱼、复活、喂食';
COMMENT ON COLUMN user_economy.last_daily_bonus IS '最后一次领取每日签到的时间';

DO $$ BEGIN
  RAISE NOTICE '✅ user_economy表创建完成';
END $$;

-- ====================================
-- 5. 创建economy_log表（经济日志，可选）
-- ====================================
DO $$ BEGIN
  RAISE NOTICE '正在创建economy_log表...';
END $$;

CREATE TABLE IF NOT EXISTS economy_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  fish_id UUID,
  action VARCHAR(50) NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_economy_log_user ON economy_log(user_id);
CREATE INDEX IF NOT EXISTS idx_economy_log_action ON economy_log(action);
CREATE INDEX IF NOT EXISTS idx_economy_log_date ON economy_log(created_at DESC);

COMMENT ON TABLE economy_log IS '经济操作日志（可选，用于审计）';

DO $$ BEGIN
  RAISE NOTICE '✅ economy_log表创建完成';
END $$;

-- ====================================
-- 6. 创建视图（方便查询）
-- ====================================
DO $$ BEGIN
  RAISE NOTICE '正在创建视图...';
END $$;

-- 战斗中的鱼视图
CREATE OR REPLACE VIEW battle_fish AS
SELECT 
  id, user_id, artist, image_url,
  talent, level, experience, health, max_health,
  battle_power, upvotes, downvotes,
  total_wins, total_losses
FROM fish
WHERE is_in_battle_mode = TRUE AND is_alive = TRUE;

COMMENT ON VIEW battle_fish IS '当前在战斗模式中的鱼';

-- 鱼排行榜视图
CREATE OR REPLACE VIEW fish_leaderboard AS
SELECT 
  id, user_id, artist, image_url,
  level, experience, total_wins, total_losses,
  (total_wins::float / NULLIF(total_wins + total_losses, 0)) AS win_rate,
  upvotes - downvotes AS score
FROM fish
WHERE is_alive = TRUE
ORDER BY level DESC, experience DESC;

COMMENT ON VIEW fish_leaderboard IS '鱼排行榜（按等级和经验排序）';

DO $$ BEGIN
  RAISE NOTICE '✅ 视图创建完成';
END $$;

-- ====================================
-- 7. 初始化数据
-- ====================================
DO $$ BEGIN
  RAISE NOTICE '正在初始化现有鱼数据...';
END $$;

-- 为现有的鱼添加随机天赋值
UPDATE fish 
SET talent = FLOOR(RANDOM() * 50 + 25)::INT
WHERE talent IS NULL OR talent = 50;

-- 重新计算战斗力
UPDATE fish 
SET battle_power = (
  (LEAST(level * 10, 100) * 0.40) + 
  (talent * 0.35) + 
  (LEAST(upvotes / 10.0, 100) * 0.25)
)
WHERE battle_power = 0;

DO $$ BEGIN
  RAISE NOTICE '✅ 数据初始化完成';
END $$;

COMMIT;

-- ====================================
-- 验证迁移
-- ====================================
DO $$ 
DECLARE
  fish_count INT;
  config_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '迁移验证';
  RAISE NOTICE '========================================';
  
  -- 检查fish表
  SELECT COUNT(*) INTO fish_count FROM fish;
  RAISE NOTICE '✅ fish表: % 条记录', fish_count;
  
  -- 检查配置
  SELECT EXISTS(SELECT 1 FROM battle_config WHERE id = 1) INTO config_exists;
  IF config_exists THEN
    RAISE NOTICE '✅ battle_config: 配置已就绪';
  ELSE
    RAISE NOTICE '⚠️ battle_config: 配置缺失';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ 数据库迁移完成！';
  RAISE NOTICE '========================================';
END $$;

