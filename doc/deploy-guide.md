# Nano Banana 图片生成器 - 部署教程

---

## 一、部署方式总览

| 方式 | 适用场景 | 需要的文件 | 是否需要 Node.js |
|------|----------|-----------|-----------------|
| 一键启动脚本 | 分享给朋友、本地使用 | 全部文件 | ✅ 需要 |
| 手动部署（Node.js） | 服务器部署 | 精简文件 | ✅ 需要 |
| 纯静态部署 | 无服务器环境 | 仅 dist + index.html | ❌ 不需要（但无法调用 API） |

> **重要**：由于浏览器跨域限制（CORS），前端无法直接请求 `https://api.lingyaai.cn`，必须通过代理服务器转发请求。因此**纯静态部署无法正常调用 API**，推荐使用前两种方式。

---

## 二、文件清单

### ✅ 需要上传的文件

#### 核心运行文件（必须）

```
nanoBanana/
├── server.cjs              # Node.js 服务器（API 代理 + 静态文件服务）
├── package.json             # 项目依赖声明
├── dist/                    # 构建产物（前端页面）
│   ├── index.html
│   └── assets/
│       ├── index-*.js       # JS 打包文件
│       └── index-*.css      # CSS 打包文件
├── start.command            # macOS 一键启动脚本
└── start.bat                # Windows 一键启动脚本
```

#### 开发/构建文件（需要二次开发时上传）

```
nanoBanana/
├── src/                     # 源代码
│   ├── App.vue
│   ├── main.js
│   ├── style.css
│   ├── components/          # Vue 组件
│   ├── composables/         # 业务逻辑
│   └── utils/               # 工具函数
├── index.html               # HTML 入口模板
├── vite.config.js           # Vite 配置（含开发代理）
├── tailwind.config.js       # Tailwind 配置
├── postcss.config.js        # PostCSS 配置
├── package-lock.json        # 依赖版本锁定
└── doc/                     # 文档
    ├── api-doc.md
    └── project-doc.md
```

### ❌ 不需要上传的文件

| 文件/目录 | 原因 |
|-----------|------|
| `node_modules/` | 通过 `npm install` 自动生成，体积大，不可手动复制 |
| `.vscode/` | 编辑器个人配置，与项目运行无关 |
| `dist/`（仅当上传了 src 时） | 可通过 `npm run build` 重新构建，无需同时上传 |

---

## 三、部署步骤

### 方式一：一键启动（推荐分享给朋友）

适合将整个项目打包发给朋友，对方双击即可运行。

**1. 打包文件**

将以下文件/目录压缩为 `nanoBanana.zip`：

```
nanoBanana/
├── server.cjs
├── package.json
├── start.command
├── start.bat
└── dist/
    ├── index.html
    └── assets/
```

> ⚠️ **不要包含 `node_modules/`**，启动脚本会自动安装。

**2. 发送给朋友**

**3. 朋友使用方式**

macOS：
```bash
# 解压后，双击 start.command
# 或终端执行：
chmod +x start.command
./start.command
```

Windows：
```cmd
:: 解压后，双击 start.bat
```

脚本会自动：
1. 检查 Node.js 环境（需要 v18+，未安装会提示下载）
2. 安装 npm 依赖
3. 启动服务器

**4. 访问**

浏览器打开 `http://localhost:3000`，首次使用点击右上角「配置」设置 API Key。

---

### 方式二：服务器部署（Linux / 云服务器）

适合部署到云服务器，供多人通过 IP 或域名访问。

**1. 上传文件到服务器**

```bash
# 在本地打包
tar -czf nanoBanana.tar.gz \
  server.cjs \
  package.json \
  dist/

# 上传到服务器
scp nanoBanana.tar.gz user@your-server:/opt/

# SSH 登录服务器
ssh user@your-server

# 解压
cd /opt
mkdir nanoBanana
tar -xzf nanoBanana.tar.gz -C nanoBanana
cd nanoBanana
```

**2. 安装依赖**

```bash
# 确认 Node.js 版本 >= 18
node -v

# 安装依赖
npm install --production
```

> `--production` 不会安装 devDependencies（vite、tailwindcss 等），因为 dist 已构建完成。

**3. 启动服务**

前台启动（测试用）：
```bash
node server.cjs
```

后台启动（推荐）：
```bash
# 使用 nohup
nohup node server.cjs > output.log 2>&1 &

# 或使用 pm2（推荐）
npm install -g pm2
pm2 start server.cjs --name nano-banana
pm2 save
pm2 startup
```

**4. 修改端口（可选）**

编辑 `server.cjs`，修改第 7 行：
```javascript
const PORT = 3000;  // 改为你需要的端口
```

**5. 配置反向代理（可选）**

使用 Nginx 反向代理，支持域名访问和 HTTPS：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 180s;  # 图片生成可能耗时较长
    }
}
```

---

### 方式三：纯静态部署（不推荐）

仅上传 `dist/` 目录到静态文件服务器（如 Nginx、Vercel、GitHub Pages）。

**限制**：无法调用 API，图片生成功能不可用。除非你另外搭建了 API 代理服务。

如果已有独立代理服务，修改 `src/composables/useApi.js` 中的请求地址后重新构建：

```javascript
// 将 /api/v1/images/generations 改为你的代理地址
const url = 'https://your-proxy-server.com/v1/images/generations'
```

---

## 四、环境要求

| 项目 | 最低要求 | 推荐版本 |
|------|---------|---------|
| Node.js | v18.0.0 | v20+ LTS |
| npm | v8.0.0 | v10+ |
| 磁盘空间 | 50 MB（含 node_modules） | 100 MB |
| 内存 | 128 MB | 256 MB+ |

Node.js 下载地址：https://nodejs.org

---

## 五、重新构建

如果修改了 `src/` 下的源代码，需要重新构建：

```bash
# 安装完整依赖（含 devDependencies）
npm install

# 构建
npm run build

# 构建产物在 dist/ 目录，重启服务器即可
node server.cjs
```

---

## 六、常见问题

### Q: 启动报错 `EADDRINUSE`
端口 3000 被占用，修改 `server.cjs` 中的 `PORT` 常量为其他端口。

### Q: 启动报错 `ReferenceError: require is not defined`
确保文件名为 `server.cjs`（不是 `server.js`），因为项目 `package.json` 中设置了 `"type": "module"`。

### Q: 页面能打开但图片生成失败
1. 检查 API Key 是否正确配置
2. 检查服务器能否访问 `https://api.lingyaai.cn`
3. 查看服务器控制台的错误日志

### Q: macOS 双击 start.command 提示"无法打开"
右键点击 → 选择「打开」→ 在弹窗中点击「打开」。或在终端执行：
```bash
chmod +x start.command
xattr -d com.apple.quarantine start.command
```

### Q: Windows 双击 start.bat 闪退
用记事本打开 `start.bat`，在最后一行添加 `pause`，然后双击运行查看错误信息。

### Q: 如何查看服务器日志
前台启动时日志直接输出到终端。使用 pm2 时：
```bash
pm2 logs nano-banana
```
