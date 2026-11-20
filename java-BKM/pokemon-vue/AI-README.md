# AI 速读 · 精灵宝可梦图鉴项目启动备忘

> 写给 WorkBuddy / AI 助手：每次开机后照此文档执行即可，不要重新推导。
> 本机每次重启会重置系统，`node_modules` 和 `target` 会被删除，其余（桌面项目、MySQL 数据、~/.m2 仓库）保留。
> **启动方式已对齐 `D:/java_idea/java/java-main` 的 `.cmd` 脚本体系。**

## 项目结构（相对本文件）

```
pokemon-vue/                       # 前端 Vue3 + Vite（端口 5173，/api 代理到 8081）
├── src/
│   ├── api/index.js              # 双模式 API 层：探测后端，有→在线，无→本地
│   ├── data/
│   │   ├── fullDex.js            # 全国图鉴 1–1025（1025 条，自动抓取 PokeAPI/Showdown，中文名+分类+特性+种族值+进化链）
│   │   ├── dex.js                # ALL_DEX：全量图鉴，46 只用本地立绘/原著描述覆盖
│   │   ├── pokemon.js            # 内置 46 只动画原著宝可梦（本地立绘 + 原著剧情，玩法用）
│   │   ├── gameData.js           # 资料库：18属性克制表/50招式/22道具/22TM/8四天王/23剧场版/16道馆(关都+城都)/2联盟/3野外场景/46只扩展资料
│   │   ├── chapters.js           # 原著九大篇章（地图/馆主/主角团/反派/主线事件/名场面/旁白）
│   │   ├── gameStore.js          # 玩家存档 reactive+localStorage(键 pokemon_game_state_v2)：背包/徽章/蛋/药水/记录/收藏/进度/冠军
│   │   ├── battleEngine.js       # 回合制引擎：createBattleUnit/calcDamage/hitCheck/aiChooseMove/multText
│   │   └── localStore.js         # localStorage 模拟数据库（账号/图鉴 CRUD）
│   ├── router/index.js           # 13 条路由 + 权限守卫
│   ├── components/
│   │   ├── NavBar.vue            # 9 项统一顶部导航（含模式标签/收集进度/退出）
│   │   └── Captcha.vue           # 图形验证码(canvas，前端自校验，两种模式通用)
│   └── views/                    # Home/Pokedex/Categories/Lore/Adventure/Gyms/Battle/Tools/Trainer + 登录注册后台
├── public/pokemon/               # 46 张官方图鉴立绘 PNG（来源 assets.pokemon.com，已本地化）
├── .env.example                  # 可配置：端口/后端地址/强制模式
├── 一键启动.cmd                   # 双击：MySQL检查→后端(可选)→前端→等待就绪→开浏览器（GBK，勿转 UTF-8）
├── 启动-前端.cmd / 启动-后端.cmd   # 单独启动
├── 停止项目.cmd                   # 按端口杀进程（8081/5173）
├── _vite.log                     # 前端运行日志（脚本写入）
└── AI-README.md                  # 本文件

C:\Users\Administrator\Desktop\springBootTest\   # 后端（可选，桌面同级目录）
└── _run.log                      # 后端运行日志（脚本写入）
```

## 环境事实（已验证 2026-11-19）

- MySQL 8.4.8：客户端 `C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe`，root/123456，库 `pokemon_db`
- Java 17.0.12 在 PATH；Maven **不在 PATH**，在 `C:\Users\Administrator\.m2\wrapper\dists\apache-maven-3.9.9\3477a4f1\bin\mvn.cmd`（脚本自动递归探测）
- Node：系统可能在 PATH；WorkBuddy 托管 v22 在 `~/.workbuddy/binaries/node/...`；脚本按「PATH→托管→DevEco→常规目录」顺序探测
- 前端端口 5173，后端端口 8081
- 当前配置：无 `.env`；前后端已显式绑定本机局域网 IP `192.168.68.29`（`vite.config.js` 的 `host` + `package.json` 的 dev 脚本已去掉 `--host`；后端 `application.properties` 的 `server.address`）；访问地址 `http://192.168.68.29:5173` / `http://192.168.68.29:8081`。绑定后 localhost 不可用；数据库连接仍走 localhost（MySQL root 仅授权 localhost，勿改成 IP）。

