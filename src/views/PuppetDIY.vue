<template>
  <div class="container">
    <!-- 最外层容器使用flex确保横向排列 -->
    <div class="main-layout">
      <!-- 左侧导航栏 -->
      <div class="DIYnav">
        <button
          v-for="tab in tabs"
          :key="tab"
          @mouseenter="hoverTab(tab)"
          @mouseleave="hoverLeave"
          :class="{'active': activeTab === tab}"
        >
          {{ tab }}
        </button>
      </div>
  
      <!-- 中间组件选择面板 -->
      <transition name="fade">
        <div v-if="showRightPanel"
             @mouseleave="hideRightPanel"
             class="middle-panel">
          <h3 class="text-lg font-bold mb-4">{{ activeTab }} 选择</h3>
          <div class="components-container">
            <div
              v-for="item in components[activeTab]"
              :key="item.name"
              class="component-item"
              @click="applyComponent(item, activeTab)" 
              role="menuitem"
              tabindex="0"
            >
              <img :src="item.src" :alt="item.name" class="component-img"/>
              <div class="component-name">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </transition>
  
      <!-- 右侧展示区 -->
      <div class="display-area">
        <div class="display-content">
          <div class="doll-container">
            <img :src="mainImage" alt="木偶形象" class="doll-image"/>
          </div>
          <div v-if="!showRightPanel" class="description">
            {{ description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "DollDIY",
  data() {
    return {
      tabs: ['经典形象', '盔帽', '偶头', '服装'],
      activeTab: null,
      showRightPanel: false,
      mainImage: '../src/assets/男1.png',
      description: '你的自定义木偶：）',
      components: {
        '经典形象': [
          {name: '冯宝',hat:"1",head:"2",clothes:"1", src: '../src/assets/男1.png',description:"冼夫人的丈夫冯宝，是高凉太守冯融之子，出身岭南豪族。两人联姻后，冼夫人凭借政治才能和威望，冯宝依靠家族势力与官职，共同治理岭南，为当地百姓安定生活奠定了基础。"},
          {name: '小生',hat:"1",head:"1",clothes:"2", src: '../src/assets/男2.png',description:"小生是木偶戏和传统戏曲中的一种主要行当，通常扮演年轻文雅的男子，如书生、公子、才子或少年英雄。小生形象多为面容俊秀、气质儒雅，服饰以长衫、折扇为主，动作讲究斯文潇洒，唱腔清亮柔和，给人一种书卷气。"},
          {name: '冼夫人',hat:"2",head:"3",clothes:"3", src: '../src/assets/冼夫人.png',description:"冼夫人（约522年—602年），名冼英，岭南高凉人。她是岭南历史上最有影响力的女政治家和军事家之一，积极辅佐中原王朝，维护岭南稳定，被后世尊称为“岭南圣母”。"}
        ],
        '盔帽': [
          {name: '男冠',component_id:"1", src: '../src/assets/男冠.png',description:"你的自定义木偶：）"},
          {name: '羽冠',component_id:"2", src: '../src/assets/冼夫人羽冠.png',description:"你的自定义木偶：）"},
          {name: '冠',component_id:"3", src: '../src/assets/冼夫人冠.png',description:"你的自定义木偶：）"},
        ],
        '偶头': [
          {name: '偶头1',component_id:"2", src: '../src/assets/男妆面1.png',description:"你的自定义木偶：）"},
          {name: '偶头2',component_id:"1", src: '../src/assets/男妆面2.png',description:"你的自定义木偶：）"},
          {name: '偶头3',component_id:"3", src: '../src/assets/冼夫人妆面.png',description:"你的自定义木偶：）"}
        ],
        '服装': [
          {name: '服装1',component_id:"1", src: '../src/assets/男衣1.png',description:"你的自定义木偶：）"},
          {name: '服装2',component_id:"2", src: '../src/assets/男衣2.png',description:"你的自定义木偶：）"},
          {name: '服装3',component_id:"3", src: '../src/assets/冼夫人衣服.png',description:"你的自定义木偶：）"}
        ]
      },
      selectedParts: {
        // hat_id: '',
        // head_id: '',
        // clothes_id: ''
      },
      isImageChanging: false
    }
  },
  methods: {
    hoverTab(tab) {
      this.activeTab = tab
      this.showRightPanel = true
    },
    hoverLeave() {},
    hideRightPanel() {
      this.showRightPanel = false
      this.activeTab = null
    },
    applyComponent(item, tab) {
      // 根据不同标签设置对应的ID
      switch(tab) {
        case '盔帽':
          this.selectedParts.hat_id = item.component_id;
          this.description=item.description;
          break;
        case '偶头':
          this.selectedParts.head_id = item.component_id;
          this.description=item.description;
          break;
        case '服装':
          this.selectedParts.clothes_id = item.component_id;
          this.description=item.description;
          break;
        case '经典形象':
          // 经典形象特殊处理
          this.selectedParts = {
            hat_id:item.hat,
            head_id:item.head,
            clothes_id:item.clothes
          };
          this.description=item.description;
          break;
      }
      
      // 添加图片切换动画效果
      this.isImageChanging = true;
      
      // 调用后端接口获取拼接后的图片
      this.fetchCombinedImage();
    },
    
    // 新增：调用后端接口获取拼接图片
    async fetchCombinedImage() {
  try {
    // 创建FormData对象
    const formData = new FormData();
    // 添加参数到FormData
    formData.append('hat_id', this.selectedParts.hat_id || '');
    formData.append('head_id', this.selectedParts.head_id || '');
    formData.append('clothes_id', this.selectedParts.clothes_id || '');

    const response = await axios.post(
      'http://8.134.51.50:6060/api/v1/puppet/combine_and_upload',
      formData,
      {
        headers: {
          'Authorization': `bearer ${this.getAuthToken()}`
        }
      }
    );

    // 处理响应
    if (response.data.code === 200) {
      setTimeout(() => {
        this.mainImage = response.data.data.image_url;

        this.isImageChanging = false;
        this.hideRightPanel();
      }, 300);
    } else {
      this.$message.error('图片拼接失败：' + response.data.message);
      this.isImageChanging = false;
    }
  } catch (error) {
    console.error('接口请求失败：', error);
    let errorMsg = '网络错误，图片拼接失败';
    
    if (error.message.includes('Network Error')) {
      errorMsg = '网络连接异常，请检查网络后重试';
    } else if (error.response) {
      errorMsg = `服务器错误 (${error.response.status})，请稍后再试`;
    } else if (error.request) {
      errorMsg = '未收到服务器响应，请检查服务器状态';
    }
    
    this.$message.error(errorMsg);
    this.isImageChanging = false;
  }
},
    
    // 新增：获取权限令牌的方法
    getAuthToken() {
      // 目前使用组件内的authToken，实际项目中建议从store或localStorage获取
      this.authToken='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxIiwicm9sZSI6ImFkbWluIiwiZW1haWwiOiIxMzQzMzEyNjc0MkAxNjMuY29tIiwic3RhdHVzIjoiYWN0aXZlIiwiZXhwIjoxNzU5MDMyMDAxfQ.FMLPv3rRETijhkRKqfmPDSPoNOA7e2UDq0wXLorJesE'
      return this.authToken;
    },
    
    // 修改：重置方法（同时重置选中的部件）
    resetDoll() {
      this.isImageChanging = true;
      this.selectedParts = {
        hat_id: '',
        head_id: '',
        clothes_id: ''
      };
      setTimeout(() => {
        this.mainImage = this.initialImage;
        this.isImageChanging = false;
      }, 300);
    }
  },
}
</script>

<style>
/* 基础样式重置 */
* {

  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
  padding-top: 125px;
}

.main-layout {
  display: flex;
  flex-direction: row;
  height:82vh;
  width: 100%;
}

/* 左侧导航栏 */
.DIYnav {
  width: 120px;
  height: 100%;
  flex-shrink: 0; 
  flex-grow: 0; 
  background-color: #6e2c1b;
  padding: 60px 0;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}

.DIYnav button {
  width: 100%;
  padding: 10px;
  border: none;
  background: transparent;
  color: white;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 60px;
}

.DIYnav button:hover {
  background-color: #a8442c;
}

.DIYnav button.active {
  background-color: #d2691e;
  font-weight: bold;
}

/* 中间组件选择面板 */
.middle-panel {
  width: 240px;
  flex-shrink: 0; 
  flex-grow: 0; 
  background: #fff;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 16px;
  overflow-y: auto;
}

.components-container {
  display: flex;
  flex-direction: row; /* 横向排列 */
  flex-wrap: wrap; /* 换行 */
  gap: 10px;
}

.component-item {
  cursor: pointer;
  width: calc(50% - 5px); /* 每行显示2个 */
}

.component-img {
  width: 100%;
  height: 100px;
  object-cover: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.component-img:hover {
  border-color: #3b82f6;
}

.component-name {
  text-align: center;
  font-size: 12px;
  margin-top: 5px;
}

/* 右侧展示区 */
.display-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
}

.display-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.doll-container {
  width: 400px;
  height: 500px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.doll-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.description {
  margin-top: 20px;
  width: 500px;
  text-align: center;
  padding: 30px;
  color: #4b5563;
}

/* 过渡动画动画优化 */
.fade-enter-active, 
.fade-leave-active {
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
will-change: opacity, transform;
}

/* 进入动画起点 */
.fade-enter-from {
opacity: 0;
transform: translateX(-30px);
scale: 0.95;
}

/* 离开动画终点 */
.fade-leave-to {
opacity: 0;
transform: translateX(-30px);
scale: 0.95;
}
.middle-panel {
position: relative;
}
</style>