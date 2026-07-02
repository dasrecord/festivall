/**
 * Reunion Genre Map — Taxonomy
 *
 * Three-tier hierarchy:
 *   Pillar  → the 8 gravitational genre families
 *   Subgenre → niche styles anchored to a pillar
 *   Artist   → built dynamically from participant data
 *
 * GENRE_ALIAS_MAP keys are lowercased; values are node IDs.
 */

export const GENRE_COLORS = {
  house:    '#42E6C8',
  breaks:   '#FFB347',
  hiphop:   '#FFD166',
  techno:   '#4DA3FF',
  dnb:      '#FF5DA2',
  trance:   '#B388FF',
  dubstep:  '#7A8CFF',
  ambient:  '#7CF8D5',
}

export const PILLARS = [
  {
    id: 'pillar_house', label: 'House', color: GENRE_COLORS.house, tier: 'pillar', size: 50,
    origin: 'Chicago, USA', era: '1981 - present', bpm: '120-130',
    dna: '4/4 kick drum, soulful vocals, organ pads, TR-808/909 percussion',
    description: "Born at the Warehouse club in Chicago under DJ Frankie Knuckles, House fused electronic drum machines with soulful disco vocals and gospel-tinged organ riffs. The steady 4/4 kick and warm basslines became the universal language of dance floors worldwide.",
  },
  {
    id: 'pillar_breaks', label: 'Breaks', color: GENRE_COLORS.breaks, tier: 'pillar', size: 50,
    origin: 'UK (London, Bristol)', era: 'Early 1990s - present', bpm: '130-150',
    dna: 'Syncopated breakbeats, funk samples, filtered basslines, cut-up percussion',
    description: "Emerging from the UK rave scene, Breaks is built around syncopated, irregular drum loops sampled from funk and soul records. Its offbeat rhythms and complex percussion patterns give it a raw, kinetic energy bridging hip hop culture and electronic dance music.",
  },
  {
    id: 'pillar_hiphop', label: 'Hip Hop', color: GENRE_COLORS.hiphop, tier: 'pillar', size: 50,
    origin: 'Bronx, New York, USA', era: '1973 - present', bpm: '70-100 (boom bap) · 140+ (trap)',
    dna: 'Sampled drum breaks, MPC beatmaking, turntablism, chopped vocals',
    description: "Originating at DJ Kool Herc's Bronx block parties in 1973, Hip Hop built an entire culture — DJing, MCing, breakdancing, and graffiti — on looped drum breaks. Its MPC-driven boom bap and sample-chopping aesthetic spread globally, spawning trap, phonk, and beyond.",
  },
  {
    id: 'pillar_techno', label: 'Techno', color: GENRE_COLORS.techno, tier: 'pillar', size: 50,
    origin: 'Detroit, USA', era: '1985 - present', bpm: '130-150',
    dna: 'Repetitive 4/4, TR-909 kick, industrial synthesis, minimal melodic variation',
    description: "Forged in post-industrial Detroit by the Belleville Three (Juan Atkins, Derrick May, Kevin Saunderson) in the mid-1980s, Techno channels the alienation of factory culture into hypnotic, repetitive synthesizer architecture built for underground warehouses.",
  },
  {
    id: 'pillar_dnb', label: 'Drum and Bass', color: GENRE_COLORS.dnb, tier: 'pillar', size: 50,
    origin: 'London, UK', era: '1992 - present', bpm: '160-180',
    dna: 'Fast Amen breakbeats, rolling sub-bass, half-time feel, pitch-shifted loops',
    description: "Mutated from London jungle in 1992-94, Drum and Bass defined itself through ultra-fast Amen breakbeats and deep rolling sub-bass. Its poles — liquid (melodic) and neurofunk (aggressive, sci-fi) — represent the full emotional range of a genre built on speed and low-frequency weight.",
  },
  {
    id: 'pillar_trance', label: 'Trance', color: GENRE_COLORS.trance, tier: 'pillar', size: 50,
    origin: 'Germany (Frankfurt, Berlin)', era: '1990 - present', bpm: '128-145',
    dna: 'Arpeggiated synths, euphoric leads, build/breakdown structure, atmospheric pads',
    description: "Developed in Frankfurt and Berlin in the early 1990s, Trance is defined by its architecture: atmospheric intro, progressive build, euphoric drop, and breakdown. Soaring arpeggiated synthesizers and emotionally charged melodies create a hypnotic state of collective transcendence.",
  },
  {
    id: 'pillar_dubstep', label: 'Dubstep', color: GENRE_COLORS.dubstep, tier: 'pillar', size: 50,
    origin: 'South London (Croydon), UK', era: 'Late 1990s - present', bpm: '138-142 (70-71 half-time)',
    dna: '"Wobble bass", step-3 snare, sub-bass weight, spacious production, UK Garage roots',
    description: "Born in South London from UK Garage's rhythmic skeleton, early Dubstep was sparse, cavernous, and obsessively bass-focused. The iconic 'wobble bass' and syncopated snare on step 3 became its signature, later splitting into aggressive brostep and introspective melodic forms.",
  },
  {
    id: 'pillar_ambient', label: 'Ambient', color: GENRE_COLORS.ambient, tier: 'pillar', size: 50,
    origin: 'UK (London)', era: 'Late 1970s - present', bpm: 'Beatless or 60-100',
    dna: 'Sustained pads, reverb-heavy texture, generative loops, space over rhythm',
    description: "Codified by Brian Eno's 1978 album 'Ambient 1: Music for Airports', Ambient prioritises texture, space, and atmosphere over rhythm or melody. Inspired by tape loops and minimalism, it creates sonic environments rather than songs — music that can be wallpaper or command complete attention.",
  },
]

