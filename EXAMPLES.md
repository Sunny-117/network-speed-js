# 使用示例

## 基础示例

### 1. 简单测速

```typescript
import { NetworkSpeedSDK } from 'network-speed-js';

const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test-file.bin',
});

const result = await sdk.test();
console.log(`网速: ${result.speedMbps} Mbps`);
```

### 2. 内外网自动检测

```typescript
const sdk = new NetworkSpeedSDK({
  intranetUrl: 'https://internal-cdn.company.com/test.bin',
  internetUrl: 'https://public-cdn.example.com/test.bin',
  autoDetect: true,
});

const result = await sdk.test();

if (result.isIntranet) {
  console.log('当前在内网环境');
} else {
  console.log('当前在外网环境');
}
```

## Vue 3 集成示例

### 自定义 Hook

```typescript
// useNetworkSpeed.ts
import { ref, onUnmounted } from 'vue';
import { NetworkSpeedSDK } from 'network-speed-js';
import type { SpeedTestResult } from 'network-speed-js';

export function useNetworkSpeed(options = {}) {
  const isLoading = ref(false);
  const result = ref<SpeedTestResult | null>(null);
  const error = ref<Error | null>(null);

  const sdk = new NetworkSpeedSDK(options);

  const test = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      result.value = await sdk.test();
    } catch (err) {
      error.value = err as Error;
    } finally {
      isLoading.value = false;
    }
  };

  onUnmounted(() => {
    sdk.destroy();
  });

  return {
    isLoading,
    result,
    error,
    test,
  };
}
```

使用 Hook：

```vue
<template>
  <div>
    <button @click="test" :disabled="isLoading">
      {{ isLoading ? '测速中...' : '开始测速' }}
    </button>
    
    <div v-if="result">
      速度: {{ result.speedMbps }} Mbps
    </div>
    
    <div v-if="error">
      错误: {{ error.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNetworkSpeed } from './useNetworkSpeed';

const { isLoading, result, error, test } = useNetworkSpeed({
  internetUrl: 'https://cdn.example.com/test.bin',
});
</script>
```

## React 集成示例

### 自定义 Hook

```typescript
// useNetworkSpeed.ts
import { useState, useEffect, useCallback } from 'react';
import { NetworkSpeedSDK } from 'network-speed-js';
import type { SpeedTestResult, SpeedTestOptions } from 'network-speed-js';

export function useNetworkSpeed(options: SpeedTestOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [sdk] = useState(() => new NetworkSpeedSDK(options));

  const test = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testResult = await sdk.test();
      setResult(testResult);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  useEffect(() => {
    return () => {
      sdk.destroy();
    };
  }, [sdk]);

  return { isLoading, result, error, test };
}
```

使用示例：

```tsx
import { useNetworkSpeed } from './useNetworkSpeed';

function SpeedTest() {
  const { isLoading, result, error, test } = useNetworkSpeed({
    internetUrl: 'https://cdn.example.com/test.bin',
  });

  return (
    <div>
      <button onClick={test} disabled={isLoading}>
        {isLoading ? '测速中...' : '开始测速'}
      </button>
      
      {result && (
        <div>
          <p>速度: {result.speedMbps} Mbps</p>
          <p>网络类型: {result.networkType}</p>
        </div>
      )}
      
      {error && <p>错误: {error.message}</p>}
    </div>
  );
}
```

## 高级用法

### 1. 监听所有 API 请求性能

```typescript
const sdk = new NetworkSpeedSDK();

const stopObserver = sdk.observeResource('/api/', (entry) => {
  const downloadTime = entry.responseEnd - entry.responseStart;
  const speed = (entry.transferSize * 8) / downloadTime / 1000;
  
  console.log(`API: ${entry.name}`);
  console.log(`速度: ${speed.toFixed(2)} Mbps`);
  console.log(`耗时: ${downloadTime.toFixed(2)} ms`);
});

// 停止监听
// stopObserver();
```

### 2. 获取页面所有资源速度

```typescript
import { getAllResourcesSpeeds } from 'network-speed-js';

const speeds = getAllResourcesSpeeds();

// 找出最慢的资源
const slowest = speeds.reduce((prev, curr) => 
  curr.speedMbps < prev.speedMbps ? curr : prev
);

console.log('最慢的资源:', slowest);
```

### 3. 动态调整资源质量

