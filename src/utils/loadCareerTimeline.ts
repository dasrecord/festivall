import { parseCareerTimelineCsv } from './careerTimeline.js'

export interface CareerTimelineEvent {
  id: number
  year: number
  headline: string
  text: string
  group: string
  date: string
  mediaUrl: string
  spotifyEmbedUrl: string
  mediaCaption: string
  referenceImage: string
  referenceImageAlt: string
  referenceImageAttribution: string
  referenceImageLicense: string
  referenceImageLicenseUrl: string
  referenceImageSourceUrl: string
  sourceIndex: number
}

const CAREER_TIMELINE_CSV_URL = '/data/prasenjit-das-career-timeline.csv'

export async function loadCareerTimeline(): Promise<CareerTimelineEvent[]> {
  const response = await fetch(CAREER_TIMELINE_CSV_URL)
  if (!response.ok) throw new Error(`Career timeline CSV returned ${response.status}`)

  const events = parseCareerTimelineCsv(await response.text()) as CareerTimelineEvent[]
  if (events.length === 0) throw new Error('Career timeline CSV contains no dated milestones')
  return events
}
