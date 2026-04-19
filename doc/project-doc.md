# Nano Banana 图片生成器 - 项目说明文档

> 本文档旨在帮助开发者（包括 AI 模型）快速了解项目全貌，便于二次开发和维护。

---

## 一、项目概述

Nano Banana 图片生成器是一个基于 Vue 3 的 Web 应用，通过调用灵芽 AI 的 Nano Banana 系列模型 API 实现图片生成功能。支持文生图、图生图（多图参考）、并发队列、历史记录本地存储等核心功能。

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5.13 | 前端框架（Composition API） |
| Vite | ^6.3.2 | 构建工具 + 开发服务器 |
| Tailwind CSS | ^3.4.17 | 原子化 CSS 样式 |
| idb-keyval | ^6.2.1 | IndexedDB 封装（历史记录存储） |
| Node.js | v18+ | 生产环境服务器 |

### 核心功能

- **文生图**：输入 Prompt 描述生成图片
- **图生图**：上传/URL 添加参考图，支持多图混合
- **并发队列**：可配置并发数（默认 3），自动排队执行
- **自动重试**：可重试错误（超时、网络、5xx、429）自动重试最多 2 次
- **历史记录**：基于 IndexedDB 的本地持久化存储，支持手动保存
- **提示词保存**：localStorage 持久化，可快速加载已保存的 Prompt
- **图片缩放**：点击图片全屏查看
- **一键部署**：macOS / Windows 启动脚本，自动检查环境、安装依赖、构建启动

---

## 二、项目结构

```
nanoBanana/
├── doc/
│   ├── api-doc.md              # 灵芽 AI API 文档
│   └── project-doc.md          # 本文档
├── src/
│   ├── components/             # Vue 组件
│   │   ├── AspectRatio.vue     # 图片比例选择器
│   │   ├── ConfigPanel.vue     # API 配置弹窗
│   │   ├── HistoryGallery.vue  # 历史记录画廊
│   │   ├── ImageSize.vue       # 分辨率选择器（仅 pro/2 模型）
│   │   ├── ImageUploader.vue   # 参考图上传组件
│   │   ├── PromptInput.vue     # Prompt 输入 + 保存/加载
│   │   └── ResultViewer.vue    # 结果查看器（未使用，结果展示在 App.vue 中）
│   ├── composables/            # Vue Composables（核心逻辑）
│   │   ├── useApi.js           # API 请求封装
│   │   ├── useConfig.js        # 配置管理（localStorage）
│   │   ├── useHistory.js       # 历史记录管理（IndexedDB）
│   │   ├── useSavedPrompts.js  # 保存的提示词管理（localStorage）
│   │   └── useTaskQueue.js     # 并发任务队列
│   ├── utils/
│   │   └── image.js            # 图片处理工具函数
│   ├── App.vue                 # 主应用组件（包含完整 UI 布局）
│   ├── main.js                 # 应用入口
│   └── style.css               # 全局样式 + Tailwind 指令
├── dist/                       # 构建产物（gitignore）
├── index.html                  # HTML 入口
├── package.json                # 项目依赖
├── vite.config.js              # Vite 配置（含开发代理）
├── tailwind.config.js          # Tailwind 配置
├── postcss.config.js           # PostCSS 配置
├── server.cjs                  # 生产环境 Node.js 服务器（含 API 代理）
├── start.command               # macOS 一键启动脚本
└── start.bat                   # Windows 一键启动脚本
```

---

## 三、架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (Vue 3 SPA)                │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ 组件层    │  │ Composable│  │ 工具层           │  │
│  │ App.vue   │→│ useApi    │→│ image.js         │  │
│  │ 各子组件  │  │ useConfig │  │                  │  │
│  │           │  │ useHistory│  │                  │  │
│  │           │  │ useQueue  │  │                  │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
│                       │                              │
│              fetch /api/v1/...                       │
└───────────────────────┬─────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │   代理层（解决 CORS）       │
          │  开发: Vite proxy          │
          │  生产: server.cjs proxy    │
          └─────────────┬─────────────┘
                        │
          ┌─────────────┴─────────────┐
          │   上游 API                  │
          │   https://api.lingyaai.cn  │
          │   POST /v1/images/generations│
          └───────────────────────────┘
```

### 3.2 数据流

```
用户输入 → App.vue 收集参数 → addTask(params) → useTaskQueue 排队
                                                    │
                                          executeTask(task)
                                                    │
                                          generateImage(params, signal) → useApi
                                                    │
                                          fetch /api/v1/images/generations
                                                    │
                                          代理层转发 → 上游 API
                                                    │
                                          响应返回 → task.result 赋值
                                                    │
                                          用户点击「保存图片」→ addHistory() → IndexedDB
