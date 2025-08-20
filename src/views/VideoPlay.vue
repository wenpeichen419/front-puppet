<template>
  <div class="page-wrapper">
    <!-- 内容容器 -->
    <div class="content-container">
      <!-- 页面标题 -->
      <h1 class="page-title">经典曲目点播</h1>

      <!-- 轮播图区域 -->
      <section class="carousel-container">
        <div class="carousel-wrapper">
          <!-- 轮播图片 -->
          <img
            :src="currentImage"
            :alt="`轮播图 ${currentIndex + 1}`"
            class="carousel-image"
          />

          <!-- 轮播控制按钮 -->
          <button 
            @click="prevSlide"
            class="carousel-btn prev-btn"
            aria-label="上一张"
          >
            ←
          </button>
          <button 
            @click="nextSlide"
            class="carousel-btn next-btn"
            aria-label="下一张"
          >
            →
          </button>

          <!-- 轮播指示器 -->
          <div class="carousel-indicators">
            <button
              v-for="(slide, index) in images"
              :key="index"
              @click="currentIndex = index"
              class="indicator-btn"
              :class="index === currentIndex ? 'active' : ''"
              :aria-label="`切换到第 ${index + 1} 张图片`"
            ></button>
          </div>
        </div>
      </section>

      <!-- 检索区域 -->
      <section class="search-container">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索内容..."
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button 
            @click="handleSearch"
            class="search-btn"
            aria-label="搜索"
          >
            🔍
          </button>
        </div>
      </section>

      <!-- 卡片区 -->
      <section class="cards-container">
        <h2 class="cards-title">曲目列表</h2>
        <div class="cards-grid">
          <div
            v-for="(card, index) in cards"
            :key="index"
            @click="openModal(card)"
            class="card-item"
          >
            <div class="card-image-container">
              <img 
                :src="card.image" 
                :alt="card.title"
                class="card-image"
              />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ card.title }}</h3>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 模态框 -->
    <Teleport to="body">
      <div 
        v-if="selectedCard" 
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <button class="modal-close" @click="closeModal">×</button>
          <div class="modal-left">
            <img 
              :src="selectedCard.image" 
              alt="曲目图片" 
              class="modal-image"
            />
            <h3 class="modal-title">{{ selectedCard.title }}</h3>
            <p class="modal-description">{{ selectedCard.description }}</p>
          </div>
          <div class="modal-right">
            <div class="video-container">
              <!-- 这里可以替换为实际的视频播放组件 -->
              <div class="video-placeholder">
                <p>视频播放区域</p>
                <p>曲目：{{ selectedCard.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 轮播图数据
const images = [
  "/../src/assets/play0.png",
  "/../src/assets/play1.png",
  "/../src/assets/play2.png"
];
const currentIndex = ref(0);
const currentImage = ref(images[0]);
const slideInterval = ref(null);

// 搜索功能
const searchQuery = ref("");

// 卡片数据（添加 description 字段）
const cards = [
  { 
    title: "洗夫人练兵", 
    image: "/../src/assets/play0.png", 
    link: "/page1",
    description: "这是关于洗夫人练兵的经典曲目，展现了古代练兵的壮观场景和激昂氛围。"
  },
  { 
    title: "传统技艺", 
    image: "/../src/assets/play1.png", 
    link: "/page2",
    description: "传统技艺曲目，融合了多种民间传统艺术元素，极具文化韵味。"
  },
  { 
    title: "历史典故", 
    image: "/../src/assets/play2.png", 
    link: "/page3",
    description: "以历史典故为背景创作的曲目，讲述了一段段精彩的历史故事。"
  },
  { 
    title: "文化传承", 
    image: "https://via.placeholder.com/360x180?text=传承", 
    link: "/page4",
    description: "文化传承主题曲目，传递了文化代代相传的精神内涵。"
  }
];

// 模态框相关
const selectedCard = ref(null);

// 轮播图控制
const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length;
  currentImage.value = images[currentIndex.value];
};

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length;
  currentImage.value = images[currentIndex.value];
};

// 自动轮播
onMounted(() => {
  slideInterval.value = setInterval(nextSlide, 5000);
});

// 清除定时器
onUnmounted(() => {
  if (slideInterval.value) clearInterval(slideInterval.value);
});

// 搜索处理
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    alert(`搜索内容: ${searchQuery.value}`);
  } else {
    alert("请输入搜索内容");
  }
};

// 打开模态框
const openModal = (card) => {
  selectedCard.value = card;
};

// 关闭模态框
const closeModal = () => {
  selectedCard.value = null;
};
</script>

<style>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

/* 页面容器 */
.page-wrapper {
  background-color: #f3f4f6;
  min-height: 100vh;
  padding: 20px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* 页面标题 */
.page-title {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: bold;
  color: #333;
  text-align: center;
  margin: 20px 0 40px;
}

/* 轮播图样式 */
.carousel-container {
  margin: 0 auto 50px;
  max-width: 800px;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 10px;
  border: 2px solid #333;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.5);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s;
}

.carousel-btn:hover {
  background-color: rgba(0,0,0,0.8);
}

.prev-btn {
  left: 15px;
}

.next-btn {
  right: 15px;
}

.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.indicator-btn {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background-color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.3s;
}

.indicator-btn.active {
  background-color: white;
  width: 30px;
}

/* 搜索框样式 */
.search-container {
  max-width: 500px;
  margin: 0 auto 50px;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 20px;
  padding-right: 50px;
  border: 2px solid #333;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #e67e22;
  box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.2);
}

.search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.search-btn:hover {
  color: #e67e22;
}

/* 卡片区样式 */
.cards-container {
  margin-bottom: 50px;
}

.cards-title {
  font-size: clamp(1.2rem, 2vw, 1.8rem);
  color: #333;
  margin-bottom: 25px;
  padding-left: 10px;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 25px;
}

@media (min-width: 640px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.card-item {
  background-color: white;
  border-radius: 8px;
  border: 2px solid #333;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.15);
}

.card-image-container {
  height: 180px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.card-item:hover .card-image {
  transform: scale(1.08);
}

.card-content {
  padding: 15px;
}

.card-title {
  font-weight: bold;
  color: #333;
  text-align: center;
  font-size: 18px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 90%;
  max-width: 1000px;
  display: flex;
  overflow: hidden;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
}

.modal-left {
  flex: 1;
  padding: 20px;
}

.modal-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 15px;
}

.modal-title {
  font-size: 22px;
  color: #333;
  margin-bottom: 10px;
}

.modal-description {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
}

.modal-right {
  flex: 1;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;
  align-items: center;
}

.video-container {
  width: 80%;
  height: 95%;
  background-color: #000;
  border-radius: 80%; /* 椭圆效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 20px;
}

.video-placeholder p {
  margin: 5px 0;
}
</style>