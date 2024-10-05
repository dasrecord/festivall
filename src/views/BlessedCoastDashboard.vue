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
  padding: 0rem;
  max-width: none;
}

.dashboard-panel {
  width: 100vw;
  background-color: #232323;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 10px;
}

.dashboard-panel h1 {
  color: #fff;
  font-weight: 600;
  margin: 0;
  padding: 20px;
  text-align: justify;
  text-transform: uppercase;
  height: 25px;
}

.dashboard-panel p {
  color: #666;
}
</style>
