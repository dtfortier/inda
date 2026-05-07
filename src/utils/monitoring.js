/* Monitoring engine — pure functions that turn user-configured rules
   into metric statuses and dynamic AI insight text.

   A rule looks like:
     { id, type: 'goal' | 'threshold', metric: 'Course Activity Rate',
       condition: 'Greater than', target: 85, unit: '%', alert: true }

   Metrics are pulled from widget data, where values are stored as
   display strings ("14,200", "88%", "2.1 days"). `parseValue` turns
   those into numbers for comparison. */

/* Pull the first numeric run out of a value string and strip
   thousands separators. Handles "14,200" → 14200, "88%" → 88,
   "2.1 days" → 2.1, "12K" → 12, "$1,234.56" → 1234.56. */
export function parseValue(input) {
  if (input == null) return null
  if (typeof input === 'number') return input
  const str = String(input)
  /* `K`/`M` suffix scaling — "12K" → 12000 — kept simple for the
     prototype; extend with B for billions if needed. */
  const kMatch = str.match(/(-?[\d,]*\.?\d+)\s*([KMkm])/)
  if (kMatch) {
    const base = parseFloat(kMatch[1].replace(/,/g, ''))
    const mult = /[Mm]/.test(kMatch[2]) ? 1_000_000 : 1_000
    return base * mult
  }
  const m = str.match(/-?[\d,]*\.?\d+/)
  if (!m) return null
  return parseFloat(m[0].replace(/,/g, ''))
}

/* Evaluate one rule against a numeric value. Returns true when the
   rule's condition is satisfied (i.e., when the rule "fires"). */
export function evaluateRule(rule, value) {
  if (rule == null || value == null || Number.isNaN(value)) return false
  const target = typeof rule.target === 'number' ? rule.target : parseFloat(rule.target)
  if (Number.isNaN(target)) return false
  switch (rule.condition) {
    case 'Greater than': return value > target
    case 'Greater than or equal to': return value >= target
    case 'Less than': return value < target
    case 'Less than or equal to': return value <= target
    case 'Equal to': return value === target
    case 'Below target': return value < target
    default: return false
  }
}

/* Map a fired rule to a status name. Goals firing is good; thresholds
   firing is bad. The exact "below" vs "at-risk" wording for
   thresholds depends on the condition direction.

   Returns a status string or null. */
export function statusForRule(rule, fired) {
  if (!rule) return null
  if (!fired) {
    /* For goal-type rules that aren't met yet, we don't surface a
       badge by default. Could add 'off-target' later. */
    return null
  }
  if (rule.type === 'goal') return 'on-target'
  /* Threshold fired = the threshold has been crossed. */
  if (/Less than/i.test(rule.condition)) return 'below-threshold'
  return 'at-risk'
}

/* Given a list of rules and a list of metric objects (each with a
   label and value), produce a map of label → status. Rules that
   don't fire are skipped. The first firing rule per metric wins. */
export function computeMetricStatuses(rules, metrics) {
  const out = {}
  if (!Array.isArray(rules) || !Array.isArray(metrics)) return out
  for (const m of metrics) {
    const numeric = parseValue(m.value)
    /* Match rules to this metric by label (case-insensitive) so user
       edits in EditWidgetModal don't have to be exact-cased. */
    const matching = rules.filter((r) => r.metric && r.metric.toLowerCase() === m.label.toLowerCase())
    for (const rule of matching) {
      const fired = evaluateRule(rule, numeric)
      const status = statusForRule(rule, fired)
      if (status) {
        out[m.label] = { status, rule, value: numeric }
        break
      }
    }
  }
  return out
}

/* Tiny helper for narrative phrasing. */
function formatTarget(rule) {
  const { target, unit } = rule
  if (unit === '%') return `${target}%`
  if (unit) return `${target} ${unit}`
  return String(target)
}

/* Generate a narrative AI insight string. If any rules have fired,
   describe the most-impactful one and fall back to the original
   insight as a tail. If nothing fires, return the original. */
export function buildDynamicInsight(originalInsight, rules, metrics) {
  if (!Array.isArray(rules) || !rules.length || !Array.isArray(metrics)) {
    return originalInsight
  }
  /* Compute fired rules with their metric values. */
  const fires = []
  for (const m of metrics) {
    const numeric = parseValue(m.value)
    for (const rule of rules) {
      if (!rule.metric || rule.metric.toLowerCase() !== m.label.toLowerCase()) continue
      if (evaluateRule(rule, numeric)) {
        fires.push({ rule, metric: m, value: numeric })
      }
    }
  }
  if (!fires.length) return originalInsight

  /* Prioritize threshold breaches over goal achievements — bad news
     comes first in the insight narrative. */
  fires.sort((a, b) => {
    if (a.rule.type === b.rule.type) return 0
    return a.rule.type === 'threshold' ? -1 : 1
  })

  const lead = fires[0]
  const isThreshold = lead.rule.type === 'threshold'
  const valueStr = lead.metric.value
  const targetStr = formatTarget(lead.rule)

  let narrative
  if (isThreshold) {
    if (/Less than/i.test(lead.rule.condition)) {
      narrative = `${lead.metric.label} dropped below your configured threshold of ${targetStr} (currently ${valueStr}).`
    } else {
      narrative = `${lead.metric.label} crossed your configured threshold of ${targetStr} (currently ${valueStr}).`
    }
  } else {
    narrative = `${lead.metric.label} is on target at ${valueStr}, meeting your configured goal of ${targetStr}.`
  }

  /* If multiple rules fired, append a brief mention. */
  if (fires.length > 1) {
    const others = fires.slice(1).map((f) => f.metric.label)
    const list = others.length === 1
      ? others[0]
      : others.length === 2
        ? `${others[0]} and ${others[1]}`
        : `${others.slice(0, -1).join(', ')}, and ${others[others.length - 1]}`
    narrative += ` Also affecting: ${list}.`
  }

  return narrative
}
