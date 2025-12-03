<template>
  <div class="container" :class="{ dark: isDark }">
    <header>
      <nav>
        <router-link to="/">Home</router-link> |
        <template v-if="user">
          <span class="user-info">Welcome, {{ user.username }} ({{ user.role }})</span> |
          <router-link v-if="user.role === 'admin'" to="/create">Create Article</router-link> |
          <a href="#" @click.prevent="logout">Logout</a>
        </template>
        <template v-else>
          <router-link to="/login">Login</router-link>
        </template>
        
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
import { useRouter } from 'vue-router'

const isDark = ref(false)
const user = ref(null)
const router = useRouter()

const checkAuth = () => {
  if (typeof localStorage !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      user.value = JSON.parse(userStr)
    } else {
      user.value = null
    }
  }
}

const logout = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    user.value = null
    window.dispatchEvent(new Event('auth-change'))
    router.push('/')
  }
}

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
    
    // Check auth on mount
    checkAuth()
    
    // Listen for auth changes
    window.addEventListener('auth-change', checkAuth)
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
  max-width: 1200px;
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
.user-info {
  margin-right: 10px;
  font-weight: bold;
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
