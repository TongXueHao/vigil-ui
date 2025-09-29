<template>
  <div class="logs-view">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索内容（支持模糊匹配）"
        clearable
        class="keyword-input"
        @input="applyFilters"
        @clear="applyFilters"
      >
        <template #prefix>
          <el-icon><i class="i-ep-search" /></el-icon>
        </template>
      </el-input>

      <el-select
        v-model="levels"
        placeholder="日志等级（可多选）"
        multiple
        clearable
        class="level-select"
        @change="applyFilters"
        @clear="applyFilters"
      >
        <el-option
          v-for="opt in levelOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>

      <el-button @click="resetFilters">重置</el-button>
      
      <!-- 连接状态和控制 -->
      <div class="connection-status">
        <el-button 
          v-if="connected" 
          @click="disconnect" 
          size="small" 
          type="danger"
        >
          断开
        </el-button>
        <el-button 
          v-if="!connected && !loading"
          @click="connect" 
          size="small" 
          type="primary"
        >
          重连
        </el-button>
        <el-button 
          @click="clearLogs" 
          size="small" 
          type="warning"
        >
          清空日志
        </el-button>
        <el-button 
          @click="forceScrollToBottom" 
          size="small" 
          type="info"
        >
          置底
        </el-button>
      </div>
      
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      closable
      @close="error = null"
      class="error-alert"
    />

    <div class="content" ref="contentRef">
      <!-- 空状态 -->
      <div v-if="!loading && !connected && logs.length === 0" class="empty-state">
        <el-empty description="未连接到日志服务" />
      </div>
      
      <!-- 控制台视图 -->
      <template v-else>
        <div 
          class="console-view" 
          :style="{ height: contentHeight + 'px' }" 
          v-loading="loading" 
          element-loading-text="加载日志中..."
          @scroll="handleScroll"
          ref="scrollContainer"
        >
          <div class="console-content" ref="consoleContent">
            <!-- 日志将通过DOM操作直接插入到这里 -->
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useLogs } from "@/composables/useLogs";

// 使用日志管理 Composable
const {
  logs,
  connected,
  loading,
  error,
  keyword,
  levels,
  connect,
  disconnect,
  clearLogs,
  resetFilters,
  applyFilters,
  contentHeight,
  scrollContainer,
  consoleContent,
  handleScroll,
  resetScroll,
  setContentHeight,
  setConsoleContentRef,
  forceScrollToBottom,
} = useLogs();


// 日志等级选项
const levelOptions = [
  { label: "TRACE", value: "TRACE" },
  { label: "DEBUG", value: "DEBUG" },
  { label: "INFO", value: "INFO" },
  { label: "WARN", value: "WARN" },
  { label: "ERROR", value: "ERROR" },
];




// 内容区域自适应高度
const contentRef = ref<HTMLElement | null>(null);
const consoleContentRef = ref<HTMLElement | null>(null);
let ro: ResizeObserver | null = null;

const measure = () => {
  const el = contentRef.value;
  if (!el) return;
  const h = el.clientHeight;
  const height = h > 240 ? h : 240;
  contentHeight.value = height;
  setContentHeight(height);
};

onMounted(() => {
  measure();
  ro = new ResizeObserver(measure);
  if (contentRef.value) ro.observe(contentRef.value);
  window.addEventListener("resize", measure);
  
  // 设置控制台内容容器引用
  setConsoleContentRef(consoleContentRef.value);
  
  // 初始化时滚动到底部
  nextTick(() => {
    resetScroll();
  });
});

onBeforeUnmount(() => {
  if (ro && contentRef.value) ro.unobserve(contentRef.value);
  window.removeEventListener("resize", measure);
  
});
</script>

<style scoped>
.logs-view {
  padding: 20px;
  height: calc(100vh - 60px);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(99,102,241,0.12);
  border-radius: 12px;
  backdrop-filter: saturate(180%) blur(6px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.content {
  flex: 1;
  min-height: 0;
  overflow: auto;
  scrollbar-width: none;
}
.keyword-input { width: 320px; }
.level-select {
  width: 560px;
}
.level-select :deep(.el-select__tags) {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: thin;
}
.level-select :deep(.el-select__tags .el-tag) {
  white-space: nowrap;
}

.connection-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex: 1;
}


.error-alert {
  margin-bottom: 12px;
}

.card {
  overflow: hidden;
}
.card :deep(.el-card__body) {
  padding-bottom: 0;
}
.card-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.card-header .muted {
  color: rgba(0,0,0,0.45);
}

/* 控制台视图（接近 IDEA 控制台风格） */
.console-view {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background: #0b1020;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  overflow: auto;
  height: 100%;
  box-sizing: border-box;
}

.console-content {
  min-height: 100%;
}

/* 美化控制台滚动条 */
.console-view::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.console-view::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.console-view::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #4a5568, #2d3748);
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.console-view::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #5a6578, #3d4758);
}

.console-view::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, #6a7588, #4d5768);
}

.console-view::-webkit-scrollbar-corner {
  background: rgba(255, 255, 255, 0.05);
}

/* Firefox 滚动条样式 */
.console-view {
  scrollbar-width: thin;
  scrollbar-color: #4a5568 rgba(255, 255, 255, 0.05);
}
.console-line {
  display: flex;
  align-items: baseline;
  gap: 10px;
  line-height: 1.6;
  white-space: nowrap;
}
.console-line .time { color: #86efac; }
.console-line .thread { color: #a3e635; }
.console-line .level { font-weight: 700; }
.console-line .logger { color: #93c5fd; text-decoration: underline dotted; }
.console-line .dash { color: #64748b; }
.console-line .message { color: #e5e7eb; }
.console-line .lv-trace { color: #94a3b8; }
.console-line .lv-debug { color: #60a5fa; }
.console-line .lv-info { color: #34d399; }
.console-line .lv-warn { color: #f59e0b; }
.console-line .lv-error { color: #f87171; }

/* 控制台条目样式 */
.console-entry {
  margin-bottom: 2px;
}

.error-details {
  margin-top: 4px;
  padding-left: 20px;
}
.error-message {
  color: #f87171;
  font-style: italic;
}

/* 堆栈跟踪样式 */
.stack-trace {
  margin-top: 4px;
  margin-left: 20px;
  border-left: 2px solid #f87171;
  padding-left: 10px;
  background: rgba(248, 113, 113, 0.05);
}

.stack-trace-content {
  color: #f87171;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  padding: 4px 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 滚动容器样式 */
.scroll-container {
  overflow: auto;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
}

/* 移除分页，使用表格内部滚动 */

@media (max-width: 768px) {
  .toolbar {
    flex-wrap: wrap;
  }
  .keyword-input { flex: 1 1 100%; min-width: 220px; }
  .level-select { flex: 1 1 160px; }
}
</style>