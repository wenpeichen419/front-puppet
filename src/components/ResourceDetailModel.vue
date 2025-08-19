<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <button class="modal-close" @click="$emit('close')">
          &times;
        </button>
        
        <div class="modal-content">
          <div class="modal-image">
            <img 
              :src="item.image" 
              :alt="item.title"
              @error="handleImageError"
            >
          </div>
          
          <div class="modal-details">
            <h2>{{ item.title }}</h2>
            <p class="modal-description">{{ item.description || '暂无详细描述' }}</p>
            
            <div class="modal-meta">
              <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span>上传时间：{{ item.uploadDate || '未知日期' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-icon">🏷️</span>
                <span>分类：{{ item.category || '传统艺术' }}</span>
              </div>
            </div>
            
            <div class="modal-stats">
              <div class="stat-item" @click="$emit('like', item)">
                <span class="stat-icon">❤️</span>
                <span class="stat-count">{{ item.likes }}</span>
                <span>点赞</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">👁️</span>
                <span class="stat-count">{{ item.views }}</span>
                <span>浏览</span>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn-download" @click="$emit('download', item)">
                <span>⬇️ 下载资源</span>
              </button>
              <button class="btn-share" @click="$emit('share', item)">
                <span>↗️ 分享资源</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ResourceDetailModal',
  props: {
    item: Object
  },
  methods: {
    handleImageError(e) {
      e.target.src = require('@/assets/image-error.png')
    }
  }
}
</script>

<style scoped>
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

/* 响应式设计 */
@media (max-width: 768px) {
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
  .modal-image {
    height: 250px;
  }
  
  .modal-meta {
    flex-direction: column;
    gap: 10px;
  }
}
</style>