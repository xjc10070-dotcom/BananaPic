<template>
  <div class="space-y-6">
    <div v-if="!result && !loading" class="flex flex-col items-center justify-center py-20 text-gray-500">
      <svg class="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p class="text-lg">等待生成</p>
      <p class="text-sm mt-1">配置参数后点击生成按钮</p>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="relative">
        <div class="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
        <div class="absolute top-0 left-0 w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="text-yellow-400 mt-4 text-lg">生成中...</p>
      <p class="text-gray-500 text-sm mt-1">图片生成可能需要数秒，请耐心等待</p>
    </div>

    <div v-if="result && !loading">
      <div class="rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
        <img
          :src="displaySrc"
          :alt="resultPrompt"
          class="w-full max-h-[500px] object-contain"
        />
      </div>

      <div class="flex items-center justify-center gap-3 mt-4">
        <button
          @click="handleDownload"
          class="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          下载图片
        </button>

        <button
          v-if="result.url"
          @click="copyUrl"
          class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
          </svg>
          {{ copied ? '已复制' : '复制 URL' }}
        </button>

        <button
          v-if="result.url"
          @click="openInNewTab"
          class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          新标签页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { downloadImage, downloadBase64Image } from '../utils/image'

const props = defineProps({
  result: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  resultPrompt: {
    type: String,
    default: ''
  }
})

const copied = ref(false)

const displaySrc = computed(() => {
  if (!props.result) return ''
  if (props.result.b64_json) {
    return `data:image/png;base64,${props.result.b64_json}`
  }
  return props.result.url || ''
})

function handleDownload() {
  if (props.result.b64_json) {
    downloadBase64Image(`data:image/png;base64,${props.result.b64_json}`)
  } else if (props.result.url) {
    downloadImage(props.result.url)
  }
}

async function copyUrl() {
  if (props.result.url) {
    try {
      await navigator.clipboard.writeText(props.result.url)
      copied.value = true
      setTimeout(() => { copied.value = false }, 2000)
    } catch (e) {}
  }
}

function openInNewTab() {
  if (props.result.url) {
    window.open(props.result.url, '_blank')
  }
}
</script>
