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
            <!-- AI消息显示头像 -->
            <img 
              v-if="message.type === 'bot-message'" 
              src="@/assets/AI_logo.png" 
              class="message-avatar"
            >
            <div class="message-bubble">
              <!-- AI加载中显示动画，加载完成显示内容 -->
              <div v-if="message.isLoading" class="loading-spinner"></div>
              <div v-else v-html="message.content"></div>
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
            @keydown.enter.except.prevent="sendMessage"
            rows="4"
            :disabled="isSending"
          ></textarea>
          <button 
            class="send-button" 
            :class="{ active: userInput.trim() }"
            @click="sendMessage"
            :disabled="!userInput.trim() || isSending"
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
import { marked } from 'marked' 

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
      currentLanguage: 'zh',
      sessionId: this.generateSessionId(),
      isSending: false,
      connectionError: false
    }
  },
  methods: {
    generateSessionId() {
      const now = new Date()
      return `chat_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${Math.random().toString(36).substr(2, 8)}`
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isSending) return;
      
      // 立即清空输入框并禁用按钮
      const userMessageContent = this.userInput;
      this.userInput = '';
      this.isSending = true;
      this.connectionError = false;
      
      // 1. 添加用户消息
      const userMessage = {
        type: 'user-message',
        content: userMessageContent,
        timestamp: new Date().toLocaleTimeString()
      };
      this.messages.push(userMessage);
      
      // 2. 立即添加AI消息占位（带头像和加载状态）
      const botLoadingMessage = {
        type: 'bot-message',
        content: '',
        timestamp: new Date().toLocaleTimeString(),
        isLoading: true
      };
      this.messages.push(botLoadingMessage);
      this.scrollToBottom();
      
      try {
        // 使用fetch发送请求
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const response = await fetch('http://8.134.51.50:6060/api/v1/chat_ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            question: userMessageContent,
            session_id: this.sessionId,
            style: "科普"
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // 检查响应状态
        if (!response.ok) {
          throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }

        const data = await response.json();
        
        // 3. 处理正常响应：更新AI消息（关闭加载+设置内容）
        const botResponse = data?.answer || '已收到您的问题，但未获取到有效回答';
        // 使用marked解析Markdown
        const formattedResponse = marked.parse(botResponse);
        
        // 找到最后一条AI消息并更新
        const lastBotMsgIndex = this.messages.findLastIndex(msg => msg.type === 'bot-message');
        if (lastBotMsgIndex !== -1) {
          this.messages[lastBotMsgIndex] = {
            type: 'bot-message',
            content: formattedResponse,
            timestamp: new Date().toLocaleTimeString(),
            isLoading: false
          };
          // 执行流式打字效果
          await this.typeResponse(formattedResponse, lastBotMsgIndex);
        }
      } catch (error) {
        // 4. 处理错误：更新AI消息为错误提示
        let errorMsg = '服务暂时不可用';
        if (error.name === 'AbortError') {
          errorMsg = '请求超时，服务器响应时间过长';
        } else if (error.response) {
          errorMsg = error.response.data?.detail || errorMsg;
        } else if (error.message.includes('HTTP错误')) {
          errorMsg = `服务器错误: ${error.message}`;
        } else {
          errorMsg = '服务器未响应，请检查网络连接';
        }
        
        // 更新最后一条AI消息为错误内容
        const lastBotMsgIndex = this.messages.findLastIndex(msg => msg.type === 'bot-message');
        if (lastBotMsgIndex !== -1) {
          this.messages[lastBotMsgIndex] = {
            type: 'bot-message',
            content: errorMsg,
            timestamp: new Date().toLocaleTimeString(),
            isLoading: false
          };
        }
      } finally {
        // 5. 恢复发送状态
        this.isSending = false;
        this.scrollToBottom();
      }
    },
    
    async typeResponse(fullText, messageIndex) {
      return new Promise((resolve) => {
        let displayedText = '';
        let charIndex = 0;
        
        const typingInterval = setInterval(() => {
          if (charIndex < fullText.length) {
            displayedText += fullText.charAt(charIndex);
            this.messages[messageIndex].content = displayedText;
            charIndex++;
            this.$forceUpdate();
            this.scrollToBottom();
          } else {
            clearInterval(typingInterval);
            resolve();
          }
        }, 20);
      });
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const wrapper = document.querySelector('.chat-history-wrapper');
        wrapper?.scrollTo({
          top: wrapper.scrollHeight,
          behavior: 'smooth'
        });
      });
    },
    
    startNewChat() {
      this.messages = [];
      this.sessionId = this.generateSessionId();
      this.connectionError = false;
    },
    
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu;
      this.showLanguageMenu = false;
    },
    
    toggleLanguageMenu() {
      this.showLanguageMenu = !this.showLanguageMenu;
      this.showUserMenu = false;
    },
    
    changeLanguage(lang) {
      this.currentLanguage = lang;
      this.toggleLanguageMenu();
    },
    
    logout() {
      this.toggleUserMenu();
    }
  }
}
</script>

