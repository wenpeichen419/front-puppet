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
                                <button
                                    type="button"
                                    @click="getVerificationCode"
                                    class="get-code-btn"
                                    :disabled="countdown > 0"
                                >
                                    {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
                                </button>
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
                    <div class="login-link">
                        已有账号？<a @click.prevent="goToLogin" href="#">登录</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const formData = reactive({
    username: '',
    email: '',
    verificationCode: '',
    password: '',
    confirmPassword: ''
});

const router = useRouter();

const countdown = ref(0);
let timer = null;

const handleRegister = () => {
    if (formData.password !== formData.confirmPassword) {
        ElMessage.error("两次输入的密码不一致！");
        return;
    }
    console.log('正在注册:', formData);
    fetch('http://8.134.51.50:6060/api/v1/auth/register/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                email: formData.email.valueOf(),
                password: formData.password.valueOf(),
                code: formData.verificationCode.valueOf()
        })
    })
    .then(resp => resp.json())
    .then(data => {
        if (data.code !== 200){
            ElMessage.error(data.message);
        }
        else {
            ElMessage.success("注册成功！");
            router.push('/login');
        }
    })
    .catch(err => {
        ElMessage.error("注册失败！");
    })
};

const getVerificationCode = () => {
    if (!formData.email) {
        ElMessage.info('请输入邮箱地址！')
        return;
    }
    if (countdown.value > 0) {
        return;
    }
    // 启动倒计时
    countdown.value = 60;
    timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
            clearInterval(timer);
            timer = null;
        }
    }, 1000);

    console.log(`正在向 ${formData.email} 发送验证码`);
    fetch('http://8.134.51.50:6060/api/v1/auth/register/code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: formData.email.valueOf(),
        })
    })
    .then(resp => resp.json())
    .then(data => {
        if (data.code !== 200){
            ElMessage.error(data.message);
        }
        else {
            ElMessage.success("发送成功！");
        }
    })
    .catch(err => {
        ElMessage.error('发送失败！');
    })
};

// 防止组件卸载时计时器未清理
onUnmounted(() => {
    if (timer) clearInterval(timer);
});

const goToLogin = () => {
    router.push('/login');
};
</script>

<style scoped>
.register-container {
    margin-top: 140px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    /* 保证整体高度适中 */
}

.register-box {
    display: flex;
    width: 800px;
    /* 原800px，缩小宽度 */
    min-height: 550px;
    /* 原高度更大，缩小高度 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-radius: 20px;
    overflow: hidden;
    background-color: white;
}

.left-panel {
    width: 50%;
    padding: 24px;
    /* 原30px，缩小内边距 */
    background: linear-gradient(135deg, #8a4a3a 0%, #6e2c1b 100%);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.left-panel h1 {
    font-size: 2rem;
    margin-bottom: 0.8rem;
}

.left-panel p {
    font-size: 1rem;
}

.right-panel {
    width: 50%;
    padding: 10px 20px;
    /* 原15px 30px，缩小内边距 */
    display: flex;
    justify-content: center;
    align-items: center;
}

.register-form {
    width: 100%;
    max-width: 280px;
    /* 原320px，缩小表单宽度 */
    position: relative;
}

.register-form h2 {
    margin-bottom: 18px;
    /* 原24px */
    text-align: center;
    color: #333;
    font-size: 1.4rem;
    /* 原1.8rem */
}

.form-group {
    margin-bottom: 12px;
    /* 原16px */
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
    padding: 10px;
    border: 1px solid #dcdfe6;
    border-left: none;
    background-color: #f5f7fa;
    cursor: pointer;
    white-space: nowrap;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    transition: background-color 0.3s;
    font-size: 0.95em;
}

.get-code-btn:hover {
    background-color: #e4e7ed;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    /* 原8px */
    color: #606266;
    font-weight: bold;
}

.form-group input {
    width: 100%;
    padding: 10px;
    /* 原12px */
    border: 1px solid #dcdfe6;
    border-radius: 5px;
    box-sizing: border-box;
    transition: border-color 0.2s;
    font-size: 1em;
}

.form-group input:focus {
    outline: none;
    border-color: #6e2c1b;
}

.register-btn {
    width: 100%;
    padding: 10px;
    margin-top: 7px;
    margin-bottom: 15px;
    border: none;
    border-radius: 5px;
    background: linear-gradient(135deg, #8a4a3a 0%, #6e2c1b 100%);
    color: white;
    font-size: 15px;
    font-weight: bold;
    cursor: pointer;
    transition: opacity 0.3s;
}

.register-btn:hover {
    opacity: 0.5;
}

.login-link {
    text-align: right;
    font-size: 0.98em;
    color: #888;
    width: 100%;
}

.login-link a {
    color: #8a4a3a;
    text-decoration: underline;
    cursor: pointer;
    margin-left: 4px;
}
</style>