# 项目全栈开发提示词（定制版：前端已有 + PostgreSQL 已装）

## 当前状态

- 项目根目录：`D:/my-project`
- 前端项目：`D:/my-project/frontend`（已存在，基于 unibest，仅支持 H5 + 微信小程序）
- 数据库：PostgreSQL 18 已安装，端口 5432，用户名 `postgres`，密码由用户自行填写
- Redis：暂不安装，请生成模拟代码替代

## 最终目标

在 `D:/my-project/backend` 创建 Next.js 后端项目，完成"农家产品销售展示平台"的 MVP 开发（注册/登录/产品发布/产品列表/产品详情），前端代码适配 H5 和微信小程序。

## 技术栈

- **前端**：unibest（Vue 3 + TypeScript + Vite + Pinia + UnoCSS + wot-ui-v2），仅 H5 + 微信小程序
- **后端**：Next.js 14+ (App Router) + TypeScript
- **数据库**：PostgreSQL 18 + Prisma ORM
- **缓存**：模拟 Redis（暂不安装 ioredis，生成空壳文件）

---

## 第一部分：后端项目搭建（请 AI 生成所有文件）

在 `D:/my-project/backend` 目录下创建完整的 Next.js 项目，包含以下文件：

### 1. `package.json`

- 包含 scripts：`dev`、`build`、`start`
- 依赖：`next`、`react`、`react-dom`、`@prisma/client`
- 开发依赖：`typescript`、`@types/node`、`@types/react`、`@types/react-dom`、`prisma`

### 2. `tsconfig.json`

标准 Next.js + TypeScript 配置，paths 映射 `@/*` 指向 `./*`

### 3. `next.config.js`

配置 CORS 头，允许前端跨域请求 `/api/*`

### 4. `.env` 文件

```env
DATABASE_URL="postgresql://postgres:000000@localhost:5432/farm_db"
JWT_SECRET="vv4re61zv6xzc987&#3##45Tgf"
```

### 5. Prisma Schema（`prisma/schema.prisma`）

包含以下三个模型（完整字段定义）：

- **User**：id(UUID), email(唯一), phone(唯一), password(bcrypt), nickname, avatar(可空), role(枚举: BUYER/SELLER/ADMIN), is_active, timestamps
- **Product**：id(UUID), seller_id(关联User), title, description(Text), category(枚举: VEGETABLE/FRUIT/GRAIN/MEAT/DAIRY/OTHER), price(Decimal), unit, images(String数组), stock(可空), origin, is_published, view_count, timestamps
- **Order**：id(UUID), buyer_id(关联User), product_id(关联Product), quantity, total_amount(Decimal), status(枚举: PENDING/CONFIRMED/SHIPPED/COMPLETED/CANCELLED), buyer_remark(可空), timestamps

### 6. 模拟 Redis 客户端（`app/lib/redis.ts`）

**不要安装 ioredis**，生成一个模拟对象，所有方法（get/set/del/incr/expire）只打印 console.log 并返回空值，保证项目不报错。

### 7. Prisma 客户端单例（`app/lib/prisma.ts`）

导出 PrismaClient 单例，避免热重载时创建多个连接。

---

## 第二部分：后端 API 接口清单

请按顺序生成以下 API 路由（全部放在 `app/api/` 下）：

### 认证模块（`/api/auth/`）

- `POST /register`：邮箱+密码注册，密码用 bcrypt 加密（盐值 10），返回成功信息
- `POST /login`：邮箱+密码登录，验证密码，签发 JWT Token（有效期 7 天），返回 token + 用户信息
- `POST /logout`：将 token 加入 Redis 模拟黑名单（暂时用内存 Map 模拟），返回成功
- `GET /me`：从 Authorization 头解析 JWT，返回当前用户信息（需鉴权）

### 产品模块（`/api/products/`）

