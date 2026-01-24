import { SpeedTester } from './speed-tester';
import { getAllResourcesSpeeds } from './performance-utils';
import type { SpeedTestOptions, SpeedTestResult, ResourceSpeedInfo } from './types';

/**
 * 网速测试 SDK
 */
export class NetworkSpeedSDK {
  private tester: SpeedTester;

  constructor(options: SpeedTestOptions = {}) {
    this.tester = new SpeedTester(options);
  }

  /**
   * 执行网速测试
   */
  async test(): Promise<SpeedTestResult> {
    return this.tester.test();
  }

  /**
   * 获取所有已加载资源的速度信息
   */
  getAllResourcesSpeeds(): ResourceSpeedInfo[] {
    return getAllResourcesSpeeds();
  }

  /**
   * 监听特定资源的性能数据
   */
  observeResource(
    urlPattern: string,
    callback: (entry: PerformanceResourceTiming) => void
  ): () => void {
    return this.tester.observeResource(urlPattern, callback);
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<SpeedTestOptions>): void {
    this.tester.updateOptions(options);
  }

  /**
   * 销毁SDK实例
   */
  destroy(): void {
    this.tester.destroy();
  }
}

/**
 * 创建SDK实例的工厂函数
 */
export function createNetworkSpeedSDK(options?: SpeedTestOptions): NetworkSpeedSDK {
  return new NetworkSpeedSDK(options);
}

// 默认导出
export default NetworkSpeedSDK;
