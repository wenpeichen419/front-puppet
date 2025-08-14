<template>
  <div class="resources-page">
    <ResourceSidebar />
    <router-view class="main-content"></router-view>
  </div>
</template>

<script>
import ResourceSidebar from './CulturalChildPage/Sidebar.vue'

export default {
  name: 'CulturalResourcesLayout',
  components: { ResourceSidebar }
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