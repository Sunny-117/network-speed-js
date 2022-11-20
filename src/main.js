import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import About from './views/About.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
Vue.config.productionTip = false
Vue.component('About', About)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
