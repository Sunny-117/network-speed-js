import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 库模式构建
  if (mode === 'lib') {
    return {
      plugins: [vue()],
      build: {
        lib: {
          entry: resolve(__dirname, "src/index.ts"),
          name: "NetworkSpeedJS",
          fileName: (format) => `network-speed-js.${format === 'es' ? 'js' : 'umd.js'}`,
          formats: ['es', 'umd'],
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue',
            },
            exports: 'named',
          },
        },
      },
    };
  }

  // Demo 模式构建（用于 GitHub Pages）
  return {
    plugins: [vue()],
    base: '/network-speed-js/', // GitHub Pages 仓库名
    build: {
      outDir: 'dist-demo',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
  };
});
