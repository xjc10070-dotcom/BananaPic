import { ref, computed } from 'vue'
import { useConfig } from './useConfig'
import { useApi } from './useApi'

const TASK_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  DONE: 'done',
  ERROR: 'error'
}

const MAX_RETRIES = 2
const REQUEST_TIMEOUT = 120000

export function useTaskQueue() {
  const { config } = useConfig()
  const { generateImage } = useApi()

  const tasks = ref([])
  let runningCount = 0
  let taskIdCounter = 0

  const pendingTasks = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.PENDING))
  const runningTasks = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.RUNNING))
  const doneTasks = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.DONE))
  const errorTasks = computed(() => tasks.value.filter(t => t.status === TASK_STATUS.ERROR))

  const hasActiveTasks = computed(() => runningTasks.value.length > 0 || pendingTasks.value.length > 0)

  function addTask(params) {
    const task = {
      id: ++taskIdCounter,
      status: TASK_STATUS.PENDING,
      params,
      result: null,
      error: null,
      retryCount: 0,
      createdAt: new Date().toLocaleString('zh-CN')
    }
    tasks.value.unshift(task)
    processQueue()
    return task.id
  }

  function processQueue() {
    const maxConcurrency = config.value.concurrency || 3

    while (runningCount < maxConcurrency) {
      const nextTask = tasks.value.find(t => t.status === TASK_STATUS.PENDING)
      if (!nextTask) break

      executeTask(nextTask)
    }
  }

  async function executeTask(task) {
    task.status = TASK_STATUS.RUNNING
    runningCount++

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const result = await generateImage(task.params, controller.signal)
      task.result = result
      task.status = TASK_STATUS.DONE
    } catch (e) {
      const errorMsg = e.message || '生成失败'

      if (task.retryCount < MAX_RETRIES && isRetryableError(errorMsg)) {
        task.retryCount++
        task.status = TASK_STATUS.PENDING
        task.error = null
        console.warn(`任务 #${task.id} 第 ${task.retryCount} 次重试: ${errorMsg}`)
      } else {
        task.error = errorMsg
        task.status = TASK_STATUS.ERROR
      }
    } finally {
      clearTimeout(timeoutId)
      runningCount--
      processQueue()
    }
  }

  function isRetryableError(msg) {
    const retryableKeywords = [
      '超时',
      'timeout',
      '网络连接失败',
      '未包含图片数据',
      '未返回图片数据',
      '502',
      '503',
      '500',
      '429',
      'rate limit',
      'overloaded',
      'capacity'
    ]
    const lower = msg.toLowerCase()
    return retryableKeywords.some(k => lower.includes(k))
  }

  function retryTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task && (task.status === TASK_STATUS.ERROR)) {
      task.status = TASK_STATUS.PENDING
      task.result = null
      task.error = null
      task.retryCount = 0
      processQueue()
    }
  }

  function removeTask(id) {
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      const task = tasks.value[idx]
      if (task.status === TASK_STATUS.RUNNING) return
      tasks.value.splice(idx, 1)
    }
  }

  function clearCompleted() {
    tasks.value = tasks.value.filter(t => t.status === TASK_STATUS.PENDING || t.status === TASK_STATUS.RUNNING)
  }

  function clearAll() {
    tasks.value = tasks.value.filter(t => t.status === TASK_STATUS.RUNNING)
  }

  return {
    tasks,
    pendingTasks,
    runningTasks,
    doneTasks,
    errorTasks,
    hasActiveTasks,
    addTask,
    retryTask,
    removeTask,
    clearCompleted,
    clearAll,
    TASK_STATUS
  }
}
