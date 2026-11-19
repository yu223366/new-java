@echo off
chcp 936 >nul
title 初始化数据库 pokemon_game
echo ============================================================
echo   初始化数据库 pokemon_game（13 张表 + 完整图鉴 1025 只）
echo ============================================================
echo.

set "MYSQL="
if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" set "MYSQL=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if not defined MYSQL if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not defined MYSQL if exist "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" set "MYSQL=C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"

if not defined MYSQL (
    where mysql >nul 2>nul
    if not errorlevel 1 set "MYSQL=mysql"
)

if not defined MYSQL (
    echo [错误] 未找到 MySQL，请确认已安装 MySQL 并加入 PATH
    pause
    exit /b 1
)

echo [1/2] 执行建库脚本 sql\pokemon_game.sql ...
"%MYSQL%" -uroot -p123456 --default-character-set=utf8mb4 < "%~dp0sql\pokemon_game.sql"
if errorlevel 1 (
    echo [失败] 建库出错，请确认 MySQL 已启动、账号 root / 123456 正确
    pause
    exit /b 1
)

echo [2/2] 导入全国图鉴 1025 只 sql\t_pokemon_data.sql ...
"%MYSQL%" -uroot -p123456 --default-character-set=utf8mb4 pokemon_game < "%~dp0sql\t_pokemon_data.sql"
if errorlevel 1 (
    echo [失败] 图鉴数据导入出错
    pause
    exit /b 1
)

echo.
echo [完成] 数据库 pokemon_game 已初始化（管理员 admin / 123456，图鉴 1025 只）
echo [说明] 以后在任何电脑上：先运行本脚本建库，再启动后端即可自动连接本地 MySQL
echo.
timeout /t 6 >nul
