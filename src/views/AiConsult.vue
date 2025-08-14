<!-- src/views/AiConsult.vue -->
<template>
  <div class="ai-page">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <!-- AI头像 -->
      <div class="ai-avatar">
        <img src="@/assets/AI_logo.png" alt="AI Logo">
      </div>
      
      <!-- 新对话按钮 -->
      <div class="new-chat" @click="startNewChat">
        <div class="plus-icon">+</div>
      </div>
      
      <!-- 用户头像 -->
      <div class="user-avatar" @click="toggleUserMenu">
        <img :src="userAvatar" alt="User Avatar">
      </div>
    </div>
    
    <!-- 主聊天区域 -->
    <div class="chat-container">
      <!-- 聊天机器人提示语 -->
      <div class="welcome-message" v-if="messages.length === 0">
        <div class="title-container">
          <img src="@/assets/AI_logo.png" alt="高州图标" class="gaozhou-icon">
        </div>
        <div class="title-text">
          <h3>我是高州木偶戏小博士，快来和我聊天吧！</h3>
          <p>有什么关于高州木偶戏的问题都可以打在下方的聊天框哟！</p>
        </div>
      </div>
      
      <!-- 聊天记录区域 -->
      <div class="chat-history-wrapper">
        <div class="chat-history" id="chat-history">
          <div 
            v-for="(message, index) in messages" 
            :key="index" 
            :class="['message-container', message.type]"
          >
            <img 
              v-if="message.type === 'bot-message'" 
              src="@/assets/AI_logo.png" 
              class="message-avatar"
            >
            <div class="message-bubble">
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 输入区域 -->
      <div class="chat-input-area" :class="{ 'active': messages.length > 0 }">
        <div class="input-container">
          <textarea
            v-model="userInput"
            placeholder="快来写下你的问题吧！"
            @keydown.enter.exact.prevent="sendMessage"
            rows="4"
          ></textarea>
          <button 
            class="send-button" 
            :class="{ active: userInput.trim() }"
            @click="sendMessage"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 用户菜单弹窗 -->
    <div class="user-menu-modal" v-if="showUserMenu" @click.self="toggleUserMenu">
      <div class="user-menu-content">
        <div class="menu-item phone-number">{{ phoneNumber }}</div>
        <div class="menu-item" @click="toggleLanguageMenu">切换语言</div>
        <div class="menu-item" @click="logout">退出登录</div>
      </div>
    </div>
    
    <!-- 语言选择弹窗 -->
    <div class="language-menu-modal" v-if="showLanguageMenu" @click.self="toggleLanguageMenu">
      <div class="language-menu-content">
        <div class="language-option" @click="changeLanguage('zh')">中文</div>
        <div class="language-option" @click="changeLanguage('en')">English</div>
      </div>
    </div>
  </div>
</template>

