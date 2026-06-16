<template>
  <div class="cv-page">

    <!-- HEADER -->
    <header class="cv-header">
      <div class="cv-header-inner">
        <RouterLink to="/medprep" class="back-link">← Back to MedPrep</RouterLink>
        <h1>Curriculum Vitae</h1>
        <p class="cv-name">Prasenjit Das, MD, BSc</p>
        <p class="cv-tagline">
          Physician · Software Developer · Composer · DJ · Festival Organizer
        </p>
        <span class="cv-location" v-if="contact.location">{{ contact.location }}</span><br><br>

        <div class="cv-actions">
          <button class="btn-secondary" @click="printCV">Print / Save as PDF</button>
        </div>
      </div>
    </header>

    <!-- STICKY SECTION NAV -->
    <nav class="cv-nav" aria-label="CV sections">
      <div class="cv-nav-inner">
        <button
          v-for="s in sections"
          :key="s.id"
          type="button"
          class="cv-nav-item"
          :class="{ 'is-active': activeSection === s.id }"
          @click="scrollToSection(s.id)"
        >
          <span class="cv-nav-label">{{ s.label }}</span>
          <span v-if="s.count !== null" class="cv-nav-count">{{ s.count }}</span>
        </button>
      </div>
    </nav>

    <!-- BODY -->
    <main class="cv-body">

      <!-- SUMMARY -->
      <section v-if="summary" id="summary" class="cv-section">
        <h2>Professional Summary</h2>
        <p class="cv-summary">{{ summary }}</p>
      </section>

      <!-- EMPLOYMENT HISTORY -->
      <section v-if="employment.length" id="employment" class="cv-section">
        <h2>Employment History</h2>
        <div class="cv-entry" v-for="(e, i) in employment" :key="`emp-${i}`">
          <div class="entry-head">
            <strong>{{ e.role }}</strong>
            <span class="entry-date">{{ e.dates }}</span>
          </div>
          <div class="entry-sub" v-if="e.org">
            {{ e.org }}<span v-if="e.location"> · {{ e.location }}</span>
          </div>
          <p v-if="e.text" class="entry-notes">{{ e.text }}</p>
          <ul v-if="e.bullets && e.bullets.length" class="entry-bullets">
            <li v-for="(b, j) in e.bullets" :key="j">{{ b }}</li>
          </ul>
        </div>
      </section>

      <!-- EDUCATION -->
      <section v-if="education.length" id="education" class="cv-section">
        <h2>Education</h2>
        <div class="cv-entry" v-for="(e, i) in education" :key="`edu-${i}`">
          <div class="entry-head">
            <strong>{{ e.credential }}</strong>
            <span class="entry-date">{{ e.dates }}</span>
          </div>
          <div class="entry-sub" v-if="e.institution">
            {{ e.institution }}<span v-if="e.location"> · {{ e.location }}</span>
          </div>
          <p v-if="e.text" class="entry-notes">{{ e.text }}</p>
        </div>
      </section>

      <!-- ACADEMIC HONORS -->
      <section v-if="academicHonors.length" id="honors" class="cv-section">
        <h2>Academic Honors & Achievements</h2>
        <ul class="cv-list">
          <li v-for="(a, i) in academicHonors" :key="`ah-${i}`">
            <strong>{{ a.title }}</strong>
            <span v-if="a.year" class="entry-date-inline"> — {{ a.year }}</span>
            <span v-if="a.body"> · {{ a.body }}</span>
            <p v-if="a.notes" class="entry-notes inline-note">{{ a.notes }}</p>
          </li>
        </ul>
      </section>

      <!-- MUSICAL AWARDS -->
      <section v-if="musicalAwards.length" id="music-awards" class="cv-section">
        <h2>Musical Awards</h2>
        <ul class="cv-list">
          <li v-for="(a, i) in musicalAwards" :key="`ma-${i}`">
            <strong>{{ a.title }}</strong>
            <span v-if="a.year" class="entry-date-inline"> — {{ a.year }}</span>
            <span v-if="a.body"> · {{ a.body }}</span>
            <p v-if="a.notes" class="entry-notes inline-note">{{ a.notes }}</p>
          </li>
        </ul>
      </section>

      <!-- ARTISTIC QUALIFICATIONS -->
      <section v-if="artisticQualifications.length" id="artistic" class="cv-section">
        <h2>Artistic Qualifications</h2>
        <ul class="cv-list">
          <li v-for="(q, i) in artisticQualifications" :key="`aq-${i}`">
            <strong>{{ q.title }}</strong>
            <span v-if="q.body"> · {{ q.body }}</span>
            <span v-if="q.year" class="entry-date-inline"> ({{ q.year }})</span>
          </li>
        </ul>
      </section>

      <!-- SHOW HISTORY -->
      <section id="shows" class="cv-section">
        <h2>Show History</h2>
        <div v-if="shows.length">
          <div class="show-stats">
            <div class="stat"><strong>{{ showStats.total }}</strong><span>shows</span></div>
            <div class="stat"><strong>{{ showStats.uniqueVenues }}</strong><span>venues</span></div>
            <div class="stat"><strong>{{ showStats.uniqueCities }}</strong><span>cities</span></div>
            <div class="stat"><strong>{{ showStats.yearRange }}</strong><span>career span</span></div>
          </div>
          <div class="show-controls">
            <input
              v-model="showFilter"
              type="text"
              placeholder="Filter by venue, city, title, year, or tag…"
              class="show-filter"
            />
            <div class="show-meta">
              <span class="show-count">{{ filteredShows.length }} / {{ shows.length }}</span>
              <button type="button" class="show-toggle" @click="expandAll">expand</button>
              <button type="button" class="show-toggle" @click="collapseAll">collapse</button>
            </div>
          </div>
          <div class="show-years">
            <div
              v-for="group in groupedShows"
              :key="group.year"
              class="show-year"
              :class="{ 'is-open': isYearOpen(group.year) }"
            >
              <button type="button" class="show-year-head" @click="toggleYear(group.year)">
                <span class="show-year-caret">{{ isYearOpen(group.year) ? '-' : '+' }}</span>
                <span class="show-year-label">{{ group.year }}</span>
                <span class="show-year-count">{{ group.shows.length }}</span>
              </button>
              <ul v-if="isYearOpen(group.year)" class="show-list">
                <li v-for="(s, i) in group.shows" :key="`${group.year}-${i}`" class="show-item">
                  <span class="show-item-date">{{ s.displayDate.replace(/,\s*\d{4}.*$/, '') }}</span>
                  <span class="show-item-title">{{ s.title }}</span>
                  <span v-if="s.venue" class="show-item-venue">· {{ s.venue }}</span>
                  <span v-if="s.city" class="show-item-city">· {{ s.city }}</span>
                  <span v-if="s.tags && s.tags.length" class="show-item-tags">
                    <span v-for="t in s.tags" :key="t" class="show-item-dot" :title="`#${t}`"></span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <p class="show-footnote">
            Last updated {{ showStats.generated.slice(0, 10) }}.
          </p>
        </div>
        <p v-else class="entry-notes">
          Show history coming soon — see selected highlights on the
          <RouterLink to="/about">about page</RouterLink>.
        </p>
      </section>

      <!-- VOLUNTEERISM -->
      <section v-if="volunteerism.length" id="volunteerism" class="cv-section">
        <h2>Volunteerism</h2>
        <div class="cv-entry" v-for="(v, i) in volunteerism" :key="`vol-${i}`">
          <div class="entry-head">
            <strong>{{ v.role }}</strong>
            <span class="entry-date">{{ v.dates }}</span>
          </div>
          <div class="entry-sub" v-if="v.org">
            {{ v.org }}<span v-if="v.location"> · {{ v.location }}</span>
          </div>
          <p v-if="v.text" class="entry-notes">{{ v.text }}</p>
        </div>
      </section>

      <!-- CURRENT ACTIVITIES (from /about) -->
      <section v-if="currentActivities.length" id="current" class="cv-section">
        <h2>Current Activities</h2>
        <ul class="cv-list">
          <li v-for="(a, i) in currentActivities" :key="`ca-${i}`">
            <strong>{{ a.label }}</strong>
            <span v-if="a.detail"> — {{ a.detail }}</span>
          </li>
        </ul>
      </section>

      <!-- LINKS / FURTHER READING -->
      <section v-if="links.length" id="links" class="cv-section">
        <h2>Further Reading</h2>
        <ul class="cv-list">
          <li v-for="(l, i) in links" :key="`lk-${i}`">
            <a :href="l.url" target="_blank" rel="noopener">
              <strong>{{ l.label }}</strong>
            </a>
            <span v-if="l.note"> — {{ l.note }}</span>
          </li>
        </ul>
      </section>

      <!-- REFERENCES -->
      <section id="references" class="cv-section">
        <h2>References</h2>
        <p class="entry-notes">Available on request.</p>
      </section>

    </main>

    <footer class="cv-footer">
      <p>Last updated {{ lastUpdated }}</p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useHead } from '@vueuse/head'

