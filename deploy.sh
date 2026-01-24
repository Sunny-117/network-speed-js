#!/usr/bin/env sh

# 终止脚本遇到错误
set -e

echo "🚀 开始构建 Demo..."

# 构建 Demo
npm run build:demo

echo "✅ 构建完成！"

# 进入构建输出目录
cd dist-demo

echo "📦 初始化 Git 仓库..."

# 初始化 git 仓库并设置默认分支为 main
git init -b main
git add -A
git commit -m '🚀 Deploy to GitHub Pages'

echo "🌐 部署到 GitHub Pages..."

# 部署到 GitHub Pages
# 格式: git push -f git@github.com:<USERNAME>/<REPO>.git main:gh-pages
git push -f https://github.com/Sunny-117/network-speed-js.git main:gh-pages

echo "✨ 部署成功！"
echo "🔗 访问地址: https://sunny-117.github.io/network-speed-js/"

cd -