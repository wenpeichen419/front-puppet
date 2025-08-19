<template>
  <div class="resource-subpage">
    <!-- 加载状态提示 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>资源加载中...</p>
    </div>

    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-box">
        <div class="search-fields">
          <div class="search-field">
            <span class="search-label">年代：</span>
            <select v-model="era" class="search-select">
              <option value="">全部</option>
              <option value="清朝">清朝</option>
              <option value="民国">民国</option>
              <option value="现代">现代</option>
            </select>
          </div>
          
          <div class="search-field">
            <span class="search-label">题材：</span>
            <select v-model="theme" class="search-select">
              <option value="">全部</option>
              <option value="爱情">爱情</option>
              <option value="战争">战争</option>
              <option value="娱乐">娱乐</option>
            </select>
          </div>
          
          <div class="search-field">
            <span class="search-label">题目：</span>
            <input 
              v-model="title" 
              type="text" 
              class="search-input" 
              placeholder="请输入题目"
            >
          </div>
          
          <button 
            class="search-button"
            @click="handleSearch"
          >
            搜索
          </button>
        </div>
      </div>
    </div>
    
    <!-- 顶部安全间距 -->
    <div class="page-header-spacer"></div>
    
    <div class="page-header">
      <h2>{{ currentBranch?.name || '图片资源' }}</h2>
      <p v-if="currentBranch" class="branch-path">
        当前分类：{{ currentBranch.parent_branch }} > {{ currentBranch.name }}
      </p>
    </div>
    
    <!-- 资源网格 -->
    <div class="resource-container">
      <div v-if="resources.length === 0 && !isLoading" class="empty-tip">
        <img src="@/assets/empty.png" alt="暂无数据">
        <p>当前分类下暂无资源</p>
      </div>

      <div v-else class="resource-grid">
        <div 
          v-for="item in resources" 
          :key="item.id" 
          class="resource-card"
          @click="showDetail(item)"
        >
          <div class="card-image">
            <img 
              :src="item.image" 
              :alt="item.title"
              @error="handleImageError(item)"
            >
            <div class="card-hover">
              <span>点击查看详情</span>
            </div>
          </div>
          <div class="card-body">
            <h3>{{ item.title }}</h3>
            <div class="stats">
              <span class="stat-view">👁️ {{ item.views }}</span>
              <span class="stat-like">❤️ {{ item.likes }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页器 -->
      <div class="pagination-container" v-if="total > 0">
        <button 
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          上一页
        </button>
        
        <span class="pagination-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </span>
        
        <button 
          class="pagination-button"
          :disabled="currentPage >= totalPages"
          @click="goToPage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
    
    <!-- 资源详情弹窗 -->
    <ResourceDetailModal 
      v-if="selectedItem" 
      :item="selectedItem"
      @close="closeModal"
      @like="likeResource"
      @download="downloadResource"
      @share="shareResource"
    />
  </div>
</template>

<script>
import axios from 'axios'
import fallbackImage from '@/assets/image-error.png'
import ResourceDetailModal from '@/components/ResourceDetailModel.vue'

export default {
  name: 'CulturalResourcesPicture',
  components: {
    ResourceDetailModal
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 9,
      total: 0,
      selectedItem: null,
      resources: [],
      currentBranch: null,
      isLoading: false,
      isDetailLoading: false,
      fallbackImage: fallbackImage,
      era: '',
      theme: '',
      title: '',
      authToken: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhbWFuZGFjaGVuXzIwMjNAcXEuY29tIiwic3RhdHVzIjoiYWN0aXZlIiwiZXhwIjoxNzU2MTAzODIxfQ.ZBtXdezUHw1QrKX5sLX6o1o9aKXOXgQH4f8I2LOrOn0'
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  created() {
    this.fetchResources()
  },
  methods: {
    getAuthToken() {
      return this.authToken
    },
    
    async fetchResources() {
      this.isLoading = true
      try {
        // 先获取所有数据来计算总数
        const totalParams = new URLSearchParams()
        totalParams.append('limit', 1000) // 设置足够大的limit来获取所有数据
        totalParams.append('file_type', 'image')
        
        if (this.title) totalParams.append('file_title', this.title)
        
        // 处理标签参数
        const tags = []
        if (this.era) tags.push(this.era)
        if (this.theme) tags.push(this.theme)
        if (tags.length > 0) {
          totalParams.append('tags', tags.join(','))
        }

        const totalResponse = await fetch(`/api/v1/file/list?${totalParams.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': this.getAuthToken()
          }
        })

        if (!totalResponse.ok) {
          throw new Error(`HTTP错误! 状态码: ${totalResponse.status}`)
        }

        const totalData = await totalResponse.json()
        
        if (totalData.code === 200) {
          // 获取总记录数
          this.total = totalData.data.total || 0
          
          // 然后获取当前页的数据
          const currentPageParams = new URLSearchParams()
          currentPageParams.append('skip', (this.currentPage - 1) * this.pageSize)
          currentPageParams.append('limit', this.pageSize)
          currentPageParams.append('file_type', 'image')
          
          if (this.title) currentPageParams.append('file_title', this.title)
          if (tags.length > 0) {
            currentPageParams.append('tags', tags.join(','))
          }

          const currentPageResponse = await fetch(`/api/v1/file/list?${currentPageParams.toString()}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': this.getAuthToken()
            }
          })

          if (!currentPageResponse.ok) {
            throw new Error(`HTTP错误! 状态码: ${currentPageResponse.status}`)
          }

          const currentPageData = await currentPageResponse.json()
          
          if (currentPageData.code === 200) {
            this.resources = currentPageData.data.files.map(item => ({
              id: item.file_id,
              title: item.file_title || '未命名',
              image: item.file_url || this.fallbackImage,
              views: item.download_count || 0,
              likes: 0,
              description: item.description || '暂无描述',
              uploadDate: this.formatDate(item.created_at),
              category: item.tags?.join(', ') || '未分类',
              tags: item.tags || [],
              file_size: item.file_size,
              mime_type: item.mime_type
            }))
          }
        }
      } catch (err) {
        console.error('API请求错误:', err)
        this.$message.error(`API请求失败: ${err.message}`)
        if (process.env.NODE_ENV === 'development') {
          this.useLocalData()
        }
      } finally {
        this.isLoading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '未知日期'
      const date = new Date(dateString)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    },

    async showDetail(item) {
      this.isDetailLoading = true
      try {
        // 使用列表API中的数据
        this.selectedItem = {
          ...item,
          views: (item.views || 0) + 1
        }
      } catch (err) {
        console.error('获取详情失败:', err)
        // 降级处理
        this.selectedItem = {
          ...item,
          views: (item.views || 0) + 1,
          description: '暂无详细描述'
        }
      } finally {
        this.isDetailLoading = false
      }
    },

    handleSearch() {
      this.currentPage = 1
      this.fetchResources()
    },

    goToPage(page) {
      // 确保页码在有效范围内
      if (page < 1 || page > this.totalPages) return
      
      this.currentPage = page
      this.fetchResources()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    useLocalData() {
      // 本地测试数据使用15条记录，以便测试分页
      this.resources = Array.from({length: 9}, (_, i) => ({
        id: i + 1,
        title: `清代宫廷木偶 ${i+1}（本地数据）`,
        image: new URL('@/assets/puppet1.jpg', import.meta.url).href,
        views: 100 + i,
        likes: 10 + i,
        description: '本地测试数据',
        uploadDate: '2023年1月1日',
        category: '清朝, 娱乐',
        tags: ['清朝', '娱乐'],
        file_size: 1024,
        mime_type: 'image/jpeg'
      }))
      this.total = 15 // 模拟15条记录，分2页
    },

    handleImageError(item) {
      item.image = this.fallbackImage
    },

    closeModal() {
      this.selectedItem = null
    },

    likeResource(item) {
      item.likes++
      // 实际项目中这里调用点赞API
    },

    async downloadResource(item) {
      try {
        const response = await fetch(`/api/v1/file/download/${item.id}`, {
          headers: {
            'Authorization': this.getAuthToken()
          }
        })
        
        if (!response.ok) throw new Error('下载失败')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = item.title || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 更新下载次数
        if (this.selectedItem) {
          this.selectedItem.views = (this.selectedItem.views || 0) + 1
        }
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('下载失败，请稍后重试')
      }
    },

    shareResource(item) {
      if (navigator.share) {
        navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        }).catch(e => console.log('分享取消:', e))
      } else {
        this.$message.success('已复制分享链接到剪贴板')
        navigator.clipboard.writeText(window.location.href)
      }
    }
  }
}
</script>

