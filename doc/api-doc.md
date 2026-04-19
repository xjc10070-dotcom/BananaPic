# Nano Banana 图像生成 API 文档（灵芽 API）
文档版本：2026-04-18
接口基础地址：https://api.lingyaai.cn
接口路径：POST /v1/images/generations
兼容格式：OpenAI DALL·E 图片生成格式
图片 URL 有效期：2 小时
失败不计费

## 一、支持模型
- `nano-banana`：基于 Gemini-2.5-flash-image-preview 优化，画图专用版
- `nano-banana-pro`：基于 Gemini-3-pro-image-preview 优化，高清 4K 版
- `nano-banana-2`：基于 Gemini-3.1-flash-image-preview 优化，高清 4K 版

## 二、模型对比
| 特性 | gemini-2.5-flash-image-preview | nano-banana | nano-banana-pro / nano-banana-2 |
|------|--------------------------------|-------------|----------------------------------|
| 类型 | 官方原生模型 | 画图优化版 | 更强更高清版（4K 画质） |
| 支持接口 | 仅聊天接口 | 图像生成接口 | 图像生成接口 |
| 返回格式 | Base64（可能不返回图片） | URL 或 Base64 | URL 或 Base64 |
| 图片比例设置 | ❌ 不支持 | ✅ 支持 | ✅ 支持 |
| 图片尺寸设置 | ❌ 不支持 | ❌ 不支持 | ✅ 支持（1K/2K/4K） |
| 原生联网 | ❌ 不支持 | ❌ 不支持 | ✅ 支持 |
| 图生图 | ✅ 支持 | ✅ 支持 | ✅ 支持 |
| 失败扣费 | 未说明 | ✅ 不扣费 | ✅ 不扣费 |

## 三、请求头（Header）
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| Authorization | string | ✅ | Bearer {{YOUR_API_KEY}} | API 认证令牌 |
| Content-Type | string | ✅ | application/json | 请求体类型 |

## 四、请求体（Body）
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| model | string | ✅ | - | 模型名称：nano-banana / nano-banana-pro / nano-banana-2 |
| prompt | string | ✅ | - | 图像描述文本，支持中英文混合 |
| aspect_ratio | enum[string] | ✅ | auto | 图片比例：auto/1:1/4:3/3:4/16:9/9:16/2:3/3:2/4:5/5:4/21:9 |
| response_format | string | ❌ | url | 返回格式：url / b64_json |
| image | array[string] | ❌ | - | 图生图参考图，支持 URL 或 Base64，单张/多张，可混合使用 |
| image_size | enum[string] | ❌ | - | 仅 pro/2 支持：1K / 2K / 4K |
| search | boolean | ❌ | false | 仅 pro/2 支持：是否开启原生联网搜索 |

## 五、调用示例

### 5.1 基础文生图
```json
{
  "model": "nano-banana",
  "prompt": "一只橘猫躺在窗台上晒太阳，窗外是樱花盛开的春天",
  "aspect_ratio": "16:9"
}
```

```curl
curl -X POST 'https://api.lingyaai.cn/v1/images/generations' \
  -H 'Authorization: Bearer {{YOUR_API_KEY}}' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "nano-banana",
    "prompt": "一只橘猫躺在窗台上晒太阳，窗外是樱花盛开的春天",
    "aspect_ratio": "16:9"
  }'
```

### 5.2 高清 4K 文生图
```json
{
  "model": "nano-banana-pro",
  "prompt": "赛博朋克风格的未来城市夜景，霓虹灯倒映在雨水浸湿的街道上，4K超高清",
  "aspect_ratio": "21:9",
  "image_size": "4K"
}
```

```curl
curl -X POST 'https://api.lingyaai.cn/v1/images/generations' \
  -H 'Authorization: Bearer {{YOUR_API_KEY}}' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "nano-banana-pro",
    "prompt": "赛博朋克风格的未来城市夜景，霓虹灯倒映在雨水浸湿的街道上，4K超高清",
    "aspect_ratio": "21:9",
    "image_size": "4K"
  }'
```

