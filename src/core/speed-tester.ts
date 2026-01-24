import type {
  SpeedTestResult,
  SpeedTestOptions,
  PerformanceEntryCallback,
} from '../types';
import { calcSpeedByResource, evaluateNetworkType, clearPerformanceEntry } from './performance-utils';

/**
 * 网速测试核心类
 */
export class SpeedTester {
  private options: Required<SpeedTestOptions>;
  private observer: PerformanceObserver | null = null;

  constructor(options: SpeedTestOptions = {}) {
    this.options = {
      intranetUrl: options.intranetUrl || '',
      internetUrl: options.internetUrl || '',
      timeout: options.timeout || 10000,
      autoDetect: options.autoDetect ?? true,
      thresholds: options.thresholds || { fast: 10, medium: 2 },
    };
  }

  /**
   * 执行测速
   */
  async test(): Promise<SpeedTestResult> {
    if (this.options.autoDetect) {
      return this.testWithAutoDetect();
    }
    
    return this.testSingleUrl(this.options.internetUrl, false);
  }

  /**
   * 自动检测内外网并测速
   */
  private async testWithAutoDetect(): Promise<SpeedTestResult> {
    // 先尝试内网
    if (this.options.intranetUrl) {
      try {
        const result = await this.testSingleUrl(this.options.intranetUrl, true);
        return result;
      } catch (error) {
        console.log('内网测速失败，切换到外网测速');
      }
    }

    // 内网失败，使用外网
    return this.testSingleUrl(this.options.internetUrl, false);
  }

  /**
   * 测试单个URL
   */
  private testSingleUrl(url: string, isIntranet: boolean): Promise<SpeedTestResult> {
    return new Promise((resolve, reject) => {
      // 添加时间戳防止缓存
      const testUrl = `${url}?t=${Date.now()}`;
      
      // 清除之前的性能记录
      clearPerformanceEntry(testUrl);

      // 创建 PerformanceObserver
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === 'resource' &&
            entry.name.includes(url)
          ) {
            const resourceEntry = entry as PerformanceResourceTiming;
            const speedInfo = calcSpeedByResource(resourceEntry);

            if (speedInfo) {
              const result: SpeedTestResult = {
                speedMbps: speedInfo.speedMbps,
                speedKBps: speedInfo.speedKBps,
                networkType: evaluateNetworkType(
                  speedInfo.speedMbps,
                  this.options.thresholds
                ),
                isIntranet,
                duration: speedInfo.downloadTime,
                transferSize: speedInfo.transferSize,
                resourceUrl: url,
              };

              observer.disconnect();
              resolve(result);
            }
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });

      // 创建图片请求
      const img = new Image();
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`测速超时: ${url}`));
      }, this.options.timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        observer.disconnect();
        reject(new Error(`资源加载失败: ${url}`));
      };

      img.src = testUrl;
    });
  }

  /**
   * 监听特定资源的性能数据
   */
  observeResource(urlPattern: string, callback: PerformanceEntryCallback): () => void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          entry.entryType === 'resource' &&
          entry.name.includes(urlPattern)
        ) {
          callback(entry as PerformanceResourceTiming);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    // 返回清理函数
    return () => observer.disconnect();
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<SpeedTestOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
