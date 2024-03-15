import { createRouter, createWebHistory } from 'vue-router'
import ExternalRedirect from '../components/ExternalRedirect.vue';
import HomeView from '../views/HomeView.vue'
import ReunionView from '@/views/ReunionView.vue';
import ReunionAmenitiesView from '../views/ReunionAmenitiesView.vue';
import ReunionFamilyView from '@/views/ReunionFamilyView.vue';
import ReunionTeamView from '@/views/ReunionTeamView.vue';

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
      path: '/reunionapplication',
      name: 'reunionapplication',
      component: ExternalRedirect,
      props: { url: 'https://dasrecord.typeform.com/to/a65mFuLr' }
    },
    {
      path: '/reuniontickets',
      name: 'reuniontickets',
      component: ExternalRedirect,
      props: { url: 'https://dasrecord.typeform.com/to/dyJs6iFd' }
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
