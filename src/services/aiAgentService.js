// AI Agent Operations Service for Wellpack Industries
// Integrates Groq / LLaMA 3.3 LLM with deterministic industrial heuristic fallbacks
import { GROQ_MODEL } from './groqConfig'

/**
 * Classifies the priority of an incoming order based on:
 * 1. Proximity of client expected delivery deadline
 * 2. Order volume / raw material requirements
 * 3. Client tier & urgency signals
 * 4. Extrusion customization (custom tooling / printing)
 */
export async function classifyOrderPriority(order, existingOrders = [], inventory = {}) {
  const today = new Date()
  const deadline = new Date(order.expectedDeadline || today)
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const urgencyText = (order.clientUrgencyNote || '').toLowerCase()
  const isMarkedUrgent = urgencyText.includes('urgent') || urgencyText.includes('shutdown') || urgencyText.includes('breakdown') || urgencyText.includes('critical') || urgencyText.includes('asap')

  // Try calling Groq API if key is configured
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (apiKey) {
    try {
      const prompt = `You are an industrial production scheduling AI for Wellpack Industries (PP strapping manufacturer).
Analyze this incoming order and determine its priority tag: "P1-Critical", "P2-High", or "P3-Normal".

ORDER DETAILS:
- Client: ${order.companyName || order.clientName}
- Expected Delivery: ${order.expectedDeadline} (Days remaining: ${diffDays})
- Strap Spec: ${order.widthMm}mm x ${order.thicknessMm}mm (${order.strapGrade})
- Color: ${order.color} | Cores: ${order.coreDiameterMm}mm
- Quantity: ${order.rollsCount} rolls (${order.totalWeightKg || (order.rollsCount * 10)} kg)
- Custom Printing: ${order.customPrinting ? 'Yes: ' + order.printText : 'No'}
- Client Urgency Note: ${order.clientUrgencyNote || 'None'}

RULES:
- P1-Critical: Due within 2 days, or critical client line shutdown, or urgent penalty contract.
- P2-High: Due within 3-5 days, or large volume (>800kg), or requires custom printing setup.
- P3-Normal: Standard delivery (>5 days), routine replenishment.

Return ONLY a valid JSON object in this format:
{"priority": "P1-Critical"|"P2-High"|"P3-Normal", "reason": "brief 1-2 sentence explanation"}`

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 150,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}')
        if (parsed.priority) {
          return {
            priority: parsed.priority,
            priorityReason: parsed.reason || 'AI scheduled based on deadline proximity and production constraints.',
          }
        }
      }
    } catch (e) {
      console.warn('AI API call fallback to heuristic engine:', e)
    }
  }

  // Industrial Rule Engine Fallback
  if (diffDays <= 2 || isMarkedUrgent) {
    return {
      priority: 'P1-Critical',
      priorityReason: diffDays <= 1
        ? `🚨 Deadline in ${Math.max(0, diffDays)} days! High risk of client production stoppage.`
        : `🚨 Client flagged urgent requirement (${order.clientUrgencyNote || 'Line critical'}). Fast-track extrusion required.`,
    }
  }

  if (diffDays <= 5 || (order.rollsCount && order.rollsCount >= 80) || order.customPrinting) {
    const reasons = []
    if (diffDays <= 5) reasons.push(`Delivery required in ${diffDays} days`)
    if (order.rollsCount >= 80) reasons.push(`High batch volume (${order.rollsCount} rolls)`)
    if (order.customPrinting) reasons.push('Custom cylinder printing setup needed')
    return {
      priority: 'P2-High',
      priorityReason: `⚡ Priority queued: ${reasons.join(', ')}.`,
    }
  }

  return {
    priority: 'P3-Normal',
    priorityReason: `🟢 Standard scheduled queue. Adequate lead time (${diffDays} days) available.`,
  }
}

/**
 * Audits raw material inventory against all pending and in-production orders
 */
