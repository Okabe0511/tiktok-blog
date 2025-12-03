<template>
  <div class="article-page">
    <div class="article-detail" v-if="article">
      <h1>{{ article.title }}</h1>
    <div class="meta">
      <span>By {{ article.author }}</span> | 
      <span>{{ new Date(article.createdAt).toLocaleDateString() }}</span> |
      <span>Views: {{ article.views }}</span>
    </div>
    
    <div class="export-actions">
      <button @click="exportMarkdown">Export Markdown</button>
      <button @click="exportPDF">Export PDF</button>
    </div>

    <div class="admin-actions" v-if="isAdmin">
      <button @click="editArticle" class="edit-btn">Edit</button>
      <button @click="deleteArticle" class="delete-btn">Delete</button>
    </div>

    <div class="content" id="article-content" v-html="renderedContent"></div>
    
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next</button>
    </div>

    <div class="tags" v-if="article.tags">
      Tags: <span v-for="tag in article.tags.split(',')" :key="tag" class="tag">{{ tag }}</span>
    </div>

    <div class="comments-section">
      <h3>Comments</h3>
      <div class="comment-form">
        <input v-model="newCommentAuthor" placeholder="Your Name" />
        <textarea v-model="newCommentContent" placeholder="Write a comment..." required></textarea>
        <button @click="submitComment">Post Comment</button>
      </div>
      <div v-if="comments.length === 0">No comments yet.</div>
      <ul v-else class="comment-list">
        <li v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <strong>{{ comment.author }}</strong>
            <span>{{ new Date(comment.createdAt).toLocaleString() }}</span>
          </div>
          <div class="comment-body">{{ comment.content }}</div>
        </li>
      </ul>
    </div>

    <router-link to="/">Back to Home</router-link>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onServerPrefetch, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()
const article = ref(null)
const comments = ref([])
const newCommentAuthor = ref('')
const newCommentContent = ref('')
const currentPage = ref(1)
const pageSize = 200 
const isAdmin = ref(false)

// Check admin status from localStorage
const checkAdmin = () => {
  if (typeof localStorage !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      isAdmin.value = user.role === 'admin'
    } else {
      isAdmin.value = false
    }
  }
}

const fetchArticle = async () => {
  try {
    const baseUrl = import.meta.env.SSR ? 'http://localhost:3000' : ''
    const res = await fetch(`${baseUrl}/api/articles/${route.params.id}`)
    if (res.ok) {
      article.value = await res.json()
    }
  } catch (e) {
    console.error(e)
  }
}

// Watch for route changes to re-fetch article
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchArticle()
    fetchComments()
  }
})

onServerPrefetch(async () => {
  await fetchArticle()
})

onMounted(() => {
  if (!article.value) {
    fetchArticle()
  }
  fetchComments()
  checkAdmin()
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-change', checkAdmin)
  }
})

// Delete Article
const deleteArticle = async () => {
  if (!isAdmin.value) return
  if (!confirm('Are you sure you want to delete this article?')) return

  try {
    const headers = { 'Content-Type': 'application/json' }
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const res = await fetch(`/api/articles/${article.value.id}`, {
      method: 'DELETE',
      headers: headers
    })

    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      alert('Failed to delete: ' + (data.error || 'Unknown error'))
    }
  } catch (e) {
    console.error(e)
    alert('Error: ' + e.message)
  }
}

const editArticle = () => {
  if (!isAdmin.value) return
  router.push(`/edit/${article.value.id}`)
}

// Fetch Comments (Client-side only for now to simplify SSR data fetching)
const fetchComments = async () => {
  try {
    const res = await fetch(`/api/articles/${route.params.id}/comments`)
    comments.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

const submitComment = async () => {
  if (!newCommentContent.value) return
  try {
    const res = await fetch(`/api/articles/${route.params.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: newCommentAuthor.value || 'Anonymous',
        content: newCommentContent.value
      })
    })
    if (res.ok) {
      newCommentContent.value = ''
      fetchComments()
    }
  } catch (e) {
    console.error(e)
  }
}

const totalPages = computed(() => {
  if (!article.value || !article.value.content) return 1
  return Math.ceil(article.value.content.length / pageSize)
})

const displayedContent = computed(() => {
  if (!article.value || !article.value.content) return ''
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return article.value.content.slice(start, end)
})

const renderedContent = computed(() => {
  return marked.parse(displayedContent.value)
})

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Optional: Scroll to top of content
  }
}

const exportMarkdown = () => {
  if (!article.value) return
  const blob = new Blob([article.value.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${article.value.title}.md`
  a.click()
  URL.revokeObjectURL(url)
}

const exportPDF = async () => {
  if (typeof window === 'undefined') return

  // Load html2pdf from CDN to avoid SSR issues with the npm package
  if (!window.html2pdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const element = document.getElementById('article-content')
  const opt = {
    margin: 1,
    filename: `${article.value.title}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }
  window.html2pdf().set(opt).from(element).save()
}
</script>

<style scoped>
.article-detail {
  margin-top: 20px;
}
.meta {
  color: #888;
  margin-bottom: 20px;
}
.content {
  line-height: 1.6;
  margin-bottom: 30px;
  white-space: pre-wrap; /* Preserve newlines */
}
.pagination {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}
.pagination button {
  padding: 5px 10px;
  cursor: pointer;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
}
.pagination button:disabled {
  background-color: #a0dcb9;
  cursor: not-allowed;
}
.tag {
  background: #eee;
  padding: 2px 5px;
  margin-right: 5px;
  border-radius: 3px;
  font-size: 0.8em;
  color: #333;
}
.comments-section {
  margin-top: 40px;
  border-top: 1px solid var(--border-color, #eee);
  padding-top: 20px;
}
.comment-form {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-form input, .comment-form textarea {
  padding: 8px;
  border: 1px solid var(--border-color, #ccc);
  background: var(--bg-color, #fff);
  color: var(--text-color, #333);
}
.comment-list {
  list-style: none;
  padding: 0;
}
.comment-item {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color, #eee);
}
.comment-header {
  font-size: 0.9em;
  color: #888;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}
.admin-actions {
  margin: 10px 0;
}
.edit-btn, .delete-btn {
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  color: white;
}
.edit-btn {
  background-color: #007bff;
}
.delete-btn {
  background-color: #dc3545;
}
</style>
