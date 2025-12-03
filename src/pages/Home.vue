<template>
  <div class="home">
    <div class="sidebar">
      <h3>Tag Cloud</h3>
      <div class="tag-cloud">
        <span v-for="tag in tags" :key="tag.name" class="tag-cloud-item" :style="{ fontSize: 12 + (tag.count * 2) + 'px' }">
          {{ tag.name }} ({{ tag.count }})
        </span>
      </div>
    </div>
    <div class="main-content">
      <h1>Latest Articles</h1>
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
    const res = await fetch(`${baseUrl}/api/articles?page=${page}&limit=3`)
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
  width: 200px;
  flex-shrink: 0;
  padding-right: 20px;
  border-right: 1px solid var(--border-color, #eee);
}
.main-content {
  flex-grow: 1;
}
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.tag-cloud-item {
  background: var(--border-color, #eee);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--text-color, #333);
}
.article-list {
  list-style: none;
  padding: 0;
}
.article-item {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}
.meta {
  color: #666;
  font-size: 0.9em;
}
.pagination {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}
.pagination button {
  padding: 5px 10px;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.delete-btn {
  background: #ff4444;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
}
.edit-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
  margin-right: 10px;
}
.actions {
  margin-top: 10px;
}
</style>
