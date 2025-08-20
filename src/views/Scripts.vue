
<template>
  <div class="scripts-layout">
    <nav class="scripts-nav">
      <ul>
        <li :class="{active: isActive('video')}" @click="goTo('video')">视频</li>
        <li :class="{active: isActive('text')}" @click="goTo('text')">剧本</li>
      </ul>
    </nav>
    <main class="scripts-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

function goTo(type: 'video' | 'text') {
  router.push(`/scripts/${type}`);
}

function isActive(type: 'video' | 'text') {
  return route.path === `/scripts/${type}`;
}
</script>


<style scoped>
.scripts-layout {
  display: flex;
  height: 100%;
  margin-top: 100px;
}
.scripts-nav {
  width: 160px;
  background: #f7f7f7;
  border-right: 1px solid #e0e0e0;
  padding-top: 60px;
}
.scripts-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.scripts-nav li {
  padding: 18px 0;
  text-align: center;
  cursor: pointer;
  color: #6e2c1b;
  font-weight: bold;
  font-size: 18px;
  border-left: 4px solid transparent;
  transition: background 0.2s, border-color 0.2s;
}
.scripts-nav li.active {
  background: #fff3e6;
  border-left: 4px solid #6e2c1b;
  color: #b85c38;
}
.scripts-content {
  flex: 1;
  padding: 0 30px;
  background: #fff;
  /* min-height: 90px; */
}
</style>
    