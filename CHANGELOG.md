# 更新日志

## [1.0.0] - 2026-01-24

### 🎉 重大更新

完全重构项目，从 Axios 拦截器方案升级到基于 **Performance API** 的现代化实现。

### ✨ 新增功能

- **基于 Performance API 的测速核心**
  - 使用浏览器原生 `PerformanceResourceTiming` API
  - 准确获取真实网络传输时间和大小
  - 支持实时监听资源加载性能

- **完整的 TypeScript 支持**
  - 提供完整的类型定义
  - 更好的开发体验和类型安全

- **内外网自动检测**
  - 智能切换内网/外网测速资源
  - 自动降级处理

- **资源监听功能**
  - 实时监听特定资源的性能数据
  - 支持获取页面所有资源的速度信息

- **框架无关设计**
  - 可用于 Vue、React、Angular 或原生 JavaScript
  - 零框架依赖

### 🔧 技术方案改进

#### 旧方案（v0.x）的问题

**使用 Axios 拦截器测速：**

```typescript
// ❌ 旧方案
const io = axios.create();
let start, end;

io.interceptors.request.use((request) => {
  start = new Date().getTime(); // JavaScript 层面计时
  return request;
});

io.interceptors.response.use((resp) => {
  end = new Date().getTime();
  const time = end - start;
  const speed = (fileSize * 1000) / time; // 需要手动指定文件大小
  return resp;
});
```

**存在的问题：**

1. ❌ **时间不准确** - 只能测量 JavaScript 层面的时间，包含了代码执行时间
2. ❌ **无法获取真实传输大小** - 需要手动指定文件大小，无法获取实际网络传输字节数
3. ❌ **受缓存影响** - 无法区分缓存和网络请求
4. ❌ **无法获取详细时序** - 不知道 DNS、TCP、TLS、下载等各阶段耗时
5. ❌ **依赖 Axios** - 增加了不必要的依赖

#### 新方案（v1.0）的优势

**使用 Performance API：**

```typescript
// ✅ 新方案
const entry = performance.getEntriesByType('resource')[0];

// 真实的网络下载时间（不包含 JavaScript 执行时间）
const downloadTime = entry.responseEnd - entry.responseStart;

// 真实的网络传输字节数（包含 header）
const transferSize = entry.transferSize;

// 准确的速度计算
const speedMbps = (transferSize * 8) / downloadTime / 1000;
```

**优势对比：**

| 特性 | Axios 拦截器（旧） | Performance API（新） |
|------|-------------------|---------------------|
| 时间准确度 | ⭐⭐⭐ JavaScript 层面 | ⭐⭐⭐⭐⭐ 浏览器底层 |
| 传输大小 | ❌ 需手动指定 | ✅ 自动获取真实值 |
| 详细时序 | ❌ 无 | ✅ DNS/TCP/TLS/下载 |
| 缓存识别 | ❌ 无法区分 | ✅ 可识别缓存 |
| 资源监听 | ❌ 不支持 | ✅ 支持所有资源 |
| 外部依赖 | ❌ 依赖 Axios | ✅ 零依赖 |
| 浏览器支持 | ✅ 所有现代浏览器 | ✅ 所有现代浏览器 |

**性能时序对比：**

```
旧方案（Axios）：
[JS 开始] -------- [网络请求] -------- [JS 结束]
         ↑                              ↑
      start time                    end time
      （包含 JS 执行时间，不准确）

新方案（Performance API）：
[navigationStart] [DNS] [TCP] [Request] [Response] [完成]
                                        ↑          ↑
                                  responseStart  responseEnd
                                  （纯网络时间，准确）
```

### 📊 性能对比示例

**测试同一个 500KB 文件：**

```typescript
// 旧方案结果
{
  time: 245ms,           // 包含 JS 执行时间
  speed: 16.3 Mbps,      // 基于手动指定的文件大小
  size: 500KB            // 手动指定，可能不准确
}

// 新方案结果
{
  duration: 234.56ms,    // 纯网络传输时间
  speedMbps: 17.2,       // 基于真实传输大小
  transferSize: 505234,  // 真实传输字节数（含 header）
  encodedBodySize: 500000, // 压缩后大小
  decodedBodySize: 512000  // 解压后大小
}
```

### 🔄 迁移指南

#### 从 v0.x 升级到 v1.0

**旧版本使用方式：**

```vue
<template>
  <NetworkSDK />
</template>

<script setup>
import NetworkSDK from 'network-speed-js';
</script>
```

**新版本使用方式：**

```typescript
import { NetworkSpeedSDK } from 'network-speed-js';

const sdk = new NetworkSpeedSDK({
  intranetUrl: 'https://internal-cdn.com/test.bin',
  internetUrl: 'https://external-cdn.com/test.bin',
  autoDetect: true,
});

const result = await sdk.test();
console.log(result);
// {
//   speedMbps: 17.2,
//   speedKBps: 2150,
//   networkType: 'fast',
//   isIntranet: true,
//   duration: 234.56,
//   transferSize: 505234,
//   resourceUrl: '...'
// }
```

### 🗑️ 移除的依赖

- ❌ `axios` - 不再需要
- ❌ `element-plus` - 不再需要（框架无关设计）

### 📝 API 变更

#### 新增 API

- `NetworkSpeedSDK` - 核心 SDK 类
- `getAllResourcesSpeeds()` - 获取所有资源速度
- `calcSpeedByResource()` - 计算单个资源速度
- `evaluateNetworkType()` - 评估网络类型

#### 类型定义

- `SpeedTestResult` - 测速结果类型
- `SpeedTestOptions` - 配置选项类型
- `ResourceSpeedInfo` - 资源速度信息类型
- `PerformanceEntryCallback` - 性能监听回调类型

### 📚 文档更新

- ✅ 完整的 README.md（包含所有使用示例和指南）
- ✅ 详细的 API 文档
- ✅ 多框架集成示例
- ✅ 常见问题解答
- ✅ 性能优化建议

### 🎯 为什么要升级？

1. **更准确** - 基于浏览器底层 API，测量真实网络性能
2. **更强大** - 支持资源监听、详细时序分析
3. **更灵活** - 框架无关，可用于任何项目
4. **更轻量** - 零依赖，体积更小
5. **更现代** - 完整的 TypeScript 支持

---

## [0.0.2] - 2023-12-XX

### 初始版本

- 基于 Axios 拦截器的测速实现
- 支持内外网检测
- Vue 2 + Element UI 组件

---

## 技术选型说明

### 为什么选择 Performance API？

Performance API 是 W3C 标准，专门用于性能监控，具有以下优势：

1. **浏览器原生支持** - 无需额外依赖
2. **准确可靠** - 直接获取浏览器底层性能数据
3. **功能强大** - 提供完整的资源加载时序
4. **标准化** - W3C 标准，长期维护

### Performance API 能做什么？

✅ 测量资源下载速度  
✅ 获取详细的加载时序（DNS、TCP、TLS、下载等）  
✅ 监听所有资源的性能数据  
✅ 识别缓存命中  
✅ 获取真实传输大小  

### Performance API 不能做什么？

❌ 测量上传速度（需要其他方案）  
❌ 测量丢包率  
❌ 测量 RTT 抖动  
❌ 脱离真实请求独立测速  

### 相关资源

- [Performance API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [PerformanceResourceTiming - MDN](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)
- [W3C Performance Timeline](https://www.w3.org/TR/performance-timeline/)