<style scoped>
/* 基础重置和基准设置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 加载动画 */
.loading-spinner {
  display: inline-block;
  width: 1.5rem; /* 24px -> 1.5rem */
  height: 1.5rem;
  border: 0.1875rem solid rgba(128, 60, 15, 0.3); /* 3px -> 0.1875rem */
  border-radius: 50%;
  border-top-color: #803c0f;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.title-container {
  display: flex;
  align-items: center;
  position: absolute;
  top: 40%;
  left: -2%;
  transform: translate(-50%, -50%);
}

.gaozhou-icon {
  width: 5rem; /* 80px -> 5rem */
  height: 5rem;
  margin-right: 3rem; /* 48px -> 3rem */
}

/* 调整欢迎消息位置 */
.welcome-message {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 37.5rem; /* 600px -> 37.5rem */
  text-align: left;
}

.title-text h3 {
  font-size: 2.375rem !important; /* 38px -> 2.375rem */
  font-weight: bold;
  color: #803c0f;
  margin-bottom: 0.75rem; /* 12px -> 0.75rem */
  white-space: nowrap;
}

.title-text p {
  font-size: 1.375rem !important; /* 22px -> 1.375rem */
  color: #6e2c1b;
  line-height: 1.6;
  padding-left: 3.25rem; /* 52px -> 3.25rem */
  white-space: nowrap;
}

/* 调整聊天历史区域 */
.chat-history-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 11.25rem; /* 180px -> 11.25rem */
  scroll-behavior: smooth;
}

.chat-history {
  width: 90%;
  max-width: 75rem; /* 1200px -> 75rem */
  margin: 0 auto;
  padding: 1.25rem 0; /* 20px -> 1.25rem */
  min-height: calc(100% - 2.5rem); /* 40px -> 2.5rem */
  padding-bottom: 2.5rem; /* 40px -> 2.5rem */
}

.ai-page {
  display: flex;
  height: calc(100vh - 8.125rem); /* 130px -> 8.125rem */
  background-color: #fff;
  margin-top: 8.125rem; /* 130px -> 8.125rem */
  font-size: 1rem; /* 设置基准字体大小 */
}

/* 左侧边栏样式 */
.sidebar {
  width: 5.5rem; /* 88px -> 5.5rem */
  background-color: #fcf8f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0; /* 16px -> 1rem */
  border: none !important;
  box-shadow: 0.0625rem 0 0.125rem rgba(0, 0, 0, 0.05); /* 1px 2px -> 0.0625rem 0.125rem */
}

