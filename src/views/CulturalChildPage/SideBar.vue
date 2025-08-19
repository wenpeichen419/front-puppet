<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3>资源类型</h3>
      <ul>
        <!-- 添加:class绑定选中状态 -->
        <li 
          @click="navigateTo('picture')"
          :class="{ 'active': currentType === 'picture' }"
        >
          图片
        </li>
        <li 
          @click="navigateTo('document')"
          :class="{ 'active': currentType === 'document' }"
        >
          文献
        </li>
        <li 
          @click="navigateTo('video')"
          :class="{ 'active': currentType === 'video' }"
        >
          视频
        </li>
        <li 
          @click="navigateTo('audio')"
          :class="{ 'active': currentType === 'audio' }"
        >
          音频
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'ResourceSidebar',
  data() {
    return {
      authToken: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIzIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiJhbWFuZGFjaGVuXzIwMjNAcXEuY29tIiwic3RhdHVzIjoiYWN0aXZlIiwiZXhwIjoxNzU2MTAzODIxfQ.ZBtXdezUHw1QrKX5sLX6o1o9aKXOXgQH4f8I2LOrOn0',
      currentType: '' // 新增当前选中类型状态
    }
  },
  methods: {
    getAuthToken() {
      return this.authToken
    },
    
    async navigateTo(type) {
      // 记录当前选中类型
      this.currentType = type;
      
      const typeMap = {
        picture: 'image',
        document: 'document',
        video: 'video',
        audio: 'audio'
      };
      
      const fileType = typeMap[type] || 'image';
      
      try {
        const response = await fetch(`/api/v1/file/list?skip=0&limit=10&file_type=${fileType}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': this.getAuthToken()
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.code === 200) {
          this.$emit('update-resources', {
            resources: data.data.files,
            total: data.data.total
          });
        } else {
          throw new Error(data.message || '获取资源列表失败');
        }
      } catch (error) {
        console.error('获取资源列表失败:', error);
        this.$emit('api-error', error.message);
      }
      
      this.$router.push({
        path: `/resources/${type}`,
        query: { file_type: fileType }
      });
    },
    
    getBranchId(type) {
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
  margin-bottom: 15px; /* 增加标题底部间距 */
  font-size: 22px; /* 增大标题字体 */
  color: #333;
  padding-bottom: 5px;
  border-bottom: 1px solid #e0d4c3;
}
.sidebar-section ul {
  list-style: none;
  padding-left: 0;
}
.sidebar-section li {
  font-size: 20px; /* 增大分类字体 */
  margin: 16px 0; /* 增加项目间距（相当于两行空行） */
  cursor: pointer;
  color: #666;
  padding: 10px 12px; /* 增加内边距 */
  border-radius: 4px;
  transition: all 0.3s;
}
/* 选中状态样式 */
.sidebar-section li.active {
  color: #803c0f;
  background-color: rgba(128, 60, 15, 0.2); /* 更深的背景色表示选中 */
  font-weight: bold; /* 选中项加粗 */
}
.sidebar-section li:hover:not(.active) {
  color: #803c0f;
  background-color: rgba(128, 60, 15, 0.08);
}
</style>