- `GET /`：产品列表，支持 query：`page`(默认1)、`pageSize`(默认10)、`category`(分类筛选)、`keyword`(标题关键词搜索)、`sortBy`(price_asc/price_desc/created_desc)，返回分页数据
- `GET /:id`：产品详情，调用模拟 Redis 的 `incr` 增加浏览数，返回完整产品信息（含卖家昵称）
- `POST /`：发布产品（需鉴权，仅 SELLER 角色），接收 title/description/category/price/unit/images(数组)/stock/origin，存入数据库
- `PUT /:id`：编辑产品（需鉴权，仅该产品的卖家可操作）
- `DELETE /:id`：删除产品（软删除：将 is_published 设为 false，或直接删除）
- `PATCH /:id/status`：上下架产品（切换 is_published）

### 用户模块（`/api/users/`）

- `GET /:id/profile`：查看卖家公开信息（昵称、头像、简介、发布的产品列表）
- `PUT /profile`：更新个人信息（需鉴权），可修改 nickname/avatar

### 上传模块（`/api/upload`）

- `POST /`：接收图片（multipart/form-data），返回图片 URL（先返回临时路径，如 `/uploads/xxx.jpg`）

---

## 第三部分：前端页面与适配（unibest + wot-ui-v2）

### ⚠️ 强制平台适配规范（AI 必须严格遵守）

由于项目只支持 H5 + 微信小程序，前端代码必须符合以下规则：

1. **网络请求**：使用 `uni.request` 封装，**严禁使用 axios 或 fetch**
2. **路由跳转**：使用 `uni.navigateTo`、`uni.switchTab`，**严禁使用 Vue Router**
3. **本地存储**：使用 `uni.setStorageSync` / `uni.getStorageSync`，**严禁使用 localStorage**
4. **图片选择**：使用 `uni.chooseImage`，或直接用 `wd-uploader` 组件（它已适配）
5. **环境变量**：H5 开发环境用 `/api` 走 Vite 代理，小程序用完整域名

### 前端需要生成的文件：

#### 1. `frontend/src/utils/request.ts`

封装 `uni.request`：

- 自动从 `uni.getStorageSync('token')` 获取 token 放入 `Authorization` 头
- 统一错误拦截（401 跳转登录页）
- 返回 `Promise` 类型

#### 2. `frontend/src/api/` 目录

按模块封装接口调用：

- `auth.ts`：register、login、logout、getMe
- `product.ts`：getList、getDetail、createProduct、updateProduct、deleteProduct、toggleStatus

#### 3. `frontend/src/stores/user.ts` (Pinia)

- state：`userInfo`（null 或对象）、`token`（字符串）
- actions：`login()`、`logout()`、`fetchUserInfo()`
- persist：用 `uni.setStorageSync` 持久化 token 和 userInfo

#### 4. 页面文件（`frontend/src/pages/`）

- `pages/index/index.vue`：首页（搜索框 + 分类导航 + 产品瀑布流列表）
- `pages/product/list.vue`：产品列表页（分类筛选 + 排序 + 无限滚动）
- `pages/product/detail.vue`：产品详情页（图片轮播 + 信息 + 卖家信息）
- `pages/product/publish.vue`：发布产品页（表单 + wd-uploader 图片上传，仅卖家可见）
- `pages/user/profile.vue`：个人中心（用户信息 + 我的发布列表）
- `pages/auth/login.vue`：登录页
- `pages/auth/register.vue`：注册页

> 所有页面使用 wot-ui-v2 组件（`wd-*`），样式使用 UnoCSS

#### 5. `frontend/vite.config.ts` 配置代理

typescript

