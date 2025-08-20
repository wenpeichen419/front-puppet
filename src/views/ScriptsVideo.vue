<template>
  <div>
    <h2 class="script-main-text">剧目 - 视频</h2>
    <div class="scripts-page">
      <div class="script-item" v-for="script in scripts" :key="script.id" @click="goToVideo(script.id)">
        <div class="script-cover">
          <img :src="script.coverUrl" :alt="script.title" @error="handleImgError">
        </div>
        <div class="script-info">
          <h3>{{ script.title }}</h3>
          <p>{{ script.description }}</p>
          <div style="display: flex; align-items: center; gap: 5px; font-size: 20px;">
            <img src="@/assets/view.png" alt="播放数" style="width: 20px; height: 20px;"/>
            <span style="margin-right: 10px;">{{ script.views }}</span>
            <img src="@/assets/thumbs-up.png" alt="播放数" style="width: 20px; height: 20px;"/>
            <span style="margin-right: 10px;">{{ script.likes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const scripts = [
  { id: 1, title: '剧目一', description: '这是一个精彩的木偶戏。', coverUrl: 'https://via.placeholder.com/150', views: 1024, likes: 12 },
  { id: 2, title: '剧目二', description: '一个关于英雄的故事。', coverUrl: 'https://via.placeholder.com/150', views: 512, likes: 12 },
  { id: 3, title: '剧目三', description: '古老的传说，全新的演绎。', coverUrl: 'https://via.placeholder.com/150', views: 2048, likes: 12 },
  { id: 4, title: '剧目四', description: '哇哈哈牛奶', coverUrl: 'https://via.placeholder.com/150', views: 2048, likes: 12 }
];
function goToVideo(id: number) {
  router.push(`/video/${id}`);
}
function handleImgError(event: Event) {
  (event.target as HTMLImageElement).src = new URL('../assets/image-error.png', import.meta.url).href;
}
</script>

<style scoped>
.script-main-text {
  margin-top: 40px;
  color: #6e2c1b;
  border-bottom: 2px solid #6e2c1b;
  padding-bottom: 10px;
  font-weight: bold;
  position: sticky;
  top: -30px;
  margin-left: 30px;
  margin-right:  30px;
}
.scripts-page {
  overflow-y: scroll;
  max-height: 560px;
}
.script-item {
  display: flex;
  cursor: pointer;
  border: 2px solid #bababa;
  border-radius: 20px;
  overflow: hidden;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  background-color: #fff;
  margin: 35px 30px;
}
.script-item:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.532);
  transform: translateY(-5px);
}
.script-cover img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  padding: 25px;
}
.script-info {
  padding: 15px 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.script-info h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #004d40;
  font-size: 1.2em;
}
.script-info p {
  margin: 0 0 15px;
  flex-grow: 1;
  color: #555;
}
.script-info span {
  font-size: 0.9em;
  color: #777;
  align-self: flex-start;
}
</style>
