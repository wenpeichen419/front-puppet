<template>
    <div v-if="visible" class="search-results-popup" @click.self="close">
        <div class="results-content">
            <h3>搜索结果</h3>
            <ul>
                <li v-for="result in results" :key="result.id" @click="goToResult(result.id)">
                    <h4>{{ result.title }}</h4>
                    <p>{{ result.description }}</p>
                </li>
            </ul>
            <button @click="close" class="close-btn">关闭</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SearchResults',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        results: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        close() {
            this.$emit('close')
        },
        goToResult(id) {
            this.$router.push(`/video/${id}`)
            this.close()
        }
    }
}
</script>

<style scoped>
.search-results-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1001;
}

.results-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.results-content h3 {
    margin-top: 0;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
}

.results-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.results-content li {
    padding: 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
}

.results-content li:hover {
    background-color: #f4f4f4;
}

.results-content li:last-child {
    border-bottom: none;
}

.results-content h4 {
    margin: 0 0 5px 0;
}

.results-content p {
    margin: 0;
    font-size: 14px;
    color: #666;
}

.close-btn {
    display: block;
    margin: 20px auto 0;
    padding: 8px 20px;
    border: 1px solid #ccc;
    background-color: #f4f4f4;
    cursor: pointer;
    border-radius: 4px;
}
</style>
