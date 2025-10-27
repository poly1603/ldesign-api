<template>
  <div class="example">
    <h2>表单提交</h2>
    <p class="description">演示使用 useMutation 提交表单数据</p>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>姓名</label>
        <input 
          v-model="form.name" 
          type="text" 
          placeholder="请输入姓名" 
          required 
        />
      </div>

      <div class="form-group">
        <label>邮箱</label>
        <input 
          v-model="form.email" 
          type="email" 
          placeholder="请输入邮箱" 
          required 
        />
      </div>

      <div class="actions">
        <button type="submit" :disabled="loading">
          {{ loading ? '提交中...' : '创建用户' }}
        </button>
        <button type="button" @click="resetForm">重置</button>
      </div>
    </form>

    <div v-if="error" class="error">
      错误: {{ error.message }}
    </div>

    <div v-if="data" class="success">
      <h3>✅ 创建成功！</h3>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMutation } from '@ldesign/api/vue'

const form = ref({
  name: '',
  email: ''
})

const { data, loading, error, mutate } = useMutation('createUser', {
  onSuccess: (data) => {
    console.log('创建成功:', data)
    setTimeout(() => {
      resetForm()
    }, 2000)
  },
  onError: (error) => {
    console.error('创建失败:', error)
  }
})

async function handleSubmit() {
  await mutate({
    data: form.value
  })
}

function resetForm() {
  form.value = {
    name: '',
    email: ''
  }
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

form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #646cff;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button[type="submit"] {
  background: #646cff;
  color: white;
}

button[type="submit"]:hover {
  background: #535bf2;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button[type="button"] {
  background: #f0f0f0;
  color: #666;
}

button[type="button"]:hover {
  background: #e0e0e0;
}

.error,
.success {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.error {
  background: #fff5f5;
  color: #ff4444;
  border-left: 3px solid #ff4444;
}

.success {
  background: #f1f8f4;
  color: #4caf50;
  border-left: 3px solid #4caf50;
}

.success h3 {
  margin-bottom: 10px;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  color: #333;
}
</style>

