// ============================================================
// Wellpack Industries — RAG Knowledge Base
// This is the "retrieval" layer for the chatbot.
// Add / edit entries here to expand what the bot knows.
// ============================================================

export const knowledgeBase = [
  // ── PRODUCTS ──────────────────────────────────────────────
  {
    id: 'kb-001',
    topic: 'products',
    keywords: ['standard', 'pp strap', 'polypropylene', 'strapping', 'product', 'types', 'range'],
    content: `Wellpack Industries manufactures 6 types of PP straps:
1. Standard PP Strap – General packaging, cargo securing, bundling. Width 9–19mm, thickness 0.4–1.2mm. UV-stabilized option available.
2. Embossed PP Strap – Diamond-embossed surface for superior grip. Ideal for export packaging and heavy industrial use. Width 12–19mm.
3. Eco PP Strap – Made from recycled PP material. BIS compliant, lower carbon footprint, all standard sizes.
4. Woven PP Strap – Near-zero elongation, breaking strength up to 1800kg. Ideal for heavy machinery, granite, construction.
5. Printed PP Strap – Custom logo/text via flexo printing. 1–2 colours, min order 500kg, fast turnaround.
6. Box Strapping Roll – Pre-wound rolls (1–10kg), 200mm core, width 9–15mm, 5 colours available.`,
  },
  {
    id: 'kb-002',
    topic: 'specifications',
    keywords: ['width', 'thickness', 'size', 'spec', 'dimension', 'mm', 'gauge', 'length'],
    content: `PP Strap Specifications at Wellpack Industries:
- Width range: 9mm, 12mm, 15mm, 16mm, 19mm, 25mm (woven only)
- Thickness range: 0.4mm, 0.5mm, 0.6mm, 0.8mm, 1.0mm, 1.2mm
- Roll weights: 1kg, 2kg, 5kg, 10kg (custom available)
- Core diameter: 200mm standard
- Breaking strength: 80kg–1800kg depending on type and size
- Elongation: 15–25% (standard), near-zero (woven)
- Standard colours: natural (beige), black, blue, green, red, yellow, white, orange`,
  },
  {
    id: 'kb-003',
    topic: 'custom-orders',
    keywords: ['custom', 'order', 'colour', 'color', 'size', 'minimum', 'moq', 'special'],
    content: `Custom PP Strap orders at Wellpack Industries:
- Custom widths, thicknesses, colours, and spool weights available
- Minimum order quantity (MOQ): 500kg for custom colours/sizes
- Printed straps MOQ: 500kg
- Lead time: 3–7 working days for custom orders
- Standard items: available from stock
- Samples available on request (courier charges apply)
- Custom packaging / labelling available for bulk orders`,
  },

  // ── PRICING & ORDERING ────────────────────────────────────
  {
    id: 'kb-004',
    topic: 'pricing',
    keywords: ['price', 'cost', 'rate', 'quote', 'cheap', 'bulk', 'discount', 'wholesale'],
    content: `Pricing at Wellpack Industries:
- Prices depend on type, width, thickness, and quantity
- Bulk discounts available for orders above 1 tonne
- Direct manufacturer pricing — no middlemen
- GST extra as applicable
- For an exact quote, share your required width, thickness, quantity, and colour with our team
- Contact: sales@wellpackindustries.com or +91 98765 43210
- Quotes are typically provided within 24 hours`,
  },
  {
    id: 'kb-005',
    topic: 'delivery',
    keywords: ['delivery', 'shipping', 'dispatch', 'transport', 'logistics', 'pan india', 'time', 'fast'],
    content: `Delivery information for Wellpack Industries:
- PAN India delivery available
- Standard dispatch: 1–2 working days for in-stock items
- Custom orders: 3–7 working days
- Delivery via trusted transport partners (Delhivery, TCI, VRL, road transport)
- Minimum order for delivery: 50kg
- Free delivery available on orders above 500kg within Pune/PCMC
- Export to select countries in Southeast Asia and Middle East available`,
  },
  {
    id: 'kb-006',
    topic: 'payment',
    keywords: ['payment', 'advance', 'credit', 'upi', 'bank', 'neft', 'terms', 'invoice'],
    content: `Payment terms at Wellpack Industries:
- New customers: 100% advance payment
- Regular customers: credit terms available (7–30 days based on relationship)
- Payment modes: NEFT/RTGS, UPI, cheque
- GST invoice provided for all orders
- For credit terms, contact our sales team directly`,
  },

  // ── TECHNICAL / USAGE ─────────────────────────────────────
  {
    id: 'kb-007',
    topic: 'usage',
    keywords: ['use', 'how', 'apply', 'machine', 'hand', 'tool', 'tension', 'seal', 'buckle', 'clip'],
    content: `How to use PP strapping:
- Hand grade straps: used with a hand strapping tool (tensioner + sealer + metal clips/seals)
- Machine grade straps: used with semi-automatic or automatic strapping machines
- Steps: loop strap around package → tension to required tightness → seal with metal clip or heat seal
- For embossed straps, no metal seal needed in some applications — friction weld sealing works
- Recommended tension: 60–80% of breaking strength for safe bundling
- Do not exceed the breaking strength of the strap`,
  },
  {
    id: 'kb-008',
    topic: 'machine-compatibility',
    keywords: ['machine', 'automatic', 'semi-auto', 'strapping machine', 'compatible', 'brand'],
    content: `Machine compatibility for Wellpack PP straps:
- Compatible with all major strapping machine brands: Mosca, Signode, Dynaric, Fromm, Samuel
- Machine grade straps are wound tighter and have consistent tension throughout the roll
- Recommended for: semi-automatic table-top machines, automatic inline machines
- Width most common for machines: 12mm and 15mm
- Core size: 200mm (standard for most machines)
- If unsure, share your machine brand/model and we'll confirm compatibility`,
  },
  {
    id: 'kb-009',
    topic: 'strength-selection',
    keywords: ['how strong', 'which strap', 'weight', 'load', 'heavy', 'light', 'select', 'choose', 'recommend'],
    content: `How to choose the right PP strap for your load:
- Light loads (under 20kg): 9mm × 0.4mm Standard PP Strap
- Medium loads (20–100kg): 12mm × 0.6mm or 15mm × 0.8mm Standard/Embossed
- Heavy loads (100–500kg): 19mm × 1.0mm or 1.2mm Embossed PP Strap
- Very heavy / industrial (500kg+): Woven PP Strap (up to 1800kg breaking strength)
- Export cartons: Embossed PP for superior grip during sea/air freight
- General rule: always use a strap with breaking strength at least 3× your load weight`,
  },
  {
    id: 'kb-010',
    topic: 'problems',
    keywords: ['breaking', 'snapping', 'slipping', 'issue', 'problem', 'defect', 'quality', 'complaint', 'fail'],
    content: `Common PP strap issues and solutions:
- Strap breaking during tensioning: Strap grade too light for the load — upgrade to thicker/wider strap
- Strap slipping on smooth surfaces: Switch to Embossed PP Strap for better friction grip
- Strap brittle in cold weather: Use UV-stabilized or cold-weather grade strap
- Seal failing / joint opening: Ensure correct sealing tool calibration; use correct seal/clip size
- Strap tangling in machine: Check roll core compatibility and strap tension; clean machine feed track
- Colour fading outdoors: Use UV-stabilized strap variant
- For persistent issues, contact our technical team: info@wellpackindustries.com`,
  },
  {
    id: 'kb-011',
    topic: 'storage',
    keywords: ['store', 'storage', 'shelf life', 'expire', 'warehouse', 'humidity', 'sunlight'],
    content: `PP Strap storage guidelines:
- Store in a cool, dry place away from direct sunlight
- Ideal temperature: 10°C – 40°C
- Keep away from heat sources, flames, and chemicals
- Shelf life: 2 years from manufacturing date under proper storage
- Stack rolls flat or on their side — do not store upright for long periods
- Avoid crushing rolls — can cause feed issues in strapping machines`,
  },

  // ── COMPANY INFO ──────────────────────────────────────────
  {
    id: 'kb-012',
    topic: 'company',
    keywords: ['wellpack', 'company', 'about', 'founded', 'pune', 'manufacturer', 'india', 'who', 'history'],
    content: `About Wellpack Industries:
- Founded in 2009, based in MIDC Industrial Area, Bhosari, Pune, Maharashtra
- Manufacturer of PP strapping products — not a trader or reseller
- ISO 9001:2015 certified, BIS compliant
- 15+ years of industry experience
- 500+ active clients across 18 states in India
- Exports to Southeast Asia and Middle East
- Full in-house manufacturing from raw PP granules to finished rolls`,
  },
  {
    id: 'kb-013',
    topic: 'contact',
    keywords: ['contact', 'phone', 'email', 'address', 'location', 'reach', 'call', 'visit', 'office'],
    content: `Contact details for Wellpack Industries:
- Phone: +91 98765 43210 / +91 98765 43211
- Email: sales@wellpackindustries.com (orders) / info@wellpackindustries.com (general)
- Address: Plot No. 42, MIDC Industrial Area, Bhosari, Pune – 411026, Maharashtra, India
- Working hours: Monday to Saturday, 9:00 AM – 6:30 PM IST
- Sunday: Closed`,
  },
  {
    id: 'kb-014',
    topic: 'certifications',
    keywords: ['iso', 'bis', 'certified', 'quality', 'standard', 'certificate', 'compliance'],
    content: `Certifications and standards at Wellpack Industries:
- ISO 9001:2015 certified quality management system
- BIS (Bureau of Indian Standards) compliant products
- GST registered: certificate available on request
- All products tested for: tensile strength, elongation, width tolerance, and surface quality
- Quality checks performed on every production batch before dispatch`,
  },
  {
    id: 'kb-015',
    topic: 'industries-served',
    keywords: ['industry', 'sector', 'who uses', 'application', 'logistics', 'ecommerce', 'textile', 'steel', 'agriculture'],
    content: `Industries served by Wellpack Industries:
- Logistics & Cargo: securing cartons and pallets for transport
- E-commerce: box strapping for shipment fulfillment
- Agriculture: bundling of crops, pipes, and farm equipment
- Textile & Apparel: baling fabric rolls and garment bundles
- Steel & Metal: securing coils, rods, and structural material
- Construction: bundling pipes, tiles, bricks, and boards
- FMCG & Retail: secondary packaging and bundling
- Granite & Stone: securing heavy stone slabs for transport`,
  },
]

// ── Retrieval function ─────────────────────────────────────
// Simple keyword-based retrieval (no vector DB needed for this scale)
export function retrieveContext(query) {
  const q = query.toLowerCase()

  // Score each entry by keyword matches
  const scored = knowledgeBase.map(entry => {
    const score = entry.keywords.reduce((acc, kw) => {
      return acc + (q.includes(kw.toLowerCase()) ? 1 : 0)
    }, 0)
    return { ...entry, score }
  })

  // Sort by score, return top 3 relevant entries
  const relevant = scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  // If nothing matched by keyword, return general product + contact info
  if (relevant.length === 0) {
    return knowledgeBase.filter(e => ['kb-001', 'kb-013'].includes(e.id))
  }

  return relevant
}
