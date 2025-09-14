<template>
  <div class="search-results-container">
    <h1>搜索结果</h1>
    <p v-if="searchKeyword">正在搜索: "{{ searchKeyword }}"</p>
    <div v-if="loading" class="loading">正在加载...</div>
    <div v-else-if="results.length > 0" class="results-list">
      <!-- 在这里展示搜索结果 -->
      <div v-for="result in results" :key="result.id" class="result-item">
        <h2>{{ result.title }}</h2>
        <p>{{ result.snippet }}</p>
      </div>
    </div>
    <div v-else class="no-results">
      <p>没有找到与 "{{ searchKeyword }}" 相关的结果。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchView',
  data() {
    return {
      searchKeyword: '',
      loading: false,
      results: [] // 模拟的搜索结果
    };
  },
  created() {
    this.searchKeyword = this.$route.query.q || '';
    if (this.searchKeyword) {
      this.fetchResults();
    }
  },
  watch: {
    '$route.query.q'(newVal) {
      this.searchKeyword = newVal || '';
      if (this.searchKeyword) {
        this.fetchResults();
      } else {
        this.results = [];
      }
    }
  },
  methods: {
    fetchResults() {
      this.loading = true;
      console.log(`Fetching results for: ${this.searchKeyword}`);
      // 在这里，您应该调用您的API来获取真实的搜索结果
      // 下面是一个模拟的延迟和数据
      setTimeout(() => {
        // 模拟API返回的数据
        this.results = [
          // { id: 1, title: '关于木偶戏的...', snippet: '这是一个木偶戏的介绍...' },
          // { id: 2, title: '高州木偶戏历史', snippet: '高州木偶戏源远流长...' }
        ];
        this.loading = false;
      }, 1000);
    }
  }
};
</script>

<style scoped>
.search-results-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 20px;
}

.loading, .no-results {
  text-align: center;
  color: #666;
  margin-top: 40px;
}

.results-list .result-item {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.result-item h2 {
  margin-bottom: 10px;
  color: #333;
}

.result-item p {
  color: #666;
}
</style>