useHead({
  title: 'CV — Dr. Prasenjit Das, MD | MedPrep',
  meta: [
    { name: 'description', content: 'Curriculum vitae for Dr. Prasenjit Das, MD — physician, freelance clinical teacher at the University of Saskatchewan College of Medicine, composer, DJ, and festival organizer.' },
  ]
})

const lastUpdated = 'June 2026'

const contact = {
  location: 'Saskatoon, SK, Canada (clinical work in Vancouver, BC)',
  email: 'medprep@festivall.ca',
  website: 'https://festivall.ca/medprep',
  websiteLabel: 'festivall.ca/medprep',
}

// ══════════════════════════════════════════════════════════════
// ── EDIT BELOW — paste your CV content into these arrays ─────
// ══════════════════════════════════════════════════════════════

const summary = ''
// e.g. 'Physician with a appointment at the U of S College of Medicine.
//       Software developer, composer, and festival organizer. Interdisciplinary by design.'

// ── 1. EMPLOYMENT HISTORY ────────────────────────────────────
// Free-form: dates + a paragraph of text. Bullets optional.
type Employment = {
  role: string
  org?: string
  location?: string
  dates: string
  text?: string
  bullets?: string[]
}
const employment: Employment[] = [
  {
    role: 'Family Physician',
    org: 'WELL Health Medical Clinics',
    location: 'Vancouver, BC (in-person + virtual)',
    dates: 'Jul 2021 - Present',
    text: 'Full-scope family medicine: in-person clinical work in Vancouver supplemented by virtual care delivered remotely',
  },
  {
    role: 'Family Medicine Resident (Postgraduate)',
    org: 'University of British Columbia, Faculty of Medicine',
    location: 'British Columbia',
    dates: 'Jul 2017 - Sep 2020',
  },
  {
    role: 'Clinical Skills Teacher',
    org: 'University of Saskatchewan, Undergraduate Medical Education',
    location: 'Saskatoon, SK',
    dates: 'Sep 2016 - Jun 2017',
  },
  {
    role: 'Vice President, Talent',
    org: 'Rapture Events',
    location: 'Vancouver, BC',
    dates: 'Jun 2015 - Jun 2017',
  },
  {
    role: 'Music Editor and A&R',
    org: 'Electronic Architects',
    location: 'Leeds, UK',
    dates: '',
  },
  {
    role: 'Co-Founder',
    org: 'Reunion Festival',
    location: 'Saskatchewan',
    dates: 'Annual',
    text: 'Grassroots reconciliation initiative — co-founded and organized.',
  },
  {
    role: 'Research Associate',
    org: 'University of Saskatchewan',
    location: 'Saskatoon, SK',
    dates: '',
    text: 'Supervised by Dr. Erika Dyck, Canada Research Chair in the History of Medicine.',
  },
  {
    role: 'Independent Business Owner',
    org: 'Das Record',
    location: 'Saskatoon, SK',
    dates: 'Ongoing',
    text: 'Piano, electronic music production, composition, and DJ services.',
  },
  {
    role: 'Instructor — Digital Production & DJ Academy',
    org: 'Long & McQuade University, Saskatoon',
    location: 'Saskatoon, SK',
    dates: '2016',
  },
  {
    role: 'Songwriter & Co-Producer',
    org: 'Mike Saint Jules (internationally acclaimed producer/DJ)',
    dates: '2016 - Present',
  },
  {
    role: 'Medical Office Assistant',
    org: 'Erindale Health Centre',
    location: 'Saskatoon, SK',
    dates: '2009 - 2013',
  },
  {
    role: 'Deputy Returning Officer',
    org: 'Elections Canada — Saskatoon-Blackstrap',
    location: 'Saskatoon, SK',
    dates: '2011',
  },
  {
    role: 'Piano Teacher',
    location: 'Saskatoon, SK',
    dates: '2005 - 2009',
    text: 'Taught students aged 4 and older, including autistic and special-needs children.',
  },
]

