<template>
  <div id="home-page">
    <div class="carousel-container">
      <!-- Image Carousel will go here -->
      <img src="@/assets/home.png" alt="Puppet show" style="width: 100%; border-radius: 8px;">
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
            <span class="detail-item">传承年限：{{ inheritor.years }}年</span>
            <span class="detail-item">主要作品：{{ inheritor.works }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
          name: '李明华',
          title: '国家级非物质文化遗产传承人',
          description: '从事木偶戏表演40余年，精通传统剧目表演，致力于木偶戏艺术的传承与创新，培养了众多优秀弟子。',
          years: 42,
          works: '《西游记》、《白蛇传》',
          avatar: '@/assets/puppet.png'
        },
        {
          id: 2,
          name: '陈秀娟',
          title: '省级非物质文化遗产传承人',
          description: '专注于木偶戏唱腔研究，擅长女性角色表演，在木偶戏音乐创新方面贡献突出。',
          years: 35,
          works: '《梁祝》、《牡丹亭》',
          avatar: '@/assets/puppet.png'
        },
        {
          id: 3,
          name: '王建国',
          title: '木偶制作工艺大师',
          description: '掌握传统木偶制作工艺，手工制作的木偶形象生动，工艺精湛，是木偶戏不可缺少的幕后英雄。',
          years: 30,
          works: '各类传统木偶制作',
          avatar: '@/assets/puppet.png'
        }
      ]
    }
  },
  methods: {
    goToNewsDetail(newsId) {
      this.$router.push(`/news/${newsId}`)
    }
  }
};
</script>

<style scoped>
#home-page{
  overflow-y: scroll;
  max-height: 580px;
  padding-top: 150px; /* 增加顶部内边距，使页面整体下移 */
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
  margin-bottom: 20px;
  font-weight: bold;
}
.news-item {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  margin-bottom: 20px;
  margin-right: 10px;
  cursor: pointer;
  position: relative;
}
.news-item:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transform: translateY(-2px);
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

/* 传承人介绍样式 */
.inheritor_title {
  color: #6e2c1b;
  border-bottom: 2px solid #6e2c1b;
  padding-bottom: 10px;
  margin-bottom: 20px;
  margin-top: 40px;
  font-weight: bold;
}

.inheritors-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.inheritor-card {
  background-color: #fff;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  cursor: pointer;
}

.inheritor-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
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
