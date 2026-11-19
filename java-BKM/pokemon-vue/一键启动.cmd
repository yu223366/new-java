@echo off
chcp 936 >nul
setlocal
rem ============================================================
rem  精灵宝可梦图鉴 · 一键启动
rem  开机后双击本文件即可。详见 AI-README.md
rem  前端为双模式：无后端也能完整运行。
rem ============================================================
echo ========== 1/4 探测 MySQL (3306) ==========
netstat -ano | findstr ":3306" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [提示] 未检测到 MySQL，前端将使用内置数据（本地模式），不影响使用。
) else (
    echo [正常] MySQL 正在监听 3306。
)

echo ========== 2/4 启动后端（可选，用于在线模式） ==========
call "%~dp0启动-后端.cmd"

echo ========== 3/4 启动前端 ==========
rem 传 NOBROWSER：由本脚本统一在末尾打开浏览器，避免重复开标签页
call "%~dp0启动-前端.cmd" NOBROWSER

echo ========== 4/4 等待前端就绪（最多 2 分钟） ==========
set /a N=0
:wait_loop
set /a N+=1
if %N% gtr 24 goto wait_done
ping -n 6 127.0.0.1 >nul
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if errorlevel 1 goto wait_loop
:wait_done

netstat -ano | findstr ":8081" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [本地模式] 后端未启动，前端使用内置数据。右上角显示"本地模式"即正常。
) else (
    echo [就绪] 后端  http://localhost:8081
)
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo [警告] 前端 5173 未就绪，请查看 _vite.log
) else (
    echo [就绪] 前端  http://localhost:5173
    start "" "http://localhost:5173"
    echo [完成] 已打开浏览器：http://localhost:5173
)

rem 前端「假就绪」排查：Vite 模块解析失败也会监听 5173，需扫日志确认
set "VITE_LOG=%~dp0_vite.log"
if exist "%VITE_LOG%" (
    findstr /i /c:"Failed to resolve import" /c:"Internal server error" /c:"Pre-transform error" "%VITE_LOG%" >nul
    if not errorlevel 1 (
        echo [异常] 前端已监听端口，但页面编译报错（多为缺文件或路径写错）。
        echo [异常] 详见 _vite.log
    )
)
echo.
echo 提示：局域网访问请用 http://本机IP:5173 （本机执行 ipconfig 查 IP）
pause