// ── 2. EDUCATION ─────────────────────────────────────────────
type Education = {
  credential: string
  institution: string
  location?: string
  dates: string
  text?: string
}
const education: Education[] = [
  {
    credential: 'Doctor of Medicine (MD)',
    institution: 'University of Saskatchewan, College of Medicine',
    location: 'Saskatoon, SK',
    dates: 'Sep 2011 - May 2015',
  },
  {
    credential: 'B.Sc. Physiology, with Distinction',
    institution: 'University of Saskatchewan',
    location: 'Saskatoon, SK',
    dates: 'Sep 2007 - May 2011',
  },
  {
    credential: 'Advanced Placement Program',
    institution: 'Walter Murray Collegiate Institute',
    location: 'Saskatoon, SK',
    dates: 'Sep 2003 - May 2007',
  },
]

// ── 3. ACADEMIC HONORS & ACHIEVEMENTS ────────────────────────
type Honor = { title: string; year?: string; body?: string; notes?: string }
const academicHonors: Honor[] = [
  {
    title: 'UBC Certificate of Excellence',
    body: 'Winner, Michael Smith Science Challenge — ranked top 3% of science and physics student competitors in Canada. Presented by the Faculty of Science.',
  },
  {
    title: 'University of Regina “Cum Honore - Health” Award',
    body: 'For Science Innovation: "Pharmacogenomics — the Healthcare Superhero."',
  },
  {
    title: 'Genome Prairie Award',
    body: 'For contributions to genomics research in Saskatchewan.',
  },
  {
    title: 'Millennium Scholarship',
    body: 'Awarded for academic excellence.',
  },
  {
    title: 'Independent Research Project, Pediatrics',
  },
  {
    title: 'Most Promising Startup Venture',
    year: '2014',
    body: 'Hacking Health Technology and Innovation Summit.',
  },
  {
    title: 'Best Overall Delegation',
    body: 'Saskatchewan Model United Nations.',
  },
  {
    title: 'First Place Speaker & First Place Team',
    body: 'E.C. Leslie Provincial Debate Tournament.',
  },
  {
    title: 'Saskatchewan Delegate, Canada-Wide Science Fair',
    body: 'CWSF Calgary, AB. Presented by the Youth Science Foundation.',
  },
  {
    title: 'National Math Contest Award recipient',
  },
  {
    title: 'Pythagoras Mathematics Contest',
    body: 'Ranked within the top provincial quartile.',
  },
  {
    title: 'Pascal Mathematics Contest',
    body: 'Ranked within the top national quartile.',
  },
  {
    title: 'Gauss Mathematics Contest',
    body: 'Ranked within the top national quartile.',
  },
  {
    title: 'Captain, Team Saskatchewan — All-Star Nationals Soccer Tournament',
    body: 'Trois-Rivières, QC. Led team to Saskatchewan’s highest finish at the tournament.',
  },
]

