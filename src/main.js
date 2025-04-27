import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config/supabase'
import './assets/styles/global.css'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const app = createApp(App)
app.use(router)
app.provide('supabase', supabase)
app.mount('#app') 