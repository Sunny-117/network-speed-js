# Network Speed SDK

<div align="center">

一个基于 **Performance API** 的现代化网速测试 SDK，支持内外网自动检测、资源监听和完整的 TypeScript 类型支持。

**框架无关 · 开箱即用 · 准确可靠**

[![npm version](https://img.shields.io/npm/v/network-speed-js.svg)](https://www.npmjs.com/package/network-speed-js)
[![License](https://img.shields.io/npm/l/network-speed-js.svg)](https://github.com/Sunny-117/network-speed-js/blob/main/LICENSE)

[English](./README.md) | 简体中文

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
# or
yarn add network-speed-js
# or
pnpm add network-speed-js
```

## 🚀 快速开始

### 原生 JavaScript / TypeScript

```typescript
import { NetworkSpeedSDK } from 'network-speed-js';

const sdk = new NetworkSpeedSDK({
  intranetUrl: 'https://your-intranet-cdn.com/test-file.bin',
  internetUrl: 'https://your-internet-cdn.com/test-file.bin',
  autoDetect: true, // 自动检测内外网
  timeout: 10000,   // 超时时间 10s
});

// 执行测速
const result = await sdk.test();

console.log(result);
// {
//   speedMbps: 45.23,        // 速度 (Mbps)
//   speedKBps: 5653.75,      // 速度 (KB/s)
//   networkType: 'fast',     // 网络类型: fast/medium/slow
//   isIntranet: true,        // 是否内网
//   duration: 234.56,        // 耗时 (ms)
//   transferSize: 1323456,   // 传输大小 (bytes)
//   resourceUrl: '...'       // 测试资源URL
// }
```

### Vue 3

```vue
<template>
  <button @click="testSpeed" :disabled="loading">
    {{ loading ? '测速中...' : '开始测速' }}
  </button>
  <div v-if="result">
    速度: {{ result.speedMbps }} Mbps
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { NetworkSpeedSDK } from 'network-speed-js';

const loading = ref(false);
const result = ref(null);

const testSpeed = async () => {
  loading.value = true;
  const sdk = new NetworkSpeedSDK({
    internetUrl: 'https://cdn.example.com/test.bin',
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
      internetUrl: 'https://cdn.example.com/test.bin',
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
      internetUrl: 'https://cdn.example.com/test.bin',
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

**SpeedTestOptions:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `intranetUrl` | `string` | `''` | 内网测速资源URL |
| `internetUrl` | `string` | `''` | 外网测速资源URL |
| `autoDetect` | `boolean` | `true` | 是否自动检测内外网 |
| `timeout` | `number` | `10000` | 超时时间 (ms) |
| `thresholds` | `object` | `{fast: 10, medium: 2}` | 网速评估阈值 (Mbps) |

#### 方法

##### `test(): Promise<SpeedTestResult>`

执行网速测试

```typescript
const result = await sdk.test();
```

##### `getAllResourcesSpeeds(): ResourceSpeedInfo[]`

获取页面所有已加载资源的速度信息

```typescript
import { getAllResourcesSpeeds } from 'network-speed-js';

const speeds = getAllResourcesSpeeds();
console.table(speeds);
```

##### `observeResource(urlPattern: string, callback: Function): () => void`

监听特定资源的性能数据

```typescript
const stopObserver = sdk.observeResource('api/data', (entry) => {
  console.log('资源加载:', entry);
});

// 停止监听
stopObserver();
```

##### `updateOptions(options: Partial<SpeedTestOptions>): void`

更新配置

```typescript
sdk.updateOptions({
  timeout: 15000,
  autoDetect: false,
});
```

##### `destroy(): void`

销毁 SDK 实例

```typescript
sdk.destroy();
```

### 类型定义

#### SpeedTestResult

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
```

#### ResourceSpeedInfo

```typescript
interface ResourceSpeedInfo {
  name: string;            // 资源名称
  speedMbps: number;       // 下载速度 (Mbps)
  speedKBps: number;       // 下载速度 (KB/s)
  downloadTime: number;    // 下载时间 (ms)
  transferSize: number;    // 传输大小 (bytes)
}
```

## 🎯 使用场景

### 1. 首屏加载质量评估

```typescript
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test.bin',
});
const result = await sdk.test();

if (result.networkType === 'slow') {
  // 降低图片质量
  // 禁用动画
  // 延迟加载非关键资源
}
```

### 2. 动态 CDN 选择

```typescript
const sdk = new NetworkSpeedSDK({
  intranetUrl: 'https://internal-cdn.com/test.bin',
  internetUrl: 'https://external-cdn.com/test.bin',
});

const result = await sdk.test();
const cdnUrl = result.isIntranet ? INTERNAL_CDN : EXTERNAL_CDN;
```

### 3. 视频清晰度自适应

```typescript
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test.bin',
});
const result = await sdk.test();

const quality = result.speedMbps > 10 ? '1080p' :
                result.speedMbps > 5 ? '720p' : '480p';

videoPlayer.setQuality(quality);
```

### 4. 监听 API 请求性能

```typescript
const sdk = new NetworkSpeedSDK();
const stopObserver = sdk.observeResource('/api/', (entry) => {
  const speed = calcSpeedByResource(entry);
  console.log(`API 请求速度: ${speed.speedMbps} Mbps`);
});
```

## 🔧 工具函数

SDK 还导出了一些实用的工具函数：

```typescript
import {
  calcSpeedByResource,
  getAllResourcesSpeeds,
  evaluateNetworkType,
} from 'network-speed-js';

// 计算单个资源速度
const entry = performance.getEntriesByType('resource')[0];
const speed = calcSpeedByResource(entry);

// 获取所有资源速度
const allSpeeds = getAllResourcesSpeeds();

// 评估网络类型
const type = evaluateNetworkType(15.5); // 'fast'
```

## ⚙️ 服务端配置建议

为了获得准确的测速结果，建议测速资源配置：

```nginx
# Nginx 配置示例
location /speed-test.bin {
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header Content-Type "application/octet-stream";
    add_header Access-Control-Allow-Origin "*";
}
```

**测速文件建议：**
- 文件大小：200KB ~ 1MB
- 禁用缓存
- 启用 CORS
- 使用 CDN 分发

## 📊 Performance API vs 其他方案

| 方案 | 准确度 | 可控性 | 复杂度 | 推荐 |
|------|--------|--------|--------|------|
| Performance API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ✅ 主力 |
| Axios 拦截器 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 旧方案 |
| Network Info API | ⭐⭐ | ⭐ | ⭐ | 辅助 |
| WebRTC 测速 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 重量级 |

### 为什么从 Axios 升级到 Performance API？

**旧方案（v0.x - Axios 拦截器）的局限：**

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

**新方案（v1.0 - Performance API）的优势：**

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

详细对比请查看 [CHANGELOG.md](./CHANGELOG.md)

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
├── EXAMPLES.md            # 使用示例
├── GUIDE.md               # 完整指南
└── README.md              # 项目文档
```

## 📄 License

MIT License

## 🔗 相关链接

- [更新日志 (CHANGELOG)](./CHANGELOG.md)
- [使用示例 (EXAMPLES)](./EXAMPLES.md)
- [完整指南 (GUIDE)](./GUIDE.md)
- [Performance API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [PerformanceResourceTiming](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)
- [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API)

