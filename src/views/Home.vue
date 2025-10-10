<template>
  <div id="home-page">
    <el-carousel style="height: 500px; margin: 20px;">
      <el-carousel-item v-for="(img, idx) in carouselImages" :key="idx" style="height: 500px;">
        <img :src="img" alt="Puppet show" style="width: 100%; border-radius: 8px; height: 100%;">
      </el-carousel-item>
    </el-carousel>

    <!-- 木偶戏简介 -->
    <h2 class="introduction_title">木偶戏简介</h2>
    <div class="introduction-section">
      <p>
        高州木偶戏，又称"傀儡戏"，是广东高州地区珍贵的传统戏剧艺术。它融合了精湛的木偶雕刻工艺、灵活的操纵技巧、优美的唱腔和丰富的剧目，是中国南方木偶艺术的杰出代表。高州木偶戏以其独特的艺术魅力和深厚的文化底蕴，被列入国家级非物质文化遗产名录，是中华民族优秀传统文化宝库中的一颗璀璨明珠。
      </p>
    </div>

    <!-- 传承人介绍 -->
    <h2 class="inheritor_title">传承人介绍</h2>
    <div class="inheritors-section">
      <div class="inheritor-card" v-for="inheritor in inheritors" :key="inheritor.id">
        <div class="inheritor-avatar">
          <img :src="inheritor.avatar" :alt="inheritor.name" />
        </div>
        <div class="inheritor-info">
          <h3>{{ inheritor.name }}</h3>
          <p class="inheritor-title">{{ inheritor.title }}</p>
          <p class="inheritor-description">{{ inheritor.description }}</p>
          <div class="inheritor-details">
            <span class="detail-item" v-if="inheritor.major">主要领域：{{ inheritor.major.join('、') }}</span>
            <span class="detail-item" v-if="inheritor.worked_from">从业时间：{{ inheritor.worked_from }}</span>
          </div>
        </div>
      </div>
    </div>

    <h2 class="news_title">新闻动态</h2>
    <div style="margin: 20px 30px; text-align: right;">
      <el-button type="primary" @click="isNewsUploadDialogVisible = true" class="upload-news-button">上传新闻</el-button>
    </div>
    <div>
      <div>
        <div class="news-item" v-for="news in newsItems" :key="news.id" @click="goToNewsDetail(news.id)">
          <h3>{{ news.title }}</h3>
          <p>{{ news.description }}</p>
          <div class="read-more">点击查看详情 →</div>
        </div>
      </div>
    </div>

    <!-- 新闻上传弹窗 -->
    <news-upload-dialog v-model:visible="isNewsUploadDialogVisible" @upload-success="handleUploadSuccess"></news-upload-dialog>

  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import NewsUploadDialog from '@/components/NewsUploadDialog.vue';

// 动态导入图片
const images = import.meta.glob('@/assets/play*.png', { eager: true, import: 'default' });

export default {
  name: 'Home',
  components: {
    NewsUploadDialog
  },
  data() {
    return {
      isNewsUploadDialogVisible: false,
      newsItems: [],
      inheritors: [],
      carouselImages: [
        images['/src/assets/play0.png'],
        images['/src/assets/play1.png'],
        images['/src/assets/play2.png'],
      ],
      curNewsIndex: 0,
      isLoading: false,
    }
  },
  methods: {
    handleScroll(event) {
      const { scrollTop, clientHeight, scrollHeight } = event.target;
      if (scrollTop + clientHeight >= scrollHeight - 5 && !this.isLoading) {
        this.fetchNewsItems(this.curNewsIndex, 5);
        this.curNewsIndex += 5;
      }
    },
    goToNewsDetail(newsId) {
      this.$router.push(`/news/${newsId}`)
    },
    handleUploadSuccess() {
      this.newsItems = [];
      this.fetchNewsItems(0, 10);
    },
    async fetchInheritors(skip, limit) {
      try {
        const response = await fetch('http://8.134.51.50:6060/api/v1/master/list?skip=' + skip + '&limit=' + limit + '&search', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("cookie"),
          }
        });
        const result = await response.json();

        if (result.code >= 200 && result.code < 300) {
          this.inheritors = [
            ...this.inheritors,
            ...result.data.items
          ];
        } else {
          ElMessage.error('Failed to fetch inheritors data: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        ElMessage.error('Error fetching inheritors: ' + (error.message || 'Unknown error'));
      }
    },
    async fetchNewsItems(skip, limit) {
      if (this.isLoading) return;
      this.isLoading = true;
      try {
        const response = await fetch('http://8.134.51.50:6060/api/v1/article/list?skip=' + skip + '&limit=' + limit, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("cookie"),
          }
        });
        const result = await response.json();
        if (result.code === 200 && result.data && Array.isArray(result.data.articles)) {
          // 合并后端新闻到现有 newsItems
          this.newsItems = [
            ...result.data.articles.map(item => ({
              id: item.id,
              title: item.title,
              description: item.description
            })),
            ...this.newsItems
          ];
        } else {
          ElMessage.error('Empty');
        }
      } catch (error) {
        ElMessage.error('Error fetching news: ' + (error.message || 'Unknown error'));
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    this.fetchInheritors(0, 50);
    this.fetchNewsItems(this.curNewsIndex, 5);
    this.curNewsIndex += 5;
    this.$el.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    this.$el.removeEventListener('scroll', this.handleScroll);
  }
};
</script>

