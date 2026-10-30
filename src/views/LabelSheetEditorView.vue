<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useHead } from '@vueuse/head'

interface LabelRecord {
  [key: string]: string
}

interface LabelRect {
  x: number
  y: number
  width: number
  height: number
}

interface TemplateInfo {
  source: string
  width: number
  height: number
  labels: LabelRect[]
  name: string
}

const csvFile = ref('')
const template = ref<TemplateInfo | null>(null)
const records = ref<LabelRecord[]>([])
const headers = ref<string[]>([])
const titleField = ref('')
const detailField = ref('')
const imageField = ref('')
const currentPage = ref(0)
const selectionMode = ref(false)
const selectedCellsByPage = ref<Record<number, boolean[]>>({})
const fontFamily = ref('Arial, sans-serif')
const localFonts = ref<string[]>([])
const fontScanMessage = ref('')
const customFontFamily = ref('')
const titleSize = ref(12)
const detailSize = ref(8)
const showGuides = ref(true)
const imageFiles = ref<Record<string, string>>({})
const errorMessage = ref('')
const iconAssets = import.meta.glob<string>([
  '../assets/images/icons/front_gate.png',
  '../assets/images/icons/stage_crew.png',
  '../assets/images/icons/cleanup_crew.png',
  '../assets/images/icons/arcade.png',
  '../assets/images/icons/soundtech.png',
  '../assets/images/icons/kitchen.png',
  '../assets/images/icons/volunteer.png',
  '../assets/images/icons/showers.png',
  '../assets/images/icons/first_aid_kit.png',
  '../assets/images/icons/food.png',
], {
  eager: true,
  import: 'default',
  query: '?url',
})

const pageCount = computed(() => {
  const perPage = template.value?.labels.length ?? 0
  if (!perPage || !records.value.length) return 0

  const customizedPages = Object.keys(selectedCellsByPage.value).map(Number)
  const lastCustomizedPage = customizedPages.length ? Math.max(...customizedPages) : -1
  const maxPages = records.value.length + lastCustomizedPage + 1
  let placedRecords = 0
  let pages = 0

  while ((placedRecords < records.value.length || pages <= lastCustomizedPage) && pages < maxPages) {
    placedRecords += selectedCellCount(pages)
    pages++
  }
  return Math.max(1, pages)
})

const pageNumbers = computed(() => Array.from({ length: pageCount.value }, (_, i) => i))
const selectedCountForCurrentPage = computed(() => selectedCellCount(currentPage.value))
const labelCount = computed(() => template.value?.labels.length ?? 0)
const fontFamilyCss = computed(() =>
  fontFamily.value.includes(',') ? fontFamily.value : JSON.stringify(fontFamily.value)
)
const pageSummary = computed(() => {
  if (!records.value.length) return 'No rows loaded'
  return `${records.value.length} rows · ${pageCount.value} ${pageCount.value === 1 ? 'sheet' : 'sheets'}`
})

function parseCsv(text: string): { headers: string[]; records: LabelRecord[] } {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const character = text[i]
    if (insideQuotes) {
      if (character === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (character === '"') {
        insideQuotes = false
      } else {
        field += character
      }
    } else if (character === '"' && field.length === 0) {
      insideQuotes = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }
  if (insideQuotes) throw new Error('The CSV has an unfinished quoted field.')
  row.push(field)
  if (row.some((cell) => cell.trim())) rows.push(row)

  const firstRow = rows.shift()
  if (!firstRow?.length) throw new Error('The CSV is empty.')
  const csvHeaders = firstRow.map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim()
  )
  if (csvHeaders.some((header) => !header)) throw new Error('Every CSV column needs a header.')
  if (new Set(csvHeaders).size !== csvHeaders.length) throw new Error('CSV column names must be unique.')

  const parsedRecords = rows.map((cells) =>
    Object.fromEntries(csvHeaders.map((header, index) => [header, (cells[index] ?? '').trim()]))
  )
  return { headers: csvHeaders, records: parsedRecords }
}

