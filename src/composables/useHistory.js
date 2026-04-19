import { ref } from 'vue'
import { get, set, keys, del, clear } from 'idb-keyval'

const DB_PREFIX = 'nano-banana-history-'

export function useHistory() {
  const historyList = ref([])
  const loading = ref(false)

  async function loadHistory() {
    loading.value = true
    try {
      const allKeys = await keys()
      const historyKeys = allKeys
        .filter(k => String(k).startsWith(DB_PREFIX))
        .sort()
        .reverse()

      const items = []
      for (const key of historyKeys) {
        const item = await get(key)
        if (item) items.push(item)
      }
      historyList.value = items
    } catch (e) {
      console.error('加载历史记录失败:', e)
    } finally {
      loading.value = false
    }
  }

  async function addHistory(record) {
    const id = Date.now()
    const key = `${DB_PREFIX}${id}`
    const item = { id, ...record }
    await set(key, item)
    historyList.value.unshift(item)
    return id
  }

  async function deleteHistory(id) {
    const key = `${DB_PREFIX}${id}`
    await del(key)
    historyList.value = historyList.value.filter(item => item.id !== id)
  }

  async function clearHistory() {
    const allKeys = await keys()
    const historyKeys = allKeys.filter(k => String(k).startsWith(DB_PREFIX))
    for (const key of historyKeys) {
      await del(key)
    }
    historyList.value = []
  }

  return {
    historyList,
    loading,
    loadHistory,
    addHistory,
    deleteHistory,
    clearHistory
  }
}
