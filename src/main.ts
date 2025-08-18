
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 配置 axios 实例
const http = axios.create({
  baseURL: 'http://localhost:8000', // 根据实际 API 地址修改
  timeout: 10000
})
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.mount('#app')