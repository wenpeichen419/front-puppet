<template>
  <div id="app">
    <!-- 固定顶部公共区域（导航+搜索） -->
    <div class="fixed-header">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="logo">
          <img src="@/assets/logo.png" alt="高州木偶戏Logo" />
        </div>
        <div class="search">
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="请输入关键词"
          />
          <button @click="handleSearch">搜索</button>
        </div>
        
        <div class="user-actions">
          <button class="upload-btn">上传资源</button>
          <button class="register-btn" @click="goToRegister">注册</button>
        </div>
      </header>

      <!-- 导航栏（路由链接） -->
      <nav class="navbar">
        <ul>
          <li><router-link to="/">主页</router-link></li>
          <li><router-link to="/scripts">剧本剧目</router-link></li>
          <li><router-link to="/resources">文化资源</router-link></li>
          <li><router-link to="/diy">木偶形象DIY</router-link></li>
          <li><router-link to="/music">曲目点播</router-link></li>
          <li><router-link to="/chat">AI咨询</router-link></li>
        </ul>
      </nav>
    </div>

    <!-- 路由出口：所有页面内容在这里显示 -->
    <router-view class="page-container"></router-view>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      searchKeyword: '' // 搜索关键词绑定
    }
  },
  methods: {
    handleSearch() {
      console.log('搜索关键词：', this.searchKeyword)
      // 实际项目中可调用搜索接口
    },
    goToRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<style scoped>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: "Microsoft YaHei", sans-serif;
  background-color: #f4f4f4;
  padding-top: 130px; /* 预留顶部固定区域高度 */
}

/* 固定顶部区域 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* 顶部导航样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 10px 20px;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  height: 70px;
}
.logo img {
  height: 50px;
}
.search {
  display: flex;
  align-items: center; /* 新增：让子元素垂直居中 */
  flex: 0 0 400px; /* 固定搜索框宽度 */
}
.search input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-right: none;
  outline: none;
  flex: 1;
  font-size: 16px;
  /* 新增：让输入框高度和按钮匹配 */
  height: 36px; 
  line-height: 36px; 
}
.search button {
  /* 修改 padding，让垂直方向和输入框一致 */
  padding: 0 15px; 
  font-size: 16px;
  border: 1px solid #803c0f;
  background-color: #803c0f;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
  /* 新增：明确高度，和输入框统一 */
  height: 36px; 
  line-height: 36px; 
}
.search button:hover {
  background-color: #6e2c1b;
}
.user-actions .upload-btn {
  padding: 8px 18px;
  font-size:16px !important;
  background-color: #803c0f;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
.user-actions .register-btn {
  margin-left: 10px;
  padding: 8px 18px;
  font-size:16px !important;
  background-color: #6e2c1b; /* 深红色 */
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background 0.2s;
}
.user-actions .register-btn:hover {
  background-color: #803c0f; /* 更深的红色 */
}

/* 导航栏样式 */
.navbar {
  background-color: #6e2c1b;
}
.navbar ul {
  display: flex;
  list-style: none;
  justify-content: space-around;
  padding: 0 20px;
}
.navbar li {
  flex: 1;
  text-align: center;
}
/* 路由链接样式 */
.navbar a {
  display: block;
  padding: 15px 10px;
  color: #fff;
  text-decoration: none;
  /* position: relative; */
  font-size: 20px;
  transition: all 0.3s;
}
/* 选中状态（黄色文字+下划线） */
.navbar a.router-link-active {
  color: #ffd700;
}
.navbar a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #ffd700;
}
.navbar a:hover {
  color: #ffd700;
  background-color: rgba(255, 255, 255, 0.1);
}

/* 页面容器（路由出口） */
.page-container {
  min-height: calc(100vh - 130px);
}
</style>