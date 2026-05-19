/**
 * inject-og-tags.js
 *
 * Post-build script: copies dist/index.html into a subdirectory for each
 * public route and injects the correct hardcoded OG / Twitter meta tags.
 *
 * This fixes the issue where social-media crawlers (Facebook, Twitter, etc.)
 * don't execute JavaScript and therefore only ever see the fallback tags in
 * the root index.html.
 *
 * Run automatically via the `build-only` npm script after `vite build`.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '../dist')
const BASE = 'https://festivall.ca'

// Plain-text strings — escapeHtml() handles & → &amp; etc. before injection
const ROUTES = [
  // ── Festivall ─────────────────────────────────────────────────────────────
  {
    path: '/about',
    title: 'About Prasenjit Das M.D. — Festivall',
    description:
      'Physician by day, DJ by night. Prasenjit Das is a composer, software developer, and festival organizer based in Saskatchewan, Canada.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/about`,
  },
  {
    path: '/services',
    title: 'Services — Festivall',
    description:
      'Sound tech, web development, art & photography, event production, and more. Creative services from the Festivall network.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/services`,
  },
  {
    path: '/testimonials',
    title: 'Testimonials — Festivall',
    description: 'See what people are saying about Festivall events, services, and the community.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/testimonials`,
  },
  {
    path: '/art-and-photography',
    title: 'Art & Photography — Festivall',
    description: 'Visual art and photography from the Festivall community and festivals.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/art-and-photography`,
  },
  {
    path: '/coding-and-webdev',
    title: 'Coding & Web Dev — Festivall',
    description: 'Web development and coding projects from the Festivall network.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/coding-and-webdev`,
  },
  {
    path: '/soundtech',
    title: 'Sound Tech — Festivall',
    description:
      'Sound engineering, audio production, and technical expertise from the Festivall network.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/soundtech`,
  },
  // ── Reunion ───────────────────────────────────────────────────────────────
  {
    path: '/reunion',
    title: 'Reunion Festival 2026 — Near Saskatoon, SK',
    description:
      'A grassroots electronic music festival in Saskatchewan. September 4–7, 2026. Camping, live music, and community. Weekend passes from $200 CAD.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunion`,
  },
  {
    path: '/reunionlineup',
    title: 'Reunion Festival 2026 — Full Lineup',
    description:
      'Full artist lineup for Reunion 2026. Browse by day, star your favourites, and plan your festival weekend near Saskatoon.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunionlineup`,
  },
  {
    path: '/reuniontickets',
    title: 'Buy Reunion Festival 2026 Tickets',
    description:
      'Weekend passes from $200 CAD — September 4–7, 2026 near Saskatoon, SK. Camping, music, meals. Bitcoin discount available.',
    image: `${BASE}/reuniontickets_preview.png`,
    url: `${BASE}/reuniontickets`,
  },
  {
    path: '/reunionapplication',
    title: 'Apply to Reunion 2026 | Festivall',
    description:
      'Artists, volunteers, workshop facilitators, art installers & vendors — apply to be part of Reunion 2026.',
    image: `${BASE}/reunionapplication_preview.png`,
    url: `${BASE}/reunionapplication`,
  },
  {
    path: '/reunionfaq',
    title: 'Reunion Festival 2026 — FAQ',
    description: 'Frequently asked questions about Reunion Festival 2026 near Saskatoon, SK.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunionfaq`,
  },
  {
    path: '/reunionamenities',
    title: 'Reunion Festival 2026 — Amenities',
    description: 'Everything you need to know about amenities at Reunion Festival 2026.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunionamenities`,
  },
  {
    path: '/reunionfamily',
    title: 'Reunion Festival 2026 — Family',
    description:
      'Family-friendly information for Reunion Festival 2026 near Saskatoon, SK.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunionfamily`,
  },
  {
    path: '/reunionteam',
    title: 'Reunion Festival 2026 — Team',
    description: 'Meet the team behind Reunion Festival 2026.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunionteam`,
  },
  {
    path: '/reunionsoundsystem',
    title: 'Reunion Festival 2026 — Sound System',
    description: 'Learn about the sound system at Reunion Festival 2026.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunionsoundsystem`,
  },
  {
    path: '/reunioncontact',
    title: 'Contact Reunion Festival — Festivall',
    description: 'Get in touch with the Reunion Festival team.',
    image: `${BASE}/reunion_2026_preview.png`,
    url: `${BASE}/reunioncontact`,
  },
  // ── Blessed Coast ─────────────────────────────────────────────────────────
  {
    path: '/blessedcoast',
    title: 'Blessed Coast Festival — Squamish, BC',
    description:
      'A celebration of coastal arts and culture in Squamish, BC. Music, community, and the beauty of the BC coast.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/blessedcoast`,
  },
  {
    path: '/blessedcoastlineup',
    title: 'Blessed Coast Festival — Lineup',
    description: 'Full artist lineup for Blessed Coast Festival in Squamish, BC.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/blessedcoastlineup`,
  },
  // ── Fuse / Das Record / Synergistic ───────────────────────────────────────
  {
    path: '/fusecollective',
    title: 'Fuse Collective — Electronic Music Artists & Promoters',
    description:
      'A Canadian collective of artists, musicians, producers, DJs, and promoters united to grow the electronic music scene.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/fusecollective`,
  },
  {
    path: '/dasrecord',
    title: 'Das Record — Prasenjit Das M.D.',
    description:
      'Physician, software developer, composer, DJ, and festival organizer. Explore the creative and professional world of Prasenjit Das.',
    image: `${BASE}/dasrecord_preview.png`,
    url: `${BASE}/dasrecord`,
  },
  {
    path: '/synergistic',
    title: 'Synergistic — Event Production & Consultation',
    description:
      'Event production, consultation, and partnerships. Connect with Synergistic to bring your vision to life.',
    image: `${BASE}/festivall_preview.png`,
    url: `${BASE}/synergistic`,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function injectOgTags(html, route) {
  const { title, description, image, url } = route

  // Replace <title>...</title>
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)

  // Map of meta attribute identifier → new value
  const tags = {
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': url,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
  }

  for (const [key, value] of Object.entries(tags)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Matches: property="og:title" content="OLD"  or  name="twitter:title" content="OLD"
    html = html.replace(
      new RegExp(`((?:property|name)="${escapedKey}"\\s+content=")[^"]*(")`,'g'),
      (_, before, after) => `${before}${escapeHtml(value)}${after}`,
    )
  }

  return html
}

// ── Main ───────────────────────────────────────────────────────────────────

const template = readFileSync(join(distDir, 'index.html'), 'utf-8')

for (const route of ROUTES) {
  const dir = join(distDir, route.path)
  mkdirSync(dir, { recursive: true })
  const html = injectOgTags(template, route)
  writeFileSync(join(dir, 'index.html'), html)
  console.log(`  ✓ ${route.path}`)
}

console.log(`\n  OG tags injected for ${ROUTES.length} routes.`)
