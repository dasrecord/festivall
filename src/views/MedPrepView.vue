<template>
  <div class="medprep-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <img :src="headshot" alt="Dr. Prasenjit Das" class="hero-portrait" />
        <div class="capacity-badge">3–5 STUDENTS / YEAR &nbsp;·&nbsp; BY APPLICATION ONLY</div>
        <h1>Dr. Prasenjit Das<span class="md-suffix">, MD</span></h1>
        <p class="tagline">
          I've been accepted. I've been rejected. I've helped others get in.<br />
          Now I'm offering something rare: a real doctor, on your side, from application to acceptance.
        </p>
        <p class="hero-location">Based in Saskatoon &nbsp;·&nbsp; All coaching delivered remotely across Canada</p>
        <div class="hero-ctas">
          <RouterLink to="/medprep/apply" class="btn-primary">Apply for a Spot</RouterLink>
        </div>
      </div>
    </section>

    <!-- CREDENTIALS -->
    <section class="credentials">
      <div class="section-inner">
        <h2>Who I Am</h2>
        <div class="cred-grid">
          <div class="cred-card" v-for="cred in credentials" :key="cred.title">
            <div class="cred-icon">{{ cred.icon }}</div>
            <div class="cred-text">
              <strong>{{ cred.title }}</strong>
              <span>{{ cred.sub }}</span>
            </div>
          </div>
        </div>
        <div class="cred-links">
          <RouterLink to="/medprep/cv" class="cred-link">View Full CV →</RouterLink>
          <RouterLink to="/dasrecord" class="cred-link">See My Career Beyond Medicine →</RouterLink>
        </div>
      </div>
    </section>

    <!-- INTERDISCIPLINARY -->
    <section class="interdisciplinary">
      <div class="section-inner">
        <h2>Why an Interdisciplinary Mentor Matters</h2>
        <p>
          I am a physician. I am also a software developer, a composer, a DJ, a graphic designer,
          and the organizer of an independent music festival. I built an actual life outside of medicine,
          and I built it while becoming a doctor.
        </p>
        <p>
          Admissions committees do not reward transcripts. They reward <strong>people</strong>.
          The applicants who get in are the ones who can articulate why medicine — and not law, not research,
          not anything else they considered — and who have the texture of a real life to back that story up.
        </p>
        <p>
          Most coaches are former pre-meds who became coaches. I'm a working physician who happens to
          coach. The difference shows up in every conversation we have.
        </p>
      </div>
    </section>

    <!-- TRACK RECORD + TESTIMONIALS -->
    <section class="track-record">
      <div class="section-inner">
        <h2>The Track Record</h2>
        <p>
          Students I've worked with have been accepted to <strong>M.D. programs, D.M.D. programs, and
          Medical Residency programs</strong> across Canada. I don't work with everyone. I work with the right people.
        </p>
        <p>
          I also went unmatched my first residency cycle. I know what it costs to come back from that, and
          I know exactly how to help you avoid it.
        </p>

        <div
          class="testimonial-ticker"
          aria-label="Client testimonials"
          @mouseenter="tickerPaused = true"
          @mouseleave="tickerPaused = false"
        >
          <div class="ticker-quote-row" ref="tickerRow">
            <div class="ticker-track" :class="{ paused: tickerPaused }">
              <p
                v-for="(t, i) in tickerTestimonials"
                :key="i"
                class="ticker-quote"
                :data-index="i % testimonials.length"
                ref="quoteEls"
              >
                "{{ t.quote }}"
              </p>
            </div>
          </div>
          <cite class="ticker-cite">
            <strong>{{ testimonials[currentTestimonial].name }}</strong>
            <span>{{ testimonials[currentTestimonial].title }}</span>
          </cite>
        </div>
        <p class="testimonial-note">
          Hover to pause. Full reviews on the <RouterLink to="/testimonials">testimonials page</RouterLink>.
        </p>
      </div>
    </section>

    <!-- METHODOLOGY -->
    <section class="methodology">
      <div class="section-inner">
        <h2>How I Coach</h2>
        <p>
          <strong>I don't write your essays. I interrogate your story until you can.</strong>
          You will do more work with me than without me. That is the point.
        </p>
        <p>
          My job is to make sure that when an admissions committee reads your file or sits across
          from you in an interview, they meet the most precise, most honest, most defensible version
          of who you actually are. Not a version I invented for you.
        </p>
        <p>
          Every feedback round is direct. I will tell you what is working, what is not, and what
          you need to cut. If you want someone to flatter you, this is not the program.
        </p>
      </div>
    </section>

    <!-- SELECTION CRITERIA -->
    <section class="selection">
      <div class="section-inner">
        <h2>Who I Say Yes To</h2>
        <p class="selection-intro">
          I take 3–5 students per year because that is the number of people I can do this work for
          properly. Here is how I decide.
        </p>
        <div class="selection-grid">
          <div class="selection-col">
            <h3>What Excites Me</h3>
            <ul>
              <li>A real reason for medicine — not "I like science and helping people"</li>
              <li>Evidence you've done hard things and finished them</li>
              <li>An honest assessment of your weak spots</li>
              <li>Non-traditional paths, second-career applicants, late bloomers</li>
              <li>Applicants who have been told "no" and came back</li>
            </ul>
          </div>
          <div class="selection-col">
            <h3>What Disqualifies You</h3>
            <ul>
              <li>Looking for someone to write your essays</li>
              <li>Unwilling to be told hard truths</li>
              <li>No demonstrated commitment to medicine yet — start with The Blueprint instead</li>
              <li>Treating this as a transaction rather than a partnership</li>
            </ul>
          </div>
        </div>
        <p class="selection-floor">
          <strong>No hard GPA or MCAT floor.</strong> Numbers matter, but story matters more.
          If your numbers are below average, your story has to be above average. That is the deal.
        </p>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-it-works">
      <div class="section-inner">
        <h2>How It Works</h2>
        <div class="steps">
          <div class="step">
            <div class="step-num">01</div>
            <strong>You Apply</strong>
            <p>Fill out an exhaustive intake: your grades, your story, your goals. This is not a casual form. It is designed to reveal exactly where you stand and what you need.</p>
          </div>
          <div class="step">
            <div class="step-num">02</div>
            <strong>I Review</strong>
            <p>I personally read every application. If I believe there's a real fit and a real shot, I reach out. 3-5 students per year, no exceptions.</p>
          </div>
          <div class="step">
            <div class="step-num">03</div>
            <strong>We Work</strong>
            <p>1-on-1, from wherever you are, through every stage of your application cycle. Your acceptance is the only outcome I care about.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- WHEN TO START -->
    <section class="when-to-start">
      <div class="section-inner">
        <h2>When To Start</h2>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-marker">24+ mo out</div>
            <strong>The Blueprint</strong>
            <p>Still building GPA, MCAT, activities. We architect the next two years.</p>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker">9–12 mo out</div>
            <strong>The Campaign</strong>
            <p>Application cycle is imminent. Full-cycle support, start to interview to result.</p>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker">post-rejection</div>
            <strong>The Return</strong>
            <p>You ran a cycle and came up short. We diagnose what happened and rebuild.</p>
          </div>
          <div class="timeline-item">
            <div class="timeline-marker">multi-year</div>
            <strong>The Full Ride</strong>
            <p>You want every advantage, from now through CaRMS. No expiry date.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- COI DISCLOSURE (moved up — trust before price) -->
    <section class="coi">
      <div class="section-inner">
        <h2>Conflict of Interest: Read This First</h2>
        <p>
          I am a faculty member at the University of Saskatchewan College of Medicine. To be
          clear: I am <strong>not</strong> a member of the admissions committee, and I have no
          role in evaluating applications to the program.
        </p>
        <p>
          Where the conflict actually lives is downstream. If you are accepted to the U of S
          College of Medicine and become my student, I cannot be involved in your academic
          assessments — clinical evaluations, exams, supervisory grading, or any decision
          that affects your standing in the program.
        </p>
        <p>
          If that situation arises, you will be required to submit a formal recusal request
          to ensure I am removed from any assessment role in your training. You will sign a
          written agreement to this effect before we begin coaching. This is mandatory. Not
          optional, not a formality.
        </p>
        <p>
          This protects you. It protects the integrity of your medical training. And it protects me.
        </p>
      </div>
    </section>

    <!-- TIERS -->
    <section class="tiers">
      <div class="section-inner">
        <h2>Programs</h2>
        <p class="tiers-sub">
          Pricing is split: a small commitment deposit to start, and a success premium paid
          upon acceptance, right when your professional student line of credit becomes available.
        </p>
        <div class="tier-grid">
          <div
            class="tier-card"
            v-for="tier in tiers"
            :key="tier.name"
            :class="{ featured: tier.featured }"
          >
            <div class="tier-tag" v-if="tier.tag">{{ tier.tag }}</div>
            <h3>{{ tier.name }}</h3>
            <p class="tier-desc">{{ tier.desc }}</p>
            <ul class="tier-features">
              <li v-for="f in tier.features" :key="f">{{ f }}</li>
            </ul>
            <div class="tier-pricing">
              <div class="price-row">
                <span class="price-label">Commitment deposit</span>
                <span class="price-val">{{ tier.upfront }}</span>
              </div>
              <div class="price-row success-row">
                <span class="price-label">
                  Success premium
                  <span class="price-note">(paid on acceptance)</span>
                </span>
                <span class="price-val">{{ tier.success }}</span>
              </div>
              <div class="price-total">
                Total if accepted: <strong>{{ tier.total }}</strong>
              </div>
            </div>
          </div>
        </div>

        <p class="tier-footnote">
          The commitment deposit is non-refundable and reserves your spot. The success premium is
          only owed upon a confirmed written offer of acceptance. Installment plans available on
          request after acceptance — most students draw it from their professional student line of credit.
        </p>
      </div>
    </section>

    <!-- DELIVERABLES MATRIX -->
    <section class="deliverables">
      <div class="section-inner">
        <h2>What You're Actually Buying</h2>
        <p class="deliverables-sub">
          Tier features are activities. These are the concrete deliverables and service-level
          commitments behind them.
        </p>
        <div class="deliverables-table">
          <div class="del-row del-head">
            <div>Deliverable</div>
            <div>Blueprint</div>
            <div>Campaign</div>
            <div>Return</div>
            <div>Full Ride</div>
          </div>
          <div class="del-row" v-for="row in deliverables" :key="row.label">
            <div class="del-label">{{ row.label }}</div>
            <div>{{ row.blueprint }}</div>
            <div>{{ row.campaign }}</div>
            <div>{{ row.return_ }}</div>
            <div>{{ row.fullride }}</div>
          </div>
        </div>
        <p class="deliverables-footnote">
          <strong>* Standardized-patient practice</strong> is offered on a best-effort basis. I have
          working relationships with standardized patients through the College of Medicine and will
          attempt to arrange one or more sessions for you, but availability depends on their
          schedules and cannot be contractually guaranteed. If we cannot arrange a session, the
          equivalent time is converted into additional structured mock-interview practice with me.
        </p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq">
      <div class="section-inner">
        <h2>Questions People Actually Ask</h2>
        <div class="faq-list">
          <details class="faq-item" v-for="(q, i) in faqs" :key="i">
            <summary>{{ q.q }}</summary>
            <p>{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta">
      <div class="section-inner">
        <h2>There are 3–5 spots.<br />Is one of them yours?</h2>
        <div class="hero-ctas">
          <RouterLink to="/medprep/apply" class="btn-primary">Submit Your Application</RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import headshot from '@/assets/images/reunion_team/Prasenjit.jpg'

const credentials = [
  {
    icon: '🎓',
    title: 'MD, College of Medicine',
    sub: 'University of Saskatchewan',
  },
  {
    icon: '🏥',
    title: 'Family Medicine Residency, UBC',
    sub: 'Trained in a demanding rural, remote & northern British Columbia program — generalism where it actually matters.',
  },
  {
    icon: '🔬',
    title: 'BSc Physiology, with Distinction',
    sub: 'University of Saskatchewan — the scientific foundation before medicine.',
  },
  {
    icon: '👨‍⚕️',
    title: 'Practicing Family Physician',
    sub: 'WELL Health — hybrid practice between Vancouver, BC and Saskatoon, SK.',
  },
  {
    icon: '📚',
    title: 'Clinical Skills Teaching, U of S',
    sub: 'Taught medical students at the College of Medicine — I know what the people on the other side of your interview are looking for.',
  },
  {
    icon: '⚖️',
    title: 'Also Accepted to Law, U of S',
    sub: 'Same year as my MD acceptance. Chose medicine — but I know exactly what elite competitive admissions looks like across more than one discipline.',
  },
  {
    icon: '�',
    title: 'Research Associate, History of Medicine',
    sub: 'Worked under Dr. Erika Dyck (Tier 1 Canada Research Chair) — academic rigour outside the clinic, which is exactly what strong applicants demonstrate.',
  },
  {
    icon: '🎪',
    title: 'Co-Founder, Reunion Festival',
    sub: 'Built and run an annual independent music festival. Real-world leadership, logistics, and team-building — the texture admissions committees love and rarely see.',
  },
  {
    icon: '�📌',
    title: 'Unmatched, Then Matched',
    sub: 'Went unmatched in my first residency cycle. Came back stronger. I know both sides of that letter.',
  },
]

const tiers = [
  {
    name: 'The Blueprint',
    desc: 'For applicants 2+ years from applying. Build the right foundation before the clock starts.',
    tag: null,
    featured: false,
    features: [
      '3 strategy sessions (2 hrs each)',
      'GPA & MCAT roadmap',
      'Activity & experience gap analysis',
      'Written strategic report',
      '30-day email Q&A window',
    ],
    upfront: '$500',
    success: '$2,000',
    total: '$2,500',
  },
  {
    name: 'The Campaign',
    desc: 'Full support through one complete application cycle. First-time applicants.',
    tag: 'Most Popular',
    featured: true,
    features: [
      'Unlimited sessions through the cycle',
      'Personal statement (multiple drafts)',
      'Autobiographical sketch review',
      'CASPer preparation',
      'MMI mock sessions',
      'References strategy',
      'Post-result debrief',
    ],
    upfront: '$750',
    success: '$7,250',
    total: '$8,000',
  },
  {
    name: 'The Return',
    desc: 'You\'ve been through a cycle. You came close. Let\'s fix what\'s holding you back.',
    tag: 'Discounted',
    featured: false,
    features: [
      'Gap analysis from your previous cycle',
      'Targeted interview intensive',
      'Updated personal statement',
      'MMI + panel interview prep',
      'Strategic reapplication plan',
    ],
    upfront: '$500',
    success: '$4,000',
    total: '$4,500',
  },
  {
    name: 'The Full Ride',
    desc: 'Year-round, everything. For the candidate who wants every possible advantage.',
    tag: 'Premium',
    featured: false,
    features: [
      'Everything in The Campaign',
      'Monthly 1-on-1 sessions year-round',
      'Residency & CaRMS strategy',
      'Direct messaging access throughout',
      'Multi-year support if needed',
    ],
    upfront: '$1,500',
    success: '$11,000',
    total: '$12,500',
  },
]

const testimonials = [
  {
    name: 'Pierre Noujeim',
    title: 'Security Engineer at D3 Security',
    quote:
      'Prasenjit is the definition of multi-talented. A medical doctor, DJ, and software developer. I worked with him for over a year and a half where he oversaw the development of a nation-wide pool of artists. Organized, timely, professional, and smart. I would recommend him for any team.',
  },
  {
    name: 'Mike Saint-Jules',
    title: 'Music Producer / Engineer',
    quote:
      "Prasenjit has always demonstrated great workmanship and great spirits when working together in the studio. He's a person you can learn from, and that's the kind of person you want on your team. He has a strong passion for the music industry and his skillset outputs the right amount of soul that will entice anyone to get close to him.",
  },
  {
    name: 'Jimi Cohen',
    title: 'GUINNESS WORLD RECORD Holder · Innovating with AI',
    quote:
      "Dr. Das is the only human I've ever met who codes, produces phenomenal music, DJs like a pro AND is a licensed doctor! So much talent in this one human, I'm consistently astounded and grateful to collaborate with such a fantastic mind.",
  },
  {
    name: 'Aaron Cruz',
    title: 'Registered Social Worker · Counsellor · Post-Secondary Instructor',
    quote:
      "If you need a helping hand, guide, or knowledge on any given topic, Prasun is the man. His foundational training, knowledge, and work ethic come from achieving his Medical Doctorate — but he is much more than a doctor.",
  },
  {
    name: 'Daniel Martell-Gardiner',
    title: 'Senior Music Industry Executive & Strategist',
    quote:
      'Prasenjit Das is a highly intuitive musician, composer and accomplished pianist. His unique performance ability within the live arena and in studios can light up even the most near-complete projects. This young man knows no bounds — formidable, and a real thing of beauty to behold.',
  },
  {
    name: 'Brandon Brown',
    title: 'Curator at SolSask · Owner at Crow Carpentry',
    quote:
      "From small one-night events for 50 people to a multi-day music festival with over 40 change-overs, Prasun is one of the most passionate, committed individuals I've ever had the pleasure of working with. Technical, funky, astute, professional — truly a visionary.",
  },
  {
    name: 'Brandon Kazakoff',
    title: 'Entrepreneur',
    quote:
      'Prasun is a multifaceted individual, and has exemplary skills in anything he pursues.',
  },
  {
    name: 'Dale Monette, CPA, CA, MPAcc',
    title: 'Executive Leadership · Growth Catalyst · Entrepreneur',
    quote:
      'Prasun is a very accomplished individual — he is blessed with a truly inspiring mind.',
  },
  {
    name: 'Kala Sidhu',
    title: 'Event Organizer',
    quote:
      "Das Record is one of the most professional but, more importantly, inspired musicians I've ever worked with.",
  },
  {
    name: 'Jessica Noujeim',
    title: 'Communications Expert · Writer · Branding Specialist',
    quote:
      'Prasun is one of the most brilliant individuals I know. His mental aptitude is matched only by his warm heart and stellar communication skills.',
  },
]

// Duplicated for seamless infinite scroll
// Single-quote ticker state
const currentTestimonial = ref(0)
const tickerPaused = ref(false)
const tickerRow = ref<HTMLElement | null>(null)
const quoteEls = ref<HTMLElement[]>([])
// Duplicate quotes 3x so loop point is invisible (track translates -33.333%)
const tickerTestimonials = [...testimonials, ...testimonials, ...testimonials]

let rafId = 0
const tickActiveQuote = () => {
  const row = tickerRow.value
  if (row && quoteEls.value.length) {
    const rowRect = row.getBoundingClientRect()
    const centerX = rowRect.left + rowRect.width / 2
    let bestIdx = -1
    let bestDist = Infinity
    for (const el of quoteEls.value) {
      const r = el.getBoundingClientRect()
      // Skip elements not yet visible
      if (r.right < rowRect.left || r.left > rowRect.right) continue
      const elCenter = r.left + r.width / 2
      const dist = Math.abs(elCenter - centerX)
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = Number(el.dataset.index)
      }
    }
    if (bestIdx >= 0 && bestIdx !== currentTestimonial.value) {
      currentTestimonial.value = bestIdx
    }
  }
  rafId = requestAnimationFrame(tickActiveQuote)
}
onMounted(() => {
  rafId = requestAnimationFrame(tickActiveQuote)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})

