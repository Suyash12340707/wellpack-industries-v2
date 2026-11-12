export default function JobWorkOrderModal({ order, onClose }) {
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      overflowY: 'auto',
    }}>
      <div style={{
        background: '#FFFFFF',
        color: '#0F172A',
        borderRadius: '8px',
        maxWidth: '750px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        padding: '2.5rem',
        position: 'relative',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: '#F1F5F9', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', fontSize: '1.2rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#475569',
          }}
        >
          ✕
        </button>

        {/* Printable Area */}
        <div id="printable-job-card">
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            borderBottom: '3px solid #F97316', paddingBottom: '1.25rem', marginBottom: '1.5rem',
          }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.05em', color: '#0F172A', fontFamily: "'Bebas Neue', sans-serif" }}>
                WELLPACK INDUSTRIES
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'monospace' }}>
                PLASTIC EXTRUSION & STRAPPING DIVISION • PUNE, INDIA
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                background: order.priority?.includes('Critical') ? '#EF4444' : order.priority?.includes('High') ? '#F59E0B' : '#10B981',
                color: '#FFF', padding: '0.25rem 0.75rem', borderRadius: '4px',
                fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block',
                fontFamily: 'monospace',
              }}>
                {order.priority || 'STANDARD QUEUE'}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                {order.id}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '0.5rem', borderRadius: '4px', marginBottom: '1.5rem', border: '1px dashed #CBD5E1' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🏭 SHOP-FLOOR PRODUCTION WORK ORDER & QC TRAVELER
            </span>
          </div>

          {/* Client & Schedule Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Customer / Consignee</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>{order.companyName}</div>
              <div style={{ color: '#475569', fontSize: '0.8rem' }}>Attn: {order.clientName} ({order.phone})</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.3rem' }}>{order.deliveryAddress}</div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>Schedule & Target Dispatch</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#DC2626', marginTop: '0.2rem' }}>
                TARGET DISPATCH: {order.expectedDeadline}
              </div>
              <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.2rem' }}>Order Created: {order.createdAt}</div>
              <div style={{ color: '#475569', fontSize: '0.8rem' }}>Status: <strong>{order.status}</strong></div>
            </div>
          </div>

          {/* Extrusion Line Technical Parameters */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0F172A', color: '#FFF', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.8rem' }}>PARAMETER</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>MANUFACTURING SPEC</th>
                <th style={{ padding: '0.6rem 0.8rem' }}>TOLERANCE</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Strap Grade & Material</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#0F172A' }}>{order.strapGrade}</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>100% Homopolymer</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Strap Width</td>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#D97706' }}>{order.widthMm} mm</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>± 0.35 mm</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Strap Thickness</td>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#D97706' }}>{order.thicknessMm} mm</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>± 0.03 mm</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Strap Color / Embossing</td>
                <td style={{ padding: '0.6rem 0.8rem' }}>{order.color} (Cross Diamond Embossed)</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>Visual standard</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Paper Core Diameter</td>
                <td style={{ padding: '0.6rem 0.8rem' }}>{order.coreDiameterMm} mm ({order.coreDiameterMm === 406 ? 'Jumbo Arch' : 'Standard'})</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>± 2 mm</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Total Quantity Required</td>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700 }}>{order.rollsCount} Rolls ({order.totalWeightKg} kg)</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>~{order.metersPerRoll} m/roll</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 600 }}>Min Tensile Breaking Load</td>
                <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#0284C7' }}>≥ {order.tensileStrengthKgf} kgf</td>
                <td style={{ padding: '0.6rem 0.8rem', color: '#64748B' }}>BIS Standard</td>
              </tr>
              {order.customPrinting && (
                <tr style={{ background: '#FEF3C7', borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '0.6rem 0.8rem', fontWeight: 700, color: '#B45309' }}>Printing Cylinder Text</td>
                  <td colSpan="2" style={{ padding: '0.6rem 0.8rem', fontWeight: 700, fontFamily: 'monospace' }}>
                    "{order.printText || 'CUSTOM LOGO'}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Quality Assurance Traveler */}
          <div style={{ border: '1px solid #CBD5E1', borderRadius: '6px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: '#475569' }}>
              Quality Control Verification (To be signed by QA Inspector)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              <div style={{ border: '1px dashed #CBD5E1', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Width & Thickness</div>
                <div style={{ height: '24px' }}></div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>[ ] Pass</div>
              </div>
              <div style={{ border: '1px dashed #CBD5E1', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Tensile Break Test</div>
                <div style={{ height: '24px' }}></div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>[ ] Pass</div>
              </div>
              <div style={{ border: '1px dashed #CBD5E1', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Camber Curvature</div>
                <div style={{ height: '24px' }}></div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>&lt; 50mm / 2m</div>
              </div>
              <div style={{ border: '1px dashed #CBD5E1', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Winding & Core Fit</div>
                <div style={{ height: '24px' }}></div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>[ ] Pass</div>
              </div>
            </div>
          </div>

          {/* Footer signoff */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
            <div>Extruder Machine Operator: ______________</div>
            <div>Shift Supervisor: ______________</div>
            <div>QA Lead Sign: ______________</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem', borderRadius: '6px',
              border: '1px solid #CBD5E1', background: '#FFF', color: '#475569',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: '0.65rem 1.5rem', borderRadius: '6px',
              border: 'none', background: '#F97316', color: '#000',
              cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            🖨️ Print / Save PDF Job Card
          </button>
        </div>
      </div>
    </div>
  )
}