```

### 3.3 状态管理

项目不使用 Vuex/Pinia，而是通过 Vue 3 Composition API 的 Composables 模式实现状态共享。每个 Composable 内部使用模块级 `ref` 实现单例模式，确保所有组件共享同一份状态。

---

## 四、Composables 详解

### 4.1 useConfig

**文件**：`src/composables/useConfig.js`
**持久化**：localStorage（key: `nano-banana-config`）
**用途**：管理全局配置

```javascript
// 配置结构
{
  apiBase: 'https://api.lingyaai.cn',  // API 基础地址
  apiKey: '',                            // API 密钥
  model: 'nano-banana',                 // 模型名称
  concurrency: 3                         // 并发队列数
}
```

**导出接口**：
| 方法/属性 | 说明 |
|-----------|------|
| `config` | 响应式配置对象 |
| `updateConfig(partial)` | 合并更新配置 |
| `resetConfig()` | 重置为默认配置 |
| `isConfigured()` | 检查是否已设置 API Key |

**注意事项**：
- `config` 使用 `watch` 深度监听，任何修改自动持久化到 localStorage
- `apiBase` 字段目前仅用于展示，实际代理地址由 Vite/server.cjs 硬编码

### 4.2 useApi

**文件**：`src/composables/useApi.js`
**用途**：封装 API 请求逻辑

**核心方法**：
```javascript
async function generateImage(params, signal)
```

**params 结构**：
```javascript
{
  prompt: string,          // 图片描述
  aspectRatio: string,     // 图片比例（auto/1:1/4:3/3:4/16:9/9:16/2:3/3:2/4:5/5:4/21:9）
  responseFormat: string,  // 返回格式（url/b64_json）
  image: string[],         // 参考图数组（URL 或 Base64）
  imageSize: string,       // 分辨率（1K/2K/4K，仅 pro/2 模型）
  search: boolean          // 联网搜索（仅 nano-banana-2）
}
```

**请求体构建逻辑**：
1. 始终发送：`model`、`prompt`、`aspect_ratio`
2. 条件发送：`response_format`（有值时）、`image`（非空数组时）、`image_size`（pro/2 模型且有值时）、`search`（nano-banana-2 且为 true 时）

**响应验证链**：
1. fetch 网络错误 → "网络连接失败，请检查网络后重试"
2. AbortError → "请求超时，请重试"
3. 非 JSON 响应 → 显示原始文本前 200 字符
4. HTTP 非 200 → 提取 `data.error.message`
5. 响应含 error 字段 → 提取错误信息
6. data.data 为空 → "API 未返回图片数据，请重试"
7. 单项无 url/b64_json → "上游服务返回成功但未包含图片数据，请重试"

**返回值**：`{ url?: string, b64_json?: string }`

### 4.3 useTaskQueue

**文件**：`src/composables/useTaskQueue.js`
**用途**：并发任务队列管理

**常量**：
| 常量 | 值 | 说明 |
|------|-----|------|
| `MAX_RETRIES` | 2 | 最大自动重试次数 |
| `REQUEST_TIMEOUT` | 120000 | 单次请求超时（毫秒） |

**Task 对象结构**：
```javascript
{
  id: number,           // 自增 ID
  status: string,       // pending/running/done/error
  params: object,       // 生成参数（同 useApi params）
  result: object|null,  // API 返回结果
  error: string|null,   // 错误信息
  retryCount: number,   // 已重试次数
  createdAt: string     // 创建时间
}
```

**队列执行流程**：
1. `addTask(params)` → 创建 task，状态 PENDING，调用 `processQueue()`
2. `processQueue()` → 循环检查：runningCount < maxConcurrency 时，取下一个 PENDING 任务执行
3. `executeTask(task)` → 状态改为 RUNNING，创建 AbortController（120s 超时），调用 `generateImage()`
4. 成功 → 状态 DONE，result 赋值
5. 失败 → 判断是否可重试：
   - 可重试错误（超时、网络、5xx、429、rate limit）且 retryCount < 2 → retryCount++，状态改回 PENDING
   - 不可重试错误或超过重试次数 → 状态 ERROR，记录 error 信息
6. finally → runningCount--，调用 processQueue() 处理下一个

**可重试错误关键词**：
```
超时、timeout、网络连接失败、未包含图片数据、未返回图片数据、
502、503、500、429、rate limit、overloaded、capacity
```

**导出接口**：
| 方法/属性 | 说明 |
|-----------|------|
| `tasks` | 所有任务列表（ref） |
| `pendingTasks` | 等待中任务（computed） |
| `runningTasks` | 运行中任务（computed） |
| `doneTasks` | 已完成任务（computed） |
| `errorTasks` | 失败任务（computed） |
| `hasActiveTasks` | 是否有活跃任务（computed） |
| `addTask(params)` | 添加任务到队列 |
| `retryTask(id)` | 手动重试失败任务（重置 retryCount） |
| `removeTask(id)` | 移除任务（运行中不可移除） |
| `clearCompleted()` | 清除已完成和失败任务 |
| `clearAll()` | 清除非运行中任务 |
| `TASK_STATUS` | 状态常量 |

### 4.4 useHistory

**文件**：`src/composables/useHistory.js`
**持久化**：IndexedDB（通过 idb-keyval，key 前缀 `nano-banana-history-`）
**用途**：历史记录的 CRUD 操作

**历史记录结构**：
```javascript
{
  id: number,            // 时间戳 ID
  prompt: string,        // 提示词
  model: string,         // 使用的模型
  aspectRatio: string,   // 图片比例
  imageSize: string,     // 分辨率
  mode: string,          // 'text' 或 'image'
  imageData: string,     // 图片数据（Base64 data URL 或 URL 字符串）
  createdAt: string      // 创建时间
}
```

**导出接口**：
| 方法/属性 | 说明 |
|-----------|------|
| `historyList` | 历史记录列表（ref，按时间倒序） |
| `loading` | 加载状态（ref） |
| `loadHistory()` | 从 IndexedDB 加载所有历史记录 |
| `addHistory(record)` | 添加一条记录，返回 ID |
| `deleteHistory(id)` | 删除一条记录 |
| `clearHistory()` | 清空所有历史记录 |

**注意事项**：
- 历史记录为手动保存，用户需点击「保存图片」按钮
- `imageData` 字段存储完整的 Base64 data URL，单条记录可能较大（数 MB）
- IndexedDB 无大小限制（浏览器配额内），适合存储大量图片

### 4.5 useSavedPrompts

**文件**：`src/composables/useSavedPrompts.js`
**持久化**：localStorage（key: `nano-banana-saved-prompts`）
**用途**：保存常用提示词

**保存的提示词结构**：
```javascript
{
  id: number,          // 时间戳 ID
  name: string,        // 用户命名的名称（默认取 prompt 前 30 字）
  prompt: string,      // 完整提示词文本
  createdAt: string    // 保存时间
}
```

**导出接口**：
| 方法/属性 | 说明 |
|-----------|------|
| `savedPrompts` | 保存的提示词列表（ref） |
| `savePrompt(prompt, name?)` | 保存一条提示词 |
| `deletePrompt(id)` | 删除一条 |
| `clearAll()` | 清空所有 |

---

## 五、组件详解

### 5.1 App.vue（主应用组件）

**文件**：`src/App.vue`
**职责**：整体 UI 布局、状态协调、事件处理

**三栏布局**：
```
┌──────────┬──────────────────────────┬──────────┐
│ 左侧面板  │       中间展示区          │ 右侧队列  │
│ 340px    │                          │ 280px    │
│          │                          │          │
│ 模式切换  │   选中任务的图片/状态      │ 任务列表  │
│ Prompt   │                          │ 状态图标  │
│ 比例选择  │                          │ 重试/删除 │
│ 分辨率    │                          │          │
│ 返回格式  ├──────────────────────────┤          │
│ 联网搜索  │ ▼ 历史记录（可折叠）       │          │
│ 参考图    │                          │          │
│ 生成按钮  │                          │          │
└──────────┴──────────────────────────┴──────────┘
```

**关键状态**：
| 变量 | 类型 | 说明 |
|------|------|------|
| `mode` | ref | 'text' 或 'image' |
| `prompt` | ref | 当前提示词 |
| `aspectRatio` | ref | 当前比例（默认 'auto'） |
| `imageSize` | ref | 当前分辨率（默认 ''） |
| `responseFormat` | ref | 返回格式（默认 'b64_json'） |
| `searchEnabled` | ref | 联网搜索开关 |
| `referenceImages` | ref | 参考图数组 |
| `selectedTaskId` | ref | 当前选中的任务 ID |
| `savedTaskIds` | ref(Set) | 已保存到历史的任务 ID 集合 |
| `zoomSrc` | ref | 缩放查看的图片 src |
| `showConfig` | ref | 配置弹窗显示状态 |
| `showHistory` | ref | 历史记录展开状态 |

**关键方法**：
| 方法 | 说明 |
|------|------|
| `handleGenerate()` | 收集参数，调用 addTask 加入队列 |
| `getTaskDisplaySrc(task)` | 获取任务图片的显示 src（Base64 或 URL） |
| `handleDownloadTask(task)` | 下载图片（Base64 走 Blob，URL 走链接） |
| `handleSaveToHistory(task)` | 手动保存图片到历史记录 |
| `copyTaskUrl(task)` | 复制图片 URL 到剪贴板 |
| `statusLabel(task)` | 获取任务状态标签（含重试次数） |
| `handleHistorySelect(item)` | 从历史记录加载参数到输入区 |

### 5.2 ConfigPanel.vue

**文件**：`src/components/ConfigPanel.vue`
**Props**：`visible: Boolean`
**Emits**：`update:visible`
**功能**：API 配置弹窗，包含 API 地址、API Key（可切换显示）、模型选择、并发数滑块

### 5.3 PromptInput.vue

**文件**：`src/components/PromptInput.vue`
**Props**：`modelValue: String`（v-model）
**Emits**：`update:modelValue`
**功能**：Prompt 文本输入 + 保存/加载提示词。内含保存对话框和已保存列表

### 5.4 AspectRatio.vue

**文件**：`src/components/AspectRatio.vue`
**Props**：`modelValue: String`（v-model）
**Emits**：`update:modelValue`
**功能**：图片比例选择，11 个选项（auto + 10 种比例），每个选项带比例图标

### 5.5 ImageSize.vue

**文件**：`src/components/ImageSize.vue`
**Props**：`modelValue: String`（v-model）
**Emits**：`update:modelValue`
**功能**：分辨率选择（1K/2K/4K），仅当模型为 pro 或 2 时显示

### 5.6 ImageUploader.vue

**文件**：`src/components/ImageUploader.vue`
**Props**：`images: Array`
**Emits**：`update:images`
**功能**：参考图上传，支持文件上传（转 Base64）和 URL 输入，支持多图

**images 数组元素结构**：
```javascript
{
  type: 'upload' | 'url',  // 来源类型
  preview: string,          // 预览地址
  data: string              // 发送给 API 的数据（Base64 data URL 或 URL）
}
```

### 5.7 HistoryGallery.vue

**文件**：`src/components/HistoryGallery.vue`
**Props**：`historyList: Array`
**Emits**：`select`、`delete`、`clearAll`、`zoom`
**功能**：历史记录网格展示，3 列布局，hover 显示删除按钮，点击图片缩放查看

---

## 六、工具函数

### image.js

**文件**：`src/utils/image.js`

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `fileToBase64(file)` | File 对象 | Promise\<string\> | 文件转 Base64 data URL |
| `urlToBase64(url)` | 图片 URL | Promise\<string\> | URL 图片转 Base64 data URL |
| `downloadImage(data, filename?)` | URL 或 data URL | void | 通过 `<a>` 标签下载图片 |
| `base64ToBlob(base64)` | Base64 data URL | Blob | Base64 转 Blob 对象 |
| `downloadBase64Image(base64, filename?)` | Base64 data URL | void | Base64 图片通过 Blob URL 下载 |

---

## 七、代理与部署

### 7.1 开发环境（Vite Proxy）

**配置文件**：`vite.config.js`

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://api.lingyaai.cn',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

- 前端请求 `/api/v1/images/generations` → Vite 代理到 `https://api.lingyaai.cn/v1/images/generations`
- 开发服务器端口：5173

