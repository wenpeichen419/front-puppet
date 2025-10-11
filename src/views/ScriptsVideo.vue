<template>
  <div>
    <div class="header-section">
      <h2 class="script-main-text">剧目 - 视频</h2>
      <el-button 
        type="primary" 
        class="upload-btn"
        @click="openVideoUpload"
      >
        上传视频
      </el-button>
    </div>
    <div class="scripts-page" v-loading="isLoading" id="scripts-page">
      <div class="script-item" v-for="script in scripts" :key="script.id" @click="goToVideo(script.id)">
        <div class="script-cover">
          <img :src="script.coverUrl" :alt="script.title" @error="handleImgError">
        </div>
        <div class="script-info">
          <h3>{{ script.title }}</h3>
          <p>{{ script.description }}</p>
          <div style="display: flex; align-items: center; gap: 5px; font-size: 20px;">
          </div>
        </div>
      </div>
    </div>
    
    <!-- VideoUploadDialog 组件 -->
    <VideoUploadDialog 
      ref="videoUploadDialog" 
      @upload-success="handleUploadSuccess" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import VideoUploadDialog from '@/components/VideoUploadDialog.vue';

const router = useRouter();

var curIndex = 0;

// VideoUploadDialog 的引用
const videoUploadDialog = ref();
const isLoading = ref(false);

interface Script {
  id: number | string;
  title: string;
  description: string;
  coverUrl: string;
}

const scripts = ref<Script[]>([]);

async function fetchScriptsFromBackend(skip = 0, limit = 50) {
  isLoading.value = true;
  try {
    const res = await fetch(`http://8.134.51.50:6060/api/v1/opera/list?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("cookie") || ''
      },
    });
    const data = await res.json();
    if (data.code === 200) {
      const backendScripts = data.data.items.map((file: any) => ({
        id: file.id,
        title: file.title,
        description: file.description,
        coverUrl: file.cover,
      }));
      scripts.value = scripts.value.concat(backendScripts);
    }
  } catch (e) {

  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchScriptsFromBackend(curIndex, 5);
  curIndex += 5;

  const scriptsPage = document.getElementById('scripts-page');
  if (scriptsPage) {
    scriptsPage.addEventListener('scroll', () => {
      if (isLoading.value) return;
      if (scriptsPage.scrollTop + scriptsPage.clientHeight >= scriptsPage.scrollHeight - 10) {
        fetchScriptsFromBackend(curIndex, 5);
        curIndex += 5;
      }
    });
  }
});

function goToVideo(id: number | string) {
  router.push(`/video/${id}`);
}

function handleImgError(event: Event) {
  (event.target as HTMLImageElement).src = new URL('../assets/puppet-default.jpeg', import.meta.url).href;
}

// 打开视频上传对话框
function openVideoUpload() {
  videoUploadDialog.value.openDialog();
}

// 处理视频上传成功
function handleUploadSuccess() {
  // 重新获取视频列表
  scripts.value = []; // 清空当前列表
  fetchScriptsFromBackend(); // 重新加载
}
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 40px 30px 0 30px;
  border-bottom: 2px solid #6e2c1b;
  padding-bottom: 10px;
}

.script-main-text {
  color: #6e2c1b;
  font-weight: bold;
  margin: 0;
}

.upload-btn {
  background-color: #6e2c1b;
  border-color: #6e2c1b;
  font-weight: bold;
  border-radius: 8px;
  padding: 8px 20px;
  transition: all 0.3s ease;
  height: 50px;
  display: flex;
  justify-content: center;
}

.upload-btn:hover {
  background-color: #5a2416;
  border-color: #5a2416;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(110, 44, 27, 0.3);
}

.scripts-page {
  overflow-y: scroll;
  max-height: 75vh;
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
  width: 130px;
  height: 130px;
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
