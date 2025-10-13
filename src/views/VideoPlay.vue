<template>
  <div class="page-wrapper">
    <!-- 内容容器 -->
    <div class="content-container">
      <h1 class="page-title">经典曲目点播</h1>

      <!-- 轮播图 -->
      <section class="carousel-container">
        <div class="carousel-wrapper">
          <img :src="currentImage" :alt="`轮播图 ${currentIndex + 1}`" class="carousel-image" />
          <button @click="prevSlide" class="carousel-btn prev-btn" aria-label="上一张">←</button>
          <button @click="nextSlide" class="carousel-btn next-btn" aria-label="下一张">→</button>
          <div class="carousel-indicators">
            <button v-for="(slide,index) in images" :key="index"
              @click="currentIndex=index"
              :class="index===currentIndex?'active':''"
              :aria-label="`切换到第 ${index+1} 张图片`"></button>
          </div>
        </div>
      </section>



      <!-- 曲目卡片 -->
      <section class="cards-container">
        <h2 class="cards-title">曲目列表</h2>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-if="error" class="error-state">
          <p>加载失败: {{ error }}</p>
          <button @click="fetchTracks" class="retry-btn">重试</button>
        </div>

        <div v-else class="cards-grid">
          <div v-for="track in filteredTracks" :key="track.id" class="card-item" @click="openModal(track)">
            <div class="card-image-container">
              <img :src="track.cover" :alt="track.title" class="card-image" />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ track.title }}</h3>
              <p class="card-description">{{ track.description.substring(0,60) }}...</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 模态框 -->
    <Teleport to="body">
      <div v-if="selectedTrack" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="modal-close" @click="closeModal">×</button>

          <div class="modal-left">
            <img v-if="selectedTrack.cover" :src="selectedTrack.cover" :alt="selectedTrack.title" class="modal-image" />
            <h3 class="modal-title">{{ selectedTrack.title || '加载中...' }}</h3>
            <p class="modal-description">{{ selectedTrack.description || '' }}</p>
          </div>

          <div class="modal-right">
            <div class="video-container">
              <div class="rectangular-player" :class="{ 'playing': isPlaying }">

                <video v-if="selectedTrack.media_url" ref="videoPlayer" :src="selectedTrack.media_url"
                  class="video-element"
                  @loadedmetadata="onMetadataLoaded"
                  @timeupdate="onTimeUpdate"
                  @ended="onVideoEnded">
                  您的浏览器不支持视频播放
                </video>

                <audio v-if="selectedTrack.audio_url" ref="audioPlayer" :src="selectedTrack.audio_url"></audio>

                <div class="video-poster" v-if="!isPlaying && currentTime===0">
                  <img :src="selectedTrack.cover" :alt="selectedTrack.title" class="poster-img" />
                  <button class="big-play-btn" @click="togglePlay"><span class="play-icon">▶</span></button>
                </div>

                <div class="video-controls">
                  <div class="progress-container" @click="setProgress">
                    <div class="progress-bar">
                      <div class="progress-filled" :style="{ width: progress+'%' }"></div>
                    </div>
                  </div>

                  <div class="controls-group">
                    <button class="control-btn play-pause-btn" @click="togglePlay">{{ isPlaying ? '⏸' : '▶' }}</button>
                    <div class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
                    <button class="control-btn volume-btn" @click="toggleMute">{{ isMuted ? '🔇' : '🔊' }}</button>
                    <button class="control-btn fullscreen-btn" @click="toggleFullscreen">⛶</button>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'

const images = ['/../src/assets/play0.png','/../src/assets/play1.png','/../src/assets/play.png']
const currentIndex = ref(0)
const currentImage = ref(images[0])
const slideInterval = ref(null)

const searchQuery = ref('')

const loading = ref(false)
const error = ref(null)
const tracks = ref([])
const selectedTrack = ref(null)

const videoPlayer = ref(null)
const audioPlayer = ref(null)
const isPlaying = ref(false)
const isMuted = ref(false)
const progress = ref(0)
const currentTime = ref(0)
const duration = ref(0)

