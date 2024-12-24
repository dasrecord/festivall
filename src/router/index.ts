import { createRouter, createWebHistory } from 'vue-router'
import ExternalRedirect from '../components/ExternalRedirect.vue'
import HomeView from '../views/HomeView.vue'
import FuseCollectiveView from '@/views/FuseCollectiveView.vue'
import ReunionView from '@/views/ReunionView.vue'
import ReunionAmenitiesView from '../views/ReunionAmenitiesView.vue'
import ReunionFamilyView from '@/views/ReunionFamilyView.vue'
import ReunionTeamView from '@/views/ReunionTeamView.vue'
import ReunionSoundsystemView from '@/views/ReunionSoundsystemView.vue'
import ReunionLineupView from '@/views/ReunionLineupView.vue'
import TicketScanner from '@/views/TicketScannerView.vue'
import MealScanner from '@/views/MealScannerView.vue'
import BlessedCoastView from '@/views/BlessedCoastView.vue'
import FestivallLogin from '@/views/LoginView.vue'
import Dashboard from '@/views/FestivallDashboard.vue'
import BlessedCoastLineupView from '@/views/BlessedCoastLineupView.vue'
import SynergisticView from '@/views/SynergisticView.vue'
import PlaceHolderView from '@/views/PlaceHolderView.vue'


const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { showHeader: true }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { showHeader: true }
  },
  {
    path: '/bitcoinmeetup',
    name: 'bitcoinmeetup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.app.google/18VPBcwYU6HLcpL98' }
  },
  {
    path: '/blessedcoast',
    name: 'blessedcoast',
    component: BlessedCoastView
  },
  {
    path: '/blessedcoastlineup',
    name: 'blessedcoastlineup',
    component: BlessedCoastLineupView
  },
  {
    path: '/fusecollective', 
    name: 'fusecollective',
    component: FuseCollectiveView,
    meta: { showHeader: true }
  },
  {
    path: '/dasrecord',
    name :'dasrecord',
    component: ExternalRedirect,
    props: { url: 'https://festivall.webflow.io/das-record' }
  },
  {
    path: '/das-record',
    name :'das-record',
    component: ExternalRedirect,
    props: { url: 'https://festivall.webflow.io/das-record' }
  },
  {
    path: '/howitallworks',
    name : 'howitallworks',
    component: ExternalRedirect,
    props: { url: 'https://docs.google.com/drawings/d/1HT9VhiBSHEqSnQuH8m_NmaijO5sl8W91U-P3bqyY_HM/edit?usp=sharing' }

  },
  {
    path: '/login',
    name: 'login',
    component: FestivallLogin
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/nye',
    name: 'nye',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/dX5LAsHg' }
  },
  {
    path: '/placeholder',
    name: 'placeholder',
    component: PlaceHolderView,
    meta: { showHeader: true }
  },
  {
    path: '/reunion',
    name: 'reunion',
    component: ReunionView,
    meta: { showHeader: true }
  },
  {
    path: '/reunionamenities',
    name: 'reunionamenities',
    component: ReunionAmenitiesView,
    meta: { showHeader: true }
  },
  {
    path: '/reunionfamily',
    name: 'reunionfamily',
    component: ReunionFamilyView,
    meta: { showHeader: true }
  },
  {
    path: '/reunionteam',
    name: 'reunionteam',
    component: ReunionTeamView,
    meta: { showHeader: true }
  },
  {
    path: '/reunionsoundsystem',
    name: 'reunionsoundsystem',
    component: ReunionSoundsystemView,
    meta: { showHeader: true }
  },
  {
    path: '/reunionapplication',
    name: 'reunionapplication',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/a65mFuLr' }
  },
  {
    path: '/reunionlineup',
    name: 'reunionlineup',
    component: ReunionLineupView
  },
  {
    path: '/reunioncontact',
    name: 'reunioncontact',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/OahALD' }
  },
  {
    path: '/chooseyourvisuals',
    name: 'chooseyourvisuals',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/IkweNol1' }
  },
  {
    path: '/reunionmassage',
    name: 'reunionmassage',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/XxsV389I' }
  },
  {
    path: '/reuniontickets',
    name: 'reuniontickets',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/dyJs6iFd' }
  },
  {
    path: '/reunionticketscanner',
    name: 'reunionticketscanner',
    component: TicketScanner,
    meta: { requiresAuth: true, showHeader: false }
  },
  {
    path: '/reunionmealscanner',
    name: 'reunionmealscanner',
    component: MealScanner,
    meta: { requiresAuth: true, showHeader: false }
  },
  {
    path: '/stayconnected',
    name: 'stayconnected',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/oNXOMH' }
  },
  {
    path: '/munnismeals',
    name: 'munnismeals',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/fx9c8lFb' }
  },
  {
    path: '/reunionlocation',
    name: 'reunionlocation',
    component: ExternalRedirect,
    props: { url: 'https://goo.gl/maps/rTyyip88oiJygiTU9' }
  },
  {
    path: '/reunionslack',
    name: 'reunionslack',
    component: ExternalRedirect,
    props: {
      url: 'https://join.slack.com/t/reunionfestival/shared_invite/zt-2n9v17aud-yUWqZQBLj~zUlS9A4AngNA'
    }
  },
  {
    path: '/reunionreceipttracker',
    name: 'reunionreceipttracker',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/dOYM3jhk' }
  },
  {
    path: '/starcrossed',
    name: 'starcrossed',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/xHvozB7Y' }
  },
  {
    path: '/partyinthepark',
    name: 'partyinthepark',
    component: ExternalRedirect,
    props: {
      url: 'https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MTJpbWVmNWY5YzhwbmtuaGg5Z2M0MWNiYjAgOWRiMTJlZGFlOTI0MWZmMDlmZTFlM2RiYWU4MTJkYmJjNjVhZWFkZWU5M2NkY2FjNTc1MjFmNmY4OGMyN2M5NkBn&tmsrc=9db12edae9241ff09fe1e3dbae812dbbc65aeadee93cdcac57521f6f88c27c96%40group.calendar.google.com'
    }
  },
  {
    path: '/synergistic',
    name: 'synergistic',
    component: SynergisticView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard to check for authentication
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthenticated = !!localStorage.getItem('user')

  if (requiresAuth && !isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
