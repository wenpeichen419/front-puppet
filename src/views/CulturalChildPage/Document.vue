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
            <span class="search-label">年代代：</span>
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
      <h2>{{ currentBranch?.name || '文献资源' }}</h2>
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
        <!-- 资源卡片 -->
        <div 
          v-for="item in resources" 
          :key="item.id" 
          class="resource-card"
          @click="showDetail(item)"
        >
          <div class="card-image">
            <!-- 文档预览图处理 -->
            <img 
              v-if="item.previewImage"
              :src="item.previewImage" 
              :alt="item.title"
              @error="handleImageError(item)"
            >
            <div v-else class="document-preview">
              <div class="document-icon">
                <i class="el-icon-document"></i>
                <span>{{ getFileExtension(item.filename) }}</span>
              </div>
            </div>
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
      <div class="pagination-container" v-if="resources.length > 0">
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
    
    <!-- 文档详情弹窗 -->
    <div v-if="selectedItem" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedItem.title }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="document-viewer-container">
            <!-- PDF预览区域 - 增强版 -->
            <div v-if="selectedItem.mime_type === 'application/pdf'" class="pdf-viewer-container">
              <div class="pdf-controls">
                <div class="control-group">
                  <button class="control-btn" @click="prevPage" :disabled="currentPdfPage <= 1">
                    <i class="el-icon-arrow-left"></i> 上一页
                  </button>
                  <span class="page-info">第 {{ currentPdfPage }} 页 / 共 {{ totalPdfPages }} 页</span>
                  <button class="control-btn" @click="nextPage" :disabled="currentPdfPage >= totalPdfPages">
                    下一页 <i class="el-icon-arrow-right"></i>
                  </button>
                </div>
                
                <div class="zoom-controls">
                  <button class="zoom-btn" @click="zoomOut">-</button>
                  <span>{{ Math.round(zoom * 100) }}%</span>
                  <button class="zoom-btn" @click="zoomIn">+</button>
                </div>
              </div>
              
              <div class="pdf-viewer" ref="pdfViewer">
                <canvas v-for="page in totalPdfPages" :key="page" 
                  :ref="`pdfCanvas-${page}`" 
                  v-show="currentPdfPage === page"
                  class="pdf-page-canvas">
                </canvas>
                
                <div v-if="pdfLoading" class="pdf-loading">
                  <div class="loading-spinner"></div>
                  <p>加载PDF文档中...</p>
                </div>
              </div>
            </div>
            
            <!-- 其他文档类型显示图标 -->
            <div v-else class="document-preview">
              <img 
                :src="selectedItem.previewImage" 
                :alt="selectedItem.title"
                class="document-preview-img"
              >
            </div>
            
            <div class="video-meta-detail">
              <div class="meta-row">
                <span class="meta-label">上传时间：</span>
                <span class="meta-value">{{ selectedItem.uploadDate }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">文档分类：</span>
                <span class="meta-value">{{ selectedItem.category }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">文件大小：</span>
                <span class="meta-value">{{ formatFileSize(selectedItem.file_size) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">文件类型：</span>
                <span class="meta-value">{{ selectedItem.mime_type }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">下载次数：</span>
                <span class="meta-value">{{ selectedItem.views }} 次</span>
              </div>
              <div class="meta-row description-row">
                <span class="meta-label">文档描述：</span>
                <span class="meta-value">{{ selectedItem.description }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            class="modal-btn like-btn"
            @click="likeResource(selectedItem)"
          >
            ❤️ 点赞 ({{ selectedItem.likes }})
          </button>
          <button 
            class="modal-btn share-btn"
            @click="shareResource(selectedItem)"
          >
            🔗 分享
          </button>
          <button 
            class="modal-btn download-btn"
            @click="downloadResource(selectedItem)"
            :disabled="isDownloading"
          >
            <span v-if="!isDownloading">⬇️ 下载文档</span>
            <span v-if="isDownloading">⏳ 下载中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fallbackImage from '@/assets/image-error.png'
import documentIcon from '@/assets/document-icon.png'
import pdfIcon from '@/assets/pdf-icon.png'
import wordIcon from '@/assets/word-icon.png'
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/build/pdf.worker.entry';
// 设置PDF.js worker路径
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'

export default {
  name: 'CulturalResourcesDocument',
  data() {
    return {
      currentPage: 1,
      pageSize: 9,
      total: 0,
      resources: [],
      currentBranch: null,
      isLoading: false,
      isDownloading: false,
      selectedItem: null,
      fallbackImage: fallbackImage,
      era: '',
      theme: '',
      title: '',
      fileIcons: {
        pdf: pdfIcon,
        doc: wordIcon,
        docx: wordIcon,
        default: documentIcon
      },
      authToken: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhbWFuZGFjaGVuXzIwMjNAcXEuY29tIiwic3RhdHVzIjoiYWN0aXZlIiwiZXhwIjoxNzU2MTAzODIxfQ.ZBtXdezUHw1QrKX5sLX6o1o9aKXOXgQH4f8I2LOrOn0',
      
      // PDF查看器相关状态
      pdfDocument: null,
      currentPdfPage: 1,
      totalPdfPages: 0,
      zoom: 1.0,
      pdfLoading: false
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
    
    getFileExtension(filename) {
      return filename?.split('.').pop()?.toUpperCase() || 'FILE'
    },
    
    getFileIcon(filename) {
      const ext = filename?.split('.').pop()?.toLowerCase()
      return this.fileIcons[ext] || this.fileIcons.default
    },
    
    async fetchResources() {
      this.isLoading = true
      try {
        const params = new URLSearchParams()
        params.append('skip', (this.currentPage - 1) * this.pageSize)
        params.append('limit', this.pageSize)
        params.append('file_type', 'document')
        
        if (this.title) params.append('file_title', this.title)
        if (this.era) params.append('tags', this.era)
        if (this.theme) params.append('tags', this.theme)

        const response = await fetch(`/api/v1/file/list?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': this.getAuthToken()
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.code === 200) {
          this.resources = data.data.files.map(item => ({
            id: item.file_id,
            title: item.file_title || '未命名',
            filename: item.filename,
            previewImage: this.getFileIcon(item.filename),
            fileUrl: item.file_url,
            views: item.download_count || 0,
            likes: 0,
            description: item.description || '暂无描述',
            uploadDate: this.formatDate(item.created_at),
            category: item.tags?.join(', ') || '未分类',
            tags: item.tags || [],
            file_size: item.file_size,
            mime_type: item.mime_type
          }))
          
          this.total = data.data.total
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
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '未知'
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    },

    handleSearch() {
      this.currentPage = 1
      this.fetchResources()
    },

    goToPage(page) {
      this.currentPage = page
      this.fetchResources()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    useLocalData() {
      this.resources = [
        {
          id: 1,
          title: '清代木偶戏文献（本地数据）',
          filename: 'document.pdf',
          previewImage: pdfIcon,
          fileUrl: '#',
          views: 100,
          likes: 10,
          description: '本地测试数据，包含清代木偶戏的历史渊源和表演形式',
          uploadDate: '2023年1月1日',
          category: '清朝, 娱乐',
          tags: ['清朝', '娱乐'],
          file_size: 1024 * 1024 * 2, // 2MB
          mime_type: 'application/pdf'
        }
      ]
      this.total = 1
    },

    handleImageError(item) {
      item.previewImage = this.fallbackImage
    },

    // 显示文档详情
    async showDetail(item) {
      this.isLoading = true;
      try {
        // 获取最新的资源详情
        const resourceInfo = await this.fetchResourceInfo(item.id);
        
        this.selectedItem = {
          ...item,
          ...(resourceInfo || {}),
          views: (item.views || 0) + 1,
          uploadDate: this.formatDate(resourceInfo?.created_at || item.created_at)
        };
        
        document.body.style.overflow = 'hidden';
        
        // 如果是PDF，初始化PDF查看器
        if (this.selectedItem.mime_type === 'application/pdf') {
          await this.loadPdfDocument();
        }
      } finally {
        this.isLoading = false;
      }
    },

    // 加载PDF文档
    async loadPdfDocument() {
      if (!this.selectedItem || !this.selectedItem.fileUrl) return;
      
      this.pdfLoading = true;
      try {
        // 获取PDF文件的URL
        const pdfUrl = await this.getPdfUrl();
        
        // 加载PDF文档
        this.pdfDocument = await pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: true,
          httpHeaders: {
            'Authorization': this.getAuthToken()
          }
        }).promise;
        
        this.totalPdfPages = this.pdfDocument.numPages;
        this.currentPdfPage = 1;
        
        // 渲染第一页
        await this.renderPage(this.currentPdfPage);
      } catch (error) {
        console.error('加载PDF失败:', error);
        this.$message.error('加载PDF文档失败');
      } finally {
        this.pdfLoading = false;
      }
    },
    
    // 获取PDF文件的URL
    async getPdfUrl() {
      // 如果fileUrl已经是可直接访问的URL，直接返回
      if (this.selectedItem.fileUrl.startsWith('http')) {
        return this.selectedItem.fileUrl;
      }
      
      // 否则尝试获取下载URL
      try {
        const response = await fetch(`/api/v1/file/url/${this.selectedItem.id}`, {
          headers: {
            'Authorization': this.getAuthToken(),
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.code === 200 && data.data?.download_url) {
            return data.data.download_url;
          }
        }
      } catch (error) {
        console.error('获取PDF URL失败:', error);
      }
      
      // 如果获取失败，返回原始fileUrl
      return this.selectedItem.fileUrl;
    },
    
    // 渲染PDF页面
    async renderPage(pageNumber) {
      if (!this.pdfDocument || pageNumber < 1 || pageNumber > this.totalPdfPages) return;
      
      try {
        const page = await this.pdfDocument.getPage(pageNumber);
        const canvas = this.$refs[`pdfCanvas-${pageNumber}`][0];
        const context = canvas.getContext('2d');
        
        const viewport = page.getViewport({ scale: this.zoom });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
      } catch (error) {
        console.error('渲染PDF页面失败:', error);
      }
    },
    
    // 上一页
    async prevPage() {
      if (this.currentPdfPage > 1) {
        this.currentPdfPage--;
        await this.renderPage(this.currentPdfPage);
      }
    },
    
    // 下一页
    async nextPage() {
      if (this.currentPdfPage < this.totalPdfPages) {
        this.currentPdfPage++;
        await this.renderPage(this.currentPdfPage);
      }
    },
    
    // 放大
    async zoomIn() {
      if (this.zoom < 2.5) {
        this.zoom += 0.25;
        await this.renderPage(this.currentPdfPage);
      }
    },
    
    // 缩小
    async zoomOut() {
      if (this.zoom > 0.5) {
        this.zoom -= 0.25;
        await this.renderPage(this.currentPdfPage);
      }
    },

    // 关闭详情弹窗
    closeModal() {
      this.selectedItem = null;
      this.pdfDocument = null;
      this.currentPdfPage = 1;
      this.totalPdfPages = 0;
      this.zoom = 1.0;
      document.body.style.overflow = '';
    },

    // 获取资源详细信息
    async fetchResourceInfo(fileId) {
      try {
        const response = await fetch(`/api/v1/file/info/${fileId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': this.getAuthToken()
          }
        })

        if (!response.ok) {
          throw new Error(`获取资源信息失败，状态码: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.code === 200) {
          return data.data
        } else {
          throw new Error(`获取资源信息失败: ${data.message || '未知错误'}`)
        }
      } catch (err) {
        console.error('获取资源详情失败:', err)
        this.$message.error(`获取资源信息失败: ${err.message}`)
        return null
      }
    },

    likeResource(item) {
      item.likes++
      this.$message.success('点赞成功！');
    },

    async downloadResource(item) {
      this.isDownloading = true;
      try {
        // 1. 获取资源基本信息
        const resourceInfo = await this.fetchResourceInfo(item.id);
        if (!resourceInfo) {
          throw new Error('无法获取资源详细信息');
        }
        
        // 2. 获取实际下载链接
        const urlResponse = await fetch(`/api/v1/file/url/${item.id}`, {
          headers: {
            'Authorization': this.getAuthToken(),
            'Accept': 'application/json'
          }
        });

        if (!urlResponse.ok) {
          throw new Error(`获取下载链接失败，状态码: ${urlResponse.status}`);
        }

        // 3. 解析下载链接
        const urlData = await urlResponse.json();
        if (urlData.code !== 200 || !urlData.data?.download_url) {
          throw new Error(`获取下载链接失败: ${urlData.message || '未返回有效链接'}`);
        }
        const actualDownloadUrl = urlData.data.download_url;

        // 4. 下载文件
        const downloadResponse = await fetch(actualDownloadUrl, {
          headers: {
            'Authorization': this.getAuthToken(),
            'Accept': resourceInfo.mime_type
          }
        });

        if (!downloadResponse.ok) {
          throw new Error(`下载文件失败，状态码: ${downloadResponse.status}`);
        }

        // 5. 处理文件流
        const blob = await downloadResponse.blob();
        
        // 6. 创建下载链接
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resourceInfo.filename || item.title;
        document.body.appendChild(link);
        link.click();

        // 7. 清理资源
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          // 更新下载次数
          if (this.selectedItem) {
            this.selectedItem.views = (this.selectedItem.views || 0) + 1;
          }
        }, 100);

        this.$message.success(`下载成功：${resourceInfo.filename || item.title}`);
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error(`下载失败: ${error.message}`)
      } finally {
        this.isDownloading = false;
      }
    },

    shareResource(item) {
      if (navigator.share) {
        navigator.share({
          title: item.title,
          text: item.description,
          url: window.location.href
        }).then(() => {
          this.$message.success('分享成功！');
        }).catch(e => {
          console.log('分享取消:', e);
          this.$message.info('分享已取消');
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        this.$message.success('分享链接已复制到剪贴板');
      }
    }
  }
}
</script>

<style scoped>
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
  justify-content: space-around;
  width: 100%;
  gap: 20px;
}

.search-field {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.search-label {
  margin-right: 12px;
  white-space: nowrap;
  font-size: 22px;
  color: #333;
}

.search-select, .search-input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 22px;
  width: 100%;
  box-sizing: border-box;
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
  padding: 12px 24px;
  background-color: #7a3c09;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 22px;
  white-space: nowrap;
  flex-shrink: 0;
}

.search-button:hover {
  background-color: #6a3408;
}

/* 资源卡片样式 */
.resource-card {
  width: 450px;
  height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease;
  background: white;
  cursor: pointer;
  margin-bottom: 30px;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 37.5px;
  margin-bottom: 40px;
  max-width: none;
  padding: 0 20px;
  justify-items: start;
}

/* 卡片头部样式 */
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

.document-preview {
  width: 100%;
  height: 100%;
  background: #f9f2e7;
  display: flex;
  justify-content: center;
  align-items: center;
}

.document-icon {
  text-align: center;
  font-size: 24px;
  color: #803c0f;
}

.document-icon i {
  font-size: 60px;
  display: block;
  margin-bottom: 10px;
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
  padding: 20px;
  min-height: 100px;
}

.card-body h3 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* 其他样式 */
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

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 1200px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  background-color: #f8f5f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0d4c3;
}

.modal-title {
  margin: 0;
  color: #803c0f;
  font-size: 24px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #803c0f;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.document-viewer-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* PDF查看器样式 */
.pdf-viewer-container {
  width: 100%;
  border-radius: 8px;
  background-color: #f8f5f0;
  overflow: hidden;
  border: 1px solid #e0d4c3;
}

.pdf-controls {
  padding: 15px 20px;
  background-color: #f1e9dc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0d4c3;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  padding: 8px 12px;
  background-color: #7a3c09;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.control-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.control-btn:hover:not(:disabled) {
  background-color: #6a3408;
}

.page-info {
  font-size: 16px;
  color: #333;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.zoom-btn:hover {
  background: #f0f0f0;
}

.pdf-viewer {
  padding: 25px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 500px;
  max-height: 70vh;
  overflow-y: auto;
  background: #f0f2f5;
}

.pdf-page-canvas {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #803c0f;
}

.document-preview-img {
  max-width: 100%;
  max-height: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-meta-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background-color: #f8f5f0;
  border-radius: 8px;
}

.meta-row {
  display: flex;
  font-size: 16px;
}

.meta-label {
  font-weight: bold;
  color: #803c0f;
  min-width: 120px;
}

.meta-value {
  color: #333;
  flex: 1;
}

.description-row .meta-value {
  white-space: pre-line;
  line-height: 1.6;
}

.modal-footer {
  padding: 15px 20px;
  background-color: #f8f5f0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  border-top: 1px solid #e0d4c3;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.like-btn {
  background-color: #f8e1e1;
  color: #d9534f;
}

.like-btn:hover {
  background-color: #f1c0c0;
}

.share-btn {
  background-color: #e1f0f8;
  color: #337ab7;
}

.share-btn:hover {
  background-color: #c9e5f2;
}

.download-btn {
  background-color: #e1f8e6;
  color: #5cb85c;
}

.download-btn:hover {
  background-color: #c6ecc6;
}

.download-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-fields {
    flex-wrap: wrap;
  }
  
  .search-field {
    flex: 1 1 40%;
  }
  
  .resource-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .resource-grid {
    grid-template-columns: repeat(2, 1fr);
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
    flex: 1 1 100%;
    margin-bottom: 15px;
  }
  
  .resource-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-card {
    width: 100%;
    height: auto;
  }
  
  .modal-content {
    max-width: 100%;
  }
  
  .pdf-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .control-group {
    width: 100%;
    justify-content: space-between;
  }
  
  .modal-footer {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .modal-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>