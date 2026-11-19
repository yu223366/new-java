@echo off
chcp 936 >nul
setlocal
rem ============================================================
rem  启动前端 pokemon-vue（Vite，端口 5173）
rem  node_modules 每次开机会被删除，脚本会先检测并重装依赖。
rem  前端为双模式：后端可用则在线，否则自动用内置数据（本地模式）。
rem ============================================================
cd /d "%~dp0"

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo [跳过] 前端已在 5173 端口运行，直接打开浏览器。
    goto open_browser
)

rem 定位 npm：优先 PATH，其次自动探测本机常见的 Node 安装位置。
rem 换机器/换版本都不用改脚本。
set "NODE_DIR="
where npm >nul 2>nul
if not errorlevel 1 goto npm_ready

for /f "delims=" %%F in ('dir /b /s "%USERPROFILE%\.workbuddy\binaries\node\npm.cmd" 2^>nul') do if not defined NODE_DIR set "NODE_DIR=%%~dpF"
if not defined NODE_DIR if exist "D:\DevEco Studio\tools\node\npm.cmd" set "NODE_DIR=D:\DevEco Studio\tools\node\"
if not defined NODE_DIR if exist "D:\Program Files\nodejs\npm.cmd" set "NODE_DIR=D:\Program Files\nodejs\"
if not defined NODE_DIR if exist "C:\Program Files\nodejs\npm.cmd" set "NODE_DIR=C:\Program Files\nodejs\"
if not defined NODE_DIR if exist "%APPDATA%\nvm\npm.cmd" set "NODE_DIR=%APPDATA%\nvm\"

if not defined NODE_DIR (
    echo [错误] 找不到 npm，请确认 Node.js 已安装。
    pause
    exit /b 1
)
set "PATH=%NODE_DIR%;%PATH%"
:npm_ready
if defined NODE_DIR echo [信息] 已自动定位 Node 目录：%NODE_DIR%

if not exist node_modules (
    echo [安装] node_modules 不存在，正在安装依赖（首次约 1-3 分钟）...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo [错误] 依赖安装失败。
        pause
        exit /b 1
    )
)

echo [启动] 前端开发服务器启动中...
rem 清空旧日志：避免上一次的报错混进本次排查
if exist "_vite.log" del /f /q "_vite.log" >nul 2>&1
start "pokemon-frontend" /min cmd /c "npm run dev > _vite.log 2>&1"
echo [完成] 前端已在后台启动，日志：pokemon-vue\_vite.log

:open_browser
rem 若调用方传了 NOBROWSER 参数（如一键启动自己会跳转），则此处不再重复打开
if /i "%~1"=="NOBROWSER" (
    echo [信息] 浏览器跳转由调用方负责，本脚本跳过。
    exit /b 0
)
rem 等待 5173 就绪后再打开浏览器（最多约 1 分钟），避免打开时服务还没起来
echo [等待] 正在等待前端就绪并打开浏览器...
set /a W=0
:wait_browser
set /a W+=1
if %W% gtr 12 goto open_now
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if errorlevel 1 (
    ping -n 3 127.0.0.1 >nul
    goto wait_browser
)
:open_now
start "" "http://localhost:5173"
echo [完成] 已打开浏览器：http://localhost:5173
exit /b 0
