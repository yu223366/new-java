@echo off
chcp 936 >nul
title 宝可梦后端服务 - 端口8081
cd /d "%~dp0"
echo ============================================================
echo   精灵宝可梦 后端服务 (SpringBoot + MyBatis-Plus)
echo ============================================================
echo.

echo [1/4] 查找 Maven...
set "MVN_CMD="
for /r "%USERPROFILE%\.m2\wrapper\dists" %%f in (mvn.cmd) do (
    if not defined MVN_CMD set "MVN_CMD=%%f"
)
if not defined MVN_CMD (
    where mvn >nul 2>nul
    if %errorlevel%==0 set "MVN_CMD=mvn"
)
if not defined MVN_CMD (
    echo [错误] 未找到 Maven，请把 mvn 加入 PATH。
    pause
    exit /b 1
)

echo [2/4] 停止旧后端（若在运行）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081 " ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo [3/4] 编译打包（首次约1分钟，请耐心等待）...
if not exist "target\springBootTest-0.0.1-SNAPSHOT.jar" (
    call "%MVN_CMD%" clean package -DskipTests -q
) else (
    call "%MVN_CMD%" package -DskipTests -q
)
if not exist "target\springBootTest-0.0.1-SNAPSHOT.jar" (
    echo [错误] 编译失败，请看上方报错。
    pause
    exit /b 1
)

echo [4/4] 启动后端服务（端口 8081）...
echo ------------------------------------------------------------
echo  看到 "Started SpringBootTestApplication" 即启动成功
echo  此窗口不要关闭！关闭窗口 = 停止后端服务
echo ------------------------------------------------------------
echo.
set SERVER_PORT=
java -jar target\springBootTest-0.0.1-SNAPSHOT.jar --server.port=8081
