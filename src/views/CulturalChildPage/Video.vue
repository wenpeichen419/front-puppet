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
      <h2>{{ currentBranch?.name || '视频资源' }}</h2>
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
              :src="item.thumbnail" 
              :alt="item.title"
              @error="handleImageError(item)"
            >
            <div class="video-duration">{{ formatDuration(item.duration) }}</div>
            <div class="play-overlay">
              <div class="play-icon">▶</div>
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
    
    <!-- 视频详情弹窗 -->
    <div v-if="selectedItem" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ selectedItem.title }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="video-player-container">
            <video 
              :src="selectedItem.videoUrl" 
              class="video-player"
              controls
              preload="metadata"
              @error="handleModalVideoError"
            >
              您的浏览器不支持HTML5视频播放，请升级浏览器
            </video>
            
            <div class="video-meta-detail">
              <div class="meta-row">
                <span class="meta-label">上传时间：</span>
                <span class="meta-value">{{ selectedItem.uploadDate }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">视频分类：</span>
                <span class="meta-value">{{ selectedItem.category }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">视频大小：</span>
                <span class="meta-value">{{ formatFileSize(selectedItem.file_size) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">视频时长：</span>
                <span class="meta-value">{{ formatDuration(selectedItem.duration) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">播放次数：</span>
                <span class="meta-value">{{ selectedItem.views }} 次</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">下载次数：</span>
                <span class="meta-value">{{ selectedItem.download_count || 0 }} 次</span>
              </div>
              <div class="meta-row description-row">
                <span class="meta-label">视频描述：</span>
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
            <span v-if="!isDownloading">⬇️ 下载视频</span>
            <span v-if="isDownloading">⏳ 下载中...</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fallbackImage from '@/assets/image-error.png'

export default {
  name: 'CulturalResourcesVideo',
  data() {
    return {
      currentPage: 1,
      pageSize: 9,
      total: 0,
      selectedItem: null,
      resources: [],
      currentBranch: null,
      isLoading: false,
      isDownloading: false,
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
        const params = new URLSearchParams()
        params.append('skip', (this.currentPage - 1) * this.pageSize)
        params.append('limit', this.pageSize)
        params.append('file_type', 'video')
        
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
            title: item.file_title || '未命名视频',
            videoUrl: item.file_url,
            thumbnail: `https://picsum.photos/seed/${item.file_id}/400/225`,
            duration: item.duration || 0,
            views: item.play_count || 0,
            likes: 0,
            description: item.description || '暂无视频描述',
            uploadDate: this.formatDate(item.created_at),
            category: item.tags?.join(', ') || '未分类',
            file_size: item.file_size || 0,
            mime_type: item.mime_type || 'video/mp4'
          }))
          this.total = data.data.total
        }
      } catch (err) {
        console.error('获取视频列表失败:', err)
        this.$message.error(`加载失败: ${err.message}`)
        if (process.env.NODE_ENV === 'development') {
          this.useLocalData()
        }
      } finally {
        this.isLoading = false
      }
    },

    // 新增：通过info接口获取资源详细信息
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

    useLocalData() {
      const baseUrl = 'http://localhost:9000/back-puppet/uploads';
      this.resources = [
        {
          id: '1e5b4088-fc42-4019-8324-95827dd19193',
          title: '清代宫廷木偶戏表演',
          videoUrl: `${baseUrl}/1e5b4088-fc42-4019-8324-95827dd19193.mp4`,
          thumbnail: 'https://picsum.photos/seed/video1/400/225',
          duration: 320,
          views: 128,
          likes: 24,
          description: '清代宫廷风格木偶戏经典片段',
          uploadDate: '2025年8月19日',
          category: '清朝, 娱乐',
          file_size: 394201,
          mime_type: 'video/mp4',
          download_count: 36
        },
        {
          id: '752125a1-8fbe-471f-b365-73c96ba07eb2',
          title: '民国木偶戏民间巡演',
          videoUrl: `${baseUrl}/752125a1-8fbe-471f-b365-73c96ba07eb2.mp4`,
          thumbnail: 'https://picsum.photos/seed/video2/400/225',
          duration: 540,
          views: 96,
          likes: 18,
          description: '民国时期民间木偶戏巡演记录',
          uploadDate: '2025年8月19日',
          category: '民国, 战争',
          file_size: 5657270,
          mime_type: 'video/mp4',
          download_count: 24
        }
      ]
      this.total = 2
    },

    // 优化的下载功能：先通过info接口获取准确信息，再下载
         async downloadResource(item) {
      this.isDownloading = true;
      try {
        // 1. 获取资源基本信息
        const resourceInfo = await this.fetchResourceInfo(item.id);
        if (!resourceInfo) {
          throw new Error('无法获取资源详细信息');
        }
        
        // 2. 第一步：调用url接口获取实际下载链接（这一步返回的是JSON）
        const urlResponse = await fetch(`/api/v1/file/url/${item.id}`, {
          headers: {
            'Authorization': this.getAuthToken(),
            'Accept': 'application/json' // 明确要求返回JSON
          }
        });

        if (!urlResponse.ok) {
          throw new Error(`获取下载链接失败，状态码: ${urlResponse.status}`);
        }

        // 3. 解析返回的JSON，提取实际下载URL
        const urlData = await urlResponse.json();
        if (urlData.code !== 200 || !urlData.data?.download_url) {
          throw new Error(`获取下载链接失败: ${urlData.message || '未返回有效链接'}`);
        }
        const actualDownloadUrl = urlData.data.download_url;
        console.log('获取到的实际下载链接:', actualDownloadUrl);

        // 4. 第二步：使用提取到的URL下载视频文件
        const downloadResponse = await fetch(actualDownloadUrl, {
          headers: {
            'Authorization': this.getAuthToken(),
            // 根据资源信息设置正确的接受类型
            'Accept': resourceInfo.mime_type === 'application/octet-stream' 
              ? 'video/*' 
              : resourceInfo.mime_type
          }
        });

        if (!downloadResponse.ok) {
          throw new Error(`下载文件失败，状态码: ${downloadResponse.status}`);
        }

        // 5. 验证文件大小
        const contentLength = downloadResponse.headers.get('content-length');
        if (contentLength) {
          const expectedSize = parseInt(resourceInfo.file_size);
          const actualSize = parseInt(contentLength);
          const tolerance = expectedSize * 0.01; // 1% 误差容忍度
          
          if (Math.abs(actualSize - expectedSize) > tolerance) {
            this.$message.warning(`文件大小可能不匹配，预期${this.formatFileSize(expectedSize)}，实际${this.formatFileSize(actualSize)}`);
          }
        }

        // 6. 处理文件流
        const blob = await downloadResponse.blob();
        
        // 7. 检查是否为有效视频文件
        if (blob.size < 1024 * 10 && resourceInfo.file_size > 1024 * 100) {
          throw new Error(`下载的文件过小（${this.formatFileSize(blob.size)}），可能不是有效的视频文件`);
        }

        // 8. 创建正确类型的blob
        const videoBlob = new Blob([blob], { 
          type: resourceInfo.mime_type === 'application/octet-stream' 
            ? 'video/mp4' 
            : resourceInfo.mime_type 
        });

        // 9. 下载文件
        const url = window.URL.createObjectURL(videoBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resourceInfo.filename; // 使用原始文件名
        document.body.appendChild(link);
        link.click();

        // 10. 清理资源
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          this.isDownloading = false;
          
          // 更新下载次数
          if (this.selectedItem) {
            this.selectedItem.download_count = (this.selectedItem.download_count || 0) + 1;
          }
        }, 100);

        this.$message.success(`下载成功：${resourceInfo.filename}（${this.formatFileSize(blob.size)}）`);
      } catch (error) {
        console.error('视频下载失败:', error);
        this.$message.error(`下载失败: ${error.message}`);
        this.isDownloading = false;
      }
    },

    // 查看详情时也通过info接口获取最新信息
    async showDetail(item) {
      this.isLoading = true;
      try {
        // 获取最新的资源详情
        const resourceInfo = await this.fetchResourceInfo(item.id);
        
        this.selectedItem = {
          ...item,
          ...(resourceInfo || {}), // 合并info接口返回的详细信息
          views: (item.views || 0) + 1,
          uploadDate: this.formatDate(resourceInfo?.created_at || item.created_at)
        };
        
        document.body.style.overflow = 'hidden';
      } finally {
        this.isLoading = false;
      }
    },

    closeModal() {
      this.selectedItem = null;
      document.body.style.overflow = '';
    },

    handleModalVideoError() {
      this.$message.error('视频加载失败，请尝试下载观看');
    },

    likeResource(item) {
      item.likes = (item.likes || 0) + 1;
      this.$message.success('点赞成功！');
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
    },

    formatDate(dateString) {
      if (!dateString) return '未知日期';
      const date = new Date(dateString);
      return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日`;
    },

    formatDuration(seconds) {
      if (!seconds || seconds < 0) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    handleImageError(item) {
      item.thumbnail = this.fallbackImage;
    },

    handleSearch() {
      this.currentPage = 1;
      this.fetchResources();
    },

    goToPage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.fetchResources();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
</script>


<style scoped>
/* 样式保持不变 */
.resource-subpage {
  padding-top: 100px;
  min-height: calc(100vh - 180px);
}

.search-container {
  position: sticky;
  top: 130px;
  z-index: 80;
  margin-left: 50px;
  padding: 20px 20px 0;
}

.search-box {
  background-color: #EEE4D3;
  padding: 25px 35px;
  border-radius: 48px;
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

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 37.5px;
  margin-bottom: 40px;
  max-width: none;
  padding: 0 20px;
  justify-items: start;
}

.resource-card {
  width: 450px;
  height: 400px;
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: transform 0.3s ease;
  background: white;
  cursor: pointer;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
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

.resource-card:hover .card-image img {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.play-icon {
  width: 60px;
  height: 60px;
  background-color: rgba(128, 60, 15, 0.8);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  padding-left: 5px;
}

.resource-card:hover .play-overlay {
  opacity: 1;
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

.card-body {
  padding: 20px;
  min-height: 100px;
}

.card-body h3 {
  font-size: 24px;
  margin-bottom: 15px;
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

.empty-tip {
  text-align: center;
  padding: 50px 0;
}

.empty-tip img {
  width: 200px;
  opacity: 0.6;
  margin-bottom: 20px;
}

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

.video-player-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.video-player {
  width: 100%;
  max-height: 600px;
  border-radius: 8px;
  background-color: #000;
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
    gap: 30px;
    padding: 0 10px;
  }
  
  .resource-card {
    width: 100%;
    height: auto;
  }
  
  .modal-content {
    max-width: 100%;
  }
  
  .video-player {
    max-height: 300px;
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
    