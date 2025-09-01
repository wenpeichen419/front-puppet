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
      loading: false,
      error: null
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
    async loadNews() {
      this.news = null
      this.error = null
      this.loading = true
      const newsId = this.$route.params.id
      try {
        const response = await fetch(`http://8.134.51.50:6060/api/v1/article/info/${newsId}`)
        const result = await response.json()
        if (result.code === 200 && result.data) {
          // 适配字段
          this.news = {
            id: result.data.id,
            title: result.data.title,
            description: result.data.description,
            content: result.data.content,
            publishDate: result.data.created_at?.split('T')[0],
            author: result.data.author
          }
        } else {
          this.news = null
        }
      } catch (e) {
        this.error = '加载新闻失败'
        this.news = null
      } finally {
        this.loading = false
      }
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