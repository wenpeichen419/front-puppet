import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Scripts from '../views/Scripts.vue'
import CulturalResources from '../views/CulturalResources.vue'
import CulturalChildIndex from '../views/CulturalChildPage/Index.vue'
import CulturalChildPicture from '../views/CulturalChildPage/Picture.vue'
import CulturalChildDocument from '../views/CulturalChildPage/Document.vue'
import CulturalChildVideo from '../views/CulturalChildPage/Video.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import DIY from '../views/PuppetDIY.vue'
import Player from '../views/VideoPlay.vue'

// 创建动态导入函数，提高代码可维护性
const loadView = (view: string) => () => import(`../views/${view}.vue`)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: '首页' }
    },
    {
      path: '/scripts',
      name: 'scripts',
      component: Scripts,
      meta: { title: '剧本剧目' },
      redirect: '/scripts/video',
      children: [
        {
          path: 'video',
          name: 'scripts-video',
          component: () => import('../views/ScriptsVideo.vue'),
          meta: { title: '剧本视频' }
        },
        {
          path: 'text',
          name: 'scripts-text',
          component: () => import('../views/ScriptText.vue'),
          meta: { title: '剧本文本' }
        }
      ]
    },
    {
      path: '/resources',
      name: 'resources',
      component: CulturalResources,
      meta: { title: '文化资源' },
      children: [
        {
          path: '',
          name: 'resources-index',
          component: CulturalChildIndex,
          meta: { title: '文化资源首页' }
        },
        {
          path: 'picture',
          name: 'picture-resources',
          component: CulturalChildPicture,
          meta: { title: '图片资源' }
        },
        {
          path: 'document',
          name: 'document-resources',
          component: CulturalChildDocument,
          meta: { title: '文献资源' }
        },
        {
          path: 'video',
          name: 'video-resources',
          component: CulturalChildVideo,
          meta: { title: '视频资源' }
        },
      ]
    },
   {
      path: '/diy',
      name: 'diy',
      component: DIY,
      props: { pageName: '木偶形象DIY' }
    },
    {
      path: '/music',
      name: 'music',
      component: Player,
      props: { pageName: '曲目点播' }
    },
    {
      path: '/chat',
      name: 'chat',
      component: loadView('AiConsult'),
      meta: { title: 'AI咨询' }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { title: '用户注册' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: '用户登录' }
    },
    {
      path: '/video/:id',
      name: 'video',
      component: loadView('Video'),
      meta: { title: '视频详情' }
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: loadView('NewsDetail'),
      meta: { title: '新闻详情' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 改进的路由导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = (typeof to.meta.title === 'string' ? to.meta.title : '高州木偶戏数字博物馆');
  
  // 确保始终调用next()
  next()
})

// 增强的错误处理
router.onError((error) => {
  console.error('[路由错误]', error)
  // 可以在这里添加错误上报逻辑
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    router.push('/error?type=chunk-loading')
  }
})

export default router