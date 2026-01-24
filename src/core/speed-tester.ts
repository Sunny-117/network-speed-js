import type {
  SpeedTestResult,
  SpeedTestOptions,
  PerformanceEntryCallback,
} from './types';
import { calcSpeedByResource, evaluateNetworkType, clearPerformanceEntry } from './performance-utils';

/**
 * 内部标准化配置
 */
interface NormalizedOptions {
  intranetUrl: string;
  internetUrl: string;
  timeout: number;
  autoDetect: boolean;
  thresholds: { fast: number; medium: number };
  useFetch: boolean;
}

/**
 * 网速测试核心类
 */
export class SpeedTester {
  private options: NormalizedOptions;
  private observer: PerformanceObserver | null = null;

  constructor(options: SpeedTestOptions) {
    // 验证并标准化配置
    if ('useFetch' in options && options.useFetch) {
      // Fetch 模式
      if (!options.internetUrl) {
        throw new Error('Fetch模式必须提供 internetUrl 参数');
      }
      if (!options.internetUrl.startsWith('http://') && !options.internetUrl.startsWith('https://')) {
        throw new Error('internetUrl 必须是完整的HTTP/HTTPS URL');
      }
      
      this.options = {
        intranetUrl: options.intranetUrl || '',
        internetUrl: options.internetUrl,
        timeout: options.timeout || 10000,
        autoDetect: options.autoDetect ?? true,
        thresholds: options.thresholds || { fast: 10, medium: 2 },
        useFetch: true,
      };
    } else {
      // Image 模式（默认）
      const internetImageUrl = 'internetImageUrl' in options ? options.internetImageUrl : '';
      
      if (!internetImageUrl) {
        throw new Error('图片模式必须提供 internetImageUrl 参数');
      }
      if (!internetImageUrl.startsWith('http://') && !internetImageUrl.startsWith('https://')) {
        throw new Error('internetImageUrl 必须是完整的HTTP/HTTPS URL');
      }
      
      this.options = {
        intranetUrl: 'intranetImageUrl' in options ? options.intranetImageUrl || '' : '',
        internetUrl: internetImageUrl,
        timeout: options.timeout || 10000,
        autoDetect: options.autoDetect ?? true,
        thresholds: options.thresholds || { fast: 10, medium: 2 },
        useFetch: false,
      };
    }
    
    // 验证内网URL（如果提供）
    if (this.options.intranetUrl) {
      if (!this.options.intranetUrl.startsWith('http://') && !this.options.intranetUrl.startsWith('https://')) {
        throw new Error('intranetUrl/intranetImageUrl 必须是完整的HTTP/HTTPS URL');
      }
    }
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
            
            // 检查 transferSize 是否为 0（跨域资源未设置 Timing-Allow-Origin）
            if (resourceEntry.transferSize === 0) {
              observer.disconnect();
              
              // 构建详细的错误信息
              const errorDetails = [
                '❌ 无法获取资源大小（transferSize = 0）',
                '',
                '📋 可能原因：',
                '  1. 跨域资源未设置 Timing-Allow-Origin 响应头（最常见）',
                '  2. 资源被浏览器缓存',
                '  3. 资源加载失败或网络错误',
                '',
                '✅ 解决方案：',
                '  在服务端添加响应头：',
                '  Timing-Allow-Origin: *',
                '',
                '📖 Nginx 配置示例：',
                '  location /test-image.jpg {',
                '    add_header Timing-Allow-Origin "*";',
                '    add_header Cache-Control "no-store";',
                '  }',
                '',
                `🔗 问题资源: ${url}`,
                '',
                '💡 提示：',
                '  - 使用同域资源可避免此问题',
                '  - 查看文档了解更多: README.md Q5',
              ].join('\n');
              
              reject(new Error(errorDetails));
              return;
            }
            
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

      // 设置超时
      const timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`测速超时: ${url}`));
      }, this.options.timeout) as unknown as number;

      // 根据配置选择加载方式
      if (this.options.useFetch) {
        // 使用 fetch 请求资源（需要 CORS 支持）
        this.loadWithFetch(testUrl, timeoutId, observer, reject);
      } else {
        // 使用 Image 对象加载（默认，不受跨域限制）
        this.loadWithImage(testUrl, timeoutId, observer, reject);
      }
    });
  }

  /**
   * 使用 Image 对象加载资源（默认方式，不受跨域限制）
   */
  private loadWithImage(
    url: string,
    timeoutId: number,
    observer: PerformanceObserver,
    reject: (reason: Error) => void
  ): void {
    const img = new Image();

    img.onload = () => {
      clearTimeout(timeoutId);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      reject(new Error(`图片加载失败: ${url}`));
    };

    img.src = url;
  }

  /**
   * 使用 fetch API 加载资源（需要 CORS 支持）
   */
  private loadWithFetch(
    url: string,
    timeoutId: number,
    observer: PerformanceObserver,
    reject: (reason: Error) => void
  ): void {
    fetch(url, {
      method: 'GET',
      cache: 'no-store', // 禁用缓存
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // 读取响应体以确保完整下载
        return response.blob();
      })
      .then(() => {
        clearTimeout(timeoutId);
        // Performance Observer 会自动捕获性能数据
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        observer.disconnect();
        reject(new Error(`资源加载失败: ${error.message}`));
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
  updateOptions(options: Partial<NormalizedOptions>): void {
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
