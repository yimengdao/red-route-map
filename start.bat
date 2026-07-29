@echo off
chcp 65001 >nul
title 红色文化旅游路线图

echo.
echo ============================================
echo   红色文化旅游路线图 - 启动中...
echo   探寻苏区最后的阵地
echo ============================================
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python 3
    echo 下载地址: https://www.python.org/downloads/
    echo 安装时请勾选 "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"
echo [启动] 服务器地址: http://localhost:8080
echo [提示] 浏览器将自动打开
echo [提示] 关闭此窗口即可停止服务器
echo.

start http://localhost:8080
python server.py
pause
