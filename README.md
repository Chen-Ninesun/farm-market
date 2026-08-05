# 农家产品销售展示平台（Farm Market）

一个从 0 到 1 的**农产品销售展示平台 MVP**：农户（卖家）发布自家农产品，买家浏览、搜索、查看详情，支持图片上传与卖家管理。

> 📖 完整开发流程与踩坑记录见：[微信小程序从0到1开发提示词.md](./微信小程序从0到1开发提示词.md)

## ✨ 功能特性

- **首页**：产品瀑布流 + 搜索 + 分类筛选
- **产品详情**：轮播图、价格/单位/产地、卖家信息
- **用户体系**：注册 / 登录（JWT 7 天）、买家 / 卖家角色
- **卖家中心**：发布产品（含图片上传）、我的发布管理（编辑/删除/上下架）
- **多端支持**：H5 + 微信小程序（同一套代码）

## 🛠 技术栈

| 端 | 技术 |
|---|---|
| 前端 | unibest 模板（uniapp + Vue3 + TypeScript + Vite5 + UnoCSS + wot-ui） |
| 后端 | Next.js 15（App Router）+ Prisma ORM |
| 数据库 | PostgreSQL |
| 包管理 | pnpm（frontend 用 pnpm 10，backend 用 pnpm 11） |

## 📁 目录结构

```
├── backend/          # Next.js 15 API 服务（端口 3000）
│   ├── prisma/       # 数据模型与迁移
│   ├── app/api/      # 认证 / 产品 / 上传 接口
│   └── public/uploads/ # 上传的产品图片
├── frontend/         # unibest 前端（H5 + 微信小程序）
│   ├── src/pages/    # 首页 / 列表 / 详情 / 发布 / 登录 / 个人中心
│   └── env/          # 环境变量配置
└── *.md              # 开发文档与可复用提示词
```

## 🚀 快速启动

### 0. 前置要求

- Node.js ≥ 18、pnpm ≥ 10
- PostgreSQL 已启动，创建数据库：
  ```sql
  CREATE DATABASE farm_db;
  ```

### 1. 后端（端口 3000）

```bash
cd backend
pnpm install
# 首次：配置数据库连接并建表
# 复制 .env 模板（不含 .env 本身，需自行创建）：
# DATABASE_URL="postgresql://用户名:密码@localhost:5432/farm_db"
# JWT_SECRET="自定义强密钥"
pnpm prisma migrate dev
pnpm dev
```

### 2. 前端 H5（端口 8060）

```bash
cd frontend
pnpm install
pnpm dev:h5
# 浏览器访问 http://localhost:8060
```

### 3. 微信小程序

```bash
cd frontend
pnpm dev:mp-weixin   # 编译产物在 dist/dev/mp-weixin
```

然后用**微信开发者工具**导入 `frontend/dist/dev/mp-weixin` 目录（AppID 已在 `frontend/env/.env` 配置）。首次使用需：工具 → 设置 → 安全设置 → 开启服务端口。

## 🔑 测试账号

| 账号 | 密码 | 角色 |
|---|---|---|
| seller@test.com | 123456 | 测试卖家（可发布产品） |

## ⚠️ 注意事项

- **`backend/.env` 已被 .gitignore 排除**，请勿提交数据库密码与 JWT 密钥到仓库；生产环境务必更换 JWT_SECRET
- 开发期小程序已关闭合法域名校验（`urlCheck: false`），上线前需改为 true 并配置 HTTPS 域名
- 真机预览小程序时，`localhost` 指向手机自身，需将 `frontend/env/.env` 的 `VITE_SERVER_BASEURL__WEIXIN_DEVELOP` 改为局域网 IP 后重新编译
- 新项目复用请参考 [微信小程序从0到1开发提示词.md](./微信小程序从0到1开发提示词.md)（含 13 项踩坑规避方案）

## 📄 License

MIT
