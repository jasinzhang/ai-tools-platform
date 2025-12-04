#!/bin/bash
# Cursor IDE 代理启动助手

echo "🚀 启动 Cursor IDE（使用代理）"
echo "================================"
echo ""

# 设置代理环境变量
export HTTP_PROXY=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897

echo "✅ 代理已设置: http://127.0.0.1:7897"
echo ""

# 检查 Clash 是否运行
if curl -s --max-time 2 http://127.0.0.1:7897 > /dev/null 2>&1; then
    echo "✅ Clash 代理正在运行"
else
    echo "⚠️  警告: Clash 代理可能未运行"
    echo "   请确保 Clash 已启动，端口为 7897"
fi

echo ""
echo "🚀 正在启动 Cursor..."
echo ""

# 启动 Cursor
open -a Cursor

echo ""
echo "✅ Cursor 已启动"
echo ""
echo "💡 提示: 如果 Cursor AI 仍然不可用，"
echo "   可以使用项目中的 Gemini API:"
echo "   npm start"
echo "   然后访问: http://localhost:3000"
