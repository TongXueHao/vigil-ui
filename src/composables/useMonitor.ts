/**
 * 监控管理 Composable
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { monitorService } from '@/services/api';
import type { JvmMetrics } from '@/types/monitor';

export function useMonitor() {
  // 状态
  const metrics = ref<JvmMetrics>();
  const error = ref<string | null>(null);
  const autoRefresh = ref(import.meta.env.VITE_MONITOR_AUTO_REFRESH);
  const refreshInterval = ref(parseInt(import.meta.env.VITE_MONITOR_REFRESH_INTERVAL));

  // 方法
  const refresh = async () => {
    try {
      error.value = null;
      const data = await monitorService.getJvmMetrics();
      metrics.value = data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取监控数据失败';
    }
  };

  // 格式化工具函数
  const formatBytes = (bytes: number): string => {
    if (bytes === -1) return '无限制';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatLoadAverage = (load: number): string => {
    if (load < 0) return '不可用';
    return load.toFixed(2);
  };

  const formatBytesWithMax = (bytes: number, maxBytes: number): string => {
    if (maxBytes < 0) {
      return '无限制';
    }
    return formatBytes(bytes);
  };

  // 定时器管理
  let timer: number | undefined;

  const startAutoRefresh = () => {
    if (timer) {
      clearInterval(timer);
    }

    if (autoRefresh.value) {
      timer = window.setInterval(() => {
        refresh();
      }, refreshInterval.value);
    }
  };

  const stopAutoRefresh = () => {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  // 监听自动刷新状态变化
  const updateAutoRefresh = () => {
    if (autoRefresh.value) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  // 设置刷新间隔
  const setRefreshInterval = (interval: number) => {
    refreshInterval.value = interval;
    if (autoRefresh.value) {
      startAutoRefresh(); // 重新启动定时器
    }
  };


  // 生命周期管理
  onMounted(() => {
    // 初始加载
    refresh();

    // 启动自动刷新
    if (autoRefresh.value) {
      startAutoRefresh();
    }
  });

  onBeforeUnmount(() => {
    stopAutoRefresh();
  });

  return {
    // 状态
    metrics,
    error,
    autoRefresh,
    refreshInterval,

    // 方法
    refresh,
    updateAutoRefresh,
    setRefreshInterval,

    // 工具函数
    formatBytes,
    formatDuration,
    formatPercentage,
    formatDateTime,
    formatLoadAverage,
    formatBytesWithMax,
  };
}