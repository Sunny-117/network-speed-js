<template>
  <div class="network-speed-test">
    <button 
      :class="['test-button', { loading: isLoading }]"
      @click="handleTest"
      :disabled="isLoading"
    >
      {{ isLoading ? '测速中...' : buttonText }}
    </button>

    <div v-if="isLoading" class="loading-animation">
      <p>正在检测您当前的网络速度</p>
      <div class="loading-bars">
        <span v-for="i in 5" :key="i"></span>
      </div>
    </div>

    <div v-if="result && !isLoading" class="result-panel">
      <div class="result-item">
        <span class="label">网速:</span>
        <span class="value">{{ result.speedMbps }} Mbps ({{ result.speedKBps }} KB/s)</span>
      </div>
      <div class="result-item">
        <span class="label">网络类型:</span>
        <span :class="['value', `type-${result.networkType}`]">
          {{ networkTypeText }}
        </span>
      </div>
      <div class="result-item">
        <span class="label">网络环境:</span>
        <span class="value">{{ result.isIntranet ? '内网' : '外网' }}</span>
      </div>
      <div class="result-item">
        <span class="label">测试耗时:</span>
        <span class="value">{{ result.duration }} ms</span>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NetworkSpeedSDK } from '../sdk';
import type { SpeedTestResult } from '../types';

interface Props {
  intranetUrl?: string;
  internetUrl?: string;
  timeout?: number;
  buttonText?: string;
  autoDetect?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  buttonText: '点击测速',
  autoDetect: true,
  timeout: 10000,
});

const emit = defineEmits<{
  (e: 'test-start'): void;
  (e: 'test-complete', result: SpeedTestResult): void;
  (e: 'test-error', error: Error): void;
}>();

const isLoading = ref(false);
const result = ref<SpeedTestResult | null>(null);
const error = ref<string>('');

const networkTypeText = computed(() => {
  if (!result.value) return '';
  const typeMap = {
    fast: '快速 (4G/5G)',
    medium: '中速 (3G)',
    slow: '慢速 (2G)',
    unknown: '未知',
  };
  return typeMap[result.value.networkType];
});

const handleTest = async () => {
  isLoading.value = true;
  error.value = '';
  result.value = null;

  emit('test-start');

  try {
    const sdk = new NetworkSpeedSDK({
      intranetUrl: props.intranetUrl,
      internetUrl: props.internetUrl,
      timeout: props.timeout,
      autoDetect: props.autoDetect,
    });

    const testResult = await sdk.test();
    result.value = testResult;
    emit('test-complete', testResult);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '测速失败';
    error.value = errorMsg;
    emit('test-error', err as Error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.network-speed-test {
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.test-button {
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.test-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.test-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-animation {
  margin-top: 30px;
  text-align: center;
}

.loading-animation p {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.loading-bars {
  display: flex;
  justify-content: center;
  gap: 8px;
  height: 60px;
  align-items: center;
}

.loading-bars span {
  display: inline-block;
  width: 8px;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: load 1s ease infinite;
}

@keyframes load {
  0%, 100% {
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  50% {
    height: 70px;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
}

.loading-bars span:nth-child(2) { animation-delay: 0.2s; }
.loading-bars span:nth-child(3) { animation-delay: 0.4s; }
.loading-bars span:nth-child(4) { animation-delay: 0.6s; }
.loading-bars span:nth-child(5) { animation-delay: 0.8s; }

.result-panel {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item .label {
  color: #666;
  font-weight: 500;
}

.result-item .value {
  color: #333;
  font-weight: 600;
}

.type-fast { color: #28a745; }
.type-medium { color: #ffc107; }
.type-slow { color: #dc3545; }
.type-unknown { color: #6c757d; }

.error-message {
  margin-top: 20px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
}
</style>
