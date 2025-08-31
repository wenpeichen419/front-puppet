<template>
  <div id="home-page">
    <el-carousel style="height: 500px; margin: 10px;">
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
    <div>
      <div>
        <div class="news-item" v-for="news in newsItems" :key="news.id" @click="goToNewsDetail(news.id)">
          <h3>{{ news.title }}</h3>
          <p>{{ news.description }}</p>
          <div class="read-more">点击查看详情 →</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ElMessage } from 'element-plus';

// 动态导入图片
const images = import.meta.glob('@/assets/play*.png', { eager: true, import: 'default' });

export default {
  name: 'Home',
  data() {
    return {
      newsItems: [
        { id: 1, title: '高州木偶戏在全国巡演中大获成功', description: '本次巡演历时三个月，足迹遍布全国十余个城市，受到了各地观众的热烈欢迎。' },
        { id: 2, title: '新剧目《三打白骨精》即将上演', description: '经过精心打磨，经典剧目《三打白骨精》将以全新的面貌与观众见面，敬请期待。' },
        { id: 3, title: '专访木偶戏非遗传承人', description: '我们有幸采访到了国家级非物质文化遗产传承人，听他讲述木偶戏的传承与创新。' },
        { id: 4, title: '进击的巨人完结', description: '米卡萨表示艾伦脸都不要了。' }
      ],
      inheritors: [
        {
          id: 1,
          name: "陈德林",
          title: "国家级非物质文化遗产传承人",
          description: "从事木偶戏表演与制作50余年，掌握高州木偶戏传统技艺的全部精髓，代表作品包括《西游记》系列等。",
          major: ["木偶制作", "表演", "剧本创作"],
          worked_from: "1970年至今",
          avatar: "https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/resized/1755689316883705962_1718866108467171886610826.jpg"
        },
        {
          id: 2,
          name: "林巧玲",
          title: "省级非物质文化遗产传承人",
          description: "专注木偶声腔演唱与操控技艺研究，善于将传统技艺与现代元素融合，培养了多名优秀接班人。",
          major: ["声腔演唱", "木偶操控"],
          worked_from: "1985年至今",
          avatar: "https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/resized/1755689316883705962_1718866108467171886610826.jpg"
        },
        {
          id: 3,
          name: "黄志强",
          title: "高州木偶戏艺术团团长",
          description: "致力于木偶戏的创新与推广，组织多次国内外巡演，为高州木偶戏走向国际舞台做出重要贡献。",
          major: ["艺术管理", "表演", "推广"],
          worked_from: "1990年至今",
          avatar: "https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/resized/1755689316883705962_1718866108467171886610826.jpg"
        },
        {
          id: 4,
          name: "张丽华",
          title: "木偶戏剧本创作专家",
          description: "专注于木偶戏剧本的改编与创作，将传统故事与现代价值观相结合，创作了多部深受观众喜爱的作品。",
          major: ["剧本创作", "理论研究"],
          worked_from: "1995年至今",
          avatar: "https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/resized/1755689316883705962_1718866108467171886610826.jpg"
        }
      ],
      carouselImages: [
        images['/src/assets/play0.png'],
        images['/src/assets/play1.png'],
        images['/src/assets/play2.png'],
      ],
    }
  },
  methods: {
    goToNewsDetail(newsId) {
      this.$router.push(`/news/${newsId}`)
    },
    async fetchInheritors(skip, limit) {
      try {
        const response = await fetch('http://localhost:8000/api/v1/master/list?skip=' + skip + '&limit=' + limit + '&search', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("cookie"),
          }
        });
        const result = await response.json();

        if (result.code === 200 && result.data && result.data.items) {
          // Replace the array instead of pushing to avoid nested arrays
          // this.inheritors = result.data.items;

          // Or if you want to append to existing data:
          this.inheritors = [
            ...this.inheritors,
            ...result.data.items
          ];
        } else {
          ElMessage.error('Failed to fetch inheritors data: ' + (result.message || 'Unknown error'));
          console.error('Failed to fetch inheritors data:', result.message);
        }
      } catch (error) {
        ElMessage.error('Error fetching inheritors: ' + (error.message || 'Unknown error'));
        console.error('Error fetching inheritors:', error);
      }
    }
  },
  mounted() {
    this.fetchInheritors(0, 10);
  }
};
</script>

<style scoped>
#home-page {
  overflow-y: scroll;
  max-height: 780px;
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