## 关键坑（务必记住）

1. **`SERVER_PORT` 环境变量劫持**：WorkBuddy shell 环境里有 `SERVER_PORT` 变量，Spring Boot 宽松绑定会当成 `server.port`，覆盖配置。启动后端必须显式 `--server.port=8081`，并在 cmd 里先 `set SERVER_PORT=` 清空。
2. **前端双模式（2026-11-19 改造）**：`src/api/index.js` 探测后端（2.5s 超时）：有后端→在线；无后端→自动降级本地模式（内置数据 + localStorage）。所以**不启后端也能完整使用**，不要为了"跑起来"去折腾数据库。
3. **日志**：`_vite.log` / `_run.log` 由 cmd 重定向生成，可能是 UTF-16（含 NUL），读取前先去 NUL 或按 GBK/UTF-8 尝试。
4. **代理坑**：bash 环境有 `http_proxy`，curl 测本地接口必须 `--noproxy '*'`。
5. **前端「假就绪」**：Vite 即使模块解析失败（`Failed to resolve import`）也会监听 5173，只查端口会误判成功、页面却空白。`一键启动.cmd` 就绪后会扫 `_vite.log`，命中典型错误打印 `[异常]`；`启动-前端.cmd` 每次先删旧日志避免误报。
6. **jar 占用**：改后端代码后重新编译前需先停 8081 进程，否则 `mvn clean` 删不掉 jar。`启动-后端.cmd` 编译前会先停旧后端。
7. **bat/cmd 编码**：全部脚本为 **GBK 编码**，内部用相对路径/自动探测。修改时别存成 UTF-8，否则中文乱码。

## 启动方式（等价脚本）

```bash
# 方式1（推荐）：双击 一键启动.cmd
# 方式2：分别双击 启动-后端.cmd（可选）+ 启动-前端.cmd
# 方式3：手动命令
cd pokemon-vue
npm install --no-audit --no-fund   # node_modules 被删时才需要
npm run dev                        # http://192.168.68.29:5173

# 后端（可选，在线模式）
cd ../springBootTest
mvn clean package -DskipTests
set SERVER_PORT=
java -jar target/springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081
```

## 九大功能模块与玩法架构（2026-11-19 最终完整版）

| 路由 | 页面 | 数据来源 |
|---|---|---|
| `/home` | 首页（Banner/快捷入口/进度/简报/热门） | pokemonList + gameStore |
| `/pokedex` | 宝可梦图鉴（种族值/特性/进化链/形态/蛋群/招式/收藏） | pokemonList + POKEDEX_EXTRA |
| `/categories` | 分级分类（18属性/5稀有度/9地区/御三家/传说） | TYPES/RARITIES/REGIONS/STARTER_LINES |
| `/lore` | 原著资料库（8季动画/12人物/7反派/12剧场版/8名场面/9地区） | ANIME_SEASONS 等 |
| `/adventure` | 野外捕捉（4场景/精灵球/闪光/入背包） | WILD_ZONES + gameStore.catchPokemon |
| `/gyms` | 道馆挑战（8馆顺序解锁/回合制/徽章） | GYMS + battleEngine + addBadge |
| `/battle` | 玩家对战（匹配AI/同屏双人/记录） | battleEngine + logBattle |
| `/tools` | 工具百科（18×18克制表/招式/道具/TM） | TYPE_CHART/MOVES/ITEMS/TMS |
| `/trainer` | 个人中心（背包/徽章墙/孵化/培养/联盟/进度/记录） | gameStore 全套 |

