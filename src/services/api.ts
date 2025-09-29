/**
 * API 服务层 - 统一管理所有接口调用
 */

// 导入类型定义
import type { ApiResponse } from '../types/api';
import type { LogEntry, LogQueryParams } from '../types/logs';
import type { JvmMetrics, HealthStatus } from '../types/monitor';

// 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 日志服务
 */
export class LogService {
  private eventSource: EventSource | null = null;
  private listeners: Set<(log: LogEntry) => void> = new Set();
  private errorListeners: Set<(error: Error) => void> = new Set();
  private statusListeners: Set<(connected: boolean) => void> = new Set();
  
  // 连接状态
  private reconnectTimer: number | null = null;
  private isConnecting = false;

  /**
   * 连接日志流
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('正在连接中，请稍候'));
        return;
      }

      this.isConnecting = true;
      this.clearReconnectTimer();

      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource(`${API_BASE_URL}/vigil/logs/stream`);
      
      this.eventSource.onopen = () => {
        console.log('日志流连接成功');
        this.isConnecting = false;
        this.notifyStatusListeners(true);
        resolve();
      };

      this.eventSource.onmessage = (event) => {
        try {
          // 检查数据是否为空
          if (!event.data || event.data.trim() === '') {
            console.warn('收到空的日志数据');
            return;
          }

          // 尝试解析JSON数据
          let logData;
          try {
            logData = JSON.parse(event.data);
          } catch (parseError) {
            console.error('JSON解析失败:', parseError);
            console.error('原始数据:', event.data);
            
            // 尝试处理非JSON格式的日志数据
            const fallbackLogEntry: LogEntry = {
              level: 'INFO',
              loggerName: 'system',
              message: event.data,
              timestamp: Date.now(),
              threadName: 'main'
            };
            this.notifyLogListeners(fallbackLogEntry);
            return;
          }

          // 验证必要字段
          if (!logData || typeof logData !== 'object') {
            console.warn('日志数据格式不正确:', logData);
            return;
          }

          // 构建日志条目，提供默认值
          const logEntry: LogEntry = {
            level: logData.level || 'INFO',
            loggerName: logData.loggerName || 'unknown',
            message: logData.message || '',
            timestamp: logData.timestamp || Date.now(),
            threadName: logData.threadName || 'main',
            throwableMessage: logData.throwableMessage,
            stackTrace: logData.stackTrace
          };

          // 验证时间戳
          if (typeof logEntry.timestamp !== 'number' || logEntry.timestamp <= 0) {
            logEntry.timestamp = Date.now();
          }

          // 验证日志级别
          const validLevels = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];
          if (validLevels.indexOf(logEntry.level) === -1) {
            logEntry.level = 'INFO';
          }

          this.notifyLogListeners(logEntry);
        } catch (error) {
          console.error('处理日志数据时发生错误:', error);
          console.error('原始数据:', event.data);
          
          // 创建错误日志条目而不是抛出错误
          const errorLogEntry: LogEntry = {
            level: 'ERROR',
            loggerName: 'system.parser',
            message: `解析日志数据失败: ${error instanceof Error ? error.message : '未知错误'}`,
            timestamp: Date.now(),
            threadName: 'main',
            throwableMessage: event.data ? `原始数据: ${event.data.substring(0, 200)}...` : '无数据'
          };
          
          this.notifyLogListeners(errorLogEntry);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('EventSource连接错误:', error);
        console.error('连接状态:', this.eventSource?.readyState);
        
        this.isConnecting = false;
        this.notifyStatusListeners(false);
        
        // 提供更详细的错误信息
        let errorMessage = '日志流连接失败';
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          errorMessage = '日志流连接已关闭';
        } else if (this.eventSource?.readyState === EventSource.CONNECTING) {
          errorMessage = '日志流连接超时';
        }
        
        // 不自动重连，直接显示错误
        console.log('连接失败，不进行自动重连');
        this.notifyErrorListeners(new Error(errorMessage));
        reject(new Error(errorMessage));
      };
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.clearReconnectTimer();
    this.isConnecting = false;
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.notifyStatusListeners(false);
    }
  }

  /**
   * 清理重连定时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 添加日志监听器
   */
  onLog(callback: (log: LogEntry) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 添加错误监听器
   */
  onError(callback: (error: Error) => void): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  /**
   * 添加连接状态监听器
   */
  onStatusChange(callback: (connected: boolean) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private notifyLogListeners(log: LogEntry): void {
    this.listeners.forEach(callback => callback(log));
  }

  private notifyErrorListeners(error: Error): void {
    this.errorListeners.forEach(callback => callback(error));
  }

  private notifyStatusListeners(connected: boolean): void {
    this.statusListeners.forEach(callback => callback(connected));
  }

  /**
   * 获取历史日志
   */
  async getHistoryLogs(params: LogQueryParams = {}): Promise<LogEntry[]> {
    const searchParams = new URLSearchParams();
    
    if (params.level?.length) {
      searchParams.append('levels', params.level.join(','));
    }
    if (params.keyword) {
      searchParams.append('keyword', params.keyword);
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      searchParams.append('offset', params.offset.toString());
    }

    const response = await fetch(`${API_BASE_URL}/logs/history?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`获取历史日志失败: ${response.statusText}`);
    }

    const result: ApiResponse<LogEntry[]> = await response.json();
    return result.data || [];
  }
}

/**
 * 监控服务
 */
export class MonitorService {
  /**
   * 获取 JVM 指标
   */
  async getJvmMetrics(): Promise<JvmMetrics> {
    const response = await fetch(`${API_BASE_URL}/vigil/metrics`);
    
    if (!response.ok) {
      throw new Error(`获取 JVM 指标失败: ${response.statusText}`);
    }

    const result: JvmMetrics = await response.json();
    return result;
  }

  /**
   * 获取系统健康状态
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const response = await fetch(`${API_BASE_URL}/actuator/health`);
    
    if (!response.ok) {
      throw new Error(`获取健康状态失败: ${response.statusText}`);
    }

    return await response.json();
  }
}

// 导出服务实例
export const logService = new LogService();
export const monitorService = new MonitorService();
