#!/bin/bash
echo ""
echo "============================================"
echo "  红色文化旅游路线图 - 启动中..."
echo "  探寻苏区最后的阵地"
echo "============================================"
echo ""

if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[错误] 未找到 Python，请先安装 Python 3"
    echo "下载地址: https://www.python.org/downloads/"
    exit 1
fi

cd "$(dirname "$0")"

echo "[启动] 服务器地址: http://localhost:8080"
echo "[提示] 浏览器将自动打开"
echo "[提示] 按 Ctrl+C 停止服务器"
echo ""

# Open browser (cross-platform)
if command -v open &> /dev/null; then
    open http://localhost:8080
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080
fi

python3 server.py 2>/dev/null || python server.py
