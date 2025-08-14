<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      
      <img :src="item.image" :alt="item.title" class="detail-image">
      
      <div class="detail-body">
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
        
        <div class="detail-stats">
          <span>浏览: {{ item.views }}</span>
          <span>点赞: {{ item.likes }}</span>
          <button @click="likeItem">点赞</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourceDetailModal',
  props: {
    item: Object
  },
  methods: {
    likeItem() {
      // 点赞逻辑
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  display: flex;
}

.detail-image {
  width: 300px;
  height: auto;
  object-fit: contain;
  margin-right: 20px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.detail-body {
  flex: 1;
}

.detail-stats {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}
</style>