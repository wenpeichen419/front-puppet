<template>
  <div id="app">
    <!-- 固定顶部公共区域（导航+搜索） -->
    <div class="fixed-header" v-if="shouldShowHeader">
      <!-- 顶部导航 -->
      <header class="header">
        <div class="logo">
          <img src="@/assets/logo.png" alt="高州木偶戏Logo" />
        </div>
        <div class="search">
          <input v-model="searchKeyword" type="text" placeholder="搜索剧目" />
          <button @click="handleSearch">搜索</button>
        </div>

        <div class="user-actions">
          <button class="upload-btn" @click="openUploadDialog">上传资源</button>
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
    <upload-dialog ref="uploadDialog"></upload-dialog>
    <search-results :visible="searchResultsVisible" :results="searchResults"
      @close="closeSearchResults"></search-results>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import UploadDialog from '@/components/UploadDialog.vue'
import SearchResults from '@/components/SearchResults.vue'
import { ref } from 'vue';

export default {
  name: 'App',
  components: {
    UploadDialog,
    RouterLink,
    RouterView,
    SearchResults
  },
  data() {
    return {
      searchKeyword: '', // 搜索关键词绑定
      searchResultsVisible: false,
      searchResults: [],
      shouldShowHeader: true,
    }
  },
  watch: {
    '$route'(to, from) {
      if (to.path === '/login') {
        this.shouldShowHeader = false;
      } else {
        this.shouldShowHeader = true;
      }
    }
  },
  methods: {
    async handleSearch() {
      if (!this.searchKeyword.trim()) {
        return;
      }
      try {
        const opearaResponse = await fetch(`http://8.134.51.50:6060/api/v1/opera/list?skip=0&limit=100&search=${this.searchKeyword}`, {
          method: "GET",
          headers: {
            'Authorization': localStorage.getItem("cookie") || ''
          }
        });
        const data = await opearaResponse.json();
        this.searchResults = data.data.items;
        this.searchResultsVisible = true;
      } catch (error) {
        console.error('Search failed:', error);
      }
    },
    closeSearchResults() {
      this.searchResultsVisible = false
    },
    goToRegister() {
      this.$router.push('/register')
    },
    openUploadDialog() {
      console.log('上传按钮被点击')
      this.$refs.uploadDialog.openDialog()
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
  padding-top: 130px;
  /* 预留顶部固定区域高度 */
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
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 70px;
}

.logo img {
  height: 50px;
}

.search {
  display: flex;
  align-items: center;
  flex: 0 0 400px;
}

.search input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-right: none;
  outline: none;
  flex: 1;
  font-size: 16px;
  height: 36px;
  line-height: 36px;
}

.search button {
  padding: 0 15px;
  font-size: 16px;
  border: 1px solid #803c0f;
  background-color: #803c0f;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
  height: 36px;
  line-height: 36px;
}

.search button:hover {
  background-color: #6e2c1b;
}

.user-actions .upload-btn {
  padding: 8px 18px;
  font-size: 16px !important;
  background-color: #803c0f;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
}

.user-actions .register-btn {
  margin-left: 10px;
  padding: 8px 18px;
  font-size: 16px !important;
  background-color: #803c0f;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
  transition: background 0.2s;
}

.user-actions .register-btn:hover {
  background-color: #803c0f;
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

.navbar a {
  display: block;
  padding: 15px 10px;
  color: #fff;
  text-decoration: none;
  position: relative;
  font-size: 20px;
  transition: all 0.3s;
}

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