import Vue from 'vue'
import Router from 'vue-router'

import LandingPage from '@/view/LandingPage'
import setting from '@/view/setting'
import merge from '@/view/merge'
import bilibili from '@/view/bilibili'

const routerPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return routerPush.call(this, location).catch(error => error)
}
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LandingPage',
      component: LandingPage
    },
    {
      path: '/setting',
      name: 'setting',
      component: setting
    },
    {
      path: '/merge',
      name: 'merge',
      component: merge
    },
    {
      path: '/bilibili',
      name: 'bilibili',
      component: bilibili
    }
  ]
})
