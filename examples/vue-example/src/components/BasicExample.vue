<template>
  <div class="example">
    <h2>基础用法</h2>
    <p class="description">演示最简单的 API 调用方式</p>

    <div class="actions">
      <button @click="execute">获取用户信息</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">错误: {{ error.message }}</div>
    <div v-else-if="data" class="result">
      <h3>用户信息</h3>
      <div class="user-card">
        <img :src="data.avatar" :alt="data.name" />
        <div class="user-info">
          <p><strong>姓名:</strong> {{ data.name }}</p>
          <p><strong>邮箱:</strong> {{ data.email }}</p>
          <p><strong>角色:</strong> {{ data.role }}</p>
          <p><strong>创建时间:</strong> {{ formatDate(data.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '@ldesign/api/vue'

const { data, loading, error, execute } = useApi('getUserInfo', {
  immediate: true
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-CN')
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

button:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.result h3 {
  color: #646cff;
  margin-bottom: 15px;
}

.user-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.user-card img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #646cff;
}

.user-info p {
  margin: 8px 0;
  color: #666;
}

.user-info strong {
  color: #333;
}
</style>

