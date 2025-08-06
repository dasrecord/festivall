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
import SoundTechView from '@/views/SoundTechView.vue'
import ArtPhotographyView from '@/views/ArtPhotographyView.vue'
import ServicesView from '@/views/ServicesView.vue'
import CodingWebDevView from '@/views/CodingWebDevView.vue'
import TestimonialsView from '@/views/TestimonialsView.vue'
import DasButtonsView from '@/views/DasButtonsView.vue'
import DasRecordView from '@/views/DasRecordView.vue'
import WorkshopSignupView from '@/views/WorkshopSignupView.vue'
import ReunionApplicationView from '@/views/ReunionApplicationView.vue'
import ReunionTicketsView from '@/views/ReunionTicketsView.vue'
import ReunionContactView from '@/views/ReunionContactView.vue'
import ContractPage from '@/views/ContractPageView.vue'
import IDCodeInput from '@/views/IDCodeInput.vue'
import StageRider from '@/views/StageRider.vue'
import StarcrossedDemos from '@/views/StarcrossedDemos.vue'
import HotspotView from '@/views/HotspotView.vue'
import ReunionArtistResponsibilities from '@/views/ReunionArtistResponsibilitiesView.vue'
import ReunionVolunteerResponsibilities from '@/views/ReunionVolunteerResponsibilitiesView.vue'
import ReunionWorkshopResponsibilities from '@/views/ReunionWorkshopResponsibilitiesView.vue'
import ReunionVendorResponsibilities from '@/views/ReunionVendorResponsibilitiesView.vue'
import ReunionSlack from '@/views/ReunionSlack.vue'
import TicketPageView from '@/views/TicketPageView.vue'
import ReunionVolunteerInstructions from '@/views/ReunionVolunteerInstructionsView.vue'
import ReunionArtInstallationResponsibilitiesView from '@/views/ReunionArtInstallationResponsibilitiesView.vue'
import ReunionMapView from '@/views/ReunionMapView.vue'
import OnyxView from '@/views/OnyxView.vue'
import ScavengerHuntView from '@/views/ScavengerHuntView.vue'
import HavenView from '@/views/HavenView.vue'
import HavenBattleView from '@/views/HavenBattleView.vue'
import HavenIDCodeInput from '@/views/HavenIDCodeInput.vue'
import HavenTicketPageView from '@/views/HavenTicketPageView.vue'
import HavenTicketScannerView from '@/views/HavenTicketScannerView.vue'
import ReunionFAQView from '@/views/ReunionFAQView.vue'


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
    path: '/art&photography',
    name: 'art&photography',
    component: ArtPhotographyView,
    meta: { showHeader: true }
  },
  {
    path: '/workshopsignup',
    name: 'workshopsignup',
    component: WorkshopSignupView
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
    path: '/boilerroom',
    name: 'boilerroom',
    component: ExternalRedirect,
    props: { url: 'https://www.eventbrite.ca/e/nightmarket-yxe-presents-boiler-room-tickets-1549944940039' }
  },
  {
    path: '/cakeaway',
    name: 'cakeaway',
    component: ExternalRedirect,    
  },
  {
    path: '/coding&webdev',
    name: 'coding&webdev',
    component: CodingWebDevView,
    meta: { showHeader: true }
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
    component: DasRecordView,
    meta: { showHeader: false }
  },
  {
    path: '/das-record',
    name :'das-record',
    component: DasRecordView,
    meta: { showHeader: false }
  },
  {
    path: '/onyx',
    name: 'onyx',
    component: OnyxView
  },
  {
    path: '/hotspot',
    name: 'hotspot',
    component: HotspotView
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
    path: '/collaborate',
    name: 'collaborate',
    component: ReunionSlack
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/reunioncontract',
    name: 'EnterIDCode',
    component: IDCodeInput
  },
  { path: '/reunioncontract/:id_code', 
    name: 'ContractPage',
    component: ContractPage
  },
  {
    path: '/reunionticket',
    name: 'reunionticket',
    component: IDCodeInput
  },
  {
    path: '/reunionticket/:id_code',
    name: 'TicketPage',
    component: TicketPageView
  },
  { path : '/dasbuttons',
    name : 'dasbuttons',
    component: DasButtonsView,
    meta: { requiresAuth: true, showHeader: false }
  },
  {
    path: '/haven',
    name: 'haven',
    component: HavenView
  },
  {
    path: '/havenlogin',
    name: 'havenlogin',
    component: HavenIDCodeInput
  },
  {
    path: '/havenresidencytickets',
    name: 'havenresidencytickets',
    component: ExternalRedirect,
    props: { url:'https://buy.stripe.com/5kQaEXbUCd1v9lTgfZ28800'}
  },
  {
    path: '/haventicket/:id_code',
    name: 'HavenTicketPage',
    component: HavenTicketPageView
  },
  {
    path: '/haventicketscanner',
    name: 'haventicketscanner',
    component: HavenTicketScannerView,
    meta: { requiresAuth: true, showHeader: false }
  },
  {
    path: '/havenbattle',
    name: 'havenbattle',
    component: HavenBattleView
  },
  {
    path: '/haveninstagram',
    name: 'haveninstagram',
    component: ExternalRedirect,
    props: { url: "http://instagram.com/havenyxe"}
  },
  {
    path: '/nye',
    name: 'nye',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/dX5LAsHg' }
  },
  {
    path: '/physicianreceipttracker',
    name: 'physicianreceipttracker',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/s4jrTrXA' }
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
    component: ReunionApplicationView,
  },
  {
    path: '/reunion-artist-responsibilities',
    name: 'reunion-artist-responsibilities',
    component: ReunionArtistResponsibilities,
  },
  {
    path: '/reunion-volunteer-responsibilities',
    name: 'reunion-volunteer-responsibilities',
    component: ReunionVolunteerResponsibilities
  },
  {
    path: '/reunion-workshop-responsibilities',
    name: 'reunion-workshop-responsibilities',
    component: ReunionWorkshopResponsibilities
  },
  {
    path: '/reunion-vendor-responsibilities',
    name: 'reunion-vendor-responsibilities',
    component: ReunionVendorResponsibilities
  },
  {
    path: '/reunion-artinstallation-responsibilities',
    name: 'reunion-artinstallation-responsibilities',
    component: ReunionArtInstallationResponsibilitiesView
  },
  { 
    path: '/reunionlineup',
    name: 'reunionlineup',
    component: ReunionLineupView
  },
  {
    path: '/reunioncontact',
    name: 'reunioncontact',
    component: ReunionContactView
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
    component: ReunionTicketsView
  },
  {
    path: '/reuniontickets/:id_code',
    name: 'reuniontickets-id',
    component: ReunionTicketsView
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
    path : '/reunion-volunteer-instructions',
    name : 'reunion-volunteer-instructions',
    component: ReunionVolunteerInstructions
  },
  {
    path: '/reunion-volunteer-signup',
    name: 'reunion-volunteer-signup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/0/appointments/AcZssZ2bQG0EOcqR7kFeMK4hgf33BZaGsC3B6uFPgyI=' }
  },
  {
    path: '/reunion-frontgate-signup',
    name: 'reunion-frontgate-signup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ14cUp_kw7XDZOpgtLfO9t4eAJho8O_jwTL5RO7TG8S03ejX_xZafzBTNsFloIimnW_ioUDkl1s' }
  },
  {
    path: '/reunion-foodteam-signup',
    name: 'reunion-foodteam-signup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3HJwOFBlAF2ninkICYzjQ8S9Mn6zuoDwV5trvBO5ilkjJ6UrXDRQt0gJSljvAoRTDIZ6fzIelz' }
  },
  {
    path: '/reunion-stagecrew-signup',
    name: 'reunion-stagecrew-signup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0G8ipWXeewiySQ1CFfoA7s0ReBQzvMnMSs2Bdyi-jar9AXO8WDzulHzrIIP2UVVL3iNzVOKg9S' }
  },
  {
    path: '/reunion-setupcrew-a-signup',
    name: 'reunion-setupcrew-a-signup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ160c_KP34OQwFWlr0pMQY8EgMzLZ1kFE_QqsH0LNsPd63eA2cBjQLuFPu7EgjzglFn9CWIU-e5' }
  },
    {
    path: '/reunion-setupcrew-b-signup',
    name: 'reunion-setupcrew-b-signup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0kXHYQnvWUCAD60AY0QMBBmVBNOd_PI1bVgDBWlTO0VGE9ZEqmOX3285NArq6DuZ8jkcT6V7GW' }
  },
  {
    path: '/reunion-cleanupcrew-signup',
    name: 'reunion-cleanupcrew-signup',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2oH0RQRzM5NJKHD_yctNZNE9VPJJzEraRuywIbQzcJ70YPD98514kzV6gilAa6c-KTOegTHyPI' }
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
    path: '/reunionmap',
    name: 'reunionmap',
    component: ReunionMapView
  },
  {
    path: '/reunionvolunteercalendar',
    name: 'reunionvolunteercalendar',
    component: ExternalRedirect,
    props: { url: 'https://calendar.google.com/calendar/u/3/r/custom/7/d/2025/8/25' }
  },
  {
    path: '/reunionfaq',
    name: 'reunionfaq',
    component: ReunionFAQView
  },
  {
    path: '/reunionslack',
    name: 'reunionslack',
    component: ReunionSlack
  },
  {
    path: '/reunionreceipttracker',
    name: 'reunionreceipttracker',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/dOYM3jhk' }
  },
  {
    path: '/reuniontrailer',
    name: 'reuniontrailer',
    component: ExternalRedirect,
    props: { url: 'https://youtu.be/xibNU7F_RKQ?si=OSSjz5IVD1O_5Eoz' }
  },
  {
    path: '/scavengerhunt/:id_code',
    name: 'ScavengerHunt',
    component: ScavengerHuntView,
    props: (route: import('vue-router').RouteLocationNormalized) => ({
      id_code: route.params.id_code,
      fullName: route.query.fullName || 'Guest' // Default to 'Guest' if fullName is not provided
    })
  },
  {
    path: '/services',
    name: 'services',
    component: ServicesView,
    meta: { showHeader: true }
  },
  {
    path: '/soundtech',
    name: 'soundtech',
    component: SoundTechView,
    meta: { showHeader: true }
  },
  {
    path: '/stagerider',
    name: 'stagerider',
    component: StageRider,
  },
  {
    path: '/starcrossed',
    name: 'starcrossed',
    component: StarcrossedDemos,
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
    path: '/physicianreceipttracker',
    name: 'physicianreceipttracker',
    component: ExternalRedirect,
    props: { url: 'https://dasrecord.typeform.com/to/s4jrTrXA' }
  },
  {
    path: '/synergistic',
    name: 'synergistic',
    component: SynergisticView
  },
  {
    path: '/testimonials',
    name: 'testimonials',
    component: TestimonialsView,
    meta: { showHeader: true }
  },
  {
    path: '/videolibrary',
    name: 'videolibrary',
    component: ExternalRedirect,
    props: { url: 'https://drive.google.com/drive/folders/1l-xagltGwdnR1z7Jh5sw8PSu4h4oUjGl?usp=sharing' }
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