/* AI头像样式 */
.ai-avatar {
  width: 4rem; /* 64px -> 4rem */
  height: 4rem;
  border-radius: 50%;
  background-color: white;
  border: 0.125rem solid #803c0f; /* 2px -> 0.125rem */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem; /* 24px -> 1.5rem */
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
  width: 3.5rem; /* 56px -> 3.5rem */
  height: 3.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 50%;
  cursor: pointer;
  margin-bottom: auto;
  transition: all 0.2s;
  transform: translateY(0.9375rem); /* 15px -> 0.9375rem */
  border: 0.3125rem dashed #6e2c1b; /* 5px -> 0.3125rem */
  border-spacing: 0.3125rem; /* 5px -> 0.3125rem */
  -webkit-border-spacing: 0.3125rem;
  position: relative;
}

/* 调整后的加号 */
.new-chat::before,
.new-chat::after {
  content: "";
  position: absolute;
  background-color: #6e2c1b;
  border-radius: 0.125rem; /* 2px -> 0.125rem */
}

.new-chat::before {
  width: 2rem; /* 32px -> 2rem */
  height: 0.25rem; /* 4px -> 0.25rem */
}

.new-chat::after {
  width: 0.3125rem; /* 5px -> 0.3125rem */
  height: 2rem; /* 32px -> 2rem */
}

.new-chat:hover {
  background-color: #f9f2e7;
  transform: translateY(0.9375rem) scale(1.05); /* 15px -> 0.9375rem */
}

.plus-icon {
  font-size: 1.5rem; /* 24px -> 1.5rem */
  color: #774230;
}

.new-chat span {
  display: none;
}

.user-avatar {
  width: 4.375rem; /* 70px -> 4.375rem */
  height: 4.375rem;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin-top: auto;
  transition: all 0.2s;
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
  padding: 2.5rem 1.25rem; /* 40px 20px -> 2.5rem 1.25rem */
  color: #333;
}

.welcome-message h3 {
  font-size: 1.5rem; /* 24px -> 1.5rem */
  margin-bottom: 0.625rem; /* 10px -> 0.625rem */
  color: #803c0f;
}

.welcome-message p {
  font-size: 1rem; /* 16px -> 1rem */
  color: #666;
}

/* 新的输入区域样式 */
.chat-input-area {
  padding: 0;
  background-color: transparent;
  border-top: none;
  position: fixed;
  left: 53%;
  transform: translateX(-50%);
  width: 98%;
  max-width: 75rem; /* 1200px -> 75rem */
  transition: all 0.3s ease;
  margin: 0 auto;
  bottom: 30%;
}

.chat-input-area.active {
  bottom: 4%;
  border-top: none;
  width: 98%;
  max-width: 75rem; /* 1200px -> 75rem */
}

/* 输入容器样式 */
.input-container {
  display: flex;
  align-items: flex-end;
  background-color: #fff;
  border-radius: 0.75rem; /* 12px -> 0.75rem */
  padding: 0.75rem 1rem; /* 12px 16px -> 0.75rem 1rem */
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1); /* 2px 8px -> 0.125rem 0.5rem */
  width: 100%;
  min-height: 6.25rem; /* 100px -> 6.25rem */
}

/* 文本输入框样式 */
textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 1.5rem; /* 24px -> 1.5rem */
  line-height: 1.5;
  min-height: 7.5rem; /* 120px -> 7.5rem */
  max-height: 12.5rem; /* 200px -> 12.5rem */
  overflow-y: auto;
  padding: 0.5rem 0.75rem; /* 8px 12px -> 0.5rem 0.75rem */
  font-family: inherit;
  background: transparent;
}

/* 发送按钮样式 */
.send-button {
  width: 3.375rem; /* 54px -> 3.375rem */
  height: 3.375rem;
  border-radius: 50%;
  background-color: #d8dee8;
  border: none;
  margin-left: 0.75rem; /* 12px -> 0.75rem */
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
  width: 1.5rem; /* 24px -> 1.5rem */
  height: 1.5rem;
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
  border-radius: 0.5rem; /* 8px -> 0.5rem */
  overflow: hidden;
  box-shadow: 0 0.125rem 0.625rem rgba(0, 0, 0, 0.1); /* 2px 10px -> 0.125rem 0.625rem */
  min-width: 12.5rem; /* 200px -> 12.5rem */
}