### 7.2 生产环境（server.cjs）

**文件**：`server.cjs`
**技术**：Node.js 原生 http/https 模块（无第三方依赖）

**功能**：
1. 静态文件服务：从 `dist/` 目录提供前端资源
2. API 代理：`/api/` 开头的请求代理到 `https://api.lingyaai.cn`
3. SPA 路由回退：未匹配的路径返回 `index.html`

**代理特性**：
- 超时：180 秒
- 先收集请求体再转发，确保 content-length 正确
- 超时返回 504 + JSON 错误信息
- 代理失败返回 502 + JSON 错误信息
- 删除 `accept-encoding` 头避免压缩问题

**启动**：`node server.cjs`，监听端口 3000

### 7.3 一键启动脚本

| 脚本 | 平台 | 说明 |
|------|------|------|
| `start.command` | macOS | 检查 Node.js v18+、安装依赖、构建、启动 server.cjs |
| `start.bat` | Windows | 同上，Windows 批处理版本 |

**启动流程**：
1. 检查 Node.js 环境（版本 ≥ 18）
2. 检查 node_modules，不存在则 `npm install`
3. 检查 dist 目录，不存在则 `npx vite build`
4. 构建失败则降级为 `npx vite --host` 开发模式
5. 启动 `node server.cjs`

