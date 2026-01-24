import type { ResourceSpeedInfo } from '../types';

/**
 * 计算单个资源的下载速度
 */
export function calcSpeedByResource(
  entry: PerformanceResourceTiming
): ResourceSpeedInfo | null {
  const downloadTime = entry.responseEnd - entry.responseStart;

  if (downloadTime <= 0 || entry.transferSize === 0) {
    return null;
  }

  // bytes/ms → Mbps
  const speedMbps = (entry.transferSize * 8) / downloadTime / 1000;
  
  // bytes/ms → KB/s
  const speedKBps = entry.transferSize / downloadTime;

  return {
    name: entry.name,
    speedMbps: Number(speedMbps.toFixed(2)),
    speedKBps: Number(speedKBps.toFixed(2)),
    downloadTime: Number(downloadTime.toFixed(2)),
    transferSize: entry.transferSize,
  };
}

/**
 * 获取所有资源的测速信息
 */
export function getAllResourcesSpeeds(): ResourceSpeedInfo[] {
  const resources = performance.getEntriesByType('resource');

  return resources
    .filter(
      (r): r is PerformanceResourceTiming =>
        r instanceof PerformanceResourceTiming && r.transferSize > 0
    )
    .map(calcSpeedByResource)
    .filter((item): item is ResourceSpeedInfo => item !== null);
}

/**
 * 清除指定URL的性能记录
 */
export function clearPerformanceEntry(url: string): void {
  const entries = performance.getEntriesByName(url);
  entries.forEach(() => {
    performance.clearResourceTimings();
  });
}

/**
 * 评估网络类型
 */
export function evaluateNetworkType(
  speedMbps: number,
  thresholds = { fast: 10, medium: 2 }
): 'fast' | 'medium' | 'slow' | 'unknown' {
  if (speedMbps >= thresholds.fast) {
    return 'fast';
  } else if (speedMbps >= thresholds.medium) {
    return 'medium';
  } else if (speedMbps > 0) {
    return 'slow';
  }
  return 'unknown';
}
