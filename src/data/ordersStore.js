import { INITIAL_ORDERS, INITIAL_INVENTORY, INITIAL_CLIENTS } from './mockOrders'

const STORAGE_KEYS = {
  ORDERS: 'wellpack_orders_v1',
  INVENTORY: 'wellpack_inventory_v1',
  CLIENTS: 'wellpack_clients_v1',
  AUTH: 'wellpack_admin_auth_v1',
}

// Calculate strap weight and specs mathematically:
// PP density ≈ 0.905 g/cm³ (0.000905 g/mm³)
// Volume per meter (mm³) = width (mm) * thickness (mm) * 1000 (mm)
// Weight per meter (g/m) = width * thickness * 0.905
// Weight per roll (kg) = (Weight per meter * metersPerRoll) / 1000
export function calculateStrapSpecs(widthMm, thicknessMm, metersPerRoll, strapGrade = 'Semi-Automatic') {
  const w = parseFloat(widthMm) || 12
  const t = parseFloat(thicknessMm) || 0.65
  const m = parseFloat(metersPerRoll) || 2000

  const gramsPerMeter = w * t * 0.905
  const weightKgPerRoll = parseFloat(((gramsPerMeter * m) / 1000).toFixed(2))

  // Tensile strength approximation based on virgin/semi-virgin grade
  const tensileFactor = strapGrade.includes('Virgin') || strapGrade.includes('Heavy Duty') ? 22 : 18
  const crossSectionMm2 = w * t
  const tensileStrengthKgf = Math.round(crossSectionMm2 * tensileFactor)

  // Estimated pricing model (Base PP raw material + extrusion cost + core + packaging)
  const baseRatePerKg = strapGrade.includes('Heavy') ? 145 : strapGrade.includes('Virgin') ? 130 : 125
  const pricePerRoll = Math.round(weightKgPerRoll * baseRatePerKg + 60) // + core & carton

  return {
    gramsPerMeter: parseFloat(gramsPerMeter.toFixed(2)),
    weightKgPerRoll,
    tensileStrengthKgf,
    pricePerRoll,
    baseRatePerKg,
  }
}

// Global subscribers for reactive UI
const listeners = new Set()
function notifySubscribers() {
  listeners.forEach(fn => fn())
}

