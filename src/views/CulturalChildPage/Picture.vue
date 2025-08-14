<template>
  <div class="resource-subpage">
    <!-- 加载状态提示 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>资源加载中...</p>
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
      
      <Pagination 
        v-if="resources.length > 0"
        :current="currentPage" 
        :total="totalPages" 
        :page-size="pageSize"
        @change="handlePageChange"
      />
    </div>
    
    <!-- 资源详情弹窗 -->
    <transition name="modal-fade">
      <div 
        v-if="selectedItem" 
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-container">
          <button class="modal-close" @click="closeModal">
            &times;
          </button>
          
          <div class="modal-content">
            <div class="modal-image">
              <img 
                :src="selectedItem.image" 
                :alt="selectedItem.title"
                @error="handleModalImageError"
              >
            </div>
            
            <div class="modal-details">
              <h2>{{ selectedItem.title }}</h2>
              <p class="modal-description">{{ selectedItem.description || '暂无详细描述' }}</p>
              
              <div class="modal-meta">
                <div class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>上传时间：{{ selectedItem.uploadDate || '未知日期' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-icon">🏷️</span>
                  <span>分类：{{ selectedItem.category || '传统艺术' }}</span>
                </div>
              </div>
              
              <div class="modal-stats">
                <div class="stat-item" @click="likeResource(selectedItem)">
                  <span class="stat-icon">❤️</span>
                  <span class="stat-count">{{ selectedItem.likes }}</span>
                  <span>点赞</span>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">👁️</span>
                  <span class="stat-count">{{ selectedItem.views }}</span>
                  <span>浏览</span>
                </div>
              </div>
              
              <div class="modal-actions">
                <button class="btn-download" @click="downloadResource(selectedItem)">
                  <span>⬇️ 下载高清图</span>
                </button>
                <button class="btn-share" @click="shareResource(selectedItem)">
                  <span>↗️ 分享资源</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CulturalResourcesPicture',
  data() {
    return {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedItem: null,
      resources: [],
      currentBranch: null,
      isLoading: false,
      isDetailLoading: false, // 新增：详情加载状态
      fallbackImage: require('@/assets/image-error.png')
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
    async fetchResources() {
      this.isLoading = true
      try {
        const params = {
          page: this.currentPage,
          page_size: this.pageSize,
          branch_id: this.$route.query.branch_id || 'default'
        }

        const response = await axios.get(
          'http://127.0.0.1:4523/m1/6834192-6548289-default/resources_list', 
          { params }
        )
        
        if (response.data.success) {
          this.resources = response.data.data.resources.map(item => ({
            id: item.id,
            title: item.title,
            image: item.cover_image || this.fallbackImage,
            views: item.view_count || 0,
            likes: 0
          }))
          
          this.currentBranch = response.data.data.current_branch
          this.total = response.data.data.pagination.total
        }
      } catch (err) {
        console.error('API请求错误:', err)
        if (process.env.NODE_ENV === 'development') {
          this.useLocalData()
        }
      } finally {
        this.isLoading = false
      }
    },

    // 修改后的showDetail方法（替换原来的简单实现）
    async showDetail(item) {
  this.isDetailLoading = true
  try {
    // 调用资源详情API
    const response = await axios.get(
      `http://127.0.0.1:4523/m1/6834192-6548289-default/cultural_resources/${item.id}`
    )
    
    // 安全访问嵌套属性
    const resourceData = response.data?.data?.resource || {}
    
    this.selectedItem = {
      ...item,
      ...resourceData,
      // 确保覆盖必要字段
      image: resourceData.cover_image || item.image || this.fallbackImage,
      views: (resourceData.view_count || item.views || 0) + 1
    }
    
  } catch (err) {
    console.error('获取详情失败:', err)
    this.$toast.error('获取详情失败')
    // 降级处理：使用基础信息
    this.selectedItem = { 
      ...item,
      views: (item.views || 0) + 1,
      description: '暂无详细描述'
    }
  } finally {
    this.isDetailLoading = false
  }
},

    // 修改后的下载方法（替换原来的简单实现）
    async downloadResource(item) {
  try {
    // 调用下载API
    const response = await axios.get(
      `http://127.0.0.1:4523/m1/6834192-6548289-default/cultural_resources_download/${item.id}`,
      {
        responseType: 'blob' // 必须指定响应类型
      }
    )
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // 从响应头获取文件名
    const contentDisposition = response.headers['content-disposition']
    let filename = item.title
    if (contentDisposition) {
      filename = contentDisposition.split('filename=')[1] || filename
    }
    
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 更新下载次数（可选）
    if (this.selectedItem) {
      this.selectedItem.download_count = 
        (this.selectedItem.download_count || 0) + 1
    }
  } catch (error) {
    console.error('下载失败:', error)
    // 修改这里：添加对 error.response 的检查
    const status = error.response?.status
    this.$toast.error(this.getDownloadError(status))
  }
},

    // 获取下载错误信息
    getDownloadError(status) {
      const errors = {
        401: '请登录后下载',
        403: '无下载权限',
        404: '文件不存在',
        429: '今日下载次数已达上限'
      }
      return errors[status] || '下载失败，请稍后重试'
    },

    useLocalData() {
      this.resources = [
        {
          id: 1,
          title: '清代宫廷木偶（本地数据）',
          image: require('@/assets/puppet1.jpg'),
          views: 100,
          likes: 10
        }
      ]
      this.total = 1
    },

    // 图片加载失败处理
    handleImageError(item) {
      item.image = this.fallbackImage
    },

    handleModalImageError(e) {
      e.target.src = this.fallbackImage
    },

    closeModal() {
      this.selectedItem = null
    },

    likeResource(item) {
      item.likes++
      // 实际项目中这里调用点赞API
    },

    shareResource(item) {
      if (navigator.share) {
        navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        }).catch(e => console.log('分享取消:', e))
      } else {
        // 兼容处理
        this.$toast('已复制分享链接到剪贴板')
        navigator.clipboard.writeText(window.location.href)
      }
    },

    handlePageChange(page) {
      this.currentPage = page
      this.fetchResources()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>


<style scoped>
/* 完全保留原有的所有样式 */
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

/* 资源网格样式 */
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.resource-card {
  border: 1px solid #e0d4c3;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-image {
  position: relative;
  height: 200px;
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
  padding: 15px;
}

.card-body h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats {
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.stat-view, .stat-like {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 弹窗样式 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
}

.modal-close:hover {
  background: #803c0f;
  transform: rotate(90deg);
}

.modal-content {
  display: flex;
  flex-direction: column;
}

.modal-image {
  height: 400px;
  overflow: hidden;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f9f2e7;
}

.modal-details {
  padding: 25px;
  flex: 1;
}

.modal-details h2 {
  margin: 0 0 15px;
  color: #803c0f;
  font-size: 24px;
}

.modal-description {
  line-height: 1.7;
  color: #555;
  margin-bottom: 20px;
}

.modal-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  font-size: 14px;
  color: #666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.modal-stats {
  display: flex;
  gap: 20px;
  margin: 25px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: #f9f2e7;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.stat-item:hover {
  background: #e0d4c3;
}

.stat-icon {
  font-size: 18px;
}

.stat-count {
  font-weight: bold;
  color: #803c0f;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-download,
.btn-share {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-download {
  background: #803c0f;
  color: white;
}

.btn-download:hover {
  background: #6e2c1b;
}

.btn-share {
  background: #f5f5f5;
  color: #333;
}

.btn-share:hover {
  background: #e0e0e0;
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
@media (max-width: 768px) {
  .resource-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .modal-container {
    width: 95%;
    max-height: 85vh;
  }
  
  .modal-image {
    height: 300px;
  }
  
  .modal-content {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-download,
  .btn-share {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-image {
    height: 250px;
  }
  
  .modal-meta {
    flex-direction: column;
    gap: 10px;
  }
}
</style>