<template>
  <div>
    <label class="block text-sm font-medium text-gray-300 mb-2">参考图</label>

    <div class="flex flex-wrap gap-3 mb-3">
      <div
        v-for="(img, index) in images"
        :key="index"
        class="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-600"
      >
        <img :src="img.preview" class="w-full h-full object-cover" />
        <button
          @click="removeImage(index)"
          class="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div class="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-gray-300 text-center py-0.5">
          {{ img.type === 'url' ? 'URL' : '上传' }}
        </div>
      </div>

      <button
        @click="triggerFileInput"
        class="w-20 h-20 rounded-lg border-2 border-dashed border-gray-600 hover:border-yellow-500 flex flex-col items-center justify-center text-gray-500 hover:text-yellow-500 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        <span class="text-[10px] mt-0.5">上传</span>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      @change="handleFileSelect"
    />

    <div class="flex gap-2">
      <input
        v-model="urlInput"
        type="text"
        placeholder="输入图片 URL 后回车添加"
        class="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        @keydown.enter="addUrl"
      />
      <button
        @click="addUrl"
        :disabled="!urlInput.trim()"
        class="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
      >
        添加
      </button>
    </div>

    <p class="mt-1.5 text-xs text-gray-500">支持上传多张图片或输入 URL，可混合使用</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { fileToBase64 } from '../utils/image'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:images'])

const fileInput = ref(null)
const urlInput = ref('')

function triggerFileInput() {
  fileInput.value.click()
}

async function handleFileSelect(event) {
  const files = Array.from(event.target.files || [])
  const newImages = [...props.images]

  for (const file of files) {
    const base64 = await fileToBase64(file)
    newImages.push({
      type: 'upload',
      preview: base64,
      data: base64
    })
  }

  emit('update:images', newImages)
  event.target.value = ''
}

function addUrl() {
  const url = urlInput.value.trim()
  if (!url) return

  const newImages = [...props.images]
  newImages.push({
    type: 'url',
    preview: url,
    data: url
  })

  emit('update:images', newImages)
  urlInput.value = ''
}

function removeImage(index) {
  const newImages = [...props.images]
  newImages.splice(index, 1)
  emit('update:images', newImages)
}
</script>
