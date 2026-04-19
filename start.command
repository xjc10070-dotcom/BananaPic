#!/bin/bash

echo "========================================"
echo "  🍌 Nano Banana 图片生成器 - 一键启动"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}[1/3] 检查运行环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ 未检测到 Node.js${NC}"
    echo ""
    echo "请先安装 Node.js (v18+):"
    echo "  方式一：访问 https://nodejs.org 下载安装"
    echo "  方式二：brew install node"
    echo ""
    echo "安装完成后重新运行此脚本"
    read -p "按 Enter 键退出..."
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 版本过低: $(node -v)，需要 v18+${NC}"
    echo "请访问 https://nodejs.org 升级 Node.js"
    read -p "按 Enter 键退出..."
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ 未检测到 npm${NC}"
    echo "npm 通常随 Node.js 一起安装，请检查安装"
    read -p "按 Enter 键退出..."
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v)${NC}"
echo ""

echo -e "${CYAN}[2/3] 检查项目依赖...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}首次运行，正在安装依赖...${NC}"
    npm install --cache /tmp/npm-nano-banana-cache 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ 依赖安装失败，尝试清理缓存重试...${NC}"
        rm -rf node_modules
        npm install --cache /tmp/npm-nano-banana-cache-2 2>&1
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ 依赖安装失败，请检查网络连接${NC}"
            read -p "按 Enter 键退出..."
            exit 1
        fi
    fi
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 依赖已就绪${NC}"
fi
echo ""

echo -e "${CYAN}[3/3] 构建并启动...${NC}"

if [ ! -d "dist" ]; then
    echo -e "${YELLOW}首次运行，正在构建...${NC}"
    npx vite build 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ 构建失败，尝试开发模式启动...${NC}"
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  🚀 开发服务器启动成功！${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo -e "  打开浏览器访问: ${YELLOW}http://localhost:5173${NC}"
        echo ""
        echo "  首次使用请点击右上角 [配置] 设置 API Key"
        echo "  按 Ctrl+C 停止服务器"
        echo ""
        npx vite --host
        exit 0
    fi
    echo -e "${GREEN}✓ 构建完成${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🚀 服务器启动成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  打开浏览器访问: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo "  首次使用请点击右上角 [配置] 设置 API Key"
echo "  按 Ctrl+C 停止服务器"
echo ""

node server.cjs
