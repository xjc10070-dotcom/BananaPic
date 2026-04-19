<template>
  <div>
    <div class="flex items-center justify-between mb-1.5">
      <label class="block text-sm font-medium text-gray-300">Prompt 提示词</label>
      <div class="flex items-center gap-2">
        <button
          @click="showSaved = !showSaved"
          class="text-xs text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
          </svg>
          已保存 ({{ savedPrompts.length }})
        </button>
        <button
          @click="handleSave"
          :disabled="!modelValue.trim()"
          class="text-xs text-yellow-400 hover:text-yellow-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
          </svg>
          保存
        </button>
      </div>
    </div>

    <textarea
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      rows="6"
      placeholder="描述你想生成的图片，支持中英文混合..."
      class="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-y min-h-[120px]"
    ></textarea>
    <div class="flex justify-between mt-1">
      <p class="text-xs text-gray-500">描述越详细，生成效果越好</p>
      <p class="text-xs" :class="modelValue.length > 0 ? 'text-yellow-500' : 'text-gray-500'">{{ modelValue.length }} 字</p>
    </div>

    <div v-if="showSaveDialog" class="mt-2 p-3 bg-gray-800 border border-gray-600 rounded-lg">
      <input
        v-model="saveName"
        type="text"
        placeholder="给提示词起个名字（可选）"
        class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-2"
        @keydown.enter="confirmSave"
      />
      <div class="flex gap-2">
        <button
          @click="confirmSave"
          class="flex-1 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-sm font-medium rounded-lg transition-colors"
        >
          确认保存
        </button>
        <button
          @click="showSaveDialog = false"
          class="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
        >
          取消
        </button>
      </div>
    </div>

    <div v-if="showSaved && savedPrompts.length > 0" class="mt-2 max-h-[200px] overflow-y-auto space-y-1">
      <div
        v-for="item in savedPrompts"
        :key="item.id"
        class="flex items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors group"
      >
        <div
          class="flex-1 min-w-0 cursor-pointer"
          @click="handleLoad(item)"
        >
          <p class="text-xs font-medium text-gray-300 truncate">{{ item.name }}</p>
          <p class="text-[10px] text-gray-500 truncate">{{ item.prompt }}</p>
        </div>
        <button
          @click="handleDeleteSaved(item.id)"
          class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all flex-shrink-0"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showSaved && savedPrompts.length === 0" class="mt-2 text-center py-3 text-xs text-gray-600">
      暂无保存的提示词
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSavedPrompts } from '../composables/useSavedPrompts'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const { savedPrompts, savePrompt, deletePrompt } = useSavedPrompts()
const showSaved = ref(false)
const showSaveDialog = ref(false)
const saveName = ref('')

function handleSave() {
  if (!props.modelValue.trim()) return
  saveName.value = ''
  showSaveDialog.value = true
}

function confirmSave() {
  if (!props.modelValue.trim()) return
  savePrompt(props.modelValue.trim(), saveName.value.trim())
  showSaveDialog.value = false
  saveName.value = ''
}

function handleLoad(item) {
  emit('update:modelValue', item.prompt)
  showSaved.value = false
}

function handleDeleteSaved(id) {
  deletePrompt(id)
}
</script>
