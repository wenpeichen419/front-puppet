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
      fileBaseUrl: 'http://8.134.51.50:6060'
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    },
    authToken() {
      return localStorage.getItem("cookie") || '';
    }
  },
  created() {
    this.fetchResources()
  },
  methods: {
    getAuthToken() {
      return this.authToken
    },
    
    getFullUrl(url) {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      return `${this.fileBaseUrl}${url.startsWith('/') ? url : '/' + url}`;
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

        const response = await fetch(`http://8.134.51.50:6060/api/v1/file/list?${params.toString()}`, {
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

    async fetchResourceInfo(fileId) {
      try {
        const response = await fetch(`http://8.134.51.50:6060/api/v1/file/info/${fileId}`, {
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

    // 下载方法
async downloadResource(item) {
  this.isDownloading = true;
  try {
    console.log('开始下载，文件ID:', item.id);
    
    // 1. 获取下载URL
    const urlResponse = await fetch(`http://8.134.51.50:6060/api/v1/file/url/${item.id}`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthToken(),
        'Accept': 'application/json'
      }
    });

    if (!urlResponse.ok) {
      throw new Error(`获取下载链接失败，状态码: ${urlResponse.status}`);
    }

    const urlData = await urlResponse.json();
    
    if (urlData.code !== 200 || !urlData.data?.download_url) {
      throw new Error(`获取下载链接失败: ${urlData.message || '未返回有效链接'}`);
    }
    
    const downloadUrl = urlData.data.download_url;
    console.log('下载链接:', downloadUrl);
    
    // 2. 使用最可靠的方法：创建iframe并设置超时
    this.downloadWithIframe(downloadUrl, item.title);
    
    this.$message.success('下载请求已发送，请检查浏览器下载列表');
    
  } catch (error) {
    console.error('下载失败:', error);
    this.isDownloading = false;
    this.$message.error(`下载失败: ${error.message}`);
  }
},

// 可靠的iframe下载方法
downloadWithIframe(url, filename) {
  return new Promise((resolve) => {
    try {
      console.log('使用iframe下载:', url);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      // 设置超时清理
      const cleanup = () => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        this.isDownloading = false;
        resolve();
      };
      
      // 5秒后自动清理
      setTimeout(cleanup, 5000);
      
      // 添加到页面
      document.body.appendChild(iframe);
      
    } catch (error) {
      console.error('iframe下载失败:', error);
      this.isDownloading = false;
      resolve();
    }
  });
},

    // 带认证的下载方法
    async downloadWithAuth(url, filename) {
      try {
        console.log('带认证下载:', url);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': this.getAuthToken()
          }
        });

        if (!response.ok) {
          throw new Error(`下载请求失败: ${response.status} ${response.statusText}`);
        }

        // 获取文件blob
        const blob = await response.blob();
        
        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'video.mp4';
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        
        // 清理资源
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          this.isDownloading = false;
          this.$message.success('下载完成！');
        }, 100);

      } catch (error) {
        console.error('认证下载失败:', error);
        
        // 备用方案：使用iframe下载
        this.downloadWithIframe(url, filename);
      }
    },

    // iframe下载方法
    downloadWithIframe(url, filename) {
      try {
        console.log('使用iframe下载:', url);
        
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        // 设置超时清理
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
          this.isDownloading = false;
          this.$message.info('下载请求已发送');
        }, 5000);
        
      } catch (iframeError) {
        console.error('iframe下载失败:', iframeError);
        
        // 最后方案：在新窗口打开
        this.downloadWithNewWindow(url);
      }
    },

    // 新窗口下载方法
    downloadWithNewWindow(url) {
      try {
        window.open(url, '_blank');
        this.isDownloading = false;
        this.$message.info('在新标签页中打开下载');
      } catch (error) {
        console.error('新窗口下载失败:', error);
        this.isDownloading = false;
        this.$message.error('所有下载方式都失败了，请手动复制链接下载');
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
          ...(resourceInfo || {}),
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
    },
    
    useLocalData() {
      this.resources = Array.from({length: 9}, (_, i) => ({
        id: i + 1,
        title: `测试视频 ${i+1}`,
        videoUrl: '/videos/sample.mp4',
        thumbnail: this.fallbackImage,
        duration: 120 + i * 30,
        views: 100 + i,
        likes: 10 + i,
        description: '本地测试视频数据',
        uploadDate: '2023年1月1日',
        category: '测试分类',
        file_size: 1024 * 1024 * (i + 1),
        mime_type: 'video/mp4'
      }));
      this.total = 15;
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
  background-color: #EEE4D3;
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

/* 修改后的下拉框和输入框样式 */
.search-select,
.search-input {
  padding: 14px 16px;
  border: none; /* 去掉默认边框 */
  border-bottom: 3px solid #d0c8b8; /* 只保留下边框 */
  border-radius: 10px; /* 下边框风格不需要圆角 */
  font-size: 22px;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 聚焦时强化下边框颜色 */
.search-select:focus,
.search-input:focus {
  outline: none;
  border-bottom-color: #803c0f;
  box-shadow: 0 3px 0 0 rgba(128, 60, 15, 0.1);
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
  height: auto;
  min-height: 350px;
}

.resource-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
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

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .search-fields {
    gap: 20px;
  }
  
  .search-field {
    flex: 1 1 45%;
  }
  
  .resource-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
  }
  
  .card-image {
    height: 200px;
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
    