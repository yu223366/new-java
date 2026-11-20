# AI_START_HERE.md —— 宝可梦项目快速启动提醒（AI 必读）

> 本文件是给 AI 看的"备忘单"。每次电脑重置后，AI 读这一份即可完成全部启动，不要重复探索环境。
> 用户偏好：中文沟通、结构化输出、直接交付可运行成果、少追问。

## ⚠️ 最重要：项目已改造为「双模式通用版」

前端已支持**无后端独立运行**（2026-11-19）：
- `src/api/index.js` 会探测后端：有后端→在线模式；无后端→自动降级本地模式
- `src/data/pokemon.js` 内置 12 只宝可梦完整数据
- `src/data/localStore.js` 用 localStorage 模拟用户注册/登录/权限/宝可梦 CRUD
- 所以在**任何环境**只要 `npm install && npm run dev` 就能完整使用，不依赖后端/MySQL/Maven
- `.env.example` 可配置端口、后端地址、强制模式；详见 README.md
- 首页右上角有模式标识：绿色`● 在线` / 黄色`● 本地模式`
- 若用户只是想看网页/演示，直接启动前端即可，无需折腾后端和数据库

## 一、项目清单与固定路径（不要改）

| 项 | 路径 |
|---|---|
| 前端 Vue3+Vite | `C:\Users\Administrator\Desktop\pokemon-vue` |
| 后端 SpringBoot | `C:\Users\Administrator\Desktop\springBootTest` |
| SQL 文件 | `C:\Users\Administrator\Desktop\springBootTest\sql\pokemon.sql` |
| 一键启动脚本 | `C:\Users\Administrator\Desktop\一键启动宝可梦项目.bat`（GBK） |
| 一键停止脚本 | `C:\Users\Administrator\Desktop\一键停止宝可梦项目.bat`（GBK） |

## 二、本机环境（已探测确认，无需重复查）

- **Java**：17.0.12（在 PATH）
- **Node**：22.22.2，**npm**：10.9.7（在 PATH）
- **Maven**：**不在 PATH**！路径为
  `C:\Users\Administrator\.m2\wrapper\dists\apache-maven-3.9.9\3477a4f1\bin\mvn.cmd`
  （start.bat 已自动递归探测 `.m2\wrapper\dists` 下的 mvn.cmd）
- **MySQL**：8.4.8，客户端 `C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe`
  - 用户名 `root` 密码 `123456`
  - 库 `pokemon_db`，表 `t_user`、`t_pokemon`
- **代理坑**：bash 里有 `http_proxy`，用 curl 测本地接口必须加 `--noproxy '*'`
- **端口坑**：环境变量 `SERVER_PORT` 会覆盖 SpringBoot 配置 → 启动必须显式 `--server.port=8081`

## 三、一键启动（推荐，最简单）

直接让用户**双击** `C:\Users\Administrator\Desktop\一键启动宝可梦项目.bat`。
它会自动：打开【后端窗口】(停止旧服务→编译→java -jar 8081) 和【前端窗口】(依赖存在则跳过安装→npm run dev 5173)，并自动打开浏览器。

**用户反馈"卡在 cmd 页面"的真相**：服务窗口本来就会一直显示日志停在那里（java/npm 是前台常驻命令），这是正常的，不是卡住！只要窗口里出现 `Started SpringBootTestApplication`(后端) 和 `Network: http://192.168.68.29:5173/`(前端) 就是成功了，直接看浏览器即可。脚本已优化：依赖存在时跳过 npm install(不再等4分钟)、自动开浏览器、无多余 pause 嵌套。若浏览器没自动开，手动访问 http://192.168.68.29:5173（当前前后端已绑定本机 IP 192.168.68.29，绑定后不再显示 `Local:` 且 localhost 不可用）。

若需 AI 用命令行启动（注意后台进程需用工具的后台任务机制，普通 `&` 会被回收）：

```bash
# 后端（用 run_in_background 方式，显式端口）
cd "C:/Users/Administrator/Desktop/springBootTest"
SERVER_PORT= java -jar target/springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081

# 前端
cd "C:/Users/Administrator/Desktop/pokemon-vue"
npm install
npm run dev
```

## 四、每次重置后 node_modules、target 被删除怎么办