<script>
import defaultAvatar from '@/assets/default-avatar.png'
export default {
  name: 'AiConsult',
  data() {
    return {
      userInput: '',
      messages: [],
      showUserMenu: false,
      showLanguageMenu: false,
      phoneNumber: '13929742831',
      userAvatar: defaultAvatar,
      currentLanguage: 'zh'
    }
  },
  mounted() {
    
  },
  methods: {
    sendMessage() {
  if (!this.userInput.trim()) return;
  
  // 添加用户消息 - 保存到临时变量
  const userMessage = {
    type: 'user-message',
    content: this.userInput
  };
  this.messages.push(userMessage);
  
  // 立即滚动到底部
  this.scrollToBottom();
  
  // 模拟AI渐进式回复 - 先添加AI消息占位
  const aiResponse = this.getAIResponse(this.userInput);
  this.messages.push({
    type: 'bot-message',
    content: '' // 初始为空
  });
  
  let displayedText = '';
  let charIndex = 0;
  
  const typingEffect = setInterval(() => {
    if (charIndex < aiResponse.length) {
      displayedText += aiResponse.charAt(charIndex);
      // 只更新AI消息，不改变用户消息
      this.messages[this.messages.length - 1] = {
        type: 'bot-message',
        content: displayedText
      };
      charIndex++;
      this.scrollToBottom();
    } else {
      clearInterval(typingEffect);
    }
  }, 50);
  
  this.userInput = '';
  this.adjustTextareaHeight();
},
    
    getAIResponse(question) {
      // 这里应该是调用AI接口获取回复
      // 现在只是模拟一些简单回复
      const responses = {
        'zh': {
          '你好': '你好呀！我是高州木偶戏小博士，有什么可以帮你的吗？',
          '高州木偶戏起源于哪个朝代': '高州木偶戏起源于明朝万历年间，距今已有400多年历史。',
          '高州木偶戏有什么特点': '高州木偶戏的特点是木偶造型精美、表演细腻，唱腔以粤剧为主，具有浓郁的地方特色。'
        },
        'en': {
          'hello': 'Hello! I am the Gaozhou Puppet Show expert. How can I help you?',
          'what is the origin of gaozhou puppet show': 'Gaozhou Puppet Show originated during the Wanli period of the Ming Dynasty, with a history of over 400 years.',
          'what are the features of gaozhou puppet show': 'Gaozhou Puppet Show features exquisite puppet designs, delicate performances, and Cantonese opera singing style with strong local characteristics.'
        }
      }
      
      return responses[this.currentLanguage][question] || 
        (this.currentLanguage === 'zh' ? 
          '这个问题我还不太清楚，你可以问我关于高州木偶戏的历史、特点或表演形式等问题。这个问题我还不太清楚，你可以问我关于高州木偶戏的历史、特点或表演形式等问题。' : 
          "I'm not sure about this question. You can ask me about the history, features or performance styles of Gaozhou Puppet Show.")
    },
scrollToBottom() {
  this.$nextTick(() => {
    const wrapper = document.querySelector('.chat-history-wrapper');
    const history = document.getElementById('chat-history');
    if (!wrapper || !history) return;
    
    // 计算是否需要滚动
    const shouldScroll = wrapper.scrollTop + wrapper.clientHeight >= 
                       history.clientHeight - 200; // 200是阈值
    
    if (shouldScroll) {
      wrapper.scrollTo({
        top: history.scrollHeight,
        behavior: 'smooth'
      });
    }
  });
},
    
    startNewChat() {
      this.messages = []
    },
    
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      if (this.showUserMenu) {
        this.showLanguageMenu = false
      }
    },
    
    toggleLanguageMenu() {
      this.showLanguageMenu = !this.showLanguageMenu
    },
    
    changeLanguage(lang) {
      this.currentLanguage = lang
      this.toggleLanguageMenu()
      this.toggleUserMenu()
    },
    
    logout() {
      // 退出登录逻辑
      alert('退出登录成功')
      this.toggleUserMenu()
    },
    
}
}
</script>

<style scoped>
.title-container {
  display: flex;
  align-items: center;
  position: absolute;
  top: 40%;  /* 更靠下 */
  left: -2%; /* 更靠左 */
  transform: translate(-50%, -50%);
}

.gaozhou-icon {
  width: 80px;
  height: 80px;
  margin-right: 48px; /* 约3个字体距离(16px*3) */
}

/* 调整欢迎消息位置 */
.welcome-message {
  position: absolute;
  top: 40%;  /* 更靠下 */
  left: 50%; /* 更靠左 */
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600px;
  text-align: left; /* 左对齐 */
}


.title-text h3 {
  font-size: 38px !important; /* 更大字号 */
  font-weight: bold;
  color: #803c0f;
  margin-bottom: 12px;
  white-space: nowrap;
}

.title-text p {
  font-size: 22px !important; /* 更大字号 */
  color: #6e2c1b;
  line-height: 1.6;
  padding-left: 52px;
  white-space: nowrap;
}


/* 调整聊天历史区域 */
.chat-history-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 180px;
  scroll-behavior: smooth;
}

.chat-history {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
  min-height: calc(100% - 40px);
  padding-bottom: 40px;
}

.ai-page {
  display: flex;
  height: calc(100vh - 130px); /* 减去导航栏高度 */
  background-color: #fff;
  margin-top: 130px; /* 导航栏高度 */
}

/* 左侧边栏样式 */
.sidebar {
  width: 88px; /* 更窄的宽度 */
  background-color: #fcf8f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  /* 移除所有边框 */
  border: none !important;
  /* 添加细微阴影创造层次感 */
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.05);
}

/* AI头像样式 */
.ai-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: white;
  /* 保留头像边框作为视觉焦点 */
  border: 2px solid #803c0f;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}


