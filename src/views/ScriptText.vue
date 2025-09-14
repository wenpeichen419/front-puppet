<template>
    <div class="script-text">
        <div class="header">
            <h1>剧本库</h1>
            <p class="subtitle">点击卡片查看完整剧本内容</p>
        </div>

        <!-- 剧本列表展示 -->
        <div v-if="!showDetail" class="script-cards">
            <div v-for="script in scripts" :key="script.id" class="script-card" @click="showScriptDetail(script)">
                <div class="script-card-content">
                    <h3>{{ script.title }}</h3>
                    <div class="script-preview">{{ truncateText(script.content, 100) }}</div>
                    <div class="card-footer">
                        <span class="author">作者: {{ script.author }}</span>
                        <span class="read-more">查看详情 <i class="arrow">→</i></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 剧本详情页面 -->
        <div v-if="showDetail" class="script-detail">
            <div class="detail-header">
                <button class="back-button" @click="backToList">← 返回列表</button>
                <h2>{{ currentScript.title }}</h2>
                <div class="author-info">作者: {{ currentScript.author }}</div>
            </div>

            <div class="detail-content images-content">
                <img
                    v-for="(img, idx) in currentScript.images"
                    :key="idx"
                    :src="img"
                    class="script-image"
                    :alt="currentScript.images"
                />
                <div v-if="!currentScript.images || currentScript.images.length === 0" style="color:#888;">暂无相关剧本图片</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 剧本数据
const scripts = ref<any[]>([]);

// 状态管理
const showDetail = ref(false);
const currentScript = ref<any>({});

async function fetchScripts(skip = 0, limit = 20) {
    const url = `http://8.134.51.50:6060/api/v1/file/list?skip=${skip}&limit=${limit}&file_type=image`;
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': localStorage.getItem("cookie")
            }
        });
        const data = await res.json();
        if (data.code === 200 && data.data && Array.isArray(data.data.files)) {
            scripts.value = data.data.files
                .filter((f: any) => Array.isArray(f.tags) && f.tags.includes('test'))
                .map((f: any, idx: number) => ({
                    id: f.file_id || idx,
                    title: f.file_title || '无标题',
                    content: f.description || 'none',
                    author: f.uploaded_by || 'none',
                    images: [f.file_url]
                }));
        } else {
            scripts.value = getSampleScripts();
        }
    } catch (e) {
        scripts.value = getSampleScripts();
    }
}

function getSampleScripts() {
    return [
        {
            id: 'sample-1',
            title: '示例剧本一：三打白骨精',
            content: '这是一个经典的皮影戏剧本，讲述了孙悟空如何三次识破白骨精的诡计，保护唐僧西天取经的故事。',
            author: '吴承恩 (改编)',
            images: ['/src/assets/puppet-example.jpg']
        },
        {
            id: 'sample-2',
            title: '示例剧本二：哪吒闹海',
            content: '本剧本改编自中国古典神话，描绘了小英雄哪吒反抗龙王，为民除害的英勇事迹，情节曲折，引人入胜。',
            author: '神话传说 (改编)',
            images: ['/src/assets/puppet1.jpg']
        },
        {
            id: 'sample-3',
            title: '示例剧本三：沉香救母',
            content: '一个感人至深的故事，讲述了沉香为了救出被压在华山下的母亲，历经千辛万苦，最终拜师学艺，劈山救母。',
            author: '民间故事 (改编)',
            images: ['/src/assets/puppet2.jpg']
        },
        {
            id: 'sample-4',
            title: '示例剧本四：西游记之火焰山',
            content: '师徒四人行至火焰山，酷热难当，悟空三借芭蕉扇，与牛魔王、铁扇公主斗智斗勇，最终成功灭火，继续西行。',
            author: '吴承恩 (改编)',
            images: ['/src/assets/puppet.png']
        }
    ];
}

// 显示剧本详情
const showScriptDetail = (script: any) => {
    currentScript.value = script;
    showDetail.value = true;
};

// 返回列表
const backToList = () => {
    showDetail.value = false;
};

// 截断文本
const truncateText = (text: string, length: number) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

// 页面加载时获取剧本
onMounted(() => {
    fetchScripts(0, 50);
});
</script>

<style scoped>
.script-text {
    margin-top: 10px;
    min-height: 80vh;
    padding: 24px;
    background-color: #fdf7f5;
    color: #3a1a13;
}

.header {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
}

.header h1 {
    color: #6e2c1b;
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 1px 1px 2px rgba(110, 44, 27, 0.2);
}

.header .subtitle {
    color: #8a4734;
    font-style: italic;
}

.script-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.script-card {
    background: linear-gradient(135deg, #ffeee8, #fff);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 12px rgba(110, 44, 27, 0.15);
    transition: transform 0.3s, box-shadow 0.3s;
    cursor: pointer;
    position: relative;
    border-left: 4px solid #6e2c1b;
}

.script-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(110, 44, 27, 0.2);
}

.script-card-content {
    padding: 20px;
}

.script-card h3 {
    color: #6e2c1b;
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 1.4rem;
}

.script-preview {
    color: #5a3328;
    line-height: 1.6;
    margin-bottom: 20px;
    height: 80px;
    overflow: hidden;
}

.card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #8a4734;
    border-top: 1px solid rgba(110, 44, 27, 0.1);
    padding-top: 12px;
}

.read-more {
    display: flex;
    align-items: center;
    color: #6e2c1b;
    font-weight: 500;
}

.arrow {
    margin-left: 5px;
    transition: transform 0.2s;
}

.script-card:hover .arrow {
    transform: translateX(3px);
}

/* 详情页样式 */
.script-detail {
    background: #fff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 6px 20px rgba(110, 44, 27, 0.1);
    animation: fadeIn 0.4s ease-in-out;
    border-left: 5px solid #6e2c1b;
    max-height: 500px;
    overflow-y: scroll;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.detail-header {
    margin-bottom: 30px;
    position: relative;
}

.back-button {
    background-color: #6e2c1b;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    margin-bottom: 20px;
}

.back-button:hover {
    background-color: #5a2416;
}

.detail-header h2 {
    color: #6e2c1b;
    font-size: 2rem;
    margin: 20px 0 10px;
}

.author-info {
    color: #8a4734;
    font-style: italic;
    margin-bottom: 20px;
}

.detail-content {
    line-height: 1.8;
    color: #3a1a13;
}

.images-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
}

.script-image {
    max-width: 100%;
    max-height: 80vh;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(110, 44, 27, 0.12);
    margin-bottom: 12px;
}

@media (max-width: 768px) {
    .script-cards {
        grid-template-columns: 1fr;
    }
}
</style>
