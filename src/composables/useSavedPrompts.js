import { ref, watch } from 'vue'

const STORAGE_KEY = 'nano-banana-saved-prompts'

function loadPrompts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return []
}

const savedPrompts = ref(loadPrompts())

watch(savedPrompts, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch (e) {}
}, { deep: true })

export function useSavedPrompts() {
  function savePrompt(prompt, name) {
    const item = {
      id: Date.now(),
      name: name || prompt.substring(0, 30),
      prompt,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    savedPrompts.value.unshift(item)
    return item
  }

  function deletePrompt(id) {
    savedPrompts.value = savedPrompts.value.filter(p => p.id !== id)
  }

  function clearAll() {
    savedPrompts.value = []
  }

  return {
    savedPrompts,
    savePrompt,
    deletePrompt,
    clearAll
  }
}
