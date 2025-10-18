#!/bin/bash

# AI Travel 部署脚本
# 用于快速部署到生产环境

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel"
CONTAINER_NAME="ai-travel-prod"
PORT="3000"

echo -e "${GREEN}🚀 开始部署 AI Travel 应用...${NC}"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，请先安装 Docker${NC}"
    exit 1
fi

# 拉取最新镜像
echo -e "${YELLOW}📦 拉取最新镜像...${NC}"
docker pull ${IMAGE_NAME}:latest

# 停止并删除旧容器
echo -e "${YELLOW}🛑 停止旧容器...${NC}"
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# 运行新容器
echo -e "${YELLOW}🏃 启动新容器...${NC}"
docker run -d \
  --name ${CONTAINER_NAME} \
  -p ${PORT}:3000 \
  --restart unless-stopped \
  -e NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://your-project.supabase.co}" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-your-supabase-anon-key}" \
  -e OPENAI_API_KEY="${OPENAI_API_KEY:-sk-your-zhipu-api-key}" \
  -e NEXT_PUBLIC_AMAP_KEY="${NEXT_PUBLIC_AMAP_KEY:-your-amap-api-key}" \
  -e NEXT_PUBLIC_IFLYTEK_APP_ID="${NEXT_PUBLIC_IFLYTEK_APP_ID:-your-iflytek-app-id}" \
  -e NEXT_PUBLIC_IFLYTEK_API_KEY="${NEXT_PUBLIC_IFLYTEK_API_KEY:-your-iflytek-api-key}" \
  -e NEXT_PUBLIC_IFLYTEK_API_SECRET="${NEXT_PUBLIC_IFLYTEK_API_SECRET:-your-iflytek-api-secret}" \
  -e NEXT_PUBLIC_UNSPLASH_ACCESS_KEY="${NEXT_PUBLIC_UNSPLASH_ACCESS_KEY:-your-unsplash-access-key}" \
  -e NODE_ENV=production \
  ${IMAGE_NAME}:latest

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 10

# 健康检查
echo -e "${YELLOW}🏥 执行健康检查...${NC}"
if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 部署成功！应用已启动在 http://localhost:${PORT}${NC}"
    echo -e "${GREEN}📊 容器状态:${NC}"
    docker ps --filter name=${CONTAINER_NAME}
else
    echo -e "${RED}❌ 健康检查失败，请检查日志${NC}"
    echo -e "${YELLOW}📋 容器日志:${NC}"
    docker logs ${CONTAINER_NAME}
    exit 1
fi

echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${YELLOW}💡 常用命令:${NC}"
echo -e "  查看日志: docker logs -f ${CONTAINER_NAME}"
echo -e "  停止服务: docker stop ${CONTAINER_NAME}"
echo -e "  重启服务: docker restart ${CONTAINER_NAME}"
