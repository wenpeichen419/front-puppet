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
              :src="getImageUrl(item.image)" 
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
      fileBaseUrl: 'http://8.134.51.50:6060' // 添加文件服务器基础URL
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    // 从localStorage获取token
    authToken() {
      return localStorage.getItem("cookie") || '';
    }
  },
  created() {
    this.fetchResources()
  },
  methods: {
    getAuthToken() {
      return this.authToken;
    },
    
    // 添加图片URL处理方法
    getImageUrl(url) {
      if (!url) return this.fallbackImage;
      
      // 如果已经是完整URL，直接返回
      if (url.startsWith('http')) return url;
      
      // 如果是相对路径，添加文件服务器基础URL
      return `${this.fileBaseUrl}${url.startsWith('/') ? url : '/' + url}`;
    },
    
    async fetchResources() {
      this.isLoading = true
      try {
        // 构建tags数组
        const tags = []
        if (this.era) tags.push(this.era)
        if (this.theme) tags.push(this.theme)
        
        // 先获取所有数据来计算总数
        const totalParams = new URLSearchParams()
        totalParams.append('limit', 1000)
        totalParams.append('file_type', 'image')
        
        if (this.title) totalParams.append('file_title', this.title)
        
        // 为每个tag单独添加参数
        tags.forEach(tag => {
          totalParams.append('tags', tag)
        })

        const totalResponse = await fetch(`http://8.134.51.50:6060/api/v1/file/list?${totalParams.toString()}`, {
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
          
          // 为每个tag单独添加参数
          tags.forEach(tag => {
            currentPageParams.append('tags', tag)
          })

          const currentPageResponse = await fetch(`http://8.134.51.50:6060/api/v1/file/list?${currentPageParams.toString()}`, {
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
              image: item.file_url || '', // 这里不再设置fallbackImage，由getImageUrl处理
              views: item.download_count || 0,
              likes: 0,
              description: item.description || '暂无描述',
              uploadDate: this.formatDate(item.created_at),
              category: item.tags?.join(', ') || '未分类',
              tags: item.tags || [],
              file_size: item.file_size,
              mime_type: item.mime_type
            }))
            
            // 调试信息：查看第一个资源的URL处理结果
            if (this.resources.length > 0) {
              console.log('原始URL:', this.resources[0].image);
              console.log('处理后的URL:', this.getImageUrl(this.resources[0].image));
            }
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
        // 使用列表API中的数据，但确保图片URL是绝对路径
        this.selectedItem = {
          ...item,
          image: this.getImageUrl(item.image), // 确保详情页也是绝对路径
          views: (item.views || 0) + 1
        }
      } catch (err) {
        console.error('获取详情失败:', err)
        // 降级处理
        this.selectedItem = {
          ...item,
          image: this.getImageUrl(item.image),
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
      // 图片加载失败时使用备用图片
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
        const response = await fetch(`http://8.134.51.50:6060/api/v1/file/download/${item.id}`, {
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
/* 搜索框样式优化 */
.search-container {
  position: sticky;
  top: 130px;
  z-index: 80;
  margin: 0 auto 30px;
  padding: 20px;
  max-width: 1400px;
  width: 100%;
  box-sizing: border-box;
  
}

.search-box {
  background-color: #EEE4D3;
  border-radius: 48px;
  padding: 25px 35px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.search-box:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.search-fields {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: 25px;
  flex-wrap: wrap;
}

.search-field {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 200px;
  min-width: 0;
}

.search-label {
  margin-right: 12px;
  white-space: nowrap;
  font-size: 22px;
  color: #333;
  font-weight: 500;
}

.search-select, .search-input {
  padding: 14px 16px;
  border: 2px solid #d0c8b8;
  border-radius: 8px;
  font-size: 22px;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.search-select:focus, .search-input:focus {
  outline: none;
  border-color: #803c0f;
  box-shadow: 0 0 0 3px rgba(128, 60, 15, 0.1);
}

.search-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.search-input::placeholder {
  color: #999;
  font-size: 22px;
}

.search-button {
  padding: 14px 28px;
  background-color: #7a3c09;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 22px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-weight: 500;
}

.search-button:hover {
  background-color: #6a3408;
  transform: translateY(-2px);
}

.search-button:active {
  transform: translateY(0);
}

/* 资源卡片样式 */
.resource-card {
  width: 100%;
  max-width: 450px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: white;
  display: flex;
  flex-direction: column;
  height: auto; /* 改为自动高度 */
  min-height: 350px; /* 设置最小高度 */
}

.resource-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

/* 网格布局优化 */
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 35px;
  margin-bottom: 50px;
  max-width: 1400px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 分页器样式优化 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 40px 0 60px;
}

.pagination-button {
  padding: 10px 20px;
  background-color: #7a3c09;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 16px;
}

.pagination-button:hover:not(:disabled) {
  background-color: #6a3408;
  transform: translateY(-2px);
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 16px;
  color: #666;
  padding: 0 10px;
}

/* 页面基础样式 */
.resource-subpage {
  padding-top: 100px;
  min-height: calc(100vh - 180px);
  background-color: #fcfaf7;
}

.page-header-spacer {
  height: 20px;
}

.page-header {
  padding: 0 20px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header h2 {
  margin: 0;
  color: #803c0f;
  font-size: 32px;
  border-bottom: 2px solid #e0d4c3;
  padding-bottom: 15px;
}

.branch-path {
  color: #666;
  font-size: 16px;
  margin-top: 8px;
}

.resource-container {
  padding: 0;
}

/* 卡片内部样式优化 */
.card-image {
  position: relative;
  height: 220px; /* 固定图片区域高度 */
  overflow: hidden;
  background: #f9f2e7; /* 添加背景色填充空白 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持图片比例 */
  background: #ffffffff; /* 图片内部的背景色 */
}

.resource-card:hover .card-image img {
  transform: scale(1.08);
}

.card-hover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(128, 60, 15, 0.75);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
}

.resource-card:hover .card-hover {
  opacity: 1;
}

.card-body {
  padding: 20px;
  flex: 1; /* 让内容区域填充剩余空间 */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 130px; /* 设置内容区域最小高度 */
}

.card-body h3 {
  font-size: 24px;
  margin: 0 0 15px;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.stats {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 20px;
  margin-top: auto; /* 将统计信息推到底部 */
}

.stat-view, .stat-like {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 加载状态样式优化 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #f3f3f3;
  border-top: 6px solid #803c0f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-tip {
  text-align: center;
  padding: 80px 0;
  color: #666;
}

.empty-tip img {
  width: 220px;
  opacity: 0.6;
  margin-bottom: 25px;
}

.empty-tip p {
  font-size: 18px;
  margin: 0;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .search-fields {
    gap: 20px;
  }
  
  .search-field {
    flex: 1 1 45%;
  }
}

@media (max-width: 992px) {
  .resource-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
  }
  
  .card-image {
    height: 200px;
  }
}

@media (max-width: 768px) {
  .search-container {
    top: 100px;
    padding: 15px;
    margin-bottom: 20px;
  }
  
  .search-box {
    padding: 20px;
    border-radius: 30px;
  }
  
  .search-fields {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .search-field {
    flex: 1 1 100%;
    margin-bottom: 0;
  }
  
  .search-label {
    font-size: 20px;
  }
  
  .search-select, .search-input, .search-input::placeholder {
    font-size: 20px;
    padding: 12px 15px;
  }
  
  .search-button {
    width: 100%;
    padding: 14px;
    font-size: 20px;
    margin-top: 10px;
  }
  
  .page-header h2 {
    font-size: 28px;
  }
  
  .resource-card {
    height: 380px;
  }
  
  .card-body h3 {
    font-size: 22px;
  }
}

@media (max-width: 576px) {
  .resource-grid {
    grid-template-columns: 1fr;
    gap: 25px;
    padding: 0 15px;
  }
  
  .resource-card {
    max-width: 100%;
    height: auto;
  }
  
  .card-image {
    height: 180px;
  }
  
  .card-body {
    min-height: auto;
    padding: 18px;
  }
  
  .stats {
    font-size: 18px;
  }
  
  .pagination-container {
    gap: 10px;
  }
  
  .pagination-button {
    padding: 8px 15px;
    font-size: 14px;
  }
}
</style>
