仓库链接：https://github.com/JJZNDNSH/ai-travel


# AI 旅行规划应用

一个基于 AI 的智能旅行规划应用，通过语音和文字输入了解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

## 🚀 快速开始

### 方式一：Docker 运行


# 1. 拉取最新镜像
docker pull crpi-ppzaquo8yzy4dm4g.cn-hangzhou.personal.cr.aliyuncs.com/jjzndnsh/ai-travel


```bash
# 2.拉取并运行 Docker 镜像
docker run -d \
  --name ai-travel \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key" \
  -e OPENAI_API_KEY="sk-your-zhipu-api-key" \
  -e NEXT_PUBLIC_AMAP_KEY="your-amap-api-key" \
  crpi-ppzaquo8yzy4dm4g.cn-hangzhou.personal.cr.aliyuncs.com/jjzndnsh/ai-travel:latest

# 3. 查看日志
docker logs -f ai-travel-prod



验证：用该方式在虚拟机上运行时，宿主机访问时无法使用浏览器自带的语音功能和定位功能（如果要使用这些功能需要用https访问），因此须在本地运行该镜像（浏览器安全规则）
```

访问 http://localhost:3000/login 查看应用。

### 方式二：本地开发

```bash
# 克隆项目
git clone https://github.com/JJZNDNSH/ai-travel.git
cd ai-travel

# 安装依赖
npm install

# 配置环境变量
cp env.example .env.local

# 启动开发服务器
npm run dev
```

## 📦 Docker 镜像

**阿里云镜像仓库地址：**
```
crpi-ppzaquo8yzy4dm4g.cn-hangzhou.personal.cr.aliyuncs.com/jjzndnsh/ai-travel
```

**拉取命令：**
```bash
docker pull crpi-ppzaquo8yzy4dm4g.cn-hangzhou.personal.cr.aliyuncs.com/jjzndnsh/ai-travel
```

## 🔑 API 密钥配置

### 智谱AI API（3个月内有效）
```
API Key: sk-your-zhipu-api-key-here
```

### 高德地图 API（3个月内有效）
```
API Key: your-amap-api-key-here
```

supbase创建表格在下面



## 🚢 部署说明

### 阿里云容器镜像服务配置

