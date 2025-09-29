/**
 * 日志相关类型定义
 */

// 日志等级类型
export type LogLevel = "TRACE" | "DEBUG" | "INFO" | "WARN" | "ERROR";

// 日志条目接口
export interface LogEntry {
  level: string;
  loggerName: string;
  message: string;
  timestamp: number;
  threadName: string;
  throwableMessage?: string;
  stackTrace?: string;
}

// 日志查询参数
export interface LogQueryParams {
  level?: LogLevel[];
  keyword?: string;
  limit?: number;
  offset?: number;
}

// 日志服务事件类型
export interface LogServiceEvents {
  onLog: (callback: (log: LogEntry) => void) => () => void;
  onError: (callback: (error: Error) => void) => () => void;
  onStatusChange: (callback: (connected: boolean) => void) => () => void;
}
