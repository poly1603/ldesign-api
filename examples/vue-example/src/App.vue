<template>
  <div class="app">
    <header>
      <h1>@ldesign/api - Vue 3 示例</h1>
    </header>

    <main>
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <component :is="currentTabComponent" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BasicExample from './components/BasicExample.vue'
import ListExample from './components/ListExample.vue'
import FormExample from './components/FormExample.vue'
import PaginationExample from './components/PaginationExample.vue'

const activeTab = ref('basic')

const tabs = [
  { id: 'basic', label: '基础用法', component: BasicExample },
  { id: 'list', label: '列表展示', component: ListExample },
  { id: 'form', label: '表单提交', component: FormExample },
  { id: 'pagination', label: '分页数据', component: PaginationExample },
]

const currentTabComponent = computed(() => {
  return tabs.find(tab => tab.id === activeTab.value)?.component
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f5f5f5;
}

.app {
  min-height: 100vh;
}

header {
  background: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

header h1 {
  color: #333;
  font-size: 24px;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.tabs button:hover {
  background: #f0f0f0;
}

.tabs button.active {
  background: #646cff;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

