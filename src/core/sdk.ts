import { SpeedTester } from './speed-tester';
import { getAllResourcesSpeeds } from './performance-utils';
import type { SpeedTestOptions, SpeedTestResult, ResourceSpeedInfo } from './types';

/**
 * 网速测试 SDK
 */
export class NetworkSpeedSDK {
  private tester: SpeedTester | null = null;

  /**
   * 创建SDK实例
   * @param options 配置选项（可选，如果不传则只能使用工具函数，不能执行测速）
   * 
   * @example
   * // 图片模式（默认，推荐）
   * const sdk = new NetworkSpeedSDK({
   *   internetImageUrl: 'https://cdn.example.com/test.jpg',
   * });
   * 
   * @example
   * // Fetch模式（需要CORS）
   * const sdk = new NetworkSpeedSDK({
   *   internetUrl: 'https://cdn.example.com/test.bin',
   *   useFetch: true,
   * });
   * 
   * @example
   * // 仅使用工具函数
   * const sdk = new NetworkSpeedSDK();
   * const speeds = sdk.getAllResourcesSpeeds();
   */
  constructor(options?: SpeedTestOptions) {
    if (options) {
      this.tester = new SpeedTester(options);
    }
  }

  /**
   * 执行网速测试
   * @throws {Error} 如果SDK未配置
   */
  async test(): Promise<SpeedTestResult> {
    if (!this.tester) {
      throw new Error(
        'SDK未配置，请在构造函数中传入配置选项。\n' +
        '示例：\n' +
        '  new NetworkSpeedSDK({ internetImageUrl: "https://cdn.example.com/test.jpg" })\n' +
        '或：\n' +
        '  new NetworkSpeedSDK({ internetUrl: "https://cdn.example.com/test.bin", useFetch: true })'
      );
    }
    return this.tester.test();
  }

  /**
   * 获取所有已加载资源的速度信息
   * @returns 资源速度信息数组
   */
  getAllResourcesSpeeds(): ResourceSpeedInfo[] {
    return getAllResourcesSpeeds();
  }

  /**
   * 监听特定资源的性能数据
   * @param urlPattern URL匹配模式
   * @param callback 回调函数
   * @returns 停止监听的函数
   */
  observeResource(
    urlPattern: string,
    callback: (entry: PerformanceResourceTiming) => void
  ): () => void {
    if (!this.tester) {
      // 如果没有配置，创建一个临时的tester用于监听
      this.tester = new SpeedTester({
        internetImageUrl: '',
      } as any);
    }
    return this.tester.observeResource(urlPattern, callback);
  }

  /**
   * 更新配置
   * @param options 新的配置选项
   */
  updateOptions(options: SpeedTestOptions): void {
    // 重新创建tester，因为配置类型可能改变
    this.tester = new SpeedTester(options);
  }

  /**
   * 销毁SDK实例
   */
  destroy(): void {
    if (this.tester) {
      this.tester.destroy();
      this.tester = null;
    }
  }
}

/**
 * 创建SDK实例的工厂函数
 * @param options 配置选项
 * @returns SDK实例
 * 
 * @example
 * const sdk = createNetworkSpeedSDK({
 *   internetImageUrl: 'https://cdn.example.com/test.jpg',
 * });
 */
export function createNetworkSpeedSDK(options?: SpeedTestOptions): NetworkSpeedSDK {
  return new NetworkSpeedSDK(options);
}

// 默认导出
export default NetworkSpeedSDK;
