<template>
  <div class="container" :class="{ dark: isDark }">
    <header>
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link to="/create">Create Article</router-link>
        <button @click="toggleTheme" class="theme-toggle">
          {{ isDark ? '☀️ Light' : '🌙 Dark' }}
        </button>
      </nav>
    </header>
    <main>
      <router-view v-slot="{ Component }">
        <Suspense>
          <component :is="Component" />
        </Suspense>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
  updateBodyClass()
}

const updateBodyClass = () => {
  if (typeof document !== 'undefined') {
    if (isDark.value) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }
}

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      isDark.value = true
      updateBodyClass()
    }
  }
})
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --link-color: #42b883;
  --border-color: #eee;
}

body.dark-mode {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --link-color: #42b883;
  --border-color: #333;
  background-color: var(--bg-color);
  color: var(--text-color);
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}
nav {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}
a {
  text-decoration: none;
  color: var(--link-color);
  margin-right: 10px;
}
.theme-toggle {
  margin-left: auto;
  background: none;
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  color: var(--text-color);
}
</style>
