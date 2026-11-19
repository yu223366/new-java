@echo off
chcp 936 >nul
rem 兼容旧入口：转发到新版一键启动（会自动打开浏览器）
call "%~dp0一键启动.cmd"
