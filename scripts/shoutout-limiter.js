// Server-side shout-out rate limiting. The client cooldown is only UX; this is the enforcement.
export const DEFAULT_LIMITS = {
  cooldownMs: 15_000, // min gap between shout-outs from one ticket
  perHour: 20, // max per ticket per hour
  globalWindowMs: 10_000,
  globalMax: 6 // max shout-outs on screen per window, protects the stream
}

export function createShoutoutLimiter(limits = {}, now = () => Date.now()) {
  const cfg = { ...DEFAULT_LIMITS, ...limits }
  const byUser = new Map() // key -> timestamps within the last hour
  let global = []

  function check(key) {
    const t = now()
    const hour = 3_600_000
    const mine = (byUser.get(key) || []).filter((ts) => t - ts < hour)
    global = global.filter((ts) => t - ts < cfg.globalWindowMs)

    if (mine.length && t - mine[mine.length - 1] < cfg.cooldownMs) {
      return { ok: false, reason: 'cooldown' }
    }
    if (mine.length >= cfg.perHour) return { ok: false, reason: 'hourly' }
    if (global.length >= cfg.globalMax) return { ok: false, reason: 'global' }

    mine.push(t)
    global.push(t)
    byUser.set(key, mine)
    return { ok: true }
  }

  // Drop idle keys so the map can't grow forever
  function prune() {
    const t = now()
    for (const [key, stamps] of byUser) {
      if (!stamps.some((ts) => t - ts < 3_600_000)) byUser.delete(key)
    }
  }

  return { check, prune }
}
