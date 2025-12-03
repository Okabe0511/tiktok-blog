import { createRouter as _createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

// Auto-load pages
const pages = import.meta.glob('../pages/*.vue')

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages\/(.*)\.vue$/)[1].toLowerCase()
  return {
    path: name === 'home' ? '/' : `/${name}`,
    component: pages[path] // lazy load
  }
})

// Manual routes for better control
import Home from '../pages/Home.vue'
import ArticleDetail from '../pages/ArticleDetail.vue'
import CreateArticle from '../pages/CreateArticle.vue'
import Login from '../pages/Login.vue'

const manualRoutes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/article/:id', component: ArticleDetail },
  { path: '/create', component: CreateArticle },
  { path: '/edit/:id', component: CreateArticle },
]

export function createRouter() {
  return _createRouter({
    // use appropriate history implementation for server/client
    // import.meta.env.SSR is injected by Vite-SSR
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: manualRoutes
  })
}
