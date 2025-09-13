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
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-if="error" class="error-state">
          <p>加载失败: {{ error }}</p>
          <button @click="fetchTracks" class="retry-btn">重试</button>
        </div>
        
        <!-- 卡片网格 -->
        <div v-else class="cards-grid">
          <div
            v-for="(track, index) in filteredTracks"
            :key="track.id"
            @click="openModal(track)"
            class="card-item"
          >
            <div class="card-image-container">
              <img 
                :src="`https://th.bing.com/th/id/R.82829ff601dc35a40bff024762b8d9aa?rik=J%2fg71SJEy7g6iA&riu=http%3a%2f%2fwww.qb.gd.gov.cn%2fimg%2f0%2f14%2f14346%2f163451.jpg&ehk=XhU7kX4pjqcUfyjRCEYce3mlATPEvSTqAPAf7MmyxVQ%3d&risl=&pid=ImgRaw&r=0`" 
                :alt="track.title"
                class="card-image"
              />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-description">{{ track.description.substring(0, 60) }}...</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 模态框 -->
    <Teleport to="body">
      <div 
        v-if="selectedTrack" 
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content">
          <button class="modal-close" @click="closeModal">×</button>
          <div class="modal-left">
            <img 
              :src="`https://th.bing.com/th/id/R.82829ff601dc35a40bff024762b8d9aa?rik=J%2fg71SJEy7g6iA&riu=http%3a%2f%2fwww.qb.gd.gov.cn%2fimg%2f0%2f14%2f14346%2f163451.jpg&ehk=XhU7kX4pjqcUfyjRCEYce3mlATPEvSTqAPAf7MmyxVQ%3d&risl=&pid=ImgRaw&r=0`" 
              alt="曲目封面" 
              class="modal-image"
            />
            <h3 class="modal-title">{{ selectedTrack.title }}</h3>
            <p class="modal-description">{{ selectedTrack.description }}</p>
            <!-- <div class="modal-meta">
              <p>类型: {{ selectedTrack.media_type }}</p>
              <p>木偶配置: {{ selectedTrack.puppet_config_id }}</p>
              <p>动画格式: {{ selectedTrack.puppet_animation.format }}</p>
            </div> -->
          </div>
          <div class="modal-right">
            <div class="video-container">
              <!-- 矩形视频播放器 -->
              <div class="rectangular-player" :class="{ 'playing': isPlaying }">
                <!-- 视频元素 -->
                <video
                  ref="videoPlayer"
                  :src="selectedTrack.media_url"
                  class="video-element"
                  @loadedmetadata="onMetadataLoaded"
                  @timeupdate="onTimeUpdate"
                  @ended="onVideoEnded"
                >
                  您的浏览器不支持视频播放
                </video>

                <!-- 视频海报/播放覆盖层 -->
                <div class="video-poster" v-if="!isPlaying && currentTime === 0">
                  <img 
                    :src="`/../src/assets/play${selectedTrack.id}.png`" 
                    :alt="selectedTrack.title" 
                    class="poster-img"
                  >
                  
                  <!-- 大播放按钮 -->
                  <button class="big-play-btn" @click="togglePlay">
                    <span class="play-icon">▶</span>
                  </button>
                </div>

                <!-- 控制条 -->
                <div class="video-controls">
                  <div class="progress-container" @click="setProgress">
                    <div class="progress-bar">
                      <div class="progress-filled" :style="{ width: progress + '%' }"></div>
                    </div>
                  </div>
                  
                  <div class="controls-group">
                    <button class="control-btn play-pause-btn" @click="togglePlay">
                      {{ isPlaying ? '⏸' : '▶' }}
                    </button>
                    
                    <div class="time-display">
                      {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
                    </div>
                    
                    <button class="control-btn volume-btn" @click="toggleMute">
                      {{ isMuted ? '🔇' : '🔊' }}
                    </button>
                    
                    <button class="control-btn fullscreen-btn" @click="toggleFullscreen">
                      ⛶
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";

// 轮播图数据
const images = [
  "/../src/assets/play0.png",
  "/../src/assets/play1.png",
  "/../src/assets/play.png"
];
const currentIndex = ref(0);
const currentImage = ref(images[0]);
const slideInterval = ref(null);

// 搜索功能
const searchQuery = ref("");

// 曲目数据
const loading = ref(false);
const error = ref(null);


// 假设tracks是你的曲目列表
const tracks = ref([]);
const selectedTrack = ref(null);

// 根据选中的曲目计算对应的图片索引（0、1、2...）
const imageIndex = computed(() => {
  if (!selectedTrack.value) return 0;
  
// 方法1：根据曲目在列表中的索引匹配（推荐）
const index = tracks.value.findIndex(track => track.id === selectedTrack.value.id);
return index >= 0 ? index : 0; // 如果没找到，默认用play0.png
});

// 视频控制状态
const videoPlayer = ref(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const progress = ref(0);
const currentTime = ref(0);
const duration = ref(0);

// 从API获取曲目数据
const fetchTracks = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 实际项目中替换为你的API地址
    // const response = await fetch('/api/tracks');
    // if (!response.ok) throw new Error('网络响应不正常');
    // tracks.value = await response.json();
    
    // 模拟API数据
    tracks.value = [
      {
        "id": "track_001",
        "title": "木偶奇遇记",
        "description": "一段关于木偶成长与冒险的故事，讲述了一个木偶男孩如何通过一系列奇遇学会诚实、勇敢和善良的品质。",
        "media_type": "video",
        "media_url": "/../src/assets/男1唱戏.mp4",
      },
      {
        "id": "track_002",
        "title": "冼夫人练兵",
        "description": "冼夫人练兵木偶戏是广东高州等地流传的传统木偶戏剧目之一，以岭南历史名人冼夫人为题材。剧目表现了冼夫人为保境安民、团结部族而操练兵马的情景，既展现了她的智慧与胆略，也寄托了百姓对英雄人物的敬仰。表演中通过木偶的动作、唱腔和锣鼓点，生动再现了军营练兵的热烈场面，兼具教育意义和艺术观赏性，是岭南地方戏曲与民间传说相结合的代表作品。",
        "media_type": "video",
        "media_url": "/../src/assets/女1唱戏.mp4",
        "puppet_config_id": "puppet_swan",
        "puppet_animation": {
          "format": "lottie",
          "url": "https://cdn.example.com/puppets/puppet_swan_animation.json"
        }
      },
      {
        "id": "track_003",
        "title": "狮子王",
        "description": "关于成长与责任的经典故事，年轻的狮子辛巴在经历了父亲去世的挫折后，最终回归并夺回属于自己的王国。",
        "media_type": "video",
        "media_url": "https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4",
        "puppet_config_id": "puppet_lion",
        "puppet_animation": {
          "format": "lottie",
          "url": "https://cdn.example.com/puppets/puppet_lion_animation.json"
        }
      },
      {
        "id": "track_004",
        "title": "冰雪奇缘",
        "description": "讲述拥有冰雪魔法的艾莎公主和她的妹妹安娜的冒险故事，强调真爱与自我接纳的重要性。",
        "media_type": "video",
        "media_url": "https://storage.googleapis.com/web-dev-assets/video-and-source-tags/chrome.mp4",
        "puppet_config_id": "puppet_ice",
        "puppet_animation": {
          "format": "lottie",
          "url": "https://cdn.example.com/puppets/puppet_ice_animation.json"
        }
      }
    ];
  } catch (err) {
    error.value = err.message;
    console.error('获取曲目数据失败:', err);
  } finally {
    loading.value = false;
  }
};

