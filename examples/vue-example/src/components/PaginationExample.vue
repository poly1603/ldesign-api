<template>
  <div class="example">
    <h2>分页数据</h2>
    <p class="description">演示分页数据的加载和切换</p>

    <div v-if="loading && !data" class="loading">加载中...</div>
    <div v-else-if="error" class="error">错误: {{ error.message }}</div>
    <div v-else-if="data" class="result">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>状态</th>
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
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button @click="goToPrevPage" :disabled="currentPage <= 1 || loading">
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} / {{ totalPages }} 页 (共 {{ data.total }} 条)
        </span>
        <button @click="goToNextPage" :disabled="currentPage >= totalPages || loading">
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApi } from '@ldesign/api/vue'

const currentPage = ref(1)
const pageSize = ref(10)

const { data, loading, error, execute } = useApi('getUserList', {
  immediate: true,
  params: {
    page: currentPage.value,
    size: pageSize.value
  }
})

const totalPages = computed(() => {
  if (!data.value) return 0
  return Math.ceil(data.value.total / pageSize.value)
})

function goToPrevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    loadPage()
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadPage()
  }
}

function loadPage() {
  execute({
    params: {
      page: currentPage.value,
      size: pageSize.value
    }
  })
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

.loading,
.error {
  padding: 20px;
  border-radius: 4px;
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 20px 0;
}

.pagination button {
  background: #646cff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.pagination button:hover:not(:disabled) {
  background: #535bf2;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}
</style>

