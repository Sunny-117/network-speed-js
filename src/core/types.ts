/**
 * 网速测试结果
 */
export interface SpeedTestResult {
  /** 下载速度 (Mbps) */
  speedMbps: number;
  /** 下载速度 (KB/s) */
  speedKBps: number;
  /** 网络类型评估 */
  networkType: 'fast' | 'medium' | 'slow' | 'unknown';
  /** 是否为内网 */
  isIntranet: boolean;
  /** 测试耗时 (ms) */
  duration: number;
  /** 传输大小 (bytes) */
  transferSize: number;
  /** 测试资源URL */
  resourceUrl: string;
}

/**
 * 资源测速信息
 */
export interface ResourceSpeedInfo {
  /** 资源名称 */
  name: string;
  /** 下载速度 (Mbps) */
  speedMbps: number;
  /** 下载速度 (KB/s) */
  speedKBps: number;
  /** 下载时间 (ms) */
  downloadTime: number;
  /** 传输大小 (bytes) */
  transferSize: number;
}

/**
 * 资源类型
 */
export type ResourceType = 'image' | 'fetch';

/**
 * SDK配置选项
 */
export interface SpeedTestOptions {
  /** 内网测速资源URL */
  intranetUrl?: string;
  /** 外网测速资源URL */
  internetUrl?: string;
  /** 超时时间 (ms) */
  timeout?: number;
  /** 是否自动检测内外网 */
  autoDetect?: boolean;
  /** 网速评估阈值 (Mbps) */
  thresholds?: {
    fast: number;
    medium: number;
  };
  /** 
   * 资源类型
   * - 'image': 使用 Image 对象加载（默认，不受跨域限制，适用于图片资源）
   * - 'fetch': 使用 fetch API 加载（需要服务器支持 CORS，适用于任意资源）
   */
  resourceType?: ResourceType;
}

/**
 * Performance Observer 回调参数
 */
export interface PerformanceEntryCallback {
  (entry: PerformanceResourceTiming): void;
}