// ── 3. MUSICAL AWARDS ────────────────────────────────────────
const musicalAwards: Honor[] = [
  {
    title: '5-Time Mid-Western Canadian Piano Champion',
    body: 'Regina, SK · Saskatoon, SK · Winnipeg, MB — through Technics Music Academy.',
  },
  {
    title: 'Grand Winner, National Youth Talent Finals',
    year: '2005',
    body: 'Placed 1st overall. Quebec City, QC.',
  },
  {
    title: 'Winner, Saskatchewan Youth Talent Search',
    body: 'Saskatoon, SK.',
  },
  {
    title: 'Nation-Wide Variety Show Winner',
    body: 'Calgary, AB.',
  },
  {
    title: 'DJ Performance with Naughty by Nature',
    body: 'Shared stage with the Grammy Award-winning group. Vancouver, BC.',
  },
  {
    title: 'Highest Mark in Saskatchewan, Royal Conservatory of Music',
    body: 'First Class Honours with Distinction.',
  },
]

// ── 4. ARTISTIC QUALIFICATIONS ───────────────────────────────
type Qualification = { title: string; body?: string; year?: string }
const artisticQualifications: Qualification[] = [
  {
    title: 'Classically Trained Pianist',
    body: 'Royal Conservatory of Music program.',
  },
  {
    title: 'Signed to Armada Music — Future Sound of Egypt',
    body: 'A&R by Aly & Fila.',
  },
  {
    title: 'Founder, Das Record',
    body: 'Music production & performance firm — grossed $25K in its first year.',
  },
  {
    title: 'Artist in Residence — Saskatoon Clubs',
    body: 'Residencies across multiple venues; 500+ hours of live performance.',
  },
  {
    title: '#1 on ReverbNation Regional Electronica Charts',
  },
  {
    title: 'Electronic Music Production Mastery',
    body: 'Correspondence course — Point Blank Music School, London, England.',
  },
  {
    title: 'Indian Classical Music Foundation',
    body: 'Background training with a focus on vocals and rhythm.',
  },
]

// ── 5. SHOW HISTORY ──────────────────────────────────────────
// Generated from src/data/show_history.csv via
//   node scripts/parse-show-history.js
// Re-run that script after updating the CSV.
import showData from '@/data/shows.json'
type Show = {
  date: string
  displayDate: string
  title: string
  venue: string
  city: string
  fullVenue: string
  time: string
  days: number
  tags: string[]
}
const shows: Show[] = (showData.shows as Show[]) ?? []
const showStats = showData.stats as {
  total: number
  uniqueVenues: number
  uniqueCities: number
  yearRange: string
  generated: string
}

// ── 6. VOLUNTEERISM ──────────────────────────────────────────
type Volunteer = {
  role: string
  org?: string
  location?: string
  dates: string
  text?: string
}
const volunteerism: Volunteer[] = [
  {
    role: 'Volunteer Excursion — Amazon River Basin',
    location: 'Ecuador',
    dates: '',
    text: 'Taught English and helped build sanitation infrastructure in remote communities.',
  },
  {
    role: 'Outreach Performance & Dance Workshops',
    org: 'Cosmopolitan Industries',
    location: 'Saskatoon, SK',
    dates: '',
    text: 'Performance and workshop programming for adults with intellectual disabilities.',
  },
  {
    role: 'Digital Production & DJ Clinic',
    org: 'Das Record × Long & McQuade University',
    location: 'Saskatoon, SK',
    dates: '',
  },
  {
    role: 'Performance Fundraising — School Build, DRC',
    location: 'Democratic Republic of Congo (beneficiary)',
    dates: '',
    text: 'Performed in fundraising events for the construction of a school.',
  },
  {
    role: 'Performance Fundraising — Pink Wig Foundation',
    org: 'Cervical cancer charity',
    dates: '',
  },
  {
    role: 'Performance Fundraising — Miles for Smiles & Saskatoon Children’s Hospital',
    dates: '',
  },
  {
    role: 'Performance Fundraising — Saskatchewan Marathon',
    dates: '',
  },
  {
    role: 'Performance Fundraising — AIDS Saskatoon',
    dates: '',
  },
  {
    role: 'Founder — “Hampers from the Heart”',
    location: 'Saskatoon, SK',
    dates: '',
    text: 'Donation campaign for inner-city children.',
  },
  {
    role: 'Heart of the City Piano Teacher',
    org: 'McNab Park — Director of Lessons',
    location: 'Saskatoon, SK',
    dates: '2 years',
  },
  {
    role: 'Volunteer Performer',
    org: 'Saskatchewan International Folkfest',
    location: 'Saskatoon, SK',
    dates: '4 years',
  },
  {
    role: 'Orientation Volunteer',
    org: 'University of Saskatchewan',
    location: 'Saskatoon, SK',
    dates: '4+ years',
  },
  {
    role: 'Experience US Volunteer',
    org: 'University of Saskatchewan',
    location: 'Saskatoon, SK',
    dates: '4+ years',
  },
  {
    role: 'Open House Volunteer',
    org: 'College of Medicine, University of Saskatchewan',
    location: 'Saskatoon, SK',
    dates: '2+ years',
  },
  {
    role: 'Brain Week Volunteer',
    org: 'Head injury prevention workshops and awareness campaign',
    location: 'Saskatoon, SK',
    dates: '2 years',
  },
]