const deliverables = [
  {
    label: 'Strategy sessions (1-on-1, video)',
    blueprint: '3 × 2 hrs',
    campaign: '8 × 1.5 hrs',
    return_: '6 × 1.5 hrs',
    fullride: '12 × 1.5 hrs + monthly check-ins',
  },
  {
    label: 'Essay / personal statement drafts',
    blueprint: '—',
    campaign: 'Up to 4 rounds',
    return_: 'Up to 3 rounds',
    fullride: 'Up to 6 rounds',
  },
  {
    label: 'Mock interviews (panel / structured)',
    blueprint: '—',
    campaign: '3 sessions',
    return_: '4 sessions',
    fullride: '6 sessions',
  },
  {
    label: 'MMI practice (standardized stations)',
    blueprint: '—',
    campaign: '2 sessions',
    return_: '3 sessions',
    fullride: '4 sessions',
  },
  {
    label: 'Standardized-patient practice',
    blueprint: '—',
    campaign: 'Best-effort *',
    return_: 'Best-effort *',
    fullride: 'Best-effort * (priority)',
  },
  {
    label: 'Feedback turnaround on submitted work',
    blueprint: '5 business days',
    campaign: '72 hours',
    return_: '72 hours',
    fullride: '48 hours',
  },
  {
    label: 'Email / message response window',
    blueprint: '30 days',
    campaign: 'Full cycle',
    return_: 'Full cycle',
    fullride: 'Year-round',
  },
  {
    label: 'Written strategic report',
    blueprint: 'Yes',
    campaign: 'Yes',
    return_: 'Yes (gap analysis)',
    fullride: 'Yes + updated yearly',
  },
  {
    label: 'CaRMS / residency strategy',
    blueprint: '—',
    campaign: '—',
    return_: '—',
    fullride: 'Included',
  },
]

