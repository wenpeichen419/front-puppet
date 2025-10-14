import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.min.js'
    },
  },
    define: {
    'process.env': {}
  },
  server: {
    // // 配置代理
    // proxy: {
    //   // 匹配所有以 /api 开头的请求（根据你的接口路径调整）
    //   '/api': {
    //     target: 'http://8.134.51.50:6060',  // 目标后端地址
    //     changeOrigin: true,  // 开启跨域代理
    //     rewrite: (path) => path.replace(/^\/api/, ''),  // 移除路径中的 /api 前缀（如果后端接口没有 /api）
    //     // 示例：前端请求 /api/v1/chat_ask → 实际请求 http://8.134.51.50:6060/v1/chat_ask
    //   }
    // },
    host: '0.0.0.0', 
    port: 5173,
  }
})
