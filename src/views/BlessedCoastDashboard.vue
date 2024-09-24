<template>
  <div id="app">
    <DashboardPanel />
  </div>
</template>

<script>
import DashboardPanel from '@/components/DashboardPanel.vue'

export default {
  name: 'App',
  components: {
    DashboardPanel
  }
}
</script>

<style scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  /* color: #2c3e50; */
  margin-top: 60px;
}

.dashboard-panel {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-panel h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.dashboard-panel p {
  font-size: 16px;
  color: #666;
}
</style>