const faqs = [
  {
    q: 'Do you work with IMG or international applicants?',
    a: 'Case by case. The Return tier is often the best fit for IMGs preparing for CaRMS. Apply and we can discuss.',
  },
  {
    q: 'Is this only for M.D. applications, or also dental and residency?',
    a: 'All three. I have coached successful M.D., D.M.D., and CaRMS residency applicants. The Full Ride explicitly includes CaRMS strategy.',
  },
  {
    q: 'What happens if I don\'t get accepted?',
    a: 'You owe only the commitment deposit. The success premium is structured this way deliberately — my incentives are aligned with your outcome, not your enrollment.',
  },
  {
    q: 'Why is pricing split into a deposit and a success premium?',
    a: 'Because most premed coaching is a flat fee paid upfront whether you get in or not. I think that\'s backwards. The deposit covers my time. The premium is earned only when you actually have an offer in hand.',
  },
  {
    q: 'Can I pay the success premium in installments?',
    a: 'Yes. Most students draw it from their professional student line of credit, which activates around the time of acceptance. We arrange the schedule together.',
  },
  {
    q: 'Do you write reference letters?',
    a: 'No. I help you identify, approach, and prepare your referees, but the letters themselves come from people who have supervised you in clinical, research, or academic settings.',
  },
  {
    q: 'Will you write or edit my application essays for me?',
    a: 'I will not write a single sentence of your application. I will read, question, push back, and challenge you to make it sharper. The voice on the page has to be yours — admissions readers can tell, and so can interviewers.',
  },
  {
    q: 'Where are you based? Is this in-person or remote?',
    a: 'I\'m in Saskatoon. All coaching is delivered remotely (video + email) so I can work with students across Canada without geography being a barrier.',
  },
  {
    q: 'How do I know if I\'m a fit before applying?',
    a: 'You don\'t need to. The intake form is the fit assessment. If after reading your application I don\'t think I can move the needle for you, I\'ll tell you — and I\'ll usually suggest where to spend your money instead.',
  },
]
</script>