```typescript
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test.bin',
});

const result = await sdk.test();

// 根据网速选择图片质量
function getImageQuality(speedMbps: number) {
  if (speedMbps > 10) return 'high';
  if (speedMbps > 5) return 'medium';
  return 'low';
}

const quality = getImageQuality(result.speedMbps);

// 应用到图片加载
const imageUrl = `https://cdn.example.com/image-${quality}.jpg`;
```

### 4. 网速监控和告警

```typescript
class NetworkMonitor {
  private sdk: NetworkSpeedSDK;
  private threshold = 2; // Mbps

  constructor() {
    this.sdk = new NetworkSpeedSDK({
      internetUrl: 'https://cdn.example.com/test.bin',
    });
  }

  async monitor() {
    const result = await this.sdk.test();
    
    if (result.speedMbps < this.threshold) {
      this.alert('网速过慢', result);
    }
    
    return result;
  }

  private alert(message: string, result: SpeedTestResult) {
    console.warn(message, result);
    // 发送告警通知
    // 记录日志
    // 降级处理
  }
}

const monitor = new NetworkMonitor();
setInterval(() => monitor.monitor(), 60000); // 每分钟检测一次
```

### 5. CDN 智能选择

```typescript
class CDNSelector {
  private cdnList = [
    { name: 'CDN-A', url: 'https://cdn-a.example.com/test.bin' },
    { name: 'CDN-B', url: 'https://cdn-b.example.com/test.bin' },
    { name: 'CDN-C', url: 'https://cdn-c.example.com/test.bin' },
  ];

  async selectBestCDN() {
    const results = await Promise.all(
      this.cdnList.map(async (cdn) => {
        const sdk = new NetworkSpeedSDK({
          internetUrl: cdn.url,
        });
        
        try {
          const result = await sdk.test();
          return { ...cdn, speed: result.speedMbps };
        } catch {
          return { ...cdn, speed: 0 };
        }
      })
    );

    // 选择最快的 CDN
    const best = results.reduce((prev, curr) => 
      curr.speed > prev.speed ? curr : prev
    );

    console.log('最佳 CDN:', best.name, best.speed, 'Mbps');
    return best;
  }
}

const selector = new CDNSelector();
const bestCDN = await selector.selectBestCDN();
```

## 工具函数示例

### 使用独立工具函数

```typescript
import {
  calcSpeedByResource,
  getAllResourcesSpeeds,
  evaluateNetworkType,
} from 'network-speed-js';

// 1. 计算特定资源速度
const resources = performance.getEntriesByType('resource');
const imageResources = resources.filter(r => 
  r.name.includes('.jpg') || r.name.includes('.png')
);

imageResources.forEach(entry => {
  const speed = calcSpeedByResource(entry as PerformanceResourceTiming);
  if (speed) {
    console.log(`${speed.name}: ${speed.speedMbps} Mbps`);
  }
});

// 2. 获取所有资源速度并排序
const allSpeeds = getAllResourcesSpeeds();
const sorted = allSpeeds.sort((a, b) => b.speedMbps - a.speedMbps);

console.log('最快的 5 个资源:');
sorted.slice(0, 5).forEach(speed => {
  console.log(`${speed.name}: ${speed.speedMbps} Mbps`);
});

// 3. 评估网络类型
const avgSpeed = allSpeeds.reduce((sum, s) => sum + s.speedMbps, 0) / allSpeeds.length;
const networkType = evaluateNetworkType(avgSpeed);

console.log(`平均速度: ${avgSpeed.toFixed(2)} Mbps`);
console.log(`网络类型: ${networkType}`);
```

## TypeScript 类型使用

```typescript
import type {
  SpeedTestResult,
  SpeedTestOptions,
  ResourceSpeedInfo,
  PerformanceEntryCallback,
} from 'network-speed-js';

// 自定义配置
const options: SpeedTestOptions = {
  intranetUrl: 'https://internal.example.com/test.bin',
  internetUrl: 'https://external.example.com/test.bin',
  timeout: 15000,
  autoDetect: true,
  thresholds: {
    fast: 15,
    medium: 5,
  },
};

// 处理结果
function handleResult(result: SpeedTestResult) {
  console.log(`速度: ${result.speedMbps} Mbps`);
  console.log(`类型: ${result.networkType}`);
}

// 自定义回调
const callback: PerformanceEntryCallback = (entry) => {
  console.log('资源加载:', entry.name);
};
```