export const SUBGENRES = [
  // House
  { id: 'sub_deephouse',         label: 'Deep House',          pillar: 'pillar_house',   color: GENRE_COLORS.house,   bpm: '118-125', description: "The introspective, jazzy branch of House — slow basslines, organic drum textures, and chord voicings borrowed from jazz and soul." },
  { id: 'sub_techhouse',         label: 'Tech House',          pillar: 'pillar_house',   color: GENRE_COLORS.house,   bpm: '124-130', description: "A London warehouse hybrid fusing House's groove with Techno's mechanical precision — stripped back, loop-based, and built for prolonged hypnosis." },
  { id: 'sub_progressivehouse',  label: 'Progressive House',   pillar: 'pillar_house',   color: GENRE_COLORS.house,   bpm: '126-132', description: "Long-form House with gradual tension-building, subtle layering, and majestic breakdowns — often blurring the boundary into Trance." },
  { id: 'sub_afrohouse',         label: 'Afro House',          pillar: 'pillar_house',   color: GENRE_COLORS.house,   bpm: '120-126', description: "House reinfused with African percussion, tribal vocal chants, and indigenous rhythmic patterns originating from South Africa's underground." },
  { id: 'sub_garage',            label: 'UK Garage',           pillar: 'pillar_house',   color: GENRE_COLORS.house,   bpm: '130-136', description: "NY's Paradise Garage soulful House evolved into UK Garage's 2-step stutter rhythms — pitched vocal samples and off-kilter beats from late-90s London." },
  { id: 'sub_soulfulhouse',      label: 'Soulful House',       pillar: 'pillar_house',   color: GENRE_COLORS.house,   bpm: '118-124', description: "Gospel-inflected House emphasising live instrumentation, rich chord progressions, and emotionally resonant vocals over the electronic pulse." },
  // Breaks
  { id: 'sub_breakbeat',         label: 'Breakbeat',           pillar: 'pillar_breaks',  color: GENRE_COLORS.breaks,  bpm: '125-140', description: "The broad umbrella for music organised around irregular, syncopated drum loops sampled from funk, soul, and hip hop records." },
  { id: 'sub_bigbeat',           label: 'Big Beat',            pillar: 'pillar_breaks',  color: GENRE_COLORS.breaks,  bpm: '130-145', description: "Mid-90s rock/rave crossover (Chemical Brothers, Prodigy) featuring distorted breakbeats, heavy riffs, and arena-filling energy." },
  { id: 'sub_nuskool',           label: 'Nu Skool Breaks',     pillar: 'pillar_breaks',  color: GENRE_COLORS.breaks,  bpm: '135-150', description: "A 2000s breaks revival with more techno-influenced production, harder sounds, and DJ-friendly structure." },
  { id: 'sub_acidbreaks',        label: 'Acid Breaks',         pillar: 'pillar_breaks',  color: GENRE_COLORS.breaks,  bpm: '130-148', description: "Breakbeats combined with the squelching, pitch-bent resonance of the Roland TB-303 bass synthesizer." },
  // Hip Hop
  { id: 'sub_trap',              label: 'Trap',                pillar: 'pillar_hiphop',  color: GENRE_COLORS.hiphop,  bpm: '138-160', description: "Atlanta hip hop subgenre (early 2000s) built on 808 sub-bass, hi-hat triplet rolls, and street narrative — later globalised into EDM festival trap." },
  { id: 'sub_futurebass',        label: 'Future Bass',         pillar: 'pillar_hiphop',  color: GENRE_COLORS.hiphop,  bpm: '130-160', description: "Post-2012 genre merging synth-pop harmonies, vocal chops, and trap-influenced beats — characterised by major-to-minor chord modulations." },
  { id: 'sub_lofi',              label: 'Lo-Fi Hip Hop',       pillar: 'pillar_hiphop',  color: GENRE_COLORS.hiphop,  bpm: '65-90',   description: "Deliberately lo-fidelity hip hop with vinyl crackle, detuned samples, and mellow BPMs — optimised for focus, study, and nostalgia." },
  { id: 'sub_phonk',             label: 'Phonk',               pillar: 'pillar_hiphop',  color: GENRE_COLORS.hiphop,  bpm: '130-145', description: "Memphis-rooted hip hop revival using eerie vocal samples, heavy 808s, and cowbell loops — recently accelerated into drift phonk." },
  // Techno
  { id: 'sub_industrialtechno',  label: 'Industrial Techno',   pillar: 'pillar_techno',  color: GENRE_COLORS.techno,  bpm: '140-155', description: "Techno merged with noise and power electronics — distorted kicks, metallic percussion, and a confrontational, factory-floor atmosphere." },
  { id: 'sub_minimaltechno',     label: 'Minimal Techno',      pillar: 'pillar_techno',  color: GENRE_COLORS.techno,  bpm: '130-140', description: "Stripped Techno reduced to its hypnotic essence — micro-rhythmic details, deliberate space between elements, and long-form evolution." },
  { id: 'sub_hardtechno',        label: 'Hard Techno',         pillar: 'pillar_techno',  color: GENRE_COLORS.techno,  bpm: '145-160', description: "Fast, aggressive Techno with distorted kicks and screeching acid lines — bridging the Techno and Hardcore traditions." },
  { id: 'sub_electro',           label: 'Electro',             pillar: 'pillar_techno',  color: GENRE_COLORS.techno,  bpm: '100-130', description: "Roland TR-808-driven robotic funk pioneered by Afrika Bambaataa — influential on both hip hop production and European electronic music." },
  { id: 'sub_hardstyle',         label: 'Hardstyle',           pillar: 'pillar_techno',  color: GENRE_COLORS.techno,  bpm: '150-160', description: "Dutch/Italian festival genre combining distorted reverse bass kicks, pitched-down screeches, and euphoric melodies at punishing BPMs." },
  // Drum and Bass
  { id: 'sub_liquiddnb',         label: 'Liquid DnB',          pillar: 'pillar_dnb',     color: GENRE_COLORS.dnb,     bpm: '170-175', description: "The melodic, soulful branch of DnB — warm basslines, emotive strings, jazz-inflected atmospheres, and introspective lyrical themes." },
  { id: 'sub_neuro',             label: 'Neurofunk',           pillar: 'pillar_dnb',     color: GENRE_COLORS.dnb,     bpm: '170-180', description: "Dark, sci-fi DnB using experimental FM synthesis and resampling to create biological, mechanical, and alien sound design." },
  { id: 'sub_jungle',            label: 'Jungle',              pillar: 'pillar_dnb',     color: GENRE_COLORS.dnb,     bpm: '160-180', description: "The predecessor to DnB — extremely fast chopped Amen breaks, reggae basslines, and ragga vocal samples from 1992-94 London." },
  { id: 'sub_halftime',          label: 'Halftime',            pillar: 'pillar_dnb',     color: GENRE_COLORS.dnb,     bpm: '85-95',   description: "DnB decelerated to half-speed — deep bass, hip hop-influenced swing, and the meditative headnod feel of drumstep." },
  // Trance
  { id: 'sub_progressivetrance', label: 'Progressive Trance',  pillar: 'pillar_trance',  color: GENRE_COLORS.trance,  bpm: '128-138', description: "Long-form Trance with gradual melodic evolution, minimal drops, and sustained tension — built for extended journey dances." },
  { id: 'sub_uplifting',         label: 'Uplifting Trance',    pillar: 'pillar_trance',  color: GENRE_COLORS.trance,  bpm: '136-145', description: "The euphoric, anthem-driven branch of Trance — soaring leads, hands-in-the-air breakdowns, and emotionally cathartic drops." },
  { id: 'sub_psy',               label: 'Psytrance',           pillar: 'pillar_trance',  color: GENRE_COLORS.trance,  bpm: '140-148', description: "Goa-rooted Trance with psychedelic production — spiral basslines, layered sfx, and an altered-state induction optimised for open-air gatherings." },
  { id: 'sub_acidtrance',        label: 'Acid Trance',         pillar: 'pillar_trance',  color: GENRE_COLORS.trance,  bpm: '130-142', description: "Trance fused with the squelching Roland TB-303 sound — hypnotic filter-sweep resonance layered over trance architecture." },
  // Dubstep
  { id: 'sub_brostep',           label: 'Brostep',             pillar: 'pillar_dubstep', color: GENRE_COLORS.dubstep, bpm: '140-142', description: "Americanised Dubstep (Skrillex, 2010-12) — loud, aggressive, noise-heavy bass design and drop-everything energy." },
  { id: 'sub_riddim',            label: 'Riddim',              pillar: 'pillar_dubstep', color: GENRE_COLORS.dubstep, bpm: '140-142', description: "Minimalist Caribbean-influenced Dubstep — one or two bass patterns looped with syncopated precision and devastating simplicity." },
  { id: 'sub_melodicdubstep',    label: 'Melodic Dubstep',     pillar: 'pillar_dubstep', color: GENRE_COLORS.dubstep, bpm: '138-142', description: "Dubstep emphasising emotional melody, lush pads, and cinematic arrangement — combining bass weight with accessible beauty." },
  // Ambient
  { id: 'sub_chillout',          label: 'Chillout',            pillar: 'pillar_ambient', color: GENRE_COLORS.ambient, bpm: '70-100',  description: "Downtempo electronic music designed for post-rave decompression — smooth production, BPM below 100, and introspective mood." },
  { id: 'sub_synthwave',         label: 'Synthwave',           pillar: 'pillar_ambient', color: GENRE_COLORS.ambient, bpm: '80-120',  description: "1980s aesthetic revival — analog synthesizers, drum machines, neon imagery, and the sonic world of Blade Runner and Miami Vice." },
  { id: 'sub_darkambient',       label: 'Dark Ambient',        pillar: 'pillar_ambient', color: GENRE_COLORS.ambient, bpm: 'Beatless', description: "Ambient's shadow side — industrial noise, drone textures, and unsettling soundscapes designed to evoke decay and uneasy introspection." },
  // Fallback
  { id: 'sub_other',             label: 'Other',               pillar: null,             color: GENRE_COLORS.other },
]