export function auditInventoryRequirements(orders = [], inventory = {}) {
  const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'In Production')

  let requiredVirginKg = 0
  let requiredSemiVirginKg = 0
  let requiredYellowMbKg = 0
  let requiredBlueMbKg = 0
  let requiredBlackMbKg = 0
  let requiredCores200 = 0
  let requiredCores406 = 0
  let requiredBoxes = 0

  activeOrders.forEach(o => {
    const rolls = parseInt(o.rollsCount) || 0
    const weight = parseFloat(o.totalWeightKg) || (rolls * 10)
    const grade = (o.strapGrade || '').toLowerCase()
    const color = (o.color || '').toLowerCase()

    if (grade.includes('virgin') || grade.includes('heavy') || grade.includes('auto')) {
      requiredVirginKg += weight
    } else {
      requiredSemiVirginKg += weight
    }

    const mbKg = weight * 0.02
    if (color.includes('yellow')) requiredYellowMbKg += mbKg
    else if (color.includes('blue')) requiredBlueMbKg += mbKg
    else if (color.includes('black')) requiredBlackMbKg += mbKg

    if (o.coreDiameterMm === 406) {
      requiredCores406 += rolls
    } else {
      requiredCores200 += rolls
    }

    requiredBoxes += Math.ceil(rolls / 2)
  })

  const alerts = []

  // Check PP Virgin
  const virginStock = inventory.ppVirginGranules?.currentKg || 0
  if (requiredVirginKg > virginStock) {
    alerts.push({
      type: 'danger',
      item: 'PP Virgin Polymer',
      shortfall: Math.round(requiredVirginKg - virginStock),
      unit: 'kg',
      message: `Critical Stock Shortfall: Active orders require ${Math.round(requiredVirginKg)} kg of Virgin PP, but current stock is only ${virginStock} kg. Deficit of ${Math.round(requiredVirginKg - virginStock)} kg.`,
      recommendation: `Issue purchase order for ${Math.round((requiredVirginKg - virginStock) + 1000)} kg Virgin PP granules immediately.`,
    })
  } else if (virginStock - requiredVirginKg < (inventory.ppVirginGranules?.minThresholdKg || 1000)) {
    alerts.push({
      type: 'warning',
      item: 'PP Virgin Polymer',
      shortfall: Math.round((inventory.ppVirginGranules?.minThresholdKg || 1000) - (virginStock - requiredVirginKg)),
      unit: 'kg',
      message: `Low Buffer Warning: Virgin PP remaining after current queue will drop to ${Math.round(virginStock - requiredVirginKg)} kg (below minimum buffer).`,
      recommendation: 'Plan procurement for next week batch.',
    })
  }

  // Check PP Semi Virgin
  const semiStock = inventory.ppSemiVirginGranules?.currentKg || 0
  if (requiredSemiVirginKg > semiStock) {
    alerts.push({
      type: 'danger',
      item: 'PP Semi-Virgin Polymer',
      shortfall: Math.round(requiredSemiVirginKg - semiStock),
      unit: 'kg',
      message: `Critical Stock Shortfall: Need ${Math.round(requiredSemiVirginKg)} kg Semi-Virgin PP, stock has ${semiStock} kg.`,
      recommendation: `Order ${Math.round(requiredSemiVirginKg - semiStock + 500)} kg immediately.`,
    })
  }

  // Check Cores
  const cores200Stock = inventory.paperCores200?.currentUnits || 0
  if (requiredCores200 > cores200Stock) {
    alerts.push({
      type: 'danger',
      item: '200mm Paper Cores',
      shortfall: requiredCores200 - cores200Stock,
      unit: 'pcs',
      message: `Core Shortage: Queued orders require ${requiredCores200} pcs of 200mm cores (stock: ${cores200Stock} pcs).`,
      recommendation: 'Contact paper tube supplier for rush delivery.',
    })
  }

  const cores406Stock = inventory.paperCores406?.currentUnits || 0
  if (requiredCores406 > cores406Stock) {
    alerts.push({
      type: 'danger',
      item: '406mm Jumbo Cores',
      shortfall: requiredCores406 - cores406Stock,
      unit: 'pcs',
      message: `Jumbo Core Shortage: ${requiredCores406} pcs 406mm cores needed for Auto-grade orders (stock: ${cores406Stock} pcs).`,
      recommendation: 'Order 406mm cores immediately.',
    })
  }

  return {
    requiredVirginKg: Math.round(requiredVirginKg),
    requiredSemiVirginKg: Math.round(requiredSemiVirginKg),
    requiredYellowMbKg: Math.round(requiredYellowMbKg),
    requiredCores200,
    requiredCores406,
    requiredBoxes,
    alerts,
    isHealthy: alerts.filter(a => a.type === 'danger').length === 0,
  }
}

/**
 * Generates an automated B2B Quotation text and WhatsApp message link for a given order
 */
