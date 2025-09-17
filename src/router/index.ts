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
import SelfCheckInView from '@/views/SelfCheckInView.vue'
import SelfMealServiceView from '@/views/SelfMealServiceView.vue'
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
import ReunionVolunteerWelcome from '@/views/ReunionVolunteerWelcomeView.vue'
import ReunionVolunteerSignupView from '@/views/ReunionVolunteerSignupView.vue'
import ReunionArtInstallationResponsibilitiesView from '@/views/ReunionArtInstallationResponsibilitiesView.vue'
import ReunionMapView from '@/views/ReunionMapView.vue'
import OnyxView from '@/views/OnyxView.vue'
import ScavengerHuntView from '@/views/ScavengerHuntView.vue'
import ReunionFAQView from '@/views/ReunionFAQView.vue'
import ApplicantDetailView from '@/views/ApplicantDetailView.vue'
import ReunionSetupCrewManual from '@/views/ReunionSetupCrewManual.vue'
import ReunionFoodTeamManual from '@/views/ReunionFoodTeamManual.vue'
import ReunionFrontGateManual from '@/views/ReunionFrontGateManual.vue'
import ReunionStageCrewManual from '@/views/ReunionStageCrewManual.vue'
import ReunionCleanupCrewManual from '@/views/ReunionCleanupCrewManual.vue'
import AdminTaskManager from '@/views/AdminTaskManager.vue'
import AdminVolunteerSlotsView from '@/views/AdminVolunteerSlotsView.vue'


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
    path: '/dashboard/applicant/:id',
    name: 'applicant-detail',
    component: ApplicantDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/tasks',
    name: 'admin-task-manager',
    component: AdminTaskManager,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/volunteer-slots',
    name: 'admin-volunteer-slots',
    component: AdminVolunteerSlotsView,
    meta: { requiresAuth: true }
  },
  // Alias for admin volunteer tasks (human-friendly path)
  { path: '/admin/volunteer-tasks', redirect: { name: 'admin-volunteer-slots' } },
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
    path: '/reunionsetupcrew',
    name: 'reunionsetupcrew',
    component: ReunionSetupCrewManual,
  },
  {
    path: '/reunionfoodteam',
    name: 'reunionfoodteam',
    component: ReunionFoodTeamManual,
  },
  {
    path: '/reunionfrontgate',
    name: 'reunionfrontgate',
    component: ReunionFrontGateManual,
  },
  {
    path: '/reunionstagecrew',
    name: 'reunionstagecrew',
    component: ReunionStageCrewManual,
  },
  {
    path: '/reunioncleanupcrew',
    name: 'reunioncleanupcrew',
    component: ReunionCleanupCrewManual,
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
    path: '/self-checkin',
    name: 'self-checkin',
    component: SelfCheckInView,
    meta: { showHeader: false }
  },
  {
    path: '/self-meal-service',
    name: 'self-meal-service',
    component: SelfMealServiceView,
    meta: { showHeader: false }
  },
  {
    path: '/reunion-volunteer-welcome',
    name: 'reunion-volunteer-welcome',
    component: ReunionVolunteerWelcome
  },
  {
    path: '/reunion-volunteer-signup',
    name: 'reunion-volunteer-signup',
    component: ReunionVolunteerSignupView,
    props: { teamKey: 'multi' }
  },
  // Legacy redirects from old team-specific routes to consolidated signup
  { path: '/reunion-frontgate-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-foodteam-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-foodteam-a-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-foodteam-b-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-stagecrew-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-stagecrew-a-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-stagecrew-b-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-stagecrew-c-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-setupcrew-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-setupcrew-a-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-setupcrew-b-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-setupcrew-c-signup', redirect: { name: 'reunion-volunteer-signup' } },
  { path: '/reunion-cleanupcrew-signup', redirect: { name: 'reunion-volunteer-signup' } },
  // Legacy redirect from old instructions page
  { path: '/reunion-volunteer-instructions', redirect: { name: 'reunion-volunteer-welcome' } },
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