```
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

#### 6. `frontend/.env` 文件

env

```
VITE_API_BASE_URL=/api
```

---

## 第四部分：开发环境配置说明

### 数据库准备（请 AI 在生成代码时提示用户）

用户需要先手动创建数据库：

sql

```
CREATE DATABASE farm_db;
```

### 后端启动命令

bash

```
cd D:/my-project/backend
pnpm install
npx prisma generate
npx prisma migrate dev --name init
pnpm dev
```

### 前端启动命令

bash

```
cd D:/my-project/frontend
pnpm install
pnpm dev:h5   # H5 调试
pnpm dev:mp-weixin  # 微信小程序调试
```

---

## AI 执行顺序（请按此顺序逐步生成）

> 📌 **执行进度标记（2026-08-04 更新）**
>
> - ✅ **第一步**：backend 配置文件全部生成（package.json、tsconfig.json、next.config.js、.env 已补 JWT_SECRET、.gitignore）
> - ✅ **第二步**：prisma/schema.prisma（User/Product/Order 三模型 + 枚举）、app/lib/prisma.ts、app/lib/redis.ts（模拟 Redis + token 黑名单）
> - ✅ **第三步**：认证模块 API 全部完成（register/login/logout/me），响应统一 `{code, message, data}`，JWT 7 天有效期
> - ✅ **第四步**：前端 request.ts（自动带 token + H5/小程序双端 URL）、api/auth.ts、登录/注册页重写（wd-\* 组件）、toLoginPage 路径修复
> - ✅ **第五步**：产品模块 API 完成（列表/详情/发布/编辑/删除/上下架，列表支持 sellerId 查"我的发布"）
> - ✅ **第六步**：前端首页改造（搜索+分类+瀑布流）、产品列表页、详情页、发布页（wd-uploader 上传）
> - ✅ **第七步**：上传接口（/api/upload 保存至 public/uploads）、个人中心页（登录态/成为卖家/我的发布管理）、tabbar 已指向新页面
> - ✅ **第八步**：全部完成 ✅（2026-08-04）：依赖安装（pnpm 11 需在 pnpm-workspace.yaml 配 allowBuilds）→ 建库/迁移（farm_db + prisma migrate dev）→ 后端启动成功（Next.js 15.5.22 @ localhost:3000）→ 接口实测通过：注册/登录/升级卖家/发布产品/列表查询/me 鉴权/无 token 401。
> - ✅ **前端联调**：全部完成 ✅（2026-08-04 晚）：`pnpm dev:h5` 启动（vite @ localhost:8060），浏览器全流程实测通过：首页渲染 3 条产品（中文/价格/单位/产地完整）→ 登录 seller@test.com 显示「测试卖家/卖家」标签 + 我的发布 3 件 → 发布页（分类选择器 + wd-upload 图片上传到 /api/upload 200）→ 提交成功 → 首页/列表可见 → 详情页轮播图正常。控制台无 error。
> - 🔧 **联调修复记录**：① node_modules 顶层 1736 个 junction 指向旧路径 `D:\vue\my-project`（项目迁移遗留）→ 删除重装依赖，并新建 `pnpm-workspace.yaml`（pnpm 10 用 onlyBuiltDependencies + overrides；pnpm 11 用 allowBuilds）；② 请求双 `/api` 前缀 404 → 修复 `src/http/interceptor.ts`：路径已含 `/api` 前缀时不再拼接（注意 `/${PREFIX}` 会生成 `//api` 导致判断失效，须用 `PREFIX` 直接比较）；③ 发布页 `wd-uploader` 组件不存在 → 改为 `wd-upload`（v-model:file-list + action 绝对 URL + @change 收集 /uploads 地址），描述改用 `wd-textarea`；④ `wd-picker` 的 v-model 需传数组；⑤ 测试数据中文乱码（PowerShell 发送编码问题）→ 用 Node UTF-8 脚本修复；⑥ 清理 2 个 8 字节损坏图片；⑦ next.config.js 增加 /uploads CORS 头。
> - ⏸️ **待办（可选）**：~~① 微信小程序端 `pnpm dev:mp-weixin` 联调~~；② 上传图片相对路径在小程序端由 `resolveAssetUrl` 拼完整域名。
> - ✅ **小程序端联调**：进行中 ✅（2026-08-04 晚）：`pnpm dev:mp-weixin` 编译通过（产物 dist/dev/mp-weixin，watch 模式）→ 微信开发者工具打开成功（AppID 已配置为用户真实 AppID `wxbf576117234a6234`，env/.env 已加 `WECHAT_DEVTOOLS_CLI_PATH`）→ 首页 3 条产品正常渲染、Console 无报错。待验证：登录/个人中心、发布（图片上传）、详情页。
> - ✅ **复用提示词文档**：已生成 ✅（2026-08-04 晚）：根目录新增「微信小程序从0到1开发提示词.md」，沉淀完整流程（unibest 创建 → 后端搭建 → H5 联调 → 小程序联调）+ 13 项踩坑清单与规避方案 + 检查清单 + AI 执行规范，新项目可直接复用跑通。
> - ✅ **刘海屏/安全区全局适配**：已完成 ✅（2026-08-04）：新增需求。`.pt-safe`/`.pb-safe`/`.p-safe` 工具类移至 `src/style/index.scss` 用原生 CSS 多声明 fallback 实现（小程序 `--status-bar-height` → iOS11.0 `constant()` → iOS11.2+ `env()`）；⚠️ 坑：UnoCSS rules 的数组值会合并成逗号列表（`padding-top: a,b,c` 无效声明），不能在 uno.config.ts 里做 fallback；首页搜索栏 `pt-safe`（自定义导航栏）、tabbar `pb-safe`（底部圆角），其余页面 `pb-10`（40px）已覆盖安全区 34px。

