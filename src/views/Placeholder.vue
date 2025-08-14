<template>
  <div class="placeholder-page">
    <h1>{{ pageName }}</h1>
    <p>此页面正在建设中。</p>
  </div>
</template>

<script>
export default {
  name: 'Placeholder',
  props: {
    pageName: String
  }
};
</script>

<style scoped>
.placeholder-page {
  padding: 20px;
  text-align: center;
}
</style>
