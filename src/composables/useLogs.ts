/**
 * 日志管理 Composable - 简单版本
 */
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { logService } from '@/services/api';
import type { LogEntry, LogLevel } from '@/types/logs';

export function useLogs() {
  // 状态
  const logs = ref<LogEntry[]>([]);
  const connected = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const maxLogs = 1000; // 固定保留2000条最新日志

  // 过滤条件
  const keyword = ref('');
  const levels = ref<LogLevel[]>([]);

  // 滚动相关
  const contentHeight = ref(520); // 容器高度
  const isAtBottom = ref(true); // 是否在底部
  const scrollContainer = ref<HTMLElement | null>(null); // 滚动容器引用
  const consoleContent = ref<HTMLElement | null>(null); // 控制台内容容器引用

  // 性能优化相关
  let pendingLogs: LogEntry[] = []; // 待处理的日志队列
  let batchTimer: ReturnType<typeof setTimeout> | null = null; // 批量处理定时器
  const BATCH_SIZE = 50; // 批量处理大小
  const BATCH_DELAY = 16; // 批量处理延迟(ms)
  
  // DOM元素池，避免频繁创建销毁
  const elementPool: HTMLElement[] = [];
  const POOL_SIZE = 100; // 元素池大小
  
  // 删除优化相关
  let deletionThreshold = 100; // 删除阈值，超过此数量才进行批量删除
  let pendingDeletions = 0; // 待删除的元素数量


  // 元素池管理
  const getElementFromPool = (): HTMLElement => {
    const element = elementPool.pop();
    if (element) {
      return element;
    } else {
      return document.createElement('div');
    }
  };

  const returnElementToPool = (element: HTMLElement) => {
    if (elementPool.length < POOL_SIZE) {
      // 清理元素内容
      element.innerHTML = '';
      element.className = '';
      element.removeAttribute('data-index');
      element.style.cssText = '';
      // 移除所有事件监听器（如果有的话）
      element.onclick = null;
      element.onmouseover = null;
      element.onmouseout = null;
      elementPool.push(element);
    }
  };

  // DOM操作方法
  const createLogElement = (log: LogEntry, index: number): HTMLElement => {
    const entry = getElementFromPool();
    entry.className = 'console-entry';
    entry.style.cssText = 'margin-bottom: 2px;';
    entry.setAttribute('data-index', index.toString());

    // 清空元素内容，确保从池中取出的元素是干净的
    entry.innerHTML = '';

    // 主日志行
    const line = document.createElement('div');
    line.className = 'console-line';
    line.style.cssText = 'display: flex; align-items: baseline; gap: 10px; line-height: 1.6; white-space: nowrap;';
    
    const time = document.createElement('span');
    time.className = 'time';
    time.style.cssText = 'color: #86efac;';
    time.textContent = formatTime(log.timestamp);
    
    const thread = document.createElement('span');
    thread.className = 'thread';
    thread.style.cssText = 'color: #a3e635;';
    thread.textContent = `[${log.threadName}]`;
    
    const level = document.createElement('span');
    level.className = `level lv-${log.level.toLowerCase()}`;
    level.style.cssText = 'font-weight: 700;';
    // 根据日志级别设置颜色
    const levelColors: { [key: string]: string } = {
      'trace': '#94a3b8',
      'debug': '#60a5fa', 
      'info': '#34d399',
      'warn': '#f59e0b',
      'error': '#f87171'
    };
    level.style.color = levelColors[log.level.toLowerCase()] || '#e5e7eb';
    level.textContent = log.level;
    
    const logger = document.createElement('span');
    logger.className = 'logger';
    logger.style.cssText = 'color: #93c5fd; text-decoration: underline dotted;';
    logger.textContent = log.loggerName;
    
    const dash = document.createElement('span');
    dash.className = 'dash';
    dash.style.cssText = 'color: #64748b;';
    dash.textContent = '-';
    
    const message = document.createElement('span');
    message.className = 'message';
    message.style.cssText = 'color: #e5e7eb;';
    message.textContent = log.message;
    
    line.appendChild(time);
    line.appendChild(thread);
    line.appendChild(level);
    line.appendChild(logger);
    line.appendChild(dash);
    line.appendChild(message);
    entry.appendChild(line);

    // ERROR 日志的堆栈跟踪
    if (log.level === 'ERROR' && log.stackTrace) {
      const stackTrace = document.createElement('div');
      stackTrace.className = 'stack-trace';
      stackTrace.style.cssText = 'margin-top: 4px; margin-left: 20px; border-left: 2px solid #f87171; padding-left: 10px; background: rgba(248, 113, 113, 0.05);';
      
      const throwableMessage = document.createElement('pre');
      throwableMessage.className = 'stack-trace-content';
      throwableMessage.style.cssText = 'color: #f87171; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; line-height: 1.4; margin: 0; padding: 4px 0; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;';
      throwableMessage.textContent = log.throwableMessage || '';
      
      const stackContent = document.createElement('pre');
      stackContent.className = 'stack-trace-content';
      stackContent.style.cssText = 'color: #f87171; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; line-height: 1.4; margin: 0; padding: 4px 0; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word;';
      stackContent.textContent = log.stackTrace;
      
      stackTrace.appendChild(throwableMessage);
      stackTrace.appendChild(stackContent);
      entry.appendChild(stackTrace);
    } else if (log.throwableMessage) {
      // 异常消息（非ERROR或没有stackTrace时显示）
      const errorDetails = document.createElement('div');
      errorDetails.className = 'error-details';
      errorDetails.style.cssText = 'margin-top: 4px; padding-left: 20px;';
      
      const errorMessage = document.createElement('span');
      errorMessage.className = 'error-message';
      errorMessage.style.cssText = 'color: #f87171; font-style: italic;';
      errorMessage.textContent = log.throwableMessage;
      
      errorDetails.appendChild(errorMessage);
      entry.appendChild(errorDetails);
    }

    return entry;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + '.' + ('00' + date.getMilliseconds()).slice(-3);
  };

  // 批量处理日志
  const processBatch = () => {
    if (pendingLogs.length === 0) return;

    const batch = pendingLogs.splice(0, BATCH_SIZE);
    
    // 使用 DocumentFragment 提高性能
    const fragment = document.createDocumentFragment();
    
    batch.forEach((log, index) => {
      // 简化索引计算：使用当前DOM元素数量作为起始索引
      const currentIndex = consoleContent.value ? consoleContent.value.children.length + index : index;
      const logElement = createLogElement(log, currentIndex);
      fragment.appendChild(logElement);
    });

    // 一次性插入DOM
    if (consoleContent.value) {
      consoleContent.value.appendChild(fragment);
    }

    // 如果还有待处理的日志，继续处理
    if (pendingLogs.length > 0) {
      batchTimer = setTimeout(processBatch, BATCH_DELAY);
    } else {
      batchTimer = null;
    }

    // 如果用户在底部，滚动到底部
    if (isAtBottom.value) {
      nextTick(() => {
        scrollToBottom();
      });
    }
  };

  // 调度批量处理
  const scheduleBatch = () => {
    if (batchTimer) return; // 如果已经在处理中，不重复调度
    batchTimer = setTimeout(processBatch, BATCH_DELAY);
  };

  // 延迟删除DOM元素
  const scheduleDeletion = () => {
    if (pendingDeletions >= deletionThreshold) {
      performDeletion();
    }
  };

  // 执行删除操作
  const performDeletion = () => {
    if (!consoleContent.value || pendingDeletions === 0) return;
    
    const elementsToPool: HTMLElement[] = [];
    
    // 直接删除元素，避免收集过程中的位置变化问题
    for (let i = 0; i < pendingDeletions; i++) {
      const firstChild = consoleContent.value.firstChild as HTMLElement;
      if (firstChild) {
        consoleContent.value.removeChild(firstChild);
        elementsToPool.push(firstChild);
      }
    }
    
    // 将元素返回到池中
    elementsToPool.forEach(element => returnElementToPool(element));
    
    // 更新剩余元素的索引
    updateElementIndices();
    
    // 重置待删除计数
    pendingDeletions = 0;
  };

  // 检查日志是否满足过滤条件
  const matchesFilters = (log: LogEntry): boolean => {
    // 检查日志级别过滤
    if (levels.value.length > 0 && levels.value.indexOf(log.level as LogLevel) === -1) {
      return false;
    }

    // 检查关键词过滤
    if (keyword.value.trim()) {
      const searchKeyword = keyword.value.toLowerCase().trim();
      const logMessage = log.message.toLowerCase();
      const logLogger = log.loggerName.toLowerCase();
      const logThread = log.threadName.toLowerCase();
      const logLevel = log.level.toLowerCase();
      
      // 支持多个关键词搜索（空格分隔）
      const keywords = searchKeyword.split(/\s+/).filter(k => k.length > 0);
      
      // 所有关键词都必须匹配
      for (const keyword of keywords) {
        if (!logMessage.includes(keyword) && 
            !logLogger.includes(keyword) && 
            !logThread.includes(keyword) &&
            !logLevel.includes(keyword)) {
          return false;
        }
      }
    }

    return true;
  };

  // 方法
  const addLog = (log: LogEntry) => {
    // 先检查过滤条件，不满足的直接抛弃
    if (!matchesFilters(log)) {
      return;
    }

    logs.value.push(log);

    // 限制日志数量，超出的删除最旧的（从开头删除）
    if (logs.value.length > maxLogs) {
      const removedCount = logs.value.length - maxLogs;
      logs.value.splice(0, removedCount);
      
      // 累积待删除的元素数量
      pendingDeletions += removedCount;
      
      // 如果达到删除阈值，执行批量删除
      scheduleDeletion();
    }

    // 添加到待处理队列
    pendingLogs.push(log);
    scheduleBatch();
  };

  const updateElementIndices = () => {
    if (!consoleContent.value) return;
    const entries = consoleContent.value.children;
    // 使用批量更新，减少DOM操作
    const updates: { element: HTMLElement; index: string }[] = [];
    
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i] as HTMLElement;
      updates.push({ element: entry, index: i.toString() });
    }
    
    // 批量应用更新
    updates.forEach(({ element, index }) => {
      element.setAttribute('data-index', index);
    });
  };

  const clearLogs = () => {
    logs.value = [];
    // 清空待处理队列
    pendingLogs = [];
    // 重置待删除计数
    pendingDeletions = 0;
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    // 高效清空DOM并将元素返回到池中
    if (consoleContent.value) {
      const children = Array.from(consoleContent.value.children) as HTMLElement[];
      
      // 将所有子元素返回到池中
      children.forEach(child => {
        returnElementToPool(child);
      });
      
      // 清空容器
      consoleContent.value.innerHTML = '';
    }
  };

  const connect = async () => {
    try {
      loading.value = true;
      error.value = null;
      await logService.connect();
    } catch (err) {
      error.value = err instanceof Error ? err.message : '连接失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const disconnect = () => {
    logService.disconnect();
  };

  const resetFilters = () => {
    keyword.value = '';
    levels.value = [];
    // 重置过滤条件后，重新过滤现有日志
    refilterExistingLogs();
    resetScroll();
  };

  // 重新过滤现有日志
  const refilterExistingLogs = () => {
    // 清空当前显示的日志和DOM
    if (consoleContent.value) {
      const children = Array.from(consoleContent.value.children) as HTMLElement[];
      children.forEach(child => returnElementToPool(child));
      consoleContent.value.innerHTML = '';
    }
    
    // 清空待处理队列
    pendingLogs = [];
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    
    // 重新过滤现有日志
    const filteredLogs = logs.value.filter(log => matchesFilters(log));
    logs.value = filteredLogs;
    
    // 将过滤后的日志添加到待处理队列
    if (filteredLogs.length > 0) {
      pendingLogs.push(...filteredLogs);
      scheduleBatch();
    }
  };

  // 滚动处理
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // 检查是否在底部（允许10px的误差）
    isAtBottom.value = scrollTop + clientHeight >= scrollHeight - 10;
  };

  const scrollToBottom = () => {
    if (scrollContainer.value) {
      const container = scrollContainer.value;
      
      // 如果是表格组件，需要找到表格的滚动容器
      const tableBody = (container as any)?.$el?.querySelector?.('.el-table__body-wrapper');
      if (tableBody) {
        tableBody.scrollTop = tableBody.scrollHeight;
      } else if ('scrollTop' in container && 'scrollHeight' in container) {
        (container as HTMLElement).scrollTop = (container as HTMLElement).scrollHeight;
      }
    }
  };

  const resetScroll = () => {
    // 滚动到底部，显示最新日志
    nextTick(() => {
        scrollToBottom();
      isAtBottom.value = true;
    });
  };

  const setContentHeight = (height: number) => {
    contentHeight.value = height;
  };

  const setConsoleContentRef = (ref: HTMLElement | null) => {
    consoleContent.value = ref;
  };

  // 防抖定时器
  let filterTimer: ReturnType<typeof setTimeout> | null = null;
  const FILTER_DELAY = 300; // 300ms防抖延迟

  // 应用过滤条件（带防抖）
  const applyFilters = () => {
    if (filterTimer) {
      clearTimeout(filterTimer);
    }
    
    filterTimer = setTimeout(() => {
      refilterExistingLogs();
      filterTimer = null;
    }, FILTER_DELAY);
  };

  // 强制滚动到底部的方法
  const forceScrollToBottom = () => {
    nextTick(() => {
      scrollToBottom();
      isAtBottom.value = true;
    });
  };

  // 生命周期管理
  let unsubscribeLog: (() => void) | null = null;
  let unsubscribeError: (() => void) | null = null;
  let unsubscribeStatus: (() => void) | null = null;

  onMounted(() => {
    // 订阅日志事件
    unsubscribeLog = logService.onLog(addLog);
    unsubscribeError = logService.onError((err) => {
      error.value = err.message;
    });
    unsubscribeStatus = logService.onStatusChange((status) => {
      connected.value = status;
      // 连接成功后清除错误提示
      if (status) {
        error.value = null;
      }
    });

    // 自动连接
    connect().catch(() => {
      // 连接失败，显示欢迎信息
      console.warn('无法连接到日志服务');
      
      // 延迟添加欢迎日志，确保DOM已经准备好
      nextTick(() => {
        // 添加欢迎日志
        const welcomeLogs: LogEntry[] = [
          {
            level: "INFO",
            loggerName: "com.vigil.system.Welcome",
            message: "🎉 欢迎使用 Vigil 日志监控系统！",
            timestamp: Date.now() - 5000,
            threadName: "welcome-thread",
          },
          {
            level: "INFO", 
            loggerName: "com.vigil.system.Welcome",
            message: "📊 系统正在尝试连接到日志服务...",
            timestamp: Date.now() - 4000,
            threadName: "welcome-thread",
          },
          {
            level: "WARN",
            loggerName: "com.vigil.system.Connection",
            message: "⚠️ 暂时无法连接到远程日志服务",
            timestamp: Date.now() - 3000,
            threadName: "connection-thread",
          },
          {
            level: "INFO",
            loggerName: "com.vigil.system.Welcome", 
            message: "💡 您可以使用搜索和过滤功能来查看日志",
            timestamp: Date.now() - 2000,
            threadName: "welcome-thread",
          },
          {
            level: "INFO",
            loggerName: "com.vigil.system.Welcome",
            message: "🔄 点击'重连'按钮手动重新连接",
            timestamp: Date.now() - 1000,
            threadName: "welcome-thread",
          }
        ];
        
        // 添加欢迎日志到日志列表
        logs.value.push(...welcomeLogs);
        // 添加到待处理队列
        pendingLogs.push(...welcomeLogs);
        
        // 确保控制台内容容器存在后再调度批量处理
        if (consoleContent.value) {
          scheduleBatch();
        } else {
          // 如果容器还不存在，延迟一点再试
          setTimeout(() => {
            if (consoleContent.value) {
              scheduleBatch();
            }
          }, 100);
        }
      });
    });
  });

  onBeforeUnmount(() => {
    // 清理订阅
    unsubscribeLog?.();
    unsubscribeError?.();
    unsubscribeStatus?.();

    // 清理定时器
    if (batchTimer) {
      clearTimeout(batchTimer);
    }
    if (filterTimer) {
      clearTimeout(filterTimer);
    }

    // 断开连接
    disconnect();
  });

  return {
    // 状态
    logs,
    connected,
    loading,
    error,

    // 过滤条件
    keyword,
    levels,

    // 日志显示
    contentHeight,
    isAtBottom,
    scrollContainer,
    consoleContent,

    // 方法
    connect,
    disconnect,
    clearLogs,
    resetFilters,
    applyFilters,
    handleScroll,
    resetScroll,
    setContentHeight,
    setConsoleContentRef,
    forceScrollToBottom,
  };
}