---

## 八、API 接口说明

详细 API 文档见 `doc/api-doc.md`，以下为摘要：

**接口**：`POST /v1/images/generations`
**基础地址**：`https://api.lingyaai.cn`

**请求体**：
```json
{
  "model": "nano-banana",
  "prompt": "图片描述",
  "aspect_ratio": "16:9",
  "response_format": "b64_json",
  "image": ["data:image/jpeg;base64,..."],
  "image_size": "4K",
  "search": true
}
```

**响应体**：
```json
{
  "data": [
    { "url": "https://..." }
  ]
}
```
或
```json
{
  "data": [
    { "b64_json": "/9j/4AAQ..." }
  ]
}
```

**支持模型**：
| 模型 | 特点 |
|------|------|
| nano-banana | 基础版，基于 Gemini-2.5-flash |
| nano-banana-pro | 4K 高清版，基于 Gemini-3-pro，支持 image_size |
| nano-banana-2 | 4K 高清版 + 联网，基于 Gemini-3.1-flash，支持 image_size 和 search |

**注意事项**：
- 图片 URL 有效期 2 小时
- 生成失败不计费
- `image_size` 和 `search` 仅 pro/2 模型支持

---

## 九、样式规范

- **CSS 框架**：Tailwind CSS 3.x
- **配色方案**：深色主题（gray-900/950 背景，yellow-500 强调色）
- **自定义滚动条**：6px 宽，gray 色系（见 `style.css`）
- **响应式**：目前为固定宽度三栏布局，未做移动端适配
- **字体**：系统默认字体
- **图标**：内联 SVG（Heroicons 风格）