function readTemplate(source: string, name: string): TemplateInfo {
  const document = new DOMParser().parseFromString(source, 'image/svg+xml')
  if (document.querySelector('parsererror') || document.documentElement.localName !== 'svg') {
    throw new Error('That file is not a valid SVG template.')
  }

  const svg = document.documentElement
  const viewBox = svg.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number)
  const width = viewBox?.[2] || Number.parseFloat(svg.getAttribute('width') || '')
  const height = viewBox?.[3] || Number.parseFloat(svg.getAttribute('height') || '')
  if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error('The SVG needs a viewBox or numeric width and height.')
  }

  const labels = Array.from(svg.querySelectorAll('rect'))
    .map((rect) => ({
      x: Number(rect.getAttribute('x') || 0),
      y: Number(rect.getAttribute('y') || 0),
      width: Number(rect.getAttribute('width') || 0),
      height: Number(rect.getAttribute('height') || 0),
    }))
    .filter((rect) =>
      Number.isFinite(rect.x) &&
      Number.isFinite(rect.y) &&
      Number.isFinite(rect.width) &&
      Number.isFinite(rect.height) &&
      rect.width > 0 &&
      rect.height > 0
    )
  if (!labels.length) throw new Error('The SVG template needs at least one <rect> label shape.')

  return {
    source: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`,
    width,
    height,
    labels,
    name,
  }
}

function applyCsv(text: string, name: string) {
  const parsed = parseCsv(text)
  headers.value = parsed.headers
  records.value = parsed.records
  csvFile.value = name
  titleField.value = parsed.headers.find((header) => /spice|name|title|label/i.test(header)) || parsed.headers[0]
  detailField.value = parsed.headers.find((header) => header !== titleField.value && /use|description|detail|subtitle/i.test(header)) ||
    parsed.headers.find((header) => header !== titleField.value) ||
    ''
  imageField.value = parsed.headers.find((header) => /image|photo|picture/i.test(header)) || ''
  currentPage.value = 0
}

async function loadDefaultFiles() {
  const [csvResponse, svgResponse] = await Promise.all([
    fetch('/spices.csv'),
    fetch('/sticker_label_template.svg'),
  ])
  if (!csvResponse.ok) throw new Error(`Could not load the sample CSV (${csvResponse.status}).`)
  if (!svgResponse.ok) throw new Error(`Could not load the sample SVG (${svgResponse.status}).`)
  const [csvText, svgText] = await Promise.all([csvResponse.text(), svgResponse.text()])
  applyCsv(csvText, 'spices.csv')
  template.value = readTemplate(svgText, 'sticker_label_template.svg')
}

async function onCsvSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  errorMessage.value = ''
  try {
    applyCsv(await file.text(), file.name)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not read the CSV file.'
  }
}

async function onTemplateSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  errorMessage.value = ''
  try {
    template.value = readTemplate(await file.text(), file.name)
    currentPage.value = 0
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not read the SVG template.'
  }
}

function onImagesSelected(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || [])
  const nextImages = { ...imageFiles.value }
  for (const [filename, url] of Object.entries(nextImages)) URL.revokeObjectURL(url)
  imageFiles.value = Object.fromEntries(files.map((file) => [file.name, URL.createObjectURL(file)]))
}

function getImageSource(value: string | undefined) {
  if (!value) return ''
  if (/^(https?:|data:image\/)/i.test(value)) return value
  const filename = value.split(/[\\/]/).pop() || value
  return imageFiles.value[filename] || iconAssets[`../assets/images/icons/${filename}`] || ''
}

function selectedCellsForPage(pageIndex: number) {
  return Array.from({ length: labelCount.value }, (_, cellIndex) =>
    selectedCellsByPage.value[pageIndex]?.[cellIndex] ?? true
  )
}

function selectedCellCount(pageIndex: number) {
  return selectedCellsForPage(pageIndex).filter(Boolean).length
}

function setCurrentPageSelection(selection: boolean[]) {
  selectedCellsByPage.value = {
    ...selectedCellsByPage.value,
    [currentPage.value]: selection,
  }
}

function setAllCellsSelected(selected: boolean) {
  setCurrentPageSelection(Array.from({ length: labelCount.value }, () => selected))
}

function invertCellSelection() {
  setCurrentPageSelection(selectedCellsForPage(currentPage.value).map((selected) => !selected))
}

function toggleCellSelection(pageIndex: number, cellIndex: number) {
  const selection = selectedCellsForPage(pageIndex)
  selection[cellIndex] = !selection[cellIndex]
  selectedCellsByPage.value = {
    ...selectedCellsByPage.value,
    [pageIndex]: selection,
  }
}

function isCellSelected(pageIndex: number, cellIndex: number) {
  return selectedCellsByPage.value[pageIndex]?.[cellIndex] ?? true
}

function recordIndexForCell(pageIndex: number, cellIndex: number) {
  if (!isCellSelected(pageIndex, cellIndex)) return -1

  let recordIndex = 0
  for (let page = 0; page < pageIndex; page++) {
    recordIndex += selectedCellCount(page)
  }
  for (let cell = 0; cell < cellIndex; cell++) {
    if (isCellSelected(pageIndex, cell)) recordIndex++
  }
  return recordIndex
}

function recordFor(pageIndex: number, labelIndex: number) {
  const recordIndex = recordIndexForCell(pageIndex, labelIndex)
  if (recordIndex < 0) return undefined
  return records.value[recordIndex]
}

function cellAriaLabel(pageIndex: number, cellIndex: number) {
  const state = isCellSelected(pageIndex, cellIndex) ? 'selected to print' : 'skipped'
  return `Sheet ${pageIndex + 1}, cell ${cellIndex + 1}, ${state}`
}

function rectStyle(rect: LabelRect) {
  if (!template.value) return {}
  const { width, height } = template.value
  return {
    left: `${(rect.x / width) * 100}%`,
    top: `${(rect.y / height) * 100}%`,
    width: `${(rect.width / width) * 100}%`,
    height: `${(rect.height / height) * 100}%`,
  }
}

function textStyle(size: number) {
  return { fontFamily: fontFamilyCss.value, fontSize: `${size}px` }
}

interface LocalFontInfo {
  family: string
}

async function loadLocalFonts() {
  fontScanMessage.value = ''
  const fontAccess = window as Window & {
    queryLocalFonts?: () => Promise<LocalFontInfo[]>
  }

  if (!fontAccess.queryLocalFonts) {
    fontScanMessage.value = 'Local font access is unavailable in this browser. You can enter a font name below.'
    return
  }

  try {
    const fonts = await fontAccess.queryLocalFonts()
    localFonts.value = [...new Set(fonts.map((font) => font.family).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b))
    fontScanMessage.value = localFonts.value.length
      ? `${localFonts.value.length} local font families found. Adobe Fonts appear when activated on this Mac.`
      : 'No local font families were returned. Enter a font name below.'
  } catch (error) {
    console.error('Unable to access local fonts:', error)
    fontScanMessage.value = 'Font access was denied or unavailable. You can enter a font name below.'
  }
}

function applyCustomFont() {
  const family = customFontFamily.value.trim()
  if (!family) return
  fontFamily.value = family
}

function printSheets() {
  window.print()
}

onMounted(async () => {
  try {
    await loadDefaultFiles()
  } catch (error) {
    console.error('Unable to load label editor sample files:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Could not load the sample files.'
  }
})

onUnmounted(() => {
  for (const url of Object.values(imageFiles.value)) URL.revokeObjectURL(url)
})

useHead({
  title: 'Printable Label Sheet Editor | Festivall',
  meta: [
    { name: 'description', content: 'Preview CSV data on an SVG label sheet and print it to PDF.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <main class="editor-page">
    <header class="editor-header">
      <div>
        <p class="eyebrow">LOCAL PRINT WORKFLOW</p>
        <h1>Label sheet editor</h1>
        <p class="intro">Load a CSV and SVG sheet, map the columns, preview, then print or save as PDF.</p>
      </div>
      <a href="/">Festivall home</a>
    </header>

    <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>

    <section class="controls" aria-label="Label editor settings">
      <label class="file-control">
        <span>CSV data</span>
        <input type="file" accept=".csv,text/csv" @change="onCsvSelected" />
        <small>{{ csvFile || 'Choose a CSV file' }}</small>
      </label>
      <label class="file-control">
        <span>SVG sheet template</span>
        <input type="file" accept=".svg,image/svg+xml" @change="onTemplateSelected" />
        <small>{{ template?.name || 'Choose an SVG template' }}</small>
      </label>
      <label class="file-control">
        <span>Optional image files</span>
        <input type="file" accept="image/*" multiple @change="onImagesSelected" />
        <small>Matched by filename to the image column</small>
      </label>

      <label>
        <span>Large text</span>
        <select v-model="titleField" :disabled="!headers.length">
          <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
        </select>
      </label>
      <label>
        <span>Smaller text</span>
        <select v-model="detailField" :disabled="!headers.length">
          <option value="">None</option>
          <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
        </select>
      </label>
      <label>
        <span>Image column</span>
        <select v-model="imageField" :disabled="!headers.length">
          <option value="">None</option>
          <option v-for="header in headers" :key="header" :value="header">{{ header }}</option>
        </select>
      </label>
      <label>
        <span>Font family</span>
        <select v-model="fontFamily">
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="sans-serif">System sans-serif</option>
          <option v-for="family in localFonts" :key="family" :value="family">{{ family }}</option>
        </select>
      </label>
      <div class="font-tools">
        <button class="font-scan-button" type="button" @click="loadLocalFonts">
          Find Mac system & Adobe fonts
        </button>
        <small v-if="fontScanMessage" role="status">{{ fontScanMessage }}</small>
        <label class="custom-font-control">
          <span>Or enter an installed font family</span>
          <div class="custom-font-input">
            <input
              v-model="customFontFamily"
              type="text"
              placeholder="e.g. Avenir Next"
              @keyup.enter="applyCustomFont"
            />
            <button type="button" @click="applyCustomFont">Apply</button>
          </div>
        </label>
      </div>
      <label class="size-control">
        <span>Large text size</span>
        <input v-model.number="titleSize" type="number" min="5" max="40" step="1" />
      </label>
      <label class="size-control">
        <span>Small text size</span>
        <input v-model.number="detailSize" type="number" min="4" max="30" step="1" />
      </label>
      <label class="check-control">
        <input v-model="showGuides" type="checkbox" />
        <span>Show label outlines in preview</span>
      </label>
    </section>

    <section class="preview-toolbar" aria-label="Preview controls">
      <div>
        <strong>{{ pageSummary }}</strong>
        <span v-if="template"> · {{ template.labels.length }} labels per sheet</span>
      </div>
      <div class="page-controls" v-if="pageCount > 1">
        <button type="button" :disabled="currentPage === 0" @click="currentPage--">Previous</button>
        <span>Sheet {{ currentPage + 1 }} of {{ pageCount }}</span>
        <button type="button" :disabled="currentPage >= pageCount - 1" @click="currentPage++">Next</button>
      </div>
      <div class="cell-selection-tools">
        <button
          type="button"
          class="selection-toggle"
          :aria-pressed="selectionMode"
          @click="selectionMode = !selectionMode"
        >
          {{ selectionMode ? 'Exit cell selection' : 'Select cells' }}
        </button>
        <div v-if="selectionMode" class="selection-actions">
          <span>
            Sheet {{ currentPage + 1 }}: {{ selectedCountForCurrentPage }} of {{ labelCount }} cells selected
          </span>
          <button type="button" @click="setAllCellsSelected(true)">Select all</button>
          <button type="button" @click="setAllCellsSelected(false)">Clear all</button>
          <button type="button" @click="invertCellSelection">Invert</button>
          <small>Selected cells receive the next records; skipped cells stay blank.</small>
        </div>
      </div>
      <button class="print-button" type="button" :disabled="!template || !records.length" @click="printSheets">
        Print / Save as PDF
      </button>
    </section>

    <section v-if="template && records.length" class="preview-stack" aria-label="Label sheet preview">
      <article
        v-for="pageIndex in pageNumbers"
        v-show="pageIndex === currentPage"
        :key="pageIndex"
        class="sheet"
        :class="{ 'selection-mode': selectionMode }"
        :style="{ aspectRatio: `${template.width} / ${template.height}` }"
      >
        <img class="sheet-template" :src="template.source" alt="" />
        <div
          v-for="(rect, labelIndex) in template.labels"
          :key="labelIndex"
          class="label"
          :class="{
            'has-image': imageField && recordFor(pageIndex, labelIndex)?.[imageField],
            'cell-included': selectionMode && isCellSelected(pageIndex, labelIndex),
            'cell-excluded': selectionMode && !isCellSelected(pageIndex, labelIndex),
            'guide-outline': showGuides,
          }"
          :style="rectStyle(rect)"
          :role="selectionMode ? 'button' : undefined"
          :tabindex="selectionMode ? 0 : undefined"
          :aria-label="selectionMode ? cellAriaLabel(pageIndex, labelIndex) : undefined"
          :aria-pressed="selectionMode ? isCellSelected(pageIndex, labelIndex) : undefined"
          @click="selectionMode && toggleCellSelection(pageIndex, labelIndex)"
          @keydown.enter.prevent="selectionMode && toggleCellSelection(pageIndex, labelIndex)"
          @keydown.space.prevent="selectionMode && toggleCellSelection(pageIndex, labelIndex)"
        >
          <img
            v-if="imageField && getImageSource(recordFor(pageIndex, labelIndex)?.[imageField])"
            class="label-image"
            :src="getImageSource(recordFor(pageIndex, labelIndex)?.[imageField])"
            alt=""
          />
          <div class="label-copy">
            <strong :style="textStyle(titleSize)">
              {{ recordFor(pageIndex, labelIndex)?.[titleField] || '' }}
            </strong>
            <span v-if="detailField" :style="textStyle(detailSize)">
              {{ recordFor(pageIndex, labelIndex)?.[detailField] || '' }}
            </span>
          </div>
        </div>
      </article>
    </section>
    <p v-else-if="template" class="empty-message">Load CSV data to see the label preview.</p>
  </main>
</template>

<style scoped>
.editor-page {
  --editor-bg: #1f1e22;
  --editor-panel: #252528;
  --editor-border: #38383d;
  --editor-text: #e0e0e0;
  --editor-muted: #929298;
  --editor-accent: var(--festivall-baby-blue, #81bdfe);
  min-height: 100vh;
  padding: 28px clamp(16px, 4vw, 48px) 48px;
  background: var(--editor-bg);
  color: var(--editor-text);
  font-family: Arial, sans-serif;
}

.editor-header,
.controls,
.preview-toolbar {
  width: min(100%, 1120px);
  margin-right: auto;
  margin-left: auto;
}

.editor-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.editor-header h1 {
  margin: 0 0 6px;
  color: var(--editor-accent);
  font-size: clamp(1.7rem, 3vw, 2.4rem);
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--editor-accent);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.intro {
  margin: 0;
  color: var(--editor-muted);
}

.editor-header > a {
  color: var(--editor-accent);
  font-weight: 700;
}

.controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--editor-border);
  border-radius: 8px;
  background: var(--editor-panel);
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.15);
}

.controls label {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  color: #c9c9ce;
  font-size: 0.85rem;
  font-weight: 700;
}

.controls input:not([type='file']):not([type='checkbox']),
.controls select {
  width: 100%;
  min-height: 38px;
  padding: 7px 9px;
  border: 1px solid #46464c;
  border-radius: 6px;
  background: var(--editor-bg);
  color: var(--editor-text);
  font: inherit;
}

.file-control {
  min-height: 88px;
  padding: 10px;
  border: 1px dashed #55555d;
  border-radius: 8px;
  background: #202024;
}

.file-control input {
  max-width: 100%;
  font-size: 0.75rem;
}

.file-control small {
  overflow: hidden;
  color: var(--editor-muted);
  font-size: 0.72rem;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-control input {
  max-width: 100px;
}

.check-control {
  flex-direction: row !important;
  align-items: center;
  align-self: end;
  padding: 10px 0;
}

.check-control input {
  width: 17px;
  height: 17px;
}

.check-control input {
  accent-color: var(--editor-accent);
}

.font-tools {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 7px;
}

.font-scan-button,
.custom-font-input button {
  min-height: 34px;
  padding: 7px 10px;
  border: 0;
  border-radius: 4px;
  background: var(--editor-accent);
  color: #1f1e22;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
}

.font-tools small {
  color: var(--editor-muted);
  font-size: 0.72rem;
  font-weight: 400;
  line-height: 1.4;
}

.custom-font-control {
  width: 100%;
  font-size: 0.76rem !important;
}

.custom-font-input {
  display: flex;
  width: 100%;
  gap: 5px;
}

.custom-font-input input {
  min-width: 0;
  width: auto !important;
  flex: 1;
  min-height: 34px;
  padding: 6px 8px;
  border: 1px solid #46464c;
  border-radius: 5px;
  background: var(--editor-bg);
  color: var(--editor-text);
  font: inherit;
}

.custom-font-input button {
  flex: 0 0 auto;
}

.error-message {
  width: min(100%, 1120px);
  margin: 0 auto 16px;
  padding: 12px 14px;
  border: 1px solid #e8b3ad;
  border-radius: 8px;
  background: #fff2f0;
  color: #8e2d24;
}

.preview-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  color: var(--editor-muted);
  font-size: 0.9rem;
}

.preview-toolbar strong {
  color: var(--editor-text);
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-controls button,
.print-button,
.selection-toggle,
.selection-actions button {
  min-height: 38px;
  padding: 8px 13px;
  border: 1px solid #46464c;
  border-radius: 7px;
  background: var(--editor-panel);
  color: var(--editor-text);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
}

.page-controls button:disabled,
.print-button:disabled {
  cursor: default;
  opacity: 0.45;
}

.print-button {
  border-color: var(--editor-accent);
  background: var(--editor-accent);
  color: #1f1e22;
}

.cell-selection-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.selection-toggle {
  border-color: var(--editor-accent);
  color: var(--editor-accent);
}

.selection-toggle[aria-pressed='true'] {
  background: #33343a;
}

.selection-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
}

.selection-actions span,
.selection-actions small {
  color: var(--editor-muted);
  font-size: 0.76rem;
}

.selection-actions small {
  flex-basis: 100%;
}

.selection-actions button {
  min-height: 32px;
  padding: 5px 9px;
  font-size: 0.78rem;
}

.preview-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  margin: 20px auto 0;
}

.sheet {
  position: relative;
  width: min(100%, 612px);
  overflow: hidden;
  background: white;
  box-shadow: 0 3px 20px rgba(0, 0, 0, 0.45);
}

.sheet-template {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.label {
  position: absolute;
  display: flex;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
  gap: 2%;
  overflow: hidden;
  padding: 2.2% 4%;
  color: #20252b;
  text-align: center;
}

.selection-mode .label {
  cursor: pointer;
}

.selection-mode .cell-included {
  box-shadow: inset 0 0 0 2px var(--editor-accent);
}

.selection-mode .cell-excluded::after {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(31, 30, 34, 0.58);
  color: white;
  content: 'SKIP';
  font-size: clamp(7px, 1.4vw, 14px);
  font-weight: 700;
  letter-spacing: 0.08em;
  pointer-events: none;
}

.label.has-image {
  justify-content: flex-start;
  text-align: left;
}

.label-image {
  width: 24%;
  max-height: 90%;
  flex: 0 0 24%;
  object-fit: contain;
}

.label-copy {
  display: flex;
  min-width: 0;
  max-height: 100%;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  overflow: hidden;
  line-height: 1.1;
}

.label-copy strong,
.label-copy span {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
}

.label-copy strong {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.label-copy span {
  color: #414141;
  -webkit-line-clamp: 4;
  line-clamp: 4;
}

.empty-message {
  width: min(100%, 1120px);
  margin: 32px auto;
  color: var(--editor-muted);
  text-align: center;
}

@page {
  size: letter portrait;
  margin: 0;
}

@media print {
  .editor-page {
    min-height: 0;
    padding: 0;
    background: white;
    color: #000;
  }

  .editor-header,
  .controls,
  .preview-toolbar,
  .error-message,
  .empty-message {
    display: none !important;
  }

  .preview-stack {
    display: block;
    margin: 0;
  }

  .sheet,
  .sheet[style] {
    display: block !important;
    width: 8.5in !important;
    height: 11in !important;
    max-width: none;
    margin: 0;
    break-after: page;
    page-break-after: always;
    box-shadow: none;
  }

  .sheet:last-child {
    break-after: auto;
    page-break-after: auto;
  }

  .selection-mode .cell-included {
    box-shadow: none;
  }

  .selection-mode .cell-excluded::after {
    display: none;
  }
}
</style>
