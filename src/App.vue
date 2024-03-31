<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <div class="wrapper">
      <!-- <img alt="Festivall" class="logo" src="/festivall_emblem.png" /> -->
      <HelloWorld msg="FESTIV-ALL" />
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/reunion">Reunion</RouterLink>
        <a href="https://www.instagram.com/impactfestival_bc/">Impact</a>
        <!-- <RouterLink to="/blessed">Blessed Coast</RouterLink> -->
        <a href="https://evolvedmusicgroup.com"> Evolved</a>
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
  box-shadow: 0 0 10px rgb(0, 128, 255);
}

nav {
  width: 100%;
  font-size: 16px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    /* display: flex; */
    place-items: center;
    justify-items: center;
    /* padding-right: calc(var(--section-gap) / 2); */
  }

  .logo {
    display: block;
    /* margin: 0 2rem 0 0; */
  }

  header .wrapper .logo {
    display: flex;
    justify-content: center;
    text-align: center;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: center;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
