/**
 * 内置图鉴数据集 —— 按《精灵宝可梦》动画原著整理
 * 以「小智与同伴在动画中的实际伙伴」为主线，覆盖关都 → 帕底亚（地平线）
 * 官方立绘位于 public/pokemon/，文件名 = 全国编号 3 位数字
 *
 * level 字段为图鉴徽章用的四档稀有度（普通/稀有/史诗/传说）；
 * 五档细分（普通→稀有→史诗→神兽→幻兽）见 gameData.js 的 POKEDEX_EXTRA.rarity
 */

export const BUILTIN_POKEMON = [
  // ============ 关都地区 ============
  { id: 1, number: '025', name: '皮卡丘', nameEn: 'Pikachu', category: '电', category2: null, level: '普通', classification: '鼠宝可梦', height: '0.4m', weight: '6.0kg', description: '小智最初的伙伴。出发那天迟到的少年只领到这只不肯进精灵球的皮卡丘；被烈雀群围攻时它仍拼死放出电击护住小智，羁绊自此开始。它拒绝用雷之石进化，坚持以原本的自己战斗到底。', image: '/pokemon/025.png' },
  { id: 2, number: '004', name: '小火龙', nameEn: 'Charmander', category: '火', category2: null, level: '普通', classification: '蜥蜴宝可梦', height: '0.6m', weight: '8.5kg', description: '尾巴尖燃烧着代表生命的火焰。小智在暴雨中救下被原主人遗弃、尾巴将熄的小火龙，此后它一路进化为火恐龙与喷火龙，成为小智最可靠的空中战力。', image: '/pokemon/004.png' },
  { id: 3, number: '001', name: '妙蛙种子', nameEn: 'Bulbasaur', category: '草', category2: '毒', level: '普通', classification: '种子宝可梦', height: '0.7m', weight: '6.9kg', description: '背上的种子与它共生，晒足阳光便会更加茁壮。小智的妙蛙种子性格沉稳，长大后负责守护大木研究所后山的妙蛙花园，是伙伴们心中的「大哥」。', image: '/pokemon/001.png' },
  { id: 4, number: '007', name: '杰尼龟', nameEn: 'Squirtle', category: '水', category2: null, level: '普通', classification: '小龟宝可梦', height: '0.5m', weight: '9.0kg', description: '原本是杰尼龟军团的老大，戴着墨镜四处打抱不平。被小智收服后依旧照拂着那些小弟，遇险时缩入硬壳并顺势喷出强力水枪反击。', image: '/pokemon/007.png' },
  { id: 5, number: '006', name: '喷火龙', nameEn: 'Charizard', category: '火', category2: '飞行', level: '传说', classification: '火焰宝可梦', height: '1.7m', weight: '90.5kg', description: '小火龙的最终进化型，双翼内侧泛着青蓝色。曾因骄傲不听话，在喷火龙山谷修行归来后彻底蜕变，橘子群岛一战击败传说宝可梦急冻鸟，成为小智最强大的伙伴之一。', image: '/pokemon/006.png' },
  { id: 6, number: '009', name: '水箭龟', nameEn: 'Blastoise', category: '水', category2: null, level: '史诗', classification: '甲壳宝可梦', height: '1.6m', weight: '85.5kg', description: '杰尼龟的最终进化型，龟壳上装有两门水炮，能喷射穿透岩石的高压水流。动画中常作为水系训练家的王牌登场，与小智的喷火龙形成经典对决。', image: '/pokemon/009.png' },
  { id: 7, number: '003', name: '妙蛙花', nameEn: 'Venusaur', category: '草', category2: '毒', level: '史诗', classification: '花朵宝可梦', height: '2.0m', weight: '100.0kg', description: '妙蛙种子的最终进化型，背上的花朵盛开时会散发抚慰心灵的香气，并靠吸收阳光补充能量。在妙蛙花园中是被众多种子宝可梦围绕的守护者。', image: '/pokemon/003.png' },
  { id: 8, number: '026', name: '雷丘', nameEn: 'Raichu', category: '电', category2: null, level: '稀有', classification: '鼠宝可梦', height: '0.8m', weight: '30.0kg', description: '皮卡丘的进化型，尾巴像避雷针般立起，能将储存的电力一次释放。枯叶道馆馆主马奇的雷丘、以及皮卡丘短暂的进化形态，都是动画中令人难忘的存在。', image: '/pokemon/026.png' },
  { id: 9, number: '150', name: '超梦', nameEn: 'Mewtwo', category: '超能力', category2: null, level: '传说', classification: '基因宝可梦', height: '2.0m', weight: '122.0kg', description: '由梦幻基因创造的人造宝可梦，拥有压倒性的超能力，长期追问「我为何而存在」。剧场版《超梦的逆袭》中与小智的相遇，让它第一次理解了羁绊的意义。', image: '/pokemon/150.png' },
  { id: 10, number: '094', name: '耿鬼', nameEn: 'Gengar', category: '幽灵', category2: '毒', level: '稀有', classification: '影子宝可梦', height: '1.5m', weight: '40.5kg', description: '会藏进人的影子里，红色眼睛在黑暗中格外醒目。动画里常在夜晚出没作弄旅人，小智在紫苑镇灵骨塔与幽灵宝可梦的相遇是系列经典桥段。', image: '/pokemon/094.png' },
  { id: 11, number: '143', name: '卡比兽', nameEn: 'Snorlax', category: '一般', category2: null, level: '稀有', classification: '贪吃宝可梦', height: '2.1m', weight: '460.0kg', description: '一天要睡二十个小时，只有美食能让它起身。小智的卡比兽曾横躺在道路上挡住整条要道，被收服后成为关键时刻登场的一击必杀型伙伴。', image: '/pokemon/143.png' },
  { id: 12, number: '133', name: '伊布', nameEn: 'Eevee', category: '一般', category2: null, level: '普通', classification: '进化宝可梦', height: '0.3m', weight: '6.5kg', description: '拥有不规则的进化基因，能依环境进化成八种形态。小遥的伊布在华丽大赛中登台，是动画里最能体现「可能性」的宝可梦。', image: '/pokemon/133.png' },
  { id: 13, number: '012', name: '巴大蝶', nameEn: 'Butterfree', category: '虫', category2: '飞行', level: '普通', classification: '蝶宝可梦', height: '1.1m', weight: '32.0kg', description: '小智的绿毛虫→铁甲蛹→巴大蝶，是他在动画里第一只亲手培育成熟的宝可梦。为了追寻粉色巴大蝶的爱情，它在关都的天空中与小智告别，成为无数观众的第一滴眼泪。', image: '/pokemon/012.png' },
  { id: 14, number: '018', name: '大比鸟', nameEn: 'Pidgeot', category: '一般', category2: '飞行', level: '稀有', classification: '鸟宝可梦', height: '1.5m', weight: '39.5kg', description: '小智的比比鸟最终进化型。为守护同伴的大比鸟群而留在森林，临别时约定「等我办完事就回来接你」，成为动画里最令人牵挂的约定之一。', image: '/pokemon/018.png' },
  { id: 15, number: '089', name: '臭臭泥', nameEn: 'Muk', category: '毒', category2: null, level: '稀有', classification: '污泥宝可梦', height: '1.2m', weight: '30.0kg', description: '小智在关都收服的臭臭泥，最爱把人整个压住表达亲昵，常把大木博士埋成一团。看似邋遢，却是小智关都阵容里忠实的战力。', image: '/pokemon/089.png' },
  { id: 16, number: '095', name: '大岩蛇', nameEn: 'Onix', category: '岩石', category2: '地面', level: '稀有', classification: '岩蛇宝可梦', height: '8.8m', weight: '210.0kg', description: '深灰道馆馆主小刚的王牌，身躯由无数岩块串联而成，可掘地千里。小智初出茅庐时，正是靠皮卡丘的电击打湿地面才勉强击败它。', image: '/pokemon/095.png' },
  { id: 17, number: '131', name: '拉普拉斯', nameEn: 'Lapras', category: '水', category2: '冰', level: '稀有', classification: '乘载宝可梦', height: '2.5m', weight: '220.0kg', description: '小智在橘子群岛救下的拉普拉斯（动画中常称「乘龙」），一路载着他横渡群岛。旅程结束时它选择回到同类身边，那一幕的告别与回望是橘子群岛篇的情感高点。', image: '/pokemon/131.png' },
  { id: 18, number: '149', name: '快龙', nameEn: 'Dragonite', category: '龙', category2: '飞行', level: '史诗', classification: '龙宝可梦', height: '2.2m', weight: '210.0kg', description: '动画中以「救难的宝可梦」形象出现，曾载着迷路者飞渡大海。小智在旅途篇收服的哈克龙进化成快龙，成为世界冠军赛上的重要战力。', image: '/pokemon/149.png' },
  { id: 19, number: '151', name: '梦幻', nameEn: 'Mew', category: '超能力', category2: null, level: '传说', classification: '新种宝可梦', height: '0.4m', weight: '4.0kg', description: '被认为已灭绝、实则隐居世外的幻之宝可梦，是所有宝可梦基因的源头。《超梦的逆袭》《梦幻与波导的勇者》中都以旁观者的姿态注视着人类的羁绊。', image: '/pokemon/151.png' },
  { id: 20, number: '448', name: '路卡利欧', nameEn: 'Lucario', category: '格斗', category2: '钢', level: '史诗', classification: '波导宝可梦', height: '1.2m', weight: '54.0kg', description: '能感知「波导」的宝可梦。剧场版中波导勇者亚朗的路卡利欧被封印百年，误解与和解令人落泪；小智在旅途篇亲手培育的利欧路也成长为路卡利欧。', image: '/pokemon/448.png' },

  // ============ 城都地区 ============
  { id: 21, number: '153', name: '月桂叶', nameEn: 'Bayleef', category: '草', category2: null, level: '稀有', classification: '叶子宝可梦', height: '1.2m', weight: '15.8kg', description: '小智的菊草叶进化而成，颈间的叶片能散发香气。它性格要强又爱撒娇，常为争宠撞翻小智，是城都篇最鲜活的伙伴之一。', image: '/pokemon/153.png' },
  { id: 22, number: '156', name: '火岩鼠', nameEn: 'Quilava', category: '火', category2: null, level: '稀有', classification: '火山宝可梦', height: '0.9m', weight: '19.0kg', description: '小智的火球鼠进化型，背上的火焰在战斗时猛烈燃烧。它曾在小智陷入危机时挺身而出，展现出城都御三家独有的倔强。', image: '/pokemon/156.png' },
  { id: 23, number: '214', name: '赫拉克罗斯', nameEn: 'Heracross', category: '虫', category2: '格斗', level: '稀有', classification: '独角宝可梦', height: '1.5m', weight: '54.0kg', description: '小智在城都收服的独角宝可梦，最爱用角顶起树皮吸食树汁，连小智的果汁也不放过。力量惊人，是城都阵容里的奇兵。', image: '/pokemon/214.png' },

  // ============ 丰缘地区 ============
  { id: 24, number: '254', name: '蜥蜴王', nameEn: 'Sceptile', category: '草', category2: null, level: '史诗', classification: '密林宝可梦', height: '1.7m', weight: '52.2kg', description: '小智的木守宫最终进化型，能在林间无声疾驰。它曾因失去力量而消沉，在小智的陪伴下重新振作，是丰缘篇最具「成长感」的伙伴。', image: '/pokemon/254.png' },
  { id: 25, number: '257', name: '火焰鸡', nameEn: 'Blaziken', category: '火', category2: '格斗', level: '史诗', classification: '猛火宝可梦', height: '1.9m', weight: '52.0kg', description: '小遥的火稚鸡最终进化型，腕部能喷出灼热火焰，跳跃力惊人。曾在华丽大赛与联盟赛场上为小遥赢下关键胜利。', image: '/pokemon/257.png' },
  { id: 26, number: '277', name: '大王燕', nameEn: 'Swellow', category: '一般', category2: '飞行', level: '稀有', classification: '燕子宝可梦', height: '0.7m', weight: '19.8kg', description: '小智的傲骨燕进化型，翅膀坚硬如刃，能以高速俯冲贯穿对手。丰缘联盟上它带伤仍坚持飞完的场面，诠释了「不屈」二字。', image: '/pokemon/277.png' },
  { id: 27, number: '373', name: '暴飞龙', nameEn: 'Salamence', category: '龙', category2: '飞行', level: '史诗', classification: '龙宝可梦', height: '1.5m', weight: '102.6kg', description: '丰缘地区的准传说宝可梦，因长年渴望飞翔而长出双翼。动画中作为强敌登场，与蜥蜴王、火焰鸡的对决极具压迫感。', image: '/pokemon/373.png' },

  // ============ 神奥地区 ============
  { id: 28, number: '389', name: '土台龟', nameEn: 'Torterra', category: '草', category2: '地面', level: '史诗', classification: '大陆宝可梦', height: '2.2m', weight: '310.0kg', description: '小智的草苗龟最终进化型，背上长出小树，可以承载宝可梦休憩。稳重可靠的它，是神奥阵容里最让人安心的大地。', image: '/pokemon/389.png' },
  { id: 29, number: '392', name: '烈焰猴', nameEn: 'Infernape', category: '火', category2: '格斗', level: '史诗', classification: '火焰宝可梦', height: '1.2m', weight: '55.0kg', description: '小智的小火焰猴最终进化型。幼时被真司抛弃，在铃兰大会与真司的电击魔兽决战中燃起「猛火」完成逆转，是动画史上最燃的对决之一。', image: '/pokemon/392.png' },
  { id: 30, number: '398', name: '姆克鹰', nameEn: 'Staraptor', category: '一般', category2: '飞行', level: '稀有', classification: '猛禽宝可梦', height: '1.2m', weight: '24.9kg', description: '小智的姆克儿最终进化型，冠羽如利刃，敢于正面对抗更强的对手。神奥篇里它屡次以「近身战」硬碰硬，是小智最有胆气的飞行伙伴。', image: '/pokemon/398.png' },
  { id: 31, number: '445', name: '烈咬陆鲨', nameEn: 'Garchomp', category: '龙', category2: '地面', level: '史诗', classification: '超音速宝可梦', height: '1.9m', weight: '95.0kg', description: '神奥地区的准传说，能以音速在地面滑翔。竹兰的烈咬陆鲨是冠军级象征；小智在旅途篇收服的圆陆鲨也一路成长为烈咬陆鲨。', image: '/pokemon/445.png' },
  { id: 32, number: '483', name: '帝牙卢卡', nameEn: 'Dialga', category: '钢', category2: '龙', level: '传说', classification: '时间宝可梦', height: '5.4m', weight: '683.0kg', description: '掌控时间的传说宝可梦，胸口的心脏驱动着时间流动。剧场版《帝牙卢卡VS帕路奇亚VS达克莱伊》中，它与帕路奇亚的时空之战几乎撕裂白杨镇。', image: '/pokemon/483.png' },

  // ============ 合众地区 ============
  { id: 33, number: '497', name: '君主蛇', nameEn: 'Serperior', category: '草', category2: null, level: '史诗', classification: '皇家宝可梦', height: '3.3m', weight: '63.0kg', description: '小智的藤藤蛇最终进化型，以高傲的姿态俯视对手，仅凭目光就能压制对方。合众篇里它从不肯服输的小蛇成长为真正的王者。', image: '/pokemon/497.png' },
  { id: 34, number: '560', name: '头巾混混', nameEn: 'Scrafty', category: '恶', category2: '格斗', level: '稀有', classification: '恶党宝可梦', height: '1.4m', weight: '40.0kg', description: '小智的滑头小子进化型，皮肤像裤子一样可以拉高，会从口中喷出酸性唾液。看似不良，实则重情义，是合众阵容里的硬汉担当。', image: '/pokemon/560.png' },

  // ============ 卡洛斯地区 ============
  { id: 35, number: '658', name: '甲贺忍蛙', nameEn: 'Greninja', category: '水', category2: '恶', level: '史诗', classification: '忍者宝可梦', height: '1.5m', weight: '40.0kg', description: '小智的呱呱泡蛙最终进化型。与小智心意相通时能触发「羁绊现象」，变身为小智版甲贺忍蛙，用巨大水手里剑作战，是卡洛斯篇的最高光。', image: '/pokemon/658.png' },
  { id: 36, number: '663', name: '烈箭鹰', nameEn: 'Talonflame', category: '火', category2: '飞行', level: '稀有', classification: '猛火宝可梦', height: '1.2m', weight: '24.5kg', description: '小智的小箭雀最终进化型，飞行时火星四溅，能以疾风之翼高速突袭。卡洛斯联盟上它带伤冲锋的样子，让小智第一次看见「火」的另一种形态。', image: '/pokemon/663.png' },
  { id: 37, number: '715', name: '音波龙', nameEn: 'Noivern', category: '飞行', category2: '龙', level: '稀有', classification: '音波宝可梦', height: '1.5m', weight: '85.0kg', description: '小智的嗡蝠进化型，用超音波在黑暗中定位，飞行时几乎无声。卡洛斯篇中它是小智阵容里最具速度感的一员。', image: '/pokemon/715.png' },

  // ============ 阿罗拉地区 ============
  { id: 38, number: '724', name: '狙射树枭', nameEn: 'Decidueye', category: '草', category2: '幽灵', level: '史诗', classification: '箭羽宝可梦', height: '1.6m', weight: '36.6kg', description: '小智的木木枭最终进化型。木木枭那股「圆滚滚却意外可靠」的气质，在进化后变成了沉稳的弓手，是小智阿罗拉夺冠阵容的一员。', image: '/pokemon/724.png' },
  { id: 39, number: '727', name: '炽焰咆哮虎', nameEn: 'Incineroar', category: '火', category2: '恶', level: '史诗', classification: '反派宝可梦', height: '1.8m', weight: '83.0kg', description: '小智的火斑喵最终进化型。曾是被遗弃的流浪猫，在小智身边学会信任，最终以职业摔角手般的姿态站上擂台。', image: '/pokemon/727.png' },
  { id: 40, number: '745', name: '鬃岩狼人', nameEn: 'Lycanroc', category: '岩石', category2: null, level: '史诗', classification: '狼宝可梦', height: '0.8m', weight: '25.0kg', description: '小智的岩狗狗进化成的稀有「黄昏形态」，紫红色鬃毛在晚霞中格外醒目。它是小智阿罗拉联盟夺冠的关键战力。', image: '/pokemon/745.png' },

  // ============ 伽勒尔 / 旅途 ============
  { id: 41, number: '865', name: '葱游兵', nameEn: "Sirfetch'd", category: '格斗', category2: null, level: '稀有', classification: '鸭宝可梦', height: '0.8m', weight: '117.0kg', description: '小智的大葱鸭历经无数败北后进化而成，手持大葱如长枪，盾牌是坚硬的羽翼。它象征着「百折不挠」的骑士精神。', image: '/pokemon/865.png' },
  { id: 42, number: '882', name: '鳃鱼龙', nameEn: 'Dracovish', category: '水', category2: '龙', level: '稀有', classification: '化石宝可梦', height: '2.3m', weight: '215.0kg', description: '由化石复原出的宝可梦，外形奇特却拥有惊人的咬合力。小智在伽勒尔收服的它，是世界冠军赛上令人意外的一手。', image: '/pokemon/882.png' },
  { id: 43, number: '815', name: '闪焰王牌', nameEn: 'Cinderace', category: '火', category2: null, level: '史诗', classification: '前锋宝可梦', height: '1.4m', weight: '33.0kg', description: '小豪的炎兔儿最终进化型，把火焰化作足球踢出，是伽勒尔篇最具运动感的身影。', image: '/pokemon/815.png' },

  // ============ 帕底亚（地平线） ============
  { id: 44, number: '906', name: '新叶喵', nameEn: 'Sprigatito', category: '草', category2: null, level: '普通', classification: '草猫宝可梦', height: '0.4m', weight: '4.1kg', description: '《地平线》新主角莉可的伙伴，前脚肉球能散发治愈香气。看似任性，却在关键时刻展现出与训练家之间的信任。', image: '/pokemon/906.png' },
  { id: 45, number: '909', name: '呆火鳄', nameEn: 'Fuecoco', category: '火', category2: null, level: '普通', classification: '火鳄宝可梦', height: '0.4m', weight: '9.8kg', description: '《地平线》罗伊的伙伴，圆滚滚的肚子上有火焰纹路，性格慢悠悠却总在关键时刻放出炽热的火苗。', image: '/pokemon/909.png' },
  { id: 46, number: '912', name: '润水鸭', nameEn: 'Quaxly', category: '水', category2: null, level: '普通', classification: '小鸭宝可梦', height: '0.5m', weight: '6.1kg', description: '帕底亚的御三家之一，羽毛分泌的凝胶能防水防污，非常爱干净。在《地平线》中作为飞升伏特攻击队一员的伙伴登场。', image: '/pokemon/912.png' }
]

/** 默认管理员（离线模式）—— 权限 0 */
export const DEFAULT_ADMIN = { id: 1, username: 'admin', password: '123456', role: 0 }
