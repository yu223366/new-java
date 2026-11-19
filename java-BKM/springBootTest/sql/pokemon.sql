-- ============================================================
-- 精灵宝可梦 图鉴项目 数据库初始化脚本（动漫原著还原版）
-- 数据库: pokemon_db
-- 账号: root / 123456
-- 说明:
--   1) 用户表 role: 1=普通用户(注册默认) 0=管理员；密码明文
--   2) 宝可梦数据取自《精灵宝可梦》动漫/游戏官方设定（关都地区为主）
--   3) 官方立绘图片存于前端 public/pokemon/ 目录，image 字段为图片路径
-- ============================================================

CREATE DATABASE IF NOT EXISTS pokemon_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pokemon_db;

-- ----------------------------
-- 1. 用户表
-- ----------------------------
DROP TABLE IF EXISTS t_user;
CREATE TABLE t_user (
    id          BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    username    VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户名',
    password    VARCHAR(100) NOT NULL COMMENT '密码(明文)',
    role        INT          NOT NULL DEFAULT 1 COMMENT '权限: 1=普通用户 0=管理员',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    status      INT          NOT NULL DEFAULT 1 COMMENT '状态: 1=在线 0=离线(预留)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 管理员账号(权限0)；普通用户注册时默认权限1
INSERT INTO t_user (username, password, role) VALUES
('admin', '123456', 0);
INSERT INTO t_user (username, password, role) VALUES
('普通用户', '123456', 1);

-- ----------------------------
-- 2. 宝可梦图鉴表（动漫原著设定）
-- ----------------------------
DROP TABLE IF EXISTS t_pokemon;
CREATE TABLE t_pokemon (
    id           BIGINT       PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    number       VARCHAR(10)  NOT NULL COMMENT '全国图鉴编号，如 025',
    name         VARCHAR(50)  NOT NULL COMMENT '中文名',
    name_en      VARCHAR(50)  COMMENT '英文名',
    category     VARCHAR(30)  NOT NULL COMMENT '第一属性: 火/水/草/电/超能力/幽灵/一般等',
    category2    VARCHAR(30)  COMMENT '第二属性: 原著双属性(如喷火龙=火+飞行)，无则空',
    level        VARCHAR(20)  NOT NULL DEFAULT '普通' COMMENT '稀有度等级: 普通/稀有/史诗/传说',
    classification VARCHAR(50) COMMENT '分类: 如 鼠宝可梦、蜥蜴宝可梦',
    height       VARCHAR(20)  COMMENT '身高',
    weight       VARCHAR(20)  COMMENT '体重',
    description  VARCHAR(500) COMMENT '图鉴介绍(原著风格)',
    image        VARCHAR(300) COMMENT '官方立绘图片路径',
    create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宝可梦图鉴表(动漫原著)';

-- 种子数据：全国图鉴官方设定（关都地区经典宝可梦）
INSERT INTO t_pokemon
(number, name, name_en, category, category2, level, classification, height, weight, description, image) VALUES
('025', '皮卡丘', 'Pikachu', '电', NULL, '普通', '鼠宝可梦', '0.4m', '6.0kg',
 '全身覆盖黄色的毛，脸颊两侧有红色的电气袋。会放电击退敌人，也是小智最亲密的伙伴。', '/pokemon/025.png'),
('004', '小火龙', 'Charmander', '火', NULL, '普通', '蜥蜴宝可梦', '0.6m', '8.5kg',
 '尾巴尖燃烧着火焰，心情越好火焰越旺盛。若火焰熄灭，生命就会结束。', '/pokemon/004.png'),
('001', '妙蛙种子', 'Bulbasaur', '草', '毒', '普通', '种子宝可梦', '0.7m', '6.9kg',
 '背上有一颗充满营养的种子，与它共生。晒太阳后种子会逐渐长大。', '/pokemon/001.png'),
('007', '杰尼龟', 'Squirtle', '水', NULL, '普通', '小龟宝可梦', '0.5m', '9.0kg',
 '背上有坚硬的龟壳，遇险时会缩入壳中并顺势喷出强力的水枪反击。', '/pokemon/007.png'),
('006', '喷火龙', 'Charizard', '火', '飞行', '传说', '火焰宝可梦', '1.7m', '90.5kg',
 '小火龙的最终进化型，双翼内侧为青蓝色，能喷出熔化一切的灼热火焰。', '/pokemon/006.png'),
('009', '水箭龟', 'Blastoise', '水', NULL, '史诗', '甲壳宝可梦', '1.6m', '85.5kg',
 '杰尼龟的最终进化型，龟壳上装有水炮，能喷射出强劲的水流。', '/pokemon/009.png'),
('003', '妙蛙花', 'Venusaur', '草', '毒', '史诗', '花朵宝可梦', '2.0m', '100.0kg',
 '妙蛙种子的最终进化型，背上的花朵会绽放，散发香气并吸收阳光补充能量。', '/pokemon/003.png'),
('026', '雷丘', 'Raichu', '电', NULL, '稀有', '鼠宝可梦', '0.8m', '30.0kg',
 '皮卡丘的进化型，尾巴如避雷针般立起，能将储存的大量电力一次释放。', '/pokemon/026.png'),
('150', '超梦', 'Mewtwo', '超能力', NULL, '传说', '基因宝可梦', '2.0m', '122.0kg',
 '由人类基因工程创造的最强宝可梦，拥有压倒性的超能力，内心充满谜团。', '/pokemon/150.png'),
('094', '耿鬼', 'Gengar', '幽灵', '毒', '稀有', '影子宝可梦', '1.5m', '40.5kg',
 '夜晚会藏在影子里，红色的眼睛在黑暗中格外醒目，性格调皮爱恶作剧。', '/pokemon/094.png'),
('143', '卡比兽', 'Snorlax', '一般', NULL, '稀有', '贪吃宝可梦', '2.1m', '460.0kg',
 '每天要睡二十个小时，圆滚滚的肚子像小山一样，只有美食才能让它起身。', '/pokemon/143.png'),
('133', '伊布', 'Eevee', '一般', NULL, '普通', '进化宝可梦', '0.3m', '6.5kg',
 '拥有不规则的进化基因，能根据环境进化成多种形态，是奈奈美最喜爱的宝可梦。', '/pokemon/133.png');
