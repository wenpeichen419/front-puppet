<template>
    <div class="register-container">
        <div class="register-box">
            <div class="left-panel">
                <h1>欢迎来到 Puppet</h1>
                <p>感谢您对高州木偶戏的支持</p>
            </div>
            <div class="right-panel">
                <div class="register-form">
                    <h2>用户注册</h2>
                    <form @submit.prevent="handleRegister">
                        <div class="form-group">
                            <label for="username">用户名</label>
                            <input type="text" id="username" v-model="formData.username" required>
                        </div>
                        <div class="form-group">
                            <label for="email">邮箱</label>
                            <input type="email" id="email" v-model="formData.email" required>
                        </div>
                        <div class="form-group">
                            <label for="verificationCode">验证码</label>
                            <div class="verification-code-group">
                                <input type="text" id="verificationCode" v-model="formData.verificationCode" required>
                                <button type="button" @click="getVerificationCode" class="get-code-btn">获取验证码</button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="password">密码</label>
                            <input type="password" id="password" v-model="formData.password" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">确认密码</label>
                            <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required>
                        </div>
                        <button type="submit" class="register-btn">注册</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';

const formData = reactive({
    username: '',
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
});

const handleRegister = () => {
    if (formData.password !== formData.confirmPassword) {
        alert('两次输入的密码不一致！');
        return;
    }
    console.log('正在注册:', formData);
    // 在这里添加调用API进行注册的逻辑
    alert('注册成功！');
};

const getVerificationCode = () => {
    if (!formData.email) {
        alert('请输入邮箱地址！');
        return;
    }
    console.log(`正在向 ${formData.email} 发送验证码`);
    // 在这里添加调用API发送验证码的逻辑
    alert('验证码已发送！');
};
</script>

<style scoped>
.register-container {
    margin-top: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.register-box {
    display: flex;
    width: 800px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    overflow: hidden;
    background-color: white;
}

.left-panel {
    width: 50%;
    padding: 30px;
    background: linear-gradient(135deg, #8a4a3a 0%, #6e2c1b 100%);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.left-panel h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.left-panel p {
    font-size: 1.1rem;
}

.right-panel {
    width: 50%;
    padding: 15px 30px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.register-form {
    width: 100%;
    max-width: 320px;
}

.register-form h2 {
    margin-bottom: 24px;
    text-align: center;
    color: #333;
    font-size: 1.8rem;
}

.form-group {
    margin-bottom: 16px;
}

.verification-code-group {
    display: flex;
    align-items: center;
}

.verification-code-group input {
    flex-grow: 1;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.get-code-btn {
    padding: 12px;
    border: 1px solid #dcdfe6;
    border-left: none;
    background-color: #f5f7fa;
    cursor: pointer;
    white-space: nowrap;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    transition: background-color 0.3s;
}

.get-code-btn:hover {
    background-color: #e4e7ed;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    color: #606266;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.form-group input:focus {
    outline: none;
    border-color: #6e2c1b;
}

.register-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 5px;
    background: linear-gradient(135deg, #8a4a3a 0%, #6e2c1b 100%);
    color: white;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.3s;
}

.register-btn:hover {
    opacity: 0.9;
}
</style>