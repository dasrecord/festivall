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
}

.dashboard-panel {
  background-color: #232323;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-panel h1 {
}

.dashboard-panel p {
  color: #666;
}
</style>
