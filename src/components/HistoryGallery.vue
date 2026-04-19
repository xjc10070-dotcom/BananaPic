<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-300">历史记录</h3>
      <button
        v-if="historyList.length > 0"
        @click="handleClearAll"
        class="text-xs text-red-400 hover:text-red-300 transition-colors"
      >
        清空全部
      </button>
    </div>

    <div v-if="historyList.length === 0" class="text-center py-8 text-gray-600 text-sm">
      暂无历史记录
    </div>

    <div v-else class="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
      <div
        v-for="item in historyList"
        :key="item.id"
        class="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-500 transition-colors"
        @click="$emit('select', item)"
      >
        <img
          :src="item.imageData"
          class="w-full aspect-square object-cover"
          @click.stop="$emit('zoom', item.imageData)"
        />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              @click.stop="handleDelete(item.id)"
              class="w-7 h-7 bg-red-500/80 rounded-full flex items-center justify-center"
            >
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="absolute bottom-0 left-0 right-0 bg-black/70 px-1.5 py-0.5">
          <p class="text-[10px] text-gray-300 truncate">{{ item.prompt }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  historyList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'delete', 'clearAll', 'zoom'])

function handleDelete(id) {
  emit('delete', id)
}

function handleClearAll() {
  emit('clearAll')
}
</script>
