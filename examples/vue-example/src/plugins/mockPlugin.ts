import type { ApiPlugin } from '@ldesign/api'

export const mockPlugin: ApiPlugin = {
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
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      }
    },
    getUserList: {
      method: 'GET',
      url: '/mock/users',
      mock: {
        enabled: true,
        data: (params: any) => {
          const page = params?.page || 1
          const size = params?.size || 10
          const total = 50

          return {
            list: Array.from({ length: size }, (_, i) => {
              const id = (page - 1) * size + i + 1
              return {
                id,
                name: `用户${id}`,
                email: `user${id}@example.com`,
                status: Math.random() > 0.5 ? 'active' : 'inactive',
                createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
              }
            }),
            total,
            page,
            pageSize: size
          }
        }
      }
    },
    createUser: {
      method: 'POST',
      url: '/mock/users',
      mock: {
        enabled: true,
        delay: 1000,
        data: (params: any, data: any) => ({
          id: Math.floor(Math.random() * 1000),
          ...data,
          status: 'active',
          createdAt: new Date().toISOString()
        })
      }
    },
    updateUser: {
      method: 'PUT',
      url: '/mock/users/:id',
      mock: {
        enabled: true,
        delay: 800,
        data: (params: any, data: any) => ({
          id: params.id,
          ...data,
          updatedAt: new Date().toISOString()
        })
      }
    },
    deleteUser: {
      method: 'DELETE',
      url: '/mock/users/:id',
      mock: {
        enabled: true,
        delay: 500,
        data: (params: any) => ({
          success: true,
          message: `用户 ${params.id} 已删除`
        })
      }
    }
  }
}

