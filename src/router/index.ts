import { createRouter, createWebHistory } from 'vue-router'
import ExternalRedirect from '../components/ExternalRedirect.vue';
import HomeView from '../views/HomeView.vue'
import BlessedCoastView from '@/views/BlessedCoastView.vue';
import ReunionView from '@/views/ReunionView.vue';
import ReunionAmenitiesView from '../views/ReunionAmenitiesView.vue';
import ReunionFamilyView from '@/views/ReunionFamilyView.vue';
import ReunionTeamView from '@/views/ReunionTeamView.vue';
import ReunionSoundsystemView from '@/views/ReunionSoundsystemView.vue';
import TicketScanner from '@/views/TicketScannerView.vue';
import MealScanner from '@/views/MealScannerView.vue';
import BlessedCoastDashboard from '@/views/BlessedCoastDashboard.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/blessedcoast',
      name: 'blessedcoast',
      component: BlessedCoastView
    },
    {
      path: '/blessedcoastdashboard',
      name: 'blessedcoastdashboard',
      component: BlessedCoastDashboard
    },
    {
      path: '/reunion',
      name: 'reunion',
      component: ReunionView
    },
    {
      path: '/reunionamenities',
      name: 'reunionamenities',
      component: ReunionAmenitiesView
    },
    {
      path: '/reunionfamily',
      name: 'reunionfamily',
      component: ReunionFamilyView
    },
    {
      path: '/reunionteam',
      name: 'reunionteam',
      component: ReunionTeamView

    },
    {
      path: '/reunionsoundsystem',
      name: 'reunionsoundsystem',
      component: ReunionSoundsystemView
    },
    {
      path: '/reunionapplication',
      name: 'reunionapplication',
      component: ExternalRedirect,
      props: { url: 'https://dasrecord.typeform.com/to/a65mFuLr' }
    },
    {
      path: '/reunionartists',
      name: 'reunionartists',
      component: ExternalRedirect,
      props: { url: 'https://calendar.google.com/calendar/u/0/embed?src=9db12edae9241ff09fe1e3dbae812dbbc65aeadee93cdcac57521f6f88c27c96@group.calendar.google.com&ctz=Regina&dates=20240830/20240902&mode=agenda&wkst=6' }
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
      props: { url: 'https://dasrecord.typeform.com/to/XxsV389I'}
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
      component: TicketScanner
    },
    {
      path: '/reunionmealscanner',
      name: 'reunionmealscanner',
      component: MealScanner
    },
    {
      path:'/stayconnected',
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
      props: { url: 'https://join.slack.com/t/reunionfestival/shared_invite/zt-2n9v17aud-yUWqZQBLj~zUlS9A4AngNA' }

    },
    {
      path: '/reunionreceipttracker',
      name: 'reunionreceipttracker',
      component: ExternalRedirect,
      props: { url: 'https://dasrecord.typeform.com/to/dOYM3jhk' }
    },
    {
      path: '/meetup',
      name: 'meetup',
      component: ExternalRedirect,
      props: { url: 'https://calendar.app.google/sFArBBC9xjq8oBaU6' }
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
      props: { url: 'https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MTJpbWVmNWY5YzhwbmtuaGg5Z2M0MWNiYjAgOWRiMTJlZGFlOTI0MWZmMDlmZTFlM2RiYWU4MTJkYmJjNjVhZWFkZWU5M2NkY2FjNTc1MjFmNmY4OGMyN2M5NkBn&tmsrc=9db12edae9241ff09fe1e3dbae812dbbc65aeadee93cdcac57521f6f88c27c96%40group.calendar.google.com' }
    }

  ]
})

export default router
