export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function urlToBase64(url) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (e) {
    throw new Error('图片 URL 转换失败: ' + e.message)
  }
}

export function downloadImage(data, filename) {
  let url
  if (data.startsWith('data:')) {
    url = data
  } else {
    url = data
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `nano-banana-${Date.now()}.png`

  if (!data.startsWith('data:')) {
    link.target = '_blank'
  }

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function base64ToBlob(base64) {
  const parts = base64.split(',')
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png'
  const raw = atob(parts[1])
  const array = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    array[i] = raw.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

export function downloadBase64Image(base64, filename) {
  const blob = base64ToBlob(base64)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `nano-banana-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
