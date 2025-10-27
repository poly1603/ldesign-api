import { createApiEngine, type ApiPlugin } from '@ldesign/api'

// 创建模拟插件（用于演示）
const mockPlugin: ApiPlugin = {
  name: 'mock-apis',
  apis: {
    getUserInfo: {
      method: 'GET',
      url: '/mock/user/info',
      mock: {
        enabled: true,
        data: {
          id: 1,
          name: '张三',
          email: 'zhangsan@example.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      }
    },
    getUser: {
      method: 'GET',
      url: '/mock/users/:id',
      mock: {
        enabled: true,
        data: (params: any) => ({
          id: params.id,
          name: `用户${params.id}`,
          email: `user${params.id}@example.com`,
          role: 'user'
        })
      }
    },
    createUser: {
      method: 'POST',
      url: '/mock/users',
      mock: {
        enabled: true,
        data: (params: any, data: any) => ({
          id: Math.floor(Math.random() * 1000),
          ...data,
          createdAt: new Date().toISOString()
        })
      }
    },
    getUserList: {
      method: 'GET',
      url: '/mock/users',
      mock: {
        enabled: true,
        data: {
          list: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `用户${i + 1}`,
            email: `user${i + 1}@example.com`
          })),
          total: 100,
          page: 1,
          pageSize: 10
        }
      }
    },
    errorApi: {
      method: 'GET',
      url: '/mock/error',
      mock: {
        enabled: true,
        error: new Error('这是一个模拟错误')
      }
    }
  }
}

// 创建 API 引擎
const apiEngine = createApiEngine({
  appName: 'basic-example',
  version: '1.0.0',
  debug: true,

  http: {
    baseURL: 'https://api.example.com',
    timeout: 5000,
  },

  cache: {
    enabled: true,
    ttl: 60000, // 60秒
    maxSize: 100,
    storage: 'memory'
  },

  debounce: {
    enabled: true,
    delay: 300
  },

  performance: {
    enabled: true,
    sampleRate: 1.0
  }
})

// 使用插件
apiEngine.use(mockPlugin).then(() => {
  console.log('插件加载成功')
  initExamples()
}).catch(error => {
  console.error('插件加载失败:', error)
})

// 辅助函数
function showResult(elementId: string, content: string, type: 'info' | 'success' | 'error' | 'loading' = 'info') {
  const element = document.getElementById(elementId)
  if (element) {
    element.innerHTML = `<div class="result ${type}">${content}</div>`
  }
}

function showJson(elementId: string, data: any, type: 'info' | 'success' | 'error' = 'info') {
  const element = document.getElementById(elementId)
  if (element) {
    element.innerHTML = `<div class="result ${type}"><pre>${JSON.stringify(data, null, 2)}</pre></div>`
  }
}

// 初始化示例
function initExamples() {
  // 1. 基本 API 调用
  document.getElementById('btn-basic')?.addEventListener('click', async () => {
    try {
      showResult('result-basic', '加载中...', 'loading')
      const data = await apiEngine.call('getUserInfo')
      showJson('result-basic', data, 'success')
    } catch (error: any) {
      showResult('result-basic', `错误: ${error.message}`, 'error')
    }
  })

  // 2. 带参数的 API 调用
  document.getElementById('btn-with-params')?.addEventListener('click', async () => {
    try {
      showResult('result-with-params', '加载中...', 'loading')
      const userId = (document.getElementById('input-user-id') as HTMLInputElement)?.value
      const data = await apiEngine.call('getUser', {
        params: { id: userId }
      })
      showJson('result-with-params', data, 'success')
    } catch (error: any) {
      showResult('result-with-params', `错误: ${error.message}`, 'error')
    }
  })

  // 3. 创建数据
  document.getElementById('btn-create')?.addEventListener('click', async () => {
    try {
      showResult('result-create', '创建中...', 'loading')
      const name = (document.getElementById('input-name') as HTMLInputElement)?.value
      const email = (document.getElementById('input-email') as HTMLInputElement)?.value

      if (!name || !email) {
        showResult('result-create', '请填写完整信息', 'error')
        return
      }

      const data = await apiEngine.call('createUser', {
        data: { name, email }
      })
      showJson('result-create', data, 'success')

        // 清空表单
        ; (document.getElementById('input-name') as HTMLInputElement).value = ''
        ; (document.getElementById('input-email') as HTMLInputElement).value = ''
    } catch (error: any) {
      showResult('result-create', `错误: ${error.message}`, 'error')
    }
  })

  // 4. 缓存演示
  document.getElementById('btn-cache')?.addEventListener('click', async () => {
    try {
      const startTime = Date.now()
      showResult('result-cache', '加载中...', 'loading')
      const data = await apiEngine.call('getUserList')
      const endTime = Date.now()
      const duration = endTime - startTime

      showResult('result-cache',
        `<p>请求耗时: ${duration}ms ${duration < 10 ? '(来自缓存)' : '(网络请求)'}</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>`,
        'success')
    } catch (error: any) {
      showResult('result-cache', `错误: ${error.message}`, 'error')
    }
  })

  document.getElementById('btn-cache-refresh')?.addEventListener('click', async () => {
    try {
      const startTime = Date.now()
      showResult('result-cache', '强制刷新中...', 'loading')
      const data = await apiEngine.call('getUserList', { forceRefresh: true })
      const endTime = Date.now()
      const duration = endTime - startTime

      showResult('result-cache',
        `<p>请求耗时: ${duration}ms (强制刷新)</p>
        <pre>${JSON.stringify(data, null, 2)}</pre>`,
        'success')
    } catch (error: any) {
      showResult('result-cache', `错误: ${error.message}`, 'error')
    }
  })

  document.getElementById('btn-cache-clear')?.addEventListener('click', () => {
    apiEngine.cache.clear()
    showResult('result-cache', '缓存已清除', 'success')
  })

  // 5. 错误处理
  document.getElementById('btn-error')?.addEventListener('click', async () => {
    try {
      showResult('result-error', '请求中...', 'loading')
      await apiEngine.call('errorApi')
    } catch (error: any) {
      showResult('result-error', `捕获到错误: ${error.message}`, 'error')
    }
  })

  // 6. 性能监控
  document.getElementById('btn-metrics')?.addEventListener('click', () => {
    const metrics = apiEngine.getPerformanceMetrics?.() || {}
    showJson('result-metrics', {
      平均响应时间: `${metrics.avgResponseTime || 0}ms`,
      总请求数: metrics.totalRequests || 0,
      成功率: `${((metrics.successRate || 0) * 100).toFixed(2)}%`,
      缓存命中率: `${((metrics.cacheHitRate || 0) * 100).toFixed(2)}%`
    }, 'info')
  })

  // 监听 API 事件
  apiEngine.on('request:start', (apiName) => {
    console.log(`🚀 请求开始: ${apiName}`)
  })

  apiEngine.on('request:success', (apiName, data) => {
    console.log(`✅ 请求成功: ${apiName}`, data)
  })

  apiEngine.on('request:error', (apiName, error) => {
    console.error(`❌ 请求失败: ${apiName}`, error)
  })

  console.log('✨ 示例初始化完成')
  console.log('API 引擎:', apiEngine)
}

