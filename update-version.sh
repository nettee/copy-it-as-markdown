#!/bin/bash

# 检查参数数量
if [ "$#" -lt 1 ]; then
  echo "用法: $0 <版本号> [标题]"
  echo "示例: $0 1.0.3 '新功能发布'"
  exit 1
fi

# 获取版本号和标题
VERSION=$1
shift  # 移除第一个参数（版本号）
TITLE="$*"  # 将剩余所有参数作为标题

# 检查版本号格式
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "错误: 版本号格式必须为 x.y.z"
  exit 1
fi

# 更新 manifest.json 中的版本号
echo "正在更新 manifest.json 中的版本号为 $VERSION..."
sed -i '' "s/\"version\": \"[0-9]*\.[0-9]*\.[0-9]*\"/\"version\": \"$VERSION\"/" manifest.json

# 检查 manifest.json 更新是否成功
if grep -q "\"version\": \"$VERSION\"" manifest.json; then
  echo "manifest.json 更新成功"
else
  echo "错误: manifest.json 更新失败"
  exit 1
fi

# 提交更改
git add manifest.json
git commit -m "Bump version to $VERSION"

# 创建 git 标签
if [ -n "$TITLE" ]; then
  # 如果有标题，创建带标题的标签，将空格替换为连字符
  SAFE_TITLE=$(echo "$TITLE" | tr ' ' '-')
  TAG_NAME="v$VERSION-$SAFE_TITLE"
  git tag "$TAG_NAME"
  echo "已创建标签: $TAG_NAME"
else
  # 如果没有标题，只创建版本号标签
  git tag "v$VERSION"
  echo "已创建标签: v$VERSION"
fi

echo "完成！"
echo "请执行 'git push && git push --tags' 来推送更改和标签"