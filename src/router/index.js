import { createRouter, createWebHistory } from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/supabase'
import Admin from '../views/Admin.vue'
import Posts from '../components/Posts.vue'
import Users from '../components/Users.vue'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/apps',
    name: 'Apps',
    component: () => import('@/views/Apps.vue')
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/views/Upload.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('@/views/Leaderboard.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/apps/:id',
    name: 'AppDetail',
    component: () => import('@/views/AppDetail.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/posts',
    name: 'Posts',
    component: Posts
  },
  {
    path: '/posts/:id',
    name: 'PostDetails',
    component: () => import('../components/PostDetails.vue')
  },
  {
    path: '/users',
    name: 'Users',
    component: Users
  },
  {
    path: '/users/:userId/posts',
    name: 'UserPosts',
    component: () => import('../components/UserPosts.vue')
  },
  {
    path: '/users/:userId/todos',
    name: 'UserTodos',
    component: () => import('../components/UserTodos.vue')
  },
  {
    path: '/users/:userId/albums',
    name: 'UserAlbums',
    component: () => import('../components/UserAlbums.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 