.ai-avatar img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.new-chat {
  width: 56px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: auto;
  transition: all 0.2s;
  transform: translateY(15px);
  /* 稀疏虚线边框 - 方法1 */
  border: 5px dashed #6e2c1b;
  /* 控制虚线间距（Chrome/Firefox） */
  border-spacing: 5px;
  /* Safari兼容 */
  -webkit-border-spacing: 5px;
  
  position: relative;
}

/* 调整后的加号 */
.new-chat::before,
.new-chat::after {
  content: "";
  position: absolute;
  background-color: #6e2c1b;
  border-radius: 2px; /* 圆角减小 */
}

.new-chat::before {
  width: 32px; /* 保持长度 */
  height: 4px; /* 减细加号（原6px） */
}

.new-chat::after {
  width: 5px;  /* 减细加号（原6px） */
  height: 32px; /* 保持长度 */
}

.new-chat:hover {
  background-color: #f9f2e7;
  transform: translateY(15px) scale(1.05);
}

.plus-icon {
  font-size: 24px;
  color: #774230;
}

.new-chat span {
  display: none; /* 在小宽度下隐藏文字 */
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin-top: auto;
  transition: all 0.2s;
  /* 移除阴影（根据你之前的需求） */
  box-shadow: none;
}
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 主聊天区域样式 */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 100%;
  height: 100%;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
  color: #333;
}

.welcome-message h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #803c0f;
}

.welcome-message p {
  font-size: 16px;
  color: #666;
}


/* 新的输入区域样式 */
/* 统一输入框样式 */
.chat-input-area {
  padding: 0;
  background-color: transparent;
  border-top: none;
  position: fixed;
  left: 51%;
  transform: translateX(-50%);
  width: 98%;
  max-width: 1200px;
  transition: all 0.3s ease;
  margin: 0 auto;
  bottom: 30%; /* 无消息时的位置 */
}

.chat-input-area.active {
  bottom: 4%; /* 有消息时的位置 */
  /* 保持相同的宽度控制 */
  border-top: none;
  width: 98%;
  max-width: 1200px;
}


/* 输入容器样式 */
.input-container {
  display: flex;
  align-items: flex-end;
  background-color: #fff; /* 输入框背景色 */
  border-radius: 12px; /* 更大的圆角 */
  padding: 12px 16px; /* 更大的内边距 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 更柔和的阴影 */
  width: 100%; /* 占据全部宽度 */
  min-height: 100px; /* 最小高度 */

}

/* 文本输入框样式 */
textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 24px;
  line-height: 1.5;
  min-height: 120px; /* 最小高度 */
  max-height: 200px; /* 更大的最大高度 */
  overflow-y: auto;
  padding: 8px 12px; /* 更大的内边距 */
  font-family: inherit;
  background: transparent; /* 透明背景 */
  
}

/* 发送按钮样式 */
.send-button {
  width: 54px; /* 更大的宽度 */
  height: 54px; /* 更大的高度 */
  border-radius: 50%;
  background-color: #d8dee8;
  border: none;
  margin-left: 12px; /* 更大的左边距 */
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s;
}

.send-button.active {
  background-color: #7a3c09;
}

.send-button svg {
  width: 24px; /* 更大的图标 */
  height: 24px;
}

/* 弹窗样式 */
.user-menu-modal, .language-menu-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.user-menu-content, .language-menu-content {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.menu-item, .language-option {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover, .language-option:hover {
  background-color: #f5f5f5;
}

.phone-number {
  color: #666;
  cursor: default;
}

.language-menu-content {
  min-width: 150px;
}

/* 消息气泡基础样式 */
.message-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 50px;
  margin-top: 30px;
  width: 100%;
  max-width: 1200px;
}

/* AI消息容器 - 左对齐 */
.bot-message {
  justify-content: flex-start;
}

/* 用户消息容器 - 右对齐 */
.user-message {
  justify-content: flex-end;
}

/* 消息头像 */
.message-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-top: 8px;
  margin-right: 12px; /* 头像和气泡之间的距离 */
  flex-shrink: 0;
  border: 2px solid #803c0f;
  object-fit: contain;
}

/* 消息气泡 */
.message-bubble {
  max-width: calc(100% - 60px); /* 减去头像和间距的宽度 */
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 22px;
  line-height: 1.5;
  position: relative;
}

/* AI气泡样式 */
.bot-message .message-bubble {
  background-color: #fafafa;
  color: #333;
}

/* 用户气泡样式 */
.user-message .message-bubble {
  background-color: #eee4d3;
  color: #333;
}
</style>