import { registerPlugins } from '@/plugins'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import 'unfonts.css'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App)

registerPlugins(app)
app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
