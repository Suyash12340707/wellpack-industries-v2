import { products } from '../../data/products'
import ProductCard from './ProductCard'
import FadeUpWrapper from '../ui/FadeUpWrapper'

export default function ProductGrid({ limit, expanded = false }) {
  const list = limit ? products.slice(0, limit) : products

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1.5rem',
    }}>
      {list.map((product, i) => (
        <FadeUpWrapper key={product.id} delay={i % 3}>
          <ProductCard product={product} expanded={expanded} />
        </FadeUpWrapper>
      ))}
    </div>
  )
}
