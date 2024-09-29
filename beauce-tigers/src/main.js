
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'
import '@/assets/reset.css'
import '@/assets/style.css'

app.use(createPinia())
app.use(router)

app.mount('#app')
