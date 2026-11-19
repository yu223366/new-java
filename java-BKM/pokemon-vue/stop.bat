@echo off
chcp 936 >nul
rem 兼容旧入口：转发到新版停止脚本
call "%~dp0停止项目.cmd"
