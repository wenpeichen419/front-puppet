<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3>资源类型</h3>
      <ul>
        <li @click="navigateTo('picture')">图片</li>
        <li @click="navigateTo('literature')">文献</li>
        <li @click="navigateTo('video')">视频</li>
        <li @click="navigateTo('audio')">音频</li>
      </ul>
    </div>
    <div class="sidebar-section">
      <h3>年代</h3>
      <ul>
        <li @click="filterByEra('清代')">清代</li>
        <li @click="filterByEra('民国')">民国</li>
        <li @click="filterByEra('现代')">现代</li>
      </ul>
    </div>
    <div class="sidebar-section">
      <h3>主题</h3>
      <ul>
        <li @click="filterByTheme('爱情')">爱情</li>
        <li @click="filterByTheme('战争')">战争</li>
        <li @click="filterByTheme('娱乐')">娱乐</li>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'ResourceSidebar',
  methods: {
    navigateTo(type) {
    // 添加分支筛选参数
    this.$router.push({
      path: `/resources/${type}`,
      query: {
        branch_id: this.getBranchId(type) // 实现根据类型返回branch_id的逻辑
      }
    })
  },
  
  getBranchId(type) {
    // 示例映射逻辑，根据实际API调整
    const map = {
      picture: 'img_001',
      literature: 'doc_001',
      video: 'vid_001',
      audio: 'aud_001'
    }
    return map[type] || 'default'
  },
    filterByType(type) {
      console.log('筛选资源类型:', type)
      // 实际筛选逻辑可以放在这里或父组件
    },
    filterByEra(era) {
      console.log('筛选年代:', era)
    },
    filterByTheme(theme) {
      console.log('筛选主题:', theme)
    }
  }
}
</script>

<style scoped>
/* 完全保留原始样式 */
.sidebar {
  width: 202px;
  background-color: #f9f2e7;
  padding: 20px;
  position: fixed;
  top: 130px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  z-index: 90;
}

.sidebar-section {
  margin-bottom: 25px;
}
.sidebar-section h3 {
  margin-bottom: 10px;
  font-size: 20px;
  color: #333;
  padding-bottom: 5px;
  border-bottom: 1px solid #e0d4c3;
}
.sidebar-section ul {
  list-style: none;
  padding-left: 0;
}
.sidebar-section li {
  font-size: 18px;
  margin: 8px 0;
  cursor: pointer;
  color: #666;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}
.sidebar-section li:hover {
  color: #803c0f;
  background-color: rgba(128, 60, 15, 0.08);
}
</style>