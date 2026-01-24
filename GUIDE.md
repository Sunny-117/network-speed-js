# Network Speed SDK 完整指南

## 目录

1. [核心概念](#核心概念)
2. [为什么选择 Performance API](#为什么选择-performance-api)
3. [快速开始](#快速开始)
4. [配置说明](#配置说明)
5. [最佳实践](#最佳实践)
6. [常见问题](#常见问题)
7. [性能优化](#性能优化)

## 核心概念

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

## 为什么选择 Performance API

### 对比其他方案

#### 1. Axios 拦截器方案（旧版本）

```typescript
// ❌ 旧方案的问题
const io = axios.create();
io.interceptors.request.use((request) => {
  start = new Date().getTime(); // 不准确
  return request;
});
```

**问题：**
- 只能测量 JavaScript 层面的时间
- 无法获取真实的网络传输时间
- 受浏览器缓存影响
- 无法获取传输大小

#### 2. Performance API 方案（新版本）

```typescript
// ✅ 新方案的优势
const entry = performance.getEntriesByType('resource')[0];
const downloadTime = entry.responseEnd - entry.responseStart;
const speed = (entry.transferSize * 8) / downloadTime / 1000;
```

**优势：**
- 浏览器原生 API，准确可靠
- 获取真实的网络传输时间
- 可以获取实际传输大小
- 支持监听所有资源

### 对比表

| 特性 | Axios 拦截器 | Performance API | Network Info API |
|------|-------------|-----------------|------------------|
| 准确度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 传输大小 | ❌ | ✅ | ❌ |
| 真实网络时间 | ❌ | ✅ | ❌ |
| 资源监听 | ❌ | ✅ | ❌ |
| 浏览器支持 | ✅ | ✅ | 部分 |

## 快速开始

### 安装

```bash
npm install network-speed-js
```

### 基础使用

```typescript
import { NetworkSpeedSDK } from 'network-speed-js';

// 1. 创建实例
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test-file.bin',
});

// 2. 执行测速
const result = await sdk.test();

// 3. 使用结果
console.log(`网速: ${result.speedMbps} Mbps`);
console.log(`网络类型: ${result.networkType}`);
```

## 配置说明

### 完整配置示例

```typescript
const sdk = new NetworkSpeedSDK({
  // 内网测速资源URL
  intranetUrl: 'https://internal-cdn.company.com/test.bin',
  
  // 外网测速资源URL
  internetUrl: 'https://public-cdn.example.com/test.bin',
  
  // 是否自动检测内外网（默认 true）
  autoDetect: true,
  
  // 超时时间（毫秒，默认 10000）
  timeout: 10000,
  
  // 网速评估阈值（Mbps）
  thresholds: {
    fast: 10,    // >= 10 Mbps 为快速
    medium: 2,   // >= 2 Mbps 为中速
  },
});
```

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

#### autoDetect

是否自动检测内外网。

- `true`: 先尝试内网，失败后使用外网
- `false`: 直接使用 `internetUrl`

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

## 最佳实践

### 1. 测速资源准备

#### 服务端配置

```nginx
# Nginx 配置
location /speed-test.bin {
    # 禁用缓存
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
    
    # 设置内容类型
    add_header Content-Type "application/octet-stream";
    
    # 启用 CORS
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    
    # 启用压缩（可选）
    gzip off;
}
```

#### 生成测速文件

```bash
# 生成 500KB 的随机文件
dd if=/dev/urandom of=speed-test.bin bs=1024 count=500
```

### 2. 错误处理

```typescript
async function testSpeed() {
  const sdk = new NetworkSpeedSDK({
    internetUrl: 'https://cdn.example.com/test.bin',
    timeout: 10000,
  });

  try {
    const result = await sdk.test();
    
    // 成功处理
    handleSuccess(result);
    
  } catch (error) {
    if (error.message.includes('超时')) {
      // 超时处理
      console.warn('测速超时，网络可能较慢');
      handleSlowNetwork();
    } else if (error.message.includes('加载失败')) {
      // 资源加载失败
      console.error('测速资源不可用');
      handleResourceError();
    } else {
      // 其他错误
      console.error('测速失败:', error);
    }
  }
}
```

### 3. 结果应用

#### 动态资源质量

```typescript
const result = await sdk.test();

// 根据网速选择资源质量
const config = {
  fast: {
    imageQuality: 'high',
    videoQuality: '1080p',
    enableAnimations: true,
  },
  medium: {
    imageQuality: 'medium',
    videoQuality: '720p',
    enableAnimations: true,
  },
  slow: {
    imageQuality: 'low',
    videoQuality: '480p',
    enableAnimations: false,
  },
};

const settings = config[result.networkType] || config.medium;
applySettings(settings);
```

#### CDN 选择

```typescript
const result = await sdk.test();

// 根据网络环境选择 CDN
const cdnUrl = result.isIntranet 
  ? 'https://internal-cdn.company.com'
  : 'https://public-cdn.example.com';

// 应用到全局配置
window.CDN_BASE_URL = cdnUrl;
```

### 4. 性能监控

```typescript
class PerformanceMonitor {
  private sdk: NetworkSpeedSDK;
  private history: SpeedTestResult[] = [];

  constructor() {
    this.sdk = new NetworkSpeedSDK({
      internetUrl: 'https://cdn.example.com/test.bin',
    });
  }

  async monitor() {
    const result = await this.sdk.test();
    this.history.push(result);

    // 保留最近 10 次记录
    if (this.history.length > 10) {
      this.history.shift();
    }

    // 计算平均速度
    const avgSpeed = this.history.reduce(
      (sum, r) => sum + r.speedMbps, 0
    ) / this.history.length;

    // 检测速度下降
    if (avgSpeed < 2 && result.speedMbps < 1) {
      this.alert('网速严重下降');
    }

    return { current: result, average: avgSpeed };
  }

  private alert(message: string) {
    // 发送告警
    console.warn(message);
  }
}
```

## 常见问题

### Q1: 测速结果不准确？

**可能原因：**
1. 测速文件太小（< 100KB）
2. 测速文件被缓存
3. CDN 未命中，回源慢

**解决方案：**
```typescript
// 1. 使用合适大小的文件（200KB ~ 1MB）
// 2. 添加时间戳防止缓存（SDK 已自动处理）
// 3. 确保 CDN 配置正确

const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test-500kb.bin',
  timeout: 15000, // 增加超时时间
});
```

### Q2: 如何区分内外网？

**方案：**
```typescript
const sdk = new NetworkSpeedSDK({
  // 内网资源：只有内网能访问
  intranetUrl: 'https://internal.company.com/test.bin',
  
  // 外网资源：公网可访问
  internetUrl: 'https://public-cdn.com/test.bin',
  
  autoDetect: true,
});

const result = await sdk.test();
console.log(result.isIntranet ? '内网' : '外网');
```

### Q3: 外网 CDN 超时怎么办？

**解决方案：**
```typescript
// 1. 增加超时时间
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test.bin',
  timeout: 20000, // 20秒
});

// 2. 使用多个 CDN 备份
async function testWithFallback() {
  const cdns = [
    'https://cdn1.example.com/test.bin',
    'https://cdn2.example.com/test.bin',
    'https://cdn3.example.com/test.bin',
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

### Q4: 如何测试上传速度？

**答：** Performance API 无法直接测试上传速度。

**替代方案：**
```typescript
// 使用 XMLHttpRequest 或 Fetch API
async function testUploadSpeed(file: File) {
  const startTime = performance.now();
  
  const formData = new FormData();
  formData.append('file', file);
  
  await fetch('https://api.example.com/upload', {
    method: 'POST',
    body: formData,
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  const speedMbps = (file.size * 8) / duration / 1000;
  
  return speedMbps;
}
```

### Q5: 移动端支持吗？

**答：** 完全支持。Performance API 在现代移动浏览器中都可用。

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

// 结合 Performance API 测速
const sdk = new NetworkSpeedSDK({
  internetUrl: 'https://cdn.example.com/test.bin',
});
const result = await sdk.test();
```

## 性能优化

### 1. 避免频繁测速

```typescript
// ❌ 不好的做法
setInterval(() => {
  sdk.test(); // 每秒测速，浪费带宽
}, 1000);

// ✅ 好的做法
let lastTestTime = 0;
const MIN_INTERVAL = 60000; // 最小间隔 1 分钟

async function testIfNeeded() {
  const now = Date.now();
  if (now - lastTestTime < MIN_INTERVAL) {
    return; // 跳过
  }
  
  lastTestTime = now;
  await sdk.test();
}
```

### 2. 缓存测速结果

```typescript
class SpeedCache {
  private cache: SpeedTestResult | null = null;
  private cacheTime = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 分钟

  async getSpeed(sdk: NetworkSpeedSDK): Promise<SpeedTestResult> {
    const now = Date.now();
    
    // 使用缓存
    if (this.cache && now - this.cacheTime < this.cacheDuration) {
      return this.cache;
    }
    
    // 重新测速
    this.cache = await sdk.test();
    this.cacheTime = now;
    
    return this.cache;
  }
}
```

### 3. 懒加载测速

```typescript
// 只在需要时才测速
class LazySpeedTest {
  private result: SpeedTestResult | null = null;
  private promise: Promise<SpeedTestResult> | null = null;

  async getSpeed(): Promise<SpeedTestResult> {
    // 已有结果，直接返回
    if (this.result) {
      return this.result;
    }

    // 正在测速，返回同一个 Promise
    if (this.promise) {
      return this.promise;
    }

    // 开始测速
    this.promise = new NetworkSpeedSDK({
      internetUrl: 'https://cdn.example.com/test.bin',
    }).test();

    this.result = await this.promise;
    return this.result;
  }
}
```

## 总结

Network Speed SDK 基于 Performance API 提供了准确、可靠的网速测试能力。通过合理配置和使用，可以实现：

- ✅ 准确的网速测量
- ✅ 内外网自动检测
- ✅ 资源加载监听
- ✅ 动态资源质量调整
- ✅ CDN 智能选择

记住核心原则：
1. 使用合适大小的测速文件（200KB ~ 1MB）
2. 避免频繁测速，合理缓存结果
3. 根据测速结果动态调整应用行为
4. 做好错误处理和降级方案
