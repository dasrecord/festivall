import { createRouter, createWebHistory } from 'vue-router'
import ExternalRedirect from '../components/ExternalRedirect.vue';
import HomeView from '../views/HomeView.vue'
import ReunionView from '@/views/ReunionView.vue';
import ReunionAmenitiesView from '../views/ReunionAmenitiesView.vue';
import ReunionFamilyView from '@/views/ReunionFamilyView.vue';
import ReunionTeamView from '@/views/ReunionTeamView.vue';
import ReunionSoundsystemView from '@/views/ReunionSoundsystemView.vue';
import TicketScanner from '@/views/TicketScanner.vue';

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
      props: { url: 'https://join.slack.com/t/reunionfestival/shared_invite/zt-2fjkx8qcn-SoW47rEUYMkzMdxOyiaqtw' }

    },
    {
      path: '/meetup',
      name: 'meetup',
      component: ExternalRedirect,
      props: { url: 'https://calendar.google.com/calendar/u/0/selfsched?sstoken=UU1xZl92cFY2bkNUfGRlZmF1bHR8ZThjN2E5MGJhMGY5MTg3OGM3OTFjYmFkMjg3YmY0NzA' }
    },
    {
      path: '/starcrossed',
      name: 'starcrossed',
      component: ExternalRedirect,
      props: { url: 'https://dasrecord.typeform.com/to/xHvozB7Y' }
    }

  ]
})

export default router
