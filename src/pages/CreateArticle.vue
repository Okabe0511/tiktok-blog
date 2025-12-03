<template>
  <div class="create-article">
    <h1>{{ isEditMode ? 'Edit Article' : 'Create New Article' }}</h1>
    <form @submit.prevent="submitArticle">
      <div class="form-group">
        <label>Title</label>
        <input v-model="form.title" required />
      </div>
      <div class="form-group">
        <label>Summary</label>
        <input v-model="form.summary" />
      </div>
      <div class="form-group">
        <label>Content</label>
        <div class="ai-tools">
          <button type="button" @click="generateAI" :disabled="aiLoading">
            {{ aiLoading ? 'Generating...' : 'AI Assist' }}
          </button>
          <button type="button" @click="triggerImageUpload" style="margin-left: 10px;">
            Insert Image
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleImageUpload" 
            accept="image/*" 
            style="display: none;" 
          />
        </div>
        <textarea v-model="form.content" ref="contentArea" required rows="10"></textarea>
      </div>
      <div class="form-group">
        <label>Tags (comma separated)</label>
        <input v-model="form.tags" />
      </div>
      <button type="submit">{{ isEditMode ? 'Update' : 'Publish' }}</button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const aiLoading = ref(false)
const contentArea = ref(null)
const fileInput = ref(null)

const isEditMode = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  summary: '',
  content: '',
  tags: ''
})

onMounted(async () => {
  // Check authentication and role
  if (typeof localStorage !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/login')
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'admin') {
      alert('Access denied. Admins only.')
      router.push('/')
      return
    }
  }

  if (isEditMode.value) {
    try {
      const baseUrl = import.meta.env.SSR ? 'http://localhost:3000' : ''
      const res = await fetch(`${baseUrl}/api/articles/${route.params.id}`)
      if (res.ok) {
        const data = await res.json()
        form.title = data.title
        form.summary = data.summary
        form.content = data.content
        form.tags = data.tags
      }
    } catch (e) {
      console.error(e)
    }
  }
})

const triggerImageUpload = () => {
  fileInput.value.click()
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    const headers = {}
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: headers,
      body: formData
    })
    const data = await res.json()
    
    if (data.url) {
      // Insert Markdown image syntax
      const imgTag = `![Image](${data.url})`
      
      // Insert at cursor position or append
      const textarea = contentArea.value
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = form.content
        form.content = text.substring(0, start) + imgTag + text.substring(end)
        
        // Restore cursor position
        setTimeout(() => {
          textarea.focus()
          textarea.selectionStart = textarea.selectionEnd = start + imgTag.length
        }, 0)
      } else {
        form.content += imgTag
      }
    } else {
      alert('Upload failed')
    }
  } catch (e) {
    console.error(e)
    alert('Upload error: ' + e.message)
  } finally {
    // Reset input so same file can be selected again
    event.target.value = ''
  }
}

const generateAI = async () => {
  if (!form.title) {
    alert('Please enter a title first for AI context')
    return
  }
  aiLoading.value = true
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: form.title })
    })
    const data = await res.json()
    
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Failed to generate content')
    }

    if (data.content) {
      form.content += (form.content ? '\n\n' : '') + data.content
    }
  } catch (e) {
    console.error(e)
    alert(e.message)
  } finally {
    aiLoading.value = false
  }
}

const submitArticle = async () => {
  try {
    const url = isEditMode.value ? `/api/articles/${route.params.id}` : '/api/articles'
    const method = isEditMode.value ? 'PUT' : 'POST'
    
    const headers = { 'Content-Type': 'application/json' }
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const res = await fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify(form)
    })
    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      alert('Failed to save article: ' + (data.error || 'Unknown error'))
    }
  } catch (e) {
    console.error(e)
    alert('Error: ' + e.message)
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
}
input, textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  cursor: pointer;
}
.ai-tools {
  margin-bottom: 5px;
}
.ai-tools button {
  background: #666;
  font-size: 0.8em;
  padding: 5px 10px;
}
</style>
