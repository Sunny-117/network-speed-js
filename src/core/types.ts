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
 * 基础配置选项
 */
interface BaseSpeedTestOptions {
  /** 超时时间 (ms) */
  timeout?: number;
  /** 是否自动检测内外网 */
  autoDetect?: boolean;
  /** 网速评估阈值 (Mbps) */
  thresholds?: {
    fast: number;
    medium: number;
  };
}

/**
 * 图片模式配置（默认，不受跨域限制）
 */
export interface ImageSpeedTestOptions extends BaseSpeedTestOptions {
  /** 内网测速图片URL */
  intranetImageUrl?: string;
  /** 外网测速图片URL（必填） */
  internetImageUrl: string;
}

/**
 * Fetch模式配置（支持任意资源，需要CORS）
 */
export interface FetchSpeedTestOptions extends BaseSpeedTestOptions {
  /** 内网测速资源URL */
  intranetUrl?: string;
  /** 外网测速资源URL（必填） */
  internetUrl: string;
  /** 使用fetch模式 */
  useFetch: true;
}

/**
 * SDK配置选项（联合类型）
 */
export type SpeedTestOptions = ImageSpeedTestOptions | FetchSpeedTestOptions;

/**
 * Performance Observer 回调参数
 */
export interface PerformanceEntryCallback {
  (entry: PerformanceResourceTiming): void;
}