.menu-item, .language-option {
  padding: 0.75rem 1.25rem; /* 12px 20px -> 0.75rem 1.25rem */
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
  min-width: 9.375rem; /* 150px -> 9.375rem */
}

/* 消息气泡基础样式 */
.message-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 3.125rem; /* 50px -> 3.125rem */
  margin-top: 1.875rem; /* 30px -> 1.875rem */
  width: 100%;
  max-width: 75rem; /* 1200px -> 75rem */
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
  width: 3.125rem; /* 50px -> 3.125rem */
  height: 3.125rem;
  border-radius: 50%;
  margin-top: 0.5rem; /* 8px -> 0.5rem */
  margin-right: 0.75rem; /* 12px -> 0.75rem */
  flex-shrink: 0;
  border: 0.125rem solid #803c0f; /* 2px -> 0.125rem */
  object-fit: contain;
}

/* 消息气泡 */
.message-bubble {
  max-width: calc(100% - 3.75rem); /* 60px -> 3.75rem */
  padding: 1rem 1.25rem; /* 16px 20px -> 1rem 1.25rem */
  border-radius: 1rem; /* 16px -> 1rem */
  font-size: 1.375rem; /* 22px -> 1.375rem */
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

/* Markdown内容样式 */
.message-bubble ::v-deep h1,
.message-bubble ::v-deep h2,
.message-bubble ::v-deep h3,
.message-bubble ::v-deep h4 {
  color: #803c0f;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

/* 修复列表编号超出气泡的问题 */
.message-bubble ::v-deep ul,
.message-bubble ::v-deep ol {
  padding-left: 1.2em;
  margin-bottom: 1em;
  list-style-position: inside;
}

.message-bubble ::v-deep li {
  margin-bottom: 0.5em;
  padding-left: 0.5em;
  text-indent: -0.8em;
}

.message-bubble ::v-deep strong {
  font-weight: bold;
  color: #6e2c1b;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .ai-page {
    font-size: 0.875rem; /* 在小屏幕上减小基准字体 */
  }
  
  .sidebar {
    width: 4rem; /* 侧边栏变窄 */
  }
  
  .title-text h3 {
    font-size: 1.5rem !important;
    white-space: normal;
  }
  
  .title-text p {
    font-size: 1rem !important;
    white-space: normal;
    padding-left: 0;
  }
  
  .chat-history {
    width: 95%;
    padding: 1rem 0;
  }
  
  .message-bubble {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }
  
  .chat-input-area {
    width: 95%;
  }
  
  textarea {
    font-size: 1.25rem;
    min-height: 6rem;
  }
}

@media (max-width: 480px) {
  .ai-page {
    font-size: 0.75rem;
    margin-top: 6rem;
    height: calc(100vh - 6rem);
  }
  
  .sidebar {
    width: 3rem;
    padding: 0.5rem 0;
  }
  
  .ai-avatar {
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 1rem;
  }
  
  .new-chat {
    width: 2.5rem;
    height: 2.5rem;
    transform: translateY(0.5rem);
  }
  
  .user-avatar {
    width: 3rem;
    height: 3rem;
  }
  
  .welcome-message {
    padding: 1.5rem 1rem;
  }
  
  .title-text h3 {
    font-size: 1.25rem !important;
  }
  
  .title-text p {
    font-size: 0.875rem !important;
  }
  
  .gaozhou-icon {
    width: 3rem;
    height: 3rem;
    margin-right: 1.5rem;
  }
  
  .chat-input-area {
    width: 95%;
    bottom: 25%;
  }
  
  .chat-input-area.active {
    bottom: 2%;
  }
}
</style>