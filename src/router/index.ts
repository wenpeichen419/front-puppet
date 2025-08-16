import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Scripts from '../views/Scripts.vue'
import Placeholder from '../views/Placeholder.vue'
import CulturalResources from '../views/CulturalResources.vue'
import CulturalChildIndex from '../views/CulturalChildPage/Index.vue' // 直接导入
import CulturalChildPicture from '../views/CulturalChildPage/Picture.vue' // 直接导入
import RegisterView from '@/views/RegisterView.vue'

// 创建动态导入函数，提高代码可维护性
const loadView = (view) => () => import(`../views/${view}.vue`)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/scripts',
      name: 'scripts',
      component: Scripts
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/video/:id',
      name: 'video',
      component: loadView('Video')
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: loadView('NewsDetail')
    },
    {
      path: '/resources',
      name: 'resources',
      component: CulturalResources,
      props: { pageName: '文化资源' },
      children: [
        {
          path: '',
          name: 'resources-index',
          component: CulturalChildIndex, // 使用直接导入
          props: { pageName: '文化资源首页' }
        },
        {
          path: 'picture',
          name: 'picture-resources',
          component: CulturalChildPicture, // 使用直接导入
          props: { pageName: '图片资源' }
        }
      ]
    },
    {
      path: '/diy',
      name: 'diy',
      component: Placeholder,
      props: { pageName: '木偶形象DIY' }
    },
    {
      path: '/music',
      name: 'music',
      component: Placeholder,
      props: { pageName: '曲目点播' }
    },
    {
      path: '/chat',
      name: 'chat',
      component: loadView('AiConsult'),
      props: { pageName: 'AI咨询' }
    },
    {
      path: '/:pathMatch(.*)*', // 404页面处理
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

// 添加路由导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || to.props?.pageName || '高州木偶戏数字博物馆'
  next()
})

// 添加错误处理
router.onError((error) => {
  console.error('[路由错误]', error)
  // 可以在这里添加错误上报逻辑
})

export default router