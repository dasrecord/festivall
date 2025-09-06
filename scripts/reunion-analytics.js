#!/usr/bin/env node

/**
 * Reunion Festival Analytics (orders_2025)
 *
 * Pulls analytics from reunion_db/orders_2025 using .env config:
 * - Revenue (from total_price)
 * - Referral payouts (from referral_id_code, ticket_type, ticket_quantity)
 * - Attendance (from entrance_activity_history)
 * - Meal usage (from meal_redemption_history)
 *
 * Output: scripts/reunion-festival-analytics.txt
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore'
import fs from 'fs'
import dotenv from 'dotenv'
import process from 'process'

// Load env
dotenv.config()

// Firebase (reunion) from your .env
const ReunionConfig = {
  apiKey: process.env.VITE_APP_REUNION_API_KEY,
  authDomain: process.env.VITE_APP_REUNION_AUTH_DOMAIN,
  projectId: process.env.VITE_APP_REUNION_PROJECT_ID,
  storageBucket: process.env.VITE_APP_REUNION_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_APP_REUNION_MESSAGING_SENDER_ID,
  appId: process.env.VITE_APP_REUNION_APP_ID,
  measurementId: process.env.VITE_APP_REUNION_MEASUREMENT_ID
}

const app = initializeApp(ReunionConfig, 'reunion')
const db = getFirestore(app)

// Helpers
const asNumber = (v, def = 0) => {
  if (v === undefined || v === null || v === '') return def
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) ? n : def
}

const asInt = (v, def = 0) => {
  if (v === undefined || v === null || v === '') return def
  const n = typeof v === 'number' ? v : parseInt(v, 10)
  return Number.isFinite(n) ? n : def
}

const formatCurrency = (amount) => `$${asNumber(amount).toFixed(2)}`

const toJSDate = (t) => {
  try {
    if (!t) return null
    if (t?.toDate) return t.toDate()
    return new Date(t)
  } catch {
    return null
  }
}

const dateKey = (t) => {
  const d = toJSDate(t)
  return d ? d.toDateString() : 'Unknown Date'
}

async function fetchOrders() {
  const snap = await getDocs(collection(db, 'orders_2025'))
  const orders = []
  snap.forEach((doc) => orders.push({ id: doc.id, ...doc.data() }))
  return orders
}

async function generateAnalytics() {
  const orders = await fetchOrders()

  // Revenue
  let totalOrders = orders.length
  let totalRevenue = 0
  let paidOrders = 0
  let unpaidOrders = 0
  const paymentMethods = {}
  const byDayRevenue = {}
  const revenueDetails = [] // [{orderId, paid, payment_type, in_kind, total_price, day, counted, reason}]

  // Referrals
  const referralMap = new Map() // id_code -> { orders: n, tickets: n, earnings: n, name, email }
  const referralDetails = new Map() // id_code -> [ { orderId, paid, payment_type, ticket_type, qty, qualified, reason } ]

  // Attendance (gate)
  let ordersWithGate = 0
  let totalCheckIns = 0
  let totalCheckOuts = 0
  let currentlyOnSite = 0
  const dailyGate = {} // date -> { in, out }

  // Meals
  let ordersWithMeals = 0
  let totalMealRedemptions = 0
  const dailyMeals = {} // date -> count
  const mealService = { Lunch: 0, Dinner: 0, Other: 0 }

  for (const order of orders) {
    // Revenue
    const price = asNumber(order.total_price)
    const pTypeRaw = (order.payment_type || 'unknown')
    const pType = typeof pTypeRaw === 'string' ? pTypeRaw.toLowerCase() : pTypeRaw
    const isInKind = pType === 'inkind' || pType === 'in kind'
    const isPaid = order.paid === true || order.paid === 'true'

    const countedForRevenue = isPaid && !isInKind
    // Only count revenue for paid, non-in-kind orders
    if (countedForRevenue) {
      totalRevenue += price
      if (!paymentMethods[pType]) paymentMethods[pType] = { count: 0, revenue: 0 }
      paymentMethods[pType].count += 1
      paymentMethods[pType].revenue += price

      const day = order.timestamp ? dateKey(order.timestamp) : 'Unknown Date'
      if (!byDayRevenue[day]) byDayRevenue[day] = { orders: 0, revenue: 0 }
      byDayRevenue[day].orders += 1
      byDayRevenue[day].revenue += price
    }
    const revDay = order.timestamp ? dateKey(order.timestamp) : 'Unknown Date'
    revenueDetails.push({
      orderId: order.id_code || order.id,
      paid: !!isPaid,
      payment_type: order.payment_type || pTypeRaw,
      in_kind: isInKind,
      total_price: price,
      day: revDay,
      counted: countedForRevenue,
      reason: countedForRevenue ? 'counted' : (!isPaid ? 'unpaid' : (isInKind ? 'in-kind' : 'excluded'))
    })

    if (isPaid) {
      paidOrders++
    } else {
      unpaidOrders++
    }

    // Referrals
    if (order.referral_id_code) {
      const key = order.referral_id_code
      if (!referralMap.has(key)) referralMap.set(key, { orders: 0, tickets: 0, earnings: 0, name: '', email: '' })
      if (!referralDetails.has(key)) referralDetails.set(key, [])
      const entry = referralMap.get(key)

      // Track all orders tagged with this referrer (for context)
      entry.orders += 1

      // Prefer original_ticket_quantity for payout calc; fallback to ticket_quantity
      const qtyRaw = (order.original_ticket_quantity ?? order.ticket_quantity)
      const qty = asInt(qtyRaw)
      const qtySource = (order.original_ticket_quantity !== undefined) ? 'original_ticket_quantity' : 'ticket_quantity'

      // Normalize ticket type and compute per-ticket payout
      const ttRaw = (order.ticket_type || '') + ''
      const tt = ttRaw.trim().toLowerCase()
      let perTicket = 0
      if (tt.includes('weekend')) perTicket = 20
      else if (tt.includes('day')) perTicket = 10

      const qualified = isPaid && !isInKind && qty > 0 && perTicket > 0
      if (qualified) {
        entry.tickets += qty
        entry.earnings += perTicket * qty
      }

      referralDetails.get(key).push({
        orderId: order.id_code || order.id, // prefer short code if present
        paid: !!isPaid,
        payment_type: order.payment_type,
        ticket_type: ttRaw,
        qty,
        qty_source: qtySource,
        qualified,
        reason: qualified ? 'counted' : (!isPaid ? 'unpaid' : (isInKind ? 'in-kind' : (qty <= 0 ? 'zero-qty' : (perTicket === 0 ? 'unsupported ticket_type' : 'excluded'))))
      })
    }

    // Attendance
    const acts = Array.isArray(order.entrance_activity_history) ? order.entrance_activity_history : []
    if (acts.length > 0) {
      ordersWithGate++
      // Ensure chronological by timestamp
      acts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      for (const a of acts) {
        const dkey = a.festival_day || dateKey(a.timestamp)
        if (!dailyGate[dkey]) dailyGate[dkey] = { in: 0, out: 0 }
        if (a.action === 'check_in') {
          totalCheckIns++
          dailyGate[dkey].in++
        } else if (a.action === 'check_out') {
          totalCheckOuts++
          dailyGate[dkey].out++
        }
      }
      const last = acts[acts.length - 1]
      if (last?.action === 'check_in') {
        const qty = asInt(order.ticket_quantity, 1)
        currentlyOnSite += qty
      }
    }

    // Meals
    const meals = Array.isArray(order.meal_redemption_history) ? order.meal_redemption_history : []
    if (meals.length > 0) {
      ordersWithMeals++
      for (const m of meals) {
        totalMealRedemptions += asInt(m.tickets_redeemed, 1)
        const dkey = m.festival_day || dateKey(m.timestamp)
        dailyMeals[dkey] = (dailyMeals[dkey] || 0) + asInt(m.tickets_redeemed, 1)
        const hour = toJSDate(m.timestamp)?.getHours() ?? -1
        if (hour >= 12 && hour <= 14) mealService.Lunch += asInt(m.tickets_redeemed, 1)
        else if (hour >= 18 && hour <= 20) mealService.Dinner += asInt(m.tickets_redeemed, 1)
        else mealService.Other += asInt(m.tickets_redeemed, 1)
      }
    }
  }

  // Resolve referrer names/emails if possible
  for (const [rid, entry] of referralMap.entries()) {
    try {
      const refOrder = await getDoc(doc(db, 'orders_2025', rid))
      if (refOrder.exists()) {
        const data = refOrder.data()
        entry.name = data.fullname || ''
        entry.email = data.email || ''
        continue
      }
      const refApp = await getDoc(doc(db, 'applications_2025', rid))
      if (refApp.exists()) {
        const data = refApp.data()
        entry.name = data.fullname || ''
        entry.email = data.email || ''
      }
    } catch {
      // ignore lookup failures
    }
  }

  // Build report
  const lines = []
  lines.push('🎪 REUNION FESTIVAL 2025 - ANALYTICS REPORT')
  lines.push('==========================================')
  lines.push('')

  // Revenue
  lines.push('💰 REVENUE ANALYSIS')
  lines.push('────────────────────')
  lines.push(`Total Orders: ${totalOrders}`)
  lines.push(`Paid Orders: ${paidOrders}`)
  lines.push(`Unpaid Orders: ${unpaidOrders}`)
  lines.push(`Total Revenue: ${formatCurrency(totalRevenue)}`)
  const avg = totalOrders > 0 ? totalRevenue / totalOrders : 0
  lines.push(`Average Order Value: ${formatCurrency(avg)}`)
  const rate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0
  lines.push(`Payment Success Rate: ${rate.toFixed(1)}%`)
  lines.push('')
  lines.push('Payment Method Breakdown:')
  Object.entries(paymentMethods).forEach(([k, v]) => {
    lines.push(`- ${k}: ${v.count} orders — ${formatCurrency(v.revenue)}`)
  })
  lines.push('')

  // Referrals
  lines.push('🏷️ REFERRAL ANALYSIS')
  lines.push('────────────────────')
  lines.push(`Orders with Referrals: ${Array.from(referralMap.values()).reduce((s, e) => s + e.orders, 0)}`)
  lines.push(`Unique Referrers: ${referralMap.size}`)
  const totalReferralBonus = Array.from(referralMap.values()).reduce((s, e) => s + e.earnings, 0)
  lines.push(`Total Referral Bonuses Owed: ${formatCurrency(totalReferralBonus)}`)
  lines.push('')
  lines.push('All Referrers:')
  const sortedRef = Array.from(referralMap.entries()).sort((a, b) => b[1].earnings - a[1].earnings)
  sortedRef.forEach(([rid, e]) => {
    lines.push(`- ${rid} | ${e.name || 'Unknown'} | ${e.email || 'Unknown'} — ${e.orders} orders, ${e.tickets} tickets — Owed ${formatCurrency(e.earnings)}`)
  })
  lines.push('')

  // Gate
  lines.push('🚪 GATE ACTIVITY ANALYSIS')
  lines.push('─────────────────────────')
  lines.push(`Orders with Gate Activity: ${ordersWithGate}`)
  lines.push(`Total Check-ins: ${totalCheckIns}`)
  lines.push(`Total Check-outs: ${totalCheckOuts}`)
  lines.push(`Currently On-Site: ${currentlyOnSite}`)
  lines.push('')
  lines.push('Daily Gate Activity:')
  Object.entries(dailyGate).forEach(([day, val]) => {
    lines.push(`- ${day}: ${val.in} check-ins, ${val.out} check-outs`)
  })
  lines.push('')

  // Meals
  lines.push('🍽️ MEAL ANALYSIS')
  lines.push('───────────────')
  lines.push(`Orders with Meal History: ${ordersWithMeals}`)
  lines.push(`Total Meal Redemptions: ${totalMealRedemptions}`)
  lines.push('')
  lines.push('Daily Meal Activity:')
  Object.entries(dailyMeals).forEach(([day, count]) => {
    lines.push(`- ${day}: ${count} tickets used`)
  })
  lines.push('')
  lines.push('Meal Service Breakdown:')
  lines.push(`- Lunch: ${mealService.Lunch}`)
  lines.push(`- Dinner: ${mealService.Dinner}`)
  lines.push(`- Other: ${mealService.Other}`)
  lines.push('')

  // Referral details (debug)
  lines.push('Referral Details (debug)')
  lines.push('────────────────────────')
  const refKeys = Array.from(referralDetails.keys())
  if (refKeys.length === 0) {
    lines.push('No referred orders found.')
  } else {
    for (const rid of refKeys) {
      const e = referralMap.get(rid) || { earnings: 0 }
      lines.push(`Referrer ${rid} — Owed ${formatCurrency(e.earnings)}`)
      referralDetails.get(rid).forEach((d) => {
        lines.push(`  • ${d.orderId} | paid:${d.paid} | ${d.payment_type || 'unknown'} | ${d.ticket_type || 'N/A'} x${d.qty} → ${d.qualified ? 'COUNTED' : 'SKIPPED'} (${d.reason})`)
      })
      lines.push('')
    }
  }

  // Revenue details (debug)
  lines.push('Revenue Details (debug)')
  lines.push('────────────────────────')
  if (revenueDetails.length === 0) {
    lines.push('No orders found.')
  } else {
    revenueDetails.forEach((r) => {
      lines.push(`• ${r.orderId} | day:${r.day} | paid:${r.paid} | ${r.payment_type || 'unknown'} | in-kind:${r.in_kind} | ${formatCurrency(r.total_price)} → ${r.counted ? 'COUNTED' : 'SKIPPED'} (${r.reason})`)
    })
  }

  // Also write referral debug to its own file for quick access
  const debugLines = []
  debugLines.push('Referral Details (debug)')
  debugLines.push('────────────────────────')
  if (refKeys.length === 0) {
    debugLines.push('No referred orders found.')
  } else {
    for (const rid of refKeys) {
      const e = referralMap.get(rid) || { earnings: 0 }
      debugLines.push(`Referrer ${rid} — Owed ${formatCurrency(e.earnings)}`)
      referralDetails.get(rid).forEach((d) => {
        debugLines.push(`  • ${d.orderId} | paid:${d.paid} | ${d.payment_type || 'unknown'} | ${d.ticket_type || 'N/A'} x${d.qty} → ${d.qualified ? 'COUNTED' : 'SKIPPED'} (${d.reason})`)
      })
      debugLines.push('')
    }
  }

  fs.writeFileSync('scripts/reunion-festival-analytics.txt', lines.join('\n'))
  fs.writeFileSync('scripts/referral-debug.txt', debugLines.join('\n'))
  // Also write revenue debug to its own file
  const revenueDebugLines = []
  revenueDebugLines.push('Revenue Details (debug)')
  revenueDebugLines.push('────────────────────────')
  if (revenueDetails.length === 0) {
    revenueDebugLines.push('No orders found.')
  } else {
    revenueDetails.forEach((r) => {
      revenueDebugLines.push(`• ${r.orderId} | day:${r.day} | paid:${r.paid} | ${r.payment_type || 'unknown'} | in-kind:${r.in_kind} | ${formatCurrency(r.total_price)} → ${r.counted ? 'COUNTED' : 'SKIPPED'} (${r.reason})`)
    })
  }
  fs.writeFileSync('scripts/revenue-debug.txt', revenueDebugLines.join('\n'))
  console.log('✅ Wrote scripts/reunion-festival-analytics.txt')
  console.log('✅ Wrote scripts/referral-debug.txt')
  console.log('✅ Wrote scripts/revenue-debug.txt')
}

// Run
generateAnalytics().catch((e) => {
  console.error('❌ Analytics failed:', e)
  process.exit(1)
})
