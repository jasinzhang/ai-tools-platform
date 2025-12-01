#!/bin/bash

echo "🚀 启动 AI Tools 平台服务器..."
echo ""

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 检测到缺少依赖，正在安装..."
    npm install
    echo ""
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，正在从模板创建..."
    cp env.example .env
    echo "✅ 已创建 .env 文件，请配置你的 API 密钥"
    echo ""
fi

# 检查端口是否被占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  端口 3000 已被占用"
    echo "正在尝试停止占用端口的进程..."
    kill $(lsof -t -i:3000) 2>/dev/null
    sleep 2
fi

echo "✅ 准备启动服务器..."
echo ""
echo "📱 服务器将在以下地址启动："
echo "   http://localhost:3000"
echo ""
echo "🔧 按 Ctrl+C 停止服务器"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 启动服务器
node server.js

