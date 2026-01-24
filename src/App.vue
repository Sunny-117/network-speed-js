<template>
  <div class="demo-container">
    <h1>🚀 Network Speed SDK Demo</h1>
    <p class="subtitle">基于 Performance API 的网速测试工具</p>

    <div class="demo-section">
      <h2>方式一：SDK API 测速</h2>
      <p class="section-desc">使用 SDK 进行网速测试，自动检测内外网环境</p>
      <button class="api-button" @click="testWithAPI">开始测速</button>
      <div v-if="apiResult" class="api-result">
        <h3>测速结果：</h3>
        <ul class="result-list">
          <li><strong>速度:</strong> {{ apiResult.speedMbps }} Mbps ({{ apiResult.speedKBps }} KB/s)</li>
          <li><strong>网络类型:</strong> {{ getNetworkTypeText(apiResult.networkType) }}</li>
          <li><strong>网络环境:</strong> {{ apiResult.isIntranet ? '内网' : '外网' }}</li>
          <li><strong>耗时:</strong> {{ apiResult.duration }} ms</li>
          <li><strong>传输大小:</strong> {{ (apiResult.transferSize / 1024).toFixed(2) }} KB</li>
        </ul>
      </div>
    </div>

    <div class="demo-section">
      <h2>方式二：监听资源加载</h2>
      <p class="section-desc">实时监听页面资源加载性能，可用于性能分析</p>
      <button class="api-button" @click="observeResources">开始监听</button>
      <button class="api-button secondary" @click="stopObserving">停止监听</button>
      <div v-if="observedResources.length > 0" class="api-result">
        <h3>监听到的资源 ({{ observedResources.length }})：</h3>
        <div class="resource-list">
          <div v-for="(res, idx) in observedResources" :key="idx" class="resource-item">
            <div class="resource-name"><strong>{{ getResourceName(res.name) }}</strong></div>
            <div class="resource-info">
              <span>大小: {{ (res.transferSize / 1024).toFixed(2) }} KB</span>
              <span>耗时: {{ (res.responseEnd - res.responseStart).toFixed(2) }} ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>方式三：查看所有资源速度</h2>
      <p class="section-desc">获取页面已加载的所有资源的速度信息</p>
      <button class="api-button" @click="getAllSpeeds">获取页面所有资源速度</button>
      <div v-if="allSpeeds.length > 0" class="speeds-table">
        <table>
          <thead>
            <tr>
              <th>资源</th>
              <th>速度 (Mbps)</th>
              <th>速度 (KB/s)</th>
              <th>耗时 (ms)</th>
              <th>大小 (KB)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(speed, index) in allSpeeds" :key="index">
              <td class="resource-name">{{ getResourceName(speed.name) }}</td>
              <td>{{ speed.speedMbps }}</td>
              <td>{{ speed.speedKBps }}</td>
              <td>{{ speed.downloadTime }}</td>
              <td>{{ (speed.transferSize / 1024).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NetworkSpeedSDK, getAllResourcesSpeeds } from './index';
import type { SpeedTestResult, ResourceSpeedInfo } from './index';

// 配置测速URL（可以替换为你自己的资源）
const intranetUrl = 'https://s3-gzpu-inter.didistatic.com/ese-feedback/kefu-workbench/hashiqi.webp';
const internetUrl = 'https://s3-gz01.didistatic.com/ese-feedback/kefu-workbench/hashiqi.webp';

const apiResult = ref<SpeedTestResult | null>(null);
const allSpeeds = ref<ResourceSpeedInfo[]>([]);
const observedResources = ref<PerformanceResourceTiming[]>([]);
let stopObserver: (() => void) | null = null;

const testWithAPI = async () => {
  try {
    const sdk = new NetworkSpeedSDK({
      intranetUrl,
      internetUrl,
      autoDetect: true,
    });

    apiResult.value = await sdk.test();
  } catch (error) {
    console.error('API测速失败:', error);
    alert(`测速失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

const observeResources = () => {
  const sdk = new NetworkSpeedSDK();
  observedResources.value = [];
  
  stopObserver = sdk.observeResource('', (entry) => {
    observedResources.value.push(entry);
  });
  
  alert('开始监听资源加载，请刷新页面或加载新资源查看效果');
};

const stopObserving = () => {
  if (stopObserver) {
    stopObserver();
    stopObserver = null;
    alert('已停止监听');
  }
};

const getAllSpeeds = () => {
  allSpeeds.value = getAllResourcesSpeeds();
};

const getResourceName = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').pop() || url;
  } catch {
    return url;
  }
};

const getNetworkTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    fast: '快速 (4G/5G)',
    medium: '中速 (3G)',
    slow: '慢速 (2G)',
    unknown: '未知',
  };
  return typeMap[type] || type;
};
</script>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}

h1 {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 16px;
  margin-bottom: 50px;
}

.demo-section {
  margin-bottom: 30px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.demo-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  margin-top: 0;
}

.section-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.api-button {
  padding: 10px 24px;
  font-size: 14px;
  color: white;
  background: #667eea;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.api-button:hover {
  background: #5568d3;
  transform: translateY(-1px);
}

.api-button.secondary {
  background: #6c757d;
}

.api-button.secondary:hover {
  background: #5a6268;
}

.api-result {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.api-result h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-list li {
  padding: 10px 0;
  color: #666;
  border-bottom: 1px solid #e9ecef;
}

.result-list li:last-child {
  border-bottom: none;
}

.resource-list {
  max-height: 400px;
  overflow-y: auto;
}

.resource-item {
  padding: 12px;
  margin-bottom: 10px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.resource-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.resource-item .resource-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
  word-break: break-all;
}

.resource-info {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.speeds-table {
  margin-top: 20px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  color: #666;
}

.resource-name {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

tbody tr:hover {
  background: #f8f9fa;
}
</style>