// 过滤后的曲目列表
const filteredTracks = computed(() => {
  if (!searchQuery.value) return tracks.value;
  
  const query = searchQuery.value.toLowerCase();
  return tracks.value.filter(track => 
    track.title.toLowerCase().includes(query) || 
    track.description.toLowerCase().includes(query)
  );
});

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
  fetchTracks(); // 页面加载时获取曲目数据
});

// 清除定时器
onUnmounted(() => {
  if (slideInterval.value) clearInterval(slideInterval.value);
});

// 搜索处理
const handleSearch = () => {
  console.log(`搜索: ${searchQuery.value}`);
};

// 打开模态框
const openModal = (track) => {
  selectedTrack.value = track;
  // 重置视频状态
  isPlaying.value = false;
  progress.value = 0;
  currentTime.value = 0;
  duration.value = 0;
  
  // 确保视频重新加载
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
};

// 关闭模态框
const closeModal = () => {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
    isPlaying.value = false;
  }
  selectedTrack.value = null;
};

// 视频控制方法
const togglePlay = () => {
  if (!videoPlayer.value) return;
  
  if (isPlaying.value) {
    videoPlayer.value.pause();
  } else {
    videoPlayer.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const toggleMute = () => {
  if (!videoPlayer.value) return;
  
  videoPlayer.value.muted = !videoPlayer.value.muted;
  isMuted.value = videoPlayer.value.muted;
};

const setProgress = (e) => {
  if (!videoPlayer.value) return;
  
  const rect = e.currentTarget.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  videoPlayer.value.currentTime = pos * videoPlayer.value.duration;
};

const toggleFullscreen = () => {
  const playerContainer = document.querySelector('.video-container');
  if (!document.fullscreenElement) {
    playerContainer.requestFullscreen().catch(err => {
      console.error(`全屏错误: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};

// 格式化时间为 MM:SS 格式
const formatTime = (seconds) => {
  if (isNaN(seconds)) return "00:00";
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 视频事件处理
const onMetadataLoaded = () => {
  if (videoPlayer.value) {
    duration.value = videoPlayer.value.duration;
  }
};

const onTimeUpdate = () => {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime;
    progress.value = (currentTime.value / duration.value) * 100;
  }
};

const onVideoEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  progress.value = 0;
};
</script>

<style>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 页面容器 */
.page-wrapper {
  background-color: #f3f4f6;
  min-height: 100vh;
  padding: 20px;
  padding-top: 125px;
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
  font-size: 18px;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

/* 加载和错误状态 */
.loading-state, .error-state {
  text-align: center;
  padding: 40px 0;
  font-size: 18px;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  border: 4px solid rgba(230, 126, 34, 0.2);
  border-radius: 50%;
  border-top-color: #e67e22;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #e67e22;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #d35400;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  width: 75%;
  max-width: 1400px;
  height: 80vh;
  display: flex;
  overflow: hidden;
  position: relative;
  box-shadow: 0 15px 50px rgba(0,0,0,0.3);
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  background: rgba(0,0,0,0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
}

.modal-close:hover {
  background: rgba(0,0,0,0.8);
  transform: rotate(90deg);
}

.modal-left {
  flex: 3;
  padding: 30px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.modal-image {
  width: 85%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.modal-title {
  font-size: 26px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e67e22;
}

.modal-description {
  font-size: 16px;
  line-height: 1.8;
  color: #555;
  margin-bottom: 25px;
}

.modal-meta {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.modal-meta p {
  margin-bottom: 8px;
  color: #666;
}

.modal-meta p:last-child {
  margin-bottom: 0;
}

.modal-right {
  flex: 4;
  background-color: #222;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}


.video-container {
  width: 440px;
  height: 560px;
  background-color: #000;
  border-radius: 8px; /* 轻微圆角，保持矩形特征 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
  position: relative;
  transition: all 0.3s ease;
}

/* 全屏时调整大小 */
.video-container:fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
}

.rectangular-player {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 视频海报/播放覆盖层 */
.video-poster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
  transition: filter 0.3s ease;
}

/* 大播放按钮 */
.big-play-btn {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #803c0f;
  border: 4px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: scale(1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  z-index: 5;
}

.big-play-btn:hover {
  transform: scale(1.1);
  background-color: #e67e22;
}

.play-icon {
  font-size: 40px;
  color: white;
  margin-left: 6px; /* 微调三角形位置 */
}

/* 控制条样式 */
.video-controls {
  width: 95%;
  position: relative;
  z-index: 10;
  color: white;
  padding: 12px 15px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  margin-top: auto;
}

.progress-container {
  width: 100%;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: height 0.2s;
}

.progress-container:hover {
  height: 7px;
}

.progress-bar {
  width: 100%;
  height: 100%;
  position: relative;
}

.progress-filled {
  height: 100%;
  background-color: #e67e22;
  border-radius: 3px;
  transition: width 0.1s linear;
  position: relative;
}

.progress-filled::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 3px rgba(0,0,0,0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-container:hover .progress-filled::after {
  opacity: 1;
}

.controls-group {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 5px 10px;
  border-radius: 4px;
}

.control-btn:hover {
  color: #e67e22;
  background-color: rgba(255, 255, 255, 0.1);
}

.time-display {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  min-width: 100px;
  text-align: center;
}

/* 播放状态下的样式变化 */
.rectangular-player.playing .video-poster {
  display: none;
}
</style>
