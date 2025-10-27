<template>
  <div class="example">
    <h2>列表展示</h2>
    <p class="description">演示列表数据的加载和展示</p>

    <div class="actions">
      <button @click="refresh">刷新列表</button>
    </div>

    <div v-if="loading && !data" class="loading">加载中...</div>
    <div v-else-if="error" class="error">错误: {{ error.message }}</div>
    <div v-else-if="data" class="result">
      <div class="stats">
        <span>总计: {{ data.total }} 条</span>
        <span>当前页: {{ data.page }}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>状态</th>
            <th>创建时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in data.list" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['status', user.status]">
                {{ user.status === 'active' ? '活跃' : '未激活' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@ldesign/api/vue'

const { data, loading, error, execute: refresh } = useApi('getUserList', {
  immediate: true,
  params: {
    page: 1,
    size: 10
  }
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.example {
  padding: 20px;
}

h2 {
  color: #333;
  margin-bottom: 10px;
}

.description {
  color: #666;
  margin-bottom: 20px;
}

.actions {
  margin-bottom: 20px;
}

button {
  background: #646cff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #535bf2;
}

.loading,
.error {
  padding: 20px;
  border-radius: 4px;
  margin-top: 20px;
}

.loading {
  background: #f0f0f0;
  color: #666;
}

.error {
  background: #fff5f5;
  color: #ff4444;
  border-left: 3px solid #ff4444;
}

.result {
  margin-top: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f5f5f5;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: 600;
  color: #333;
}

td {
  color: #666;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status.active {
  background: #e8f5e9;
  color: #4caf50;
}

.status.inactive {
  background: #fce4ec;
  color: #e91e63;
}
</style>