<style scoped>
/* ─── Global Layout ─────────────────────────────────────── */
.medprep-page {
  background: #0d0d0d;
  color: #e8e8e8;
  font-family: 'Oswald', sans-serif;
  min-height: 100vh;
}

.section-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 24px;
}

h2 {
  font-size: 2rem;
  color: #ffffff;
  letter-spacing: 0.04em;
  margin-bottom: 32px;
  text-transform: uppercase;
}

/* ─── Button ─────────────────────────────────────────────── */
.btn-primary {
  display: inline-block;
  background: #c9a227;
  color: #0d0d0d;
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 14px 36px;
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover {
  background: #e0b52e;
  transform: translateY(-1px);
}
.btn-secondary {
  display: inline-block;
  background: transparent;
  color: #c9a227;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 13px 28px;
  border: 1px solid #c9a227;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-secondary:hover {
  background: #c9a227;
  color: #0d0d0d;
}
.hero-ctas {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

/* ─── Hero ───────────────────────────────────────────────── */
.hero {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
  padding: 100px 24px 80px;
}
.hero-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}
.hero-portrait {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 28px;
  display: block;
  border: 2px solid #c9a227;
  box-shadow: 0 6px 24px rgba(201, 162, 39, 0.18);
}
.hero-location {
  font-size: 0.78rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: -20px 0 32px;
}
.capacity-badge {
  display: inline-block;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: #c9a227;
  border: 1px solid #c9a227;
  padding: 6px 16px;
  margin-bottom: 28px;
  text-transform: uppercase;
}
h1 {
  font-size: clamp(2.4rem, 5vw, 4rem);
  color: #ffffff;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 20px;
  line-height: 1.1;
}
.md-suffix {
  color: #c9a227;
}
.tagline {
  font-size: 1.05rem;
  color: #b0b0b0;
  line-height: 1.7;
  margin-bottom: 40px;
  font-family: sans-serif;
  font-weight: 300;
}

/* ─── Credentials ────────────────────────────────────────── */
.credentials {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
}
.cred-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}
.cred-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  background: #181818;
  border: 1px solid #2a2a2a;
  padding: 20px;
  border-radius: 2px;
}
.cred-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
}
.cred-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cred-text strong {
  font-size: 0.9rem;
  color: #ffffff;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.cred-text span {
  font-size: 0.82rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.5;
}