/**
 * Maps a genre string (as stored in Firestore application.data.genre) to a node ID.
 * Keys are lowercase; values are pillar_* or sub_* IDs from above.
 */
const GENRE_ALIAS_MAP = {
  // === Application form enum values (exact + lowercase) ===
  'house':             'pillar_house',
  'techno':            'pillar_techno',
  'trance':            'pillar_trance',
  'drum and bass':     'pillar_dnb',
  'hip hop':           'pillar_hiphop',
  'garage':            'sub_garage',
  'dubstep':           'pillar_dubstep',
  'ambient':           'pillar_ambient',
  'electro':           'sub_electro',
  'synthwave':         'sub_synthwave',
  'future bass':       'sub_futurebass',
  'trap':              'sub_trap',
  'hardstyle':         'sub_hardstyle',
  'progressive':       'sub_progressivetrance',
  'chillout':          'sub_chillout',
  // === Common aliases ===
  'breaks':            'pillar_breaks',
  'breakbeat':         'sub_breakbeat',
  'big beat':          'sub_bigbeat',
  'nu skool':          'sub_nuskool',
  'nu skool breaks':   'sub_nuskool',
  'acid breaks':       'sub_acidbreaks',
  'dnb':               'pillar_dnb',
  'd&b':               'pillar_dnb',
  'drum & bass':       'pillar_dnb',
  'hiphop':            'pillar_hiphop',
  'hip-hop':           'pillar_hiphop',
  'rap':               'pillar_hiphop',
  'lo-fi':             'sub_lofi',
  'lo-fi hip hop':     'sub_lofi',
  'lofi':              'sub_lofi',
  'phonk':             'sub_phonk',
  'deep house':        'sub_deephouse',
  'tech house':        'sub_techhouse',
  'progressive house': 'sub_progressivehouse',
  'afro house':        'sub_afrohouse',
  'uk garage':         'sub_garage',
  'soulful house':     'sub_soulfulhouse',
  'industrial techno': 'sub_industrialtechno',
  'minimal techno':    'sub_minimaltechno',
  'hard techno':       'sub_hardtechno',
  'acid techno':       'pillar_techno',
  'liquid dnb':        'sub_liquiddnb',
  'liquid drum and bass': 'sub_liquiddnb',
  'neurofunk':         'sub_neuro',
  'neuro':             'sub_neuro',
  'jungle':            'sub_jungle',
  'halftime':          'sub_halftime',
  'progressive trance':'sub_progressivetrance',
  'uplifting trance':  'sub_uplifting',
  'uplifting':         'sub_uplifting',
  'psytrance':         'sub_psy',
  'psy trance':        'sub_psy',
  'psy':               'sub_psy',
  'acid trance':       'sub_acidtrance',
  'riddim':            'sub_riddim',
  'brostep':           'sub_brostep',
  'melodic dubstep':   'sub_melodicdubstep',
  'chill out':         'sub_chillout',
  'chill':             'sub_chillout',
  'dark ambient':      'sub_darkambient',
  'drone':             'sub_darkambient',
}