// ── 7. CURRENT ACTIVITIES (sourced from /about) ──────────────
// Pre-populated from your About page. Edit freely.
const currentActivities = [
  { label: 'Software developer', detail: 'for small businesses and entrepreneurs' },
  { label: 'Rotation DJ', detail: 'Bokeh on the Plaza, Saskatoon' },
  { label: 'Composer & producer', detail: 'for the internationally acclaimed Mike Saint-Jules' },
  { label: 'DevOps engineer', detail: 'for independent electronic music festivals' },
  { label: 'Freelance graphic designer', detail: 'for brands and startups' },
  { label: 'Festival organizer', detail: 'Reunion Festival — independent SK electronic music festival' },
]

// ── 8. LINKS / FURTHER READING ───────────────────────────────
const links = [
  {
    label: 'Spotify — artistic repertoire',
    url: 'https://open.spotify.com/playlist/2RXN8qyLntleaVvFNxQsQs',
    note: 'Curated selection of original productions and DJ work',
  },
  {
    label: 'Interactive career timeline',
    url: 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=1KjYDRCbhGGFOsdqawJ5OowtHBn5JTEBEsayhtpIa23A&font=UnicaOne-Vollkorn&lang=en&initial_zoom=3&start_at_slide=75',
    note: 'KnightLab timeline spanning education, music, medicine, and tech',
  },
  {
    label: 'Festivall.ca — umbrella site',
    url: 'https://festivall.ca/about',
    note: 'Music ventures, projects, and current bookings',
  },
  {
    label: 'Das Record',
    url: 'https://festivall.ca/dasrecord',
    note: 'Doctor / Coder / Musician — the three-pillar overview',
  },
]

// ══════════════════════════════════════════════════════════════
// ── END EDIT REGION ──────────────────────────────────────────
// ══════════════════════════════════════════════════════════════

// Show filter
const showFilter = ref('')
const filteredShows = computed(() => {
  const q = showFilter.value.trim().toLowerCase()
  if (!q) return shows
  return shows.filter(s =>
    [s.date, s.displayDate, s.title, s.venue, s.city, s.fullVenue, ...(s.tags || [])]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q))
  )
})

// Group by year, newest first
const groupedShows = computed(() => {
  const groups = new Map<string, Show[]>()
  for (const s of filteredShows.value) {
    const yr = s.date.slice(0, 4) || 'Undated'
    if (!groups.has(yr)) groups.set(yr, [])
    groups.get(yr)!.push(s)
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, list]) => ({ year, shows: list }))
})

// Open state — all years collapsed by default
const openYears = ref<Set<string>>(new Set())
const toggleYear = (y: string) => {
  const next = new Set(openYears.value)
  next.has(y) ? next.delete(y) : next.add(y)
  openYears.value = next
}
const isYearOpen = (y: string) => {
  // When filtering, auto-expand all matching groups
  if (showFilter.value.trim()) return true
  return openYears.value.has(y)
}
const expandAll = () => {
  openYears.value = new Set(groupedShows.value.map(g => g.year))
}
const collapseAll = () => {
  openYears.value = new Set()
}

const printCV = () => {
  window.print()
}

// ── Section navigation ───────────────────────────────────────
const sections = computed(() => [
  { id: 'summary',      label: 'Summary',     count: null,                          show: !!summary },
  { id: 'employment',   label: 'Employment',  count: employment.length,             show: employment.length > 0 },
  { id: 'education',    label: 'Education',   count: education.length,              show: education.length > 0 },
  { id: 'honors',       label: 'Honors',      count: academicHonors.length,         show: academicHonors.length > 0 },
  { id: 'music-awards', label: 'Music',       count: musicalAwards.length,          show: musicalAwards.length > 0 },
  { id: 'artistic',     label: 'Artistic',    count: artisticQualifications.length, show: artisticQualifications.length > 0 },
  { id: 'shows',        label: 'Shows',       count: shows.length,                  show: true },
  { id: 'volunteerism', label: 'Volunteer',   count: volunteerism.length,           show: volunteerism.length > 0 },
  { id: 'current',      label: 'Current',     count: currentActivities.length,      show: currentActivities.length > 0 },
  { id: 'links',        label: 'Links',       count: links.length,                  show: links.length > 0 },
  { id: 'references',   label: 'References',  count: null,                          show: true },
].filter(s => s.show))

const activeSection = ref<string>('')

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 70
  window.scrollTo({ top, behavior: 'smooth' })
}

