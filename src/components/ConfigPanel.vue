<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="close">
    <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h2 class="text-lg font-semibold text-white">⚙️ API 配置</h2>
        <button @click="close" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="px-6 py-5 space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">API 地址</label>
          <input
            v-model="localConfig.apiBase"
            type="text"
            placeholder="https://api.lingyaai.cn"
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <p class="mt-1 text-xs text-gray-500">默认使用 Vite 代理，如遇跨域问题可修改</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">API Key</label>
          <div class="relative">
            <input
              v-model="localConfig.apiKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="输入你的 API Key"
              class="w-full px-4 py-2.5 pr-10 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button
              @click="showKey = !showKey"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <svg v-if="!showKey" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">模型</label>
          <select
            v-model="localConfig.model"
            class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="nano-banana">nano-banana（基础版）</option>
            <option value="nano-banana-pro">nano-banana-pro（4K 高清版）</option>
            <option value="nano-banana-2">nano-banana-2（4K 高清版 + 联网）</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">并发队列数</label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="localConfig.concurrency"
              type="range"
              min="1"
              max="10"
              class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <span class="text-yellow-400 font-mono text-lg font-bold w-6 text-center">{{ localConfig.concurrency }}</span>
          </div>
          <p class="mt-1 text-xs text-gray-500">同时执行的最大生成任务数，建议 1-5</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
        <button
          @click="resetConfig"
          class="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          重置
        </button>
        <button
          @click="save"
          class="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
        >
          保存配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useConfig } from '../composables/useConfig'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible'])

const { config, updateConfig, resetConfig: reset } = useConfig()
const showKey = ref(false)

const localConfig = ref({ ...config.value })

watch(() => props.visible, (val) => {
  if (val) {
    localConfig.value = { ...config.value }
  }
})

function close() {
  emit('update:visible', false)
}

function save() {
  updateConfig(localConfig.value)
  close()
}

function resetConfig() {
  reset()
  localConfig.value = { ...config.value }
}
</script>
