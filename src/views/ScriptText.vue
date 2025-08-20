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

            <div class="detail-content">
                <p v-for="(paragraph, index) in currentScript.content.split('\n')" :key="index" class="paragraph">
                    {{ paragraph }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 示例剧本数据
const scripts = ref([
    {
        id: 1,
        title: '木偶奇遇记',
        author: '张三',
        content: '从前有一个小木偶，名叫匹诺曹。他是由一位名叫杰佩托的木匠制作的。杰佩托非常希望有一个儿子，所以蓝色仙女赋予了匹诺曹生命。\n匹诺曹必须证明自己是勇敢、诚实和无私的，才能成为一个真正的男孩。他遇到了许多困难和诱惑，但最终通过自己的努力和善良获得了真正的生命。'
    },
    {
        id: 2,
        title: '皮影戏之传统故事',
        author: '李四',
        content: '在中国古代，有一种独特的艺术形式，那就是皮影戏。皮影戏使用皮革制作的人物剪影，通过灯光投射在白色幕布上演绎故事。\n这个故事讲述了一位年轻艺人如何学习皮影戏的技艺，并将这一传统文化传承下去的感人历程。'
    },
    {
        id: 3,
        title: '提线木偶师',
        author: '王五',
        content: '一位老木偶师在他生命的最后时光里，决定将自己毕生的技艺传授给一个有天赋的年轻人。这个年轻人从一开始的不屑一顾，到逐渐被木偶艺术的魅力所吸引。\n通过木偶表演，他们共同讲述了一个关于友情、勇气和坚持的故事，感动了无数观众。'
    },
    {
        id: 4,
        title: '纸片人的世界',
        author: '赵六',
        content: '在一个由纸片构成的奇幻世界里，居住着各种各样的纸片人。他们有自己的社会、规则和文化。\n这个故事讲述了一个普通纸片人不甘平凡，追求梦想的冒险之旅。在旅途中，他结识了许多朋友，也面临了许多挑战，最终找到了自己的人生价值。'
    }
]);

// 状态管理
const showDetail = ref(false);
const currentScript = ref<any>({});

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
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};
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
    padding: 24px;
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

.paragraph {
    margin-bottom: 16px;
    text-indent: 2em;
}

@media (max-width: 768px) {
    .script-cards {
        grid-template-columns: 1fr;
    }
}
</style>
