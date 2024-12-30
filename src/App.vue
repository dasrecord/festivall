<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import { useHead } from '@vueuse/head'

useHead({
  title: 'FESTIVALL',
  meta: [
    {
      name: 'description',
      content: 'Home of the best Canadian grassroots electronic music festivals.'
    },
    {
      name: 'keywords',
      content: 'Festival, Festiv-All, Impact, Evolved, Blessed Coast, Reunion, festival, Das Record'
    }
  ]
})
</script>

<template>
  <header v-show="$route.meta.showHeader">
    <div class="wrapper">
      <HelloWorld msg="FESTIV-ALL" />
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/reunion">Reunion</RouterLink>
        <RouterLink to="/dasrecord">Das Record</RouterLink>
        <RouterLink to="/placeholder">Place Holder</RouterLink>
        <RouterLink to="/soundtech">Sound Tech</RouterLink>
        <RouterLink to="/blessedcoast">Blessed</RouterLink>
        <RouterLink to="/synergistic">Synergistic</RouterLink>
        <a href="https://evolvedmusicgroup.com"> Evolved</a>
        <a href="https://www.instagram.com/impactfestival_bc/">Impact</a>
        <RouterLink to="/fusecollective">Fuse</RouterLink>
        <RouterLink to="/dashboard">Dashboard</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.3;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 1rem auto;
  /* box-shadow: 0 0 10px rgb(0, 128, 255); */
}

nav {
  display: grid;
  gap: 0.25rem;
  padding: 0 1rem;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  font-size: 16px;
  text-align: center;
  margin-top: 1rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);

  border-radius: 5px;
  margin: 1px;
}

@media (min-width: 1024px) {


  nav {
    display: flex;
    text-align: center;
    justify-content: space-around;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
