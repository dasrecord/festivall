#!/usr/bin/env node

/**
 * Analytics Monitoring Script for Festivall
 * 
 * This script helps track what analytics events are being fired
 * and provides a summary of tracking implementation across the site.
 */

import fs from 'fs'
import path from 'path'

const viewsDir = 'src/views'
const componentsDir = 'src/components'

console.log('🔍 FESTIVALL ANALYTICS AUDIT\n')

// Track which files have analytics
const analyticsFiles = {
  withAnalytics: [],
  withoutAnalytics: [],
  needsManualUpdate: []
}

// Track what events are being fired
const trackedEvents = {
  'page_view': [],
  'purchase': [],
  'add_to_cart': [],
  'select_content': [],
  'form_submit': [],
  'video_start': [],
  'begin_checkout': []
}

// Scan all Vue files
const scanDirectory = (dir) => {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    if (file.endsWith('.vue')) {
      const filePath = path.join(dir, file)
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Check if file has analytics
      const hasAnalytics = content.includes('logEvent') || content.includes('analyticsMixin')
      const isScriptSetup = content.includes('<script setup>')
      
      if (hasAnalytics) {
        analyticsFiles.withAnalytics.push({ file, path: filePath })
        
        // Extract tracked events
        const logEventMatches = content.match(/logEvent\([^,]+,\s*['"]([^'"]+)['"]/g)
        if (logEventMatches) {
          logEventMatches.forEach(match => {
            const eventMatch = match.match(/['"]([^'"]+)['"]/)
            if (eventMatch) {
              const eventName = eventMatch[1]
              if (trackedEvents[eventName]) {
                trackedEvents[eventName].push(file)
              }
            }
          })
        }
      } else {
        if (isScriptSetup) {
          analyticsFiles.needsManualUpdate.push({ file, path: filePath, reason: 'Script Setup' })
        } else {
          analyticsFiles.withoutAnalytics.push({ file, path: filePath })
        }
      }
    }
  })
}

// Scan directories
scanDirectory(viewsDir)

console.log('📊 ANALYTICS COVERAGE REPORT')
console.log('=' .repeat(50))

console.log(`\\n✅ Files WITH Analytics (${analyticsFiles.withAnalytics.length}):`)
analyticsFiles.withAnalytics.forEach(({ file }) => {
  console.log(`   • ${file}`)
})

console.log(`\\n❌ Files WITHOUT Analytics (${analyticsFiles.withoutAnalytics.length}):`)
analyticsFiles.withoutAnalytics.forEach(({ file }) => {
  console.log(`   • ${file}`)
})

console.log(`\\n⚠️  Files Needing Manual Update (${analyticsFiles.needsManualUpdate.length}):`)
analyticsFiles.needsManualUpdate.forEach(({ file, reason }) => {
  console.log(`   • ${file} (${reason})`)
})

console.log('\\n🎯 TRACKED EVENTS SUMMARY')
console.log('=' .repeat(50))

Object.entries(trackedEvents).forEach(([eventName, files]) => {
  console.log(`\\n${eventName.toUpperCase()} (${files.length} files):`)
  if (files.length > 0) {
    files.forEach(file => console.log(`   • ${file}`))
  } else {
    console.log('   (No files tracking this event)')
  }
})

console.log('\\n🚀 RECOMMENDATIONS')
console.log('=' .repeat(50))

// High priority recommendations
const highPriorityFiles = [
  'HomeView.vue',
  'ReunionTicketsView.vue', 
  'ReunionView.vue',
  'ReunionLineupView.vue',
  'ReunionContactView.vue'
]

const missingHighPriority = analyticsFiles.withoutAnalytics
  .concat(analyticsFiles.needsManualUpdate)
  .filter(({ file }) => highPriorityFiles.includes(file))

if (missingHighPriority.length > 0) {
  console.log('\\n🔥 HIGH PRIORITY - Add analytics to:')
  missingHighPriority.forEach(({ file }) => {
    console.log(`   • ${file}`)
  })
}

// Event recommendations
console.log('\\n📈 CONSIDER TRACKING:')
if (trackedEvents.purchase.length === 0) {
  console.log('   • Purchase events (e-commerce tracking)')
}
if (trackedEvents.form_submit.length < 2) {
  console.log('   • More form submissions (contact, applications)')
}
if (trackedEvents.video_start.length === 0) {
  console.log('   • Video engagement events')
}

console.log('\\n💡 FIREBASE ANALYTICS TIPS:')
console.log('   • Data appears in Firebase Console within 24-48 hours')
console.log('   • Use DebugView in Firebase for real-time testing')
console.log('   • Set up Conversion Goals for ticket purchases')
console.log('   • Create Custom Audiences based on page views')

console.log('\\n🎉 Analytics audit complete!')

// Generate analytics summary file
const summary = {
  timestamp: new Date().toISOString(),
  coverage: {
    total_files: analyticsFiles.withAnalytics.length + analyticsFiles.withoutAnalytics.length + analyticsFiles.needsManualUpdate.length,
    with_analytics: analyticsFiles.withAnalytics.length,
    without_analytics: analyticsFiles.withoutAnalytics.length,
    needs_manual_update: analyticsFiles.needsManualUpdate.length
  },
  events: trackedEvents,
  recommendations: {
    high_priority: missingHighPriority.map(f => f.file),
    missing_events: Object.entries(trackedEvents).filter(([, files]) => files.length === 0).map(([event]) => event)
  }
}

fs.writeFileSync('analytics-audit.json', JSON.stringify(summary, null, 2))
console.log('\\n📄 Detailed report saved to: analytics-audit.json')