/**
 * Resolve a raw genre string from Firestore to a taxonomy node ID.
 * Returns 'sub_other' for unrecognized genres.
 */
export function resolveGenreToNodeId(genreString) {
  if (!genreString || !genreString.trim()) return 'sub_other'
  const raw = genreString.trim()

  // 1. Exact match (preserves original casing from form)
  if (GENRE_ALIAS_MAP[raw]) return GENRE_ALIAS_MAP[raw]

  // 2. Lowercase match
  const lower = raw.toLowerCase()
  if (GENRE_ALIAS_MAP[lower]) return GENRE_ALIAS_MAP[lower]

  // 3. Split on slash/comma/& and try each part
  const parts = lower.split(/\s*[/,&+]\s*/).map(s => s.trim()).filter(Boolean)
  for (const part of parts) {
    if (GENRE_ALIAS_MAP[part]) return GENRE_ALIAS_MAP[part]
  }

  // 4. Substring scan (e.g., "Deep House / Garage" contains "deep house")
  for (const [alias, nodeId] of Object.entries(GENRE_ALIAS_MAP)) {
    if (lower.includes(alias)) return nodeId
  }

  return 'sub_other'
}

/**
 * Cross-pillar DNA bridges — very faint links showing shared musical lineage.
 * Rendered at low opacity in the graph; shown in the focus panel as connections.
 */
