import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios';

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(ElementPlus) // 确保在 mount 之前使用 Element Plus

// 将 Axios 挂载到全局属性上
app.config.globalProperties.$axios = axios;

app.mount('#app')
