<template>
  <div class="home">
    <div class="sidebar">
      <h3>Tag Cloud</h3>
      <div class="tag-cloud">
        <span 
          v-for="tag in tags" 
          :key="tag.name" 
          class="tag-cloud-item" 
          :style="{ fontSize: 12 + (tag.count * 2) + 'px' }"
          @click="selectTag(tag.name)"
        >
          {{ tag.name }} ({{ tag.count }})
        </span>
      </div>
    </div>
    <div class="main-content">
      <h1>Latest Articles</h1>
      
      <div class="search-bar">
        <input v-model="searchQuery" placeholder="Search articles..." />
      </div>

      <div v-if="loading">Loading...</div>
      <div v-else>
        <ul class="article-list">
          <li v-for="article in articles" :key="article.id" class="article-item">
            <h2>
              <router-link :to="'/article/' + article.id">{{ article.title }}</router-link>
            </h2>
            <p class="meta">
              By {{ article.author }} | 
              {{ new Date(article.createdAt).toLocaleDateString() }} | 
              Views: {{ article.views }}
            </p>
            <p>{{ article.summary }}</p>
            <div class="actions">
            <button @click="$router.push(`/edit/${article.id}`)" class="edit-btn">Edit</button>
            <button @click="deleteArticle(article.id)" class="delete-btn">Delete</button>
          </div>
        </li>
      </ul>
      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
      </div>
      </div>
    </div>
  </div>
</template><script setup>
import { ref, onMounted, watch } from 'vue'
import { onServerPrefetch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const articles = ref([])
const tags = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const searchQuery = ref('')

const selectTag = (tagName) => {
  searchQuery.value = `#${tagName}`
}

const fetchTags = async () => {
  try {
    const baseUrl = import.meta.env.SSR ? 'http://localhost:3000' : ''
    const res = await fetch(`${baseUrl}/api/tags`)
    tags.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

const fetchArticles = async (page = 1) => {
  loading.value = true
  const baseUrl = import.meta.env.SSR ? 'http://localhost:3000' : ''
  try {
    // Limit set to 3 to demonstrate pagination easily
    let url = `${baseUrl}/api/articles?page=${page}&limit=3`
    if (searchQuery.value) {
      url += `&search=${encodeURIComponent(searchQuery.value)}`
    }
    const res = await fetch(url)
    const data = await res.json()
    articles.value = data.articles
    totalPages.value = data.totalPages
    currentPage.value = data.currentPage
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const searchArticles = () => {
  currentPage.value = 1
  fetchArticles(1)
}

let debounceTimeout = null
watch(searchQuery, () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    searchArticles()
  }, 300)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    // In a real app, you might want to update the URL query param
    fetchArticles(page)
  }
}

const deleteArticle = async (id) => {
  if (!confirm('Are you sure you want to delete this article?')) return

  try {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    if (res.ok) {
      // Refresh list
      await fetchArticles(currentPage.value)
    } else {
      alert('Failed to delete article')
    }
  } catch (e) {
    console.error(e)
    alert('Error deleting article')
  }
}

// Fetch on server
onServerPrefetch(async () => {
  await Promise.all([fetchArticles(), fetchTags()])
})

// Fetch on client
onMounted(async () => {
  if (articles.value.length === 0) {
    await fetchArticles()
  }
  if (tags.value.length === 0) {
    fetchTags()
  }
})
</script>

<style scoped>
.home {
  display: flex;
  gap: 20px;
}
.sidebar {
  width: 250px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  height: fit-content;
}
.main-content {
  flex: 1;
}
.search-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}
.search-bar input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.search-bar button {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tag-cloud-item {
  color: #42b983;
  cursor: pointer;
}
.article-list {
  list-style: none;
  padding: 0;
}
.article-item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}
.meta {
  color: #888;
  font-size: 0.9em;
}
.actions {
  margin-top: 10px;
}
.edit-btn, .delete-btn {
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
.delete-btn {
  color: red;
}
.pagination {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}
</style>