---

## 十、二次开发指南

### 10.1 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（带热更新）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
node server.cjs
```

### 10.2 添加新模型

1. 在 `ConfigPanel.vue` 的 `<select>` 中添加新选项
2. 在 `useApi.js` 的 `supportsAdvanced` 判断中添加新模型名（如需 image_size 支持）
3. 在 `useApi.js` 中添加模型特有的参数逻辑
4. 在 `ImageSize.vue` 的 `show` computed 中添加新模型名

### 10.3 添加新功能模块

1. 在 `src/composables/` 下创建新的 composable 文件
2. 遵循单例模式：模块级 `ref` + 导出工厂函数
3. 在 `App.vue` 中引入并使用
4. 如需 UI，在 `src/components/` 下创建新组件

### 10.4 修改 API 代理地址

- **开发环境**：修改 `vite.config.js` 中的 `proxy./api.target`
- **生产环境**：修改 `server.cjs` 中的 `API_TARGET` 常量

### 10.5 修改默认配置

修改 `src/composables/useConfig.js` 中的 `defaultConfig` 对象。

### 10.6 修改并发/超时参数

| 参数 | 文件 | 位置 |
|------|------|------|
| 默认并发数 | `useConfig.js` | `defaultConfig.concurrency` |
| 最大重试次数 | `useTaskQueue.js` | `MAX_RETRIES` |
| 请求超时 | `useTaskQueue.js` | `REQUEST_TIMEOUT` |
| 代理超时 | `server.cjs` | `PROXY_TIMEOUT` |

### 10.7 常见问题

**Q: 图片生成失败怎么办？**
A: 系统已内置自动重试（最多 2 次），可重试错误包括超时、网络错误、5xx、429。如果仍然失败，检查 API Key 是否有效、网络是否正常。

**Q: 如何切换 API 服务商？**
A: 修改 `vite.config.js` 和 `server.cjs` 中的代理目标地址，同时修改 `useApi.js` 中的请求路径和参数格式。

**Q: 历史记录存在哪里？**
A: IndexedDB，通过 idb-keyval 库操作，key 前缀为 `nano-banana-history-`。清除浏览器数据会删除历史记录。

**Q: 如何添加新的图片比例？**
A: 在 `AspectRatio.vue` 的 `ratios` 数组中添加新项，包含 `value`、`label`、`iconW`、`iconH`。

---

## 十一、依赖清单

### 生产依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| vue | ^3.5.13 | 前端框架 |
| idb-keyval | ^6.2.1 | IndexedDB 简易封装 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| @vitejs/plugin-vue | ^5.2.3 | Vite Vue 插件 |
| autoprefixer | ^10.4.21 | CSS 自动前缀 |
| postcss | ^8.5.3 | CSS 处理器 |
| tailwindcss | ^3.4.17 | 原子化 CSS 框架 |
| vite | ^6.3.2 | 构建工具 |

### 运行时依赖（无 npm 安装）

| 模块 | 用途 |
|------|------|
| Node.js http/https/fs/path/url | server.cjs 服务器 |
