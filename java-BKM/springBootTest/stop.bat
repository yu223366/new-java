@echo off
chcp 936 >nul
echo 停止后端服务（端口 8081）...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8081 " ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>nul
)
echo 已停止。
timeout /t 3 >nul
