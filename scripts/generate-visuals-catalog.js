#!/usr/bin/env node
/**
 * Generate animated WebP previews and a catalog JSON for the artist Visuals
 * Picker. Walks the local Resolume library on disk and for each .mov runs:
 *   1. ffmpeg → temp PNG frames (240px, 8fps, 2.5s, bt709-tagged)
 *   2. img2webp → animated WebP (lossy q40, mixed mode)
 *
 * Output:
 *   public/visuals/thumbs/video/<basename>.webp
 *   public/visuals/thumbs/mask/<basename>.webp
 *   src/data/visuals_catalog.json
 *
 * Requires: ffmpeg + img2webp (`brew install ffmpeg webp`).
 *
 * Usage:
 *   node scripts/generate-visuals-catalog.js
 *   node scripts/generate-visuals-catalog.js --source /Volumes/2TB_SSD/RESOLUME --force
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')

// --- args ---
const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const SOURCE_ROOT = getArg('--source', '/Volumes/2TB_SSD/RESOLUME')
const OUT_DIR    = resolve(repoRoot, getArg('--out', 'public/visuals/thumbs'))
const CATALOG    = resolve(repoRoot, 'src/data/visuals_catalog.json')
const FORCE      = args.includes('--force')

// --- library definitions ---
// Each library: folder name on disk + output subfolder name.
// IDs and thumbnail filenames mirror the source `.mov` basename verbatim, so
// downstream tools (e.g. Resolume deck XML generation) can map selections back
// to source clips with a direct filename lookup — no rename table needed.
const LIBRARIES = [
  {
    key: 'video',
    folder: 'VIDEO_LIBRARY',
    // matches "CLIP_ (1).mov", "CLIP_ (88).mp4", etc.
    matchRegex: /^CLIP_\s*\(\d+\)\.(mov|mp4)$/i,
    sortKey: (filename) => parseInt(filename.match(/\((\d+)\)/)[1], 10),
  },
  {
    key: 'mask',
    folder: 'MASK_LIBRARY',
    matchRegex: /^masks-\d+\.(mov|mp4)$/i,
    sortKey: (filename) => parseInt(filename.match(/(\d+)/)[1], 10),
  },
]

const ensureDir = (p) => { if (!existsSync(p)) mkdirSync(p, { recursive: true }) }

// --- WebP tuning ---
const WEBP_FPS       = 8
const WEBP_DURATION  = 2.5    // seconds of source captured
const WEBP_WIDTH     = 240    // px (height computed to preserve AR)
const WEBP_QUALITY   = 40     // 0–100, lossy
const FRAME_DELAY_MS = Math.round(1000 / WEBP_FPS)

const extractFrames = (inputPath, framesDir, seekSeconds) => {
  // Resolume's DXV codec tags frames with the `ycgco` colorspace, which
  // ffmpeg's auto-scaler cannot convert from. `setparams=colorspace=bt709`
  // rewrites the colorspace metadata so the scaler treats input as bt709.
  // Some DXV clips have packet decode errors past a certain point but yield
  // usable frames before that, so we ignore ffmpeg's exit status and instead
  // check whether any PNG frames were actually written.
  try {
    execFileSync('ffmpeg', [
      '-y',
      '-i', inputPath,
      '-ss', String(seekSeconds),
      '-t', String(WEBP_DURATION),
      '-vf', `setparams=colorspace=bt709,fps=${WEBP_FPS},scale=${WEBP_WIDTH}:-2,format=yuv420p`,
      join(framesDir, 'f_%03d.png'),
    ], { stdio: ['ignore', 'ignore', 'pipe'] })
  } catch {
    // Swallow decode errors; presence-of-frames check below is the real test.
  }
  const frames = readdirSync(framesDir).filter((n) => n.endsWith('.png'))
  if (frames.length === 0) throw new Error(`no frames extracted from ${inputPath} @ ${seekSeconds}s`)
}

const assembleWebp = (framesDir, outputPath) => {
  // File-level options (-loop, -mixed) must precede frame inputs.
  // Per-frame options (-d, -lossy, -q, -m) before the first frame apply to all.
  const frames = readdirSync(framesDir).filter((n) => n.endsWith('.png')).sort()
  if (frames.length === 0) throw new Error('no frames extracted')
  const args = [
    '-loop', '0',
    '-mixed',
    '-d', String(FRAME_DELAY_MS),
    '-lossy',
    '-q', String(WEBP_QUALITY),
    '-m', '6',
    ...frames.map((f) => join(framesDir, f)),
    '-o', outputPath,
  ]
  execFileSync('img2webp', args, { stdio: ['ignore', 'ignore', 'pipe'] })
}

const buildPreview = (inputPath, outputPath) => {
  const framesDir = join(tmpdir(), `vcat-${process.pid}-${Date.now()}`)
  ensureDir(framesDir)
  try {
    try {
      extractFrames(inputPath, framesDir, 0)
    } catch {
      // Short / sparse-keyframe clips can fail at the start; retry from 1s.
      rmSync(framesDir, { recursive: true, force: true })
      ensureDir(framesDir)
      extractFrames(inputPath, framesDir, 1)
    }
    assembleWebp(framesDir, outputPath)
  } finally {
    rmSync(framesDir, { recursive: true, force: true })
  }
}

const generateForLibrary = (lib) => {
  const sourceDir = join(SOURCE_ROOT, lib.folder)
  const outSubdir = join(OUT_DIR, lib.key)

  if (!existsSync(sourceDir)) {
    console.warn(`[skip] Source folder not found: ${sourceDir}`)
    return []
  }
  ensureDir(outSubdir)

  const allMatches = readdirSync(sourceDir)
    .filter((name) => !name.startsWith('._'))      // skip AppleDouble metadata
    .filter((name) => lib.matchRegex.test(name))

  // Dedupe by basename-without-extension, preferring .mov over .mp4 when both
  // exist (DXV .mov has alpha; .mp4 is a render-out copy).
  const byBase = new Map()
  for (const name of allMatches) {
    const base = name.replace(/\.(mov|mp4)$/i, '')
    const existing = byBase.get(base)
    if (!existing || (/\.mov$/i.test(name) && /\.mp4$/i.test(existing))) {
      byBase.set(base, name)
    }
  }
  const entries = [...byBase.values()]

  const items = []
  let generated = 0
  let skipped = 0

  for (const filename of entries) {
    // ID and thumb filename mirror the source basename (sans extension).
    const basename = filename.replace(/\.(mov|mp4)$/i, '')
    const id = basename
    const inputPath = join(sourceDir, filename)
    const thumbName = `${basename}.webp`
    const outputPath = join(outSubdir, thumbName)

    if (!existsSync(outputPath) || FORCE) {
      try {
        buildPreview(inputPath, outputPath)
        generated++
      } catch (err) {
        console.error(`[error] preview build failed for ${filename}:`, err.message)
        continue
      }
    } else {
      skipped++
    }

    items.push({
      id,
      filename,
      // URL-encode for safe use as <img src>; basename contains spaces & parens.
      thumb: `/visuals/thumbs/${lib.key}/${encodeURIComponent(thumbName)}`,
    })
  }

  items.sort((a, b) => lib.sortKey(a.filename) - lib.sortKey(b.filename))

  console.log(`[${lib.key}] ${items.length} clips · ${generated} generated · ${skipped} cached`)
  return items
}

const main = () => {
  console.log(`Source: ${SOURCE_ROOT}`)
  console.log(`Output: ${OUT_DIR}`)
  console.log(`Force:  ${FORCE}\n`)

  ensureDir(OUT_DIR)
  ensureDir(dirname(CATALOG))

  const catalog = { generated_at: new Date().toISOString() }
  for (const lib of LIBRARIES) {
    catalog[lib.key] = generateForLibrary(lib)
  }

  writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n')
  console.log(`\nCatalog written: ${CATALOG}`)
}

main()
