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
              @click="applyComponent(item.src)"
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
export default {
  name: "DollDIY",
  data() {
    return {
      tabs: ['经典形象', '盔帽', '偶头', '服装'],
      activeTab: null,
      showRightPanel: false,
      mainImage: '../src/assets/puppet.png',
      description: '高凉太守冯宝，冯宝性格沉稳正直，常以文官形象出现，身着长袍、头戴冠帽，体现其为地方长官的身份。',
      components: {
        '经典形象': [
          {name: '形象1', src: '../src/assets/男1.png'},
          {name: '形象2', src: '../src/assets/男2.png'}
        ],
        '盔帽': [
          {name: '帽子1', src: '../src/assets/男冠.png'},
          {name: '帽子2', src: '../src/assets/default-doll.png'}
        ],
        '偶头': [
          {name: '偶头1', src: '../src/assets/男妆面1.png'},
          {name: '偶头2', src: '../src/assets/男妆面2.png'}
        ],
        '服装': [
          {name: '服装1', src: '../src/assets/男衣1.png'},
          {name: '服装2', src: '../src/assets/男衣2.png'}
        ]
      }
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
    applyComponent(imgSrc) {
      this.mainImage = imgSrc
    }
  }
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
  padding: 30px;
}

.display-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.doll-container {
  width: 360px;
  height: 450px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #d1d5db;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.doll-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.description {
  margin-top: 20px;
  width: 320px;
  text-align: center;
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