<style scoped>
/* 所有样式保持不变 */
/* 搜索框样式 */
.search-container {
  position: sticky;
  top: 130px;
  z-index: 80;
  margin-left: 50px;
  padding: 20px 20px 0;
}

.search-box {
  background-color: #EEE4D3;
  padding-left: 20px;
  border-radius: 48px;
  padding: 25px 35px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-fields {
  display: flex;
  align-items: center;
  justify-content: space-around; /* 均匀分布元素 */
  width: 100%; /* 确保占满容器宽度 */
  gap: 20px;
}

.search-field {
  display: flex;
  align-items: center;
  flex: 1; /* 让每个搜索项平均分配空间 */
  min-width: 0; /* 允许内容收缩 */
}

.search-label {
  margin-right: 12px;
  white-space: nowrap;
  font-size: 22px; /* 放大标签文字 */
  color: #333;
}

.search-select, .search-input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 22px; /* 放大输入框文字 */
  width: 100%; /* 让输入框占满可用空间 */
  box-sizing: border-box;
}

.search-select {
  /* 为下拉框添加箭头图标空间 */
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.search-input::placeholder {
  color: #999;
  font-size: 22px; /* 放大占位符文字 */
}

.search-button {
  padding: 12px 24px;
  background-color: #7a3c09;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 22px; /* 放大按钮文字 */
  white-space: nowrap; /* 防止按钮文字换行 */
  flex-shrink: 0; /* 防止按钮缩小 */
}

.search-button:hover {
  background-color: #6a3408;
}

/* 资源卡片放大1.5倍 */
.resource-card {
  width: 450px; /* 固定宽度 */
  height: 400px; /* 固定高度 */
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  position: relative; /* 保持XY坐标固定 */
  transition: transform 0.3s ease;
  background: white;
}

/* 调整网格布局以适应放大后的卡片 */
.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 固定3列 */
  gap: 37.5px;
  margin-bottom: 40px;
  /* 移除默认居中限制，让内容从左侧开始排列 */
  max-width: none; /* 取消最大宽度限制 */
  padding: 0 20px; /* 仅保留左右基础内边距 */
  justify-items: start; /* 网格项左对齐 */
}