<style scoped>
.upload-news-button {
  background-color: #6e2c1b;
  border-color: #6e2c1b;
  font-weight: bold;
  border-radius: 8px;
  padding: 8px 20px;
  transition: all 0.3s ease;
  height: 50px;
}

.upload-news-button:hover {
    background-color: #5a2416;
    border-color: #5a2416;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(110, 44, 27, 0.3);
}

#home-page {
  overflow-y: scroll;
  max-height: 870px;
  padding-top: 150px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.carousel-container {
  margin-bottom: 30px;
}

.news_title {
  color: #6e2c1b;
  border-bottom: 2px solid #6e2c1b;
  padding-bottom: 10px;
  padding-top: 10px;
  font-weight: bold;
  margin: 20px 30px;
  position: sticky;
  top: -30px;
  background-color: #ffffff;
  z-index: 10;
}

.news-item {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  margin: 40px 30px;
  cursor: pointer;
  position: relative;
}

.news-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.445);
  transform: translateY(-4px);
}

.news-item h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.news-item p {
  margin: 0;
  color: #666;
  margin-bottom: 10px;
}

.read-more {
  color: #6e2c1b;
  font-size: 14px;
  font-weight: bold;
  text-align: right;
  margin-top: 10px;
}

/* 木偶戏简介样式 */
.introduction_title {
  color: #6e2c1b;
  border-bottom: 2px solid #6e2c1b;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 10px 30px;
  font-weight: bold;
  position: sticky;
  top: -30px;
  background-color: white;
}

.introduction-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  margin: 40px 30px;
  color: #666;
  line-height: 1.8;
}

/* 传承人介绍样式 */
.inheritor_title {
  color: #6e2c1b;
  border-bottom: 2px solid #6e2c1b;
  padding-top: 10px;
  padding-bottom: 10px;
  margin: 10px 30px;
  font-weight: bold;
  position: sticky;
  top: -30px;
  background-color: #ffffff;
  z-index: 10;
}

.inheritors-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 40px 30px;
}

.inheritor-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  cursor: pointer;
}

.inheritor-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.inheritor-avatar {
  flex-shrink: 0;
}

.inheritor-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6e2c1b;
}

.inheritor-info {
  flex: 1;
}

.inheritor-info h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
  font-weight: bold;
}

.inheritor-title {
  color: #6e2c1b;
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 12px 0;
  background-color: #fdf6f3;
  padding: 4px 12px;
  border-radius: 15px;
  display: inline-block;
}

.inheritor-description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 15px 0;
  font-size: 15px;
}

.inheritor-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.detail-item {
  color: #888;
  font-size: 13px;
  background-color: #f8f8f8;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #e8e8e8;
}

/* .upload-news-button {
  text-align: center;
  margin: 20px 0;
} */

@media (max-width: 768px) {
  .inheritors-section {
    grid-template-columns: 1fr;
  }

  .inheritor-card {
    flex-direction: column;
    text-align: center;
  }

  .inheritor-details {
    justify-content: center;
  }
}
</style>