let observer: IntersectionObserver | null = null
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) activeSection.value = visible[0].target.id
    },
    { rootMargin: '-80px 0px -65% 0px', threshold: 0 }
  )
  for (const s of sections.value) {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  }
})
onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<style scoped>
.cv-page {
  background: #0d0d0d;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
  min-height: 100vh;
  padding-bottom: 60px;
}

/* ─── Header ─────────────────────────────────────────────── */
.cv-header {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
  padding: 60px 24px 40px;
}
.cv-header-inner {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}
.back-link {
  display: inline-block;
  font-family: sans-serif;
  font-size: 0.82rem;
  color: #888;
  text-decoration: none;
  margin-bottom: 24px;
  letter-spacing: 0.04em;
  transition: color 0.2s;
}
.back-link:hover {
  color: #c9a227;
}
.cv-header h1 {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  color: #ffffff;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 8px;
}
.cv-name {
  font-size: 1.2rem;
  color: #c9a227;
  letter-spacing: 0.06em;
  font-family: 'Oswald', sans-serif;
  margin: 0 0 8px;
}
.cv-tagline {
  font-family: sans-serif;
  font-size: 0.82rem;
  color: #999;
  font-weight: 300;
  letter-spacing: 0.04em;
  margin: 0 0 18px;
}

.cv-location {
  font-family: sans-serif;
  font-size: 0.78rem;
  color: #888;
  font-weight: 300;
  margin: 0 0 28px;
}

.cv-contact {
  font-family: sans-serif;
  font-size: 0.85rem;
  color: #888;
  font-weight: 300;
  margin: 0 0 28px;
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}
.cv-contact a {
  color: #c9a227;
  text-decoration: none;
}
.cv-contact a:hover {
  text-decoration: underline;
}
.cv-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn-secondary {
  display: inline-block;
  background: transparent;
  color: #c9a227;
  font-family: 'Oswald', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 10px 22px;
  border: 1px solid #c9a227;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-secondary:hover {
  background: #c9a227;
  color: #0d0d0d;
}

/* ─── Sticky section nav ─────────────────────────────────── */
.cv-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(13, 13, 13, 0.85);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border-bottom: 1px solid #1c1c1c;
}
.cv-nav-inner {
  max-width: 1080px;
  margin: 0 auto;
  padding: 8px 16px;
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  scroll-behavior: smooth;
}
.cv-nav-inner::-webkit-scrollbar { display: none; }
.cv-nav-item {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid transparent;
  color: #888;
  font-family: sans-serif;
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 999px;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.cv-nav-item:hover {
  color: #c9a227;
  border-color: #2a2a2a;
}
.cv-nav-item.is-active {
  color: #0d0d0d;
  background: #c9a227;
  border-color: #c9a227;
}
.cv-nav-count {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.62rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
.cv-nav-item.is-active .cv-nav-count {
  opacity: 0.85;
}

/* Section scroll offset so anchors clear sticky nav */
.cv-section { scroll-margin-top: 70px; }

/* ─── Body ───────────────────────────────────────────────── */
.cv-body {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 0;
}
.cv-section {
  margin-bottom: 48px;
}
.cv-section h2 {
  font-size: 1rem;
  color: #c9a227;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #2a2a2a;
}
.cv-summary {
  font-family: sans-serif;
  font-size: 0.95rem;
  font-weight: 300;
  color: #c0c0c0;
  line-height: 1.75;
  margin: 0;
}

/* ─── Entries ────────────────────────────────────────────── */
.cv-entry {
  margin-bottom: 22px;
}
.cv-entry:last-child {
  margin-bottom: 0;
}
.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}
.entry-head strong {
  font-size: 0.95rem;
  color: #ffffff;
  letter-spacing: 0.03em;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
}
.entry-date,
.entry-date-inline {
  font-family: sans-serif;
  font-size: 0.78rem;
  color: #888;
  font-weight: 300;
}
.entry-date {
  white-space: nowrap;
}
.entry-sub {
  font-family: sans-serif;
  font-size: 0.85rem;
  color: #c9a227;
  font-weight: 400;
  margin-top: 4px;
}
.entry-notes {
  font-family: sans-serif;
  font-size: 0.86rem;
  color: #aaa;
  font-weight: 300;
  line-height: 1.7;
  margin: 8px 0 0;
}
.entry-notes.inline-note {
  margin: 4px 0 0;
  font-size: 0.82rem;
}
.entry-bullets {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.entry-bullets li {
  font-family: sans-serif;
  font-size: 0.86rem;
  color: #aaa;
  font-weight: 300;
  line-height: 1.6;
  padding-left: 16px;
  position: relative;
}
.entry-bullets li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: #c9a227;
}

/* ─── Simple list ────────────────────────────────────────── */
.cv-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cv-list li {
  font-family: sans-serif;
  font-size: 0.88rem;
  color: #c0c0c0;
  font-weight: 300;
  line-height: 1.5;
  padding-left: 16px;
  position: relative;
}
.cv-list li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: #c9a227;
}
.cv-list li strong {
  color: #ffffff;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  letter-spacing: 0.03em;
}
.cv-list li a {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted #444;
  transition: border-color 0.2s;
}
.cv-list li a:hover {
  border-bottom-color: #c9a227;
}

