#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const viewsDir = 'src/views'

// Get all Reunion*.vue files
const reunionFiles = fs.readdirSync(viewsDir)
  .filter(file => file.startsWith('Reunion') && file.endsWith('.vue'))
  .filter(file => file !== 'ReunionView.vue' && file !== 'ReunionTeamView.vue' && file !== 'ReunionFamilyView.vue') // Skip already done

console.log(`Found ${reunionFiles.length} Reunion files to update:`)
reunionFiles.forEach(file => console.log(`  - ${file}`))

reunionFiles.forEach(fileName => {
  const filePath = path.join(viewsDir, fileName)
  let content = fs.readFileSync(filePath, 'utf8')
  
  // Extract the page name for analytics
  const pageName = fileName.replace('View.vue', '').replace('Reunion', 'Reunion ')
  
  // Check if it's already using <script setup> format
  if (content.includes('<script setup>')) {
    console.log(`⚠️  ${fileName} uses <script setup> - needs manual update`)
    return
  }
  
  // Check if analytics is already added
  if (content.includes('analyticsMixin') || content.includes('trackPageView')) {
    console.log(`✅ ${fileName} already has analytics`)
    return
  }
  
  // Find the script section
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    console.log(`⚠️  ${fileName} has no script section - skipping`)
    return
  }
  
  let scriptContent = scriptMatch[1]
  
  // Add analytics import
  if (!scriptContent.includes("import { analyticsMixin }")) {
    // Find the last import statement
    const importRegex = /import .* from .*/g
    let lastImportMatch
    let match
    while ((match = importRegex.exec(scriptContent)) !== null) {
      lastImportMatch = match
    }
    
    if (lastImportMatch) {
      const insertPos = lastImportMatch.index + lastImportMatch[0].length
      scriptContent = scriptContent.slice(0, insertPos) + 
        '\nimport { analyticsMixin } from \'@/mixins/analytics.js\'' +
        scriptContent.slice(insertPos)
    }
  }
  
  // Add mixins to export default
  if (!scriptContent.includes('mixins:')) {
    scriptContent = scriptContent.replace(
      /export default \{/,
      'export default {\n  mixins: [analyticsMixin],'
    )
  }
  
  // Add mounted() or update existing mounted()
  if (scriptContent.includes('mounted()')) {
    // Add tracking to existing mounted
    scriptContent = scriptContent.replace(
      /mounted\(\) \{/,
      `mounted() {\n    // Track page view\n    this.trackPageView('${pageName}', 'reunion')`
    )
  } else if (scriptContent.includes('async mounted()')) {
    // Add tracking to existing async mounted
    scriptContent = scriptContent.replace(
      /async mounted\(\) \{/,
      `async mounted() {\n    // Track page view\n    this.trackPageView('${pageName}', 'reunion')`
    )
  } else {
    // Add new mounted() method
    const dataMatch = scriptContent.match(/data\(\) \{[\s\S]*?\n  \}/)
    if (dataMatch) {
      const insertPos = dataMatch.index + dataMatch[0].length
      scriptContent = scriptContent.slice(0, insertPos) + 
        ',\n  mounted() {\n    // Track page view\n    this.trackPageView(\'' + pageName + '\', \'reunion\')\n  }' +
        scriptContent.slice(insertPos)
    } else {
      // Add before the closing of export default
      scriptContent = scriptContent.replace(
        /(\n\s*})\s*$/,
        ',\n  mounted() {\n    // Track page view\n    this.trackPageView(\'' + pageName + '\', \'reunion\')\n  }$1'
      )
    }
  }
  
  // Replace the script content in the full file
  const newContent = content.replace(
    /<script>([\s\S]*?)<\/script>/,
    `<script>${scriptContent}</script>`
  )
  
  // Write the updated file
  fs.writeFileSync(filePath, newContent)
  console.log(`✅ Updated ${fileName}`)
})

console.log('\n🎉 Analytics automation complete!')
