/**
 * 通用API类型定义
 */

// 通用API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 错误响应接口
export interface ErrorResponse {
  success: false;
  message: string;
  code: number;
  details?: any;
}