/* ─── Show history (compact accordion) ───────────────────── */
.show-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.show-filter {
  flex: 1;
  min-width: 220px;
  background: #141414;
  border: 1px solid #2a2a2a;
  color: #e8e8e8;
  font-family: sans-serif;
  font-size: 0.82rem;
  padding: 7px 11px;
  outline: none;
  transition: border-color 0.2s;
}
.show-filter:focus {
  border-color: #c9a227;
}
.show-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.show-count {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.72rem;
  color: #666;
  font-variant-numeric: tabular-nums;
}
.show-toggle {
  background: transparent;
  border: 1px solid #2a2a2a;
  color: #888;
  font-family: sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 9px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.show-toggle:hover {
  color: #c9a227;
  border-color: #c9a227;
}

.show-years {
  border-top: 1px solid #1a1a1a;
}
.show-year {
  border-bottom: 1px solid #1a1a1a;
}
.show-year-head {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 12px;
  background: transparent;
  border: none;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
  font-size: 0.88rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  padding: 9px 4px;
  cursor: pointer;
  text-align: left;
  transition: color 0.15s;
}
.show-year-head:hover {
  color: #c9a227;
}
.show-year-caret {
  display: inline-block;
  width: 12px;
  color: #c9a227;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.9rem;
}
.show-year-label {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}
.show-year-count {
  margin-left: auto;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.7rem;
  color: #666;
  font-weight: 300;
  letter-spacing: 0;
}
.show-year.is-open .show-year-label {
  color: #c9a227;
}

.show-list {
  list-style: none;
  padding: 2px 0 10px 24px;
  margin: 0;
}
.show-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 3px 0;
  font-family: sans-serif;
  font-size: 0.78rem;
  font-weight: 300;
  color: #888;
  line-height: 1.5;
  transition: color 0.15s;
}
.show-item:hover {
  color: #b8b8b8;
}
.show-item-date {
  flex: 0 0 72px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.72rem;
  color: #c9a227;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.show-item-title {
  color: #d8d8d8;
  font-weight: 400;
}
.show-item-venue,
.show-item-city {
  color: #777;
}
.show-item-city {
  font-style: italic;
}
.show-item-badge {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.62rem;
  color: #c9a227;
  background: #1a1a1a;
  padding: 1px 5px;
  border-radius: 2px;
  letter-spacing: 0.04em;
  align-self: center;
}
.show-item-tags {
  display: inline-flex;
  gap: 4px;
  margin-left: auto;
  padding-left: 8px;
  align-self: center;
}
.show-item-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c9a227;
  opacity: 0.55;
  cursor: help;
}
.show-item-dot:hover {
  opacity: 1;
}

