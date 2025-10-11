<template>
  <div class="video-page" v-if="video">
    <h2 id="video-main-text">{{ video.title }}</h2>
    <video controls autoplay class="video-player">
      <source :src="video.url" type="video/mp4">
      您的浏览器不支持 video 标签。
    </video>
    <p>(Video url: {{ video.url }})</p>
    <div class="video-info">
      <p>视频简介：</p>
      <p>{{ video.description }}</p>
    </div>
    <button @click="goBack" class="back-button">返回列表</button>
  </div>
</template>

<script>
import axios from 'axios';

import { ElMessage } from 'element-plus';
export default {
  name: 'Video',
  data() {
    return {
      video: null
    };
  },
  created() {
    const videoId = this.$route.params.id;
    console.log(localStorage.getItem("cookie"))
    axios.get(`http://8.134.51.50:6060/api/v1/opera/info/${videoId}`, {
      headers: {
        "Authorization": localStorage.getItem("cookie"),
      }
    })
      .then(response => {
        if (response.data.code === 200) {
          const file = response.data.data;
          this.video = {
            id: file.id,
            title: file.title,
            description: file.description,
            url: file.video_url,
          };
        } else {
          this.video = {
            id: 0,
            title: "hello",
            description: "hello",
            url: 'http://vjs.zencdn.net/v/oceans.mp4',
            views: 0, 
            likes: 0 
          };
        }
      })
      .catch(() => {
        this.video = {
            id: 0,
            title: "hello",
            description: "hello",
            url: 'http://vjs.zencdn.net/v/oceans.mp4',
            views: 0, 
            likes: 0 
          };
          ElMessage.error("无法获取信息！")
      });
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
  padding-top: 140px;
}
#video-main-text {
  color: #6e2c1b;
  border-bottom: 2px solid #6e2c1b;
  padding-bottom: 5px;
  font-weight: bold;
  margin-bottom: 20px;
}
.video-player {
  width: auto;
  max-width: 900px;
  height: 50vh;
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