- **前端**：start.bat 里每次都跑 `npm install`，会自动重建 node_modules
- **后端**：start.bat 里每次都跑 `mvn clean package -DskipTests`，会自动重建 target 和 jar
- Maven 依赖缓存在 `%USERPROFILE%\.m2\repository`，重置不清，所以二次编译很快
- 若 MySQL 数据也没了：双击 `springBootTest\初始化数据库.bat`（导入 sql\pokemon.sql）

## 五、账号与权限

- **管理员**：`admin` / `123456`，role=0 → 首页显示"后台管理系统"按钮，可登录后台
- **普通用户**：注册即得 role=1 → 看不到后台按钮，也无法登录后台（接口返回 401）
- 密码**明文**存储，不加密
- 后台登录页：`/admin-login`（只有登录，无注册）；后台数据管理：`/admin`

## 六、接口清单（后端 8081）

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/user/register` | POST | 注册，body `{username,password}`，默认 role=1 |
| `/api/user/login` | POST | 登录，返回用户信息含 role |
| `/api/admin/login` | POST | 管理员登录，仅 role=0 通过，否则 401 |
| `/api/pokemon/list` | GET | 全部宝可梦 |
| `/api/pokemon/search?keyword=&category=&level=` | GET | 分级分类搜索（category 属性含双属性匹配、level 稀有度） |
| `/api/pokemon` | POST | 新增（后台） |
| `/api/pokemon` | PUT | 修改（后台） |
| `/api/pokemon/{id}` | DELETE | 删除（后台） |

## 七、后端自测（已通过，可复现）

```bash
# 注册 → 用注册账号登录 → 成功即后端完成
curl -s --noproxy '*' -X POST http://192.168.68.29:8081/api/user/register -H "Content-Type: application/json" -d '{"username":"testuser123","password":"abc123"}'
curl -s --noproxy '*' -X POST http://192.168.68.29:8081/api/user/login -H "Content-Type: application/json" -d '{"username":"testuser123","password":"abc123"}'
```

## 八、前端页面

- `/login` 登录、`/register` 注册
- `/home` 首页（搜索栏、导航栏、图鉴卡片、分级分类筛选、后台按钮仅管理员可见、点击卡片看详情弹窗）
- `/admin-login` 后台登录、`/admin` 后台数据管理（增删改查，支持双属性）
- 前端通过 vite 代理 `/api` → `http://192.168.68.29:8081`

## 九、动漫原著还原（2026-11-19 更新）

本项目已按《精灵宝可梦》动漫原著还原：
- **官方立绘**：12 张官方图鉴大图存于 `pokemon-vue\public\pokemon\`（编号 001/003/004/006/007/009/025/026/094/133/143/150.png），来源是 `assets.pokemon.com/assets/cms2/img/pokedex/full/<编号>.png`
- **原著设定**：数据含全国图鉴编号、英文名、双属性（如喷火龙=火+飞行、妙蛙种子=草+毒）、分类、身高体重、原著风格图鉴介绍
- **官方配色**：皮卡丘黄 #FFCB05(Pantone 7408C)、精灵球红 #EE1515、图鉴蓝 #3B4CCA，属性色卡取官方设定
- **图片源可达性**：`assets.pokemon.com` 与 `cdn.jsdelivr.net/gh/PokeAPI/sprites` 可下载；`raw.githubusercontent.com` 不通
- **新增宝可梦方法**：下载 `<编号>.png` 到 public/pokemon/，数据库 image 填 `/pokemon/<编号>.png`，属性填官方属性；可在后台管理页直接增删改
- **jar 占用**：改了后端代码重新编译前需先停 8081 端口进程；start.bat 已内置"自动停止旧后端"逻辑

## 十、已知注意事项

1. 后端必须用 `--server.port=8081` 启动，否则会被 `SERVER_PORT=57814` 环境变量带偏
2. curl 测本地必须 `--noproxy '*'`，否则走代理连接被拒
3. bat 脚本是 GBK 编码，内部全用相对路径（`%~dp0`），改脚本时别存成 UTF-8 否则中文乱码
4. 数据库密码 123456 出现在：application.properties、sql 注释、初始化数据库.bat
5. 本备忘单若丢失，用 AI 重新生成即可（内容即上文）
