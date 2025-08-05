import { logEvent } from 'firebase/analytics'
import { reunion_analytics, festivall_analytics } from '@/firebase.js'

export const analyticsMixin = {
  methods: {
    // Track page view for any page
    trackPageView(pageName, analytics = 'festivall') {
      const analyticsInstance = analytics === 'reunion' ? reunion_analytics : festivall_analytics
      
      logEvent(analyticsInstance, 'page_view', {
        page_title: pageName,
        page_location: window.location.href,
        page_path: this.$route.path
      })
    },

    // Track link clicks
    trackLinkClick(linkName, destination, analytics = 'festivall') {
      const analyticsInstance = analytics === 'reunion' ? reunion_analytics : festivall_analytics
      
      logEvent(analyticsInstance, 'select_content', {
        content_type: 'navigation_link',
        item_id: linkName,
        content_name: linkName.replace('_', ' '),
        destination: destination
      })
    },

    // Track form submissions
    trackFormSubmission(formName, analytics = 'festivall') {
      const analyticsInstance = analytics === 'reunion' ? reunion_analytics : festivall_analytics
      
      logEvent(analyticsInstance, 'form_submit', {
        form_name: formName,
        page_location: window.location.href
      })
    },

    // Track video interactions
    trackVideoInteraction(action, videoTitle, analytics = 'festivall') {
      const analyticsInstance = analytics === 'reunion' ? reunion_analytics : festivall_analytics
      
      logEvent(analyticsInstance, `video_${action}`, {
        video_title: videoTitle,
        page_location: window.location.href
      })
    },

    // Track ticket/purchase interest
    trackTicketInterest(ticketType, analytics = 'festivall') {
      const analyticsInstance = analytics === 'reunion' ? reunion_analytics : festivall_analytics
      
      logEvent(analyticsInstance, 'add_to_cart', {
        item_name: ticketType,
        content_type: 'ticket',
        page_location: window.location.href
      })
    }
  }
}
