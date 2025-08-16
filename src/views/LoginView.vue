<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">高州木偶戏欢迎您</h1>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <input type="text" id="username" v-model="username" required placeholder="用户名/邮箱">
        </div>
        <div class="input-group">
          <input type="password" id="password" v-model="password" required placeholder="密码">
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
    </div>
    <div class="curtain left"></div>
    <div class="curtain right"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const username = ref('');
const password = ref('');

const handleLogin = () => {
  console.log('Username:', username.value);
  console.log('Password:', password.value);
  // 在这里添加登录逻辑，例如调用 API
};
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 98vh;
  background: #ffffff;
  overflow: hidden;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.login-box {
  background: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  width: 400px;
  z-index: 10;
  border: 1px solid #eee;
  animation: drop-down 1s ease-out forwards;
}

@keyframes drop-down {
  0% {
    transform: translateY(-150%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.title {
  margin: 0 0 30px;
  padding: 0;
  color: #6e2c1b;
  text-align: center;
  font-size: 2em;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.input-group {
  position: relative;
  margin-bottom: 30px;
}

.input-group input {
  width: 100%;
  padding: 10px 0;
  font-size: 16px;
  color: #333;
  border: none;
  border-bottom: 2px solid #d9a79c;
  outline: none;
  background: transparent;
}

.input-group input::placeholder {
  color: #aaa;
}

.input-group input:focus {
  border-bottom-color: #8c3823;
}

.login-button {
  display: block;
  width: 100%;
  padding: 12px;
  color: #fff;
  background-color: #8c3823;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.login-button:hover {
  background-color: #a04129;
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0);
}

.curtain {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, #8c3823, #6e2c1b 80%);
  z-index: 1;
  animation: open-curtains 2s forwards;
  animation-delay: 0.5s;
  box-shadow: -5px 0 15px rgba(0,0,0,0.3);
}

.curtain.right {
  right: 0;
  background: linear-gradient(to left, #8c3823, #6e2c1b 80%);
  box-shadow: 5px 0 15px rgba(0,0,0,0.3);
}

.curtain.left {
  left: 0;
}

@keyframes open-curtains {
  0% {
    width: 50%;
  }
  100% {
    width: 15%;
  }
}
</style>
