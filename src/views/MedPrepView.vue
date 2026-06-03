<template>
  <div class="medprep-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="capacity-badge">3–5 STUDENTS / YEAR &nbsp;·&nbsp; BY APPLICATION ONLY</div>
        <h1>Dr. Prasenjit Das<span class="md-suffix">, MD</span></h1>
        <p class="tagline">
          I've been accepted. I've been rejected. I've helped others get in.<br />
          Now I'm offering something rare: a real doctor, on your side, from application to acceptance.
        </p>
        <RouterLink to="/medprep/apply" class="btn-primary">Apply for a Spot</RouterLink>
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
      </div>
    </section>

    <!-- TRACK RECORD -->
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
      </div>
    </section>

    <!-- COI DISCLOSURE -->
    <section class="coi">
      <div class="section-inner">
        <h2>Conflict of Interest: Read This</h2>
        <p>
          I am a faculty member at the University of Saskatchewan College of Medicine. This is
          a genuine credential and a genuine constraint.
        </p>
        <p>
          If you are accepted into this program and are applying to the U of S College of Medicine,
          you will be required to submit a formal recusal request ensuring I am not involved in
          evaluating your application. You will sign a written agreement to this effect.
          This is mandatory. Not optional, not a formality.
        </p>
        <p>
          This protects you. It protects the admissions process. And it protects me.
        </p>
      </div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta">
      <div class="section-inner">
        <h2>There are 3–5 spots.<br />Is one of them yours?</h2>
        <RouterLink to="/medprep/apply" class="btn-primary">Submit Your Application</RouterLink>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">

const credentials = [
  {
    icon: '🎓',
    title: 'MD, College of Medicine',
    sub: 'University of Saskatchewan',
  },
  {
    icon: '🏥',
    title: 'Residency, Rural & Remote Northern BC',
    sub: 'Trained in communities where generalism is survival',
  },
  {
    icon: '🔬',
    title: 'BSc, Physiology & Pharmacology',
    sub: 'The scientific foundation before medicine',
  },
  {
    icon: '⚖️',
    title: 'Law School Admission',
    sub: 'Got in. Chose medicine. Knows what elite academic performance looks like across disciplines.',
  },
  {
    icon: '📚',
    title: 'Faculty, College of Medicine',
    sub: 'I teach at the school many of you are applying to',
  },
  {
    icon: '📌',
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

/* ─── Responsive ─────────────────────────────────────────── */
@media (max-width: 600px) {
  .section-inner {
    padding: 56px 18px;
  }
  .hero {
    padding: 72px 18px 60px;
  }
}
</style>