### 5.3 联网文生图（实时信息）
```json
{
  "model": "nano-banana-2",
  "prompt": "生成2025年最新款保时捷911 Turbo S的产品宣传图，放在赛道场景中",
  "aspect_ratio": "16:9",
  "image_size": "2K",
  "search": true
}
```

```curl
curl -X POST 'https://api.lingyaai.cn/v1/images/generations' \
  -H 'Authorization: Bearer {{YOUR_API_KEY}}' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "nano-banana-2",
    "prompt": "生成2025年最新款保时捷911 Turbo S的产品宣传图，放在赛道场景中",
    "aspect_ratio": "16:9",
    "image_size": "2K",
    "search": true
  }'
```

### 5.4 返回 Base64 格式
```json
{
  "model": "nano-banana",
  "prompt": "水彩风格的富士山日出，前景是湖面倒影",
  "aspect_ratio": "3:2",
  "response_format": "b64_json"
}
```

### 5.5 图生图（单图 URL）
```json
{
  "model": "nano-banana",
  "prompt": "将这张照片转换为吉卜力动画风格，保持原有构图不变，色彩更加温暖明亮",
  "aspect_ratio": "auto",
  "image": [
    "https://example.com/my-photo.jpg"
  ]
}
```

### 5.6 图生图（单图 Base64）
```json
{
  "model": "nano-banana",
  "prompt": "把这张人物照片变成赛博朋克风格的插画，添加霓虹灯光效果",
  "aspect_ratio": "1:1",
  "image": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
  ]
}
```

### 5.7 多图参考融合
```json
{
  "model": "nano-banana-pro",
  "prompt": "将第一张图的人物融合到第二张图的场景中，保持自然和谐，光影统一",
  "aspect_ratio": "4:3",
  "image_size": "2K",
  "image": [
    "https://example.com/person.jpg",
    "https://example.com/background.jpg"
  ]
}
```

### 5.8 高清图生图编辑
```json
{
  "model": "nano-banana-2",
  "prompt": "在这张风景照片中添加一道绚丽的彩虹，并将天空调整为黄昏暖色调",
  "aspect_ratio": "16:9",
  "image_size": "4K",
  "image": [
    "https://example.com/landscape.jpg"
  ]
}
```

## 六、响应格式

### 6.1 URL 格式（默认）
```json
{
  "data": [
    {
      "url": "https://example.com/generated_image.png"
    }
  ]
}
```

### 6.2 Base64 格式
```json
{
  "data": [
    {
      "b64_json": "/9j/4AAQSkZJRgABAQAAAQABAAD..."
    }
  ]
}
```

## 七、常见场景速查表
| 场景 | 推荐模型 | 关键参数 | Prompt 示例 |
|------|----------|----------|-------------|
| 基础文生图 | nano-banana | aspect_ratio | 一只柯基在草地上奔跑 |
| 4K 海报 | nano-banana-pro | image_size: "4K" | 电影级科幻海报，太空站场景 |
| 风格转换 | nano-banana | image | 转换为油画风格 |
| 图片编辑 | nano-banana-pro | image、image_size | 移除背景，替换为海滩 |
| 多图融合 | nano-banana-pro | image | 将两张图合成一张 |
| 联网生图 | nano-banana-2 | search: true | 2025 最新 iPhone 设计概念图 |
| 手机壁纸 | nano-banana | aspect_ratio: "9:16" | 极光星空壁纸，梦幻紫色调 |
| 社交封面 | nano-banana-2 | aspect_ratio: "16:9"、image_size: "2K" | 简约科技风个人主页封面 |

## 八、关键使用规则
1. 图片 URL 有效期为 2 小时，重要作品请及时下载保存到本地
2. 生成失败时不会扣除任何额度
3. `image` 参数支持传入 URL 或 Base64 字符串，可混合使用，支持 1 张或多张参考图
4. `image_size` 和 `search` 参数仅 `nano-banana-pro` 和 `nano-banana-2` 模型支持
5. Prompt 描述越详细，生成效果越好，支持中英文混合描述