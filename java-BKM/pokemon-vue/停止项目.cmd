@echo off
chcp 936 >nul
setlocal
rem ============================================================
rem  停止宝可梦项目：按端口结束后端(8081)与前端(5173)
rem ============================================================
echo [停止] 正在结束前端 (5173) ...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)
echo [停止] 正在结束后端 (8081) ...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>nul
)
echo [完成] 项目已停止。
