import { createApp } from 'vue'
import { ApiVuePlugin } from '@ldesign/api/vue'
import App from './App.vue'
import { mockPlugin } from './plugins/mockPlugin'

const app = createApp(App)

// 配置 API 插件
app.use(ApiVuePlugin, {
  appName: 'vue-example',
  version: '1.0.0',
  debug: true,

  http: {
    baseURL: 'https://api.example.com',
    timeout: 10000,
  },

  cache: {
    enabled: true,
    ttl: 300000,
    storage: 'localStorage',
  },

  debounce: {
    enabled: true,
    delay: 300,
  },

  plugins: [mockPlugin]
})

app.mount('#app')

