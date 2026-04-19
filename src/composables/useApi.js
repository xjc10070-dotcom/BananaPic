import { useConfig } from './useConfig'

export function useApi() {
  const { config } = useConfig()

  async function generateImage(params, signal) {
    const { prompt, aspectRatio, responseFormat, image, imageSize, search } = params

    const body = {
      model: config.value.model,
      prompt,
      aspect_ratio: aspectRatio
    }

    if (responseFormat) {
      body.response_format = responseFormat
    }

    if (image && image.length > 0) {
      body.image = image
    }

    const supportsAdvanced = config.value.model === 'nano-banana-pro' || config.value.model === 'nano-banana-2'
    if (supportsAdvanced && imageSize) {
      body.image_size = imageSize
    }

    if (config.value.model === 'nano-banana-2' && search) {
      body.search = true
    }

    const url = '/api/v1/images/generations'

    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.value.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal
      })
    } catch (e) {
      if (e.name === 'AbortError') {
        throw new Error('请求超时，请重试')
      }
      throw new Error('网络连接失败，请检查网络后重试')
    }

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`API 返回了非 JSON 格式的数据: ${responseText.substring(0, 200)}`)
    }

    if (!response.ok) {
      const errMsg = data.error?.message || data.message || data.error || `API 请求失败 (${response.status})`
      throw new Error(errMsg)
    }

    if (data.error) {
      const errMsg = data.error?.message || data.error?.type || JSON.stringify(data.error)
      throw new Error(errMsg)
    }

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      const hint = data.message || data.msg || ''
      throw new Error(hint || 'API 未返回图片数据，请重试')
    }

    const item = data.data[0]
    if (!item.url && !item.b64_json) {
      throw new Error('上游服务返回成功但未包含图片数据，请重试')
    }

    return item
  }

  return {
    generateImage
  }
}
