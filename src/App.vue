<template>
  <div>
    <ElButton type="primary" @click="handleClick">点击测速</ElButton>
    <div class="loading" v-if="isLoading">
      <p>正在检测您当前的网络速度</p>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'
import io from "./api";
import { ref } from 'vue';
const isLoading = ref(false);
const handleClick = async () => {
  isLoading.value = true;

  try {
    const res: any = await io.get(
      "https://s3-gzpu-inter.didistatic.com/ese-feedback/kefu-workbench/hashiqi.webp"
    );
    const time = res.time.end - res.time.start;
    const speed = (10.63 * 1000) / time;
    let standard = "";
    if (speed > 10) {
      standard = "fast 3g";
    } else if (speed > 0 && speed <= 10) {
      standard = "slow 3g";
    }
    isLoading.value = false;
    ElMessage({
      message: `当前网速：${parseInt(`${speed}`)}kb/s ${standard} 已连接内网，当前网速情况 内网speed ${speed} "kb" `,
      type: 'success',
      offset: 100
    });
  } catch (error) {
    console.log("当前网络环境为外网");
    console.log("===========正在使用外网图片测试您的网速===========");
    try {
      const res: any = await io.get(
        "https://s3-gz01.didistatic.com/ese-feedback/kefu-workbench/hashiqi.webp"
      );
      const time = res.time.end - res.time.start;
      // console.log(time);
      const speed = (10.63 * 1000) / time;
      let standard = "";
      if (speed > 4) {
        standard = "fast 3g";
      } else if (speed > 0 && speed <= 4) {
        standard = "slow 3g";
      }
      isLoading.value = false;
      ElMessage({
        message: `当前网速：${parseInt(`${speed}`)}kb/s ${standard} 未连接内网，当前网速情况：外网speed ${speed} + "kb"`,
        type: 'success',
        offset: 100,
        duration: 2000
      });
    } catch (error) {
      console.log("未知错误");
    }
  }
}
</script>

<style>
.loading {
  width: 200px;
  height: 40px;
  margin: 0 auto;
  margin-top: 100px;
}

.loading span {
  display: inline-block;
  width: 8px;
  height: 100%;
  border-radius: 4px;
  background: lightgreen;
  -webkit-animation: load 1s ease infinite;
}

@-webkit-keyframes load {

  0%,
  100% {
    height: 40px;
    background: lightgreen;
  }

  50% {
    height: 70px;
    margin: -15px 0;
    background: lightblue;
  }
}

.loading span:nth-child(2) {
  -webkit-animation-delay: 0.2s;
}

.loading span:nth-child(3) {
  -webkit-animation-delay: 0.4s;
}

.loading span:nth-child(4) {
  -webkit-animation-delay: 0.6s;
}

.loading span:nth-child(5) {
  -webkit-animation-delay: 0.8s;
}
</style>
