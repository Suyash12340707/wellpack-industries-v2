import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ordersStore } from '../data/ordersStore'
import {
  classifyOrderPriority,
  auditInventoryRequirements,
  generateMachineBatchingAdvice,
  generateDailyShiftBriefing
} from '../services/aiAgentService'
import AdminLoginModal from '../components/admin/AdminLoginModal'
import JobWorkOrderModal from '../components/admin/JobWorkOrderModal'
import AiQuoteModal from '../components/admin/AiQuoteModal'

const STATUS_COLORS = {
  'Pending': { bg: 'rgba(234, 179, 8, 0.15)', text: '#FACC15', border: '#EAB308' },
  'In Production': { bg: 'rgba(6, 182, 212, 0.15)', text: '#22D3EE', border: '#06B6D4' },
  'Dispatched': { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: '#A855F7' },
  'Delivered': { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', border: '#22C55E' },
  'Cancelled': { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: '#EF4444' },
}

const PRIORITY_BADGES = {
  'P1-Critical': { label: '🚨 P1 Critical', bg: 'rgba(239, 68, 68, 0.2)', text: '#EF4444', border: '#EF4444' },
  'P2-High': { label: '⚡ P2 High', bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B', border: '#F59E0B' },
  'P3-Normal': { label: '🟢 P3 Normal', bg: 'rgba(34, 197, 94, 0.2)', text: '#22C55E', border: '#22C55E' },
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(ordersStore.isAdminAuthenticated())
  const [orders, setOrders] = useState(ordersStore.getOrders())
  const [inventory, setInventory] = useState(ordersStore.getInventory())
  const [clients, setClients] = useState(ordersStore.getClients())

  // Navigation tab
  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'ai-hub' | 'deadlines' | 'inventory' | 'clients' | 'analytics'

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')

  // Modals & Inspection
  const [selectedJobOrder, setSelectedJobOrder] = useState(null)
  const [selectedQuoteOrder, setSelectedQuoteOrder] = useState(null)
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null)

  // AI Hub state
  const [isAiAuditing, setIsAiAuditing] = useState(false)
  const [dailyBriefing, setDailyBriefing] = useState(null)

  // Custom Inventory Stock Management
  const [customStockAmounts, setCustomStockAmounts] = useState({})
  const [stockFeedback, setStockFeedback] = useState({})

  // Sync state on updates
  useEffect(() => {
    const unsubscribe = ordersStore.subscribe(() => {
      setIsAuthenticated(ordersStore.isAdminAuthenticated())
      setOrders(ordersStore.getOrders())
      setInventory(ordersStore.getInventory())
      setClients(ordersStore.getClients())
    })
    return () => unsubscribe()
  }, [])

  // KPI Calculations
  const kpis = useMemo(() => {
    const active = orders.filter(o => o.status === 'Pending' || o.status === 'In Production')
    const totalWeightKg = active.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0)
    const pipelineValue = active.reduce((sum, o) => sum + (o.estimatedValueInr || 0), 0)
    const criticalCount = active.filter(o => o.priority === 'P1-Critical').length
    const ppTotalStockKg = (inventory.ppVirginGranules?.currentKg || 0) + (inventory.ppSemiVirginGranules?.currentKg || 0)
    
    const audit = auditInventoryRequirements(orders, inventory)

    return {
      activeCount: active.length,
      totalWeightTonnes: (totalWeightKg / 1000).toFixed(2),
      pipelineValue,
      criticalCount,
      ppTotalStockKg,
      shortfallAlertsCount: audit.alerts.length,
    }
  }, [orders, inventory])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.companyName && o.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.clientName && o.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.color && o.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.strapGrade && o.strapGrade.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchStatus = statusFilter === 'All' || o.status === statusFilter
      const matchPriority = priorityFilter === 'All' || o.priority === priorityFilter

      return matchSearch && matchStatus && matchPriority
    })
  }, [orders, searchQuery, statusFilter, priorityFilter])

  // AI inventory audit
  const inventoryAudit = useMemo(() => {
    return auditInventoryRequirements(orders, inventory)
  }, [orders, inventory])

  // Machine batch advice
  const batchAdvice = useMemo(() => {
    return generateMachineBatchingAdvice(orders)
  }, [orders])

  const handleStatusChange = (orderId, newStatus) => {
    ordersStore.updateOrderStatus(orderId, newStatus)
  }

  const handlePriorityChange = (orderId, newPriority) => {
    ordersStore.updateOrderPriority(orderId, newPriority)
  }

  const handleDeleteOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      ordersStore.deleteOrder(orderId)
    }
  }

  const handleRunAiAudit = async () => {
    setIsAiAuditing(true)
    const briefing = generateDailyShiftBriefing(orders, inventory)
    setDailyBriefing(briefing)

    // Re-evaluate pending orders with priority classifier
    for (const order of orders.filter(o => o.status === 'Pending')) {
      const res = await classifyOrderPriority(order, orders, inventory)
      ordersStore.updateOrderPriority(order.id, res.priority, res.priorityReason)
    }
    setTimeout(() => setIsAiAuditing(false), 600)
  }

  const handleAddStock = (itemId, amount) => {
    ordersStore.updateStock(itemId, amount)
  }

  if (!isAuthenticated) {
    return <AdminLoginModal onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1120', color: '#F8FAFC', paddingTop: '80px', paddingBottom: '4rem' }}>
      
      {/* Top Admin Header Bar */}
      <div style={{
        background: 'var(--navy-2)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem 5vw',
        position: 'sticky',
        top: '64px',
        zIndex: 100,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{
              background: 'var(--orange)', color: '#000', fontFamily: 'var(--font-mono)',
              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 'bold'
            }}>
              OWNER PORTAL
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', letterSpacing: '0.05em', margin: 0 }}>
              WELLPACK PRODUCTION DASHBOARD
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to="/order"
              target="_blank"
              style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', textDecoration: 'none',
              }}
            >
              + Place Customer Order
            </Link>

            <button
              onClick={() => {
                if (window.confirm('Reset all demo orders and inventory to initial defaults?')) {
                  ordersStore.resetAllData()
                }
              }}
              style={{
                padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              }}
            >
              🔄 Reset Demo Data
            </button>

            <button
              onClick={() => ordersStore.logoutAdmin()}
              style={{
                padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                border: 'none', background: 'rgba(239, 68, 68, 0.2)', color: '#F87171',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold',
              }}
            >
              🔒 Lock Portal
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '1.5rem auto 0', padding: '0 5vw' }}>
        
        {/* KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          <div style={{ background: 'var(--navy-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Active Production Queue</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 'bold', color: 'var(--white)', marginTop: '0.25rem' }}>
              {kpis.activeCount} <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 400 }}>Orders</span>
            </div>
          </div>

          <div style={{ background: 'var(--navy-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Production Volume</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 'bold', color: 'var(--cyan)', marginTop: '0.25rem' }}>
              {kpis.totalWeightTonnes} <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 400 }}>Tonnes</span>
            </div>
          </div>

          <div style={{ background: 'var(--navy-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `1px solid ${kpis.criticalCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.06)'}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: kpis.criticalCount > 0 ? '#EF4444' : 'var(--muted)', textTransform: 'uppercase' }}>
              🚨 Critical Deadlines
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 'bold', color: kpis.criticalCount > 0 ? '#EF4444' : 'var(--white)', marginTop: '0.25rem' }}>
              {kpis.criticalCount} <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 400 }}>Urgent</span>
            </div>
          </div>

          <div style={{ background: 'var(--navy-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Pipeline Order Value</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 'bold', color: 'var(--green)', marginTop: '0.25rem' }}>
              ₹{(kpis.pipelineValue / 100000).toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 400 }}>Lakh</span>
            </div>
          </div>

          <div style={{ background: 'var(--navy-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `1px solid ${kpis.shortfallAlertsCount > 0 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.06)'}` }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase' }}>PP Granules In Stock</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 'bold', color: 'var(--orange)', marginTop: '0.25rem' }}>
              {(kpis.ppTotalStockKg / 1000).toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 400 }}>Tonnes</span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.25rem'
        }}>
          {[
            { id: 'orders', label: '📋 Orders & Production', count: orders.length },
            { id: 'ai-hub', label: '🤖 AI Operations Hub', count: inventoryAudit.alerts.length > 0 ? '⚠️ Alert' : 'Active' },
            { id: 'deadlines', label: '⏱️ Deadlines & Timeline', count: kpis.criticalCount ? `${kpis.criticalCount} due` : null },
            { id: 'inventory', label: '📦 Raw Material Inventory' },
            { id: 'clients', label: '👥 Clients & CRM', count: clients.length },
            { id: 'analytics', label: '📊 Demand & Revenue' },
          ].map(tab => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  background: active ? 'var(--navy-2)' : 'transparent',
                  color: active ? 'var(--orange)' : 'var(--slate)',
                  borderTop: active ? '2px solid var(--orange)' : '2px solid transparent',
                  borderLeft: active ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  borderRight: active ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  borderBottom: active ? 'none' : 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: active ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}
              >
                {tab.label}
                {tab.count && (
                  <span style={{
                    background: active ? 'var(--orange)' : 'rgba(255,255,255,0.1)',
                    color: active ? '#000' : 'var(--white)',
                    fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '10px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* TAB 1: ORDERS & PRODUCTION TABLE */}
        {activeTab === 'orders' && (
          <div>
            {/* Search & Filter Controls */}
            <div style={{
              background: 'var(--navy-2)', padding: '1.25rem', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
            }}>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 Search by Order ID, Client, Color, Strap spec..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1, minWidth: '220px', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                    fontSize: '0.85rem',
                  }}
                />

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{
                    padding: '0.65rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Production">In Production</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  style={{
                    padding: '0.65rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                  }}
                >
                  <option value="All">All Priorities</option>
                  <option value="P1-Critical">🚨 P1-Critical</option>
                  <option value="P2-High">⚡ P2-High</option>
                  <option value="P3-Normal">🟢 P3-Normal</option>
                </select>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
              </div>
            </div>

            {/* Orders Table */}
            <div style={{
              background: 'var(--navy-2)', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto',
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Order Ref</th>
                    <th style={{ padding: '1rem' }}>Client / Company</th>
                    <th style={{ padding: '1rem' }}>Strap Specifications</th>
                    <th style={{ padding: '1rem' }}>Quantity & Weight</th>
                    <th style={{ padding: '1rem' }}>Target Deadline</th>
                    <th style={{ padding: '1rem' }}>AI Priority</th>
                    <th style={{ padding: '1rem' }}>Production Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const statCol = STATUS_COLORS[order.status] || STATUS_COLORS['Pending']
                      const priBadge = PRIORITY_BADGES[order.priority] || PRIORITY_BADGES['P2-High']
                      
                      const isOverdue = new Date(order.expectedDeadline) < new Date() && order.status !== 'Delivered' && order.status !== 'Dispatched'

                      return (
                        <tr
                          key={order.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 0.15s',
                          }}
                        >
                          {/* Order Ref */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--white)' }}>
                              {order.id}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                              {order.createdAt}
                            </div>
                          </td>

                          {/* Client */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--white)' }}>{order.companyName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{order.clientName} ({order.phone})</div>
                          </td>

                          {/* Specifications */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--orange)' }}>
                              <span>{order.widthMm}mm × {order.thicknessMm}mm</span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>• {order.color}</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                              {order.strapGrade.split(' ')[0]} | {order.coreDiameterMm}mm Core
                              {order.customPrinting && <span style={{ color: 'var(--cyan)', marginLeft: '0.3rem' }}>[Printed]</span>}
                            </div>
                          </td>

                          {/* Quantity & Weight */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                              {order.rollsCount} Rolls
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                              {order.totalWeightKg} kg (~{(order.totalMeters / 1000).toFixed(0)} km)
                            </div>
                          </td>

                          {/* Deadline */}
                          <td style={{ padding: '1rem' }}>
                            <div style={{
                              fontFamily: 'var(--font-mono)', fontWeight: 'bold',
                              color: isOverdue ? '#EF4444' : 'var(--white)',
                            }}>
                              {order.expectedDeadline}
                            </div>
                            {isOverdue && (
                              <div style={{ fontSize: '0.68rem', color: '#EF4444', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                                ⚠️ DUE / EXPEDITE
                              </div>
                            )}
                          </td>

                          {/* AI Priority */}
                          <td style={{ padding: '1rem' }}>
                            <div
                              title={order.priorityReason}
                              style={{
                                display: 'inline-block',
                                background: priBadge.bg,
                                color: priBadge.text,
                                border: `1px solid ${priBadge.border}`,
                                borderRadius: '4px',
                                padding: '0.25rem 0.55rem',
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 'bold',
                                cursor: 'help',
                              }}
                            >
                              {priBadge.label}
                            </div>
                          </td>

                          {/* Status Dropdown */}
                          <td style={{ padding: '1rem' }}>
                            <select
                              value={order.status}
                              onChange={e => handleStatusChange(order.id, e.target.value)}
                              style={{
                                background: statCol.bg,
                                color: statCol.text,
                                border: `1px solid ${statCol.border}`,
                                borderRadius: '4px',
                                padding: '0.35rem 0.6rem',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                              }}
                            >
                              <option value="Pending" style={{ background: '#0F172A', color: '#FFF' }}>Pending</option>
                              <option value="In Production" style={{ background: '#0F172A', color: '#FFF' }}>In Production</option>
                              <option value="Dispatched" style={{ background: '#0F172A', color: '#FFF' }}>Dispatched</option>
                              <option value="Delivered" style={{ background: '#0F172A', color: '#FFF' }}>Delivered</option>
                              <option value="Cancelled" style={{ background: '#0F172A', color: '#FFF' }}>Cancelled</option>
                            </select>
                          </td>

                          {/* Action Buttons */}
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => setSelectedJobOrder(order)}
                                title="Print Factory Job Work Order"
                                style={{
                                  padding: '0.35rem 0.6rem', borderRadius: '4px',
                                  background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
                                  fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                                }}
                              >
                                🖨️ Card
                              </button>

                              <button
                                onClick={() => setSelectedQuoteOrder(order)}
                                title="Generate AI B2B Quote & WhatsApp Message"
                                style={{
                                  padding: '0.35rem 0.6rem', borderRadius: '4px',
                                  background: 'rgba(249, 115, 22, 0.2)', color: 'var(--orange)',
                                  fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                                }}
                              >
                                🤖 Quote
                              </button>

                              <button
                                onClick={() => setSelectedDetailOrder(order)}
                                title="Inspect Full Order Specs"
                                style={{
                                  padding: '0.35rem 0.6rem', borderRadius: '4px',
                                  background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan)',
                                  fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                                }}
                              >
                                👁️
                              </button>

                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                title="Delete Order"
                                style={{
                                  padding: '0.35rem 0.6rem', borderRadius: '4px',
                                  background: 'rgba(239, 68, 68, 0.1)', color: '#F87171',
                                  fontSize: '0.75rem', fontFamily: 'var(--font-mono)',
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>

                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: AI OPERATIONS COMMAND CENTER */}
        {activeTab === 'ai-hub' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
            
            {/* AI Production Audit Trigger & Daily Shift Briefing */}
            <div style={{ background: 'var(--navy-2)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🤖</span>
                  <h3 className="display-sm" style={{ margin: 0 }}>EXECUTIVE SHIFT BRIEFING</h3>
                </div>

                <button
                  onClick={handleRunAiAudit}
                  disabled={isAiAuditing}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                    background: 'var(--orange)', color: '#000', fontWeight: 'bold',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isAiAuditing ? 'Auditing System...' : '⚡ Run AI Audit'}
                </button>
              </div>

              <p style={{ color: 'var(--slate)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                The autonomous AI agent audits active extrusion capacity, incoming client deadlines, and inventory bottlenecks to build a streamlined daily dispatch plan.
              </p>

              {dailyBriefing ? (
                <div style={{
                  background: 'rgba(15,23,42,0.8)', padding: '1.25rem', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                }}>
                  <div style={{ color: 'var(--orange)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    SHIFT REPORT • {dailyBriefing.timestamp}
                  </div>
                  <p style={{ color: 'var(--white)', marginBottom: '1rem', lineHeight: 1.6 }}>
                    {dailyBriefing.summaryText}
                  </p>
                  
                  {dailyBriefing.topCriticalOrders.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                      <span style={{ color: '#EF4444', fontWeight: 'bold' }}>Priority Fast-Track Queue:</span>
                      <ul style={{ marginTop: '0.5rem', listStyle: 'disc', paddingLeft: '1.25rem', color: 'var(--slate)' }}>
                        {dailyBriefing.topCriticalOrders.map(o => (
                          <li key={o.id}>
                            <strong>{o.id}</strong> ({o.companyName}) — {o.rollsCount} rolls of {o.widthMm}mm {o.color}. (Due: {o.expectedDeadline})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  background: 'rgba(15,23,42,0.4)', padding: '2rem', borderRadius: 'var(--radius-md)',
                  textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)',
                }}>
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                    Click "Run AI Audit" above to compile today's production briefing.
                  </span>
                </div>
              )}
            </div>

            {/* Extruder Machine Batching Optimizer */}
            <div style={{ background: 'var(--navy-2)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                <h3 className="display-sm" style={{ margin: 0 }}>EXTRUDER BATCH OPTIMIZER</h3>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                AI grouping to minimize dye replacement and barrel purging downtime:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {batchAdvice.map(b => (
                  <div key={b.title} style={{
                    background: 'rgba(15,23,42,0.6)', padding: '1rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ color: 'var(--cyan)', fontSize: '0.9rem' }}>{b.title}</strong>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--orange)' }}>
                        {b.totalKg} kg ({b.ordersCount} orders)
                      </span>
                    </div>
                    <p style={{ color: 'var(--slate)', fontSize: '0.78rem', margin: '0 0 0.5rem' }}>
                      {b.recommendation}
                    </p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      Linked orders: {b.orderIds.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Deficit & Material Shortage Alerts */}
            <div style={{ background: 'var(--navy-2)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <h3 className="display-sm" style={{ margin: 0 }}>RAW MATERIAL BOTTLENECK AUDIT</h3>
              </div>

              {inventoryAudit.alerts.length === 0 ? (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '1.25rem', borderRadius: 'var(--radius-md)', color: '#4ADE80',
                  fontFamily: 'var(--font-mono)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                  <span>✓</span>
                  <span>Healthy Material Reserves: Raw PP polymer granules, masterbatches, and paper cores are sufficient for all queued orders.</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                  {inventoryAudit.alerts.map((alt, idx) => (
                    <div key={idx} style={{
                      background: alt.type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      border: `1px solid ${alt.type === 'danger' ? '#EF4444' : '#F59E0B'}`,
                      borderRadius: 'var(--radius-md)', padding: '1.25rem',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        color: alt.type === 'danger' ? '#FCA5A5' : '#FDE68A', fontWeight: 'bold', marginBottom: '0.5rem'
                      }}>
                        <span>{alt.type === 'danger' ? '🚨 CRITICAL SHORTFALL' : '⚠️ BUFFER WARNING'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{alt.item}</span>
                      </div>
                      <p style={{ color: 'var(--white)', fontSize: '0.82rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        {alt.message}
                      </p>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--orange)' }}>
                        AI Recommendation: {alt.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: DEADLINES & PRODUCTION TIMELINE */}
        {activeTab === 'deadlines' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Urgent Lane (<48h) */}
            <div style={{ background: 'var(--navy-2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderTop: '3px solid #EF4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#EF4444', letterSpacing: '0.05em', margin: 0 }}>
                  🚨 EXPEDITE / DUE &lt;48H
                </h4>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {orders.filter(o => o.priority === 'P1-Critical' && o.status !== 'Delivered').length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.filter(o => o.priority === 'P1-Critical' && o.status !== 'Delivered').map(o => (
                  <div key={o.id} style={{ background: 'rgba(15,23,42,0.7)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: 'var(--white)', fontSize: '0.85rem' }}>{o.companyName}</strong>
                      <span style={{ color: '#EF4444', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 'bold' }}>{o.expectedDeadline}</span>
                    </div>
                    <div style={{ color: 'var(--orange)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      {o.rollsCount} rolls ({o.widthMm}mm {o.color})
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.72rem', margin: '0.4rem 0 0' }}>{o.clientUrgencyNote || o.priorityReason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Medium Lane (3-5 Days) */}
            <div style={{ background: 'var(--navy-2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderTop: '3px solid #F59E0B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#F59E0B', letterSpacing: '0.05em', margin: 0 }}>
                  ⚡ IN QUEUE (3-5 DAYS)
                </h4>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {orders.filter(o => o.priority === 'P2-High' && o.status !== 'Delivered').length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.filter(o => o.priority === 'P2-High' && o.status !== 'Delivered').map(o => (
                  <div key={o.id} style={{ background: 'rgba(15,23,42,0.7)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: 'var(--white)', fontSize: '0.85rem' }}>{o.companyName}</strong>
                      <span style={{ color: '#F59E0B', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{o.expectedDeadline}</span>
                    </div>
                    <div style={{ color: 'var(--orange)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      {o.rollsCount} rolls ({o.widthMm}mm {o.color})
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.72rem', margin: '0.4rem 0 0' }}>{o.priorityReason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Lane (Next Week & Beyond) */}
            <div style={{ background: 'var(--navy-2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', borderTop: '3px solid #10B981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#10B981', letterSpacing: '0.05em', margin: 0 }}>
                  🟢 SCHEDULED STANDARD
                </h4>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {orders.filter(o => o.priority === 'P3-Normal' && o.status !== 'Delivered').length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {orders.filter(o => o.priority === 'P3-Normal' && o.status !== 'Delivered').map(o => (
                  <div key={o.id} style={{ background: 'rgba(15,23,42,0.7)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: 'var(--white)', fontSize: '0.85rem' }}>{o.companyName}</strong>
                      <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{o.expectedDeadline}</span>
                    </div>
                    <div style={{ color: 'var(--orange)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                      {o.rollsCount} rolls ({o.widthMm}mm {o.color})
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: RAW MATERIAL INVENTORY */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {Object.entries(inventory).map(([key, item]) => {
                const currentVal = item.currentKg !== undefined ? item.currentKg : item.currentUnits
                const minThreshold = item.minThresholdKg !== undefined ? item.minThresholdKg : item.minThresholdUnits
                const unit = item.unit
                const isLow = currentVal <= minThreshold
                const customAmount = customStockAmounts[key] || ''
                const feedback = stockFeedback[key]

                const handleCustomChange = (delta) => {
                  const num = parseFloat(customAmount)
                  if (isNaN(num) || num <= 0) return
                  const change = delta > 0 ? num : -num
                  handleAddStock(key, change)
                  setCustomStockAmounts(prev => ({ ...prev, [key]: '' }))
                  setStockFeedback(prev => ({
                    ...prev,
                    [key]: `${change > 0 ? '+' : ''}${change} ${unit} logged`
                  }))
                  setTimeout(() => {
                    setStockFeedback(prev => ({ ...prev, [key]: null }))
                  }, 2500)
                }

                return (
                  <div key={key} style={{
                    background: 'var(--navy-2)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isLow ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.08)'}`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--white)' }}>{item.name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>Min Buffer: {minThreshold} {unit}</div>
                        </div>
                        {isLow && (
                          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444', fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                            LOW STOCK
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 'bold', color: isLow ? '#EF4444' : 'var(--orange)' }}>
                          {currentVal.toLocaleString()} <span style={{ fontSize: '0.9rem', color: 'var(--slate)', fontWeight: 400 }}>{unit}</span>
                        </div>
                        {feedback && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--green)' }}>
                            ✓ {feedback}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {/* Precise Custom Inward & Deduct Form */}
                      <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.75rem' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                          Log Exact Material (Custom {unit})
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            placeholder={`Qty in ${unit} (e.g. 15)`}
                            value={customAmount}
                            onChange={e => setCustomStockAmounts({ ...customStockAmounts, [key]: e.target.value })}
                            style={{
                              flex: 1, padding: '0.4rem 0.6rem', background: 'var(--navy)',
                              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-sm)',
                              color: 'var(--white)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleCustomChange(1)}
                            disabled={!customAmount || parseFloat(customAmount) <= 0}
                            style={{
                              padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)',
                              background: 'var(--green)', color: '#000', fontWeight: 'bold',
                              fontFamily: 'var(--font-mono)', fontSize: '0.75rem', border: 'none',
                              cursor: customAmount ? 'pointer' : 'not-allowed', opacity: customAmount ? 1 : 0.5,
                            }}
                          >
                            + Inward
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCustomChange(-1)}
                            disabled={!customAmount || parseFloat(customAmount) <= 0}
                            title="Log damage, wastage or defect scrap"
                            style={{
                              padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)',
                              background: 'rgba(239, 68, 68, 0.2)', color: '#F87171',
                              border: '1px solid rgba(239, 68, 68, 0.4)', fontFamily: 'var(--font-mono)',
                              fontSize: '0.75rem', cursor: customAmount ? 'pointer' : 'not-allowed',
                              opacity: customAmount ? 1 : 0.5,
                            }}
                          >
                            - Scrap
                          </button>
                        </div>
                      </div>

                      {/* Quick Preset Buttons */}
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {[
                          { label: unit === 'kg' ? '+10 kg' : '+10 pcs', amt: 10 },
                          { label: unit === 'kg' ? '+50 kg' : '+50 pcs', amt: 50 },
                          { label: unit === 'kg' ? '+500 kg' : '+100 pcs', amt: unit === 'kg' ? 500 : 100 },
                          { label: unit === 'kg' ? '+1 Tonne' : '+250 pcs', amt: unit === 'kg' ? 1000 : 250, bold: true },
                        ].map((btn, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddStock(key, btn.amt)}
                            style={{
                              flex: 1, padding: '0.4rem 0.2rem', borderRadius: 'var(--radius-sm)',
                              background: btn.bold ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.06)',
                              color: btn.bold ? 'var(--orange)' : 'var(--white)',
                              border: btn.bold ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                              fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: btn.bold ? 'bold' : 'normal',
                              cursor: 'pointer',
                            }}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CLIENTS & CRM */}
        {activeTab === 'clients' && (
          <div style={{
            background: 'var(--navy-2)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Client ID</th>
                  <th style={{ padding: '1rem' }}>Company & Contact</th>
                  <th style={{ padding: '1rem' }}>Location</th>
                  <th style={{ padding: '1rem' }}>Tier</th>
                  <th style={{ padding: '1rem' }}>Total Orders</th>
                  <th style={{ padding: '1rem' }}>Lifetime Volume</th>
                  <th style={{ padding: '1rem' }}>Preferred Specs</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Direct Contact</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--orange)' }}>
                      {c.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--white)' }}>{c.companyName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{c.contactPerson}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--slate)' }}>
                      {c.city}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: c.tier === 'Enterprise' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.08)',
                        color: c.tier === 'Enterprise' ? 'var(--cyan)' : 'var(--white)',
                        padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold'
                      }}>
                        {c.tier}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>
                      {c.totalOrders}
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', color: 'var(--orange)', fontWeight: 'bold' }}>
                      {c.lifetimeKg?.toLocaleString()} kg
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
                      {c.preferredSpecs}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          background: '#25D366', color: '#000', padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 'bold',
                          textDecoration: 'none', fontFamily: 'var(--font-mono)',
                        }}
                      >
                        💬 WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 6: DEMAND & REVENUE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
            
            <div style={{ background: 'var(--navy-2)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="display-sm" style={{ marginBottom: '1.5rem' }}>STRAP WIDTH DEMAND</h3>
              
              {[
                { width: '12mm (Auto/Semi-Auto)', percentage: 48, color: 'var(--orange)' },
                { width: '15mm (Heavy Pallet)', percentage: 28, color: 'var(--cyan)' },
                { width: '9mm (Carton strapping)', percentage: 16, color: 'var(--green)' },
                { width: '19mm (High-Tensile)', percentage: 8, color: '#A855F7' },
              ].map(item => (
                <div key={item.width} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--white)' }}>{item.width}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: item.color }}>{item.percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--navy-2)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="display-sm" style={{ marginBottom: '1.5rem' }}>MONTHLY OUTPUT TREND (TONNES)</h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '1rem', paddingTop: '2rem' }}>
                {[
                  { month: 'Apr', value: 38 },
                  { month: 'May', value: 42 },
                  { month: 'Jun', value: 45 },
                  { month: 'Jul', value: 40 },
                  { month: 'Aug', value: 54 },
                  { month: 'Sep', value: 62 },
                ].map(bar => (
                  <div key={bar.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--orange)', marginBottom: '0.3rem' }}>
                      {bar.value}T
                    </div>
                    <div style={{
                      width: '100%', height: `${(bar.value / 65) * 100}%`,
                      background: 'linear-gradient(to top, var(--orange-dark), var(--orange))',
                      borderRadius: '4px 4px 0 0',
                    }} />
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                      {bar.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: Printable Job Card */}
      {selectedJobOrder && (
        <JobWorkOrderModal
          order={selectedJobOrder}
          onClose={() => setSelectedJobOrder(null)}
        />
      )}

      {/* MODAL: AI Quotation */}
      {selectedQuoteOrder && (
        <AiQuoteModal
          order={selectedQuoteOrder}
          onClose={() => setSelectedQuoteOrder(null)}
        />
      )}

      {/* MODAL: Detailed Specs Inspection */}
      {selectedDetailOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div style={{
            background: 'var(--navy-2)', borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.1)', maxWidth: '600px', width: '100%',
            padding: '2rem', position: 'relative', maxHeight: '85vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setSelectedDetailOrder(null)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--slate)', fontSize: '1.2rem' }}
            >
              ✕
            </button>

            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--orange)', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              ORDER SPECIFICATION DETAILS
            </div>
            <h3 className="display-sm" style={{ marginBottom: '1.25rem' }}>{selectedDetailOrder.id}</h3>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: 2, background: 'var(--navy)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <div><strong style={{ color: 'var(--muted)' }}>Client: </strong> {selectedDetailOrder.companyName} ({selectedDetailOrder.clientName})</div>
              <div><strong style={{ color: 'var(--muted)' }}>Contact: </strong> {selectedDetailOrder.phone} | {selectedDetailOrder.email || 'N/A'}</div>
              <div><strong style={{ color: 'var(--muted)' }}>Delivery Address: </strong> {selectedDetailOrder.deliveryAddress}</div>
              <div><strong style={{ color: 'var(--muted)' }}>Grade: </strong> {selectedDetailOrder.strapGrade}</div>
              <div><strong style={{ color: 'var(--muted)' }}>Dimensions: </strong> {selectedDetailOrder.widthMm}mm Width × {selectedDetailOrder.thicknessMm}mm Thickness</div>
              <div><strong style={{ color: 'var(--muted)' }}>Color: </strong> {selectedDetailOrder.color}</div>
              <div><strong style={{ color: 'var(--muted)' }}>Quantity: </strong> {selectedDetailOrder.rollsCount} Rolls ({selectedDetailOrder.totalWeightKg} kg)</div>
              <div><strong style={{ color: 'var(--muted)' }}>Meters / Roll: </strong> ~{selectedDetailOrder.metersPerRoll} m (Total: {selectedDetailOrder.totalMeters?.toLocaleString()} m)</div>
              <div><strong style={{ color: 'var(--muted)' }}>Core Diameter: </strong> {selectedDetailOrder.coreDiameterMm} mm</div>
              <div><strong style={{ color: 'var(--muted)' }}>Tensile Strength: </strong> ≥ {selectedDetailOrder.tensileStrengthKgf} kgf</div>
              <div><strong style={{ color: 'var(--muted)' }}>Deadline: </strong> {selectedDetailOrder.expectedDeadline}</div>
              <div><strong style={{ color: 'var(--muted)' }}>AI Priority: </strong> {selectedDetailOrder.priority}</div>
              <div><strong style={{ color: 'var(--muted)' }}>AI Rationale: </strong> {selectedDetailOrder.priorityReason}</div>
              {selectedDetailOrder.customPrinting && (
                <div><strong style={{ color: 'var(--muted)' }}>Print Text: </strong> "{selectedDetailOrder.printText}"</div>
              )}
              {selectedDetailOrder.notes && (
                <div><strong style={{ color: 'var(--muted)' }}>Notes: </strong> {selectedDetailOrder.notes}</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
