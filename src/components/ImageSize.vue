<template>
  <div v-if="show">
    <label class="block text-sm font-medium text-gray-300 mb-2">分辨率</label>
    <div class="flex gap-2">
      <button
        v-for="size in sizes"
        :key="size.value"
        @click="$emit('update:modelValue', size.value)"
        class="flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
        :class="modelValue === size.value
          ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
          : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-gray-300'"
      >
        {{ size.label }}
      </button>
    </div>
    <p class="mt-1 text-xs text-gray-500">仅 nano-banana-pro / nano-banana-2 支持</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useConfig } from '../composables/useConfig'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])

const { config } = useConfig()

const show = computed(() => {
  return config.value.model === 'nano-banana-pro' || config.value.model === 'nano-banana-2'
})

const sizes = [
  { value: '1K', label: '1K' },
  { value: '2K', label: '2K' },
  { value: '4K', label: '4K' },
]
</script>