> **原著数据规模**：图鉴 **全国 1–1025 全部 1025 只**（`fullDex.js` 自动抓取：中文名/中文分类/特性中文/种族值/完整进化链；46 只用本地立绘+原著描述覆盖）、**九大篇章**（关都→橘子群岛→丰缘→神奥→合众→卡洛斯→阿罗拉→伽勒尔→帕底亚）、剧场版 23 部（番外独立）、**道馆 16 座（关都 8 + 城都 8）**、2 套地区联盟、**3 个野外场景（草丛/山洞/水域）**、50 招式。
> 图片：本地已存 46 张；其余 979 张用官方图源 `https://assets.pokemon.com/assets/cms2/img/pokedex/full/{3位编号}.png` 远程加载，失败由 `PokeImg` 兜底问号图。**注意本机 GitHub raw 与 pokeapi.co 被墙，但 jsDelivr / play.pokemonshowdown.com / assets.pokemon.com 可达**（`pokedata/gen.mjs` 是重新生成脚本）。
> **硬性规则**：`BAG_MAX=60` 背包上限、同编号禁止重复收服、徽章去重、冠军奖励仅一次、HP 下限 0、`PokeImg` 图片兜底、Toast 代替 alert。**音效功能已整体移除**（无 audio.js / 无静音开关）。

**玩法状态都在 `gameStore.js`**：用 `reactive` + `watch(deep)` 自动写入 localStorage，刷新不丢失。
- 捕捉：`catchPokemon(p, zone, ball, shiny)` → 入背包 + 记录 + 更新进度
- 孵化：`addEgg(1)` 分钟 → 前端 `setInterval` 每秒刷新 `nowTick` 驱动倒计时 → `hatchEgg(egg)`
- 培养：`trainPokemon(uid)` 消耗 1 瓶药水，+1 级 / +4 HP上限 / +3 战力；`usePotion(uid, amt)` 回血
- 联盟：`game.badges.length >= 8` 解锁 → `clearLeagueStage()` ×5 → `becomeChampion()`
- 重置：`resetGame()` 只清玩法存档，不动登录账号

**对战引擎**：简化官方公式 —— `((2*Lv/5+2) * 威力 * 攻/防 / 50 + 2) × 属性倍率 × 随机0.85~1.0 × 会心1.5`，倍率来自 `typeMultiplier(攻击属性, 防守属性数组)`，双属性相乘。

## 验证方式（可复用）

- **构建**：`npm run build`
- **页面渲染冒烟**（推荐，能抓模板运行时错误）：写临时 `ssr-smoke.mjs`，`vite.createServer({server:{middlewareMode:true}})` + `ssrLoadModule('/src/views/Xxx.vue')` + `renderToString`，需先 mock `globalThis.localStorage`
- **逻辑单测**：`gameData.js` / `battleEngine.js` 无 Vue 依赖，可直接 Node import 测试（`package.json` 已 `"type":"module"`；注意 Node ESM 必须带 `.js` 扩展名，Vite 不要求）
- 本次结果：13 个页面 SSR 全通过 0 warning，40 项逻辑断言全通过

## 图形验证码（2026-11-19 新增）

- `src/components/Captcha.vue`：canvas 绘制 4 位验证码，含干扰线/噪点/字符旋转，点击图片刷新
- 用于**独立注册页**和**登录页的注册 tab**（登录本身不需要验证码）
- 纯前端校验（`validate()` 不区分大小写、去空格），不依赖后端，在线/本地双模式都生效
- 校验失败自动清空输入并刷新验证码；切换登录/注册 tab 也会刷新

## 账号与权限

- 管理员 `admin / 123456`（role=0）：可见后台按钮、可登录后台
- 注册用户默认 role=1：看不到后台按钮、无法登录后台（返回 401）
- 密码明文不加密（本地模式数据存浏览器 localStorage，管理员也是 admin/123456）

## 接口清单（在线模式，后端 8081）

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/user/register` | POST | 注册，默认 role=1 |
| `/api/user/login` | POST | 登录，返回含 role |
| `/api/admin/login` | POST | 管理员登录，仅 role=0，否则 401 |
| `/api/pokemon/list` | GET | 全部 |
| `/api/pokemon/search?keyword=&category=&level=` | GET | 分级分类搜索（含双属性、编号） |
| `/api/pokemon` / PUT / DELETE | 增改删（后台） |

## 后端自测（在线模式）

```bash
curl -s --noproxy '*' -X POST http://192.168.68.29:8081/api/user/register -H "Content-Type: application/json" -d '{"username":"testuser","password":"123456"}'
curl -s --noproxy '*' -X POST http://192.168.68.29:8081/api/user/login -H "Content-Type: application/json" -d '{"username":"testuser","password":"123456"}'
```