/* ─── Track Record ───────────────────────────────────────── */
.track-record {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
}
.track-record p {
  font-size: 1rem;
  color: #b0b0b0;
  line-height: 1.8;
  font-family: sans-serif;
  font-weight: 300;
  max-width: 680px;
  margin-bottom: 16px;
}
.track-record .ticker-quote {
  max-width: none;
  margin: 0;
}
.track-record strong {
  color: #c9a227;
}

/* ─── How It Works ───────────────────────────────────────── */
.how-it-works {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
}
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 32px;
}
.step {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.step-num {
  font-size: 2.8rem;
  color: #2a2a2a;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}
.step strong {
  font-size: 1rem;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.step p {
  font-size: 0.88rem;
  color: #888;
  line-height: 1.7;
  font-family: sans-serif;
  font-weight: 300;
}

/* ─── Tiers ──────────────────────────────────────────────── */
.tiers {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
}
.tiers-sub {
  font-size: 0.92rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
  max-width: 680px;
  margin-bottom: 48px;
}
.tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  align-items: start;
}
.tier-card {
  background: #111111;
  border: 1px solid #2a2a2a;
  padding: 28px 24px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 2px;
  transition: border-color 0.2s;
}
.tier-card:hover {
  border-color: #444;
}
.tier-card.featured {
  border-color: #c9a227;
  background: #141208;
}
.tier-tag {
  display: inline-block;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: #c9a227;
  border: 1px solid #c9a227;
  padding: 3px 10px;
  text-transform: uppercase;
  align-self: flex-start;
}
.tier-card h3 {
  font-size: 1.1rem;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
}
.tier-desc {
  font-size: 0.82rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.6;
  margin: 0;
}
.tier-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.tier-features li {
  font-size: 0.8rem;
  color: #aaa;
  font-family: sans-serif;
  font-weight: 300;
  padding-left: 16px;
  position: relative;
  line-height: 1.4;
}
.tier-features li::before {
  content: '-';
  position: absolute;
  left: 0;
  color: #444;
}
.tier-pricing {
  border-top: 1px solid #2a2a2a;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.price-label {
  font-size: 0.72rem;
  color: #666;
  font-family: sans-serif;
  font-weight: 300;
  flex: 1;
  line-height: 1.4;
}
.price-note {
  display: block;
  font-size: 0.67rem;
  color: #555;
  font-style: italic;
}
.price-val {
  font-size: 0.88rem;
  color: #e8e8e8;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.success-row .price-val {
  color: #c9a227;
}
.price-total {
  font-size: 0.78rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  margin-top: 4px;
}
.price-total strong {
  color: #ffffff;
}

/* ─── COI ────────────────────────────────────────────────── */
.coi {
  background: #0a0a0a;
  border-top: 1px solid #c9a227;
  border-bottom: 1px solid #2a2a2a;
}
.coi h2 {
  color: #c9a227;
}
.coi p {
  font-size: 0.92rem;
  color: #999;
  line-height: 1.8;
  font-family: sans-serif;
  font-weight: 300;
  max-width: 680px;
  margin-bottom: 12px;
}

/* ─── Final CTA ──────────────────────────────────────────── */
.final-cta {
  background: #0d0d0d;
}
.final-cta .section-inner {
  text-align: center;
}
.final-cta h2 {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  color: #ffffff;
  line-height: 1.3;
  margin-bottom: 36px;
}

/* ─── Credentials extra links ────────────────────────────── */
.cred-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 32px;
  justify-content: center;
}
.cred-link {
  font-family: sans-serif;
  font-size: 0.85rem;
  color: #c9a227;
  text-decoration: none;
  letter-spacing: 0.04em;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.cred-link:hover {
  border-bottom-color: #c9a227;
}

/* ─── Interdisciplinary ──────────────────────────────────── */
.interdisciplinary {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
}
.interdisciplinary p {
  font-size: 1rem;
  color: #b0b0b0;
  line-height: 1.8;
  font-family: sans-serif;
  font-weight: 300;
  max-width: 720px;
  margin-bottom: 18px;
}
.interdisciplinary strong {
  color: #ffffff;
}

/* ─── Testimonial ticker (inside track-record) ──────────── */
.testimonial-ticker {
  margin-top: 48px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ticker-quote-row {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 1.8em;
  /* Feathered edges */
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black 60px,
    black calc(100% - 60px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 60px,
    black calc(100% - 60px),
    transparent 100%
  );
}
.ticker-track {
  display: flex;
  width: max-content;
  height: 100%;
  align-items: center;
  animation: ticker-slide 180s linear infinite;
  will-change: transform;
}
.ticker-track.paused {
  animation-play-state: paused;
}
.ticker-quote {
  flex: 0 0 auto;
  font-size: 1.05rem;
  color: #e0e0e0;
  font-family: sans-serif;
  font-weight: 300;
  font-style: italic;
  line-height: 1.8;
  margin: 0;
  padding-right: 80px;
  white-space: nowrap;
}
@keyframes ticker-slide {
  from { transform: translateX(0); }
  to   { transform: translateX(-33.3333%); }
}
.ticker-cite {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-style: normal;
  border-left: 2px solid #c9a227;
  padding: 4px 0 4px 14px;
  transition: opacity 0.4s ease;
}
.ticker-cite strong {
  font-size: 0.82rem;
  color: #c9a227;
  font-family: 'Oswald', sans-serif;
  letter-spacing: 0.08em;
  font-weight: 500;
  text-transform: uppercase;
}
.ticker-cite span {
  font-size: 0.72rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.4;
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track {
    animation-duration: 600s;
  }
}
.testimonial-note {
  font-size: 0.8rem;
  color: #666;
  font-family: sans-serif;
  font-style: italic;
  margin-top: 24px;
}
.testimonial-note a {
  color: #c9a227;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}
.testimonial-note a:hover {
  border-bottom-color: #c9a227;
}

/* ─── Methodology ────────────────────────────────────────── */
.methodology {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
}
.methodology p {
  font-size: 1rem;
  color: #b0b0b0;
  line-height: 1.8;
  font-family: sans-serif;
  font-weight: 300;
  max-width: 720px;
  margin-bottom: 18px;
}
.methodology strong {
  color: #ffffff;
}

/* ─── Selection Criteria ─────────────────────────────────── */
.selection {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
}
.selection-intro {
  font-size: 0.95rem;
  color: #999;
  line-height: 1.7;
  font-family: sans-serif;
  font-weight: 300;
  max-width: 680px;
  margin-bottom: 36px;
}
.selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.selection-col {
  background: #141414;
  border: 1px solid #2a2a2a;
  padding: 24px;
  border-radius: 2px;
}
.selection-col h3 {
  font-size: 0.9rem;
  color: #c9a227;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 16px;
}
.selection-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.selection-col li {
  font-size: 0.85rem;
  color: #b0b0b0;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.6;
  padding-left: 18px;
  position: relative;
}
.selection-col li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: #c9a227;
}
.selection-floor {
  margin-top: 32px;
  padding: 18px 22px;
  background: #141208;
  border-left: 3px solid #c9a227;
  font-size: 0.9rem;
  color: #c0c0c0;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
  max-width: 720px;
}
.selection-floor strong {
  color: #ffffff;
}

/* ─── When To Start (timeline) ───────────────────────────── */
.when-to-start {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
}
.timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.timeline-item {
  background: #181818;
  border: 1px solid #2a2a2a;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 2px;
}
.timeline-marker {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  color: #c9a227;
  text-transform: uppercase;
  font-family: 'Oswald', sans-serif;
}
.timeline-item strong {
  font-size: 0.95rem;
  color: #ffffff;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.timeline-item p {
  font-size: 0.82rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.6;
  margin: 0;
}

/* ─── Tier footnote ──────────────────────────────────────── */
.tier-footnote {
  margin-top: 36px;
  font-size: 0.82rem;
  color: #777;
  font-family: sans-serif;
  font-weight: 300;
  font-style: italic;
  line-height: 1.7;
  max-width: 760px;
}
.deliverables-footnote {
  margin-top: 28px;
  font-size: 0.82rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
  max-width: 820px;
  padding: 16px 18px;
  border-left: 2px solid #c9a227;
  background: #141208;
}
.deliverables-footnote strong {
  color: #c9a227;
  font-weight: 500;
}

/* ─── Deliverables matrix ────────────────────────────────── */
.deliverables {
  background: #111111;
  border-bottom: 1px solid #2a2a2a;
}
.deliverables-sub {
  font-size: 0.92rem;
  color: #888;
  font-family: sans-serif;
  font-weight: 300;
  line-height: 1.7;
  max-width: 680px;
  margin-bottom: 36px;
}
.deliverables-table {
  border: 1px solid #2a2a2a;
  background: #0d0d0d;
  font-family: sans-serif;
  font-size: 0.82rem;
  overflow-x: auto;
}
.del-row {
  display: grid;
  grid-template-columns: 1.6fr repeat(4, 1fr);
  border-bottom: 1px solid #2a2a2a;
}
.del-row:last-child {
  border-bottom: none;
}
.del-row > div {
  padding: 12px 14px;
  color: #aaa;
  font-weight: 300;
  border-right: 1px solid #1a1a1a;
  line-height: 1.4;
}
.del-row > div:last-child {
  border-right: none;
}
.del-row.del-head {
  background: #181818;
}
.del-row.del-head > div {
  color: #c9a227;
  font-family: 'Oswald', sans-serif;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}
.del-label {
  color: #e8e8e8 !important;
  font-weight: 400 !important;
}

/* ─── FAQ ────────────────────────────────────────────────── */
.faq {
  background: #0d0d0d;
  border-bottom: 1px solid #2a2a2a;
}
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.faq-item {
  background: #141414;
  border: 1px solid #2a2a2a;
  border-radius: 2px;
  padding: 0;
}
.faq-item summary {
  padding: 18px 22px;
  cursor: pointer;
  font-family: 'Oswald', sans-serif;
  font-size: 0.95rem;
  color: #e8e8e8;
  letter-spacing: 0.03em;
  list-style: none;
  position: relative;
  padding-right: 50px;
  transition: color 0.2s;
}
.faq-item summary::-webkit-details-marker {
  display: none;
}
.faq-item summary::after {
  content: '+';
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  color: #c9a227;
  font-size: 1.4rem;
  font-weight: 300;
  transition: transform 0.2s;
}
.faq-item[open] summary::after {
  content: '−';
}
.faq-item summary:hover {
  color: #c9a227;
}
.faq-item p {
  padding: 0 22px 20px;
  margin: 0;
  font-family: sans-serif;
  font-size: 0.9rem;
  font-weight: 300;
  color: #aaa;
  line-height: 1.7;
}

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 600px) {
  .section-inner {
    padding: 56px 18px;
  }
  .hero {
    padding: 72px 18px 60px;
  }
  .hero-portrait {
    width: 130px;
    height: 130px;
  }
  .deliverables-table {
    font-size: 0.72rem;
  }
  .del-row {
    grid-template-columns: 1.4fr repeat(4, 1fr);
  }
  .selection-grid {
    grid-template-columns: 1fr;
  }
  .timeline {
    grid-template-columns: 1fr;
  }
}
</style>
