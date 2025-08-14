<template>
  <div id="news-detail-page">
    <div class="back-button" @click="goBack">
      <- 返回首页
    </div>
    
    <div v-if="news" class="news-content">
      <h1 class="news-title">{{ news.title }}</h1>
      <div class="news-meta">
        <span class="publish-date">{{ news.publishDate }}</span>
        <span class="author">作者：{{ news.author }}</span>
      </div>
      <div class="news-body">
        <p>{{ news.description }}</p>
        <div class="news-detail-content">
          {{ news.content }}
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <h2>新闻不存在</h2>
      <p>抱歉，您访问的新闻内容不存在。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NewsDetail',
  data() {
    return {
      news: null,
      newsData: [
        { 
          id: 1, 
          title: '高州木偶戏在全国巡演中大获成功', 
          description: '本次巡演历时三个月，足迹遍布全国十余个城市，受到了各地观众的热烈欢迎。',
          content: '高州木偶戏作为国家级非物质文化遗产，此次全国巡演活动意义重大。从北京到上海，从广州到深圳，木偶戏演员们用精湛的技艺和深厚的文化底蕴征服了各地观众。特别是在北京国家大剧院的演出，更是座无虚席，掌声雷动。许多观众表示，这是他们第一次近距离观看木偶戏表演，被其独特的艺术魅力深深震撼。巡演不仅展示了高州木偶戏的艺术价值，也为传统文化的传承和发展开辟了新的途径。',
          publishDate: '2024-12-15',
          author: '文化记者 张明'
        },
        { 
          id: 2, 
          title: '新剧目《三打白骨精》即将上演', 
          description: '经过精心打磨，经典剧目《三打白骨精》将以全新的面貌与观众见面，敬请期待。',
          content: '经典名著《西游记》中的"三打白骨精"情节深入人心，如今将通过高州木偶戏的形式重新演绎。剧团在保持传统木偶戏特色的基础上，融入了现代舞台技术，采用声光电一体化的舞台效果，让白骨精的变幻莫测更加生动逼真。孙悟空的72变、猪八戒的憨态可掬、唐僧的慈悲为怀，都将通过精美的木偶形象完美呈现。该剧目预计在春节期间首演，届时将为观众带来一场视觉与听觉的双重盛宴。',
          publishDate: '2024-12-20',
          author: '剧团宣传部'
        },
        { 
          id: 3, 
          title: '专访木偶戏非遗传承人', 
          description: '我们有幸采访到了国家级非物质文化遗产传承人，听他讲述木偶戏的传承与创新。',
          content: '李师傅从事木偶戏表演已有40余年，是国家级非物质文化遗产传承人。在采访中，他深情地回忆起初学木偶戏的岁月："那时候条件艰苦，但对艺术的热爱让我坚持下来。"他认为，传统艺术要想传承下去，既要保持其原有的文化内核，也要与时俱进，融入现代元素。近年来，他积极参与木偶戏进校园活动，培养年轻一代对传统文化的兴趣。他说："只有让更多的年轻人了解和喜爱木偶戏，这门艺术才能真正传承下去。"',
          publishDate: '2024-12-25',
          author: '文化频道 王丽'
        },
        { 
          id: 4, 
          title: '进击的巨人完结', 
          description: '米卡萨表示艾伦脸都不要了。',
          content: '玩原神玩多了导致的',
          publishDate: '2024-12-30',
          author: '你的 大爹'
        }
      ]
    }
  },
  created() {
    this.loadNews()
  },
  watch: {
    '$route'() {
      this.loadNews()
    }
  },
  methods: {
    loadNews() {
      const newsId = parseInt(this.$route.params.id)
      this.news = this.newsData.find(item => item.id === newsId)
    },
    goBack() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
#news-detail-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  overflow-y: scroll;
  max-height: 680px;
  padding-top: 140px;
}

#news-detail-page::-webkit-scrollbar {
  display: none;
}

.back-button {
  color: #6e2c1b;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: bold;
  display: inline-block;
  padding: 8px 15px;
  border: 1px solid #6e2c1b;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: #6e2c1b;
  color: white;
}

.news-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.news-title {
  color: #333;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
  line-height: 1.4;
  border-bottom: 3px solid #6e2c1b;
  padding-bottom: 15px;
}

.news-meta {
  margin-bottom: 25px;
  color: #666;
  font-size: 14px;
}

.news-meta span {
  margin-right: 20px;
}

.publish-date {
  color: #6e2c1b;
  font-weight: bold;
}

.news-body {
  line-height: 1.8;
  color: #444;
}

.news-body p {
  font-size: 16px;
  margin-bottom: 20px;
  font-weight: bold;
  color: #6e2c1b;
}

.news-detail-content {
  font-size: 15px;
  text-indent: 2em;
  text-align: justify;
}

.not-found {
  text-align: center;
  padding: 50px 20px;
  color: #666;
}

.not-found h2 {
  color: #6e2c1b;
  margin-bottom: 15px;
}
</style>