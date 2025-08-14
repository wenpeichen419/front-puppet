<template>
  <div class="resource-index">
    <!-- 资源示例图 -->
    <img src="@/assets/puppet-example.jpg" alt="木偶戏示例" class="resource-img" />
    
    <!-- 欢迎内容 -->
    <div class="welcome-content">
      <h2>欢迎来到文化资源库</h2>
      <p>请从左侧选择资源类型开始浏览</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourcesIndex'
}
</script>

<style scoped>
.resource-index {
  padding: 20px;
}

.resource-img {
  width: calc(100% + 60px);
  max-width: none;
  height: auto;
  display: block;
  margin: 0 -40px 20px 0;
  border-radius: 0;
  box-shadow: none;
  border: 1px solid #e0d4c3;
  padding: 5px;
  background: white;
  position: relative;
  left: -15px;
}

.welcome-content {
  text-align: center;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>