<template>
  <div class="resources-page">
    <ResourceSidebar @filter="handleFilter" />
    <router-view class="main-content"></router-view>
  </div>
</template>

<script>
import ResourceSidebar from './CulturalChildPage/Sidebar.vue'

export default {
  name: 'CulturalResourcesLayout',
  components: { ResourceSidebar },
  methods: {
    handleFilter(params) {
      // 将筛选参数传递给子组件
      this.$router.currentRoute.value.matched.forEach(route => {
        if (route.components.default && route.components.default.methods) {
          route.components.default.methods.handleSearch(params)
        }
      })
    }
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.resources-page {
  display: flex;
}

.main-content {
  flex: 1;
  padding: 30px;
  margin-left: 220px;
  background-color: #fff;
  min-height: calc(100vh - 130px);
}
</style>