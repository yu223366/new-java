@echo off
chcp 936 >nul
setlocal
rem ============================================================
rem  启动后端 springBootTest（端口 8081）—— 可选
rem  前端是双模式：不启后端也能完整使用（本地模式）。
rem  仅当你需要连接真实 MySQL 数据库时才需要启动本后端。
rem ============================================================
set "BE_DIR=%~dp0..\springBootTest"
cd /d "%BE_DIR%" 2>nul
if errorlevel 1 (
    echo [跳过] 未找到同级 springBootTest 后端目录，前端将以本地模式运行。
    exit /b 0
)

netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if not errorlevel 1 (
    echo [跳过] 后端已在 8081 端口运行。
    exit /b 0
)

rem 清空 SERVER_PORT / SERVER__PORT，避免环境变量劫持端口
set "SERVER_PORT="
set "SERVER__PORT="

rem 定位 Maven：优先 mvn，其次递归探测 .m2 已解压的 mvn.cmd
set "MVN_CMD="
where mvn >nul 2>nul
if not errorlevel 1 set "MVN_CMD=mvn"
if not defined MVN_CMD for /f "delims=" %%F in ('dir /b /s "%USERPROFILE%\.m2\wrapper\dists\*\bin\mvn.cmd" 2^>nul') do if not defined MVN_CMD set "MVN_CMD=%%F"
if not defined MVN_CMD (
    echo [警告] 未找到 Maven，跳过后端。前端仍可用本地模式运行。
    exit /b 0
)
echo [信息] Maven: %MVN_CMD%

echo [编译] 正在编译后端（target 若被删会自动重建，约 30 秒）...
call "%MVN_CMD%" clean package -DskipTests -q
if not exist "target\springBootTest-0.0.1-SNAPSHOT.jar" (
    echo [警告] 后端编译失败，前端仍可用本地模式运行。
    exit /b 0
)

echo [启动] 后端服务启动中（端口 8081）...
if exist "_run.log" del /f /q "_run.log" >nul 2>&1
start "pokemon-backend" /min cmd /c "set SERVER_PORT=&& set SERVER__PORT=&& java -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081 > _run.log 2>&1"
echo [完成] 后端已在后台启动，日志：springBootTest\_run.log
exit /b 0
