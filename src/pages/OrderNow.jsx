import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ordersStore, calculateStrapSpecs } from '../data/ordersStore'
import { classifyOrderPriority } from '../services/aiAgentService'
import SectionTag from '../components/ui/SectionTag'
import Button from '../components/ui/Button'
import FadeUpWrapper from '../components/ui/FadeUpWrapper'

const STRAP_GRADES = [
  { id: 'Semi-Automatic Grade (Standard)', name: 'Semi-Automatic Grade', desc: 'Standard friction-weld strapping for table-top machines', defaultCore: 200, defaultMeters: 2000 },
  { id: 'Fully Automatic Grade (Virgin PP)', name: 'Fully Automatic Grade (Virgin)', desc: 'Ultra-low camber, consistent arch feeding for automated lines', defaultCore: 406, defaultMeters: 3000 },
  { id: 'Heavy Duty High-Tensile (Virgin PP)', name: 'Heavy Duty High-Tensile', desc: 'High break load for lumber, tiles, auto-parts & palletizing', defaultCore: 406, defaultMeters: 1800 },
  { id: 'Manual Hand Grade (Embossed)', name: 'Manual Hand Grade', desc: 'Embossed strap for manual tensioners & metal clips', defaultCore: 200, defaultMeters: 1200 },
]

const WIDTH_OPTIONS = [9, 12, 15, 19]
const THICKNESS_OPTIONS = [0.50, 0.55, 0.65, 0.70, 0.80, 0.85]
const COLOR_OPTIONS = [
  { name: 'Industrial Yellow', hex: '#FACC15', border: '#EAB308' },
  { name: 'White (Transparent)', hex: '#F8FAFC', border: '#CBD5E1' },
  { name: 'Navy Blue', hex: '#2563EB', border: '#1D4ED8' },
  { name: 'Carbon Black', hex: '#1E293B', border: '#0F172A' },
  { name: 'Emerald Green', hex: '#10B981', border: '#059669' },
  { name: 'Signal Red', hex: '#EF4444', border: '#DC2626' },
]

