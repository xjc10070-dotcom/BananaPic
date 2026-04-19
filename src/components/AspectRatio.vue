<template>
  <div>
    <label class="block text-sm font-medium text-gray-300 mb-2">图片比例</label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
    >
      <option v-for="ratio in ratios" :key="ratio.value" :value="ratio.value">
        {{ ratio.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '16:9'
  }
})

defineEmits(['update:modelValue'])

const ratios = [
  { value: 'auto', label: 'Auto - 自动' },
  { value: '1:1',  label: '1:1 - 正方形' },
  { value: '4:3',  label: '4:3 - 横向标准' },
  { value: '3:4',  label: '3:4 - 纵向标准' },
  { value: '16:9', label: '16:9 - 宽屏' },
  { value: '9:16', label: '9:16 - 竖屏/手机壁纸' },
  { value: '2:3',  label: '2:3 - 纵向照片' },
  { value: '3:2',  label: '3:2 - 横向照片' },
  { value: '4:5',  label: '4:5 - 社交媒体' },
  { value: '5:4',  label: '5:4 - 社交媒体横' },
  { value: '21:9', label: '21:9 - 超宽屏' },
]
</script>
