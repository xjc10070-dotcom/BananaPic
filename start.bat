@echo off
chcp 65001 >nul 2>&1
title Nano Banana 图片生成器

echo ========================================
echo   🍌 Nano Banana 图片生成器 - 一键启动
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查运行环境...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ 未检测到 Node.js
    echo.
    echo 请先安装 Node.js v18+:
    echo   访问 https://nodejs.org 下载安装
    echo.
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%v in ('node -v 2^>nul') do (
    set NODE_MAJOR=%%v
)
set NODE_MAJOR=%NODE_MAJOR:v=%

if %NODE_MAJOR% lss 18 (
    echo ✗ Node.js 版本过低，需要 v18+
    pause
    exit /b 1
)

echo ✓ Node.js
echo ✓ npm
echo.

echo [2/3] 检查项目依赖...

if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ✗ 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
    echo ✓ 依赖安装完成
) else (
    echo ✓ 依赖已就绪
)
echo.

echo [3/3] 构建并启动...

if not exist "dist" (
    echo 首次运行，正在构建...
    call npx vite build
    if %errorlevel% neq 0 (
        echo ✗ 构建失败，尝试开发模式启动...
        echo.
        echo ========================================
        echo   🚀 开发服务器启动成功！
        echo ========================================
        echo.
        echo   打开浏览器访问: http://localhost:5173
        echo.
        echo   首次使用请点击右上角 [配置] 设置 API Key
        echo   按 Ctrl+C 停止服务器
        echo.
        call npx vite --host
        exit /b 0
    )
    echo ✓ 构建完成
)

echo.
echo ========================================
echo   🚀 服务器启动成功！
echo ========================================
echo.
echo   打开浏览器访问: http://localhost:3000
echo.
echo   首次使用请点击右上角 [配置] 设置 API Key
echo   按 Ctrl+C 停止服务器
echo.

node server.cjs
