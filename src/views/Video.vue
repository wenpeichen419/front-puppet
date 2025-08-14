<template>
  <div class="video-page" v-if="video">
    <h2 id="video-main-text">{{ video.title }}</h2>
    <video controls autoplay class="video-player">
      <source :src="video.url" type="video/mp4">
      您的浏览器不支持 video 标签。
    </video>
    <div class="video-info">
      <p>{{ video.description }}</p>
      <div class="video-stats">
        <div style="display: flex; align-items: center; gap: 5px; font-size: 18px;">
          <img src="@/assets/view.png" alt="播放数" style="width: 18px; height: 18px;"/>
          <span style="margin-right: 10px;">{{ video.views }}</span>
          <img src="@/assets/thumbs-up.png" alt="点赞数" style="width: 18px; height: 18px;"/>
          <span style="margin-right: 10px;">{{ video.likes }}</span>
        </div>
      </div>
    </div>
    <button @click="goBack" class="back-button">返回列表</button>
  </div>
</template>

<script>
export default {
  name: 'Video',
  data() {
    return {
      video: null,
      // 模拟的剧本数据
      scripts: [
        { id: 1, title: '剧目一', description: '这是一个精彩的木偶戏。', url: 'http://vjs.zencdn.net/v/oceans.mp4', views: 1024, likes: 12 },
        { id: 2, title: '剧目二', description: '一个关于英雄的故事。', url: 'http://vjs.zencdn.net/v/oceans.mp4', views: 512, likes: 12 },
        { id: 3, title: '剧目三', description: '古老的传说，全新的演绎。', url: 'http://vjs.zencdn.net/v/oceans.mp4', views: 2048, likes: 12 },
        { id: 4, title: '剧目四', description: '哇哈哈牛奶', url: 'http://vjs.zencdn.net/v/oceans.mp4', views: 2048, likes: 12 }
      ]
    };
  },
  created() {
    const videoId = this.$route.params.id;
    this.video = this.scripts.find(script => script.id == videoId);
    if (!this.video) {
      this.$router.push('/placeholder'); // 如果找不到视频，则跳转到占位符页面
    }
  },
  methods: {
    goBack() {
      this.$router.push('/scripts');
    }
  }
};
</script>

<style scoped>
.video-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120px;
}
#video-main-text {
  color: #6e2c1b;
  border-bottom: 2px solid #6e2c1b;
  padding-bottom: 5px;
  font-weight: bold;
}
.video-player {
  width: auto;
  height: auto;
  max-width: 900px;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  object-fit: contain;
}
.video-info {
  width: 100%;
  max-width: 800px;
  text-align: left;
}
.video-info p {
  font-size: 1.1em;
  color: #333;
  margin-bottom: 15px;
}
.video-stats {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 1em;
  color: #555;
}
.back-button {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  background-color: #6e2c1b;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 1s;
}
.back-button:hover {
  background-color: #f48e6e;
}
</style>