export const ordersStore = {
  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  getOrders() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse stored orders', e)
    }
    this.saveOrders(INITIAL_ORDERS)
    return INITIAL_ORDERS
  },

  saveOrders(orders) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
    notifySubscribers()
  },

  addOrder(orderData) {
    const orders = this.getOrders()
    const year = new Date().getFullYear()
    const nextNum = 1080 + orders.length + 1
    const newId = `WP-${year}-${nextNum}`

    const specs = calculateStrapSpecs(
      orderData.widthMm,
      orderData.thicknessMm,
      orderData.metersPerRoll,
      orderData.strapGrade
    )

    const rolls = parseInt(orderData.rollsCount) || 10
    const totalWeightKg = parseFloat((specs.weightKgPerRoll * rolls).toFixed(2))
    const totalMeters = (parseInt(orderData.metersPerRoll) || 2000) * rolls
    const estimatedValueInr = specs.pricePerRoll * rolls

    const newOrder = {
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: orderData.priority || 'P2-High',
      priorityReason: orderData.priorityReason || 'Awaiting initial production queue assessment.',
      ...orderData,
      weightKgPerRoll: specs.weightKgPerRoll,
      totalWeightKg,
      totalMeters,
      tensileStrengthKgf: specs.tensileStrengthKgf,
      estimatedValueInr,
    }

    const updated = [newOrder, ...orders]
    this.saveOrders(updated)
    this.recordClientActivity(newOrder)
    return newOrder
  },

  updateOrderStatus(orderId, nextStatus) {
    const orders = this.getOrders()
    const target = orders.find(o => o.id === orderId)
    if (!target) return

    // Auto-deduct inventory when order moves to 'In Production'
    if (nextStatus === 'In Production' && target.status !== 'In Production') {
      this.deductInventoryForOrder(target)
    }

    const updated = orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
    this.saveOrders(updated)
  },

  updateOrderPriority(orderId, priority, priorityReason) {
    const orders = this.getOrders()
    const updated = orders.map(o => o.id === orderId ? {
      ...o,
      priority,
      ...(priorityReason ? { priorityReason } : {})
    } : o)
    this.saveOrders(updated)
  },

  deleteOrder(orderId) {
    const orders = this.getOrders().filter(o => o.id !== orderId)
    this.saveOrders(orders)
  },

  // Inventory Management
  getInventory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse inventory', e)
    }
    this.saveInventory(INITIAL_INVENTORY)
    return INITIAL_INVENTORY
  },

  saveInventory(inventory) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory))
    notifySubscribers()
  },

  updateStock(itemId, deltaAmount) {
    const inv = { ...this.getInventory() }
    if (inv[itemId]) {
      if (inv[itemId].currentKg !== undefined) {
        inv[itemId].currentKg = Math.max(0, inv[itemId].currentKg + deltaAmount)
      } else if (inv[itemId].currentUnits !== undefined) {
        inv[itemId].currentUnits = Math.max(0, inv[itemId].currentUnits + deltaAmount)
      }
      this.saveInventory(inv)
    }
  },

  deductInventoryForOrder(order) {
    const inv = { ...this.getInventory() }
    const rolls = parseInt(order.rollsCount) || 1
    const totalKg = parseFloat(order.totalWeightKg) || (rolls * 10)

    // Deduct PP granules
    if (order.strapGrade && (order.strapGrade.includes('Virgin') || order.strapGrade.includes('Heavy'))) {
      if (inv.ppVirginGranules) inv.ppVirginGranules.currentKg = Math.max(0, Math.round(inv.ppVirginGranules.currentKg - totalKg))
    } else {
      if (inv.ppSemiVirginGranules) inv.ppSemiVirginGranules.currentKg = Math.max(0, Math.round(inv.ppSemiVirginGranules.currentKg - totalKg))
    }

    // Deduct Masterbatch color (~2% of strap weight)
    const colorKg = Math.round(totalKg * 0.02)
    const col = (order.color || '').toLowerCase()
    if (col.includes('yellow') && inv.yellowMasterbatch) inv.yellowMasterbatch.currentKg = Math.max(0, inv.yellowMasterbatch.currentKg - colorKg)
    else if (col.includes('blue') && inv.blueMasterbatch) inv.blueMasterbatch.currentKg = Math.max(0, inv.blueMasterbatch.currentKg - colorKg)
    else if (col.includes('black') && inv.blackMasterbatch) inv.blackMasterbatch.currentKg = Math.max(0, inv.blackMasterbatch.currentKg - colorKg)

    // Deduct Paper Cores
    if (order.coreDiameterMm === 406 && inv.paperCores406) {
      inv.paperCores406.currentUnits = Math.max(0, inv.paperCores406.currentUnits - rolls)
    } else if (inv.paperCores200) {
      inv.paperCores200.currentUnits = Math.max(0, inv.paperCores200.currentUnits - rolls)
    }

    // Deduct boxes (2 rolls per box)
    if (inv.corrugatedBoxes) {
      inv.corrugatedBoxes.currentUnits = Math.max(0, inv.corrugatedBoxes.currentUnits - Math.ceil(rolls / 2))
    }

    this.saveInventory(inv)
  },

  // Clients CRM
  getClients() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS)
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse clients', e)
    }
    this.saveClients(INITIAL_CLIENTS)
    return INITIAL_CLIENTS
  },

  saveClients(clients) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients))
    notifySubscribers()
  },

  recordClientActivity(order) {
    const clients = this.getClients()
    const existing = clients.find(c =>
      (order.email && c.email.toLowerCase() === order.email.toLowerCase()) ||
      (order.companyName && c.companyName.toLowerCase() === order.companyName.toLowerCase())
    )

    if (existing) {
      existing.totalOrders = (existing.totalOrders || 0) + 1
      existing.lifetimeKg = (existing.lifetimeKg || 0) + (order.totalWeightKg || 0)
      existing.preferredSpecs = `${order.widthMm}mm ${order.color}`
      this.saveClients([...clients])
    } else if (order.companyName) {
      const newClient = {
        id: `CLI-${String(clients.length + 1).padStart(2, '0')}`,
        companyName: order.companyName,
        contactPerson: order.clientName || 'Lead',
        phone: order.phone || '',
        email: order.email || '',
        city: order.deliveryAddress?.split(',').slice(-2).join(',').trim() || 'India',
        gstin: order.gstin || 'Unregistered',
        tier: 'Standard',
        totalOrders: 1,
        lifetimeKg: order.totalWeightKg || 0,
        preferredSpecs: `${order.widthMm}mm ${order.color}`,
      }
      this.saveClients([newClient, ...clients])
    }
  },

  // Auth State & Security Controls
  isAdminAuthenticated() {
    try {
      const auth = sessionStorage.getItem(STORAGE_KEYS.AUTH)
      if (!auth) return false
      const parsed = JSON.parse(auth)
      // Check for valid session token and 8-hour expiry
      if (parsed && parsed.token && parsed.expiresAt && Date.now() < parsed.expiresAt) {
        return true
      }
      sessionStorage.removeItem(STORAGE_KEYS.AUTH)
      return false
    } catch {
      // Backwards compatibility if plain string was stored
      return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true'
    }
  },

  // Cryptographic SHA-256 hash helper
  async hashPin(pinString) {
    const encoder = new TextEncoder()
    const data = encoder.encode(pinString.trim())
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  },

  // Pre-hashed master authorizations (SHA-256):
  // "1234"         => "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"
  // "admin"        => "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918"
  // "wellpack2026" => "f5bc912304dfa8b13d100063fb55c0a373b9e4a30a84eef1ac87b4759bfd0a2f"
  async loginAdmin(pin) {
    const LOCK_KEY = 'wellpack_admin_lockout'
    const lockout = sessionStorage.getItem(LOCK_KEY)
    if (lockout) {
      const lockData = JSON.parse(lockout)
      if (Date.now() < lockData.until) {
        const remainingSec = Math.ceil((lockData.until - Date.now()) / 1000)
        return {
          success: false,
          locked: true,
          message: `Too many failed attempts. Security cooldown active (${remainingSec}s remaining).`
        }
      } else {
        sessionStorage.removeItem(LOCK_KEY)
      }
    }

    if (!pin || typeof pin !== 'string') {
      return { success: false, message: 'Please enter a PIN.' }
    }

    const hashed = await this.hashPin(pin)
    const AUTHORIZED_HASHES = new Set([
      '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
      '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // admin
      'f5bc912304dfa8b13d100063fb55c0a373b9e4a30a84eef1ac87b4759bfd0a2f', // wellpack2026
    ])

    if (AUTHORIZED_HASHES.has(hashed)) {
      // Session token with 8 hours expiration
      const sessionData = {
        token: `wp_sec_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        createdAt: Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000),
      }
      sessionStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(sessionData))
      sessionStorage.removeItem('wellpack_admin_attempts')
      notifySubscribers()
      return { success: true }
    }

    // Track failed attempts (Max 5 attempts before 30-sec lockout)
    const attempts = Number(sessionStorage.getItem('wellpack_admin_attempts') || 0) + 1
    sessionStorage.setItem('wellpack_admin_attempts', attempts)

    if (attempts >= 5) {
      sessionStorage.setItem(LOCK_KEY, JSON.stringify({ until: Date.now() + 30000 }))
      sessionStorage.removeItem('wellpack_admin_attempts')
      return {
        success: false,
        locked: true,
        message: 'Security Alert: 5 incorrect PIN attempts. Locked for 30 seconds.'
      }
    }

    return {
      success: false,
      message: `Incorrect PIN. (${5 - attempts} attempt${5 - attempts === 1 ? '' : 's'} remaining)`
    }
  },

  logoutAdmin() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH)
    notifySubscribers()
  },

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS))
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY))
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS))
    notifySubscribers()
  }
}