export default function OrderNow() {
  const [grade, setGrade] = useState(STRAP_GRADES[0].id)
  const [widthMm, setWidthMm] = useState(12)
  const [thicknessMm, setThicknessMm] = useState(0.65)
  const [color, setColor] = useState('Industrial Yellow')
  const [coreDiameterMm, setCoreDiameterMm] = useState(200)
  const [metersPerRoll, setMetersPerRoll] = useState(2000)
  const [rollsCount, setRollsCount] = useState(20)
  const [customPrinting, setCustomPrinting] = useState(false)
  const [printText, setPrintText] = useState('')

  // Client info
  const [companyName, setCompanyName] = useState('')
  const [clientName, setClientName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [expectedDeadline, setExpectedDeadline] = useState('')
  const [urgencyType, setUrgencyType] = useState('Standard')
  const [clientUrgencyNote, setClientUrgencyNote] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submittedOrder, setSubmittedOrder] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Live calculations
  const specs = useMemo(() => {
    return calculateStrapSpecs(widthMm, thicknessMm, metersPerRoll, grade)
  }, [widthMm, thicknessMm, metersPerRoll, grade])

  const totalKg = useMemo(() => {
    return parseFloat((specs.weightKgPerRoll * rollsCount).toFixed(1))
  }, [specs, rollsCount])

  const estimatedTotalInr = useMemo(() => {
    return specs.pricePerRoll * rollsCount
  }, [specs, rollsCount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!companyName.trim() || !clientName.trim() || !phone.trim() || !deliveryAddress.trim() || !expectedDeadline) {
      setErrorMsg('Please fill in all required fields marked with *')
      return
    }

    // Industrial Validation: Rolls Count
    const parsedRolls = parseInt(rollsCount, 10)
    if (isNaN(parsedRolls) || parsedRolls < 1) {
      setErrorMsg('Please specify a valid order quantity (minimum 1 roll).')
      return
    }

    // Industrial Validation: 10-digit Indian Mobile Number
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone / WhatsApp contact number.')
      return
    }
    const last10Digits = cleanPhone.slice(-10)
    if (!/^[6-9]\d{9}$/.test(last10Digits)) {
      setErrorMsg('Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.')
      return
    }

    // Industrial Validation: Email (if provided)
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g., purchase@company.com).')
      return
    }

    // Industrial Validation: GSTIN Format (if provided)
    if (gstin.trim()) {
      const gstinClean = gstin.trim().toUpperCase()
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstinClean)) {
        setErrorMsg('Invalid GSTIN format. Expected 15-character alphanumeric (e.g. 27AAAAA0000A1Z5).')
        return
      }
    }

    // Industrial Validation: Deadline cannot be in the past
    const todayStr = new Date().toISOString().split('T')[0]
    if (expectedDeadline < todayStr) {
      setErrorMsg('Target delivery date cannot be in the past. Please select a future date.')
      return
    }

    setSubmitting(true)

    try {
      const orderData = {
        strapGrade: grade,
        widthMm: Number(widthMm),
        thicknessMm: Number(thicknessMm),
        color,
        coreDiameterMm: Number(coreDiameterMm),
        metersPerRoll: Number(metersPerRoll),
        rollsCount: parsedRolls,
        customPrinting,
        printText: customPrinting ? printText : '',
        companyName: companyName.trim(),
        clientName: clientName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        deliveryAddress: deliveryAddress.trim(),
        gstin: gstin.trim().toUpperCase(),
        expectedDeadline,
        clientUrgencyNote: `${urgencyType}: ${clientUrgencyNote || 'No extra notes'}`,
        notes: specialInstructions.trim(),
      }

      // Run AI priority classifier
      const aiResult = await classifyOrderPriority(orderData)
      orderData.priority = aiResult.priority
      orderData.priorityReason = aiResult.priorityReason

      // Store in ordersStore
      const created = ordersStore.addOrder(orderData)
      setSubmittedOrder(created)
    } catch (err) {
      console.error(err)
      setErrorMsg('Failed to process order. Please try again or contact us via WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedColorObj = COLOR_OPTIONS.find(c => c.name === color) || COLOR_OPTIONS[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', paddingTop: '90px', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5vw' }}>
        
        {/* Header */}
        <FadeUpWrapper style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <SectionTag center>B2B Direct Order & Custom RFQ</SectionTag>
          <h1 className="display-lg" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', marginBottom: '1rem' }}>
            CUSTOM STRAP <span style={{ color: 'var(--orange)' }}>CONFIGURATOR</span>
          </h1>
          <p className="lead" style={{ maxWidth: '640px', margin: '0 auto' }}>
            Configure precision PP strapping bands tailored to your packaging machinery specs. Get real-time weight & strength metrics, set your required dispatch deadline, and receive priority factory scheduling.
          </p>
        </FadeUpWrapper>

        {submittedOrder ? (
          /* Confirmation View */
          <div style={{
            background: 'var(--navy-2)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            padding: '3.5rem 2.5rem',
            maxWidth: '780px',
            margin: '0 auto',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 1.5rem',
            }}>
              ✓
            </div>
            <h2 className="display-md" style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>
              ORDER RECEIVED SUCCESSFULLY!
            </h2>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--orange)', marginBottom: '1.5rem' }}>
              ORDER REF: {submittedOrder.id}
            </p>

            <div style={{
              background: 'rgba(15,23,42,0.7)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              textAlign: 'left',
              marginBottom: '2rem',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              lineHeight: 1.8,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Client: </span>
                  <strong>{submittedOrder.companyName}</strong> ({submittedOrder.clientName})
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Expected Deadline: </span>
                  <strong style={{ color: 'var(--orange)' }}>{submittedOrder.expectedDeadline}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Spec: </span>
                  <strong>{submittedOrder.widthMm}mm × {submittedOrder.thicknessMm}mm ({submittedOrder.color})</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Quantity: </span>
                  <strong>{submittedOrder.rollsCount} Rolls ({submittedOrder.totalWeightKg} kg)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>AI Priority: </span>
                  <strong style={{ color: submittedOrder.priority.includes('Critical') ? '#EF4444' : '#F59E0B' }}>
                    {submittedOrder.priority}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)' }}>Est. Value: </span>
                  <strong>₹{submittedOrder.estimatedValueInr?.toLocaleString('en-IN')} + GST</strong>
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--slate)', fontSize: '0.92rem', marginBottom: '2.5rem', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
              Our production engineer has received your specifications. A formal Proforma Invoice and dispatch timeline have been queued in our shop-floor system.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello Wellpack Industries, I have placed order ${submittedOrder.id} for ${submittedOrder.rollsCount} rolls (${submittedOrder.widthMm}mm ${submittedOrder.color}). Please confirm dispatch schedule.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  background: '#25D366', color: '#000', fontWeight: 600,
                  padding: '0.75rem 1.75rem', borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                💬 Confirm on WhatsApp
              </a>

              <Button
                variant="secondary"
                onClick={() => {
                  setSubmittedOrder(null)
                  setRollsCount(20)
                }}
              >
                Place Another Order
              </Button>
            </div>
          </div>
        ) : (
          /* Form & Live Spec Customizer */
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
              
              {/* Left Column: Technical Specifications */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* 1. Strap Grade Selection */}
                <div style={{ background: 'var(--navy-2)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ background: 'var(--orange)', color: '#000', fontWeight: 'bold', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.05em' }}>SELECT STRAP GRADE</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    {STRAP_GRADES.map(g => {
                      const active = grade === g.id
                      return (
                        <div
                          key={g.id}
                          onClick={() => {
                            setGrade(g.id)
                            setCoreDiameterMm(g.defaultCore)
                            setMetersPerRoll(g.defaultMeters)
                          }}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${active ? 'var(--orange)' : 'rgba(255,255,255,0.1)'}`,
                            background: active ? 'rgba(249, 115, 22, 0.08)' : 'rgba(15,23,42,0.4)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <strong style={{ color: active ? 'var(--orange)' : 'var(--white)', fontSize: '0.95rem' }}>{g.name}</strong>
                            {active && <span style={{ color: 'var(--orange)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>✔ SELECTED</span>}
                          </div>
                          <p style={{ color: 'var(--muted)', fontSize: '0.78rem', margin: 0 }}>{g.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Dimensions & Physical Specs */}
                <div style={{ background: 'var(--navy-2)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ background: 'var(--orange)', color: '#000', fontWeight: 'bold', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.05em' }}>DIMENSIONS & COLOR</h3>
                  </div>

                  {/* Width */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Strap Width (mm)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                      {WIDTH_OPTIONS.map(w => (
                        <button
                          type="button"
                          key={w}
                          onClick={() => setWidthMm(w)}
                          style={{
                            padding: '0.65rem 0',
                            textAlign: 'center',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${widthMm === w ? 'var(--orange)' : 'rgba(255,255,255,0.1)'}`,
                            background: widthMm === w ? 'var(--orange)' : 'rgba(15,23,42,0.6)',
                            color: widthMm === w ? '#000' : 'var(--white)',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                          }}
                        >
                          {w} mm
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Thickness */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Thickness (mm)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {THICKNESS_OPTIONS.map(t => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setThicknessMm(t)}
                          style={{
                            padding: '0.65rem 0',
                            textAlign: 'center',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${thicknessMm === t ? 'var(--orange)' : 'rgba(255,255,255,0.1)'}`,
                            background: thicknessMm === t ? 'var(--orange)' : 'rgba(15,23,42,0.6)',
                            color: thicknessMm === t ? '#000' : 'var(--white)',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.82rem',
                          }}
                        >
                          {t.toFixed(2)} mm
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Strap Color: <span style={{ color: 'var(--white)', fontWeight: 600 }}>{color}</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {COLOR_OPTIONS.map(c => (
                        <button
                          type="button"
                          key={c.name}
                          onClick={() => setColor(c.name)}
                          title={c.name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: c.hex,
                            border: color === c.name ? '3px solid var(--orange)' : `2px solid ${c.border}`,
                            boxShadow: color === c.name ? '0 0 12px rgba(249, 115, 22, 0.6)' : 'none',
                            transform: color === c.name ? 'scale(1.15)' : 'scale(1)',
                            transition: 'all 0.2s',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Paper Core & Length */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Paper Core Size
                      </label>
                      <select
                        value={coreDiameterMm}
                        onChange={e => setCoreDiameterMm(Number(e.target.value))}
                        style={{
                          width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                        }}
                      >
                        <option value={200}>200mm (Standard/Semi-Auto)</option>
                        <option value={406}>406mm (Jumbo/Fully-Auto)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Length per Roll (m)
                      </label>
                      <select
                        value={metersPerRoll}
                        onChange={e => setMetersPerRoll(Number(e.target.value))}
                        style={{
                          width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                        }}
                      >
                        <option value={1200}>1,200 Meters</option>
                        <option value={1500}>1,500 Meters</option>
                        <option value={1800}>1,800 Meters</option>
                        <option value={2000}>2,000 Meters</option>
                        <option value={3000}>3,000 Meters</option>
                        <option value={4000}>4,000 Meters</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Printing Option */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: customPrinting ? '0.75rem' : '0' }}>
                      <input
                        type="checkbox"
                        checked={customPrinting}
                        onChange={e => setCustomPrinting(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--orange)' }}
                      />
                      <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Add Custom Company Name / Logo Printing on Strap</span>
                    </label>

                    {customPrinting && (
                      <input
                        type="text"
                        placeholder="e.g. YOUR COMPANY NAME - SECURE PACKAGING"
                        value={printText}
                        onChange={e => setPrintText(e.target.value)}
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid var(--orange)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* 3. Quantity & Timeline Requirement */}
                <div style={{ background: 'var(--navy-2)', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ background: 'var(--orange)', color: '#000', fontWeight: 'bold', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>3</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.05em' }}>ORDER QUANTITY & DEADLINE</h3>
                  </div>

                  {/* Quantity & Weight Controls */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--slate)', textTransform: 'uppercase', margin: 0 }}>
                        Order Quantity (Rolls / Weight)
                      </label>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--orange)', fontWeight: 'bold' }}>
                        {rollsCount} Rolls = {totalKg} kg {totalKg >= 1000 ? `(${(totalKg / 1000).toFixed(2)} T)` : ''}
                      </span>
                    </div>

                    {/* Direct Numeric Input with Precision Stepping */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => setRollsCount(prev => Math.max(1, prev - 10))}
                        title="Decrease by 10 rolls"
                        style={{
                          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                          background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
                          border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem', cursor: 'pointer',
                        }}
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => setRollsCount(prev => Math.max(1, prev - 1))}
                        title="Decrease by 1 roll"
                        style={{
                          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                          background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
                          border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem', cursor: 'pointer',
                        }}
                      >
                        -1
                      </button>

                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={rollsCount}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10)
                          setRollsCount(isNaN(val) ? '' : Math.max(1, val))
                        }}
                        style={{
                          flex: 1, textAlign: 'center', fontWeight: 'bold',
                          fontFamily: 'var(--font-mono)', fontSize: '1rem',
                          background: 'var(--navy)', color: 'var(--orange)',
                          border: '1px solid var(--orange)', borderRadius: 'var(--radius-md)',
                          padding: '0.45rem',
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => setRollsCount(prev => (Number(prev) || 0) + 1)}
                        title="Increase by 1 roll"
                        style={{
                          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                          background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
                          border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem', cursor: 'pointer',
                        }}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => setRollsCount(prev => (Number(prev) || 0) + 10)}
                        title="Increase by 10 rolls"
                        style={{
                          padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
                          background: 'rgba(255,255,255,0.08)', color: 'var(--white)',
                          border: '1px solid rgba(255,255,255,0.15)', fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem', cursor: 'pointer',
                        }}
                      >
                        +10
                      </button>
                    </div>

                    {/* Smooth Stepping Range Slider */}
                    <input
                      type="range"
                      min="1"
                      max="500"
                      step="1"
                      value={rollsCount || 1}
                      onChange={e => setRollsCount(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--orange)', margin: '0.4rem 0 0.8rem' }}
                    />

                    {/* Quick Batch Presets */}
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {[10, 20, 50, 100, 250, 500].map(cnt => {
                        const batchWeight = Math.round(cnt * specs.weightKgPerRoll)
                        return (
                          <button
                            type="button"
                            key={cnt}
                            onClick={() => setRollsCount(cnt)}
                            style={{
                              flex: 1, minWidth: '55px', padding: '0.4rem 0.2rem', borderRadius: 'var(--radius-md)',
                              border: `1px solid ${rollsCount === cnt ? 'var(--orange)' : 'rgba(255,255,255,0.1)'}`,
                              background: rollsCount === cnt ? 'rgba(249,115,22,0.2)' : 'rgba(15,23,42,0.6)',
                              color: rollsCount === cnt ? 'var(--orange)' : 'var(--white)',
                              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                            }}
                          >
                            {cnt} Rolls
                            <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>
                              ~{batchWeight >= 1000 ? `${(batchWeight / 1000).toFixed(1)}T` : `${batchWeight}kg`}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Expected Delivery Date */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Target Delivery Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={expectedDeadline}
                        onChange={e => setExpectedDeadline(e.target.value)}
                        style={{
                          width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        Urgency Level
                      </label>
                      <select
                        value={urgencyType}
                        onChange={e => setUrgencyType(e.target.value)}
                        style={{
                          width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                          fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                        }}
                      >
                        <option value="Standard">Standard Schedule (Normal)</option>
                        <option value="High">Priority Queue (3-5 Days)</option>
                        <option value="Critical">🚨 Emergency Line Stop (&lt;48 Hours)</option>
                      </select>
                    </div>
                  </div>

                  {urgencyType === 'Critical' && (
                    <input
                      type="text"
                      placeholder="Why is it critical? (e.g. Export container loading on Friday)"
                      value={clientUrgencyNote}
                      onChange={e => setClientUrgencyNote(e.target.value)}
                      style={{
                        width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)',
                        background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', border: '1px solid #EF4444',
                        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                      }}
                    />
                  )}
                </div>

              </div>

              {/* Right Column: Live Spec Summary & Client Contact Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Real-time Technical Metrics Card */}
                <div style={{
                  background: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
                  padding: '2rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--orange)' }}>
                      ⚡ LIVE SPECIFICATION CALCULATOR
                    </span>
                    <span style={{
                      display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%',
                      background: selectedColorObj.hex, border: `1px solid ${selectedColorObj.border}`
                    }} />
                  </div>

                  <h3 className="display-sm" style={{ color: 'var(--white)', marginBottom: '1rem' }}>
                    {widthMm}mm × {thicknessMm}mm {grade.split(' ')[0]}
                  </h3>

                  {/* Metrics grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Net Weight / Roll</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--white)', fontWeight: 'bold' }}>
                        {specs.weightKgPerRoll} <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>kg</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Tensile Breaking Load</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--cyan)', fontWeight: 'bold' }}>
                        ≥ {specs.tensileStrengthKgf} <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>kgf</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Batch Weight</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--orange)', fontWeight: 'bold' }}>
                        {totalKg} <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>kg</span>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(15,23,42,0.6)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase' }}>Total Length</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', color: 'var(--green)', fontWeight: 'bold' }}>
                        {(metersPerRoll * rollsCount).toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>m</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Price summary */}
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '1rem',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>ESTIMATED TOTAL VALUE</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', color: 'var(--white)', fontWeight: 'bold' }}>
                        ₹{estimatedTotalInr.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: 'var(--slate)', fontWeight: 400 }}>+ 18% GST</span>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--cyan)' }}>
                      ₹{specs.pricePerRoll} / roll
                    </span>
                  </div>
                </div>

                {/* Client Company & Delivery Form */}
                <div style={{ background: 'var(--navy-2)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span style={{ background: 'var(--orange)', color: '#000', fontWeight: 'bold', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>4</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '0.05em' }}>CLIENT & DELIVERY DETAILS</h3>
                  </div>

                  {errorMsg && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Company / Enterprise Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tata Motors Ltd / Reliance Retail"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                          fontSize: '0.88rem',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Contact Person *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Name"
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          style={{
                            width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                            fontSize: '0.88rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          WhatsApp / Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          style={{
                            width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                            fontSize: '0.88rem',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="purchase@company.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          style={{
                            width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                            fontSize: '0.88rem',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          GSTIN Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="27AAAAA0000A1Z5"
                          value={gstin}
                          onChange={e => setGstin(e.target.value)}
                          style={{
                            width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                            fontSize: '0.88rem',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Delivery Factory / Warehouse Address *
                      </label>
                      <textarea
                        required
                        rows="2"
                        placeholder="Plot No, MIDC / Industrial Area, City, State, PIN"
                        value={deliveryAddress}
                        onChange={e => setDeliveryAddress(e.target.value)}
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                          fontSize: '0.88rem', resize: 'vertical',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Special Instructions / Packaging requirements
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shrink wrapped pallets required, specific transporter preference"
                        value={specialInstructions}
                        onChange={e => setSpecialInstructions(e.target.value)}
                        style={{
                          width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)',
                          background: 'var(--navy)', color: 'var(--white)', border: '1px solid rgba(255,255,255,0.15)',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '1rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--orange)',
                        color: '#000',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 18px rgba(249, 115, 22, 0.4)',
                        transition: 'all 0.2s',
                        opacity: submitting ? 0.7 : 1,
                      }}
                    >
                      {submitting ? 'PROCESSING WITH AI SCHEDULER...' : 'SUBMIT PRODUCTION ORDER →'}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
