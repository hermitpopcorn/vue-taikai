import Vue from 'vue'
import Router from 'vue-router'
import Initialize from '@/components/Initialize'
import SelectMode from '@/components/SelectMode'
import InputSession from '@/components/InputSession'
import SetupSession from '@/components/SetupSession'
import DisplayScreen from '@/components/DisplayScreen'
import ControlScreen from '@/components/ControlScreen'

Vue.use(Router)

export default new Router({
  mode: 'abstract',
  routes: [
    {
      path: '/',
      name: 'Initialize',
      component: Initialize
    },
    {
      path: '/select-mode',
      name: 'SelectMode',
      component: SelectMode
    },
    {
      path: '/input-session',
      name: 'InputSession',
      component: InputSession
    },
    {
      path: '/setup-session/:sessionCode',
      name: 'SetupSession',
      component: SetupSession,
      props: true
    },
    {
      path: '/display',
      name: 'DisplayScreen',
      component: DisplayScreen
    },
    {
      path: '/control',
      name: 'ControlScreen',
      component: ControlScreen
    },
    {
      path: '/blank',
      name: 'Blank',
      component: null
    }
  ]
})
