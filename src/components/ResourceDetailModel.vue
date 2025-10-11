<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <button class="modal-close" @click="$emit('close')">
          &times;
        </button>

        <div class="modal-content">
          <!-- 图片区域 -->
          <div
            class="modal-image"
            :style="{ backgroundImage: item && item.image ? `url(${item.image})` : 'none' }"
            role="img"
            :aria-label="item ? item.title : 'image'"
          ></div>

          <!-- 详情区域 -->
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
    item: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
/* 重置基础样式确保一致性 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to { 
  opacity: 0; 
}

/* 遮罩层 - 使用固定定位确保全屏覆盖 */
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
  padding: 20px;
  backdrop-filter: blur(5px);
}

/* 容器 - 使用明确的尺寸和最大限制 */
.modal-container {
  width: 100%;
  max-width: 900px;
  max-height: min(90vh, 800px); /* 双重限制确保安全 */
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 右上关闭按钮 - 使用固定位置 */
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-close:hover { 
  background: #803c0f; 
  transform: rotate(90deg); 
}

/* 内容区域 - 使用简单的flex布局 */
.modal-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

/* 图片容器 - 固定高度，确保一致性 */
.modal-image {
  width: 100%;
  height: 400px;
  min-height: 400px;
  background-color: #f9f2e7;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  flex-shrink: 0;
  border-bottom: 1px solid #eeeeee;
}

/* 详情区域 - 使用grid布局确保稳定性 */
.modal-details {
  padding: 25px;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 20px;
  min-height: 300px;
  overflow-y: auto;
}

.modal-details h2 {
  color: #803c0f;
  font-size: 24px;
  line-height: 1.3;
  word-break: break-word;
  margin: 0;
}

.modal-description {
  color: #555555;
  line-height: 1.6;
  word-break: break-word;
  margin: 0;
}

.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  color: #666666;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.meta-icon {
  flex-shrink: 0;
}

.modal-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f9f2e7;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.stat-item:hover {
  background: #e0d4c3;
}

.stat-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.stat-count {
  font-weight: bold;
  color: #803c0f;
  min-width: 20px;
  text-align: center;
}

.modal-actions {
  display: flex;
  gap: 16px;
  margin-top: auto;
  padding-top: 20px;
}

.btn-download,
.btn-share {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  min-height: 44px;
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
  color: #333333;
  border: 1px solid #e0e0e0;
}

.btn-share:hover {
  background: #e8e8e8;
}

/* 响应式设计 - 使用媒体查询确保跨设备兼容性 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-container {
    max-height: min(90vh, 700px);
  }
  
  .modal-image {
    height: 300px;
    min-height: 300px;
  }
  
  .modal-details {
    padding: 20px;
    gap: 16px;
  }
  
  .modal-details h2 {
    font-size: 22px;
  }
  
  .modal-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .modal-stats {
    justify-content: center;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-download,
  .btn-share {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .modal-image {
    height: 250px;
    min-height: 250px;
  }
  
  .modal-details {
    padding: 16px;
    gap: 14px;
  }
  
  .modal-details h2 {
    font-size: 20px;
  }
  
  .modal-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-item {
    width: 100%;
    justify-content: center;
  }
  
  .modal-close {
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .modal-container {
    border: 2px solid #000000;
  }
  
  .btn-download {
    border: 2px solid #000000;
  }
  
  .btn-share {
    border: 2px solid #000000;
  }
}

/* 减少动画支持 */
@media (prefers-reduced-motion: reduce) {
  .modal-fade-enter-active,
  .modal-fade-leave-active,
  .modal-close,
  .stat-item,
  .btn-download,
  .btn-share {
    transition: none;
  }
}
</style>