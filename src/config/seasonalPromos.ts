export type SeasonalPromoType = 'discount' | 'giveaway' | 'discount-giveaway'
export type SeasonalDiscountType = 'percent' | 'fixed'

export interface SeasonalPromo {
  id: string
  name: string
  slug: string
  enabled: boolean
  promoCode: string
  promoType: SeasonalPromoType
  discountType: SeasonalDiscountType
  discountValue: number
  maxDiscountAmount: number | null
  minimumSpend: number | null
  startsAt: string
  endsAt: string
  termsUrl: string
  prizeDescription: string
  prizeValue: number | null
  description: string
}

export const DEFAULT_SEASONAL_PROMOS: SeasonalPromo[] = [
  {
    id: 'halloween',
    name: 'Halloween',
    slug: 'trick-or-treat',
    enabled: true,
    promoCode: 'FAMILYFRIENDLY27',
    promoType: 'discount-giveaway',
    discountType: 'percent',
    discountValue: 25,
    maxDiscountAmount: null,
    minimumSpend: null,
    startsAt: '',
    endsAt: '2026-12-30',
    termsUrl: '',
    prizeDescription: 'Reimbursement of Reunion Festival 2027 ticket purchases',
    prizeValue: 500,
    description:
      'A family-friendly festival with music, food, camping, and activities for all ages.'
  },
  {
    id: 'christmas',
    name: 'Christmas',
    slug: 'merry-christmas',
    enabled: false,
    promoCode: 'MERRY27',
    promoType: 'discount-giveaway',
    discountType: 'percent',
    discountValue: 25,
    maxDiscountAmount: null,
    minimumSpend: null,
    startsAt: '',
    endsAt: '',
    termsUrl: '',
    prizeDescription: 'Reimbursement of Reunion Festival 2027 ticket purchases',
    prizeValue: 500,
    description:
      'A family-friendly festival with music, food, camping, and activities for all ages.'
  }
]

export const seasonalPromoPath = (promo: Pick<SeasonalPromo, 'slug'>) =>
  `/reunion-${promo.slug}`

export function seasonalPromoFromData(
  id: string,
  data: Record<string, unknown>,
  fallback?: SeasonalPromo
): SeasonalPromo {
  const numberValue = (value: unknown, defaultValue: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : defaultValue
  const optionalNumber = (value: unknown, defaultValue: number | null) =>
    typeof value === 'number' && Number.isFinite(value) ? value : defaultValue
  const storedSlug = typeof data.slug === 'string' ? data.slug : undefined

  return {
    id,
    name: typeof data.name === 'string' ? data.name : fallback?.name ?? id,
    slug: storedSlug && storedSlug !== id ? storedSlug : fallback?.slug ?? storedSlug ?? id,
    enabled: typeof data.enabled === 'boolean' ? data.enabled : fallback?.enabled ?? false,
    promoCode: typeof data.promoCode === 'string' ? data.promoCode : fallback?.promoCode ?? '',
    promoType:
      data.promoType === 'discount' || data.promoType === 'giveaway' || data.promoType === 'discount-giveaway'
        ? data.promoType
        : fallback?.promoType ?? 'discount-giveaway',
    discountType:
      data.discountType === 'percent' || data.discountType === 'fixed'
        ? data.discountType
        : fallback?.discountType ?? 'percent',
    discountValue: numberValue(data.discountValue, fallback?.discountValue ?? 25),
    maxDiscountAmount: optionalNumber(data.maxDiscountAmount, fallback?.maxDiscountAmount ?? null),
    minimumSpend: optionalNumber(data.minimumSpend, fallback?.minimumSpend ?? null),
    startsAt: typeof data.startsAt === 'string' ? data.startsAt : fallback?.startsAt ?? '',
    endsAt: typeof data.endsAt === 'string' ? data.endsAt : fallback?.endsAt ?? '',
    termsUrl: typeof data.termsUrl === 'string' ? data.termsUrl : fallback?.termsUrl ?? '',
    prizeDescription:
      typeof data.prizeDescription === 'string'
        ? data.prizeDescription
        : fallback?.prizeDescription ?? '',
    prizeValue: optionalNumber(data.prizeValue, fallback?.prizeValue ?? null),
    description: typeof data.description === 'string' ? data.description : fallback?.description ?? ''
  }
}