/* ─── Show stats / footnote ──────────────────────────────── */
.show-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.stat {
  background: #141414;
  border-left: 2px solid #c9a227;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat strong {
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  color: #c9a227;
  letter-spacing: 0.02em;
  font-weight: 500;
  line-height: 1.1;
}
.stat span {
  font-family: sans-serif;
  font-size: 0.7rem;
  color: #888;
  font-weight: 300;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.show-footnote {
  margin-top: 12px;
  font-family: sans-serif;
  font-size: 0.72rem;
  color: #666;
  font-weight: 300;
  font-style: italic;
  line-height: 1.6;
}
.show-footnote code {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.7rem;
  color: #c9a227;
  background: #1a1a1a;
  padding: 1px 5px;
  border-radius: 2px;
  font-style: normal;
}

/* ─── Footer ─────────────────────────────────────────────── */
.cv-footer {
  max-width: 900px;
  margin: 40px auto 0;
  padding: 0 24px;
  text-align: center;
}
.cv-footer p {
  font-family: sans-serif;
  font-size: 0.75rem;
  color: #555;
  font-weight: 300;
  font-style: italic;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 640px) {
  .show-list {
    padding-left: 14px;
  }
  .show-item {
    flex-wrap: wrap;
    row-gap: 0;
  }
  .show-item-date {
    flex: 0 0 64px;
  }
  .show-item-city {
    width: 100%;
    padding-left: 72px;
  }
  .show-item-tags {
    margin-left: 0;
  }
  .show-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ─── Print styles ───────────────────────────────────────── */
@page {
  size: Letter;
  margin: 0.6in 0.65in;
}

@media print {
  /* Override base background colors enforced by some browsers */
  :root, html, body {
    background: #ffffff !important;
  }

  .cv-page {
    background: #ffffff !important;
    color: #111;
    padding: 0;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 10pt;
    line-height: 1.45;
  }

  /* Hide all interactive chrome */
  .back-link,
  .cv-actions,
  .cv-nav,
  .show-controls,
  .show-toggle,
  .show-stats,
  .show-footnote,
  .cv-footer {
    display: none !important;
  }

  /* ── Header ─────────────────────────── */
  .cv-header {
    background: #ffffff !important;
    border: none;
    border-bottom: 2px solid #111;
    padding: 0 0 14pt;
    margin-bottom: 18pt;
  }
  .cv-header-inner {
    text-align: left;
    max-width: none;
  }
  .cv-header h1 {
    display: none; /* "Curriculum Vitae" label is redundant on paper */
  }
  .cv-name {
    color: #000 !important;
    font-family: 'Georgia', serif;
    font-size: 22pt;
    font-weight: 700;
    letter-spacing: 0;
    margin: 0 0 2pt;
  }
  .cv-tagline {
    color: #444 !important;
    font-family: 'Georgia', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 10pt;
    letter-spacing: 0;
    margin: 0 0 6pt;
  }
  .cv-contact {
    color: #333 !important;
    font-family: 'Georgia', serif;
    font-size: 9.5pt;
    justify-content: flex-start;
    gap: 14pt;
    margin: 0;
  }
  .cv-contact a {
    color: #333 !important;
    text-decoration: none;
  }

  /* ── Body layout ────────────────────── */
  .cv-body {
    padding: 0;
    max-width: none;
  }
  .cv-section {
    margin-bottom: 14pt;
    page-break-inside: auto;
  }
  .cv-section h2 {
    color: #000 !important;
    font-family: 'Georgia', serif;
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: none;
    border-bottom: 1px solid #999;
    padding-bottom: 3pt;
    margin: 0 0 8pt;
  }

  /* ── Summary ────────────────────────── */
  .cv-summary {
    color: #111 !important;
    font-family: 'Georgia', serif;
    font-size: 10pt;
    line-height: 1.55;
    margin: 0;
  }

  /* ── Entries (Employment / Education / Volunteer) ── */
  .cv-entry {
    margin-bottom: 8pt;
    page-break-inside: avoid;
  }
  .entry-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12pt;
  }
  .entry-head strong {
    color: #000 !important;
    font-family: 'Georgia', serif;
    font-weight: 700;
    font-size: 10.5pt;
    letter-spacing: 0;
  }
  .entry-date,
  .entry-date-inline {
    color: #555 !important;
    font-family: 'Georgia', serif;
    font-style: italic;
    font-size: 9.5pt;
    white-space: nowrap;
  }
  .entry-sub {
    color: #333 !important;
    font-family: 'Georgia', serif;
    font-size: 10pt;
    font-style: italic;
    margin: 1pt 0 0;
  }
  .entry-notes {
    color: #222 !important;
    font-family: 'Georgia', serif;
    font-size: 9.5pt;
    line-height: 1.5;
    margin: 2pt 0 0;
  }
  .entry-bullets {
    margin: 3pt 0 0;
    gap: 1pt;
  }
  .entry-bullets li {
    color: #222 !important;
    font-family: 'Georgia', serif;
    font-size: 9.5pt;
    padding-left: 12pt;
  }
  .entry-bullets li::before {
    content: '•';
    color: #555 !important;
  }

  /* ── Simple lists (Honors / Music / Artistic / Current / Links) ── */
  .cv-list {
    gap: 4pt;
  }
  .cv-list li {
    color: #222 !important;
    font-family: 'Georgia', serif;
    font-size: 9.5pt;
    padding-left: 12pt;
    page-break-inside: avoid;
  }
  .cv-list li::before {
    content: '•';
    color: #555 !important;
  }
  .cv-list li strong {
    color: #000 !important;
    font-family: 'Georgia', serif;
    font-weight: 700;
    font-size: 9.5pt;
    letter-spacing: 0;
  }
  .cv-list li a {
    color: #111 !important;
    border-bottom: none;
    text-decoration: none;
  }
  .entry-notes.inline-note {
    color: #444 !important;
    font-size: 9pt;
    font-style: italic;
  }

  /* ── Show history (compact print form) ── */
  .show-years {
    border: none;
  }
  .show-year {
    border: none;
    margin-bottom: 6pt;
    page-break-inside: avoid;
  }
  .show-year-head {
    padding: 0;
    color: #000 !important;
    font-family: 'Georgia', serif;
    font-size: 10.5pt;
    font-weight: 700;
    letter-spacing: 0;
    cursor: default;
    pointer-events: none;
    border-bottom: 1px solid #ccc;
    padding-bottom: 2pt;
    margin-bottom: 3pt;
  }
  .show-year-caret { display: none; }
  .show-year-count {
    color: #555 !important;
    font-family: 'Georgia', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 9pt;
  }
  /* Force all year groups open in print */
  .show-year .show-list,
  .show-year:not(.is-open) .show-list {
    display: block !important;
  }
  .show-list {
    padding: 0;
    columns: 2;
    column-gap: 18pt;
  }
  .show-item {
    display: block;
    color: #222 !important;
    font-family: 'Georgia', serif;
    font-size: 9pt;
    line-height: 1.4;
    padding: 0 0 1pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .show-item-date {
    color: #555 !important;
    font-family: 'Georgia', serif;
    font-style: italic;
    font-size: 8.5pt;
    flex: none;
    margin-right: 4pt;
  }
  .show-item-title {
    color: #000 !important;
    font-weight: 700;
  }
  .show-item-venue,
  .show-item-city {
    color: #333 !important;
    font-style: normal;
  }
  .show-item-tags,
  .show-item-badge,
  .show-item-dot {
    display: none !important;
  }
}
</style>
