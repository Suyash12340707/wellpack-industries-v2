/**
 * The decorative "— Label" tag shown above section headings.
 * Props:
 *   children — tag text
 *   center   — centers the tag (boolean)
 */
export default function SectionTag({ children, center = false }) {
  return (
    <div
      className="section-tag"
      style={center ? { justifyContent: 'center' } : {}}
    >
      {children}
    </div>
  )
}
