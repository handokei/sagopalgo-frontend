import { Link } from 'react-router-dom';
import { buildApiUrl } from '../lib/api';
import { krw } from '../lib/format';

export interface ProductCardData {
  id: number;
  title: string;
  price: number;
  categoryName?: string;
  sellerNickname?: string;
  mainImage?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  rank?: number;
}

const ProductCard = ({ product, rank }: ProductCardProps) => {
  const imageUrl = product.mainImage
    ? (product.mainImage.startsWith('http') ? product.mainImage : buildApiUrl(product.mainImage))
    : undefined;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[1/1.18] bg-paper-warm border border-line overflow-hidden mb-2">
        {rank != null && (
          <span className="absolute top-2 left-2 z-10 w-7 h-7 flex items-center justify-center bg-ink text-paper text-[11px] font-mono font-bold rounded-sm">
            {String(rank).padStart(2, '0')}
          </span>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="img-ph w-full h-full flex items-center justify-center">
            <span className="text-[11px] font-mono text-ink-faint">상품 이미지</span>
          </div>
        )}
      </div>
      {product.sellerNickname && (
        <p className="text-[11px] font-mono tracking-[0.08em] uppercase text-ink-soft mb-0.5">
          {product.sellerNickname}
        </p>
      )}
      <p className="text-[13px] text-ink leading-snug line-clamp-2 mb-1">{product.title}</p>
      <p className="text-[14px] font-bold text-ink">{krw(product.price)}</p>
    </Link>
  );
};

export default ProductCard;
