import ProductCard, { type ProductCardData } from './ProductCard';

interface ProductGridProps {
  products: ProductCardData[];
  cols?: 3 | 4 | 5;
  withRank?: boolean;
}

const colsClass = {
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
} as const;

const ProductGrid = ({ products, cols = 4, withRank = false }: ProductGridProps) => {
  return (
    <div className={`grid ${colsClass[cols]} gap-5`}>
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          rank={withRank ? i + 1 : undefined}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
