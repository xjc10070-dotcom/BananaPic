import { ref, watch } from 'vue'

const STORAGE_KEY = 'nano-banana-excellent-prompts'

function loadPrompts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return []
}

const excellentPrompts = ref(loadPrompts())

watch(excellentPrompts, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch (e) {}
}, { deep: true })

export function useExcellentPrompts() {
  function addExcellentPrompt(record) {
    const item = {
      id: Date.now(),
      prompt: record.prompt,
      rating: record.rating,
      aspectRatio: record.aspectRatio,
      model: record.model,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    excellentPrompts.value.unshift(item)
    return item
  }

  function deletePrompt(id) {
    excellentPrompts.value = excellentPrompts.value.filter(p => p.id !== id)
  }

  function clearAll() {
    excellentPrompts.value = []
  }

  return {
    excellentPrompts,
    addExcellentPrompt,
    deletePrompt,
    clearAll
  }
}