**第一步**：生成 `backend` 目录下的所有配置文件（package.json、tsconfig.json、next.config.js、.env）✅ 已完成

**第二步**：生成 `prisma/schema.prisma` 和 `app/lib/prisma.ts`、`app/lib/redis.ts` ✅ 已完成

**第三步**：生成认证模块的全部 API（register、login、logout、me）✅ 已完成

**第四步**：生成前端 `request.ts`、`stores/user.ts`、登录页和注册页完整代码 ✅ 已完成（复用现有 unibest http 封装与 pinia store，新增 utils/request.ts、api/auth.ts）

**第五步**：生成产品模块的全部 API（列表、详情、发布、编辑、删除、上下架）✅ 已完成

**第六步**：生成前端产品列表页、详情页、发布页完整代码 ✅ 已完成

**第七步**：生成个人中心页和上传接口 ✅ 已完成

---

## 注意事项

1. 所有 JWT 操作使用 `jsonwebtoken` 库，请先安装 `pnpm add jsonwebtoken` 和 `pnpm add -D @types/jsonwebtoken`
2. 密码加密使用 `bcryptjs`，安装 `pnpm add bcryptjs` 和 `pnpm add -D @types/bcryptjs`
3. 文件上传使用 `multer` 或 Next.js 内置的 `formidable`，请选择适合 App Router 的方案
4. 类型安全：服务端直接使用 Prisma 生成的类型，前端在 `api/` 目录中手动定义 Response 类型

---

**请从第一步开始，一步一步生成代码，每完成一步让我确认后再继续。**

```
## 💡 接下来你怎么操作

1. **把上面这份提示词完整复制**，粘贴到 Qoder 的对话框里。
2. **把 `.env` 文件里的密码改成你自己的**（AI 会提示你，但你先记着）。
3. **在 PostgreSQL 里先建好数据库**（用 pgAdmin 或命令行执行 `CREATE DATABASE farm_db;`）。
4. 让 AI 按顺序执行，每生成一步你就在 `D:/my-project/` 下创建对应的文件。

如果在哪一步执行 `pnpm dev` 或 `npx prisma migrate dev` 时报错，直接把报错信息发给我，我帮你快速定位。现在可以把提示词发给 Qoder 开始干活了！🚀
```
