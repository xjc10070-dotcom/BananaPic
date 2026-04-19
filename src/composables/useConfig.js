import { ref, watch } from 'vue'

const STORAGE_KEY = 'nano-banana-config'

const defaultConfig = {
  apiBase: 'https://api.lingyaai.cn',
  apiKey: '',
  model: 'nano-banana',
  concurrency: 3
}

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return { ...defaultConfig, ...JSON.parse(saved) }
    }
  } catch (e) {}
  return { ...defaultConfig }
}

const config = ref(loadConfig())

watch(config, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  } catch (e) {}
}, { deep: true })

export function useConfig() {
  function updateConfig(partial) {
    config.value = { ...config.value, ...partial }
  }

  function resetConfig() {
    config.value = { ...defaultConfig }
  }

  const isConfigured = () => !!config.value.apiKey

  return {
    config,
    updateConfig,
    resetConfig,
    isConfigured
  }
}