export function generateB2BQuote(order) {
  const subtotal = order.estimatedValueInr || (order.rollsCount * 1200)
  const gst = Math.round(subtotal * 0.18)
  const totalWithGst = subtotal + gst

  const quoteText = `*OFFICIAL QUOTATION — WELLPACK INDUSTRIES*
*Ref ID:* ${order.id}
*Date:* ${new Date().toLocaleDateString('en-IN')}

Dear ${order.clientName || 'Customer'} (${order.companyName || 'Valued Client'}),

Thank you for your enquiry with Wellpack Industries, Pune. Here is the formal quotation based on your specifications:

━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 *ORDER SPECIFICATIONS:*
• *Product:* ${order.strapGrade || 'PP Strapping Band'}
• *Dimensions:* ${order.widthMm}mm Width × ${order.thicknessMm}mm Thickness
• *Color / Embossing:* ${order.color} (Diamond Embossed)
• *Core Diameter:* ${order.coreDiameterMm}mm
• *Custom Printing:* ${order.customPrinting ? `Yes ("${order.printText}")` : 'No'}
• *Quantity:* ${order.rollsCount} Rolls (${order.totalWeightKg || (order.rollsCount * 10)} kg approx)
• *Length/Roll:* ~${order.metersPerRoll || 2000} Meters
• *Tensile Strength:* ≥ ${order.tensileStrengthKgf || 160} kgf

━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *COMMERCIAL TERMS:*
• *Estimated Unit Price:* ₹${Math.round(subtotal / (order.rollsCount || 1))} / Roll
• *Net Taxable Value:* ₹${subtotal.toLocaleString('en-IN')}
• *GST (18%):* ₹${gst.toLocaleString('en-IN')}
• *Grand Total (INR):* ₹${totalWithGst.toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🚚 *DISPATCH & PAYMENT:*
• *Target Dispatch:* ${order.expectedDeadline || 'Within 48-72 Hours'}
• *Dispatch Location:* Ex-Works Wellpack Factory, Chakan/Bhosari MIDC, Pune
• *Payment Terms:* 100% against Proforma Invoice / Net 15 Days for Approved Corporate Accounts

For any adjustments, reply to this message or call our sales desk at +91 98765 43210.

*Wellpack Industries — Precision PP Straps & Packaging*`

  // WhatsApp click-to-chat URL
  const cleanPhone = (order.phone || '').replace(/[^0-9]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(quoteText)}`

  return {
    quoteText,
    whatsappUrl,
    subtotal,
    gst,
    totalWithGst,
  }
}

/**
 * Recommends optimal machine batch grouping to reduce dye & size changeover downtime
 */
export function generateMachineBatchingAdvice(orders = []) {
  const pending = orders.filter(o => o.status === 'Pending' || o.status === 'In Production')
  
  // Group by width & color
  const groups = {}
  pending.forEach(o => {
    const key = `${o.widthMm}mm_${o.color}`
    if (!groups[key]) groups[key] = { key, width: o.widthMm, color: o.color, orders: [], totalKg: 0 }
    groups[key].orders.push(o)
    groups[key].totalKg += (o.totalWeightKg || 0)
  })

  const batches = Object.values(groups).sort((a, b) => b.totalKg - a.totalKg)

  return batches.map((b, idx) => ({
    batchNumber: idx + 1,
    title: `Extruder Line Batch #${idx + 1}: ${b.width}mm [${b.color}]`,
    ordersCount: b.orders.length,
    totalKg: Math.round(b.totalKg),
    orderIds: b.orders.map(o => o.id),
    recommendation: `Run these ${b.orders.length} order(s) continuously on Extruder Line 1 to eliminate screw purging & dye readjustment downtime.`,
  }))
}

/**
 * Generates an executive daily shift briefing for shop floor managers
 */
export function generateDailyShiftBriefing(orders = [], inventory = {}) {
  const active = orders.filter(o => o.status === 'Pending' || o.status === 'In Production')
  const critical = active.filter(o => o.priority === 'P1-Critical')
  const high = active.filter(o => o.priority === 'P2-High')
  const audit = auditInventoryRequirements(orders, inventory)

  const totalKgToProduce = active.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0)
  const totalPipelineValue = active.reduce((sum, o) => sum + (o.estimatedValueInr || 0), 0)

  return {
    timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' }),
    activeOrdersCount: active.length,
    criticalCount: critical.length,
    highCount: high.length,
    totalKgToProduce: Math.round(totalKgToProduce),
    totalPipelineValue: Math.round(totalPipelineValue),
    topCriticalOrders: critical.slice(0, 3),
    inventoryAlerts: audit.alerts,
    summaryText: `Today's factory schedule has ${active.length} active jobs totalling ${Math.round(totalKgToProduce)} kg. There are ${critical.length} critical P1 jobs requiring priority extrusion. ${audit.alerts.length > 0 ? `Attention: ${audit.alerts.length} inventory warning(s) detected.` : 'Raw material stock is adequate for all queued orders.'}`,
  }
}
