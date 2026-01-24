# Network Speed SDK

<div align="center">

一个基于 **Performance API** 的现代化网速测试 SDK，支持内外网自动检测、资源监听和完整的 TS 类型支持。

**框架无关 · 开箱即用 · 准确可靠**

[![npm version](https://img.shields.io/npm/v/network-speed-js.svg)](https://www.npmjs.com/package/network-speed-js)
[![License](https://img.shields.io/npm/l/network-speed-js.svg)](https://github.com/Sunny-117/network-speed-js/blob/main/LICENSE)

</div>

---

## 🎯 核心亮点

### 从 Axios 到 Performance API 的技术升级

本项目从 **v0.x（Axios 拦截器方案）** 完全重构为 **v1.0（Performance API 方案）**，实现了测速准确度和功能的质的飞跃。

**一句话总结：** 从"JavaScript 层面计时"升级到"浏览器底层性能监控"，测速更准确、功能更强大。

| 对比项 | 旧方案 (Axios) | 新方案 (Performance API) |
|--------|---------------|------------------------|
| 时间测量 | JS 层面（不准确） | 浏览器底层（准确） |
| 传输大小 | 需手动指定 | 自动获取真实值 |
| 详细时序 | ❌ 无 | ✅ DNS/TCP/TLS/下载 |
| 资源监听 | ❌ 不支持 | ✅ 支持所有资源 |
| 框架依赖 | ❌ 依赖 Axios | ✅ 零依赖 |

📖 详细技术对比请查看 [CHANGELOG.md](./CHANGELOG.md)

---

## ✨ 特性

- 🚀 **基于 Performance API** - 使用浏览器原生 API，准确测量真实下载速度
- 🔄 **内外网自动检测** - 智能切换内网/外网测速资源
- 📊 **完整的性能数据** - 提供速度、耗时、传输大小等详细信息
- 🎯 **资源监听** - 实时监听页面资源加载性能
- 💪 **TypeScript 支持** - 完整的类型定义
- 🌐 **框架无关** - 可用于 Vue、React、Angular 或原生 JavaScript 项目
- 📦 **轻量级** - 零依赖，体积小巧

## 📦 安装

```bash
npm install network-speed-js
```

## 🚀 快速开始

### 原生 JavaScript / TypeScript

**方式一：使用图片资源测速（推荐，默认模式，无需CORS）**

```typescript
import { NetworkSpeedSDK } from 'network-speed-js';

const sdk = new NetworkSpeedSDK({
  internetImageUrl: 'https://cdn.example.com/test-image.jpg',
  // 可选：内网图片URL
  intranetImageUrl: 'https://internal-cdn.com/test-image.jpg',
});

const result = await sdk.test();
console.log(`网速: ${result.speedMbps} Mbps`);
```

**方式二：使用任意资源测速（需要CORS支持）**

```typescript
import { NetworkSpeedSDK } from 'network-speed-js';

const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test-file.bin',
  useFetch: true, // 启用fetch模式
  // 可选：内网资源URL
  intranetUrl: 'https://internal-cdn.com/test-file.bin',
});

const result = await sdk.test();
console.log(`网速: ${result.speedMbps} Mbps`);
```

### Vue 3

```vue
<template>
  <button @click="testSpeed" :disabled="loading">
    {{ loading ? '测速中...' : '开始测速' }}
  </button>
  <div v-if="result">速度: {{ result.speedMbps }} Mbps</div>
</template>

<script setup>
import { ref } from 'vue';
import { NetworkSpeedSDK } from 'network-speed-js';

const loading = ref(false);
const result = ref(null);

const testSpeed = async () => {
  loading.value = true;
  const sdk = new NetworkSpeedSDK({
    internetImageUrl: 'https://cdn.example.com/test-image.jpg',
  });
  result.value = await sdk.test();
  loading.value = false;
};
</script>
```

### React

```tsx
import { useState } from 'react';
import { NetworkSpeedSDK } from 'network-speed-js';

function SpeedTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testSpeed = async () => {
    setLoading(true);
    const sdk = new NetworkSpeedSDK({
      internetImageUrl: 'https://cdn.example.com/test-image.jpg',
    });
    const data = await sdk.test();
    setResult(data);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={testSpeed} disabled={loading}>
        {loading ? '测速中...' : '开始测速'}
      </button>
      {result && <div>速度: {result.speedMbps} Mbps</div>}
    </div>
  );
}
```

### Angular

```typescript
import { Component } from '@angular/core';
import { NetworkSpeedSDK } from 'network-speed-js';

@Component({
  selector: 'app-speed-test',
  template: `
    <button (click)="testSpeed()" [disabled]="loading">
      {{ loading ? '测速中...' : '开始测速' }}
    </button>
    <div *ngIf="result">速度: {{ result.speedMbps }} Mbps</div>
  `
})
export class SpeedTestComponent {
  loading = false;
  result: any = null;

  async testSpeed() {
    this.loading = true;
    const sdk = new NetworkSpeedSDK({
      internetImageUrl: 'https://cdn.example.com/test-image.jpg',
    });
    this.result = await sdk.test();
    this.loading = false;
  }
}
```

## 📖 API 文档

### NetworkSpeedSDK

#### 构造函数

```typescript
new NetworkSpeedSDK(options?: SpeedTestOptions)
```

**参数说明：**
- `options`（可选）：配置选项
  - 如果传入配置，可以执行测速
  - 如果不传配置，只能使用工具函数（`getAllResourcesSpeeds`、`observeResource`）

**配置选项（两种模式）：**

**模式一：图片模式（默认，推荐）**

```typescript
interface ImageSpeedTestOptions {
  internetImageUrl: string;      // ✅ 必填：外网图片URL
  intranetImageUrl?: string;     // 可选：内网图片URL
  timeout?: number;              // 可选：超时时间 (ms)，默认 10000
  autoDetect?: boolean;          // 可选：是否自动检测内外网，默认 true
  thresholds?: {                 // 可选：网速评估阈值 (Mbps)
    fast: number;                // 默认 10
    medium: number;              // 默认 2
  };
}
```

**模式二：Fetch模式（支持任意资源，需要CORS）**

```typescript
interface FetchSpeedTestOptions {
  internetUrl: string;           // ✅ 必填：外网资源URL
  useFetch: true;                // ✅ 必填：启用fetch模式
  intranetUrl?: string;          // 可选：内网资源URL
  timeout?: number;              // 可选：超时时间 (ms)，默认 10000
  autoDetect?: boolean;          // 可选：是否自动检测内外网，默认 true
  thresholds?: {                 // 可选：网速评估阈值 (Mbps)
    fast: number;                // 默认 10
    medium: number;              // 默认 2
  };
}
```

**使用示例：**

```typescript
// ✅ 图片模式（只需要图片URL）
const sdk1 = new NetworkSpeedSDK({
  internetImageUrl: 'https://cdn.example.com/test.jpg',
});

// ✅ Fetch模式（需要URL + useFetch: true）
const sdk2 = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test.bin',
  useFetch: true,
});

// ✅ 无参数实例化（仅用于工具函数）
const sdk3 = new NetworkSpeedSDK();
const speeds = sdk3.getAllResourcesSpeeds(); // ✅ 可以使用
await sdk3.test(); // ❌ 会抛出错误：SDK未配置
```

#### 方法

##### `test(): Promise<SpeedTestResult>`

执行网速测试

```typescript
const result = await sdk.test();
// {
//   speedMbps: 45.23,
//   speedKBps: 5653.75,
//   networkType: 'fast',
//   isIntranet: true,
//   duration: 234.56,
//   transferSize: 1323456,
//   resourceUrl: '...'
// }
```

##### `observeResource(urlPattern: string, callback: Function): () => void`

监听特定资源的性能数据

```typescript
const stopObserver = sdk.observeResource('/api/', (entry) => {
  console.log('资源加载:', entry);
});

// 停止监听
stopObserver();
```

##### `updateOptions(options: Partial<SpeedTestOptions>): void`

更新配置

```typescript
sdk.updateOptions({ timeout: 15000 });
```

##### `destroy(): void`

销毁 SDK 实例

```typescript
sdk.destroy();
```

### 工具函数

```typescript
import {
  getAllResourcesSpeeds,
  calcSpeedByResource,
  evaluateNetworkType,
} from 'network-speed-js';

// 获取所有资源速度
const speeds = getAllResourcesSpeeds();

// 计算单个资源速度
const entry = performance.getEntriesByType('resource')[0];
const speed = calcSpeedByResource(entry);

// 评估网络类型
const type = evaluateNetworkType(15.5); // 'fast'
```

### 类型定义

```typescript
interface SpeedTestResult {
  speedMbps: number;        // 下载速度 (Mbps)
  speedKBps: number;        // 下载速度 (KB/s)
  networkType: 'fast' | 'medium' | 'slow' | 'unknown';
  isIntranet: boolean;      // 是否为内网
  duration: number;         // 测试耗时 (ms)
  transferSize: number;     // 传输大小 (bytes)
  resourceUrl: string;      // 测试资源URL
}

interface ResourceSpeedInfo {
  name: string;            // 资源名称
  speedMbps: number;       // 下载速度 (Mbps)
  speedKBps: number;       // 下载速度 (KB/s)
  downloadTime: number;    // 下载时间 (ms)
  transferSize: number;    // 传输大小 (bytes)
}
```

## 💡 使用示例

### 1. 使用图片资源测速（默认，推荐）

```typescript
const sdk = new NetworkSpeedSDK({
  internetImageUrl: 'https://cdn.example.com/test-image.jpg',
});

const result = await sdk.test();
```

### 2. 使用非图片资源测速（需要 CORS）

```typescript
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test-file.bin',
  useFetch: true, // 必须启用fetch模式
});

const result = await sdk.test();
```

### 3. 内外网自动检测

```typescript
// 图片模式
const sdk = new NetworkSpeedSDK({
  intranetImageUrl: 'https://internal-cdn.company.com/test.jpg',
  internetImageUrl: 'https://public-cdn.example.com/test.jpg',
  autoDetect: true,
});

// 或 Fetch模式
const sdk = new NetworkSpeedSDK({
  intranetUrl: 'https://internal-cdn.company.com/test.bin',
  internetUrl: 'https://public-cdn.example.com/test.bin',
  useFetch: true,
  autoDetect: true,
});

const result = await sdk.test();
console.log(result.isIntranet ? '内网环境' : '外网环境');
```

### 4. 首屏加载质量评估

```typescript
const result = await sdk.test();

if (result.networkType === 'slow') {
  // 降低图片质量
  // 禁用动画
  // 延迟加载非关键资源
}
```

### 3. 动态 CDN 选择

```typescript
const result = await sdk.test();
const cdnUrl = result.isIntranet 
  ? 'https://internal-cdn.com'
  : 'https://external-cdn.com';
```

### 4. 视频清晰度自适应

```typescript
const result = await sdk.test();
const quality = result.speedMbps > 10 ? '1080p' :
                result.speedMbps > 5 ? '720p' : '480p';
videoPlayer.setQuality(quality);
```

### 5. 监听 API 请求性能

```typescript
const stopObserver = sdk.observeResource('/api/', (entry) => {
  const downloadTime = entry.responseEnd - entry.responseStart;
  const speed = (entry.transferSize * 8) / downloadTime / 1000;
  console.log(`API 速度: ${speed.toFixed(2)} Mbps`);
});
```

### 6. CDN 智能选择

```typescript
class CDNSelector {
  async selectBestCDN() {
    const cdns = [
      'https://cdn-a.example.com/test.bin',
      'https://cdn-b.example.com/test.bin',
      'https://cdn-c.example.com/test.bin',
    ];

    const results = await Promise.all(
      cdns.map(async (url) => {
        const sdk = new NetworkSpeedSDK({ internetUrl: url });
        try {
          const result = await sdk.test();
          return { url, speed: result.speedMbps };
        } catch {
          return { url, speed: 0 };
        }
      })
    );

    return results.reduce((best, curr) => 
      curr.speed > best.speed ? curr : best
    );
  }
}
```

### 7. 网速监控和告警

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
    // 发送告警通知、记录日志、降级处理
  }
}

const monitor = new NetworkMonitor();
setInterval(() => monitor.monitor(), 60000); // 每分钟检测
```

## 🎨 框架集成

### Vue 3 自定义 Hook

```typescript
// useNetworkSpeed.ts
import { ref, onUnmounted } from 'vue';
import { NetworkSpeedSDK } from 'network-speed-js';

export function useNetworkSpeed(options = {}) {
  const isLoading = ref(false);
  const result = ref(null);
  const error = ref(null);
  const sdk = new NetworkSpeedSDK(options);

  const test = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      result.value = await sdk.test();
    } catch (err) {
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  };

  onUnmounted(() => sdk.destroy());

  return { isLoading, result, error, test };
}
```

使用：

```vue
<script setup>
import { useNetworkSpeed } from './useNetworkSpeed';

const { isLoading, result, error, test } = useNetworkSpeed({
  internetUrl: 'https://cdn.example.com/test.bin',
});
</script>
```

### React 自定义 Hook

```typescript
// useNetworkSpeed.ts
import { useState, useEffect, useCallback } from 'react';
import { NetworkSpeedSDK } from 'network-speed-js';

export function useNetworkSpeed(options = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sdk] = useState(() => new NetworkSpeedSDK(options));

  const test = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const testResult = await sdk.test();
      setResult(testResult);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  useEffect(() => () => sdk.destroy(), [sdk]);

  return { isLoading, result, error, test };
}
```

## ⚙️ 配置指南

### 测速资源准备

#### 服务端配置（Nginx）

```nginx
location /speed-test.bin {
    # 禁用缓存
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
    
    # 设置内容类型（根据实际文件类型调整）
    add_header Content-Type "application/octet-stream";
    
    # 启用 CORS
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

#### 生成测速文件

```bash
# 生成 500KB 的随机文件
dd if=/dev/urandom of=speed-test.bin bs=1024 count=500
```

**测速文件建议：**
- 文件大小：200KB ~ 1MB
- 文件类型：
  - 图片格式（推荐）：.jpg、.png、.webp（使用默认 `resourceType: 'image'`）
  - 其他格式：.bin、.json、.txt（需设置 `resourceType: 'fetch'` 并配置 CORS）
- 禁用缓存
- 启用 CORS（仅 fetch 模式需要）
- 使用 CDN 分发

**支持的资源类型：**
- ✅ 图片文件（.jpg、.png、.webp）- 默认模式，无需 CORS
- ✅ 二进制文件（.bin）- 需要 fetch 模式和 CORS
- ✅ 文本文件（.txt、.json）- 需要 fetch 模式和 CORS
- ✅ 任何可通过 HTTP 访问的资源 - 需要 fetch 模式和 CORS

### 配置项详解

#### intranetUrl

内网测速资源URL。如果配置了此项且 `autoDetect` 为 true，会优先尝试内网测速。

**建议：**
- 使用公司内部 CDN 资源
- 文件大小 200KB ~ 1MB
- 确保资源稳定可访问

#### internetUrl

外网测速资源URL。必填项。

**建议：**
- 使用公共 CDN 资源
- 文件大小 200KB ~ 1MB
- 选择地理位置接近用户的 CDN

#### timeout

单次测速的超时时间（毫秒）。

**建议值：**
- 快速网络：5000ms
- 一般网络：10000ms
- 慢速网络：15000ms

#### thresholds

网速评估阈值，用于判断网络类型。

```typescript
{
  fast: 10,    // >= 10 Mbps 为 'fast'
  medium: 2,   // >= 2 Mbps 为 'medium'
               // < 2 Mbps 为 'slow'
}
```

## 🔍 核心概念

### Performance API 是什么？

Performance API 是浏览器提供的原生性能监控接口，可以精确测量资源加载的各个阶段耗时。

### 测速原理

```
已知资源大小 ÷ 实际下载时间 = 当前有效下载速率
```

关键时间点：
- `responseStart`: 开始接收首字节（TTFB 结束）
- `responseEnd`: 资源下载完成
- `transferSize`: 实际网络传输字节数（含 header）

### 内外网检测原理

1. 先尝试请求内网资源
2. 如果内网资源超时或失败，自动切换到外网资源
3. 根据成功的资源判断当前网络环境

## 📊 Performance API vs 其他方案

| 方案 | 准确度 | 可控性 | 复杂度 | 推荐 |
|------|--------|--------|--------|------|
| Performance API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ✅ 主力 |
| Axios 拦截器 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 旧方案 |
| Network Info API | ⭐⭐ | ⭐ | ⭐ | 辅助 |
| WebRTC 测速 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 重量级 |

### 为什么从 Axios 升级到 Performance API？

**旧方案（Axios 拦截器）的局限：**

```typescript
// ❌ 旧方案问题
const start = Date.now();
await axios.get(url);
const end = Date.now();
const time = end - start; // 包含 JS 执行时间，不准确
```

- ❌ 只能测量 JavaScript 层面时间
- ❌ 无法获取真实网络传输大小
- ❌ 受浏览器缓存影响
- ❌ 需要手动指定文件大小

**新方案（Performance API）的优势：**

```typescript
// ✅ 新方案优势
const entry = performance.getEntriesByType('resource')[0];
const time = entry.responseEnd - entry.responseStart; // 纯网络时间
const size = entry.transferSize; // 真实传输字节数
```

- ✅ 浏览器底层 API，准确可靠
- ✅ 自动获取真实传输大小
- ✅ 可识别缓存命中
- ✅ 提供完整的加载时序

## ❓ 常见问题

### Q1: 测速结果不准确？

**可能原因：**
1. 测速文件太小（< 100KB）
2. 测速文件被缓存
3. CDN 未命中，回源慢

**解决方案：**
```typescript
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test-500kb.bin',
  timeout: 15000, // 增加超时时间
});
```

### Q2: 如何区分内外网？

```typescript
const sdk = new NetworkSpeedSDK({
  intranetUrl: 'https://internal.company.com/test.bin', // 只有内网能访问
  internetUrl: 'https://public-cdn.com/test.bin',       // 公网可访问
  autoDetect: true,
});

const result = await sdk.test();
console.log(result.isIntranet ? '内网' : '外网');
```

### Q3: 外网 CDN 超时怎么办？

```typescript
// 方案1: 增加超时时间
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test.bin',
  timeout: 20000, // 20秒
});

// 方案2: 使用多个 CDN 备份
async function testWithFallback() {
  const cdns = [
    'https://cdn1.example.com/test.bin',
    'https://cdn2.example.com/test.bin',
  ];

  for (const url of cdns) {
    try {
      const sdk = new NetworkSpeedSDK({ internetUrl: url });
      return await sdk.test();
    } catch (error) {
      console.warn(`CDN ${url} 失败，尝试下一个`);
    }
  }
  throw new Error('所有 CDN 都不可用');
}
```

### Q4: 移动端支持吗？

完全支持。Performance API 在现代移动浏览器中都可用。

**注意事项：**
- 移动网络波动大，建议多次测试取平均值
- 注意流量消耗
- 考虑 WiFi 和移动网络的切换

```typescript
// 检测网络类型
const connection = navigator.connection;
if (connection) {
  console.log('网络类型:', connection.effectiveType);
  console.log('下行速度估算:', connection.downlink, 'Mbps');
}
```

## 🚀 性能优化

### 1. 避免频繁测速

```typescript
// ❌ 不好的做法
setInterval(() => sdk.test(), 1000); // 每秒测速，浪费带宽

// ✅ 好的做法
let lastTestTime = 0;
const MIN_INTERVAL = 60000; // 最小间隔 1 分钟

async function testIfNeeded() {
  const now = Date.now();
  if (now - lastTestTime < MIN_INTERVAL) return;
  
  lastTestTime = now;
  await sdk.test();
}
```

### 2. 缓存测速结果

```typescript
class SpeedCache {
  private cache = null;
  private cacheTime = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 分钟

  async getSpeed(sdk) {
    const now = Date.now();
    if (this.cache && now - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }
    
    this.cache = await sdk.test();
    this.cacheTime = now;
    return this.cache;
  }
}
```

### 3. 错误处理

```typescript
async function testSpeed() {
  const sdk = new NetworkSpeedSDK({
    internetUrl: 'https://cdn.example.com/test.bin',
    timeout: 10000,
  });

  try {
    const result = await sdk.test();
    return result;
  } catch (error) {
    if (error.message.includes('超时')) {
      console.warn('测速超时，网络可能较慢');
    } else if (error.message.includes('加载失败')) {
      console.error('测速资源不可用');
    }
    throw error;
  }
}
```

## ⚠️ 注意事项

### Performance API 能做什么

✅ 基于真实资源加载评估下载速度  
✅ 获取详细的资源加载时序  
✅ 监听页面所有资源性能  
✅ 支持自定义测速资源  

### Performance API 不能做什么

❌ 测量上行速度（upload）  
❌ 测量丢包率  
❌ 测量 RTT 抖动  
❌ 脱离真实请求独立测速  

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 本地开发

```bash
# 克隆项目
git clone https://github.com/Sunny-117/network-speed-js.git
cd network-speed-js

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

### 项目结构

```
network-speed-js/
├── src/
│   ├── core/              # 核心功能
│   │   ├── speed-tester.ts
│   │   └── performance-utils.ts
│   ├── components/        # Vue 组件（可选）
│   ├── types.ts           # TypeScript 类型定义
│   ├── sdk.ts             # SDK 主入口
│   ├── index.ts           # 导出入口
│   ├── App.vue            # Demo 示例
│   └── main.ts            # 应用入口
├── dist/                  # 构建输出
├── CHANGELOG.md           # 更新日志
└── README.md              # 项目文档
```

## 📄 License

MIT License

## 🔗 相关链接

- [更新日志 (CHANGELOG)](./CHANGELOG.md)
- [Performance API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [PerformanceResourceTiming](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

---

<div align="center">

Made with ❤️ by [Sunny-117](https://github.com/Sunny-117)

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！

</div>