export const PILLAR_BRIDGES = [
  { source: 'pillar_house',   target: 'pillar_techno',  dna: '4/4 kick-driven electronic roots' },
  { source: 'pillar_house',   target: 'pillar_breaks',  dna: 'Rhythmic syncopation & groove' },
  { source: 'pillar_house',   target: 'pillar_ambient', dna: 'Deep House atmospheric pads' },
  { source: 'pillar_techno',  target: 'pillar_trance',  dna: 'European synthesizer culture' },
  { source: 'pillar_techno',  target: 'pillar_dubstep', dna: 'Industrial bass architecture' },
  { source: 'pillar_breaks',  target: 'pillar_hiphop',  dna: 'Sample culture & break rhythm' },
  { source: 'pillar_breaks',  target: 'pillar_dnb',     dna: 'High-tempo percussion DNA' },
  { source: 'pillar_dnb',     target: 'pillar_dubstep', dna: 'Bass weight & halftime feel' },
  { source: 'pillar_trance',  target: 'pillar_ambient', dna: 'Atmospheric melodic texture' },
  { source: 'pillar_hiphop',  target: 'pillar_dubstep', dna: 'Bass culture & sub-low emphasis' },
]

/** Quick lookup: pillar ID → pillar object */
export const PILLAR_MAP = Object.fromEntries(PILLARS.map(p => [p.id, p]))
