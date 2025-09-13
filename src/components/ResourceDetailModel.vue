<template>
  <transition name="modal-fade">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <button class="modal-close" @click="$emit('close')">
          &times;
        </button>

        <div class="modal-content">
          <!-- 使用 div 背景图（保持比例且背景色填充） -->
          <div
            class="modal-image"
            :style="{ backgroundImage: item && item.image ? `url(${item.image})` : 'none' }"
            role="img"
            :aria-label="item ? item.title : 'image'"
          ></div>

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
    item: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

/* 遮罩层 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

/* 容器 */
.modal-container {
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background: white;         /* 容器背景（卡片白色） */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 右上关闭按钮 */
.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  background: rgba(0,0,0,0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
}
.modal-close:hover { background: #803c0f; transform: rotate(90deg); }

/* 内容（图片 + 详情） */
.modal-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  /* 注意：不要在这里加 padding，会造成图片区域出现白边
     把 padding 留给 modal-details 去控制内容区域 */
}

/* 图片容器 - 背景图 + 背景色 */
.modal-image {
  width: 100%;
  min-width: 0;          /* flex 子项收缩问题的常见修复 */
  height: 400px;
  background-color: #f9f2e7 !important; /* 强制背景色生效 */
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain; /* 保持原比例完整显示 */
  flex-shrink: 0;
  display: block;

  /* 临时调试边框（如果需要看盒子范围，取消注释） */
  /* outline: 2px dashed rgba(0,0,0,0.08); */
}

/* 如果你想完全避免任何 1px 的白缝（因 subpixel/antialiasing），
   可以微调宽度来覆盖： */
.modal-image.force-fill {
  width: calc(100% + 1px);
  margin-left: -0.5px;
}

/* 详情区 */
.modal-details {
  padding: 25px;    /* 仅详情区有 padding，不影响图片宽度 */
  flex: 1;
  box-sizing: border-box;
}

/* 其余样式保持原样 */
.modal-details h2 { margin: 0 0 15px; color: #803c0f; font-size: 24px; }
.modal-description { line-height: 1.7; color: #555; margin-bottom: 20px; }
.modal-meta { display:flex; gap:20px; margin-bottom:25px; font-size:14px; color:#666; }
.meta-item { display:flex; align-items:center; gap:5px; }

.modal-stats { display:flex; gap:20px; margin:25px 0; }
.stat-item { display:flex; align-items:center; gap:8px; padding:8px 15px; background:#f9f2e7; border-radius:20px; cursor:pointer; transition:all 0.2s; }
.stat-item:hover { background:#e0d4c3; }
.stat-icon { font-size:18px; }
.stat-count { font-weight:bold; color:#803c0f; }

.modal-actions { display:flex; gap:15px; margin-top:30px; }
.btn-download, .btn-share { flex:1; padding:12px; border:none; border-radius:6px; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
.btn-download { background:#803c0f; color:white; }
.btn-download:hover { background:#6e2c1b; }
.btn-share { background:#f5f5f5; color:#333; }
.btn-share:hover { background:#e0e0e0; }

/* 响应式 */
@media (max-width: 768px) {
  .modal-container { width:95%; max-height:85vh; }
  .modal-image { height:300px; }
  .modal-actions { flex-direction:column; }
  .btn-download, .btn-share { width:100%; }
}
@media (max-width: 480px) {
  .modal-image { height:250px; }
  .modal-meta { flex-direction:column; gap:10px; }
}
</style>