/* 分页器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination-button {
  padding: 8px 16px;
  background-color: #7a3c09;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

/* 其余原有样式保持不变 */
.resource-subpage {
  padding-top: 100px;
  min-height: calc(100vh - 180px);
}

.page-header-spacer {
  height: 20px;
}

.page-header {
  padding: 0 20px 20px;
}

.page-header h2 {
  margin: 0;
  color: #803c0f;
  font-size: 24px;
  border-bottom: 2px solid #e0d4c3;
  padding-bottom: 10px;
}

.branch-path {
  color: #666;
  font-size: 14px;
  margin-top: 5px;
}

.resource-container {
  padding: 0 20px;
}

/* 调整卡片样式（移除原有的scale放大，避免布局混乱） */
.resource-card {
  /* 移除原有的scale放大，避免比例失调 */
  transform: none !important;
  margin-bottom: 40px; /* 增加底部间距 */
  height: 100%; /* 确保卡片高度自适应内容 */
    border: 1px solid #e0e0e0; /* 浅灰色边框，1px宽度 */
  /* 可选：增加边框圆角让样式更和谐 */
  border-radius: 8px;
}

/* 修正hover效果（移除缩放） */
.resource-card:hover {
  /* 移除hover时的scale放大，只保留上浮效果 */
  transform: translateY(-5px) !important;
}

/* 响应式调整 - 在小屏幕上自动减少列数 */
@media (max-width: 1024px) {
  .resource-grid {
    grid-template-columns: repeat(2, 1fr); /* 中等屏幕显示2列 */
  }
}

@media (max-width: 768px) {
  .resource-grid {
    grid-template-columns: 1fr; /* 小屏幕显示1列 */
  }
}

.card-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-hover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 60, 15, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.resource-card:hover .card-hover {
  opacity: 1;
}

.resource-card:hover .card-image img {
  transform: scale(1.05);
}

.card-body {
  padding: 20px; /* 增加内边距 */
  min-height: 100px; /* 确保内容区有足够高度 */
}


.card-body h3 {
  font-size: 24px; /* 适当放大标题 */
  margin-bottom: 15px;
}

.stats {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 22px;
}

.stat-view, .stat-like {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #803c0f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-tip {
  text-align: center;
  padding: 50px 0;
}

.empty-tip img {
  width: 200px;
  opacity: 0.6;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-fields {
    flex-wrap: wrap;
  }
  
  .search-field {
    flex: 1 1 40%; /* 在中等屏幕上每行显示两个元素 */
  }
}

@media (max-width: 768px) {
  .search-container {
    margin-left: 0;
    padding: 10px;
  }
  
  .search-fields {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-field {
    flex: 1 1 100%; /* 在小屏幕上每行显示一个元素 */
    margin-bottom: 15px;
  }
  
.resource-grid {
  grid-template-columns: repeat(3, 1fr); /* 固定3列布局 */
  gap: 30px; /* 增加卡片间距 */
  padding: 0 20px; /* 增加左右边距 */
}
}

@media (max-width: 480px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }
}
</style>