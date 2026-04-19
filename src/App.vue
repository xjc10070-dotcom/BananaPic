<template>
  <div class="min-h-screen flex flex-col">
    <header class="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🍌</span>
        <h1 class="text-xl font-bold text-white">Nano Banana</h1>
        <span class="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">图片生成器</span>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="hasActiveTasks" class="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/30">
          <svg class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ runningTasks.length }}/{{ config.concurrency }} 运行 · {{ pendingTasks.length }} 等待
        </div>
        <span class="text-xs text-gray-500">{{ config.model }}</span>
        <div
          class="w-2 h-2 rounded-full"
          :class="isConfigured() ? 'bg-green-500' : 'bg-red-500'"
          :title="isConfigured() ? '已配置' : '未配置 API Key'"
        ></div>
        <button
          @click="showConfig = true"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors border border-gray-700"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          配置
        </button>
      </div>
    </header>

    <main class="flex-1 flex overflow-hidden">
      <aside class="w-[340px] border-r border-gray-800 bg-gray-900/50 overflow-y-auto p-5 space-y-4 flex-shrink-0">
        <div>
          <div class="flex bg-gray-800 rounded-lg p-1">
            <button
              @click="mode = 'text'"
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
              :class="mode === 'text' ? 'bg-yellow-500 text-gray-900' : 'text-gray-400 hover:text-white'"
            >
              ✏️ 文生图
            </button>
            <button
              @click="mode = 'image'"
              class="flex-1 py-2 text-sm font-medium rounded-md transition-all"
              :class="mode === 'image' ? 'bg-yellow-500 text-gray-900' : 'text-gray-400 hover:text-white'"
            >
              🖼️ 图生图
            </button>
          </div>
        </div>

        <PromptInput v-model="prompt" />

        <AspectRatio v-model="aspectRatio" />

        <ImageSize v-model="imageSize" />

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">返回格式</label>
          <div class="flex gap-2">
            <button
              @click="responseFormat = 'url'"
              class="flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
              :class="responseFormat === 'url'
                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'"
            >
              URL
            </button>
            <button
              @click="responseFormat = 'b64_json'"
              class="flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
              :class="responseFormat === 'b64_json'
                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'"
            >
              Base64
            </button>
          </div>
        </div>

        <div v-if="config.model === 'nano-banana-2'">
          <label class="flex items-center gap-3 cursor-pointer">
            <div class="relative">
              <input type="checkbox" v-model="searchEnabled" class="sr-only" />
              <div
                class="w-10 h-5 rounded-full transition-colors"
                :class="searchEnabled ? 'bg-yellow-500' : 'bg-gray-600'"
              ></div>
              <div
                class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform"
                :class="searchEnabled ? 'translate-x-5' : ''"
              ></div>
            </div>
            <span class="text-sm text-gray-300">联网搜索</span>
          </label>
          <p class="mt-1 text-xs text-gray-500">仅 nano-banana-2 支持，可获取实时信息</p>
        </div>

        <ImageUploader
          v-if="mode === 'image'"
          :images="referenceImages"
          @update:images="referenceImages = $event"
        />

        <button
          @click="handleGenerate"
          :disabled="!canGenerate"
          class="w-full py-3 rounded-xl font-semibold text-base transition-all"
          :class="canGenerate
            ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900 shadow-lg shadow-yellow-500/20'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'"
        >
          🚀 加入队列
        </button>

        <div v-if="!isConfigured()" class="text-center py-2 text-xs text-red-400">
          请先在配置中设置 API Key
        </div>
      </aside>

      <section class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto p-6 flex items-center justify-center">
          <div v-if="!selectedTask" class="flex flex-col items-center justify-center text-gray-500">
            <svg class="w-20 h-20 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-lg">选择任务查看结果</p>
            <p class="text-sm mt-1 text-gray-600">在右侧队列中点击任务查看生成结果</p>
          </div>

          <div v-else class="w-full max-w-4xl space-y-5">
            <div v-if="selectedTask.status === TASK_STATUS.RUNNING" class="flex flex-col items-center justify-center py-20">
              <div class="relative">
                <div class="w-16 h-16 border-4 border-gray-700 rounded-full"></div>
                <div class="absolute top-0 left-0 w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p class="text-yellow-400 mt-4 text-lg">生成中...</p>
              <p class="text-gray-500 text-sm mt-2 max-w-md text-center">{{ selectedTask.params.prompt }}</p>
            </div>

            <div v-if="selectedTask.status === TASK_STATUS.PENDING" class="flex flex-col items-center justify-center py-20">
              <div class="w-16 h-16 mb-4 border-4 border-gray-600 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-gray-400 text-lg">排队等待中</p>
              <p class="text-gray-500 text-sm mt-2 max-w-md text-center">{{ selectedTask.params.prompt }}</p>
            </div>

            <div v-if="selectedTask.status === TASK_STATUS.DONE && selectedTask.result">
              <div class="rounded-xl overflow-hidden border border-gray-700 bg-gray-800 cursor-zoom-in" @click="zoomSrc = getTaskDisplaySrc(selectedTask)">
                <img
                  :src="getTaskDisplaySrc(selectedTask)"
                  :alt="selectedTask.params.prompt"
                  class="w-full object-contain"
                />
              </div>
              <div class="flex items-center justify-center gap-3 mt-4">
                <button
                  @click="handleDownloadTask(selectedTask)"
                  class="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  下载图片
                </button>
                <button
                  @click="handleSaveToHistory(selectedTask)"
                  class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                  </svg>
                  {{ savedTaskIds.has(selectedTask.id) ? '已保存' : '保存图片' }}
                </button>
                <button
                  v-if="selectedTask.result.url"
                  @click="copyTaskUrl(selectedTask)"
                  class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {{ copiedTaskUrl ? '已复制' : '复制 URL' }}
                </button>
                <button
                  v-if="selectedTask.result.url"
                  @click="window.open(selectedTask.result.url, '_blank')"
                  class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  新标签页
                </button>
              </div>

              <div class="flex items-center justify-center gap-1.5 mt-4">
                <span class="text-xs text-gray-400 mr-2">符合提示词：</span>
                <button
                  v-for="star in 5"
                  :key="star"
                  @click="handleRate(selectedTask, star)"
                  class="transition-transform hover:scale-125"
                  :title="`${star} 分`"
                >
                  <svg
                    class="w-6 h-6 transition-colors"
                    :class="(taskRatings[selectedTask.id] || 0) >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </button>
                <span v-if="taskRatings[selectedTask.id]" class="text-xs ml-2" :class="taskRatings[selectedTask.id] >= 4 ? 'text-yellow-400' : 'text-gray-400'">
                  {{ taskRatings[selectedTask.id] }}/5
                </span>
              </div>
            </div>

            <div v-if="selectedTask.status === TASK_STATUS.ERROR" class="flex flex-col items-center justify-center py-20">
              <div class="w-16 h-16 mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p class="text-red-400 text-lg">生成失败</p>
              <p class="text-gray-500 text-sm mt-2 max-w-md text-center">{{ selectedTask.error }}</p>
              <button
                @click="retryTask(selectedTask.id)"
                class="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors text-sm"
              >
                🔄 重试
              </button>
            </div>

            <div class="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <p class="text-xs text-gray-400 mb-1">Prompt</p>
              <p class="text-sm text-gray-300">{{ selectedTask.params.prompt }}</p>
              <div class="flex gap-2 mt-2">
                <span class="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{{ selectedTask.params.aspectRatio }}</span>
                <span v-if="selectedTask.params.imageSize" class="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{{ selectedTask.params.imageSize }}</span>
                <span class="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">{{ selectedTask.createdAt }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 bg-gray-900/50 flex-shrink-0">
          <button
            @click="showHistory = !showHistory"
            class="w-full px-5 py-2.5 flex items-center justify-between text-sm text-gray-400 hover:text-gray-300 transition-colors"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              历史记录
              <span v-if="historyList.length > 0" class="text-gray-600">({{ historyList.length }})</span>
            </span>
            <svg
              class="w-4 h-4 transition-transform"
              :class="showHistory ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div v-if="showHistory" class="max-h-[260px] overflow-y-auto px-4 pb-4">
            <HistoryGallery
              :history-list="historyList"
              @select="handleHistorySelect"
              @delete="handleHistoryDelete"
              @clear-all="handleHistoryClearAll"
              @zoom="zoomSrc = $event"
            />
          </div>
        </div>
      </section>

      <aside class="w-[280px] border-l border-gray-800 bg-gray-900/50 flex flex-col flex-shrink-0">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
          <h3 class="text-sm font-medium text-gray-300">
            任务队列
            <span v-if="tasks.length > 0" class="text-gray-500 ml-1">({{ tasks.length }})</span>
          </h3>
          <div class="flex gap-2">
            <button
              v-if="doneTasks.length > 0 || errorTasks.length > 0"
              @click="clearCompleted"
              class="text-[10px] text-gray-400 hover:text-yellow-400 transition-colors"
            >
              清除已完成
            </button>
            <button
              v-if="tasks.length > 0 && !hasActiveTasks"
              @click="clearAll"
              class="text-[10px] text-red-400 hover:text-red-300 transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div v-if="tasks.length === 0" class="text-center py-8 text-gray-600 text-xs">
            暂无任务
          </div>

          <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center gap-2.5 p-2.5 bg-gray-800/50 rounded-lg border cursor-pointer transition-colors"
            :class="selectedTaskId === task.id ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gray-700/50 hover:border-gray-600'"
            @click="selectedTaskId = task.id"
          >
            <div class="flex-shrink-0">
              <div v-if="task.status === TASK_STATUS.RUNNING" class="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center">
                <svg class="animate-spin w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div v-else-if="task.status === TASK_STATUS.PENDING" class="w-8 h-8 rounded bg-gray-700 flex items-center justify-center">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div v-else-if="task.status === TASK_STATUS.DONE && task.result" class="w-8 h-8 rounded overflow-hidden">
                <img :src="getTaskDisplaySrc(task)" class="w-full h-full object-cover" />
              </div>
              <div v-else-if="task.status === TASK_STATUS.ERROR" class="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-300 truncate">{{ task.params.prompt }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span
                  class="text-[10px] px-1 py-0 rounded"
                  :class="{
                    'bg-yellow-500/10 text-yellow-400': task.status === TASK_STATUS.RUNNING,
                    'bg-gray-700 text-gray-400': task.status === TASK_STATUS.PENDING,
                    'bg-green-500/10 text-green-400': task.status === TASK_STATUS.DONE,
                    'bg-red-500/10 text-red-400': task.status === TASK_STATUS.ERROR,
                  }"
                >
                  {{ statusLabel(task) }}
                </span>
                <span class="text-[10px] text-gray-500">{{ task.params.aspectRatio }}</span>
              </div>
            </div>

            <div class="flex items-center gap-0.5 flex-shrink-0">
              <button
                v-if="task.status === TASK_STATUS.ERROR"
                @click.stop="retryTask(task.id)"
                class="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                title="重试"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
              <button
                v-if="task.status !== TASK_STATUS.RUNNING"
                @click.stop="removeTask(task.id)"
                class="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="移除"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <div
      v-if="successMsg"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500/90 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
    >
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      <span class="text-sm">{{ successMsg }}</span>
    </div>

    <div
      v-if="errorMsg"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
    >
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span class="text-sm">{{ errorMsg }}</span>
      <button @click="errorMsg = ''" class="ml-2 text-white/70 hover:text-white">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <ConfigPanel v-model:visible="showConfig" />

    <Teleport to="body">
      <div
        v-if="zoomSrc"
        class="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-zoom-out"
        @click="zoomSrc = ''"
      >
        <img
          :src="zoomSrc"
          class="max-w-[95vw] max-h-[95vh] object-contain select-none"
          @click.stop
          draggable="false"
        />
        <button
          @click="zoomSrc = ''"
          class="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useConfig } from './composables/useConfig'
import { useTaskQueue } from './composables/useTaskQueue'
import { useHistory } from './composables/useHistory'
import { useExcellentPrompts } from './composables/useExcellentPrompts'
import { downloadImage, downloadBase64Image, urlToBase64 } from './utils/image'
import ConfigPanel from './components/ConfigPanel.vue'
import PromptInput from './components/PromptInput.vue'
import AspectRatio from './components/AspectRatio.vue'
import ImageSize from './components/ImageSize.vue'
import ImageUploader from './components/ImageUploader.vue'
import HistoryGallery from './components/HistoryGallery.vue'

const { config, isConfigured } = useConfig()
const {
  tasks, pendingTasks, runningTasks, doneTasks, errorTasks, hasActiveTasks,
  addTask, retryTask, removeTask, clearCompleted, clearAll,
  TASK_STATUS
} = useTaskQueue()
const { historyList, loadHistory, addHistory, deleteHistory, clearHistory } = useHistory()
const { addExcellentPrompt } = useExcellentPrompts()

const showConfig = ref(false)
const showHistory = ref(false)
const mode = ref('text')
const prompt = ref('')
const aspectRatio = ref('16:9')
const imageSize = ref('2K')
const responseFormat = ref('b64_json')
const searchEnabled = ref(false)
const referenceImages = ref([])
const selectedTaskId = ref(null)
const errorMsg = ref('')
const successMsg = ref('')
const copiedTaskUrl = ref(false)
const zoomSrc = ref('')
const savedTaskIds = ref(new Set())
const taskRatings = ref({})

const selectedTask = computed(() => {
  if (!selectedTaskId.value) return null
  return tasks.value.find(t => t.id === selectedTaskId.value) || null
})

const canGenerate = computed(() => {
  if (!isConfigured()) return false
  if (!prompt.value.trim()) return false
  if (mode.value === 'image' && referenceImages.value.length === 0) return false
  return true
})

function handleGenerate() {
  if (!canGenerate.value) return

  const imageParams = referenceImages.value.map(img => img.data)

  addTask({
    prompt: prompt.value.trim(),
    aspectRatio: aspectRatio.value,
    responseFormat: responseFormat.value,
    image: mode.value === 'image' ? imageParams : [],
    imageSize: imageSize.value || undefined,
    search: searchEnabled.value
  })
}

function getTaskDisplaySrc(task) {
  if (!task.result) return ''
  if (task.result.b64_json) {
    return `data:image/png;base64,${task.result.b64_json}`
  }
  return task.result.url || ''
}

function handleDownloadTask(task) {
  if (task.result.b64_json) {
    downloadBase64Image(`data:image/png;base64,${task.result.b64_json}`)
  } else if (task.result.url) {
    downloadImage(task.result.url)
  }
}

async function handleSaveToHistory(task) {
  if (savedTaskIds.value.has(task.id)) return

  try {
    let imageDataForStorage = ''
    if (task.result.b64_json) {
      imageDataForStorage = `data:image/png;base64,${task.result.b64_json}`
    } else if (task.result.url) {
      try {
        imageDataForStorage = await urlToBase64(task.result.url)
      } catch (e) {
        imageDataForStorage = task.result.url
      }
    }

    await addHistory({
      prompt: task.params.prompt,
      model: config.value.model,
      aspectRatio: task.params.aspectRatio,
      imageSize: task.params.imageSize,
      mode: task.params.image && task.params.image.length > 0 ? 'image' : 'text',
      imageData: imageDataForStorage,
      createdAt: task.createdAt
    })

    savedTaskIds.value.add(task.id)
    savedTaskIds.value = new Set(savedTaskIds.value)

    successMsg.value = '图片已保存到历史记录'
    setTimeout(() => { successMsg.value = '' }, 2000)
  } catch (e) {
    errorMsg.value = '保存失败: ' + (e.message || '未知错误')
    setTimeout(() => { errorMsg.value = '' }, 3000)
  }
}

function handleRate(task, rating) {
  taskRatings.value[task.id] = rating
  taskRatings.value = { ...taskRatings.value }

  if (rating >= 4) {
    addExcellentPrompt({
      prompt: task.params.prompt,
      rating,
      aspectRatio: task.params.aspectRatio,
      model: config.value.model
    })
  }
}

async function copyTaskUrl(task) {
  if (task.result.url) {
    try {
      await navigator.clipboard.writeText(task.result.url)
      copiedTaskUrl.value = true
      setTimeout(() => { copiedTaskUrl.value = false }, 2000)
    } catch (e) {}
  }
}

function statusLabel(task) {
  if (typeof task === 'string') {
    const map = {
      [TASK_STATUS.PENDING]: '等待中',
      [TASK_STATUS.RUNNING]: '生成中',
      [TASK_STATUS.DONE]: '已完成',
      [TASK_STATUS.ERROR]: '失败',
    }
    return map[task] || task
  }
  if (task.status === TASK_STATUS.RUNNING && task.retryCount > 0) {
    return `重试中(${task.retryCount})`
  }
  if (task.status === TASK_STATUS.PENDING && task.retryCount > 0) {
    return `重试等待`
  }
  if (task.status === TASK_STATUS.ERROR && task.retryCount > 0) {
    return `失败(已重试${task.retryCount}次)`
  }
  const map = {
    [TASK_STATUS.PENDING]: '等待中',
    [TASK_STATUS.RUNNING]: '生成中',
    [TASK_STATUS.DONE]: '已完成',
    [TASK_STATUS.ERROR]: '失败',
  }
  return map[task.status] || task.status
}

function handleHistorySelect(item) {
  prompt.value = item.prompt || ''
  aspectRatio.value = item.aspectRatio || '16:9'
  imageSize.value = item.imageSize || '2K'
  mode.value = item.mode || 'text'
}

async function handleHistoryDelete(id) {
  await deleteHistory(id)
}

async function handleHistoryClearAll() {
  await clearHistory()
}

function handleKeydown(e) {
  if (e.key === 'Escape' && zoomSrc.value) {
    zoomSrc.value = ''
  }
}

onMounted(() => {
  loadHistory()
  if (!isConfigured()) {
    showConfig.value = true
  }
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