1. **登录阿里云控制台**
   - 访问 [阿里云容器镜像服务](https://cr.console.aliyun.com/)
   - 创建命名空间（如：ai-travel-namespace）

2. **配置GitHub Secrets**
   在GitHub仓库设置中添加以下Secrets：
   ```
   ALIBABA_CLOUD_USERNAME: 你的阿里云用户名
   ALIBABA_CLOUD_PASSWORD: 你的阿里云密码
   ALIBABA_CLOUD_NAMESPACE: 你的命名空间名称
   ```

3. **自动部署**
   - 推送代码到main分支会自动触发GitHub Actions
   - 自动构建Docker镜像并推送到阿里云镜像仓库

### 生产环境部署

```bash
# 1. 拉取最新镜像
docker pull crpi-ppzaquo8yzy4dm4g.cn-hangzhou.personal.cr.aliyuncs.com/jjzndnsh/ai-travel

# 2. 运行容器
docker run -d \
  --name ai-travel-prod \
  -p 3000:3000 \
  --restart unless-stopped \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key" \
  -e OPENAI_API_KEY="sk-your-zhipu-api-key" \
  -e NEXT_PUBLIC_AMAP_KEY="your-amap-api-key" \
  crpi-ppzaquo8yzy4dm4g.cn-hangzhou.personal.cr.aliyuncs.com/jjzndnsh/ai-travel

# 3. 查看日志
docker logs -f ai-travel-prod

# 4. 健康检查
curl http://localhost:3000/api/health
```

## 🔧 开发指南

### 本地开发环境

```bash
# 1. 克隆项目
git clone https://github.com/your-username/ai-travel.git
cd ai-travel

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp env.example .env.local

# 4. 启动开发服务器
npm run dev
```

### 构建和测试

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start

# 运行测试
npm test

# 代码检查
npm run lint
```

## 📝 提交记录

项目包含详细的Git提交记录，展示了完整的开发过程：

- **功能开发**: 每个功能模块都有独立的提交记录
- **Bug修复**: 记录所有问题修复过程
- **代码优化**: 性能优化和代码重构记录
- **文档更新**: README和代码注释的更新记录

查看完整提交历史：
```bash
git log --oneline --graph
```

## 🏗️ 项目架构

```
ai-travel/
├── .github/workflows/     # GitHub Actions 配置
├── app/                   # Next.js App Router
│   ├── api/              # API 路由
│   ├── auth/             # 认证页面
│   ├── dashboard/        # 仪表板
│   ├── login/            # 登录页面
│   ├── planner/          # 旅行规划器
│   └── plans/            # 旅行计划详情
├── components/           # 可复用组件
├── lib/                  # 工具库和配置
├── public/               # 静态资源
├── Dockerfile            # Docker 配置
├── docker-compose.yml    # Docker Compose 配置
└── README.md            # 项目文档
```

## 功能特性

### 核心功能
- **智能行程规划**: 用户可以通过语音或文字输入旅行目的地、日期、预算、同行人数、旅行偏好，AI 自动生成个性化旅行路线
- **费用预算与管理**: AI 进行预算分析，记录旅行开销，支持语音输入
- **用户管理与数据存储**: 注册登录系统，云端行程同步，多设备查看和修改

### 技术特性
- **语音识别**: 基于浏览器原生 Web Speech API 实现语音输入功能
- **智能解析**: 使用智谱大模型解析语音内容，自动填充表单字段
- **地图展示**: 集成高德地图 API，展示旅行路线和景点位置
- **AI 规划**: 集成智谱大模型 API 进行智能行程规划
- **实时同步**: 基于 Supabase 的云端数据同步

## 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI 服务**: glm-4
- **语音识别**: Web Speech API
- **地图服务**: 预留接口（高德地图）

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-travel
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制 `.env.example` 为 `.env.local` 并配置以下环境变量：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# 地图 API (可选)
NEXT_PUBLIC_BAIDU_MAP_AK=your_baidu_map_key
NEXT_PUBLIC_AMAP_KEY=your_amap_key




```



### 5. 设置高德地图（可选）

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册账号并创建应用
3. 获取 Web 服务 API Key
4. 在 `.env.local` 中配置 `NEXT_PUBLIC_AMAP_KEY`

**注意**: 如果不配置高德地图，地图功能将不可用。



### 7. 设置 Supabase

#### 4.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 anon key

#### 4.2 创建数据库表

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 创建旅行计划表
CREATE TABLE travel_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  travelers INTEGER NOT NULL DEFAULT 1,
  preferences TEXT,
  itinerary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建费用记录表
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CNY',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX idx_travel_plans_created_at ON travel_plans(created_at DESC);
CREATE INDEX idx_expenses_plan_id ON expenses(plan_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date DESC);

-- 启用行级安全策略
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view their own travel plans" ON travel_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel plans" ON travel_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel plans" ON travel_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel plans" ON travel_plans
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE
    ON travel_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000/login](http://localhost:3000/login) 查看应用。

## 项目结构

```
ai-travel/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   │   └── plan/          # 旅行计划生成 API
│   ├── auth/              # 认证相关页面
│   ├── dashboard/         # 仪表板页面
│   ├── login/             # 登录页面
│   ├── planner/           # 旅行规划器页面
│   └── page.tsx           # 首页
├── lib/                   # 工具库
│   ├── database/          # 数据库操作
│   │   ├── plans.ts       # 旅行计划 CRUD
│   │   └── expenses.ts    # 费用记录 CRUD
│   ├── supabase/          # Supabase 客户端
│   │   ├── client.ts      # 浏览器端客户端
│   │   ├── server.ts      # 服务端客户端
│   │   └── middleware.ts  # 中间件
│   └── types/             # TypeScript 类型定义
│       └── database.ts    # 数据库类型
├── middleware.ts          # Next.js 中间件
└── README.md             # 项目文档
```

## 使用指南

### 1. 用户注册/登录

- 访问应用首页会自动重定向到登录页面
- 点击"没有账户？点击注册"进行注册
- 注册后需要验证邮箱（如果启用了邮箱验证）

### 2. 创建旅行计划

1. 登录后点击"创建新旅行计划"
2. 填写旅行信息：
   - 目的地（支持语音输入）
   - 出发和返回日期
   - 预算和同行人数
   - 旅行偏好
3. 点击"生成旅行计划"，AI 将生成详细行程

### 3. 语音输入功能

- 点击"开始录音"按钮
- 说出旅行需求，如："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
- 系统会自动解析并填入表单字段

### 4. 费用管理

- 在旅行计划详情页点击"费用管理"
- 可以添加、编辑、删除费用记录
- 支持按类别统计费用

## API 接口

### POST /api/plan

创建新的旅行计划

**请求体:**
```json
{
  "destination": "日本",
  "startDate": "2024-03-01",
  "endDate": "2024-03-05",
  "budget": 10000,
  "travelers": 2,
  "preferences": "美食、购物、文化"
}
```

**响应:**
```json
{
  "id": "uuid",
  "title": "日本5日游",
  "destination": "日本",
  "itinerary": {
    "summary": "行程概述",
    "totalEstimatedCost": 9500,
    "days": [...],
    "recommendations": {...}
  }
}
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 部署

### 环境变量配置

在部署平台配置以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## 开发计划

### 已完成功能
- ✅ 用户认证系统
- ✅ 旅行计划创建和管理
- ✅ AI 智能行程规划
- ✅ 语音输入功能
- ✅ 响应式 UI 设计

### 待开发功能
- ⏳ 费用管理页面
- ⏳ 地图集成
- ⏳ 实时协作功能
- ⏳ 移动端优化
- ⏳ 多语言支持

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 项目讨论区

---

**注意**: 这是一个演示项目，请在生产环境中注意安全性配置和数据保护。