// 获取曲目列表
const fetchTracks = async () => {
  try {
    loading.value = true
    error.value = null
    const res = await axios.get('http://8.134.51.50:6060/api/v1/media/list',{
      headers: { 'Content-Type':'application/json', 'Authorization': localStorage.getItem("cookie")||'' }
    })
    if(res.data.code===200 && Array.isArray(res.data.data.items)){
      tracks.value = res.data.data.items.map(item=>({
        id:item.id,
        title:item.title,
        description:item.description,
        cover:item.cover,
        media_type:item.media_type,
        media_url:item.video_url||item.audio_url,
        audio_url:item.audio_url
      }))
    }
  } catch(err){
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const filteredTracks = computed(()=>{
  if(!searchQuery.value) return tracks.value
  const q = searchQuery.value.toLowerCase()
  return tracks.value.filter(track=>track.title.toLowerCase().includes(q)||track.description.toLowerCase().includes(q))
})

const prevSlide = () => { currentIndex.value=(currentIndex.value-1+images.length)%images.length; currentImage.value=images[currentIndex.value] }
const nextSlide = () => { currentIndex.value=(currentIndex.value+1)%images.length; currentImage.value=images[currentIndex.value] }
onMounted(()=>{
  slideInterval.value=setInterval(nextSlide,5000)
  fetchTracks()
})
onUnmounted(()=>{if(slideInterval.value) clearInterval(slideInterval.value)})

const handleSearch = ()=>{ console.log('搜索',searchQuery.value) }

// 打开模态框并请求详细信息
const openModal = async (track)=>{
  selectedTrack.value = null
  loading.value = true
  try{
    const res = await axios.get(`http://8.134.51.50:6060/api/v1/media/info/${track.id}`,{
      headers:{ 'Content-Type':'application/json', 'Authorization': localStorage.getItem("cookie")||'' }
    })
    if(res.data.code===200 && res.data.data){
      const item=res.data.data
      selectedTrack.value = {
        id:item.id,
        title:item.title,
        description:item.description,
        cover:item.cover,
        media_type:item.media_type,
        media_url:item.video_url||item.audio_url,
        audio_url:item.audio_url
      }
      // 重置播放状态
      isPlaying.value=false
      progress.value=0
      currentTime.value=0
      duration.value=0
      if(videoPlayer.value) { videoPlayer.value.pause(); videoPlayer.value.currentTime=0 }
      if(audioPlayer.value) { audioPlayer.value.pause(); audioPlayer.value.currentTime=0 }
    }
  }catch(err){
    error.value = err.message
  }finally{
    loading.value=false
  }
}

const closeModal=()=>{
  if(videoPlayer.value) videoPlayer.value.pause()
  if(audioPlayer.value) audioPlayer.value.pause()
  isPlaying.value=false
  selectedTrack.value=null
}

const togglePlay=()=>{
  const video = videoPlayer.value
  const audio = audioPlayer.value
  if(!video && !audio) return
  if(isPlaying.value){ video?.pause(); audio?.pause() } else { video?.play(); audio?.play() }
  isPlaying.value=!isPlaying.value
}

const toggleMute=()=>{
  const video = videoPlayer.value
  const audio = audioPlayer.value
  if(!video && !audio) return
  const newMuted = !(video?.muted || audio?.muted)
  if(video) video.muted=newMuted
  if(audio) audio.muted=newMuted
  isMuted.value=newMuted
}

const setProgress=(e)=>{
  const video = videoPlayer.value
  const audio = audioPlayer.value
  if(!video) return
  const rect = e.currentTarget.getBoundingClientRect()
  const pos=(e.clientX-rect.left)/rect.width
  const newTime=pos*duration.value
  video.currentTime=newTime
  if(audio) audio.currentTime=newTime
}

const onTimeUpdate=()=>{
  const video = videoPlayer.value
  if(video){
    currentTime.value=video.currentTime
    progress.value=(currentTime.value/duration.value)*100
  }
}

const onVideoEnded=()=>{
  isPlaying.value=false
  currentTime.value=0
  progress.value=0
}

const onMetadataLoaded=()=>{ if(videoPlayer.value) duration.value=videoPlayer.value.duration }

const formatTime=(sec)=>{
  const m=Math.floor(sec/60).toString().padStart(2,'0')
  const s=Math.floor(sec%60).toString().padStart(2,'0')
  return `${m}:${s}`
}

const toggleFullscreen=()=>{
  const videoContainer = videoPlayer.value?.parentElement
  if(!videoContainer) return
  if(document.fullscreenElement){ document.exitFullscreen() } else { videoContainer.requestFullscreen() }
}
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
